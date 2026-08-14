from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.features.companies.company_management import service
from app.features.companies.company_management.schemas import (
    CompanyCreate,
    CompanyResponse,
    CompanyUpdate,
    SubscriptionStatusResponse,
)
from app.features.super_admin.super_admin_auth.schemas import UserAuthResponse
from app.features.super_admin.super_admin_auth.service import get_current_super_admin, get_current_user

router = APIRouter(
    prefix="/companies",
    tags=["Company Management (Super Admin Only)"],
)


@router.get("/", response_model=List[CompanyResponse], summary="List All Companies")
async def read_companies(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_super_admin),
):
    """Fetch all registered companies (Super Admin only)."""
    return service.get_all_companies(db, skip=skip, limit=limit)


@router.post(
    "/",
    response_model=CompanyResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register New Company",
)
async def create_company(
    company: CompanyCreate,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_super_admin),
):
    """Register a new company on Hazree platform (Super Admin only)."""
    return service.create_company(db, company)


@router.get("/{company_id}", response_model=CompanyResponse, summary="Get Company by ID")
async def get_company(
    company_id: int,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_super_admin),
):
    """Get company details by ID (Super Admin only)."""
    return service.get_company_by_id(db, company_id)


@router.get(
    "/{company_id}/subscription-status",
    response_model=SubscriptionStatusResponse,
    summary="Get Company Subscription Status & 5-Day Expiry Alert",
)
async def get_company_subscription_status(
    company_id: int,
    db: Session = Depends(get_db),
    current_user: UserAuthResponse = Depends(get_current_user),
):
    """
    Fetch subscription expiration details and 5-day warning alert for the company side.
    Available to check if company subscription is expiring within 5 days or expired.
    """
    return service.get_company_subscription_status(db, company_id)


@router.put("/{company_id}", response_model=CompanyResponse, summary="Update Company Details")
async def update_company(
    company_id: int,
    company_in: CompanyUpdate,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_super_admin),
):
    """Update existing company details (Super Admin only)."""
    return service.update_company(db, company_id, company_in)


@router.delete("/{company_id}", summary="Delete Company")
async def delete_company(
    company_id: int,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_super_admin),
):
    """Delete a company from the system (Super Admin only)."""
    return service.delete_company(db, company_id)

