from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
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
    """
    Trigger AI evaluation for a Member.
    Runs the full "Choosing Your Vertical" framework via OpenAI Agents SDK.
    Primary: Gemini 2.0 Flash | Fallback: OpenRouter Llama (free).
    Subject to rate limits.
    """
    return await evaluation_service.trigger_evaluation(db, member_id, current_user)


@router.get("/{member_id}/run/stream")
async def run_evaluation_stream(
    member_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Stream the AI evaluation in real-time via Server-Sent Events (SSE).
    Yields token-by-token output + structured events.
    
    Event types:
    - {"type": "start", "message": "..."} — evaluation started
    - {"type": "delta", "text": "..."} — text token from LLM
    - {"type": "tool_call", "name": "..."} — tool was called
    - {"type": "complete", "result": {...}} — full structured result
    - {"type": "error", "message": "..."} — something went wrong
    """
    from app.agents.vertical_evaluation_agent import stream_vertical_evaluation
    from app.crud.crud_member import crud_member
    from app.services.rate_limit_service import rate_limit_service
    from app.core.exceptions import NotFoundException, ForbiddenException
    from app.models.user import UserRole

    member = await crud_member.get(db, member_id)
    if not member:
        raise NotFoundException("Member not found")
    if current_user.role == UserRole.ELITE_USER and member.elite_user_id != current_user.id:
        raise ForbiddenException("You can only evaluate your own members")

    await rate_limit_service.check_and_increment(db, current_user)

    member_data = {
        "name": member.name,
        "domain": member.domain,
        "experience": member.experience,
        "description": member.description or "",
    }

    return StreamingResponse(
        stream_vertical_evaluation(member_data),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",  # Disable nginx buffering
        },
    )


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
