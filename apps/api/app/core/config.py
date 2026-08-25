import os
from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    JobPilot application configuration.
    Reads from environment variables and .env file.
    """
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    # Core Application
    APP_NAME: str = "JobPilot"
    APP_ENV: str = "development"
    DEBUG: bool = True
    PORT: int = 8000
    SECRET_KEY: str = "jobpilot-dev-insecure-secret-key-change-in-production-32bytes"
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000,http://localhost:8000"

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./jobpilot.db"
    DATABASE_ECHO: bool = False

    # Cache & Celery
    REDIS_URL: str = "redis://localhost:6379/0"
    CELERY_BROKER_URL: str = "redis://localhost:6379/0"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/0"

    # Object Storage
    STORAGE_BACKEND: str = "local"
    STORAGE_LOCAL_ROOT: str = "./storage"
    STORAGE_S3_BUCKET: str = "jobpilot-artifacts"
    STORAGE_S3_ENDPOINT: Optional[str] = "http://localhost:9000"
    STORAGE_S3_ACCESS_KEY: Optional[str] = "minioadmin"
    STORAGE_S3_SECRET_KEY: Optional[str] = "minioadmin"

    # AI Gateway
    AI_PROVIDER: str = "mock"  # mock, openai, anthropic
    OPENAI_API_KEY: Optional[str] = None
    ANTHROPIC_API_KEY: Optional[str] = None
    DEFAULT_EMBEDDING_MODEL: str = "text-embedding-3-small"
    DEFAULT_COMPLETION_MODEL: str = "gpt-4o-mini"

    # Source Connectors OAuth
    GITHUB_CLIENT_ID: Optional[str] = None
    GITHUB_CLIENT_SECRET: Optional[str] = None
    LINKEDIN_CLIENT_ID: Optional[str] = None
    LINKEDIN_CLIENT_SECRET: Optional[str] = None

    @property
    def cors_origins(self) -> List[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]

    @property
    def is_sqlite(self) -> bool:
        return "sqlite" in self.DATABASE_URL


settings = Settings()
