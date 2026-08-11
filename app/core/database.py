import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

logger = logging.getLogger(__name__)

# Base class for SQLAlchemy ORM models
Base = declarative_base()


def get_engine():
    """Create SQLAlchemy Engine with connection pooling suitable for cloud Postgres (Neon)"""
    db_url = settings.sync_database_url
    return create_engine(
        db_url,
        pool_pre_ping=True,
        pool_recycle=300,
        echo=settings.debug,
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
