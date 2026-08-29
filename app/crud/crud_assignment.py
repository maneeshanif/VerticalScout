from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.teacher_assignment import TeacherAssignment


class CRUDAssignment:
    async def assign(self, db: AsyncSession, lead_teacher_id: int, elite_user_id: int) -> TeacherAssignment:
        assignment = TeacherAssignment(
            lead_teacher_id=lead_teacher_id,
            elite_user_id=elite_user_id,
        )
        db.add(assignment)
        await db.flush()
        await db.refresh(assignment)
        return assignment

    async def get_elites_for_teacher(self, db: AsyncSession, lead_teacher_id: int) -> List[TeacherAssignment]:
        result = await db.execute(
            select(TeacherAssignment).where(TeacherAssignment.lead_teacher_id == lead_teacher_id)
        )
        return list(result.scalars().all())

    async def get_teacher_for_elite(self, db: AsyncSession, elite_user_id: int) -> Optional[TeacherAssignment]:
        result = await db.execute(
            select(TeacherAssignment).where(TeacherAssignment.elite_user_id == elite_user_id).limit(1)
        )
        return result.scalar_one_or_none()


crud_assignment = CRUDAssignment()
