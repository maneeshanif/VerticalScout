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
    """Get the primary LiteLLM model (Gemini 2.5 Flash)."""
    return LitellmModel(
        model=PRIMARY_MODEL,
    )


def get_fallback_model() -> LitellmModel:
    """Get the fallback LiteLLM model (OpenRouter Llama-3.1)."""
    return LitellmModel(
        model=FALLBACK_MODEL,
    )


def get_model_settings() -> ModelSettings:
    """Shared ModelSettings for all agents — controls temperature, max tokens, and usage tracking."""
    return ModelSettings(
        temperature=AGENT_TEMPERATURE,
        max_tokens=AGENT_MAX_TOKENS,
    )
