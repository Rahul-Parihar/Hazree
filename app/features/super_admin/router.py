from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.config import settings
from app.core.database import get_db
from app.features.companies.models import Company
from app.features.super_admin.models import AdminUser

router = APIRouter(prefix="/super-admin", tags=["super_admin"])


@router.get("/")
async def read_super_admin(db: Session = Depends(get_db)):
    """Super Admin Overview endpoint with DB statistics."""
    db_connected = False
    company_count = 0
    admin_count = 0
    try:
        db.execute(text("SELECT 1"))
        db_connected = True
        company_count = db.query(Company).count()
        admin_count = db.query(AdminUser).count()
    except Exception as e:
        db_connected = False

    return {
        "message": f"Hello {settings.app_name} super admin",
        "debug": settings.debug,
        "admin_email": settings.admin_email,
        "database": {
            "connected": db_connected,
            "engine": "PostgreSQL",
            "database_name": settings.postgres_db,
            "total_companies": company_count,
            "total_admin_users": admin_count,
        }
    }


@router.get("/db-status")
async def db_status(db: Session = Depends(get_db)):
    """Check status of PostgreSQL connection."""
    try:
        result = db.execute(text("SELECT version();")).fetchone()
        return {
            "status": "online",
            "database_version": result[0] if result else "Unknown",
            "database_name": settings.postgres_db,
            "host": settings.postgres_server,
            "port": settings.postgres_port
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Database connection failed: {str(e)}"
        )
