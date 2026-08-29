from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.db.database import get_db
from app.services.leaderboard_service import leaderboard_service
from app.schemas.leaderboard import EliteLeaderboardEntry, TeacherLeaderboardEntry
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/api/v1/leaderboard", tags=["leaderboard"])


@router.get("/elite", response_model=List[EliteLeaderboardEntry])
async def elite_leaderboard(
    db: AsyncSession = Depends(get_db),
    _=Depends(get_current_user),
):
    """Elite User leaderboard ranked by members collected, evaluated, and eligible."""
    return await leaderboard_service.get_elite_leaderboard(db)


@router.get("/teachers", response_model=List[TeacherLeaderboardEntry])
async def teacher_leaderboard(
    db: AsyncSession = Depends(get_db),
    _=Depends(get_current_user),
):
    """Lead Teacher leaderboard."""
    return await leaderboard_service.get_teacher_leaderboard(db)
