from typing import Optional
from sqlalchemy import Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base, TimestampMixin, UUIDPrimaryKeyMixin


class Gap(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "gaps"

    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    skill_id: Mapped[Optional[str]] = mapped_column(
        String(36), ForeignKey("skills.id", ondelete="SET NULL"), index=True, nullable=True
    )
    job_id: Mapped[Optional[str]] = mapped_column(
        String(36), ForeignKey("jobs.id", ondelete="SET NULL"), index=True, nullable=True
    )
    gap_type: Mapped[str] = mapped_column(
        String(50), default="SKILL_GAP", nullable=False
    )  # SKILL_GAP, EVIDENCE_GAP, JOB_GAP, ROLE_GAP, EXPERIENCE_GAP
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    current_level: Mapped[float] = mapped_column(Float, default=3.0, nullable=False)  # 1.0 - 10.0
    target_level: Mapped[float] = mapped_column(Float, default=7.0, nullable=False)
    importance: Mapped[int] = mapped_column(Integer, default=4, nullable=False)  # 1-5
    confidence: Mapped[float] = mapped_column(Float, default=0.9, nullable=False)
    priority: Mapped[str] = mapped_column(String(20), default="HIGH", nullable=False)  # CRITICAL, HIGH, MEDIUM, LOW
    rationale: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    estimated_effort_hours: Mapped[int] = mapped_column(Integer, default=20, nullable=False)
    expected_impact: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    status: Mapped[str] = mapped_column(String(30), default="ACTIVE", nullable=False)  # ACTIVE, IN_PROGRESS, RESOLVED, DISMISSED

    # Relationships
    skill: Mapped[Optional["app.domains.skills.models.Skill"]] = relationship("app.domains.skills.models.Skill")
    job: Mapped[Optional["app.domains.jobs.models.Job"]] = relationship("app.domains.jobs.models.Job")
