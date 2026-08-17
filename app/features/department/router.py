from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.features.super_admin.super_admin_auth.schemas import UserAuthResponse
from app.features.super_admin.super_admin_auth.service import get_current_user
from app.features.department.schemas import (
    DepartmentCreate,
    DepartmentResponse,
    DepartmentUpdate,
)
from app.features.department import service

router = APIRouter(
    prefix="/api/v1/departments",
    tags=["Department Management"],
)


@router.get("", response_model=List[DepartmentResponse])
def list_departments(
    company_id: Optional[int] = Query(None, description="Filter by company ID or get global"),
    db: Session = Depends(get_db),
    current_user: UserAuthResponse = Depends(get_current_user),
):
    """Retrieve global departments and company-specific departments."""
    user_role = current_user.role
    token_company_id = current_user.company_id

    effective_company_id = company_id
    if user_role == "COMPANY_ADMIN" and token_company_id is not None:
        effective_company_id = int(str(token_company_id).replace("cmp_", ""))

    is_super_admin = (user_role == "SUPER_ADMIN")

    return service.get_departments(
        db=db,
        company_id=effective_company_id,
        is_super_admin=is_super_admin,
    )


@router.post("", response_model=DepartmentResponse, status_code=status.HTTP_201_CREATED)
def create_department(
    dept_in: DepartmentCreate,
    db: Session = Depends(get_db),
    current_user: UserAuthResponse = Depends(get_current_user),
):
    """Create a new department (Super Admin or Company Admin)."""
    user_role = current_user.role
    token_company_id = current_user.company_id

    if user_role == "COMPANY_ADMIN" and token_company_id is not None:
        dept_in.company_id = int(str(token_company_id).replace("cmp_", ""))

    return service.create_department(
        db=db,
        dept_in=dept_in,
        created_by_role=user_role,
    )


@router.put("/{department_id}", response_model=DepartmentResponse, status_code=status.HTTP_200_OK)
def update_department(
    department_id: int,
    dept_in: DepartmentUpdate,
    db: Session = Depends(get_db),
    current_user: UserAuthResponse = Depends(get_current_user),
):
    """Update department details (Super Admin or Company Admin)."""
    user_role = current_user.role
    if user_role not in ["SUPER_ADMIN", "COMPANY_ADMIN"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to update departments.",
        )

    return service.update_department(
        db=db,
        dept_id=department_id,
        dept_in=dept_in,
    )


@router.delete("/{department_id}", status_code=status.HTTP_200_OK)
def delete_department(
    department_id: int,
    db: Session = Depends(get_db),
    current_user: UserAuthResponse = Depends(get_current_user),
):
    """Delete department (Super Admin or authorized admin)."""
    user_role = current_user.role
    if user_role not in ["SUPER_ADMIN", "COMPANY_ADMIN"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to delete departments.",
        )
    service.delete_department(db=db, dept_id=department_id)
    return {"message": "Department deleted successfully."}
