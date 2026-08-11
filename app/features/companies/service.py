from sqlalchemy.orm import Session
from typing import List
from fastapi import HTTPException, status

from app.features.companies.models import Company
from app.features.companies.schemas import CompanyCreate, CompanyUpdate


def get_all_companies(db: Session, skip: int = 0, limit: int = 100) -> List[Company]:
    """Fetch all companies from PostgreSQL database with pagination."""
    return db.query(Company).offset(skip).limit(limit).all()


def get_company_by_id(db: Session, company_id: int) -> Company:
    """Fetch a single company by ID."""
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Company with ID {company_id} not found."
        )
    return company


def create_company(db: Session, company_in: CompanyCreate) -> Company:
    """Create a new company in PostgreSQL database."""
    existing = db.query(Company).filter(Company.code == company_in.code).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Company with code '{company_in.code}' already exists."
        )

    db_company = Company(
        name=company_in.name,
        code=company_in.code,
        email=company_in.email,
        phone=company_in.phone,
        is_active=company_in.is_active,
    )
    db.add(db_company)
    db.commit()
    db.refresh(db_company)
    return db_company


def update_company(db: Session, company_id: int, company_in: CompanyUpdate) -> Company:
    """Update existing company details."""
    company = get_company_by_id(db, company_id)
    update_data = company_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(company, field, value)
    db.commit()
    db.refresh(company)
    return company
