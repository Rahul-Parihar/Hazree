from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.features.companies.employee_management import service
from app.features.companies.employee_management.schemas import (
    EmployeeCreate,
    EmployeeResponse,
    EmployeeUpdate,
)
from app.features.super_admin.super_admin_auth.schemas import UserAuthResponse
from app.features.super_admin.super_admin_auth.service import get_current_user

router = APIRouter(
    prefix="/employees",
    tags=["Employee Management (Company Admin & Super Admin)"],
)


@router.get("/", response_model=List[EmployeeResponse], summary="List Employees")
def read_employees(
    company_id: Optional[int] = Query(None, description="Optional filter by company ID (Super Admin only)"),
    skip: int = 0,
    limit: int = 200,
    db: Session = Depends(get_db),
    current_user: UserAuthResponse = Depends(get_current_user),
):
    """
    Fetch employee directory:
    - Company Admin: strictly scoped to their own company_id.
    - Super Admin: sees all employees or filters by query parameter.
    """
    scoped_company_id = current_user.company_id if current_user.role == "COMPANY_ADMIN" else company_id
    return service.get_employees(db, company_id=scoped_company_id, skip=skip, limit=limit)


@router.post(
    "/",
    response_model=EmployeeResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add New Employee (Company Admin / Super Admin)",
)
def create_employee(
    employee_in: EmployeeCreate,
    db: Session = Depends(get_db),
    current_user: UserAuthResponse = Depends(get_current_user),
):
    """
    Register a new staff employee for the organization:
    - Company Admin: automatically associates employee to current logged-in company.
    - Super Admin: uses company_id passed in payload.
    - Enforces subscription quota limit & prevents duplicate emails.
    """
    if current_user.role == "COMPANY_ADMIN":
        target_company_id = current_user.company_id
    else:
        # Super Admin creating an employee
        if not employee_in.company_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="company_id is required when registering an employee as Super Admin.",
            )
        target_company_id = employee_in.company_id

    if not target_company_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unable to determine organization for this employee.",
        )

    return service.create_employee(db, employee_in, company_id=target_company_id)


@router.get("/{employee_id}", response_model=EmployeeResponse, summary="Get Employee by ID")
def get_employee(
    employee_id: int,
    db: Session = Depends(get_db),
    current_user: UserAuthResponse = Depends(get_current_user),
):
    """Get single employee profile with tenant access isolation."""
    scoped_company_id = current_user.company_id if current_user.role == "COMPANY_ADMIN" else None
    return service.get_employee_by_id(db, employee_id, company_id=scoped_company_id)


@router.put("/{employee_id}", response_model=EmployeeResponse, summary="Update Employee Details")
def update_employee(
    employee_id: int,
    employee_in: EmployeeUpdate,
    db: Session = Depends(get_db),
    current_user: UserAuthResponse = Depends(get_current_user),
):
    """Update employee details with tenant access isolation."""
    scoped_company_id = current_user.company_id if current_user.role == "COMPANY_ADMIN" else None
    return service.update_employee(db, employee_id, employee_in, company_id=scoped_company_id)


@router.delete("/{employee_id}", summary="Delete Employee")
def delete_employee(
    employee_id: int,
    db: Session = Depends(get_db),
    current_user: UserAuthResponse = Depends(get_current_user),
):
    """Delete employee record with tenant access isolation and sync company count."""
    scoped_company_id = current_user.company_id if current_user.role == "COMPANY_ADMIN" else None
    return service.delete_employee(db, employee_id, company_id=scoped_company_id)
