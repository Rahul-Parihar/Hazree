from sqlalchemy import Column, Integer, String, Boolean, DateTime
from datetime import datetime, timezone
from app.core.database import Base


class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    admin_name = Column(String(255), nullable=True)
    email = Column(String(255), nullable=True, unique=True, index=True)
    phone = Column(String(50), nullable=True)
    hashed_password = Column(String(255), nullable=True)
    plan = Column(String(50), default="Growth", nullable=False)
    status = Column(String(50), default="Active", nullable=False)
    location = Column(String(255), nullable=True)
    max_employees = Column(Integer, default=100, nullable=False)
    employee_count = Column(Integer, default=0, nullable=False)
    renewal_date = Column(DateTime, nullable=True)
    logo = Column(String(500), nullable=True)
    shift_count = Column(Integer, default=1, nullable=False)
    shift_type = Column(String(100), default="1 Shift (General Day)", nullable=True)
    shift_timings = Column(String(500), nullable=True)
    saturday_policy = Column(String(50), default="ALL_WORKING", nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))



