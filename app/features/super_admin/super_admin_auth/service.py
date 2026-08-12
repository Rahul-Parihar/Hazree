from sqlalchemy.orm import Session
from sqlalchemy import text
from fastapi import Request, Response, HTTPException, status, Depends
from typing import Optional

from app.core.config import settings
from app.core.database import get_db
from app.core.security import (
    verify_password,
    get_password_hash,
    create_token_pair,
    create_access_token,
    decode_access_token,
    decode_refresh_token,
    set_auth_cookies,
    clear_auth_cookies,
    get_token_from_request,
)
from app.features.companies.company_management.models import Company
from app.features.super_admin.super_admin_auth.models import AdminUser
from app.features.super_admin.super_admin_auth.schemas import SuperAdminCreate, RefreshResponse, RefreshTokenData





def get_admin_by_email(db: Session, email: str) -> Optional[AdminUser]:
    """Find admin user by email."""
    return db.query(AdminUser).filter(AdminUser.email == email).first()


def get_admin_by_id(db: Session, admin_id: int) -> Optional[AdminUser]:
    """Find admin user by ID."""
    return db.query(AdminUser).filter(AdminUser.id == admin_id).first()


def authenticate_admin(db: Session, email: str, password: str) -> AdminUser:
    """
    Verify email and password for Super Admin with distinct error messages:
    - Wrong email -> Specific "Email not registered" message
    - Wrong password -> Specific "Incorrect password" message
    - Inactive account -> Specific "Account deactivated" message
    """
    admin = get_admin_by_email(db, email.strip().lower())
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Email '{email}' not found. Please enter a registered Super Admin email."
        )
    
    if not verify_password(password, admin.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect password. Please enter the correct password."
        )

    if not admin.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your Super Admin account has been deactivated."
        )

    return admin


def create_super_admin(db: Session, admin_in: SuperAdminCreate) -> AdminUser:
    """Create a new Super Admin account (Strictly limited to 1 Super Admin)."""
    # Enforce single Super Admin constraint
    existing_count = db.query(AdminUser).count()
    if existing_count >= 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Registration disabled. Only 1 Super Admin account is allowed in the system."
        )

    existing = get_admin_by_email(db, admin_in.email.strip().lower())
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Admin with email '{admin_in.email}' already exists."
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
    return db_admin


def get_current_super_admin(
    request: Request,
    db: Session = Depends(get_db)
) -> AdminUser:
    """
    FastAPI Dependency: Validate 15-Minute Access Token from HTTP Cookie or Bearer header.
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

    email: str = payload.get("sub")
    if email is None:
        raise credentials_exception

    admin = get_admin_by_email(db, email=email)
    if admin is None or not admin.is_active or not admin.is_super_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive or insufficient permissions"
        )
    return admin


def refresh_super_admin_session(
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
    body_refresh_token: Optional[str] = None,
) -> RefreshResponse:
    """
    Refresh flow:
    - Checks refresh_token from JSON Request Body first.
    - If not in body, checks HTTP-Only cookie 'refresh_token'.
    - Validates signature, expiry, and issues fresh 15-min access token in cookie and response data.
    """
    refresh_token = body_refresh_token
    if not refresh_token:
        refresh_token = get_token_from_request(request, cookie_name="refresh_token")

    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token is required. Please provide it in the JSON request body or as an HTTP cookie."
        )

    payload = decode_refresh_token(refresh_token)
    if not payload:
        clear_auth_cookies(response)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token. Please log in again."
        )


    email = payload.get("sub")
    if not email:
        clear_auth_cookies(response)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Malformed refresh token"
        )

    admin = get_admin_by_email(db, email=email)
    if not admin or not admin.is_active or not admin.is_super_admin:
        clear_auth_cookies(response)
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin account is inactive or revoked."
        )

    # Generate fresh high-entropy token pair (15-min Access Token, 7-day Refresh Token)
    user_claims = {
        "sub": admin.email,
        "user_id": admin.id,
        "full_name": admin.full_name,
        "role": "SUPER_ADMIN",
    }
    new_access_token, new_refresh_token = create_token_pair(user_claims)

    # Set both in HTTP-Only cookies
    set_auth_cookies(response, access_token=new_access_token, refresh_token=new_refresh_token)

    return RefreshResponse(
        data=RefreshTokenData(
            access_token=new_access_token,
            refresh_token=new_refresh_token,
        ),
        message="Token refreshed successfully",
        status="success",
    )




def init_default_super_admin(db: Session) -> AdminUser:
    """Initialize or update default Super Admin account."""
    existing = db.query(AdminUser).filter(AdminUser.email == "admin@hazree.com").first()
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

    default_email = (settings.admin_email or "admin@hazree.com").strip().lower()
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



def get_super_admin_overview(db: Session) -> dict:
    """Overview statistics for Super Admin dashboard."""
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

    return {
        "message": f"Hello {settings.app_name} super admin",
        "debug": settings.debug,
        "admin_email": settings.admin_email,
        "database": {
            "connected": db_connected,
            "engine": "PostgreSQL",
            "database_name": settings.postgres_db,
            "total_companies": company_count,
            "total_admin_users": admin_count,
        }
    }


def get_database_status(db: Session) -> dict:
    """Check status and version of PostgreSQL connection."""
    try:
        result = db.execute(text("SELECT version();")).fetchone()
        return {
            "status": "online",
            "database_version": result[0] if result else "Unknown",
            "database_name": settings.postgres_db,
            "host": settings.postgres_server,
            "port": settings.postgres_port
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database connection failed: {str(e)}"
        )
