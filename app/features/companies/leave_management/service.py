from typing import List, Optional
from datetime import datetime, timezone
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.features.companies.company_management.models import Company
from app.features.companies.leave_management.models import LeaveRequest, CompanyLeaveType
from app.features.companies.leave_management.schemas import (
    LeaveRequestCreate,
    LeaveRequestResponse,
    LeaveStatusUpdate,
    CompanyLeaveTypeCreate,
    CompanyLeaveTypeUpdate,
    CompanyLeaveTypeResponse,
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
        is_paid=getattr(leave, "is_paid", True),
        applied_on=leave.applied_on,
        admin_notes=leave.admin_notes,
        created_at=leave.created_at,
    )


def create_leave_request(
    db: Session,
    leave_in: LeaveRequestCreate,
    company_id: int,
) -> LeaveRequestResponse:
    """Create and submit a new employee leave application with automatic quota tracking."""
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Company with ID {company_id} not found.",
        )

    applied_date = leave_in.applied_on or datetime.now(timezone.utc).strftime("%Y-%m-%d")
    avatar_url = leave_in.employee_avatar or f"https://ui-avatars.com/api/?name={leave_in.employee_name.replace(' ', '+')}&background=059669&color=fff"
    applied_type = (leave_in.leave_type or "Casual").strip()
    requested_days = leave_in.days_count or 1

    # Check Company Leave Type Policy Quota
    leave_type_policy = (
        db.query(CompanyLeaveType)
        .filter(
            CompanyLeaveType.company_id == company_id,
            func.lower(CompanyLeaveType.name) == func.lower(applied_type),
        )
        .first()
    )

    # Determine if this leave is Paid or Unpaid based on quota:
    is_paid_status = True
    admin_notes_note = None

    if leave_type_policy:
        if not leave_type_policy.is_paid:
            is_paid_status = False
            admin_notes_note = f"Policy '{applied_type}' is designated as Unpaid."
        else:
            emp_filter = (
                (LeaveRequest.employee_id == leave_in.employee_id)
                if leave_in.employee_id
                else (LeaveRequest.employee_name == leave_in.employee_name.strip())
            )
            used_days = (
                db.query(func.coalesce(func.sum(LeaveRequest.days_count), 0))
                .filter(
                    LeaveRequest.company_id == company_id,
                    emp_filter,
                    func.lower(LeaveRequest.leave_type) == func.lower(applied_type),
                    LeaveRequest.status != "Rejected",
                )
                .scalar()
                or 0
            )

            # If quota is exhausted or exceeded, mark leave as UNPAID
            if used_days >= leave_type_policy.quota:
                is_paid_status = False
                admin_notes_note = f"Quota exhausted ({used_days}/{leave_type_policy.quota} days used). Marked as Unpaid leave."
            elif (used_days + requested_days) > leave_type_policy.quota:
                is_paid_status = False
                admin_notes_note = f"Quota exceeded ({used_days + requested_days}/{leave_type_policy.quota} days). Marked as Unpaid leave."
    else:
        if "unpaid" in applied_type.lower():
            is_paid_status = False

    new_leave = LeaveRequest(
        company_id=company_id,
        employee_id=leave_in.employee_id,
        employee_name=leave_in.employee_name.strip(),
        employee_avatar=avatar_url,
        department=leave_in.department.strip(),
        leave_type=applied_type,
        start_date=leave_in.start_date,
        end_date=leave_in.end_date,
        days_count=requested_days,
        reason=leave_in.reason.strip(),
        status="Pending",
        is_paid=is_paid_status,
        applied_on=applied_date,
        admin_notes=admin_notes_note,
    )

    db.add(new_leave)
    db.commit()
    db.refresh(new_leave)

    return _to_response(new_leave, company_name=company.name)


def get_leave_requests(
    db: Session,
    company_id: Optional[int] = None,
    employee_id: Optional[int] = None,
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

    if employee_id:
        query = query.filter(LeaveRequest.employee_id == employee_id)

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


def get_company_leave_types(
    db: Session,
    company_id: Optional[int] = None,
    employee_id: Optional[int] = None,
    employee_name: Optional[str] = None,
) -> List[CompanyLeaveTypeResponse]:
    """Retrieve all leave types configured for a company, optionally calculating remaining quota for an employee."""
    target_cid = company_id
    if not target_cid:
        first_comp = db.query(Company).first()
        target_cid = first_comp.id if first_comp else 1

    leave_types = (
        db.query(CompanyLeaveType)
        .filter(CompanyLeaveType.company_id == target_cid)
        .order_by(CompanyLeaveType.id.asc())
        .all()
    )

    responses = []
    for lt in leave_types:
        remaining = lt.quota
        if employee_id or employee_name:
            emp_filter = (
                (LeaveRequest.employee_id == employee_id)
                if employee_id
                else (LeaveRequest.employee_name == employee_name.strip())
            )
            used = (
                db.query(func.coalesce(func.sum(LeaveRequest.days_count), 0))
                .filter(
                    LeaveRequest.company_id == target_cid,
                    emp_filter,
                    func.lower(LeaveRequest.leave_type) == func.lower(lt.name),
                    LeaveRequest.status != "Rejected",
                )
                .scalar()
                or 0
            )
            remaining = max(0, lt.quota - used)

        responses.append(
            CompanyLeaveTypeResponse(
                id=lt.id,
                company_id=lt.company_id,
                name=lt.name,
                quota=lt.quota,
                remaining_quota=remaining,
                is_paid=lt.is_paid,
                created_at=lt.created_at,
            )
        )

    return responses


def create_company_leave_type(
    db: Session,
    payload: CompanyLeaveTypeCreate,
    company_id: int,
) -> CompanyLeaveTypeResponse:
    """Create a new leave type with quota for the company."""
    # Check if duplicate name already exists for company
    existing = (
        db.query(CompanyLeaveType)
        .filter(
            CompanyLeaveType.company_id == company_id,
            func.lower(CompanyLeaveType.name) == payload.name.strip().lower(),
        )
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Leave type '{payload.name.strip()}' already exists for this organization.",
        )

    new_type = CompanyLeaveType(
        company_id=company_id,
        name=payload.name.strip(),
        quota=payload.quota,
        is_paid=payload.is_paid,
    )
    db.add(new_type)
    db.commit()
    db.refresh(new_type)

    return CompanyLeaveTypeResponse(
        id=new_type.id,
        company_id=new_type.company_id,
        name=new_type.name,
        quota=new_type.quota,
        is_paid=new_type.is_paid,
        created_at=new_type.created_at,
    )


def update_company_leave_type(
    db: Session,
    type_id: int,
    payload: CompanyLeaveTypeUpdate,
    company_id: Optional[int] = None,
) -> CompanyLeaveTypeResponse:
    """Update quota or details of an existing leave type."""
    query = db.query(CompanyLeaveType).filter(CompanyLeaveType.id == type_id)
    if company_id:
        query = query.filter(CompanyLeaveType.company_id == company_id)

    item = query.first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Leave type with ID {type_id} not found.",
        )

    if payload.name is not None:
        item.name = payload.name.strip()
    if payload.quota is not None:
        item.quota = payload.quota
    if payload.is_paid is not None:
        item.is_paid = payload.is_paid

    db.commit()
    db.refresh(item)

    return CompanyLeaveTypeResponse(
        id=item.id,
        company_id=item.company_id,
        name=item.name,
        quota=item.quota,
        is_paid=item.is_paid,
        created_at=item.created_at,
    )


def delete_company_leave_type(
    db: Session,
    type_id: int,
    company_id: Optional[int] = None,
) -> dict:
    """Delete a company leave type."""
    query = db.query(CompanyLeaveType).filter(CompanyLeaveType.id == type_id)
    if company_id:
        query = query.filter(CompanyLeaveType.company_id == company_id)

    item = query.first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Leave type with ID {type_id} not found.",
        )

    db.delete(item)
    db.commit()
    return {"message": "Leave type deleted successfully", "id": type_id}

