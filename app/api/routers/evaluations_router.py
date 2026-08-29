from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.db.database import get_db
from app.services.evaluation_service import evaluation_service
from app.schemas.evaluation import EvaluationResponse
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/api/v1/evaluations", tags=["evaluations"])


@router.post("/{member_id}/run", response_model=EvaluationResponse, status_code=201)
async def run_evaluation(
    member_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Trigger AI evaluation for a Member. Subject to rate limits."""
    return await evaluation_service.trigger_evaluation(db, member_id, current_user)


@router.get("/{member_id}", response_model=List[EvaluationResponse])
async def get_evaluations_for_member(
    member_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Get all evaluations for a specific member."""
    return await evaluation_service.get_evaluations_for_member(db, member_id, current_user)


@router.get("/", response_model=List[EvaluationResponse])
async def list_my_evaluations(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """List evaluations for the current user's members."""
    return await evaluation_service.get_my_evaluations(db, current_user)
