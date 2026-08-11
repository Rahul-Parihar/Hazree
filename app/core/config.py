import os
from pathlib import Path
from typing import Optional

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

    # Database Configuration (Loaded from .env)
    database_url: str = ""

    @property
    def sync_database_url(self) -> str:
        url = self.database_url or os.getenv("DATABASE_URL", "")
        if not url:
            raise ValueError("DATABASE_URL is not configured in .env file.")
        
        # Handle postgres:// vs postgresql:// dialect prefix
        if url.startswith("postgres://"):
            return url.replace("postgres://", "postgresql://", 1)
        return url

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


