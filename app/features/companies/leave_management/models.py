from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from datetime import datetime, timezone
from app.core.database import Base


class LeaveRequest(Base):
    __tablename__ = "leave_requests"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id", ondelete="SET NULL"), nullable=True, index=True)
    employee_name = Column(String(255), nullable=False)
    employee_avatar = Column(String(500), nullable=True)
    department = Column(String(100), nullable=False)
    leave_type = Column(String(50), nullable=False, default="Casual")  # Paid, Sick, Casual, Unpaid
    start_date = Column(String(50), nullable=False)
    end_date = Column(String(50), nullable=False)
    days_count = Column(Integer, nullable=False, default=1)
    reason = Column(String(500), nullable=False)
    status = Column(String(50), nullable=False, default="Pending")  # Pending, Approved, Rejected
    applied_on = Column(String(50), nullable=False)
    admin_notes = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
