from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.features.companies.models import Company
from app.features.companies.schemas import CompanyCreate, CompanyResponse, CompanyUpdate
from app.shared.utils import get_welcome_message

router = APIRouter(prefix="/companies", tags=["companies"])


@router.get("/", response_model=List[CompanyResponse])
async def read_companies(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Fetch all companies from PostgreSQL database."""
    companies = db.query(Company).offset(skip).limit(limit).all()
    return companies


@router.post("/", response_model=CompanyResponse, status_code=status.HTTP_201_CREATED)
async def create_company(company: CompanyCreate, db: Session = Depends(get_db)):
    """Create a new company in PostgreSQL database."""
    existing = db.query(Company).filter(Company.code == company.code).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Company with code '{company.code}' already exists."
        )
    
    db_company = Company(
        name=company.name,
        code=company.code,
        email=company.email,
        phone=company.phone,
        is_active=company.is_active,
    )
    db.add(db_company)
    db.commit()
    db.refresh(db_company)
    return db_company


@router.get("/{company_id}", response_model=CompanyResponse)
async def get_company(company_id: int, db: Session = Depends(get_db)):
    """Get company by ID."""
    db_company = db.query(Company).filter(Company.id == company_id).first()
    if not db_company:
        raise HTTPException(status_code=404, detail="Company not found")
    return db_company
