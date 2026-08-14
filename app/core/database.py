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
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables initialized successfully.")


def get_db():
    """Dependency for obtaining database session in FastAPI endpoints."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
