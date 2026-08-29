from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.models.user import User, UserRole
from app.models.member import Member
from app.models.evaluation import Evaluation, EvaluationOutcome
from app.models.teacher_assignment import TeacherAssignment
from app.schemas.leaderboard import EliteLeaderboardEntry, TeacherLeaderboardEntry


class LeaderboardService:
    async def get_elite_leaderboard(self, db: AsyncSession) -> List[EliteLeaderboardEntry]:
        """Get Elite User leaderboard ranked by members collected, evaluated, and eligible."""
        elite_users_result = await db.execute(
            select(User).where(User.role == UserRole.ELITE_USER, User.is_active == True)
        )
        elite_users = list(elite_users_result.scalars().all())

        entries = []
        for user in elite_users:
            # Count total members
            total_result = await db.execute(
                select(func.count()).where(Member.elite_user_id == user.id)
            )
            total_members = total_result.scalar_one()

            # Count evaluated members
            eval_result = await db.execute(
                select(func.count()).select_from(Evaluation)
                .join(Member, Evaluation.member_id == Member.id)
                .where(Member.elite_user_id == user.id)
                .where(Evaluation.status == "completed")
            )
            evaluated = eval_result.scalar_one()

            # Count eligible members
            eligible_result = await db.execute(
                select(func.count()).select_from(Evaluation)
                .join(Member, Evaluation.member_id == Member.id)
                .where(Member.elite_user_id == user.id)
                .where(Evaluation.outcome == EvaluationOutcome.ELIGIBLE)
            )
            eligible = eligible_result.scalar_one()

            # Score formula: total * 1 + evaluated * 2 + eligible * 3
            score = total_members * 1.0 + evaluated * 2.0 + eligible * 3.0

            entries.append(EliteLeaderboardEntry(
                rank=0,  # Will be set after sorting
                user_id=user.id,
                full_name=user.full_name,
                batch=user.batch.value if user.batch else None,
                total_members=total_members,
                evaluated_members=evaluated,
                eligible_members=eligible,
                score=score,
            ))

        # Sort by score descending, assign ranks
        entries.sort(key=lambda e: e.score, reverse=True)
        for i, entry in enumerate(entries):
            entry.rank = i + 1

        return entries

    async def get_teacher_leaderboard(self, db: AsyncSession) -> List[TeacherLeaderboardEntry]:
        """Get Lead Teacher leaderboard."""
        teachers_result = await db.execute(
            select(User).where(User.role == UserRole.LEAD_TEACHER, User.is_active == True)
        )
        teachers = list(teachers_result.scalars().all())

        entries = []
        for teacher in teachers:
            assignments_result = await db.execute(
                select(TeacherAssignment).where(TeacherAssignment.lead_teacher_id == teacher.id)
            )
            assignments = list(assignments_result.scalars().all())
            elite_ids = [a.elite_user_id for a in assignments]

            total_members = 0
            total_eligible = 0
            for elite_id in elite_ids:
                m_count = await db.execute(select(func.count()).where(Member.elite_user_id == elite_id))
                total_members += m_count.scalar_one()
                e_count = await db.execute(
                    select(func.count()).select_from(Evaluation)
                    .join(Member, Evaluation.member_id == Member.id)
                    .where(Member.elite_user_id == elite_id)
                    .where(Evaluation.outcome == EvaluationOutcome.ELIGIBLE)
                )
                total_eligible += e_count.scalar_one()

            score = len(elite_ids) * 1.0 + total_members * 0.5 + total_eligible * 2.0

            entries.append(TeacherLeaderboardEntry(
                rank=0,
                teacher_id=teacher.id,
                full_name=teacher.full_name,
                batch=teacher.batch.value if teacher.batch else None,
                total_elites=len(elite_ids),
                total_members=total_members,
                total_eligible=total_eligible,
                score=score,
            ))

        entries.sort(key=lambda e: e.score, reverse=True)
        for i, entry in enumerate(entries):
            entry.rank = i + 1

        return entries


leaderboard_service = LeaderboardService()
