from fastapi import APIRouter, Depends, HTTPException, status, Response
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import create_access_token
from app.features.super_admin.super_admin_auth import service
from app.features.super_admin.super_admin_auth.models import AdminUser
from app.features.super_admin.super_admin_auth.schemas import (
    SuperAdminCreate,
    SuperAdminResponse,
    Token,
)

router = APIRouter(prefix="/super-admin", tags=["super_admin_auth"])


@router.post("/login", response_model=Token)
async def login_super_admin(
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    Super Admin Login Endpoint.
    - Sets HTTP-Only Cookie ('access_token') for secure web authentication.
    - Also returns access_token JSON for API clients / mobile apps.
    """
    admin = service.authenticate_admin(db, email=form_data.username, password=form_data.password)
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(data={"sub": admin.email})

    # Set HTTP-Only Cookie
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=False,  # Set to True in HTTPS production environments
        samesite="lax",
        max_age=86400  # 24 Hours
    )

    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/logout")
async def logout_super_admin(response: Response):
    """Logout Super Admin: Clears the HTTP-Only 'access_token' cookie."""
    response.delete_cookie(
        key="access_token",
        httponly=True,
        samesite="lax"
    )
    return {"message": "Successfully logged out. Cookie cleared."}


@router.post("/register", response_model=SuperAdminResponse, status_code=status.HTTP_201_CREATED)
async def register_super_admin(
    admin_in: SuperAdminCreate,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(service.get_current_super_admin)
):
    """Register Super Admin (Disabled if 1 Super Admin already exists in system)."""
    return service.create_super_admin(db, admin_in)


@router.get("/me", response_model=SuperAdminResponse)
async def get_super_admin_profile(
    current_admin: AdminUser = Depends(service.get_current_super_admin)
):
    """Get current logged-in Super Admin profile."""
    return current_admin


@router.get("/")
async def read_super_admin(
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(service.get_current_super_admin)
):
    """Super Admin Overview endpoint (Protected)."""
    return service.get_super_admin_overview(db)


@router.get("/db-status")
async def db_status(db: Session = Depends(get_db)):
    """Check status of PostgreSQL connection."""
    return service.get_database_status(db)
