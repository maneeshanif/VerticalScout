from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from app.crud.crud_member import crud_member
from app.models.member import Member
from app.models.user import User, UserRole
from app.schemas.member import MemberCreate, MemberUpdate
from app.core.exceptions import NotFoundException, ForbiddenException


class MemberService:
    async def get_my_members(self, db: AsyncSession, current_user: User) -> List[Member]:
        return await crud_member.get_by_elite_user(db, current_user.id)

    async def get_all_members(self, db: AsyncSession) -> List[Member]:
        return await crud_member.get_all(db)

    async def get_member(self, db: AsyncSession, member_id: int, current_user: User) -> Member:
        member = await crud_member.get(db, member_id)
        if not member:
            raise NotFoundException("Member not found")
        # Allow admin/teacher to view any member; elite users only their own
        if current_user.role == UserRole.ELITE_USER and member.elite_user_id != current_user.id:
            raise ForbiddenException("You can only view your own members")
        return member

    async def create_member(self, db: AsyncSession, data: MemberCreate, current_user: User) -> Member:
        return await crud_member.create(
            db,
            elite_user_id=current_user.id,
            name=data.name,
            domain=data.domain,
            experience=data.experience,
            phone=data.phone,
            description=data.description,
        )

    async def update_member(
        self, db: AsyncSession, member_id: int, data: MemberUpdate, current_user: User
    ) -> Member:
        member = await self.get_member(db, member_id, current_user)
        updates = data.model_dump(exclude_none=True)
        return await crud_member.update(db, member, **updates)

    async def delete_member(self, db: AsyncSession, member_id: int, current_user: User) -> None:
        member = await self.get_member(db, member_id, current_user)
        await crud_member.delete(db, member)


member_service = MemberService()
