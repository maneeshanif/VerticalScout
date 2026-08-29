"""
AI rate limiting middleware — enforced at the service level (not HTTP middleware).
This module provides reusable rate-limiting helpers.
"""
from app.services.rate_limit_service import rate_limit_service
