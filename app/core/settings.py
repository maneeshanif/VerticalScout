from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    # App
    APP_NAME: str = "VerticalGate"
    APP_VERSION: str = "0.1.0"
    APP_ENV: str = "development"

    # Database — Supabase Cloud PostgreSQL
    DATABASE_URL: str

    # Supabase
    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""
    SUPABASE_SERVICE_KEY: str = ""

    # Auth / JWT
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # AI Providers
    OPENAI_API_KEY: str = ""
    GEMINI_API_KEY: str = ""
    AI_PRIMARY_PROVIDER: str = "openai"
    AI_FALLBACK_PROVIDER: str = "gemini"

    # Rate Limits (configurable by Super Admin, these are defaults)
    ELITE_AI_CALLS_PER_DAY: int = 10
    LEAD_TEACHER_AI_CALLS_PER_30_MIN: int = 5

    # Sentry
    SENTRY_DSN: str = ""

    # CORS
    CORS_ORIGINS: str = "http://localhost:3000"

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
