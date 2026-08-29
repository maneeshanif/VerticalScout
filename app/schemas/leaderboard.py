from pydantic import BaseModel
from typing import List, Optional


class EliteLeaderboardEntry(BaseModel):
    rank: int
    user_id: int
    full_name: str
    batch: Optional[str]
    total_members: int
    evaluated_members: int
    eligible_members: int
    score: float


class TeacherLeaderboardEntry(BaseModel):
    rank: int
    teacher_id: int
    full_name: str
    batch: Optional[str]
    total_elites: int
    total_members: int
    total_eligible: int
    score: float
