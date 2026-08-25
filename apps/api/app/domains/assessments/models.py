from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base, TimestampMixin, UUIDPrimaryKeyMixin


class Assessment(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "assessments"

    skill_id: Mapped[Optional[str]] = mapped_column(
        String(36), ForeignKey("skills.id", ondelete="SET NULL"), index=True, nullable=True
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    assessment_type: Mapped[str] = mapped_column(
        String(50), default="KNOWLEDGE", nullable=False
    )  # KNOWLEDGE, CODING, DEBUGGING, SYSTEM_DESIGN, SCENARIO
    time_limit_minutes: Mapped[int] = mapped_column(Integer, default=20, nullable=False)
    passing_score: Mapped[float] = mapped_column(Float, default=70.0, nullable=False)
    difficulty: Mapped[str] = mapped_column(String(50), default="INTERMEDIATE", nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Relationships
    questions: Mapped[List["AssessmentQuestion"]] = relationship(
        "AssessmentQuestion", back_populates="assessment", cascade="all, delete-orphan", order_by="AssessmentQuestion.order_index", lazy="selectin"
    )
    skill: Mapped[Optional["app.domains.skills.models.Skill"]] = relationship("app.domains.skills.models.Skill", lazy="selectin")


class AssessmentQuestion(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "assessment_questions"

    assessment_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("assessments.id", ondelete="CASCADE"), index=True, nullable=False
    )
    order_index: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    prompt: Mapped[str] = mapped_column(Text, nullable=False)
    question_type: Mapped[str] = mapped_column(
        String(30), default="MULTIPLE_CHOICE", nullable=False
    )  # MULTIPLE_CHOICE, SCENARIO, CODE
    options_json: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    correct_answer: Mapped[str] = mapped_column(String(255), nullable=False)
    explanation: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    points: Mapped[int] = mapped_column(Integer, default=10, nullable=False)

    assessment: Mapped["Assessment"] = relationship("Assessment", back_populates="questions")


class AssessmentAttempt(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "assessment_attempts"

    assessment_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("assessments.id", ondelete="CASCADE"), index=True, nullable=False
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    status: Mapped[str] = mapped_column(
        String(30), default="SUBMITTED", nullable=False
    )  # IN_PROGRESS, SUBMITTED, EVALUATED
    score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    passed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    skill_proficiency_boost: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    feedback_summary: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    submitted_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )

    assessment: Mapped["Assessment"] = relationship("Assessment")
