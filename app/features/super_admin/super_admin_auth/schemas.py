from datetime import datetime
from typing import Any, Dict, Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field


# ---------------------------------------------------------------------------
# Request Schemas
# ---------------------------------------------------------------------------

class SuperAdminLogin(BaseModel):
    """Payload schema for Super Admin credentials."""
    email: EmailStr = Field(..., description="Registered Super Admin email address", examples=["admin@hazree.com"])
    password: str = Field(..., min_length=6, description="Super Admin account password", examples=["Admin@123456"])


class RefreshTokenRequest(BaseModel):
    """Optional payload schema for explicit token refresh."""
    refresh_token: Optional[str] = Field(None, description="Optional refresh token string if not supplied in cookies")


# ---------------------------------------------------------------------------
# Response & Data Models
# ---------------------------------------------------------------------------

class SuperAdminResponse(BaseModel):
    """Public Super Admin profile representation."""
    id: int
    email: str
    full_name: Optional[str] = None
    role: str = "SUPER_ADMIN"
    is_super_admin: bool = True
    is_active: bool = True
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class UserAuthResponse(BaseModel):
    """Unified auth response representation for Super Admin & Company Admin."""
    id: int
    email: str
    full_name: Optional[str] = None
    role: str = "SUPER_ADMIN"
    company_id: Optional[int] = None
    company_name: Optional[str] = None
    status: Optional[str] = "Active"
    is_super_admin: bool = False
    is_active: bool = True
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class AuthTokenData(BaseModel):
    """Nested payload for login responses."""
    user: Optional[UserAuthResponse] = None
    access_token: str
    refresh_token: str


class Token(BaseModel):
    """Top-level standard login response wrapper."""
    data: AuthTokenData
    message: str = "Login successful"
    status: str = "success"


class RefreshTokenData(BaseModel):
    """Nested payload for token refresh responses."""
    access_token: str
    refresh_token: Optional[str] = None


class RefreshResponse(BaseModel):
    """Top-level response for token refresh endpoint."""
    data: RefreshTokenData
    message: str = "Token refreshed successfully"
    status: str = "success"


class MessageResponse(BaseModel):
    """Generic message response."""
    status: str = "success"
    message: str


class TokenData(BaseModel):
    """Internal decoded JWT payload representation."""
    email: Optional[str] = None
    user_id: Optional[int] = None
    role: Optional[str] = None
    token_type: Optional[str] = None


class DatabaseStats(BaseModel):
    """Database statistics overview."""
    connected: bool
    engine: str = "PostgreSQL"
    database_name: Optional[str] = None
    total_companies: int = 0
    total_admin_users: int = 0


class SuperAdminOverviewResponse(BaseModel):
    """System overview summary for Super Admin."""
    message: str
    debug: bool
    admin_email: Optional[str] = None
    database: DatabaseStats


class DatabaseStatusResponse(BaseModel):
    """Health check response for database connection."""
    status: str
    database_version: str
    database_name: Optional[str] = None
    host: Optional[str] = None
    port: Optional[int] = None
