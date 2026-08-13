from typing import Any, Dict, Optional, Tuple
from fastapi import Depends, HTTPException, Request, Response, status
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.redis_cache import delete_cache, get_cache, is_redis_online, set_cache
from app.core.security import (
    clear_auth_cookies,
    create_token_pair,
    decode_access_token,
    decode_refresh_token,
    get_password_hash,
    get_token_from_request,
    set_auth_cookies,
    verify_password,
)
from app.features.companies.company_management.models import Company
from app.features.super_admin.super_admin_auth.models import AdminUser
from app.features.super_admin.super_admin_auth.schemas import (
    AuthTokenData,
    DatabaseStats,
    DatabaseStatusResponse,
    RefreshResponse,
    RefreshTokenData,
    SuperAdminCreate,
    SuperAdminOverviewResponse,
    SuperAdminResponse,
    Token,
)


# ---------------------------------------------------------------------------
# Query Helpers
# ---------------------------------------------------------------------------

def get_admin_by_email(db: Session, email: str) -> Optional[AdminUser]:
    """Retrieve an admin record by email address (case-insensitive)."""
    return db.query(AdminUser).filter(AdminUser.email == email.strip().lower()).first()


def get_admin_by_id(db: Session, admin_id: int) -> Optional[AdminUser]:
    """Retrieve an admin record by primary key ID."""
    return db.query(AdminUser).filter(AdminUser.id == admin_id).first()


# ---------------------------------------------------------------------------
# Authentication & Credentials
# ---------------------------------------------------------------------------

async def extract_login_credentials(request: Request) -> Tuple[Optional[str], Optional[str]]:
    """
    Extract username/email and password from either JSON body or Form data.
    """
    email = None
    password = None
    content_type = request.headers.get("content-type", "")

    if "application/json" in content_type:
        try:
            body = await request.json()
            email = body.get("email") or body.get("username")
            password = body.get("password")
        except Exception:
            pass
    elif "application/x-www-form-urlencoded" in content_type or "multipart/form-data" in content_type:
        try:
            form = await request.form()
            email = form.get("username") or form.get("email")
            password = form.get("password")
        except Exception:
            pass

    return email, password


def authenticate_admin(db: Session, email: str, password: str) -> AdminUser:
    """
    Verify Super Admin credentials and status:
    - Non-existent email -> 404 Not Found
    - Invalid password   -> 401 Unauthorized
    - Inactive account   -> 403 Forbidden
    """
    admin = get_admin_by_email(db, email)
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Email '{email}' not found. Please enter a registered Super Admin email.",
        )

    if not verify_password(password, admin.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect password. Please enter the correct password.",
        )

    if not admin.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your Super Admin account has been deactivated.",
        )

    return admin


async def login_super_admin_service(
    request: Request,
    response: Response,
    db: Session,
) -> Token:
    """
    Full login flow:
    - Extracts credentials (JSON / Form).
    - Verifies identity.
    - Issues 15-minute access token and 7-day refresh token.
    - Sets secure, HTTP-Only cookies.
    """
    email, password = await extract_login_credentials(request)

    if not email or not password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email/Username and Password are required.",
        )

    admin = authenticate_admin(db, email=email, password=password)

    user_claims = {
        "sub": admin.email,
        "user_id": admin.id,
        "full_name": admin.full_name,
        "role": "SUPER_ADMIN",
    }
    access_token, refresh_token = create_token_pair(user_claims)

    set_auth_cookies(response, access_token=access_token, refresh_token=refresh_token)

    return Token(
        data=AuthTokenData(
            user=SuperAdminResponse.model_validate(admin),
            access_token=access_token,
            refresh_token=refresh_token,
        ),
        message="Login successful",
        status="success",
    )


# ---------------------------------------------------------------------------
# Super Admin Registration & Initialization
# ---------------------------------------------------------------------------

def create_super_admin(db: Session, admin_in: SuperAdminCreate) -> AdminUser:
    """
    Create a new Super Admin account.
    Enforces a strict system limit of exactly 1 Super Admin.
    Invalidates overview cache.
    """
    existing_count = db.query(AdminUser).count()
    if existing_count >= 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Registration disabled. Only 1 Super Admin account is allowed in the system.",
        )

    existing = get_admin_by_email(db, admin_in.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Admin with email '{admin_in.email}' already exists.",
        )

    db_admin = AdminUser(
        email=admin_in.email.strip().lower(),
        full_name=admin_in.full_name,
        hashed_password=get_password_hash(admin_in.password),
        is_super_admin=True,
        is_active=True,
    )
    db.add(db_admin)
    db.commit()
    db.refresh(db_admin)

    # Invalidate cached stats in Redis
    delete_cache("super_admin:overview")

    return db_admin


def init_default_super_admin(db: Session) -> AdminUser:
    """
    Seed or verify the default Super Admin account during application startup.
    """
    default_email = (settings.admin_email or "admin@hazree.com").strip().lower()
    existing = get_admin_by_email(db, default_email)

    if existing:
        if existing.full_name != "Super Admin":
            existing.full_name = "Super Admin"
            db.commit()
            db.refresh(existing)
        return existing

    existing_count = db.query(AdminUser).count()
    if existing_count > 0:
        admin = db.query(AdminUser).first()
        if admin.full_name != "Super Admin":
            admin.full_name = "Super Admin"
            db.commit()
            db.refresh(admin)
        return admin

    default_admin = AdminUser(
        email=default_email,
        full_name="Super Admin",
        hashed_password=get_password_hash("Admin@123456"),
        is_super_admin=True,
        is_active=True,
    )
    db.add(default_admin)
    db.commit()
    db.refresh(default_admin)
    return default_admin


# ---------------------------------------------------------------------------
# Session & Token Management
# ---------------------------------------------------------------------------

def get_current_super_admin(
    request: Request,
    db: Session = Depends(get_db),
) -> AdminUser:
    """
    FastAPI Dependency: Authenticate active Super Admin from HTTP-Only cookie or Bearer header.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Access token expired or invalid. Please refresh token or log in.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    token = get_token_from_request(request, cookie_name="access_token")
    if not token:
        raise credentials_exception

    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception

    email: Optional[str] = payload.get("sub")
    if not email:
        raise credentials_exception

    admin = get_admin_by_email(db, email=email)
    if admin is None or not admin.is_active or not admin.is_super_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive or insufficient permissions.",
        )

    return admin


def refresh_super_admin_session(
    request: Request,
    response: Response,
    db: Session,
    body_refresh_token: Optional[str] = None,
) -> RefreshResponse:
    """
    Validate refresh token (from body or cookie) and rotate token pair.
    """
    refresh_token = body_refresh_token or get_token_from_request(request, cookie_name="refresh_token")

    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token is required. Provide it in the request body or via HTTP cookie.",
        )

    payload = decode_refresh_token(refresh_token)
    if not payload:
        clear_auth_cookies(response)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token. Please log in again.",
        )

    email = payload.get("sub")
    if not email:
        clear_auth_cookies(response)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Malformed refresh token payload.",
        )

    admin = get_admin_by_email(db, email=email)
    if not admin or not admin.is_active or not admin.is_super_admin:
        clear_auth_cookies(response)
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin account is inactive or revoked.",
        )

    user_claims = {
        "sub": admin.email,
        "user_id": admin.id,
        "full_name": admin.full_name,
        "role": "SUPER_ADMIN",
    }
    new_access_token, new_refresh_token = create_token_pair(user_claims)
    set_auth_cookies(response, access_token=new_access_token, refresh_token=new_refresh_token)

    return RefreshResponse(
        data=RefreshTokenData(
            access_token=new_access_token,
            refresh_token=new_refresh_token,
        ),
        message="Token refreshed successfully",
        status="success",
    )


# ---------------------------------------------------------------------------
# Diagnostics & System Overview (with Redis Caching)
# ---------------------------------------------------------------------------

def get_super_admin_overview(db: Session) -> SuperAdminOverviewResponse:
    """
    Collect platform statistics and overview info for Super Admin.
    Uses Redis cache with a 60-second TTL for sub-millisecond response times.
    """
    cache_key = "super_admin:overview"
    cached = get_cache(cache_key)
    if cached:
        return SuperAdminOverviewResponse(**cached)

    db_connected = False
    company_count = 0
    admin_count = 0

    try:
        db.execute(text("SELECT 1"))
        db_connected = True
        company_count = db.query(Company).count()
        admin_count = db.query(AdminUser).count()
    except Exception:
        db_connected = False

    overview = SuperAdminOverviewResponse(
        message=f"Hello {settings.app_name} super admin",
        debug=settings.debug,
        admin_email=settings.admin_email,
        database=DatabaseStats(
            connected=db_connected,
            engine="PostgreSQL",
            database_name=settings.postgres_db,
            total_companies=company_count,
            total_admin_users=admin_count,
        ),
    )

    # Cache for 60 seconds
    set_cache(cache_key, overview, expire_seconds=60)

    return overview


def get_database_status(db: Session) -> DatabaseStatusResponse:
    """Execute raw query to check database connectivity and engine version."""
    try:
        result = db.execute(text("SELECT version();")).fetchone()
        return DatabaseStatusResponse(
            status="online",
            database_version=result[0] if result else "Unknown",
            database_name=settings.postgres_db,
            host=settings.postgres_server,
            port=settings.postgres_port,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database connection failed: {str(e)}",
        )
