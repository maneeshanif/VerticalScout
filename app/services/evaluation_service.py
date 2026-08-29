from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.crud.crud_evaluation import crud_evaluation
from app.crud.crud_member import crud_member
from app.models.user import User, UserRole
from app.models.evaluation import Evaluation, EvaluationStatus, EvaluationOutcome
from app.services.rate_limit_service import rate_limit_service
from app.agents.vertical_evaluation_agent import run_vertical_evaluation
from app.core.exceptions import NotFoundException, ForbiddenException
from app.utils.logger import ai_logger
from app.utils.sentry import capture_ai_error


class EvaluationService:
    async def trigger_evaluation(
        self, db: AsyncSession, member_id: int, current_user: User
    ) -> Evaluation:
        # Check member exists and user can access it
        member = await crud_member.get(db, member_id)
        if not member:
            raise NotFoundException("Member not found")
        if current_user.role == UserRole.ELITE_USER and member.elite_user_id != current_user.id:
            raise ForbiddenException("You can only evaluate your own members")

        # Check rate limit BEFORE running AI
        await rate_limit_service.check_and_increment(db, current_user)

        # Create evaluation record (pending)
        evaluation = await crud_evaluation.create(db, member_id, current_user.id)
        await crud_evaluation.update_status(db, evaluation, EvaluationStatus.RUNNING)

        try:
            # Build member data for AI
            member_data = {
                "name": member.name,
                "domain": member.domain,
                "experience": member.experience,
                "description": member.description or "",
            }

            # Run the AI evaluation
            result, provider_used = await run_vertical_evaluation(member_data)

            # Determine outcome
            outcome_str = result.get("outcome", "parked")
            outcome = EvaluationOutcome(outcome_str)

            # Update evaluation with results
            evaluation = await crud_evaluation.update_result(
                db, evaluation,
                screen_score=result.get("screen_average", 0.0),
                tests_score=result.get("tests_total", 0.0),
                outcome=outcome,
                full_result=result,
                provider_used=provider_used,
            )
            ai_logger.info(f"Evaluation {evaluation.id} completed: {outcome_str}")

        except Exception as e:
            ai_logger.error(f"Evaluation {evaluation.id} failed: {e}")
            capture_ai_error(e, {"evaluation_id": evaluation.id, "member_id": member_id})
            evaluation = await crud_evaluation.mark_failed(db, evaluation, str(e))

        return evaluation

    async def get_evaluations_for_member(
        self, db: AsyncSession, member_id: int, current_user: User
    ) -> List[Evaluation]:
        member = await crud_member.get(db, member_id)
        if not member:
            raise NotFoundException("Member not found")
        if current_user.role == UserRole.ELITE_USER and member.elite_user_id != current_user.id:
            raise ForbiddenException("You can only view evaluations for your own members")
        return await crud_evaluation.get_by_member(db, member_id)

    async def get_my_evaluations(self, db: AsyncSession, current_user: User) -> List[Evaluation]:
        from app.models.member import Member
        from sqlalchemy import select
        members = await crud_member.get_by_elite_user(db, current_user.id)
        all_evals = []
        for m in members:
            evals = await crud_evaluation.get_by_member(db, m.id)
            all_evals.extend(evals)
        return all_evals


evaluation_service = EvaluationService()
