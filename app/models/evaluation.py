import enum
from datetime import datetime
from sqlalchemy import String, Integer, Float, ForeignKey, DateTime, Text, Enum as SAEnum
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from app.db.base import Base


class EvaluationStatus(str, enum.Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


class EvaluationOutcome(str, enum.Enum):
    ELIGIBLE = "eligible"
    SERVICE_DOMAIN = "service_domain"
    PARKED = "parked"


class Evaluation(Base):
    __tablename__ = "evaluations"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    member_id: Mapped[int] = mapped_column(ForeignKey("members.id", ondelete="CASCADE"), nullable=False, index=True)
    triggered_by: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    status: Mapped[EvaluationStatus] = mapped_column(
        SAEnum(EvaluationStatus), nullable=False, default=EvaluationStatus.PENDING
    )
    screen_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    tests_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    outcome: Mapped[str | None] = mapped_column(SAEnum(EvaluationOutcome), nullable=True)
    full_result: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    provider_used: Mapped[str | None] = mapped_column(String(100), nullable=True)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    member: Mapped["Member"] = relationship(back_populates="evaluations")
    triggered_by_user: Mapped["User"] = relationship(foreign_keys=[triggered_by])
