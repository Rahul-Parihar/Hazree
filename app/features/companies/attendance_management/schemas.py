from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class AttendancePunchCreate(BaseModel):
    employee_id: Optional[int] = Field(None, description="Employee database ID if known")
    employee_name: str = Field(..., min_length=2, max_length=255, example="Aarav Sharma")
    employee_avatar: Optional[str] = Field(None, example="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100")
    department: str = Field("Engineering", max_length=100, example="Engineering")
    company_id: Optional[int] = Field(None, description="Company ID (required for Super Admin, auto-derived for Company Admin)")
    date: Optional[str] = Field(None, description="Date in YYYY-MM-DD format (defaults to today)")
    check_in_time: Optional[str] = Field(None, example="09:15 AM")
    check_out_time: Optional[str] = Field("--", example="--")
    status: Optional[str] = Field("Present", example="Present")  # Present, Late, Absent, Half Day
    work_hours: Optional[str] = Field("Active", example="Active")
    location: Optional[str] = Field("Office Premises (Verified)", example="Mumbai BKC Office")
    device: Optional[str] = Field("Web Portal Punch", example="Admin Portal Web Console")


class AttendanceUpdate(BaseModel):
    check_in_time: Optional[str] = None
    check_out_time: Optional[str] = None
    status: Optional[str] = None
    work_hours: Optional[str] = None
    location: Optional[str] = None
    device: Optional[str] = None


class AttendanceRecordResponse(BaseModel):
    id: int
    company_id: int
    company_name: Optional[str] = None
    employee_id: Optional[int] = None
    employee_name: str
    employee_avatar: Optional[str] = None
    department: str
    date: str
    check_in_time: str
    check_out_time: Optional[str] = "--"
    status: str
    work_hours: Optional[str] = "Active"
    location: Optional[str] = "Office Premises"
    device: Optional[str] = "Web Portal Punch"
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class AttendanceStatsResponse(BaseModel):
    total_staff: int
    present_today: int
    late_today: int
    absent_today: int
    half_day_today: int
    attendance_rate: float
