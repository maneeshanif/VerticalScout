from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from app.crud.crud_user import crud_user
from app.crud.crud_assignment import crud_assignment
from app.models.user import User, UserRole, BatchType
from app.schemas.user import UserUpdateBatch, UserUpdateRole
from app.core.exceptions import NotFoundException, ForbiddenException, BadRequestException


class UserService:
    async def get_me(self, db: AsyncSession, current_user: User) -> User:
        return current_user

    async def update_batch(self, db: AsyncSession, user: User, batch: BatchType) -> User:
        if user.role not in [UserRole.ELITE_USER, UserRole.LEAD_TEACHER]:
            raise BadRequestException("Batch selection is only for Elite Users and Lead Teachers")
        return await crud_user.update_batch(db, user, batch)

    async def get_all_users(self, db: AsyncSession) -> List[User]:
        return await crud_user.get_all(db, limit=500)

    async def update_user_role(self, db: AsyncSession, user_id: int, role: UserRole) -> User:
        user = await crud_user.get(db, user_id)
        if not user:
            raise NotFoundException("User not found")
        return await crud_user.update_role(db, user, role)

    async def toggle_user_active(self, db: AsyncSession, user_id: int, is_active: bool) -> User:
        user = await crud_user.get(db, user_id)
        if not user:
            raise NotFoundException("User not found")
        return await crud_user.update_active(db, user, is_active)

    async def assign_elite_to_teacher(self, db: AsyncSession, lead_teacher_id: int, elite_user_id: int):
        lead = await crud_user.get(db, lead_teacher_id)
        elite = await crud_user.get(db, elite_user_id)
        if not lead or lead.role != UserRole.LEAD_TEACHER:
            raise BadRequestException("Lead teacher not found or invalid role")
        if not elite or elite.role != UserRole.ELITE_USER:
            raise BadRequestException("Elite user not found or invalid role")
        return await crud_assignment.assign(db, lead_teacher_id, elite_user_id)

    async def get_stats(self, db: AsyncSession) -> dict:
        from app.models.member import Member
        from app.models.evaluation import Evaluation
        from sqlalchemy import select, func
        total_users = len(await crud_user.get_all(db, limit=10000))
        elite_count = await crud_user.count_by_role(db, UserRole.ELITE_USER)
        lead_count = await crud_user.count_by_role(db, UserRole.LEAD_TEACHER)
        members_result = await db.execute(select(func.count()).select_from(Member))
        total_members = members_result.scalar_one()
        evals_result = await db.execute(select(func.count()).select_from(Evaluation))
        total_evaluations = evals_result.scalar_one()
        return {
            "total_users": total_users,
            "elite_users": elite_count,
            "lead_teachers": lead_count,
            "total_members": total_members,
            "total_evaluations": total_evaluations,
        }


user_service = UserService()
