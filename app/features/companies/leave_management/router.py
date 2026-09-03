from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.features.companies.leave_management import service
from app.features.companies.leave_management.schemas import (
    LeaveRequestCreate,
    LeaveRequestResponse,
    LeaveStatusUpdate,
    CompanyLeaveTypeCreate,
    CompanyLeaveTypeUpdate,
    CompanyLeaveTypeResponse,
)
from app.features.super_admin.super_admin_auth.schemas import UserAuthResponse
from app.features.super_admin.super_admin_auth.service import get_current_user, get_current_user_optional

router = APIRouter(
    prefix="/leaves",
    tags=["Leave Management (Company Admin & Super Admin)"],
)


@router.get("/", response_model=List[LeaveRequestResponse], summary="List Leave Requests")
def read_leave_requests(
    status: Optional[str] = Query(None, description="Filter requests by status (Pending, Approved, Rejected)"),
    company_id: Optional[int] = Query(None, description="Optional company ID filter"),
    employee_id: Optional[int] = Query(None, description="Optional employee ID filter"),
    skip: int = 0,
    limit: int = 200,
    db: Session = Depends(get_db),
    current_user: Optional[UserAuthResponse] = Depends(get_current_user_optional),
):
    """
    Fetch employee leave requests:
    - Company Admin, HR Admin, Manager: strictly scoped to own company_id.
    - Employee / Customer Portal / Super Admin: filtered by company_id and employee_id.
    """
    if current_user and current_user.role in ("COMPANY_ADMIN", "HR_ADMIN", "MANAGER"):
        scoped_company_id = current_user.company_id
    else:
        scoped_company_id = company_id

    return service.get_leave_requests(
        db,
        company_id=scoped_company_id,
        employee_id=employee_id,
        status_filter=status,
        skip=skip,
        limit=limit,
    )


@router.post(
    "/",
    response_model=LeaveRequestResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submit Leave Request",
)
def submit_leave_request(
    leave_in: LeaveRequestCreate,
    db: Session = Depends(get_db),
    current_user: Optional[UserAuthResponse] = Depends(get_current_user_optional),
):
    """
    Submit employee leave application:
    - Company Admin & HR Admin: automatically links to own company_id.
    - Employee / Customer Portal / Super Admin: uses company_id passed in payload or fallback to 1.
    """
    if current_user and current_user.role in ("COMPANY_ADMIN", "HR_ADMIN"):
        target_company_id = current_user.company_id
    else:
        target_company_id = leave_in.company_id or 1

    return service.create_leave_request(db, leave_in, company_id=target_company_id)


@router.patch("/{leave_id}/status", response_model=LeaveRequestResponse, summary="Approve or Reject Leave")
def update_leave_status(
    leave_id: int,
    status_in: LeaveStatusUpdate,
    db: Session = Depends(get_db),
    current_user: UserAuthResponse = Depends(get_current_user),
):
    """Update status of a leave request (Approved / Rejected) - Company Admin, HR Admin, or Manager."""
    scoped_company_id = current_user.company_id if current_user.role in ("COMPANY_ADMIN", "HR_ADMIN", "MANAGER") else None
    return service.update_leave_status(db, leave_id, status_in, company_id=scoped_company_id)


@router.delete("/{leave_id}", summary="Delete Leave Request")
def delete_leave_request(
    leave_id: int,
    db: Session = Depends(get_db),
    current_user: UserAuthResponse = Depends(get_current_user),
):
    """Delete a leave request."""
    if current_user.role == "MANAGER":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Managers do not have permission to delete leave requests.",
        )
    scoped_company_id = current_user.company_id if current_user.role in ("COMPANY_ADMIN", "HR_ADMIN") else None
    return service.delete_leave_request(db, leave_id, company_id=scoped_company_id)


# ---------------------------------------------------------------------------
# Company Leave Types & Policy Endpoints
# ---------------------------------------------------------------------------

@router.get("/types", response_model=List[CompanyLeaveTypeResponse], summary="List Company Leave Types & Quotas")
def read_company_leave_types(
    company_id: Optional[int] = Query(None, description="Optional company ID filter"),
    employee_id: Optional[int] = Query(None, description="Optional employee ID to calculate remaining quota"),
    employee_name: Optional[str] = Query(None, description="Optional employee name to calculate remaining quota"),
    db: Session = Depends(get_db),
):
    """
    Fetch all leave types and allocated quotas for a company (e.g. Sick (10), Casual (9), Earned (5), monthly leaves (90)).
    Calculates remaining quota when employee_id or employee_name is supplied.
    """
    return service.get_company_leave_types(
        db,
        company_id=company_id,
        employee_id=employee_id,
        employee_name=employee_name,
    )


@router.post("/types", response_model=CompanyLeaveTypeResponse, status_code=status.HTTP_201_CREATED, summary="Create Company Leave Type")
def create_company_leave_type(
    payload: CompanyLeaveTypeCreate,
    db: Session = Depends(get_db),
    current_user: UserAuthResponse = Depends(get_current_user),
):
    """Create a new leave type and set its quota balance (Company Admin / HR Admin / Super Admin)."""
    if current_user.role in ("COMPANY_ADMIN", "HR_ADMIN"):
        target_company_id = current_user.company_id
    else:
        target_company_id = payload.company_id or current_user.company_id

    if not target_company_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unable to determine organization for this leave type.",
        )

    return service.create_company_leave_type(db, payload, company_id=target_company_id)


@router.put("/types/{type_id}", response_model=CompanyLeaveTypeResponse, summary="Update Company Leave Type & Quota")
def update_company_leave_type(
    type_id: int,
    payload: CompanyLeaveTypeUpdate,
    db: Session = Depends(get_db),
    current_user: UserAuthResponse = Depends(get_current_user),
):
    """Update quota or details of a leave type."""
    scoped_company_id = current_user.company_id if current_user.role in ("COMPANY_ADMIN", "HR_ADMIN") else None
    return service.update_company_leave_type(db, type_id, payload, company_id=scoped_company_id)


@router.delete("/types/{type_id}", summary="Delete Company Leave Type")
def delete_company_leave_type(
    type_id: int,
    db: Session = Depends(get_db),
    current_user: UserAuthResponse = Depends(get_current_user),
):
    """Delete a company leave type."""
    scoped_company_id = current_user.company_id if current_user.role in ("COMPANY_ADMIN", "HR_ADMIN") else None
    return service.delete_company_leave_type(db, type_id, company_id=scoped_company_id)

