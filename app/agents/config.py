"""
AI Provider Configuration for VerticalGate

Architecture:
- PRIMARY: Gemini 2.0 Flash via LiteLLM adapter (openai-agents[litellm])
- FALLBACK: OpenRouter free model (Llama-3.1-8B) via LiteLLM adapter

How it works with OpenAI Agents SDK:
- We use `openai-agents[litellm]` which installs LitellmModel
- LiteLLM routes to 100+ providers using a unified interface
- Model names use the "litellm/provider/model-name" format
- Primary → Fallback retry is implemented in the runner layer
- Sentry OpenAIAgentsIntegration automatically captures all agent spans

LiteLLM model name format:
  "litellm/gemini/gemini-2.0-flash"           → Gemini via Google AI Studio
  "litellm/openrouter/meta-llama/..."         → OpenRouter (free tier)
  "litellm/openai/gpt-4o"                     → OpenAI direct

Required env vars:
  GEMINI_API_KEY      → for litellm/gemini/* models
  OPENROUTER_API_KEY  → for litellm/openrouter/* models
"""
import os
from app.core.settings import settings

# Set LiteLLM env vars from our settings (LiteLLM reads these internally)
if settings.GEMINI_API_KEY:
    os.environ["GEMINI_API_KEY"] = settings.GEMINI_API_KEY

if settings.OPENROUTER_API_KEY:
    os.environ["OPENROUTER_API_KEY"] = settings.OPENROUTER_API_KEY

if settings.OPENAI_API_KEY:
    os.environ["OPENAI_API_KEY"] = settings.OPENAI_API_KEY

# Control whether OpenAI platform receives agent traces
# Set OPENAI_AGENTS_DISABLE_TRACING=1 if you don't want OpenAI to store traces
# (Sentry still captures via OpenAIAgentsIntegration regardless)
if settings.OPENAI_AGENTS_DISABLE_TRACING == "1":
    os.environ["OPENAI_AGENTS_DISABLE_TRACING"] = "1"

# Enable LiteLLM serializer patch to suppress Pydantic warnings
os.environ["OPENAI_AGENTS_ENABLE_LITELLM_SERIALIZER_PATCH"] = "true"


# Model configuration
PRIMARY_MODEL = settings.PRIMARY_MODEL      # e.g. "litellm/gemini/gemini-2.0-flash"
FALLBACK_MODEL = settings.FALLBACK_MODEL    # e.g. "litellm/openrouter/meta-llama/llama-3.1-8b-instruct:free"

# Agent settings
AGENT_MAX_TURNS = 3         # Prevent infinite loops in agent execution
AGENT_TEMPERATURE = 0.3     # Low temp = consistent, evidence-based scoring
AGENT_MAX_TOKENS = 4096     # Enough for full structured evaluation output
