from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from app.core.security import get_password_hash
from app.features.companies.company_management.models import Company
from app.features.companies.employee_management.models import Employee
from app.features.companies.employee_management.schemas import (
    EmployeeCreate,
    EmployeeResponse,
    EmployeeUpdate,
)


def _to_response(emp: Employee, company_name: Optional[str] = None) -> EmployeeResponse:
    return EmployeeResponse(
        id=emp.id,
        company_id=emp.company_id,
        company_name=company_name,
        name=emp.name,
        email=emp.email,
        phone=emp.phone,
        role=emp.role,
        department=emp.department,
        avatar=emp.avatar,
        status=emp.status,
        join_date=emp.join_date,
        dob=emp.dob,
        assigned_shift=getattr(emp, "assigned_shift", "Shift 1: 09:00 AM - 06:00 PM") or "Shift 1: 09:00 AM - 06:00 PM",
        created_at=emp.created_at,
    )


def create_employee(
    db: Session,
    employee_in: EmployeeCreate,
    company_id: int,
) -> EmployeeResponse:
    """
    Create and register a new employee for the specified organization:
    - Validates company existence and active subscription
    - Enforces subscription quota limit (max_employees)
    - Prevents duplicate employee emails within the same organization
    - Increments company.employee_count
    """
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Company with ID {company_id} not found.",
        )

    if not company.is_active or (company.status and company.status.lower() == "suspended"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot add employees to an inactive or suspended company account.",
        )

    # 1. Quota Verification
    current_count = db.query(Employee).filter(Employee.company_id == company_id).count()
    if current_count >= company.max_employees:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Employee quota exceeded! Your subscription limit is {company.max_employees} staff. Please upgrade your plan to add more employees.",
        )

    # 2. Duplicate Email Check
    clean_email = employee_in.email.strip().lower()
    existing_emp = (
        db.query(Employee)
        .filter(Employee.company_id == company_id, Employee.email == clean_email)
        .first()
    )
    if existing_emp:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"An employee with email '{clean_email}' is already registered in {company.name}.",
        )

    # 3. Default avatar & join date
    avatar_url = employee_in.avatar or f"https://ui-avatars.com/api/?name={employee_in.name.replace(' ', '+')}&background=059669&color=fff"
    join_date_str = employee_in.join_date or datetime.now(timezone.utc).strftime("%d/%m/%Y")
    
    # Hash employee password (default to Hazree@123 if not explicitly provided)
    raw_password = employee_in.password if (employee_in.password and employee_in.password.strip()) else "Hazree@123"
    hashed_pwd = get_password_hash(raw_password)

    new_emp = Employee(
        company_id=company_id,
        name=employee_in.name.strip(),
        email=clean_email,
        phone=employee_in.phone.strip() if employee_in.phone else None,
        role=employee_in.role.strip(),
        department=employee_in.department.strip(),
        avatar=avatar_url,
        hashed_password=hashed_pwd,
        status=employee_in.status or "Active",
        join_date=join_date_str,
        dob=employee_in.dob.strip() if employee_in.dob else None,
        assigned_shift=employee_in.assigned_shift.strip() if employee_in.assigned_shift else "Shift 1: 09:00 AM - 06:00 PM",
    )

    db.add(new_emp)

    # Sync company employee count
    company.employee_count = current_count + 1
    db.commit()
    db.refresh(new_emp)

    return _to_response(new_emp, company_name=company.name)


def get_employees(
    db: Session,
    company_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 200,
) -> List[EmployeeResponse]:
    """Retrieve employees list (scoped to company_id if provided, or all for Super Admin)."""
    query = (
        db.query(Employee, Company.name.label("company_name"))
        .join(Company, Employee.company_id == Company.id)
    )

    if company_id:
        query = query.filter(Employee.company_id == company_id)

    results = query.order_by(Employee.id.desc()).offset(skip).limit(limit).all()

    return [_to_response(emp, company_name=c_name) for emp, c_name in results]


def get_employee_by_id(
    db: Session,
    employee_id: int,
    company_id: Optional[int] = None,
) -> EmployeeResponse:
    """Retrieve a single employee record by ID."""
    query = (
        db.query(Employee, Company.name.label("company_name"))
        .join(Company, Employee.company_id == Company.id)
        .filter(Employee.id == employee_id)
    )

    if company_id:
        query = query.filter(Employee.company_id == company_id)

    result = query.first()
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee with ID {employee_id} not found.",
        )

    emp, c_name = result
    return _to_response(emp, company_name=c_name)


def update_employee(
    db: Session,
    employee_id: int,
    employee_in: EmployeeUpdate,
    company_id: Optional[int] = None,
) -> EmployeeResponse:
    """Update employee details."""
    query = db.query(Employee).filter(Employee.id == employee_id)
    if company_id:
        query = query.filter(Employee.company_id == company_id)

    emp = query.first()
    if not emp:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee with ID {employee_id} not found.",
        )

    update_data = employee_in.model_dump(exclude_unset=True)
    if "email" in update_data and update_data["email"]:
        clean_email = update_data["email"].strip().lower()
        update_data["email"] = clean_email
        duplicate = (
            db.query(Employee)
            .filter(
                Employee.company_id == emp.company_id,
                Employee.email == clean_email,
                Employee.id != employee_id,
            )
            .first()
        )
        if duplicate:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"An employee with email '{clean_email}' is already registered in this organization.",
            )

    for field, value in update_data.items():
        if value is not None:
            if field == "password" and value:
                setattr(emp, "hashed_password", get_password_hash(value))
            elif isinstance(value, str):
                setattr(emp, field, value.strip())
            else:
                setattr(emp, field, value)

    db.commit()
    db.refresh(emp)

    company = db.query(Company).filter(Company.id == emp.company_id).first()
    return _to_response(emp, company_name=company.name if company else None)


def delete_employee(
    db: Session,
    employee_id: int,
    company_id: Optional[int] = None,
) -> dict:
    """Delete an employee and decrement company's active employee counter."""
    query = db.query(Employee).filter(Employee.id == employee_id)
    if company_id:
        query = query.filter(Employee.company_id == company_id)

    emp = query.first()
    if not emp:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee with ID {employee_id} not found.",
        )

    co_id = emp.company_id
    db.delete(emp)

    # Sync company employee count
    company = db.query(Company).filter(Company.id == co_id).first()
    if company:
        actual_count = db.query(Employee).filter(Employee.company_id == co_id).count()
        company.employee_count = max(0, actual_count)

    db.commit()
    return {"status": "success", "message": f"Employee {employee_id} deleted successfully."}
