from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.models.member import Member


class CRUDMember:
    async def get(self, db: AsyncSession, id: int) -> Optional[Member]:
        result = await db.execute(select(Member).where(Member.id == id))
        return result.scalar_one_or_none()

    async def get_by_elite_user(self, db: AsyncSession, elite_user_id: int) -> List[Member]:
        result = await db.execute(
            select(Member).where(Member.elite_user_id == elite_user_id).order_by(Member.created_at.desc())
        )
        return list(result.scalars().all())

    async def get_all(self, db: AsyncSession, skip: int = 0, limit: int = 100) -> List[Member]:
        result = await db.execute(select(Member).offset(skip).limit(limit))
        return list(result.scalars().all())

    async def create(
        self, db: AsyncSession, elite_user_id: int, name: str, domain: str,
        experience: str, phone: str, description: Optional[str] = None
    ) -> Member:
        member = Member(
            elite_user_id=elite_user_id,
            name=name,
            domain=domain,
            experience=experience,
            phone=phone,
            description=description,
        )
        db.add(member)
        await db.flush()
        await db.refresh(member)
        return member

    async def update(self, db: AsyncSession, member: Member, **kwargs) -> Member:
        for key, value in kwargs.items():
            if value is not None and hasattr(member, key):
                setattr(member, key, value)
        await db.flush()
        await db.refresh(member)
        return member

    async def delete(self, db: AsyncSession, member: Member) -> None:
        await db.delete(member)
        await db.flush()

    async def count_by_elite_user(self, db: AsyncSession, elite_user_id: int) -> int:
        result = await db.execute(
            select(func.count()).where(Member.elite_user_id == elite_user_id)
        )
        return result.scalar_one()


crud_member = CRUDMember()
