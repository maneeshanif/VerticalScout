import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration
from app.core.settings import settings


def init_sentry():
    """Initialize Sentry error tracking and monitoring."""
    if not settings.SENTRY_DSN:
        return
    sentry_sdk.init(
        dsn=settings.SENTRY_DSN,
        environment=settings.APP_ENV,
        integrations=[
            FastApiIntegration(transaction_style="endpoint"),
            SqlalchemyIntegration(),
        ],
        traces_sample_rate=0.2 if settings.APP_ENV == "production" else 1.0,
        send_default_pii=False,
    )


def capture_ai_error(exc: Exception, extra: dict = None):
    """Capture an AI-related error with extra context."""
    with sentry_sdk.push_scope() as scope:
        scope.set_tag("category", "ai_agent")
        if extra:
            for k, v in extra.items():
                scope.set_extra(k, v)
        sentry_sdk.capture_exception(exc)
