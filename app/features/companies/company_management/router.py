from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.features.companies.company_management import service
from app.features.companies.company_management.schemas import CompanyCreate, CompanyResponse, CompanyUpdate

router = APIRouter(prefix="/companies", tags=["companies"])


@router.get("/", response_model=List[CompanyResponse])
async def read_companies(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Fetch all companies from database."""
    return service.get_all_companies(db, skip=skip, limit=limit)


@router.post("/", response_model=CompanyResponse, status_code=status.HTTP_201_CREATED)
async def create_company(company: CompanyCreate, db: Session = Depends(get_db)):
    """Create a new company."""
    return service.create_company(db, company)


@router.get("/{company_id}", response_model=CompanyResponse)
async def get_company(company_id: int, db: Session = Depends(get_db)):
    """Get company by ID."""
    return service.get_company_by_id(db, company_id)


@router.put("/{company_id}", response_model=CompanyResponse)
async def update_company(company_id: int, company_in: CompanyUpdate, db: Session = Depends(get_db)):
    """Update company details by ID."""
    return service.update_company(db, company_id, company_in)
