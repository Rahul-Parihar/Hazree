from sqlalchemy.orm import Session
from sqlalchemy import text
from fastapi import HTTPException, status, Depends
from typing import Optional

from app.core.config import settings
from app.core.database import get_db
from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    decode_access_token,
    oauth2_scheme,
)
from app.features.companies.models import Company
from app.features.super_admin.super_admin_auth.models import AdminUser
from app.features.super_admin.super_admin_auth.schemas import SuperAdminCreate


def get_admin_by_email(db: Session, email: str) -> Optional[AdminUser]:
    """Find admin user by email."""
    return db.query(AdminUser).filter(AdminUser.email == email).first()


def authenticate_admin(db: Session, email: str, password: str) -> Optional[AdminUser]:
    """Verify email and password for Super Admin."""
    admin = get_admin_by_email(db, email)
    if not admin:
        return None
    if not verify_password(password, admin.hashed_password):
        return None
    return admin


def create_super_admin(db: Session, admin_in: SuperAdminCreate) -> AdminUser:
    """Create a new Super Admin account."""
    existing = get_admin_by_email(db, admin_in.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Admin with email '{admin_in.email}' already exists."
        )

    db_admin = AdminUser(
        email=admin_in.email,
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
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> AdminUser:
    """FastAPI Dependency: Validate JWT token and return logged-in Super Admin."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
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


def init_default_super_admin(db: Session) -> AdminUser:
    """Initialize a default Super Admin account if database is empty."""
    default_email = settings.admin_email or "admin@hazree.com"
    existing = get_admin_by_email(db, default_email)
    if not existing:
        default_admin = AdminUser(
            email=default_email,
            full_name="Default Super Admin",
            hashed_password=get_password_hash("Admin@123456"),
            is_super_admin=True,
            is_active=True,
        )
        db.add(default_admin)
        db.commit()
        db.refresh(default_admin)
        return default_admin
    return existing


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
