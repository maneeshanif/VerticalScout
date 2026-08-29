from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # App
    APP_NAME: str = "VerticalGate"
    APP_VERSION: str = "0.1.0"
    APP_ENV: str = "development"

    # Database — Supabase Cloud PostgreSQL
    DATABASE_URL: str = "postgresql+asyncpg://user:pass@localhost/db"

    # Supabase
    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""
    SUPABASE_SERVICE_KEY: str = ""

    # Auth / JWT
    SECRET_KEY: str = "dev-secret-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # ============================================================
    # AI Providers
    # PRIMARY: Gemini (via LiteLLM)
    # SECONDARY / FALLBACK: OpenRouter free model (via LiteLLM)
    # ============================================================
    GEMINI_API_KEY: str = ""                              # Primary
    OPENROUTER_API_KEY: str = ""                          # Fallback
    OPENAI_API_KEY: str = ""                              # Optional (for tracing)

    # LiteLLM model strings
    PRIMARY_MODEL: str = "litellm/gemini/gemini-2.5-flash"
    FALLBACK_MODEL: str = "litellm/openrouter/meta-llama/llama-3.1-8b-instruct"

    # Disable SDK's built-in OpenAI tracing when not using OpenAI models
    # Set to "1" if you don't want traces sent to OpenAI platform
    OPENAI_AGENTS_DISABLE_TRACING: str = "0"

    # Rate Limits (configurable by Super Admin, these are defaults)
    ELITE_AI_CALLS_PER_DAY: int = 10
    LEAD_TEACHER_AI_CALLS_PER_30_MIN: int = 5

    # Sentry
    SENTRY_DSN: str = ""
    SENTRY_SEND_PII: bool = False   # Set True to capture prompt/response content in Sentry

    # CORS
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:3001,https://vertical-scout.vercel.app"

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
