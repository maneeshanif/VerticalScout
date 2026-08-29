from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.db.database import get_db
from app.services.member_service import member_service
from app.schemas.member import MemberCreate, MemberUpdate, MemberResponse
from app.core.dependencies import get_current_user, require_elite_user

router = APIRouter(prefix="/api/v1/members", tags=["members"])


@router.get("/", response_model=List[MemberResponse])
async def list_members(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """List members. Elite Users see only their own; teachers/admin see all."""
    from app.models.user import UserRole
    if current_user.role == UserRole.ELITE_USER:
        return await member_service.get_my_members(db, current_user)
    return await member_service.get_all_members(db)


@router.post("/", response_model=MemberResponse, status_code=201)
async def create_member(
    data: MemberCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
    _=Depends(require_elite_user),
):
    """Create a new Member. Elite Users only (and above)."""
    return await member_service.create_member(db, data, current_user)


@router.get("/{member_id}", response_model=MemberResponse)
async def get_member(
    member_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return await member_service.get_member(db, member_id, current_user)


@router.patch("/{member_id}", response_model=MemberResponse)
async def update_member(
    member_id: int,
    data: MemberUpdate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return await member_service.update_member(db, member_id, data, current_user)


@router.delete("/{member_id}", status_code=204)
async def delete_member(
    member_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    await member_service.delete_member(db, member_id, current_user)
