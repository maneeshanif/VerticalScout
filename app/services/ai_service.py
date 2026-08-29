from sqlalchemy.ext.asyncio import AsyncSession
from app.agents.data_query_agent import run_data_query
from app.services.user_service import user_service
from app.models.user import User
from app.services.rate_limit_service import rate_limit_service
from app.utils.logger import ai_logger


class AIService:
    async def query_data(self, db: AsyncSession, question: str, current_user: User) -> dict:
        # Check rate limit
        await rate_limit_service.check_and_increment(db, current_user)

        # Build data summary for the agent
        stats = await user_service.get_stats(db)
        data_summary = {
            "stats": stats,
            "user_role": current_user.role.value,
            "question_by": current_user.full_name,
        }

        ai_logger.info(f"AI data query by {current_user.full_name} ({current_user.role.value}): {question[:100]}")
        result, provider = await run_data_query(question, data_summary)
        result["provider_used"] = provider
        return result


ai_service = AIService()
