from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy import DateTime, Float, ForeignKey, String, Text, JSON, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base, TimestampMixin, UUIDPrimaryKeyMixin


class Match(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "matches"
    __table_args__ = (
        UniqueConstraint("user_id", "job_id", name="uq_user_job_match"),
    )

    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    job_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("jobs.id", ondelete="CASCADE"), index=True, nullable=False
    )
    career_goal_id: Mapped[Optional[str]] = mapped_column(
        String(36), ForeignKey("career_goals.id", ondelete="SET NULL"), index=True, nullable=True
    )
    overall_score: Mapped[float] = mapped_column(Float, nullable=False)  # 0.0 - 100.0 scale
    technical_fit: Mapped[float] = mapped_column(Float, nullable=False)
    experience_fit: Mapped[float] = mapped_column(Float, nullable=False)
    preference_fit: Mapped[float] = mapped_column(Float, nullable=False)
    location_fit: Mapped[float] = mapped_column(Float, default=100.0, nullable=False)
    seniority_fit: Mapped[float] = mapped_column(Float, default=90.0, nullable=False)
    recommendation_category: Mapped[str] = mapped_column(
        String(50), default="STRONG_MATCH", nullable=False
    )  # STRONG_MATCH, STRETCH, LOW_MATCH
    explanation: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    matched_skills_json: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    missing_skills_json: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    calculated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )

    # Relationships
    job: Mapped["app.domains.jobs.models.Job"] = relationship("app.domains.jobs.models.Job")
