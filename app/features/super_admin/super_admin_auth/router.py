from fastapi import APIRouter, Depends, HTTPException, status, Response, Request, Body
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db
from app.core.security import create_token_pair, set_auth_cookies, clear_auth_cookies
from app.features.super_admin.super_admin_auth import service
from app.features.super_admin.super_admin_auth.models import AdminUser
from app.features.super_admin.super_admin_auth.schemas import (
    SuperAdminLogin,
    SuperAdminCreate,
    SuperAdminResponse,
    Token,
    AuthTokenData,
    RefreshResponse,
    RefreshTokenRequest,
)



router = APIRouter(prefix="/super-admin", tags=["super_admin_auth"])


@router.post("/login", response_model=Token)
async def login_super_admin(
    response: Response,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Super Admin Login:
    - Supports both OAuth2 Form and JSON Request Body.
    - Generates 15-Minute Access Token + 7-Day Refresh Token with high entropy.
    - Stores both tokens strictly in HTTP-Only, SameSite, Secure browser cookies (No localStorage).
    """
    email = None
    password = None

    # Check Content-Type to parse either Form or JSON
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

    if not email or not password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email/Username and Password are required."
        )

    admin = service.authenticate_admin(db, email=email, password=password)

    # User claims for 15-minute token pair with cryptographic entropy
    user_claims = {
        "sub": admin.email,
        "user_id": admin.id,
        "full_name": admin.full_name,
        "role": "SUPER_ADMIN",
    }
    access_token, refresh_token = create_token_pair(user_claims)

    # Set HTTP-Only cookies for both access_token (15 min) and refresh_token (7 days)
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



@router.post("/refresh", response_model=RefreshResponse)
async def refresh_super_admin_token(
    request: Request,
    response: Response,
    body: Optional[RefreshTokenRequest] = None,
    db: Session = Depends(get_db)
):
    """
    Refresh Token Endpoint:
    - Accepts 'refresh_token' from JSON Request Body (e.g. {"refresh_token": "..."})
    - OR automatically reads HTTP-Only 'refresh_token' cookie.
    - Issues a fresh 15-minute access token.
    """
    refresh_token = body.refresh_token if body else None
    return service.refresh_super_admin_session(request, response, db, body_refresh_token=refresh_token)



@router.post("/logout")
async def logout_super_admin(response: Response):
    """
    Logout Super Admin:
    - Clears both HTTP-Only 'access_token' and 'refresh_token' cookies immediately.
    """
    clear_auth_cookies(response)
    return {"message": "Successfully logged out. All session cookies cleared."}


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
    """Get current logged-in Super Admin profile (Verified from 15-minute HTTP-Only cookie)."""
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
