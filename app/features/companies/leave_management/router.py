from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.features.companies.leave_management import service
from app.features.companies.leave_management.schemas import (
    LeaveRequestCreate,
    LeaveRequestResponse,
    LeaveStatusUpdate,
)
from app.features.super_admin.super_admin_auth.schemas import UserAuthResponse
from app.features.super_admin.super_admin_auth.service import get_current_user

router = APIRouter(
    prefix="/leaves",
    tags=["Leave Management (Company Admin & Super Admin)"],
)


@router.get("/", response_model=List[LeaveRequestResponse], summary="List Leave Requests")
def read_leave_requests(
    status: Optional[str] = Query(None, description="Filter requests by status (Pending, Approved, Rejected)"),
    company_id: Optional[int] = Query(None, description="Optional company ID filter for Super Admin"),
    skip: int = 0,
    limit: int = 200,
    db: Session = Depends(get_db),
    current_user: UserAuthResponse = Depends(get_current_user),
):
    """
    Fetch employee leave requests:
    - Company Admin: strictly scoped to own company_id.
    - Super Admin: sees all leave requests or filters by query parameter.
    """
    scoped_company_id = current_user.company_id if current_user.role == "COMPANY_ADMIN" else company_id
    return service.get_leave_requests(
        db,
        company_id=scoped_company_id,
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
    current_user: UserAuthResponse = Depends(get_current_user),
):
    """
    Submit employee leave application:
    - Company Admin: automatically links to own company_id.
    - Super Admin: uses company_id passed in payload.
    """
    if current_user.role == "COMPANY_ADMIN":
        target_company_id = current_user.company_id
    else:
        target_company_id = leave_in.company_id

    if not target_company_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unable to determine organization for this leave request.",
        )

    return service.create_leave_request(db, leave_in, company_id=target_company_id)


@router.patch("/{leave_id}/status", response_model=LeaveRequestResponse, summary="Approve or Reject Leave")
def update_leave_status(
    leave_id: int,
    status_in: LeaveStatusUpdate,
    db: Session = Depends(get_db),
    current_user: UserAuthResponse = Depends(get_current_user),
):
    """Update status of a leave request (Approved / Rejected)."""
    scoped_company_id = current_user.company_id if current_user.role == "COMPANY_ADMIN" else None
    return service.update_leave_status(db, leave_id, status_in, company_id=scoped_company_id)


@router.delete("/{leave_id}", summary="Delete Leave Request")
def delete_leave_request(
    leave_id: int,
    db: Session = Depends(get_db),
    current_user: UserAuthResponse = Depends(get_current_user),
):
    """Delete a leave request."""
    scoped_company_id = current_user.company_id if current_user.role == "COMPANY_ADMIN" else None
    return service.delete_leave_request(db, leave_id, company_id=scoped_company_id)
