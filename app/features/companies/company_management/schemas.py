from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class CompanyBase(BaseModel):
    name: str
    admin_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    plan: Optional[str] = "Growth"
    status: Optional[str] = "Active"
    location: Optional[str] = None
    max_employees: Optional[int] = 100
    employee_count: Optional[int] = 0
    renewal_date: Optional[datetime] = None
    logo: Optional[str] = None
    is_active: bool = True


class CompanyCreate(CompanyBase):
    password: Optional[str] = Field(
        None,
        min_length=6,
        description="Initial password for the company administrator account"
    )


class CompanyUpdate(BaseModel):
    name: Optional[str] = None
    admin_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    password: Optional[str] = None
    plan: Optional[str] = None
    status: Optional[str] = None
    location: Optional[str] = None
    max_employees: Optional[int] = None
    employee_count: Optional[int] = None
    renewal_date: Optional[datetime] = None
    logo: Optional[str] = None
    is_active: Optional[bool] = None


class CompanyResponse(CompanyBase):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True



