from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field


class DepartmentCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=150, description="Department name")
    description: Optional[str] = Field(None, max_length=500)
    company_id: Optional[int] = Field(None, description="Optional specific company ID, null for global")


class DepartmentUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=150)
    description: Optional[str] = Field(None, max_length=500)
    is_active: Optional[bool] = None


class DepartmentResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    company_id: Optional[int] = None
    company_name: Optional[str] = None
    created_by_role: Optional[str] = "SUPER_ADMIN"
    is_active: bool
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
