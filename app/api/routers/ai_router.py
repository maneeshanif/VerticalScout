from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.services.ai_service import ai_service
from app.services.rate_limit_service import rate_limit_service
from app.core.dependencies import require_lead_teacher, get_current_user

router = APIRouter(prefix="/api/v1/ai", tags=["ai"])


class QueryRequest(BaseModel):
    question: str


@router.post("/query")
async def ai_query(
    data: QueryRequest,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
    _=Depends(require_lead_teacher),
):
    """Natural language data query. Lead Teacher and above, subject to rate limits."""
    return await ai_service.query_data(db, data.question, current_user)


@router.get("/usage")
async def ai_usage(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Get current AI usage and rate limit info for the authenticated user."""
    return await rate_limit_service.get_usage_info(db, current_user)
