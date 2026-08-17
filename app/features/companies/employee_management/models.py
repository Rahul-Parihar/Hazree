from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from datetime import datetime, timezone
from app.core.database import Base


class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False, index=True)
    phone = Column(String(50), nullable=True)
    role = Column(String(100), nullable=False)
    department = Column(String(100), nullable=False)
    avatar = Column(String(500), nullable=True)
    hashed_password = Column(String(255), nullable=True)
    status = Column(String(50), default="Active", nullable=False)
    join_date = Column(String(50), nullable=True)
    dob = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
