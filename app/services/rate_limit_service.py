from sqlalchemy.ext.asyncio import AsyncSession
from app.crud.crud_ai_usage import crud_ai_usage
from app.models.user import User, UserRole
from app.core.settings import settings
from app.core.exceptions import RateLimitException


class RateLimitService:
    def _get_window_config(self, user: User) -> tuple[str, int]:
        """Returns (window_type, max_calls) for the user's role."""
        if user.role == UserRole.ELITE_USER:
            return "daily", settings.ELITE_AI_CALLS_PER_DAY
        elif user.role == UserRole.LEAD_TEACHER:
            return "30min", settings.LEAD_TEACHER_AI_CALLS_PER_30_MIN
        else:
            # Super Teacher and Super Admin — generous limit
            return "daily", 100

    async def check_and_increment(self, db: AsyncSession, user: User) -> None:
        """Check rate limit and increment counter. Raises RateLimitException if exceeded."""
        window_type, max_calls = self._get_window_config(user)
        current_count = await crud_ai_usage.get_call_count(db, user.id, window_type)
        if current_count >= max_calls:
            raise RateLimitException(
                f"AI rate limit exceeded. Max {max_calls} calls per "
                f"{'day' if window_type == 'daily' else '30 minutes'}. "
                f"Current: {current_count}"
            )
        await crud_ai_usage.increment(db, user.id, window_type)

    async def get_usage_info(self, db: AsyncSession, user: User) -> dict:
        """Get current usage info for the user."""
        window_type, max_calls = self._get_window_config(user)
        current_count = await crud_ai_usage.get_call_count(db, user.id, window_type)
        return {
            "calls_used": current_count,
            "calls_limit": max_calls,
            "calls_remaining": max(0, max_calls - current_count),
            "window_type": window_type,
        }


rate_limit_service = RateLimitService()
