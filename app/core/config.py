import os
from pathlib import Path
from typing import Optional
from urllib.parse import urlparse

try:
    from dotenv import load_dotenv
    HAS_DOTENV = True
except ImportError:
    HAS_DOTENV = False

try:
    from pydantic_settings import BaseSettings, SettingsConfigDict
    HAS_PYDANTIC_SETTINGS = True
except ImportError:
    from pydantic import BaseSettings
    HAS_PYDANTIC_SETTINGS = False

# Path to the .env file in the backend root
BASE_DIR = Path(__file__).resolve().parent.parent.parent
ENV_PATH = BASE_DIR / ".env"

if HAS_DOTENV and ENV_PATH.exists():
    load_dotenv(dotenv_path=ENV_PATH)


class Settings(BaseSettings):
    # App Settings (Loaded from .env)
    app_name: str = "Hazree Backend"
    admin_email: str = "admin@example.com"
    debug: bool = True
    secret_key: str = "hazree_default_secret_key_change_in_production"

    # Database Configuration (Loaded from .env)
    database_url: Optional[str] = None

    # Individual PostgreSQL settings
    postgres_user: str = "postgres"
    postgres_password: str = "postgres"
    postgres_server: str = "localhost"
    postgres_port: str = "5432"
    postgres_db: str = "hazree_db"

    @property
    def sync_database_url(self) -> str:
        url = self.database_url or os.getenv("DATABASE_URL", "")
        if not url:
            url = f"postgresql://{self.postgres_user}:{self.postgres_password}@{self.postgres_server}:{self.postgres_port}/{self.postgres_db}"
        
        # Handle postgres:// vs postgresql:// dialect prefix
        if url.startswith("postgres://"):
            return url.replace("postgres://", "postgresql://", 1)
        return url

    def model_post_init(self, __context) -> None:
        """Automatically parse database_url to populate host, db, port if database_url is provided."""
        super().model_post_init(__context)
        url = self.database_url or os.getenv("DATABASE_URL", "")
        if url:
            try:
                parsed = urlparse(url)
                if parsed.hostname:
                    self.postgres_server = parsed.hostname
                if parsed.port:
                    self.postgres_port = str(parsed.port)
                if parsed.path and len(parsed.path) > 1:
                    self.postgres_db = parsed.path.lstrip("/")
                if parsed.username:
                    self.postgres_user = parsed.username
            except Exception:
                pass

    if HAS_PYDANTIC_SETTINGS:
        model_config = SettingsConfigDict(
            env_file=str(ENV_PATH),
            env_file_encoding="utf-8",
            extra="ignore",
            case_sensitive=False,
        )
    else:
        class Config:
            env_file = str(ENV_PATH)
            env_file_encoding = "utf-8"
            extra = "ignore"
            case_sensitive = False


settings = Settings()
