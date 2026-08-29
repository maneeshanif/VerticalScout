from typing import Optional
from datetime import datetime, timezone, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.ai_usage import AIUsage
from app.models.user import UserRole


class CRUDAIUsage:
    async def get_current_window(
        self, db: AsyncSession, user_id: int, window_type: str
    ) -> Optional[AIUsage]:
        """Get the active usage record for the current time window."""
        now = datetime.now(timezone.utc)
        if window_type == "daily":
            window_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        else:  # 30min
            window_start = now - timedelta(minutes=30)

        result = await db.execute(
            select(AIUsage).where(
                AIUsage.user_id == user_id,
                AIUsage.window_type == window_type,
                AIUsage.window_start >= window_start,
            ).order_by(AIUsage.window_start.desc()).limit(1)
        )
        return result.scalar_one_or_none()

    async def increment(
        self, db: AsyncSession, user_id: int, window_type: str
    ) -> AIUsage:
        """Increment or create a usage record for the current window."""
        now = datetime.now(timezone.utc)
        if window_type == "daily":
            window_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        else:
            window_start = now - timedelta(minutes=30)

        usage = await self.get_current_window(db, user_id, window_type)
        if usage and usage.window_start >= window_start:
            usage.call_count += 1
        else:
            usage = AIUsage(
                user_id=user_id,
                window_type=window_type,
                window_start=now if window_type == "30min" else window_start,
                call_count=1,
            )
            db.add(usage)
        await db.flush()
        await db.refresh(usage)
        return usage

    async def get_call_count(self, db: AsyncSession, user_id: int, window_type: str) -> int:
        """Get current call count for the active window."""
        usage = await self.get_current_window(db, user_id, window_type)
        return usage.call_count if usage else 0


crud_ai_usage = CRUDAIUsage()
