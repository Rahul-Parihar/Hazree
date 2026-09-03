import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

logger = logging.getLogger(__name__)

# Base class for SQLAlchemy ORM models
Base = declarative_base()


def get_engine():
    """
    Create high-performance SQLAlchemy Engine with connection pooling optimized
    for cloud PostgreSQL (Neon pooler).
    Keeps persistent warm connections with TCP keepalives to eliminate connection lag.
    """
    db_url = settings.sync_database_url
    connect_args = {
        "connect_timeout": 10,
        "application_name": "hazree_backend",
        "keepalives": 1,
        "keepalives_idle": 30,
        "keepalives_interval": 10,
        "keepalives_count": 5,
    }
    return create_engine(
        db_url,
        pool_size=15,
        max_overflow=25,
        pool_timeout=15,
        pool_recycle=1800,
        pool_pre_ping=False,
        connect_args=connect_args,
        echo=False,
    )


# Create engine and SessionLocal factory
engine = get_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db():
    """Ensure all database tables are created."""
    logger.info("Verifying and creating database tables on PostgreSQL...")
    # Explicitly import all models so SQLAlchemy registers all tables in Base.metadata
    import app.features.companies.company_management.models
    import app.features.companies.employee_management.models
    import app.features.companies.attendance_management.models
    import app.features.companies.leave_management.models
    import app.features.department.models
    import app.features.super_admin.super_admin_auth.models
    import app.features.subscriptions.subscription_management.models
    try:
        Base.metadata.create_all(bind=engine)
    except Exception as e:
        logger.warning(f"Note on Base.metadata.create_all: {e}")

    try:
        from sqlalchemy import text
        from app.core.security import get_password_hash
        with engine.connect() as conn:
            conn.execute(text("ALTER TABLE companies ADD COLUMN IF NOT EXISTS saturday_policy VARCHAR(50) DEFAULT 'ALL_WORKING';"))
            conn.execute(text("ALTER TABLE employees ADD COLUMN IF NOT EXISTS hashed_password VARCHAR(255);"))
            conn.execute(text("ALTER TABLE employees ADD COLUMN IF NOT EXISTS dob VARCHAR(50);"))
            conn.execute(text("ALTER TABLE employees ADD COLUMN IF NOT EXISTS assigned_shift VARCHAR(150) DEFAULT 'Shift 1: 09:00 AM - 06:00 PM';"))
            conn.execute(text("ALTER TABLE employees ADD COLUMN IF NOT EXISTS portal_access VARCHAR(50) DEFAULT 'NONE';"))
            conn.execute(text("ALTER TABLE employees ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{}'::jsonb;"))
            # Backfill any existing employees that have null hashed_password
            default_hashed = get_password_hash("Hazree@123")
            conn.execute(text(f"UPDATE employees SET hashed_password = '{default_hashed}' WHERE hashed_password IS NULL;"))
            # Backfill default date of birth for existing employees
            conn.execute(text("UPDATE employees SET dob = '1996-08-15' WHERE dob IS NULL;"))
            conn.execute(text("UPDATE employees SET assigned_shift = 'Shift 1: 09:00 AM - 06:00 PM' WHERE assigned_shift IS NULL OR assigned_shift = 'General Shift';"))
            # Backfill existing HR employees to HR_ADMIN portal_access
            conn.execute(text("UPDATE employees SET portal_access = 'HR_ADMIN', permissions = '{\"can_manual_punch\": true, \"can_manage_staff\": true, \"can_approve_leaves\": true, \"can_view_phone\": true}'::jsonb WHERE LOWER(role) LIKE '%hr%' AND (portal_access IS NULL OR portal_access = 'NONE');"))
            # Backfill existing Manager employees to MANAGER portal_access
            conn.execute(text("UPDATE employees SET portal_access = 'MANAGER', permissions = '{\"can_manual_punch\": true, \"can_manage_staff\": false, \"can_approve_leaves\": true, \"can_view_phone\": true}'::jsonb WHERE LOWER(role) LIKE '%manager%' AND (portal_access IS NULL OR portal_access = 'NONE');"))
            conn.commit()
    except Exception as e:
        logger.warning(f"Note on schema verification: {e}")
    logger.info("Database tables initialized successfully.")


def get_db():
    """Dependency for obtaining database session in FastAPI endpoints."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
