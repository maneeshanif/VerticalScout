from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.services.user_service import user_service
from app.core.dependencies import require_super_admin, get_current_user
from app.core.settings import settings

router = APIRouter(prefix="/api/v1/admin", tags=["admin"])


@router.get("/stats")
async def system_stats(
    db: AsyncSession = Depends(get_db),
    _=Depends(require_super_admin),
):
    """System-wide statistics. Super Admin only."""
    return await user_service.get_stats(db)


@router.patch("/users/{user_id}/toggle-active")
async def toggle_user_active(
    user_id: int,
    is_active: bool,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_super_admin),
):
    """Activate or deactivate a user. Super Admin only."""
    user = await user_service.toggle_user_active(db, user_id, is_active)
    return {"message": f"User {'activated' if is_active else 'deactivated'}", "user_id": user.id}


@router.get("/rate-limits")
async def get_rate_limits(_=Depends(require_super_admin)):
    """Get current AI rate limit settings."""
    return {
        "elite_ai_calls_per_day": settings.ELITE_AI_CALLS_PER_DAY,
        "lead_teacher_ai_calls_per_30_min": settings.LEAD_TEACHER_AI_CALLS_PER_30_MIN,
    }
