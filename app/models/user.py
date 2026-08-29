import enum
from datetime import datetime
from sqlalchemy import String, Boolean, DateTime, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from app.db.base import Base


class UserRole(str, enum.Enum):
    SUPER_ADMIN = "super_admin"
    SUPER_TEACHER = "super_teacher"
    LEAD_TEACHER = "lead_teacher"
    ELITE_USER = "elite_user"


class BatchType(str, enum.Enum):
    MORNING = "morning"
    AFTERNOON = "afternoon"
    EVENING = "evening"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(SAEnum(UserRole), nullable=False, default=UserRole.ELITE_USER)
    batch: Mapped[str | None] = mapped_column(SAEnum(BatchType), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_email_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    members: Mapped[list["Member"]] = relationship(back_populates="elite_user", lazy="select")
    ai_usages: Mapped[list["AIUsage"]] = relationship(back_populates="user", lazy="select")
    activity_logs: Mapped[list["ActivityLog"]] = relationship(back_populates="user", lazy="select")
    # Lead Teacher assignments
    lead_assignments: Mapped[list["TeacherAssignment"]] = relationship(
        "TeacherAssignment",
        foreign_keys="TeacherAssignment.lead_teacher_id",
        back_populates="lead_teacher",
        lazy="select"
    )
    elite_assignments: Mapped[list["TeacherAssignment"]] = relationship(
        "TeacherAssignment",
        foreign_keys="TeacherAssignment.elite_user_id",
        back_populates="elite_user",
        lazy="select"
    )
