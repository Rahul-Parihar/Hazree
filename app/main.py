import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.core.config import settings
from app.core.database import init_db, get_db, SessionLocal
import app.features.companies.models  # Register models
import app.features.super_admin.super_admin_auth.models  # Register models
from app.features.super_admin.super_admin_auth.service import init_default_super_admin

from app.features.companies.router import router as companies_router
from app.features.super_admin.super_admin_auth.router import router as super_admin_router

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup actions
    logger.info("Initializing database connection and tables...")
    try:
        init_db()
        logger.info("Database tables verified/created successfully.")
        
        # Seed default Super Admin account if not present
        db = SessionLocal()
        try:
            admin = init_default_super_admin(db)
            logger.info(f"Default Super Admin verified/created: {admin.email}")
        finally:
            db.close()

    except Exception as e:
        logger.error(f"Failed to initialize database or super admin: {e}")
    yield
    # Shutdown actions
    logger.info("Shutting down Hazree backend...")


app = FastAPI(
    title=settings.app_name,
    debug=settings.debug,
    lifespan=lifespan,
)

# CORS middleware for mobile/frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(companies_router)
app.include_router(super_admin_router)


@app.get("/")
async def root():
    return {
        "message": "Hazree backend is running",
        "app_name": settings.app_name,
        "database": "PostgreSQL",
        "docs_url": "/docs"
    }


@app.get("/health")
async def health_check(db: Session = Depends(get_db)):
    db_status = "unhealthy"
    try:
        db.execute(text("SELECT 1"))
        db_status = "healthy"
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"
    
    return {
        "status": "ok" if db_status == "healthy" else "degraded",
        "database_status": db_status,
        "app_name": settings.app_name
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
