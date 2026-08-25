from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base, TimestampMixin, UUIDPrimaryKeyMixin


class ApplicationEvent(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "application_events"

    application_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("applications.id", ondelete="CASCADE"), index=True, nullable=False
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    event_type: Mapped[str] = mapped_column(
        String(50), nullable=False
    )  # SUBMITTED, RECRUITER_RESPONSE, INTERVIEW_SCHEDULED, TECHNICAL_INTERVIEW, FINAL_ROUND, REJECTION, OFFER
    occurred_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    metadata_json: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)

    application: Mapped["app.domains.applications.models.Application"] = relationship(
        "app.domains.applications.models.Application", back_populates="events"
    )


class OutcomeFeedback(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "outcome_feedbacks"

    application_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("applications.id", ondelete="CASCADE"), index=True, nullable=False
    )
    feedback_stage: Mapped[str] = mapped_column(
        String(50), default="TECHNICAL", nullable=False
    )  # RECRUITER, TECHNICAL, SYSTEM_DESIGN, BEHAVIORAL, OFFER
    bottleneck_identified: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    structured_rating: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)  # 1-5
    raw_feedback: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
