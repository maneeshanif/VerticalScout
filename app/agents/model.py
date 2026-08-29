"""
LiteLLM Model Factory for OpenAI Agents SDK

Creates LitellmModel instances for use with agents.Agent.
The SDK handles the agent loop, tool calling, and tracing automatically.

Provider fallback is handled at the runner level in vertical_evaluation_agent.py
"""
from agents.extensions.models.litellm_model import LitellmModel
from agents import ModelSettings
from app.agents.config import (
    PRIMARY_MODEL, FALLBACK_MODEL,
    AGENT_TEMPERATURE, AGENT_MAX_TOKENS
)


def get_primary_model() -> LitellmModel:
    """Get the primary LiteLLM model (Gemini)."""
    return LitellmModel(
        model=PRIMARY_MODEL,
        temperature=AGENT_TEMPERATURE,
        max_tokens=AGENT_MAX_TOKENS,
    )


def get_fallback_model() -> LitellmModel:
    """Get the fallback LiteLLM model (OpenRouter free tier)."""
    return LitellmModel(
        model=FALLBACK_MODEL,
        temperature=AGENT_TEMPERATURE,
        max_tokens=AGENT_MAX_TOKENS,
    )


def get_model_settings() -> ModelSettings:
    """Shared ModelSettings for all agents — include usage for rate tracking."""
    return ModelSettings(
        temperature=AGENT_TEMPERATURE,
        max_tokens=AGENT_MAX_TOKENS,
        include_usage=True,   # Needed for some OpenRouter/LiteLLM backends
    )
