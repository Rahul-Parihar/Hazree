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
    secret_key: str = "hazree_super_secure_jwt_secret_key_2026_entropy_auth_protection"

    # Server Settings (Loaded from .env)
    host: str = "0.0.0.0"
    port: int = 8000
    reload: bool = True


    # JWT & Auth Security Settings
    access_token_expire_minutes: int = 15
    refresh_token_expire_days: int = 7
    jwt_algorithm: str = "HS256"
    jwt_issuer: str = "hazree-auth-server"
    jwt_audience: str = "hazree-admin-portal"

    # Cookie Settings
    cookie_secure: bool = False  # Set to True in production with HTTPS
    cookie_samesite: str = "lax"  # 'lax' allows secure local dev & cross-site navigation
    cookie_domain: Optional[str] = None

    # CORS Settings (Loaded from .env)
    cors_origins: str = "http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,http://127.0.0.1:3001,http://localhost:5173,http://127.0.0.1:5173"
    cors_origin_regex: Optional[str] = r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$"

    @property
    def allowed_cors_origins(self) -> list[str]:
        if not self.cors_origins:
            return ["http://localhost:3000"]
        stripped = self.cors_origins.strip()
        if stripped.startswith("[") and stripped.endswith("]"):
            import json
            try:
                return json.loads(stripped)
            except Exception:
                pass
        return [origin.strip() for origin in stripped.split(",") if origin.strip()]



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
