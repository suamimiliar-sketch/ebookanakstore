"""Central configuration, loaded from environment variables / .env."""
from functools import lru_cache
from typing import List
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    APP_NAME: str = "ebookanakstore-api"
    APP_ENV: str = "development"
    APP_VERSION: str = "2.0.0"
    LOG_LEVEL: str = "INFO"

    DATABASE_URL: str = "sqlite:///./ebookanakstore.db"

    JWT_SECRET: str = "dev-secret-change-me"
    JWT_ALG: str = "HS256"
    JWT_TTL_MINUTES: int = 480
    ADMIN_BOOTSTRAP_EMAIL: str = "admin@ebookanak.store"
    ADMIN_BOOTSTRAP_PASSWORD: str = "change-me"

    CORS_ORIGINS: str = "http://localhost:3000"

    MIDTRANS_SERVER_KEY: str = ""
    MIDTRANS_CLIENT_KEY: str = ""
    MIDTRANS_IS_PRODUCTION: bool = False

    CLOUDINARY_CLOUD_NAME: str = ""
    CLOUDINARY_API_KEY: str = ""
    CLOUDINARY_API_SECRET: str = ""

    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    NOTIFY_FROM: str = ""

    @property
    def cors_list(self) -> List[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
