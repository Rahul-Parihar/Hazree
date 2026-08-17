from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, ConfigDict


class EmployeeBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=255, example="Aarav Sharma")
    email: EmailStr = Field(..., example="aarav@tatatech.com")
    phone: Optional[str] = Field(None, max_length=50, example="+91 98765 43210")
    role: str = Field(..., min_length=2, max_length=100, example="Senior Software Engineer")
    department: str = Field(..., min_length=2, max_length=100, example="Engineering")
    avatar: Optional[str] = Field(None, example="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80")
    status: Optional[str] = Field("Active", example="Active")
    join_date: Optional[str] = Field(None, example="14/08/2026")
    dob: Optional[str] = Field(None, example="15/08/1996", description="Employee date of birth")


class EmployeeCreate(EmployeeBase):
    company_id: Optional[int] = Field(None, description="Company ID (required for Super Admin, auto-derived for Company Admin)")
    password: Optional[str] = Field(
        None,
        min_length=4,
        max_length=100,
        description="Initial login password for employee portal (defaults to Hazree@123 if not provided)",
        example="Hazree@123",
    )


class EmployeeUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    role: Optional[str] = None
    department: Optional[str] = None
    avatar: Optional[str] = None
    password: Optional[str] = Field(None, min_length=4, max_length=100, description="New password for employee")
    status: Optional[str] = None
    join_date: Optional[str] = None
    dob: Optional[str] = None


class EmployeeResponse(EmployeeBase):
    id: int
    company_id: int
    company_name: Optional[str] = None
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
