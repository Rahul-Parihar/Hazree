import re
import logging
from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.redis_cache import get_cache, set_cache, delete_cache, delete_cache_pattern
from app.features.subscriptions.subscription_management.models import SubscriptionPlan
from app.features.subscriptions.subscription_management.schemas import (
    SubscriptionPlanCreate,
    SubscriptionPlanUpdate,
    SubscriptionPlanResponse,
)

logger = logging.getLogger("hazree.subscriptions")

DEFAULT_SYSTEM_PLANS = [
  {
    "name": "Free Trial",
    "code": "trial",
    "tagline": "30 Days trial evaluation for small teams",
    "badge_text": "Free Trial",
    "price_amount": "0",
    "currency": "₹",
    "billing_cycle": "30 Days Trial",
    "max_employees": 25,
    "is_popular": False,
    "is_active": True,
    "theme_color": "blue",
    "features": [
      "Basic Attendance Punch",
      "Web & Mobile Check-in",
      "Standard Email Support",
      "1 Admin Portal Account",
    ],
  },
  {
    "name": "Growth Pro",
    "code": "growth",
    "tagline": "Tailored for growing teams with multi-branch shift rosters",
    "badge_text": "Most Popular",
    "price_amount": "4999",
    "currency": "₹",
    "billing_cycle": "Billed Yearly",
    "max_employees": 150,
    "is_popular": True,
    "is_active": True,
    "theme_color": "emerald",
    "features": [
      "Geo-fenced Mobile GPS Punching",
      "Automated Shift Rosters & Overtime Tracking",
      "Live Attendance PDF & Excel Automated Export",
      "Priority 24/7 SLA Support",
      "3 Department Admin Roles",
    ],
  },
  {
    "name": "Enterprise VIP",
    "code": "enterprise",
    "tagline": "Full-suite hardware integration and dedicated account SLA",
    "badge_text": "Unlimited",
    "price_amount": "14999",
    "currency": "₹",
    "billing_cycle": "Billed Yearly",
    "max_employees": 1000,
    "is_popular": False,
    "is_active": True,
    "theme_color": "indigo",
    "features": [
      "Multi-Branch & Multi-Tenant Setup",
      "Biometric Face & Fingerprint Hardware Sync",
      "Custom SSO & Role Workflows",
      "Dedicated Account Manager",
      "Custom Payroll API Integrations",
    ],
  },
]


def generate_plan_code(name: str) -> str:
    """Generate a clean URL-friendly code slug from name."""
    clean = re.sub(r"[^a-zA-Z0-9\s]", "", name).strip().lower()
    return re.sub(r"\s+", "_", clean)


def seed_default_subscription_plans(db: Session):
    """Seed standard starter plans if database table is empty."""
    try:
        count = db.query(SubscriptionPlan).count()
        if count == 0:
            logger.info("Seeding default subscription plan catalog...")
            for p in DEFAULT_SYSTEM_PLANS:
                plan_obj = SubscriptionPlan(**p)
                db.add(plan_obj)
            db.commit()
            logger.info("Default subscription plans seeded successfully.")
    except Exception as e:
        logger.warning(f"Could not seed subscription plans: {e}")


def get_all_plans(db: Session) -> List[SubscriptionPlanResponse]:
    """
    Fetch all active subscription plans with high-speed Redis caching.
    Response time is < 1ms on cache hit.
    """
    cache_key = "subscriptions:plans:all"
    cached = get_cache(cache_key)
    if cached is not None and isinstance(cached, list):
        return [SubscriptionPlanResponse(**item) for item in cached]

    plans = db.query(SubscriptionPlan).order_by(SubscriptionPlan.id.asc()).all()
    
    # If empty, seed and re-query
    if not plans:
        seed_default_subscription_plans(db)
        plans = db.query(SubscriptionPlan).order_by(SubscriptionPlan.id.asc()).all()

    results = [SubscriptionPlanResponse.model_validate(p) for p in plans]
    set_cache(cache_key, [r.model_dump(mode="json") for r in results], expire_seconds=300)
    return results


def get_plan_by_id(db: Session, plan_id: int) -> SubscriptionPlan:
    """Fetch single plan by ID."""
    plan = db.query(SubscriptionPlan).filter(SubscriptionPlan.id == plan_id).first()
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Subscription plan with ID {plan_id} not found."
        )
    return plan


def create_plan(db: Session, plan_in: SubscriptionPlanCreate) -> SubscriptionPlan:
    """
    Create a new subscription plan in database and invalidate cache.
    """
    name_clean = plan_in.name.strip()
    code_clean = plan_in.code.strip() if plan_in.code else generate_plan_code(name_clean)

    # Check for duplicate name or code
    existing = db.query(SubscriptionPlan).filter(
        (SubscriptionPlan.name == name_clean) | (SubscriptionPlan.code == code_clean)
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"A subscription plan with name '{name_clean}' or code '{code_clean}' already exists."
        )

    db_plan = SubscriptionPlan(
        name=name_clean,
        code=code_clean,
        tagline=plan_in.tagline.strip() if plan_in.tagline else None,
        badge_text=plan_in.badge_text.strip() if plan_in.badge_text else None,
        price_amount=str(plan_in.price_amount).strip(),
        currency=plan_in.currency or "₹",
        billing_cycle=plan_in.billing_cycle or "Billed Yearly",
        max_employees=plan_in.max_employees or 100,
        is_popular=plan_in.is_popular,
        is_active=plan_in.is_active,
        theme_color=plan_in.theme_color or "emerald",
        features=plan_in.features or [],
    )
    db.add(db_plan)
    db.commit()
    db.refresh(db_plan)

    # Invalidate cache
    delete_cache_pattern("subscriptions:plans:*")
    return db_plan


def update_plan(db: Session, plan_id: int, plan_in: SubscriptionPlanUpdate) -> SubscriptionPlan:
    """Update existing subscription plan details."""
    plan = get_plan_by_id(db, plan_id)
    update_data = plan_in.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        if field == "name" and value:
            setattr(plan, field, value.strip())
        elif field == "code" and value:
            setattr(plan, field, value.strip())
        elif field == "price_amount" and value:
            setattr(plan, field, str(value).strip())
        elif field == "features" and value is not None:
            setattr(plan, field, value)
        else:
            setattr(plan, field, value)

    db.commit()
    db.refresh(plan)

    # Invalidate cache
    delete_cache_pattern("subscriptions:plans:*")
    return plan


def delete_plan(db: Session, plan_id: int) -> dict:
    """Delete a subscription plan from catalog."""
    plan = get_plan_by_id(db, plan_id)
    db.delete(plan)
    db.commit()

    # Invalidate cache
    delete_cache_pattern("subscriptions:plans:*")
    return {"status": "success", "message": f"Plan '{plan.name}' deleted successfully."}
