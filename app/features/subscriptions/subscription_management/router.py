from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.features.super_admin.super_admin_auth.models import AdminUser
from app.features.super_admin.super_admin_auth.service import get_current_super_admin
from app.features.subscriptions.subscription_management import service
from app.features.subscriptions.subscription_management.schemas import (
    SubscriptionPlanCreate,
    SubscriptionPlanUpdate,
    SubscriptionPlanResponse,
)

router = APIRouter(prefix="/subscriptions", tags=["Subscription Plans"])


@router.get(
    "/plans",
    response_model=List[SubscriptionPlanResponse],
    summary="List All Subscription Plans",
    description="Fetches all subscription plan tiers from database. Cached in Redis for sub-millisecond response.",
)
def list_subscription_plans(
    db: Session = Depends(get_db),
) -> List[SubscriptionPlanResponse]:
    """Get all subscription plan tiers."""
    return service.get_all_plans(db)


@router.get(
    "/plans/{plan_id}",
    response_model=SubscriptionPlanResponse,
    summary="Get Subscription Plan by ID",
)
def get_subscription_plan(
    plan_id: int,
    db: Session = Depends(get_db),
) -> SubscriptionPlanResponse:
    """Get single subscription plan by ID."""
    return service.get_plan_by_id(db, plan_id)


@router.post(
    "/plans",
    response_model=SubscriptionPlanResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create New Subscription Plan",
    description="Super Admin action to create a new subscription plan tier with custom quotas and features.",
)
def create_subscription_plan(
    plan_in: SubscriptionPlanCreate,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_super_admin),
) -> SubscriptionPlanResponse:
    """Create new subscription plan."""
    return service.create_plan(db, plan_in)


@router.put(
    "/plans/{plan_id}",
    response_model=SubscriptionPlanResponse,
    summary="Update Subscription Plan",
    description="Super Admin action to modify subscription plan pricing, limits, and features.",
)
def update_subscription_plan(
    plan_id: int,
    plan_in: SubscriptionPlanUpdate,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_super_admin),
) -> SubscriptionPlanResponse:
    """Update subscription plan."""
    return service.update_plan(db, plan_id, plan_in)


@router.delete(
    "/plans/{plan_id}",
    summary="Delete Subscription Plan",
    description="Super Admin action to remove a subscription plan from catalog.",
)
def delete_subscription_plan(
    plan_id: int,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_super_admin),
):
    """Delete subscription plan."""
    return service.delete_plan(db, plan_id)
