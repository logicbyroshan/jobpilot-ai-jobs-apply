from datetime import datetime
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import JSON, Boolean, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base, TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.domains.jobs.models import Job
    from app.domains.outcomes.models import ApplicationEvent


class Application(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "applications"

    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    job_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("jobs.id", ondelete="CASCADE"), index=True, nullable=False
    )
    status: Mapped[str] = mapped_column(
        String(50), default="DRAFT", index=True, nullable=False
    )  # DRAFT, READY, SUBMITTED, RECRUITER_RESPONSE, INTERVIEW, TECHNICAL_ROUND, FINAL_ROUND, OFFER, REJECTED, WITHDRAWN
    tailored_role_title: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    match_score_at_application: Mapped[float] = mapped_column(Float, default=85.0, nullable=False)
    applied_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Relationships
    job: Mapped["Job"] = relationship("app.domains.jobs.models.Job")
    artifacts: Mapped[List["ApplicationArtifact"]] = relationship(
        "ApplicationArtifact", back_populates="application", cascade="all, delete-orphan"
    )
    events: Mapped[List["ApplicationEvent"]] = relationship(
        "app.domains.outcomes.models.ApplicationEvent", back_populates="application", cascade="all, delete-orphan"
    )


class ApplicationArtifact(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "application_artifacts"

    application_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("applications.id", ondelete="CASCADE"), index=True, nullable=False
    )
    artifact_type: Mapped[str] = mapped_column(
        String(50), default="TAILORED_RESUME", nullable=False
    )  # TAILORED_RESUME, COVER_LETTER, APPLICATION_ANSWER, PORTFOLIO_SELECTION
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    content_text: Mapped[str] = mapped_column(Text, nullable=False)
    provenance_sources_json: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)

    application: Mapped["Application"] = relationship("Application", back_populates="artifacts")


class ApplicationPolicy(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "application_policies"

    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, index=True, nullable=False
    )
    mode: Mapped[str] = mapped_column(String(30), default="MANUAL", nullable=False)  # MANUAL, ASSISTED, AUTO_APPLY
    is_auto_apply_enabled: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    min_match_score: Mapped[float] = mapped_column(Float, default=85.0, nullable=False)
    daily_application_limit: Mapped[int] = mapped_column(Integer, default=5, nullable=False)
    requires_user_approval: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
