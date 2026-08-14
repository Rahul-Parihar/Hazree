import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
from slowapi.errors import RateLimitExceeded
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.config import settings
from app.core.database import init_db, get_db, SessionLocal
from app.core.exception_handlers import (
    http_exception_handler,
    rate_limit_exceeded_handler,
    unhandled_exception_handler,
    validation_exception_handler,
)
from app.core.rate_limiter import rate_limiter
from app.core.redis_cache import get_redis_client, is_redis_online
from app.middlewares import (
    AuthProtectionMiddleware,
    RequestLoggingMiddleware,
    SecurityHeadersMiddleware,
)

import app.features.companies.company_management.models  # Register models
import app.features.companies.employee_management.models  # Register models
import app.features.super_admin.super_admin_auth.models  # Register models
import app.features.subscriptions.subscription_management.models  # Register models
from app.features.super_admin.super_admin_auth.service import init_default_super_admin
from app.features.subscriptions.subscription_management.service import seed_default_subscription_plans
from app.features.companies.company_management.service import seed_default_companies

from app.features.companies.company_management.router import router as companies_router
from app.features.companies.employee_management.router import router as employees_router
from app.features.super_admin.super_admin_auth.router import router as super_admin_router
from app.features.subscriptions.subscription_management.router import router as subscriptions_router

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("hazree.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup actions
    logger.info("Initializing database connection and tables...")
    try:
        init_db()
        logger.info("Database tables verified/created successfully.")

        # Initialize Redis Cache connection pool
        redis_client = get_redis_client()
        if redis_client and is_redis_online():
            logger.info("Redis cache pool connected and ready.")
        else:
            logger.warning("Redis cache is offline or disabled. Running in database fallback mode.")

        # Seed default Super Admin account & subscription plans
        db = SessionLocal()
        try:
            admin = init_default_super_admin(db)
            logger.info(f"Default Super Admin verified/created: {admin.email}")
            seed_default_subscription_plans(db)
        finally:
            db.close()

    except Exception as e:
        logger.error(f"Failed during application startup: {e}", exc_info=True)
    yield
    # Shutdown actions
    logger.info("Shutting down Hazree backend...")


app = FastAPI(
    title=settings.app_name,
    debug=settings.debug,
    lifespan=lifespan,
)

# Attach Rate Limiter to FastAPI state
app.state.limiter = rate_limiter

# ---------------------------------------------------------------------------
# Global Exception Handlers (500 Shield, 429 Rate Limit, 422 Validation)
# ---------------------------------------------------------------------------
app.add_exception_handler(RateLimitExceeded, rate_limit_exceeded_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(StarletteHTTPException, http_exception_handler)
app.add_exception_handler(Exception, unhandled_exception_handler)

from fastapi.middleware.gzip import GZipMiddleware

# ---------------------------------------------------------------------------
# Middlewares Execution Chain (Added in reverse order of execution)
# ---------------------------------------------------------------------------
# 1. Global Route Protection Middleware (Protects private APIs after login)
app.add_middleware(AuthProtectionMiddleware)

# 2. GZip Compression Middleware (High speed payload delivery)
app.add_middleware(GZipMiddleware, minimum_size=500)

# 3. OWASP Security Defense Headers Middleware
app.add_middleware(SecurityHeadersMiddleware)

# 4. Performance & Execution Timing Middleware
app.add_middleware(RequestLoggingMiddleware)

# 5. Dynamic CORS Middleware (Outermost - ensures CORS headers on ALL responses including 401/500/OPTIONS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_cors_origins,
    allow_origin_regex=settings.cors_origin_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# ---------------------------------------------------------------------------
# Register Feature Routers
# ---------------------------------------------------------------------------
app.include_router(companies_router)
app.include_router(employees_router)
app.include_router(super_admin_router)
app.include_router(subscriptions_router)


@app.get("/")
async def root():
    return {
        "message": "Hazree backend is running",
        "app_name": settings.app_name,
        "database": "PostgreSQL",
        "redis_cache": "online" if is_redis_online() else "offline",
        "docs_url": "/docs",
    }


@app.get("/health")
async def health_check(db: Session = Depends(get_db)):
    db_status = "unhealthy"
    try:
        db.execute(text("SELECT 1"))
        db_status = "healthy"
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"

    redis_status = "healthy" if is_redis_online() else "offline"

    overall_status = "ok" if db_status == "healthy" else "degraded"

    return {
        "status": overall_status,
        "database_status": db_status,
        "redis_status": redis_status,
        "app_name": settings.app_name,
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.reload,
    )