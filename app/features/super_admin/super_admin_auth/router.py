from typing import Optional
from fastapi import APIRouter, Depends, Request, Response, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.rate_limiter import rate_limiter
from app.core.security import clear_auth_cookies
from app.features.super_admin.super_admin_auth import service
from app.features.super_admin.super_admin_auth.models import AdminUser
from app.features.super_admin.super_admin_auth.schemas import (
    DatabaseStatusResponse,
    MessageResponse,
    RefreshResponse,
    RefreshTokenRequest,
    SuperAdminCreate,
    SuperAdminOverviewResponse,
    SuperAdminResponse,
    Token,
)

router = APIRouter(prefix="/super-admin", tags=["Super Admin"])


# ---------------------------------------------------------------------------
# Public Authentication Endpoints
# ---------------------------------------------------------------------------

@router.post(
    "/login",
    response_model=Token,
    summary="Super Admin Login",
    description=(
        "Authenticates Super Admin using JSON payload or Form data. "
        "Protected by Rate Limiter. "
        "Issues a 15-minute access token and a 7-day refresh token securely inside HTTP-Only cookies."
    ),
)
@rate_limiter.limit(settings.rate_limit_login)
async def login_super_admin(
    response: Response,
    request: Request,
    db: Session = Depends(get_db),
) -> Token:
    """Super Admin Login with Rate Limiting & Cookie / JSON support."""
    return await service.login_super_admin_service(request, response, db)


@router.post(
    "/refresh",
    response_model=RefreshResponse,
    summary="Refresh Access Token",
    description=(
        "Rotates and generates a fresh 15-minute access token using either the "
        "HTTP-Only `refresh_token` cookie or the request body `refresh_token`. "
        "Protected by Rate Limiter."
    ),
)
@rate_limiter.limit(settings.rate_limit_refresh)
async def refresh_super_admin_token(
    request: Request,
    response: Response,
    body: Optional[RefreshTokenRequest] = None,
    db: Session = Depends(get_db),
) -> RefreshResponse:
    """Refresh Access Token Endpoint."""
    refresh_token = body.refresh_token if body else None
    return service.refresh_super_admin_session(request, response, db, body_refresh_token=refresh_token)


@router.post(
    "/logout",
    response_model=MessageResponse,
    summary="Super Admin Logout",
    description="Clears all HTTP-Only session cookies (`access_token` and `refresh_token`) immediately.",
)
async def logout_super_admin(response: Response) -> MessageResponse:
    """Logout Super Admin session."""
    clear_auth_cookies(response)
    return MessageResponse(
        status="success",
        message="Successfully logged out. All session cookies cleared.",
    )


# ---------------------------------------------------------------------------
# Protected Super Admin Endpoints
# ---------------------------------------------------------------------------

@router.post(
    "/register",
    response_model=SuperAdminResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register Super Admin",
    description="Registers an initial Super Admin. Disabled if at least 1 Super Admin already exists in the system.",
)
async def register_super_admin(
    admin_in: SuperAdminCreate,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(service.get_current_super_admin),
) -> SuperAdminResponse:
    """Register a new Super Admin account."""
    admin = service.create_super_admin(db, admin_in)
    return SuperAdminResponse.model_validate(admin)


@router.get(
    "/me",
    response_model=SuperAdminResponse,
    summary="Current Super Admin Profile",
    description="Fetches profile information of the currently authenticated Super Admin.",
)
async def get_super_admin_profile(
    current_admin: AdminUser = Depends(service.get_current_super_admin),
) -> SuperAdminResponse:
    """Get active Super Admin profile."""
    return SuperAdminResponse.model_validate(current_admin)


@router.get(
    "/",
    response_model=SuperAdminOverviewResponse,
    summary="Super Admin Dashboard Overview",
    description=(
        "Provides platform statistics and database connectivity overview for Super Admin dashboard. "
        "Cached in Redis for high-speed sub-millisecond response."
    ),
)
async def read_super_admin(
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(service.get_current_super_admin),
) -> SuperAdminOverviewResponse:
    """Get platform overview statistics (Redis-cached)."""
    return service.get_super_admin_overview(db)


@router.get(
    "/db-status",
    response_model=DatabaseStatusResponse,
    summary="Database Connection Status",
    description="Performs a live database query to check connectivity, version, and host details.",
)
async def db_status(
    db: Session = Depends(get_db),
) -> DatabaseStatusResponse:
    """Check live status of the database connection."""
    return service.get_database_status(db)
