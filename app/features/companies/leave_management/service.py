from typing import List, Optional
from datetime import datetime, timezone
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.features.companies.company_management.models import Company
from app.features.companies.leave_management.models import LeaveRequest
from app.features.companies.leave_management.schemas import (
    LeaveRequestCreate,
    LeaveRequestResponse,
    LeaveStatusUpdate,
)


def _to_response(leave: LeaveRequest, company_name: Optional[str] = None) -> LeaveRequestResponse:
    return LeaveRequestResponse(
        id=leave.id,
        company_id=leave.company_id,
        company_name=company_name,
        employee_id=leave.employee_id,
        employee_name=leave.employee_name,
        employee_avatar=leave.employee_avatar or f"https://ui-avatars.com/api/?name={leave.employee_name.replace(' ', '+')}&background=059669&color=fff",
        department=leave.department,
        leave_type=leave.leave_type,
        start_date=leave.start_date,
        end_date=leave.end_date,
        days_count=leave.days_count,
        reason=leave.reason,
        status=leave.status,
        applied_on=leave.applied_on,
        admin_notes=leave.admin_notes,
        created_at=leave.created_at,
    )


def create_leave_request(
    db: Session,
    leave_in: LeaveRequestCreate,
    company_id: int,
) -> LeaveRequestResponse:
    """Create and submit a new employee leave application."""
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Company with ID {company_id} not found.",
        )

    applied_date = leave_in.applied_on or datetime.now(timezone.utc).strftime("%Y-%m-%d")
    avatar_url = leave_in.employee_avatar or f"https://ui-avatars.com/api/?name={leave_in.employee_name.replace(' ', '+')}&background=059669&color=fff"

    new_leave = LeaveRequest(
        company_id=company_id,
        employee_id=leave_in.employee_id,
        employee_name=leave_in.employee_name.strip(),
        employee_avatar=avatar_url,
        department=leave_in.department.strip(),
        leave_type=leave_in.leave_type or "Casual",
        start_date=leave_in.start_date,
        end_date=leave_in.end_date,
        days_count=leave_in.days_count or 1,
        reason=leave_in.reason.strip(),
        status="Pending",
        applied_on=applied_date,
    )

    db.add(new_leave)
    db.commit()
    db.refresh(new_leave)

    return _to_response(new_leave, company_name=company.name)


def get_leave_requests(
    db: Session,
    company_id: Optional[int] = None,
    status_filter: Optional[str] = None,
    skip: int = 0,
    limit: int = 200,
) -> List[LeaveRequestResponse]:
    """Retrieve list of leave requests scoped to company (or all for Super Admin)."""
    query = (
        db.query(LeaveRequest, Company.name.label("company_name"))
        .join(Company, LeaveRequest.company_id == Company.id)
    )

    if company_id:
        query = query.filter(LeaveRequest.company_id == company_id)

    if status_filter and status_filter.upper() != "ALL":
        query = query.filter(func.lower(LeaveRequest.status) == status_filter.lower())

    results = query.order_by(LeaveRequest.id.desc()).offset(skip).limit(limit).all()

    return [_to_response(leave, company_name=c_name) for leave, c_name in results]


def update_leave_status(
    db: Session,
    leave_id: int,
    status_in: LeaveStatusUpdate,
    company_id: Optional[int] = None,
) -> LeaveRequestResponse:
    """Approve or Reject an employee leave request."""
    query = db.query(LeaveRequest).filter(LeaveRequest.id == leave_id)
    if company_id:
        query = query.filter(LeaveRequest.company_id == company_id)

    leave = query.first()
    if not leave:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Leave request with ID {leave_id} not found.",
        )

    leave.status = status_in.status
    if status_in.admin_notes:
        leave.admin_notes = status_in.admin_notes

    db.commit()
    db.refresh(leave)

    company = db.query(Company).filter(Company.id == leave.company_id).first()
    return _to_response(leave, company_name=company.name if company else None)


def delete_leave_request(
    db: Session,
    leave_id: int,
    company_id: Optional[int] = None,
) -> dict:
    """Delete a leave request."""
    query = db.query(LeaveRequest).filter(LeaveRequest.id == leave_id)
    if company_id:
        query = query.filter(LeaveRequest.company_id == company_id)

    leave = query.first()
    if not leave:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Leave request with ID {leave_id} not found.",
        )

    db.delete(leave)
    db.commit()
    return {"status": "success", "message": f"Leave request {leave_id} deleted successfully."}


def seed_default_leaves(db: Session):
    """Seed initial sample leave requests if none exist."""
    count = db.query(LeaveRequest).count()
    if count > 0:
        return

    company = db.query(Company).first()
    if not company:
        return

    today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    initial_leaves = [
        LeaveRequest(
            company_id=company.id,
            employee_name="Sneha Patel",
            employee_avatar="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80",
            department="Design & UI",
            leave_type="Casual",
            start_date="2026-08-16",
            end_date="2026-08-18",
            days_count=3,
            reason="Family event and personal travel to Vadodara.",
            status="Pending",
            applied_on=today_str,
        ),
        LeaveRequest(
            company_id=company.id,
            employee_name="Deepika Nair",
            employee_avatar="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
            department="Operations",
            leave_type="Sick",
            start_date="2026-08-14",
            end_date="2026-08-15",
            days_count=2,
            reason="Severe viral fever and physician consultation prescribed 2-day bed rest.",
            status="Approved",
            applied_on=today_str,
        ),
        LeaveRequest(
            company_id=company.id,
            employee_name="Rohan Verma",
            employee_avatar="https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80",
            department="Sales & Marketing",
            leave_type="Paid",
            start_date="2026-08-20",
            end_date="2026-08-22",
            days_count=3,
            reason="Annual vacation planned with family.",
            status="Pending",
            applied_on=today_str,
        ),
    ]

    for lv in initial_leaves:
        db.add(lv)
    db.commit()
