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


def parse_time_to_minutes(time_str: str) -> Optional[int]:
    import re
    match = re.search(r'(\d{1,2}):(\d{2})\s*(AM|PM)', time_str, re.IGNORECASE)
    if not match:
        return None
    h = int(match.group(1))
    m = int(match.group(2))
    ampm = match.group(3).upper()
    if ampm == "PM" and h != 12:
        h += 12
    elif ampm == "AM" and h == 12:
        h = 0
    return h * 60 + m


def parse_shift_window(
    assigned_shift_str: Optional[str] = None,
    company_shift_timings: Optional[str] = None,
    company_shift_count: int = 1,
) -> tuple[int, int, str, str, str]:
    """
    Extracts (start_minutes, end_minutes, start_str, end_str, shift_title) from assigned shift or company shift configuration.
    e.g. 'Shift 2 (Night): 08:00 PM - 08:00 AM (12h)' -> (1200, 480, '08:00 PM', '08:00 AM', 'Shift 2 (Night)')
    """
    import re

    raw_candidate = (assigned_shift_str or "").strip()
    shift_title = raw_candidate.split(":")[0].strip() if ":" in raw_candidate else (raw_candidate or "Shift 1")

    # 1. First, check if assigned_shift itself contains a time interval (e.g. "08:00 PM - 08:00 AM")
    if raw_candidate:
        match = re.search(
            r'(\d{1,2}:\d{2}\s*(?:AM|PM))\s*(?:-|to)\s*(\d{1,2}:\d{2}\s*(?:AM|PM))',
            raw_candidate,
            re.IGNORECASE
        )
        if match:
            start_str = match.group(1).strip()
            end_str = match.group(2).strip()
            s_mins = parse_time_to_minutes(start_str)
            e_mins = parse_time_to_minutes(end_str)
            if s_mins is not None and e_mins is not None:
                return (s_mins, e_mins, start_str, end_str, shift_title)

    # 2. If assigned_shift has no timing regex, look up in company_shift_timings (split by '|')
    if company_shift_timings:
        segments = [s.strip() for s in company_shift_timings.split("|") if s.strip()]
        lower_assigned = raw_candidate.lower()

        # Try to find segment matching assigned shift name/number
        matched_segment = None
        for seg in segments:
            seg_lower = seg.lower()
            if lower_assigned and (
                (lower_assigned in seg_lower) or
                ("shift 2" in lower_assigned and "shift 2" in seg_lower) or
                ("shift 3" in lower_assigned and "shift 3" in seg_lower) or
                ("shift 1" in lower_assigned and "shift 1" in seg_lower) or
                ("night" in lower_assigned and "night" in seg_lower) or
                ("evening" in lower_assigned and "evening" in seg_lower)
            ):
                matched_segment = seg
                break

        if not matched_segment and segments:
            # If only 1 segment or no specific match, use first segment
            matched_segment = segments[0]

        if matched_segment:
            seg_title = matched_segment.split(":")[0].strip() if ":" in matched_segment else matched_segment.strip()
            match = re.search(
                r'(\d{1,2}:\d{2}\s*(?:AM|PM))\s*(?:-|to)\s*(\d{1,2}:\d{2}\s*(?:AM|PM))',
                matched_segment,
                re.IGNORECASE
            )
            if match:
                start_str = match.group(1).strip()
                end_str = match.group(2).strip()
                s_mins = parse_time_to_minutes(start_str)
                e_mins = parse_time_to_minutes(end_str)
                if s_mins is not None and e_mins is not None:
                    return (s_mins, e_mins, start_str, end_str, shift_title or seg_title)

    # 3. Standard fallback by shift name keywords
    lower = raw_candidate.lower()
    if "shift 2" in lower or "night" in lower or "evening" in lower:
        if "evening" in lower or "afternoon" in lower:
            return (14 * 60, 22 * 60, "02:00 PM", "10:00 PM", "Shift 2 (Evening)")
        return (20 * 60, 8 * 60, "08:00 PM", "08:00 AM", "Shift 2 (Night)")
    elif "shift 3" in lower:
        return (22 * 60, 6 * 60, "10:00 PM", "06:00 AM", "Shift 3 (Night)")
    elif "day" in lower or "morning" in lower:
        return (8 * 60, 20 * 60, "08:00 AM", "08:00 PM", "Shift 1 (Day)")

    return (9 * 60, 18 * 60, "09:00 AM", "06:00 PM", "Shift 1 (Day Shift)")


def validate_and_calculate_shift_window(
    punch_time_str: str,
    assigned_shift_str: Optional[str] = None,
    company_shift_timings: Optional[str] = None,
    company_shift_count: int = 1,
) -> tuple[bool, str, str]:
    """
    Validates if the employee is punching within their assigned shift window and calculates status.
    Returns: (is_allowed: bool, status: str, rejection_reason: str)
    """
    if not punch_time_str or punch_time_str == "--":
        return True, "Present", ""

    punch_mins = parse_time_to_minutes(punch_time_str)
    if punch_mins is None:
        return True, "Present", ""

    s_mins, e_mins, start_str, end_str, shift_title = parse_shift_window(
        assigned_shift_str=assigned_shift_str,
        company_shift_timings=company_shift_timings,
        company_shift_count=company_shift_count,
    )

    # Format early clock-in time string (45 minutes before shift start)
    earliest_allowed = (s_mins - 45) % 1440
    earliest_h = (earliest_allowed // 60) % 24
    earliest_m = earliest_allowed % 60
    earliest_ampm = "AM" if earliest_h < 12 else "PM"
    earliest_h_12 = earliest_h % 12 or 12
    earliest_fmt = f"{earliest_h_12:02d}:{earliest_m:02d} {earliest_ampm}"

    # Standard Day Shift (e.g. 08:00 AM to 08:00 PM: 480 to 1200)
    if s_mins < e_mins:
        earliest_mins = s_mins - 45
        latest_mins = e_mins

        if punch_mins < earliest_mins:
            return False, "Present", (
                f"Clock-in rejected: Early punch not allowed. Your assigned shift '{shift_title}' ({start_str} - {end_str}) "
                f"starts at {start_str}. Early clock-in opens at {earliest_fmt}."
            )

        if punch_mins > latest_mins:
            return False, "Late", (
                f"Clock-in rejected: Shift is closed. Your assigned shift '{shift_title}' ({start_str} - {end_str}) "
                f"ended at {end_str}. You cannot clock in after your scheduled shift hours."
            )

        # Inside valid window
        if punch_mins <= s_mins + 15:
            return True, "Present", ""
        else:
            return True, "Late", ""

    else:
        # Overnight Shift (e.g. 08:00 PM to 08:00 AM: 1200 to 480)
        earliest_mins = (s_mins - 45) % 1440  # 1155 (07:15 PM)
        latest_mins = e_mins                 # 480 (08:00 AM)

        is_inside_window = (punch_mins >= earliest_mins) or (punch_mins <= latest_mins)

        if not is_inside_window:
            return False, "Late", (
                f"Clock-in rejected: Outside shift window. Your assigned shift '{shift_title}' "
                f"is active from {start_str} to {end_str}. Early clock-in opens at {earliest_fmt}."
            )

        # On-time vs Late for overnight shift
        on_time_cutoff = (s_mins + 15) % 1440
        if (punch_mins >= earliest_mins and (punch_mins <= on_time_cutoff or on_time_cutoff < earliest_mins)) or (on_time_cutoff < earliest_mins and punch_mins <= on_time_cutoff):
            return True, "Present", ""
        else:
            return True, "Late", ""


def record_punch(
    db: Session,
    punch_in: AttendancePunchCreate,
    company_id: int,
) -> AttendanceRecordResponse:
    """Record manual or biometric attendance punch (Clock In / Clock Out) with Strict Shift validation."""
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
    emp_shift = getattr(emp, "assigned_shift", None) if emp else None
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

    # If this is a Clock Out action
    is_clock_out_action = bool(
        (punch_in.check_out_time and punch_in.check_out_time != "--") or
        (punch_in.work_hours == "Completed")
    )

    # For Clock-In action: Enforce Strict Shift Window Validation
    if not is_clock_out_action and (not existing_record or not existing_record.check_in_time):
        is_allowed, auto_status, rejection_reason = validate_and_calculate_shift_window(
            punch_time_str=current_time_str,
            assigned_shift_str=emp_shift,
            company_shift_timings=company.shift_timings,
            company_shift_count=company.shift_count or 1,
        )

        if not is_allowed and not punch_in.force_override:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=rejection_reason,
            )

        computed_status = punch_in.status if punch_in.status in ["Absent", "Half Day"] else auto_status
    else:
        computed_status = punch_in.status or "Present"

    if existing_record:
        if punch_in.check_out_time and punch_in.check_out_time != "--":
            existing_record.check_out_time = punch_in.check_out_time
        elif is_clock_out_action and existing_record.check_in_time and (not existing_record.check_out_time or existing_record.check_out_time == "--"):
            # Clocking out existing check-in session
            existing_record.check_out_time = punch_in.check_out_time if (punch_in.check_out_time and punch_in.check_out_time != "--") else current_time_str
        elif punch_in.check_in_time and punch_in.check_in_time != "--" and (not existing_record.check_in_time or existing_record.check_in_time == "--"):
            existing_record.check_in_time = punch_in.check_in_time

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
        resp = _to_response(existing_record, company_name=company.name)
        try:
            from app.websocket import broadcast_punch_event
            broadcast_punch_event(
                action="CLOCK_OUT" if is_clock_out_action else "CLOCK_IN",
                record_data=resp.model_dump(mode="json"),
                employee_id=existing_record.employee_id,
                employee_name=existing_record.employee_name,
                company_id=existing_record.company_id,
            )
        except Exception:
            pass
        return resp

    new_record = Attendance(
        company_id=company_id,
        employee_id=emp_id,
        employee_name=emp_name,
        employee_avatar=avatar_url,
        department=emp_dept,
        date=today_str,
        check_in_time=current_time_str,
        check_out_time=punch_in.check_out_time or "--",
        status=computed_status or "Present",
        work_hours=punch_in.work_hours or "Active",
        location=punch_in.location or "Office Premises (Verified)",
        device=punch_in.device or "Web Portal Punch",
    )

    db.add(new_record)
    db.commit()
    db.refresh(new_record)
    resp = _to_response(new_record, company_name=company.name)
    try:
        from app.websocket import broadcast_punch_event
        broadcast_punch_event(
            action="CLOCK_IN",
            record_data=resp.model_dump(mode="json"),
            employee_id=new_record.employee_id,
            employee_name=new_record.employee_name,
            company_id=new_record.company_id,
        )
    except Exception:
        pass

    return resp


def auto_close_expired_shifts(db: Session, company_id: Optional[int] = None) -> int:
    """
    Automatically closes open attendance sessions (check_out_time == '--' or None)
    when an employee's scheduled shift has ended or when the next shift has commenced.
    """
    now = datetime.now()
    today_str = now.strftime("%Y-%m-%d")
    current_minutes = now.hour * 60 + now.minute

    # Query all active / open attendance records
    open_query = db.query(Attendance).filter(
        (Attendance.check_out_time == "--") | (Attendance.check_out_time == None) | (Attendance.check_out_time == "")
    )
    if company_id:
        open_query = open_query.filter(Attendance.company_id == company_id)

    open_records = open_query.all()
    if not open_records:
        return 0

    closed_count = 0
    for rec in open_records:
        emp = db.query(Employee).filter(Employee.id == rec.employee_id).first() if rec.employee_id else None
        co = db.query(Company).filter(Company.id == rec.company_id).first()

        emp_shift = emp.assigned_shift if emp and emp.assigned_shift else (co.shift_timings if co else None)
        co_timings = co.shift_timings if co else None
        co_shift_count = co.shift_count if co else 1

        s_mins, e_mins, start_str, end_str, shift_title = parse_shift_window(
            assigned_shift_str=emp_shift,
            company_shift_timings=co_timings,
            company_shift_count=co_shift_count,
        )

        should_auto_close = False

        # If record is from previous date (< today), it must be closed
        if rec.date < today_str:
            should_auto_close = True
        elif rec.date == today_str:
            if s_mins < e_mins:
                # Daytime shift: e.g. 09:00 AM (540) to 06:00 PM (1080)
                # Auto-close if current time is at or past shift end
                if current_minutes >= e_mins:
                    should_auto_close = True
            else:
                # Overnight shift: e.g. 08:00 PM (1200) to 08:00 AM (480)
                # If current time is morning past e_mins (e.g. 08:00 AM to 07:00 PM)
                if e_mins <= current_minutes < s_mins:
                    should_auto_close = True

        if should_auto_close:
            rec.check_out_time = end_str or "06:00 PM"
            rec.work_hours = "Completed"
            closed_count += 1

    if closed_count > 0:
        db.commit()

    return closed_count


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
    # Real-time shift evaluation: Auto-close any completed shifts
    try:
        auto_close_expired_shifts(db, company_id=company_id)
    except Exception:
        pass

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
    try:
        auto_close_expired_shifts(db, company_id=company_id)
    except Exception:
        pass

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
    resp = _to_response(record, company_name=company.name if company else None)
    try:
        from app.websocket import broadcast_update_event
        broadcast_update_event(
            record_data=resp.model_dump(mode="json"),
            employee_id=record.employee_id,
            employee_name=record.employee_name,
            company_id=record.company_id,
        )
    except Exception:
        pass
    return resp


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

    emp_id = record.employee_id
    comp_id = record.company_id

    db.delete(record)
    db.commit()

    try:
        from app.websocket import broadcast_delete_event
        broadcast_delete_event(
            record_id=record_id,
            employee_id=emp_id,
            company_id=comp_id,
        )
    except Exception:
        pass

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
