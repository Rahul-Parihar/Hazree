from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from datetime import datetime, timezone
from app.core.database import Base


class Attendance(Base):
    __tablename__ = "attendance_records"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id", ondelete="SET NULL"), nullable=True, index=True)
    employee_name = Column(String(255), nullable=False)
    employee_avatar = Column(String(500), nullable=True)
    department = Column(String(100), nullable=False)
    date = Column(String(50), nullable=False, index=True)  # Format: YYYY-MM-DD
    check_in_time = Column(String(50), nullable=False, default="09:00 AM")
    check_out_time = Column(String(50), nullable=True, default="--")
    status = Column(String(50), nullable=False, default="Present")  # Present, Late, Absent, Half Day
    work_hours = Column(String(50), nullable=True, default="Active")
    location = Column(String(255), nullable=True, default="Office Premises (Verified)")
    device = Column(String(100), nullable=True, default="Web Portal Punch")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
