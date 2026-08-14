from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


class SubscriptionPlanBase(BaseModel):
    name: str = Field(..., example="Growth Pro")
    code: Optional[str] = Field(None, example="growth_pro")
    tagline: Optional[str] = Field(None, example="Tailored for growing teams")
    badge_text: Optional[str] = Field(None, example="Most Popular")
    price_amount: str = Field(..., example="4999")
    currency: str = Field("₹", example="₹")
    billing_cycle: str = Field("Billed Yearly", example="Billed Yearly")
    max_employees: int = Field(100, example=150)
    is_popular: bool = Field(False, example=True)
    is_active: bool = Field(True, example=True)
    theme_color: str = Field("emerald", example="emerald")
    features: List[str] = Field(default_factory=list)


class SubscriptionPlanCreate(SubscriptionPlanBase):
    pass


class SubscriptionPlanUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    tagline: Optional[str] = None
    badge_text: Optional[str] = None
    price_amount: Optional[str] = None
    currency: Optional[str] = None
    billing_cycle: Optional[str] = None
    max_employees: Optional[int] = None
    is_popular: Optional[bool] = None
    is_active: Optional[bool] = None
    theme_color: Optional[str] = None
    features: Optional[List[str]] = None


class SubscriptionPlanResponse(SubscriptionPlanBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
