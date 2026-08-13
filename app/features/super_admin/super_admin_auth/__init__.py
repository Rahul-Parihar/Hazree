"""
Super Admin Authentication and Management Feature Module.
"""

from app.features.super_admin.super_admin_auth.models import AdminUser
from app.features.super_admin.super_admin_auth.router import router
from app.features.super_admin.super_admin_auth.service import init_default_super_admin

__all__ = ["AdminUser", "router", "init_default_super_admin"]
