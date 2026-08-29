from typing import Annotated
from fastapi import Depends, Header
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.core.security import decode_token
from app.core.exceptions import UnauthorizedException, ForbiddenException
from app.models.user import UserRole


async def get_current_user_payload(authorization: Annotated[str | None, Header()] = None) -> dict:
    """Extract and validate JWT from Authorization header."""
    if not authorization or not authorization.startswith("Bearer "):
        raise UnauthorizedException("Missing or invalid Authorization header")
    token = authorization.split(" ", 1)[1]
    payload = decode_token(token)
    if not payload or payload.get("type") != "access":
        raise UnauthorizedException("Invalid or expired token")
    return payload


async def get_current_user(
    payload: Annotated[dict, Depends(get_current_user_payload)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Get the current authenticated user from the database."""
    from app.crud.crud_user import crud_user
    user_id = payload.get("sub")
    if not user_id:
        raise UnauthorizedException("Invalid token payload")
    user = await crud_user.get(db, id=int(user_id))
    if not user or not user.is_active:
        raise UnauthorizedException("User not found or inactive")
    return user


def require_roles(*roles: UserRole):
    """Dependency factory: require specific role(s)."""
    async def role_checker(current_user=Depends(get_current_user)):
        if current_user.role not in roles:
            raise ForbiddenException(
                f"Access restricted. Required roles: {[r.value for r in roles]}"
            )
        return current_user
    return role_checker


# Shorthand role dependencies
require_super_admin = require_roles(UserRole.SUPER_ADMIN)
require_super_teacher = require_roles(UserRole.SUPER_ADMIN, UserRole.SUPER_TEACHER)
require_lead_teacher = require_roles(UserRole.SUPER_ADMIN, UserRole.SUPER_TEACHER, UserRole.LEAD_TEACHER)
require_elite_user = require_roles(UserRole.SUPER_ADMIN, UserRole.SUPER_TEACHER, UserRole.LEAD_TEACHER, UserRole.ELITE_USER)
