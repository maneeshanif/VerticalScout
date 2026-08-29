from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.models.user import User, UserRole, BatchType
from app.core.security import hash_password


class CRUDUser:
    async def get(self, db: AsyncSession, id: int) -> Optional[User]:
        result = await db.execute(select(User).where(User.id == id))
        return result.scalar_one_or_none()

    async def get_by_email(self, db: AsyncSession, email: str) -> Optional[User]:
        result = await db.execute(select(User).where(User.email == email))
        return result.scalar_one_or_none()

    async def get_all(self, db: AsyncSession, skip: int = 0, limit: int = 100) -> List[User]:
        result = await db.execute(select(User).offset(skip).limit(limit))
        return list(result.scalars().all())

    async def get_by_role(self, db: AsyncSession, role: UserRole) -> List[User]:
        result = await db.execute(select(User).where(User.role == role))
        return list(result.scalars().all())

    async def create(self, db: AsyncSession, email: str, password: str, full_name: str, role: UserRole = UserRole.ELITE_USER) -> User:
        user = User(
            email=email,
            password_hash=hash_password(password),
            full_name=full_name,
            role=role,
        )
        db.add(user)
        await db.flush()
        await db.refresh(user)
        return user

    async def update_batch(self, db: AsyncSession, user: User, batch: BatchType) -> User:
        user.batch = batch
        await db.flush()
        await db.refresh(user)
        return user

    async def update_role(self, db: AsyncSession, user: User, role: UserRole) -> User:
        user.role = role
        await db.flush()
        await db.refresh(user)
        return user

    async def update_active(self, db: AsyncSession, user: User, is_active: bool) -> User:
        user.is_active = is_active
        await db.flush()
        await db.refresh(user)
        return user

    async def count_by_role(self, db: AsyncSession, role: UserRole) -> int:
        result = await db.execute(select(func.count()).where(User.role == role))
        return result.scalar_one()

    async def delete(self, db: AsyncSession, user: User) -> None:
        await db.delete(user)
        await db.flush()


crud_user = CRUDUser()
