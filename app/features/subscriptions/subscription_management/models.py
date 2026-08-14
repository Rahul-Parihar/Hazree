from datetime import datetime, timezone
from sqlalchemy import Boolean, Column, DateTime, Integer, String, JSON, Text

from app.core.database import Base


class SubscriptionPlan(Base):
    """
    SQLAlchemy model representing a Tiered Subscription Plan.
    Persisted in PostgreSQL database and cached in Redis.
    """
    __tablename__ = "subscription_plans"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, nullable=False, index=True)
    code = Column(String(100), unique=True, nullable=False, index=True)
    tagline = Column(String(500), nullable=True)
    badge_text = Column(String(100), nullable=True)
    price_amount = Column(String(100), nullable=False, default="0")
    currency = Column(String(10), default="₹", nullable=False)
    billing_cycle = Column(String(100), default="Billed Yearly", nullable=False)
    max_employees = Column(Integer, default=100, nullable=False)
    is_popular = Column(Boolean, default=False, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    theme_color = Column(String(50), default="emerald", nullable=False)
    features = Column(JSON, default=list, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    def __repr__(self) -> str:
        return f"<SubscriptionPlan(id={self.id}, name='{self.name}', code='{self.code}', price='{self.currency}{self.price_amount}')>"
