"""
AI Provider Configuration
Primary: OpenAI (GPT-4o)
Fallback: Google Gemini (gemini-1.5-pro)
"""
from app.core.settings import settings


PROVIDER_CONFIG = {
    "openai": {
        "api_key": settings.OPENAI_API_KEY,
        "model": "gpt-4o",
        "max_tokens": 4000,
        "temperature": 0.3,
    },
    "gemini": {
        "api_key": settings.GEMINI_API_KEY,
        "model": "gemini-1.5-pro",
        "max_tokens": 4000,
        "temperature": 0.3,
    },
}

PRIMARY_PROVIDER = settings.AI_PRIMARY_PROVIDER
FALLBACK_PROVIDER = settings.AI_FALLBACK_PROVIDER
