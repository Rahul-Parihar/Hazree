from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class LeaveRequestCreate(BaseModel):
    employee_id: Optional[int] = Field(None, description="Employee database ID")
    employee_name: str = Field(..., min_length=2, max_length=255, example="Sneha Patel")
    employee_avatar: Optional[str] = Field(None, example="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100")
    department: str = Field("Engineering", max_length=100, example="Design & UI")
    company_id: Optional[int] = Field(None, description="Company ID (required for Super Admin, auto-derived for Company Admin)")
    leave_type: Optional[str] = Field("Casual", example="Casual")  # Paid, Sick, Casual, Unpaid
    start_date: str = Field(..., example="2026-08-18")
    end_date: str = Field(..., example="2026-08-20")
    days_count: Optional[int] = Field(1, example=3)
    reason: str = Field(..., min_length=3, max_length=500, example="Family function and travel")
    applied_on: Optional[str] = Field(None, example="2026-08-15")


class LeaveStatusUpdate(BaseModel):
    status: str = Field(..., pattern="^(Approved|Rejected|Pending)$", example="Approved")
    admin_notes: Optional[str] = Field(None, example="Approved by HR Department")


class LeaveRequestResponse(BaseModel):
    id: int
    company_id: int
    company_name: Optional[str] = None
    employee_id: Optional[int] = None
    employee_name: str
    employee_avatar: Optional[str] = None
    department: str
    leave_type: str
    start_date: str
    end_date: str
    days_count: int
    reason: str
    status: str
    applied_on: str
    admin_notes: Optional[str] = None
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
