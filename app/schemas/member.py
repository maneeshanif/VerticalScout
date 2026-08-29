from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class MemberCreate(BaseModel):
    name: str
    domain: str
    experience: str
    phone: str
    description: Optional[str] = None


class MemberUpdate(BaseModel):
    name: Optional[str] = None
    domain: Optional[str] = None
    experience: Optional[str] = None
    phone: Optional[str] = None
    description: Optional[str] = None


class MemberResponse(BaseModel):
    id: int
    elite_user_id: int
    name: str
    domain: str
    experience: str
    phone: str
    description: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
