from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_
from fastapi import HTTPException, status

from app.features.companies.department_management.models import Department
from app.features.companies.department_management.schemas import DepartmentCreate, DepartmentResponse
from app.features.companies.company_management.models import Company


DEFAULT_DEPARTMENTS = [
    "Engineering & Development",
    "Operations & Logistics",
    "Sales & Marketing",
    "Human Resources (HR)",
    "Finance & Accounts",
    "Product & UI/UX Design",
    "Customer Support & Success",
    "Executive Management",
    "Quality Assurance (QA)",
    "Security & Housekeeping",
]


def seed_default_departments(db: Session):
    """Seed initial global standard industry departments if table is empty."""
    existing_count = db.query(Department).filter(Department.company_id.is_(None)).count()
    if existing_count == 0:
        for dept_name in DEFAULT_DEPARTMENTS:
            dept = Department(
                name=dept_name,
                description=f"Standard {dept_name} organization department",
                company_id=None,
                created_by_role="SUPER_ADMIN",
                is_active=True,
            )
            db.add(dept)
        db.commit()


def get_departments(
    db: Session,
    company_id: Optional[int] = None,
    include_inactive: bool = False,
) -> List[DepartmentResponse]:
    """Retrieve global departments and company-specific departments."""
    query = db.query(Department)

    if not include_inactive:
        query = query.filter(Department.is_active.is_(True))

    if company_id is not None:
        query = query.filter(
            or_(
                Department.company_id.is_(None),
                Department.company_id == company_id,
            )
        )
    else:
        query = query.filter(Department.company_id.is_(None))

    departments = query.order_by(Department.name.asc()).all()

    result = []
    for d in departments:
        comp_name = d.company.name if d.company else "Global Standard"
        result.append(
            DepartmentResponse(
                id=d.id,
                name=d.name,
                description=d.description,
                company_id=d.company_id,
                company_name=comp_name,
                created_by_role=d.created_by_role,
                is_active=d.is_active,
                created_at=d.created_at,
            )
        )
    return result


def create_department(
    db: Session,
    dept_in: DepartmentCreate,
    created_by_role: str = "SUPER_ADMIN",
) -> DepartmentResponse:
    """Create a new department (Global or Company-specific)."""
    # Check if duplicate name exists for this scope
    existing_query = db.query(Department).filter(
        Department.name.ilike(dept_in.name.strip())
    )
    if dept_in.company_id:
        existing_query = existing_query.filter(
            or_(
                Department.company_id == dept_in.company_id,
                Department.company_id.is_(None),
            )
        )
    else:
        existing_query = existing_query.filter(Department.company_id.is_(None))

    existing = existing_query.first()
    if existing:
        # Return existing if already present
        comp_name = existing.company.name if existing.company else "Global Standard"
        return DepartmentResponse(
            id=existing.id,
            name=existing.name,
            description=existing.description,
            company_id=existing.company_id,
            company_name=comp_name,
            created_by_role=existing.created_by_role,
            is_active=existing.is_active,
            created_at=existing.created_at,
        )

    new_dept = Department(
        name=dept_in.name.strip(),
        description=dept_in.description.strip() if dept_in.description else None,
        company_id=dept_in.company_id,
        created_by_role=created_by_role,
        is_active=True,
    )
    db.add(new_dept)
    db.commit()
    db.refresh(new_dept)

    comp_name = new_dept.company.name if new_dept.company else "Global Standard"
    return DepartmentResponse(
        id=new_dept.id,
        name=new_dept.name,
        description=new_dept.description,
        company_id=new_dept.company_id,
        company_name=comp_name,
        created_by_role=new_dept.created_by_role,
        is_active=new_dept.is_active,
        created_at=new_dept.created_at,
    )


def delete_department(db: Session, dept_id: int) -> bool:
    """Delete or deactivate a department."""
    dept = db.query(Department).filter(Department.id == dept_id).first()
    if not dept:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Department with ID {dept_id} not found.",
        )
    db.delete(dept)
    db.commit()
    return True
