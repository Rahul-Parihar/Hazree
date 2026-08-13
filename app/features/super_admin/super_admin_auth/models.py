from datetime import datetime, timezone
from sqlalchemy import Boolean, Column, DateTime, Integer, String

from app.core.database import Base


class AdminUser(Base):
    """
    SQLAlchemy model representing a Super Administrator account.
    """
    __tablename__ = "admin_users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=True)
    hashed_password = Column(String(255), nullable=False)
    is_super_admin = Column(Boolean, default=True, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    def __repr__(self) -> str:
        return f"<AdminUser(id={self.id}, email='{self.email}', is_active={self.is_active}, is_super_admin={self.is_super_admin})>"
