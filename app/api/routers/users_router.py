from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.db.database import get_db
from app.services.user_service import user_service
from app.schemas.user import UserResponse, UserUpdateBatch, UserUpdateRole
from app.core.dependencies import get_current_user, require_super_admin, require_lead_teacher
from app.models.user import UserRole, BatchType

router = APIRouter(prefix="/api/v1/users", tags=["users"])


@router.get("/me", response_model=UserResponse)
async def get_me(current_user=Depends(get_current_user)):
    return current_user


@router.patch("/me/batch", response_model=UserResponse)
async def update_batch(
    data: UserUpdateBatch,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Set Morning/Afternoon/Evening batch for Elite Users and Lead Teachers."""
    return await user_service.update_batch(db, current_user, data.batch)


@router.get("/", response_model=List[UserResponse])
async def list_users(
    db: AsyncSession = Depends(get_db),
    _=Depends(require_lead_teacher),
    current_user=Depends(get_current_user),
):
    """List all users. Accessible by Lead Teacher and above."""
    return await user_service.get_all_users(db)


@router.patch("/{user_id}/role", response_model=UserResponse)
async def update_role(
    user_id: int,
    data: UserUpdateRole,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_super_admin),
):
    """Update a user's role. Super Admin only."""
    return await user_service.update_user_role(db, user_id, data.role)


@router.post("/assign-teacher")
async def assign_teacher(
    lead_teacher_id: int,
    elite_user_id: int,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_super_admin),
):
    """Assign an Elite User to a Lead Teacher. Super Admin only."""
    assignment = await user_service.assign_elite_to_teacher(db, lead_teacher_id, elite_user_id)
    return {"message": "Assigned successfully", "assignment_id": assignment.id}
