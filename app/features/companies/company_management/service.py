from sqlalchemy.orm import Session
from typing import List
from fastapi import HTTPException, status

from app.core.redis_cache import delete_cache
from app.features.companies.company_management.models import Company
from app.features.companies.company_management.schemas import CompanyCreate, CompanyUpdate


from datetime import datetime, timezone, timedelta
from app.core.security import get_password_hash


def compute_subscription_metadata(company: Company) -> dict:
    """
    Compute subscription expiration status and 5-day warning alerts for company.
    """
    days_until_renewal = None
    is_expiring_soon = False
    is_expired = False
    alert_message = None
    alert_type = "none"

    if company.renewal_date:
        now = datetime.now(timezone.utc)
        renewal_dt = company.renewal_date if company.renewal_date.tzinfo else company.renewal_date.replace(tzinfo=timezone.utc)
        delta = renewal_dt - now
        days_until_renewal = delta.days

        if days_until_renewal < 0:
            is_expired = True
            alert_type = "danger"
            alert_message = f"Subscription Expired: Your {company.plan} plan expired {abs(days_until_renewal)} days ago. Please renew immediately to avoid service interruption."
        elif days_until_renewal <= 5:
            is_expiring_soon = True
            alert_type = "warning"
            if days_until_renewal == 0:
                alert_message = f"Urgent: Your {company.plan} subscription expires today! Renew now to prevent service cutoff."
            elif days_until_renewal == 1:
                alert_message = f"Urgent: Your {company.plan} subscription expires tomorrow ({renewal_dt.strftime('%d %b %Y')}). Please renew your plan."
            else:
                alert_message = f"Subscription Notice: Your {company.plan} subscription will expire in {days_until_renewal} days ({renewal_dt.strftime('%d %b %Y')}). Please renew your plan."

    return {
        "days_until_renewal": days_until_renewal,
        "is_subscription_expiring_soon": is_expiring_soon,
        "is_subscription_expired": is_expired,
        "subscription_alert": alert_message,
        "subscription_alert_type": alert_type,
    }


def enrich_company_response(company: Company) -> Company:
    """Attach computed subscription metadata directly onto the company instance."""
    meta = compute_subscription_metadata(company)
    company.days_until_renewal = meta["days_until_renewal"]
    company.is_subscription_expiring_soon = meta["is_subscription_expiring_soon"]
    company.is_subscription_expired = meta["is_subscription_expired"]
    company.subscription_alert = meta["subscription_alert"]
    company.subscription_alert_type = meta["subscription_alert_type"]
    return company


def get_all_companies(db: Session, skip: int = 0, limit: int = 100) -> List[Company]:
    """Fetch all companies from PostgreSQL database with pagination."""
    companies = db.query(Company).order_by(Company.id.desc()).offset(skip).limit(limit).all()
    for company in companies:
        enrich_company_response(company)
    return companies


def get_company_by_id(db: Session, company_id: int) -> Company:
    """Fetch a single company by ID."""
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Company with ID {company_id} not found."
        )
    return enrich_company_response(company)


def get_company_subscription_status(db: Session, company_id: int) -> dict:
    """Get standalone subscription status and 5-day expiry alert for company portal."""
    company = get_company_by_id(db, company_id)
    meta = compute_subscription_metadata(company)
    return {
        "company_id": company.id,
        "company_name": company.name,
        "plan": company.plan,
        "status": company.status,
        "renewal_date": company.renewal_date,
        "days_until_renewal": meta["days_until_renewal"],
        "is_expiring_soon": meta["is_subscription_expiring_soon"],
        "is_expired": meta["is_subscription_expired"],
        "alert_message": meta["subscription_alert"],
        "alert_type": meta["subscription_alert_type"],
    }


def create_company(db: Session, company_in: CompanyCreate) -> Company:
    """
    Register a new company in the platform (Super Admin action).
    Saves company details, admin credentials (hashed password), and automatically invalidates dashboard cache.
    """
    # Check if company with exact same email already exists
    if company_in.email and company_in.email.strip():
        email_clean = company_in.email.strip().lower()
        existing = db.query(Company).filter(Company.email == email_clean).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Company with email '{email_clean}' already exists."
            )

    hashed_pwd = get_password_hash(company_in.password) if company_in.password else None

    # Default renewal date to 1 year ahead if not supplied
    renewal_dt = company_in.renewal_date or (datetime.now(timezone.utc) + timedelta(days=365))

    db_company = Company(
        name=company_in.name.strip(),
        admin_name=company_in.admin_name.strip() if company_in.admin_name else None,
        email=company_in.email.strip().lower() if company_in.email else None,
        phone=company_in.phone.strip() if company_in.phone else None,
        hashed_password=hashed_pwd,
        plan=company_in.plan or "Growth",
        status=company_in.status or "Active",
        location=company_in.location.strip() if company_in.location else None,
        max_employees=company_in.max_employees or 100,
        employee_count=company_in.employee_count or 0,
        renewal_date=renewal_dt,
        logo=company_in.logo,
        is_active=company_in.is_active,
    )
    db.add(db_company)
    db.commit()
    db.refresh(db_company)

    # Invalidate dashboard overview cache in Redis
    delete_cache("super_admin:overview")

    return enrich_company_response(db_company)


def update_company(db: Session, company_id: int, company_in: CompanyUpdate) -> Company:
    """Update existing company details."""
    company = get_company_by_id(db, company_id)
    update_data = company_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if field == "email" and value:
            setattr(company, field, value.strip().lower())
        elif field == "name" and value:
            setattr(company, field, value.strip())
        elif field == "admin_name" and value:
            setattr(company, field, value.strip() if value else None)
        elif field == "location" and value:
            setattr(company, field, value.strip() if value else None)
        elif field == "password" and value:
            setattr(company, "hashed_password", get_password_hash(value))
        else:
            setattr(company, field, value)
    db.commit()
    db.refresh(company)

    # Invalidate dashboard overview cache in Redis
    delete_cache("super_admin:overview")

    return enrich_company_response(company)


def delete_company(db: Session, company_id: int) -> dict:
    """Delete a company from the platform (Super Admin action)."""
    company = get_company_by_id(db, company_id)
    db.delete(company)
    db.commit()

    # Invalidate dashboard overview cache in Redis
    delete_cache("super_admin:overview")

    return {"status": "success", "message": f"Company '{company.name}' deleted successfully."}

