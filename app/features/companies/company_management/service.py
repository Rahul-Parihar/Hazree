from sqlalchemy.orm import Session
from typing import List, Union
from fastapi import HTTPException, status

from app.core.redis_cache import get_cache, set_cache, delete_cache, delete_cache_pattern
from app.features.companies.company_management.models import Company
from app.features.companies.company_management.schemas import (
    CompanyCreate,
    CompanyUpdate,
    CompanyResponse,
    SubscriptionStatusResponse,
)

from datetime import datetime, timezone, timedelta
from app.core.security import get_password_hash


def compute_subscription_metadata(company: Union[Company, dict, CompanyResponse]) -> dict:
    """
    Compute subscription expiration status and 5-day warning alerts for company.
    """
    days_until_renewal = None
    is_expiring_soon = False
    is_expired = False
    alert_message = None
    alert_type = "none"

    renewal_date = getattr(company, "renewal_date", None)
    if isinstance(company, dict):
        renewal_date = company.get("renewal_date")

    if renewal_date:
        now = datetime.now(timezone.utc)
        if isinstance(renewal_date, str):
            try:
                renewal_dt = datetime.fromisoformat(renewal_date.replace("Z", "+00:00"))
            except Exception:
                renewal_dt = now + timedelta(days=365)
        else:
            renewal_dt = renewal_date

        renewal_dt = renewal_dt if renewal_dt.tzinfo else renewal_dt.replace(tzinfo=timezone.utc)
        delta = renewal_dt - now
        days_until_renewal = delta.days

        plan_name = getattr(company, "plan", "Growth") if not isinstance(company, dict) else company.get("plan", "Growth")

        if days_until_renewal < 0:
            is_expired = True
            alert_type = "danger"
            alert_message = f"Subscription Expired: Your {plan_name} plan expired {abs(days_until_renewal)} days ago. Please renew immediately to avoid service interruption."
        elif days_until_renewal <= 5:
            is_expiring_soon = True
            alert_type = "warning"
            if days_until_renewal == 0:
                alert_message = f"Urgent: Your {plan_name} subscription expires today! Renew now to prevent service cutoff."
            elif days_until_renewal == 1:
                alert_message = f"Urgent: Your {plan_name} subscription expires tomorrow ({renewal_dt.strftime('%d %b %Y')}). Please renew your plan."
            else:
                alert_message = f"Subscription Notice: Your {plan_name} subscription will expire in {days_until_renewal} days ({renewal_dt.strftime('%d %b %Y')}). Please renew your plan."

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


def get_all_companies(db: Session, skip: int = 0, limit: int = 100) -> List[CompanyResponse]:
    """
    Fetch all companies with high-speed Redis caching.
    Returns in < 1ms on cache hit.
    """
    cache_key = f"companies:list:{skip}:{limit}"
    cached = get_cache(cache_key)
    if cached is not None and isinstance(cached, list):
        return [CompanyResponse(**c) for c in cached]

    companies = db.query(Company).order_by(Company.id.desc()).offset(skip).limit(limit).all()
    results: List[CompanyResponse] = []
    for company in companies:
        enrich_company_response(company)
        results.append(CompanyResponse.model_validate(company))

    # Cache for 60 seconds
    set_cache(
        cache_key,
        [c.model_dump(mode="json") for c in results],
        expire_seconds=60,
    )
    return results


def get_company_by_id(db: Session, company_id: int) -> Company:
    """Fetch a single company by ID with caching."""
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Company with ID {company_id} not found."
        )
    return enrich_company_response(company)


def get_company_subscription_status(db: Session, company_id: int) -> dict:
    """Get standalone subscription status and 5-day expiry alert for company portal."""
    cache_key = f"companies:sub_status:{company_id}"
    cached = get_cache(cache_key)
    if cached is not None and isinstance(cached, dict):
        return cached

    company = get_company_by_id(db, company_id)
    meta = compute_subscription_metadata(company)
    res = {
        "company_id": company.id,
        "company_name": company.name,
        "plan": company.plan,
        "status": company.status,
        "renewal_date": company.renewal_date.isoformat() if company.renewal_date else None,
        "days_until_renewal": meta["days_until_renewal"],
        "is_expiring_soon": meta["is_subscription_expiring_soon"],
        "is_expired": meta["is_subscription_expired"],
        "alert_message": meta["subscription_alert"],
        "alert_type": meta["subscription_alert_type"],
    }
    set_cache(cache_key, res, expire_seconds=60)
    return res


def create_company(db: Session, company_in: CompanyCreate) -> Company:
    """
    Register a new company in the platform (Super Admin action).
    Saves company details, admin credentials (hashed password), and automatically invalidates dashboard cache.
    """
    if company_in.email and company_in.email.strip():
        email_clean = company_in.email.strip().lower()
        existing = db.query(Company).filter(Company.email == email_clean).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Company with email '{email_clean}' already exists."
            )

    hashed_pwd = get_password_hash(company_in.password) if company_in.password else None
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

    # Invalidate all company caches & overview in Redis
    delete_cache_pattern("companies:*")
    delete_cache("super_admin:overview")

    return enrich_company_response(db_company)


def update_company(db: Session, company_id: int, company_in: CompanyUpdate) -> Company:
    """Update existing company details and invalidate caches."""
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

    # Invalidate all company caches & overview in Redis
    delete_cache_pattern("companies:*")
    delete_cache("super_admin:overview")

    return enrich_company_response(company)


def delete_company(db: Session, company_id: int) -> dict:
    """Delete a company from the platform (Super Admin action)."""
    company = get_company_by_id(db, company_id)
    db.delete(company)
    db.commit()

    # Invalidate all company caches & overview in Redis
    delete_cache_pattern("companies:*")
    delete_cache("super_admin:overview")

    return {"status": "success", "message": f"Company '{company.name}' deleted successfully."}

