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
    SuperAdminOverviewResponse,
    SuperAdminResponse,
    UserAuthResponse,
    Token,
)
# Query Helpers
# ---------------------------------------------------------------------------

def get_admin_by_email(db: Session, email: str) -> Optional[AdminUser]:
    """Retrieve an admin record by email address (case-insensitive)."""
    return db.query(AdminUser).filter(AdminUser.email == email.strip().lower()).first()


def get_admin_by_id(db: Session, admin_id: int) -> Optional[AdminUser]:
    """Retrieve an admin record by primary key ID."""
    return db.query(AdminUser).filter(AdminUser.id == admin_id).first()


async def extract_login_credentials(request: Request) -> Tuple[Optional[str], Optional[str]]:
    """Extract username/email and password from either JSON body or Form data."""
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


async def login_super_admin_service(
    request: Request,
    response: Response,
    db: Session,
) -> Token:
    """
    Unified Login flow for Super Admin and Company Admin:
    - Checks Super Admin account (AdminUser table)
    - Checks Company Admin account (Company table with active status verification)
    - Issues role-based JWT tokens and sets secure HTTP-Only cookies.
    """
    raw_email, password = await extract_login_credentials(request)

    if not raw_email or not password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email and Password are required.",
        )

    email = raw_email.strip().lower()

    # 1. Check if user is Super Admin
    admin = get_admin_by_email(db, email)
    if admin:
        if not verify_password(password, admin.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect password. Please enter the correct Super Admin password.",
            )
        if not admin.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your Super Admin account has been deactivated.",
            )

        user_claims = {
            "sub": admin.email,
            "user_id": admin.id,
            "full_name": admin.full_name,
            "role": "SUPER_ADMIN",
        }
        access_token, refresh_token = create_token_pair(user_claims)
        set_auth_cookies(response, access_token=access_token, refresh_token=refresh_token)

        user_response = UserAuthResponse(
            id=admin.id,
            email=admin.email,
            full_name=admin.full_name,
            role="SUPER_ADMIN",
            company_name="Platform HQ",
            is_super_admin=True,
            is_active=admin.is_active,
            created_at=admin.created_at,
        )

        return Token(
            data=AuthTokenData(
                user=user_response,
                access_token=access_token,
                refresh_token=refresh_token,
            ),
            message="Super Admin login successful",
            status="success",
        )

    # 2. Check if user is Company Admin (Registered Organization)
    company = db.query(Company).filter(Company.email == email).first()
    if company:
        if not company.hashed_password:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Company account does not have a password configured. Please contact Super Admin.",
            )
        if not verify_password(password, company.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect password. Please enter the correct password for your company account.",
            )

        # Status & Active checks
        if company.status == "Suspended" or not company.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your company account is Suspended. Please contact Hazree Super Admin.",
            )
        if company.status == "Pending":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your company registration is Pending activation. Please contact Hazree Super Admin.",
            )

        full_name = company.admin_name or f"{company.name} Admin"
        user_claims = {
            "sub": company.email,
            "user_id": company.id,
            "company_id": company.id,
            "company_name": company.name,
            "full_name": full_name,
            "role": "COMPANY_ADMIN",
        }
        access_token, refresh_token = create_token_pair(user_claims)
        set_auth_cookies(response, access_token=access_token, refresh_token=refresh_token)

        user_response = UserAuthResponse(
            id=company.id,
            email=company.email,
            full_name=full_name,
            role="COMPANY_ADMIN",
            company_id=company.id,
            company_name=company.name,
            status=company.status,
            is_super_admin=False,
            is_active=company.is_active,
            created_at=company.created_at,
        )

        return Token(
            data=AuthTokenData(
                user=user_response,
                access_token=access_token,
                refresh_token=refresh_token,
            ),
            message=f"Welcome {company.name}! Login successful",
            status="success",
        )

    # 3. Neither Super Admin nor Company found
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Email '{email}' not found. Please enter a valid registered email address.",
    )


# ---------------------------------------------------------------------------
# Single Super Admin Initialization (No Public Registration)
# ---------------------------------------------------------------------------

def init_default_super_admin(db: Session) -> AdminUser:
    """
    Seed or verify the default Super Admin account during application startup.
    Ensures exactly 1 Super Admin account exists in the platform.
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

def get_current_user(
    request: Request,
    db: Session = Depends(get_db),
) -> UserAuthResponse:
    """
    FastAPI Dependency: Authenticate active user (Super Admin or Company Admin)
    from HTTP-Only cookie or Authorization Bearer header.
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
    role: str = payload.get("role", "SUPER_ADMIN")
    if not email:
        raise credentials_exception

    if role == "SUPER_ADMIN":
        cache_key = f"auth:admin:{email}"
        cached_admin_data = get_cache(cache_key)
        if cached_admin_data:
            return UserAuthResponse(**cached_admin_data)

        admin = get_admin_by_email(db, email=email)
        if admin is None or not admin.is_active or not admin.is_super_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Inactive or insufficient Super Admin permissions.",
            )
        user_res = UserAuthResponse(
            id=admin.id,
            email=admin.email,
            full_name=admin.full_name,
            role="SUPER_ADMIN",
            company_name="Platform HQ",
            is_super_admin=True,
            is_active=admin.is_active,
            created_at=admin.created_at,
        )
        set_cache(cache_key, user_res.model_dump(mode="json"), expire_seconds=60)
        return user_res

    elif role == "COMPANY_ADMIN":
        cache_key = f"auth:company_admin:{email}"
        cached_co_data = get_cache(cache_key)
        if cached_co_data:
            return UserAuthResponse(**cached_co_data)

        company = db.query(Company).filter(Company.email == email).first()
        if company is None:
            raise credentials_exception

        company_status = (company.status or "Active").strip().lower()
        if company_status == "suspended" or company.is_active is False:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your company account is Suspended.",
            )

        user_res = UserAuthResponse(
            id=company.id,
            email=company.email,
            full_name=company.admin_name or f"{company.name} Admin",
            role="COMPANY_ADMIN",
            company_id=company.id,
            company_name=company.name,
            status=company.status,
            is_super_admin=False,
            is_active=company.is_active,
            created_at=company.created_at,
        )
        set_cache(cache_key, user_res.model_dump(mode="json"), expire_seconds=60)
        return user_res

    raise credentials_exception


def get_current_super_admin(
    request: Request,
    db: Session = Depends(get_db),
) -> AdminUser:
    """
    FastAPI Dependency: Authenticate strictly Super Admin accounts.
    Uses verified JWT claims and high-speed cache to avoid redundant remote database latency.
    """
    user = get_current_user(request, db)
    if user.role != "SUPER_ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access restricted to Super Admin only.",
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Super Admin account inactive or suspended.",
        )
    return AdminUser(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        is_super_admin=True,
        is_active=True,
    )


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
    Uses Redis/memory cache with a 120-second TTL for sub-millisecond response times.
    """
    cache_key = "super_admin:overview"
    cached = get_cache(cache_key)
    if cached:
        return SuperAdminOverviewResponse(**cached)

    db_connected = False
    company_count = 0
    admin_count = 0

    try:
        row = db.execute(text("SELECT (SELECT count(*) FROM companies), (SELECT count(*) FROM admin_users)")).fetchone()
        if row:
            company_count = row[0] or 0
            admin_count = row[1] or 0
        db_connected = True
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

    # Cache for 120 seconds
    set_cache(cache_key, overview, expire_seconds=120)

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
