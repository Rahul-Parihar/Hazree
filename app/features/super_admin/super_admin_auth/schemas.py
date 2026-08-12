from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class SuperAdminLogin(BaseModel):
    email: EmailStr
    password: str


class SuperAdminCreate(BaseModel):
    email: EmailStr
    full_name: str
    password: str


class SuperAdminResponse(BaseModel):
    id: int
    email: str
    full_name: Optional[str] = None
    is_super_admin: bool
    is_active: bool
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class AuthTokenData(BaseModel):
    user: Optional[SuperAdminResponse] = None
    access_token: str
    refresh_token: str


class Token(BaseModel):
    data: AuthTokenData
    message: str = "Login successful"
    status: str = "success"


class RefreshTokenRequest(BaseModel):
    refresh_token: Optional[str] = None


class RefreshTokenData(BaseModel):
    access_token: str
    refresh_token: Optional[str] = None


class RefreshResponse(BaseModel):
    data: RefreshTokenData
    message: str = "Token refreshed successfully"
    status: str = "success"


class TokenData(BaseModel):
    email: Optional[str] = None
    user_id: Optional[int] = None
    role: Optional[str] = None
    token_type: Optional[str] = None
