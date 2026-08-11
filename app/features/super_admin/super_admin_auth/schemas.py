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


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    email: Optional[str] = None
