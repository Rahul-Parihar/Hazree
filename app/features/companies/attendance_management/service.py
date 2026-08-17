from typing import List, Optional
from datetime import datetime, timezone
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.features.companies.company_management.models import Company
from app.features.companies.employee_management.models import Employee
from app.features.companies.attendance_management.models import Attendance
from app.features.companies.attendance_management.schemas import (
    AttendancePunchCreate,
    AttendanceRecordResponse,
    AttendanceStatsResponse,
    AttendanceUpdate,
)


def _to_response(att: Attendance, company_name: Optional[str] = None) -> AttendanceRecordResponse:
    return AttendanceRecordResponse(
        id=att.id,
        company_id=att.company_id,
        company_name=company_name,
        employee_id=att.employee_id,
        employee_name=att.employee_name,
        employee_avatar=att.employee_avatar or f"https://ui-avatars.com/api/?name={att.employee_name.replace(' ', '+')}&background=059669&color=fff",
        department=att.department,
        date=att.date,
        check_in_time=att.check_in_time,
        check_out_time=att.check_out_time or "--",
        status=att.status,
        work_hours=att.work_hours or "Active",
        location=att.location or "Office Premises (Verified)",
        device=att.device or "Web Portal Punch",
        created_at=att.created_at,
    )


def record_punch(
    db: Session,
    punch_in: AttendancePunchCreate,
    company_id: int,
) -> AttendanceRecordResponse:
    """Record manual or biometric attendance punch (Clock In / Clock Out)."""
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Company with ID {company_id} not found.",
        )

    today_str = punch_in.date or datetime.now(timezone.utc).strftime("%Y-%m-%d")
    current_time_str = punch_in.check_in_time or datetime.now(timezone.utc).strftime("%I:%M %p")

    # Lookup employee details if employee_id is provided
    emp = None
    if punch_in.employee_id:
        emp = db.query(Employee).filter(Employee.id == punch_in.employee_id).first()
    elif punch_in.employee_name:
        emp = db.query(Employee).filter(
            Employee.company_id == company_id,
            Employee.name.ilike(punch_in.employee_name.strip())
        ).first()

    emp_name = (emp.name if emp else punch_in.employee_name).strip()
    emp_dept = (emp.department if emp else punch_in.department).strip()
    avatar_url = (emp.avatar if emp and emp.avatar else punch_in.employee_avatar) or f"https://ui-avatars.com/api/?name={emp_name.replace(' ', '+')}&background=059669&color=fff"
    emp_id = emp.id if emp else punch_in.employee_id

    # Check if there is an existing attendance record for this employee today
    existing_record = None
    if emp_id:
        existing_record = (
            db.query(Attendance)
            .filter(
                Attendance.company_id == company_id,
                Attendance.employee_id == emp_id,
                Attendance.date == today_str,
            )
            .first()
        )
    if not existing_record and emp_name:
        existing_record = (
            db.query(Attendance)
            .filter(
                Attendance.company_id == company_id,
                Attendance.employee_name.ilike(emp_name),
                Attendance.date == today_str,
            )
            .first()
        )

    if existing_record:
        if punch_in.check_out_time and punch_in.check_out_time != "--":
            existing_record.check_out_time = punch_in.check_out_time
        elif existing_record.check_in_time and (not existing_record.check_out_time or existing_record.check_out_time == "--"):
            # Clocking out existing check-in session
            existing_record.check_out_time = punch_in.check_in_time or current_time_str

        if punch_in.status:
            existing_record.status = punch_in.status
        if punch_in.location:
            existing_record.location = punch_in.location
        if punch_in.device:
            existing_record.device = punch_in.device
        if emp_id and not existing_record.employee_id:
            existing_record.employee_id = emp_id

        if existing_record.check_in_time and existing_record.check_out_time and existing_record.check_out_time != "--":
            existing_record.work_hours = "Completed"

        db.commit()
        db.refresh(existing_record)
        return _to_response(existing_record, company_name=company.name)

    new_record = Attendance(
        company_id=company_id,
        employee_id=emp_id,
        employee_name=emp_name,
        employee_avatar=avatar_url,
        department=emp_dept,
        date=today_str,
        check_in_time=current_time_str,
        check_out_time=punch_in.check_out_time or "--",
        status=punch_in.status or "Present",
        work_hours=punch_in.work_hours or "Active",
        location=punch_in.location or "Office Premises (Verified)",
        device=punch_in.device or "Web Portal Punch",
    )

    db.add(new_record)
    db.commit()
    db.refresh(new_record)

    return _to_response(new_record, company_name=company.name)


def get_attendance_records(
    db: Session,
    company_id: Optional[int] = None,
    employee_id: Optional[int] = None,
    date: Optional[str] = None,
    month: Optional[str] = None,
    status_filter: Optional[str] = None,
    skip: int = 0,
    limit: int = 500,
) -> List[AttendanceRecordResponse]:
    """Retrieve attendance records with optional company, employee, date, month, and status filtering."""
    query = (
        db.query(Attendance, Company.name.label("company_name"))
        .join(Company, Attendance.company_id == Company.id)
    )

    if company_id:
        query = query.filter(Attendance.company_id == company_id)

    if employee_id:
        query = query.filter(Attendance.employee_id == employee_id)

    if date:
        query = query.filter(Attendance.date == date)
    elif month:
        # Filter dates starting with YYYY-MM (e.g. '2026-08%')
        query = query.filter(Attendance.date.like(f"{month}%"))

    if status_filter and status_filter.upper() != "ALL":
        query = query.filter(func.lower(Attendance.status) == status_filter.lower())

    results = query.order_by(Attendance.date.asc(), Attendance.id.desc()).offset(skip).limit(limit).all()

    return [_to_response(att, company_name=c_name) for att, c_name in results]


def get_attendance_stats(
    db: Session,
    company_id: Optional[int] = None,
    date: Optional[str] = None,
) -> AttendanceStatsResponse:
    """Calculate daily attendance statistics & analytics."""
    target_date = date or datetime.now(timezone.utc).strftime("%Y-%m-%d")

    # Staff count
    emp_query = db.query(Employee)
    att_query = db.query(Attendance).filter(Attendance.date == target_date)

    if company_id:
        emp_query = emp_query.filter(Employee.company_id == company_id)
        att_query = att_query.filter(Attendance.company_id == company_id)

    total_staff = emp_query.count()
    if total_staff == 0 and company_id:
        company = db.query(Company).filter(Company.id == company_id).first()
        if company and company.employee_count > 0:
            total_staff = company.employee_count

    records = att_query.all()
    present_count = sum(1 for r in records if r.status == "Present")
    late_count = sum(1 for r in records if r.status == "Late")
    half_day_count = sum(1 for r in records if r.status == "Half Day")
    absent_count = sum(1 for r in records if r.status == "Absent")

    rate = 100.0
    if total_staff > 0:
        rate = round((present_count / total_staff) * 100, 1)

    return AttendanceStatsResponse(
        total_staff=total_staff,
        present_today=present_count,
        late_today=late_count,
        absent_today=absent_count,
        half_day_today=half_day_count,
        attendance_rate=rate,
    )


def update_attendance(
    db: Session,
    record_id: int,
    updates: AttendanceUpdate,
    company_id: Optional[int] = None,
) -> AttendanceRecordResponse:
    """Update check-out time or status of attendance record."""
    query = db.query(Attendance).filter(Attendance.id == record_id)
    if company_id:
        query = query.filter(Attendance.company_id == company_id)

    record = query.first()
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Attendance record with ID {record_id} not found.",
        )

    for field, val in updates.model_dump(exclude_unset=True).items():
        if val is not None:
            setattr(record, field, val)

    db.commit()
    db.refresh(record)

    company = db.query(Company).filter(Company.id == record.company_id).first()
    return _to_response(record, company_name=company.name if company else None)


def delete_attendance(
    db: Session,
    record_id: int,
    company_id: Optional[int] = None,
) -> dict:
    """Delete an attendance record."""
    query = db.query(Attendance).filter(Attendance.id == record_id)
    if company_id:
        query = query.filter(Attendance.company_id == company_id)

    record = query.first()
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Attendance record with ID {record_id} not found.",
        )

    db.delete(record)
    db.commit()
    return {"status": "success", "message": f"Attendance record {record_id} deleted successfully."}


def seed_default_attendance(db: Session):
    """Seed initial sample attendance records if none exist."""
    count = db.query(Attendance).count()
    if count > 0:
        return

    company = db.query(Company).first()
    if not company:
        return

    today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    initial_records = [
        Attendance(
            company_id=company.id,
            employee_name="Aarav Sharma",
            employee_avatar="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
            department="Engineering",
            date=today_str,
            check_in_time="09:02 AM",
            check_out_time="--",
            status="Present",
            work_hours="Active",
            location="Headquarters (Biometric Gate 1)",
            device="Facial Recognition Kiosk",
        ),
        Attendance(
            company_id=company.id,
            employee_name="Priya Patel",
            employee_avatar="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
            department="Human Resources",
            date=today_str,
            check_in_time="08:55 AM",
            check_out_time="--",
            status="Present",
            work_hours="Active",
            location="Headquarters (Biometric Gate 2)",
            device="Fingerprint Kiosk",
        ),
        Attendance(
            company_id=company.id,
            employee_name="Rohan Verma",
            employee_avatar="https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80",
            department="Sales & Marketing",
            date=today_str,
            check_in_time="09:48 AM",
            check_out_time="--",
            status="Late",
            work_hours="Active",
            location="Field Client Visit (Andheri)",
            device="Mobile GPS Tag",
        ),
        Attendance(
            company_id=company.id,
            employee_name="Sneha Patel",
            employee_avatar="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80",
            department="Design & UI",
            date=today_str,
            check_in_time="--",
            check_out_time="--",
            status="Absent",
            work_hours="0h",
            location="Not Clocked In",
            device="N/A",
        ),
        Attendance(
            company_id=company.id,
            employee_name="Karan Singhania",
            employee_avatar="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80",
            department="Finance & Accounts",
            date=today_str,
            check_in_time="09:05 AM",
            check_out_time="01:30 PM",
            status="Half Day",
            work_hours="4h 25m",
            location="Mumbai BKC Office",
            device="Web Browser Punch",
        ),
        Attendance(
            company_id=company.id,
            employee_name="Deepika Nair",
            employee_avatar="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
            department="Operations",
            date=today_str,
            check_in_time="09:12 AM",
            check_out_time="--",
            status="Present",
            work_hours="Active",
            location="Thane Warehouse Hub",
            device="Fingerprint Biometric",
        ),
    ]

    for rec in initial_records:
        db.add(rec)
    db.commit()
