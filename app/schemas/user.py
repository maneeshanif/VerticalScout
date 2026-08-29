from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from app.models.user import UserRole, BatchType


class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: UserRole
    batch: Optional[BatchType] = None
    is_active: bool = True


class UserResponse(UserBase):
    id: int
    is_email_verified: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class UserUpdateBatch(BaseModel):
    batch: BatchType


class UserUpdateRole(BaseModel):
    role: UserRole


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    is_active: Optional[bool] = None
