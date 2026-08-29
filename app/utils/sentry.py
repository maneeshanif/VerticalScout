"""
Sentry initialization with full OpenAI Agents SDK integration.
Uses sentry_sdk >= 2.31.0 for native agent tracing support.
"""
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration
from app.core.settings import settings


def init_sentry():
    """
    Initialize Sentry with:
    - OpenAI Agents integration (auto-captures agent runs, tool calls, LLM spans)
    - FastAPI integration (request tracing)
    - SQLAlchemy integration (DB query tracing)
    """
    if not settings.SENTRY_DSN:
        return

    # Import OpenAIAgentsIntegration — requires sentry-sdk[openai-agents] >= 2.31.0
    try:
        from sentry_sdk.integrations.openai_agents import OpenAIAgentsIntegration
        openai_agents_integration = OpenAIAgentsIntegration()
    except ImportError:
        from app.utils.logger import logger
        logger.warning("sentry-sdk[openai-agents] not available — install sentry-sdk>=2.31.0 with openai-agents extra")
        openai_agents_integration = None

    integrations = [
        FastApiIntegration(transaction_style="endpoint"),
        SqlalchemyIntegration(),
    ]
    if openai_agents_integration:
        integrations.append(openai_agents_integration)

    sentry_sdk.init(
        dsn=settings.SENTRY_DSN,
        environment=settings.APP_ENV,
        integrations=integrations,
        traces_sample_rate=0.2 if settings.APP_ENV == "production" else 1.0,
        # Capture prompt/response content in Sentry spans (enable with care)
        send_default_pii=settings.SENTRY_SEND_PII,
    )


def capture_ai_error(exc: Exception, extra: dict = None):
    """Capture an AI-related error with structured context."""
    with sentry_sdk.push_scope() as scope:
        scope.set_tag("category", "ai_agent")
        if extra:
            for k, v in extra.items():
                scope.set_extra(k, v)
        sentry_sdk.capture_exception(exc)


def capture_agent_event(message: str, level: str = "info", extra: dict = None):
    """Capture a custom agent lifecycle event to Sentry."""
    with sentry_sdk.push_scope() as scope:
        scope.set_tag("category", "ai_agent")
        if extra:
            for k, v in extra.items():
                scope.set_extra(k, v)
        sentry_sdk.capture_message(message, level=level)
