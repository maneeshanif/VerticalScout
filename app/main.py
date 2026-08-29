"""
VerticalGate — FastAPI Application Entry Point
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.settings import settings
from app.api.routers.main_router import api_router
from app.middleware.request_logger import RequestLoggerMiddleware
from app.utils.sentry import init_sentry
from app.utils.logger import logger


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: startup and shutdown events."""
    logger.info(f"🚀 VerticalGate starting — env: {settings.APP_ENV}")
    init_sentry()
    yield
    logger.info("🛑 VerticalGate shutting down")


app = FastAPI(
    title="VerticalGate API",
    description=(
        "Elite Member Collection & AI-powered Domain/Vertical Evaluation Platform. "
        "Implements the full 'Choosing Your Vertical' framework via AI agents."
    ),
    version=settings.APP_VERSION,
    lifespan=lifespan,
    docs_url="/docs" if settings.APP_ENV != "production" else None,
    redoc_url="/redoc" if settings.APP_ENV != "production" else None,
)

# --- Middleware ---
app.add_middleware(RequestLoggerMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Routers ---
app.include_router(api_router)


# --- Health check ---
@app.get("/health", tags=["health"])
async def health():
    return {"status": "ok", "app": settings.APP_NAME, "version": settings.APP_VERSION}
