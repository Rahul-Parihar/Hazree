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
from app.features.super_admin.super_admin_auth.service import get_current_user

router = APIRouter(
    prefix="/attendance",
    tags=["Attendance Management (Company Admin & Super Admin)"],
)


@router.get("/", response_model=List[AttendanceRecordResponse], summary="List Attendance Logs")
async def read_attendance_logs(
    date: Optional[str] = Query(None, description="Filter logs by date (YYYY-MM-DD)"),
    status: Optional[str] = Query(None, description="Filter logs by status (Present, Late, Absent, Half Day)"),
    company_id: Optional[int] = Query(None, description="Optional company ID filter for Super Admin"),
    skip: int = 0,
    limit: int = 200,
    db: Session = Depends(get_db),
    current_user: UserAuthResponse = Depends(get_current_user),
):
    """
    Fetch attendance log records:
    - Company Admin: strictly scoped to own company_id.
    - Super Admin: sees all attendance logs or filters by query parameter.
    """
    scoped_company_id = current_user.company_id if current_user.role == "COMPANY_ADMIN" else company_id
    return service.get_attendance_records(
        db,
        company_id=scoped_company_id,
        date=date,
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
async def punch_attendance(
    punch_in: AttendancePunchCreate,
    db: Session = Depends(get_db),
    current_user: UserAuthResponse = Depends(get_current_user),
):
    """
    Record attendance punch (manual or kiosk):
    - Company Admin: automatically links to own company_id.
    - Super Admin: uses company_id passed in payload.
    """
    if current_user.role == "COMPANY_ADMIN":
        target_company_id = current_user.company_id
    else:
        target_company_id = punch_in.company_id

    if not target_company_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unable to determine organization for this attendance punch.",
        )

    return service.record_punch(db, punch_in, company_id=target_company_id)


@router.get("/stats", response_model=AttendanceStatsResponse, summary="Get Attendance Statistics")
async def get_attendance_stats(
    company_id: Optional[int] = Query(None, description="Optional company filter for Super Admin"),
    date: Optional[str] = Query(None, description="Target date (YYYY-MM-DD)"),
    db: Session = Depends(get_db),
    current_user: UserAuthResponse = Depends(get_current_user),
):
    """Retrieve daily attendance metrics (Present, Late, Absent, Half Day counts and rate)."""
    scoped_company_id = current_user.company_id if current_user.role == "COMPANY_ADMIN" else company_id
    return service.get_attendance_stats(db, company_id=scoped_company_id, date=date)


@router.patch("/{record_id}", response_model=AttendanceRecordResponse, summary="Update Attendance Record")
async def update_attendance_record(
    record_id: int,
    updates: AttendanceUpdate,
    db: Session = Depends(get_db),
    current_user: UserAuthResponse = Depends(get_current_user),
):
    """Update check-out time or status of attendance entry."""
    scoped_company_id = current_user.company_id if current_user.role == "COMPANY_ADMIN" else None
    return service.update_attendance(db, record_id, updates, company_id=scoped_company_id)


@router.delete("/{record_id}", summary="Delete Attendance Record")
async def delete_attendance_record(
    record_id: int,
    db: Session = Depends(get_db),
    current_user: UserAuthResponse = Depends(get_current_user),
):
    """Delete an attendance entry."""
    scoped_company_id = current_user.company_id if current_user.role == "COMPANY_ADMIN" else None
    return service.delete_attendance(db, record_id, company_id=scoped_company_id)
