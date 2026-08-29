from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.models.evaluation import Evaluation, EvaluationStatus, EvaluationOutcome


class CRUDEvaluation:
    async def get(self, db: AsyncSession, id: int) -> Optional[Evaluation]:
        result = await db.execute(select(Evaluation).where(Evaluation.id == id))
        return result.scalar_one_or_none()

    async def get_by_member(self, db: AsyncSession, member_id: int) -> List[Evaluation]:
        result = await db.execute(
            select(Evaluation).where(Evaluation.member_id == member_id).order_by(Evaluation.created_at.desc())
        )
        return list(result.scalars().all())

    async def get_latest_by_member(self, db: AsyncSession, member_id: int) -> Optional[Evaluation]:
        result = await db.execute(
            select(Evaluation).where(Evaluation.member_id == member_id).order_by(Evaluation.created_at.desc()).limit(1)
        )
        return result.scalar_one_or_none()

    async def create(self, db: AsyncSession, member_id: int, triggered_by: int) -> Evaluation:
        evaluation = Evaluation(
            member_id=member_id,
            triggered_by=triggered_by,
            status=EvaluationStatus.PENDING,
        )
        db.add(evaluation)
        await db.flush()
        await db.refresh(evaluation)
        return evaluation

    async def update_status(self, db: AsyncSession, evaluation: Evaluation, status: EvaluationStatus) -> Evaluation:
        evaluation.status = status
        await db.flush()
        await db.refresh(evaluation)
        return evaluation

    async def update_result(
        self, db: AsyncSession, evaluation: Evaluation,
        screen_score: float, tests_score: float,
        outcome: EvaluationOutcome, full_result: dict, provider_used: str
    ) -> Evaluation:
        evaluation.screen_score = screen_score
        evaluation.tests_score = tests_score
        evaluation.outcome = outcome
        evaluation.full_result = full_result
        evaluation.status = EvaluationStatus.COMPLETED
        evaluation.provider_used = provider_used
        await db.flush()
        await db.refresh(evaluation)
        return evaluation

    async def mark_failed(self, db: AsyncSession, evaluation: Evaluation, error: str) -> Evaluation:
        evaluation.status = EvaluationStatus.FAILED
        evaluation.error_message = error
        await db.flush()
        await db.refresh(evaluation)
        return evaluation

    async def count_eligible_by_elite_user(self, db: AsyncSession, elite_user_id: int) -> int:
        from app.models.member import Member
        result = await db.execute(
            select(func.count()).join(Member, Evaluation.member_id == Member.id)
            .where(Member.elite_user_id == elite_user_id)
            .where(Evaluation.outcome == EvaluationOutcome.ELIGIBLE)
        )
        return result.scalar_one()


crud_evaluation = CRUDEvaluation()
