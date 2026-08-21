from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.features.companies.attendance_management import service
from app.features.companies.attendance_management.schemas import (
    AttendancePunchCreate,
    AttendanceRecordResponse,
    AttendanceStatsResponse,
    AttendanceUpdate,
)
from app.features.super_admin.super_admin_auth.schemas import UserAuthResponse
from app.features.super_admin.super_admin_auth.service import get_current_user, get_current_user_optional
from app.features.companies.employee_management.models import Employee

router = APIRouter(
    prefix="/attendance",
    tags=["Attendance Management (Company Admin & Super Admin)"],
)


@router.get("/", response_model=List[AttendanceRecordResponse], summary="List Attendance Logs")
def read_attendance_logs(
    employee_id: Optional[int] = Query(None, description="Optional filter by employee ID"),
    date: Optional[str] = Query(None, description="Filter logs by date (YYYY-MM-DD)"),
    month: Optional[str] = Query(None, description="Filter logs by month (YYYY-MM)"),
    status: Optional[str] = Query(None, description="Filter logs by status (Present, Late, Absent, Half Day, Holiday, On Leave, Day Off)"),
    company_id: Optional[int] = Query(None, description="Optional company ID filter for Super Admin"),
    skip: int = 0,
    limit: int = 500,
    db: Session = Depends(get_db),
    current_user: Optional[UserAuthResponse] = Depends(get_current_user_optional),
):
    """
    Fetch attendance log records:
    - Company Admin: strictly scoped to own company_id.
    - Employee / Customer Portal: scoped to employee_id or company.
    - Super Admin: sees all attendance logs or filters by query parameter.
    """
    if current_user:
        scoped_company_id = current_user.company_id if current_user.role in ("COMPANY_ADMIN", "EMPLOYEE") else company_id
        scoped_employee_id = current_user.id if current_user.role == "EMPLOYEE" and not employee_id else employee_id
    else:
        scoped_company_id = company_id
        scoped_employee_id = employee_id

    return service.get_attendance_records(
        db,
        company_id=scoped_company_id,
        employee_id=scoped_employee_id,
        date=date,
        month=month,
        status_filter=status,
        skip=skip,
        limit=limit,
    )


@router.post(
    "/punch",
    response_model=AttendanceRecordResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Record Attendance Punch",
)
def punch_attendance(
    punch_in: AttendancePunchCreate,
    db: Session = Depends(get_db),
    current_user: Optional[UserAuthResponse] = Depends(get_current_user_optional),
):
    """
    Record attendance punch (Employee self-punch, Company Admin manual override, or Kiosk):
    - Automatically links to user's company_id and employee profile.
    """
    if current_user:
        if current_user.role in ("COMPANY_ADMIN", "EMPLOYEE"):
            target_company_id = current_user.company_id or punch_in.company_id
        else:
            target_company_id = punch_in.company_id

        if current_user.role == "EMPLOYEE":
            if not punch_in.employee_id:
                punch_in.employee_id = current_user.id
            if not punch_in.employee_name or punch_in.employee_name == "Staff Member":
                punch_in.employee_name = current_user.full_name or "Employee"
    else:
        target_company_id = punch_in.company_id
        if not target_company_id and punch_in.employee_id:
            emp = db.query(Employee).filter(Employee.id == punch_in.employee_id).first()
            if emp:
                target_company_id = emp.company_id

    if not target_company_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unable to determine organization for this attendance punch.",
        )

    return service.record_punch(db, punch_in, company_id=target_company_id)


@router.post("/auto-close-shifts", summary="Trigger Auto Clock-Out for Expired Shifts")
def trigger_auto_close_shifts(
    company_id: Optional[int] = Query(None, description="Optional company ID to scope auto-close"),
    db: Session = Depends(get_db),
    current_user: Optional[UserAuthResponse] = Depends(get_current_user_optional),
):
    """
    Scans all open sessions and automatically clocks out employees whose scheduled shift has completed.
    """
    scoped_company_id = current_user.company_id if current_user and current_user.role == "COMPANY_ADMIN" else company_id
    closed_records = service.auto_close_expired_shifts(db, company_id=scoped_company_id)
    closed_count = len(closed_records) if isinstance(closed_records, list) else int(closed_records)
    return {
        "status": "success",
        "closed_count": closed_count,
        "message": f"Successfully auto-closed {closed_count} completed shift attendance sessions.",
    }


@router.get("/stats", response_model=AttendanceStatsResponse, summary="Get Attendance Statistics")
def get_attendance_stats(
    company_id: Optional[int] = Query(None, description="Optional company filter for Super Admin"),
    date: Optional[str] = Query(None, description="Target date (YYYY-MM-DD)"),
    db: Session = Depends(get_db),
    current_user: UserAuthResponse = Depends(get_current_user),
):
    """Retrieve daily attendance metrics (Present, Late, Absent, Half Day counts and rate)."""
    scoped_company_id = current_user.company_id if current_user.role == "COMPANY_ADMIN" else company_id
    return service.get_attendance_stats(db, company_id=scoped_company_id, date=date)


@router.patch("/{record_id}", response_model=AttendanceRecordResponse, summary="Update Attendance Record")
def update_attendance_record(
    record_id: int,
    updates: AttendanceUpdate,
    db: Session = Depends(get_db),
    current_user: UserAuthResponse = Depends(get_current_user),
):
    """Update check-out time or status of attendance entry."""
    scoped_company_id = current_user.company_id if current_user.role == "COMPANY_ADMIN" else None
    return service.update_attendance(db, record_id, updates, company_id=scoped_company_id)


@router.delete("/{record_id}", summary="Delete Attendance Record")
def delete_attendance_record(
    record_id: int,
    db: Session = Depends(get_db),
    current_user: UserAuthResponse = Depends(get_current_user),
):
    """Delete an attendance entry."""
    scoped_company_id = current_user.company_id if current_user.role == "COMPANY_ADMIN" else None
    return service.delete_attendance(db, record_id, company_id=scoped_company_id)
