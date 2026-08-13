"""
Super Admin Features Package.
"""

from app.features.super_admin.super_admin_auth.models import AdminUser
from app.features.super_admin.super_admin_auth.router import router as super_admin_router
from app.features.super_admin.super_admin_auth.service import init_default_super_admin

__all__ = ["AdminUser", "super_admin_router", "init_default_super_admin"]
