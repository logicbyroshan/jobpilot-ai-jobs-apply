from datetime import datetime, timezone
from typing import TYPE_CHECKING, Optional

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base, TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.domains.evidence.models import Evidence


class Skill(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "skills"

    name: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    category: Mapped[str] = mapped_column(String(50), default="General", nullable=False)  # Backend, DevOps, Database, Architecture, etc.
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)


class SkillEvidence(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "skill_evidence"
    __table_args__ = (
        UniqueConstraint("user_id", "skill_id", "evidence_id", name="uq_user_skill_evidence"),
    )

    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    skill_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("skills.id", ondelete="CASCADE"), index=True, nullable=False
    )
    evidence_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("evidence.id", ondelete="CASCADE"), index=True, nullable=False
    )
    strength: Mapped[str] = mapped_column(String(20), default="STRONG", nullable=False)  # STRONG, MODERATE, WEAK
    confidence: Mapped[float] = mapped_column(Float, default=0.9, nullable=False)
    proficiency_estimate: Mapped[float] = mapped_column(Float, default=7.0, nullable=False)  # 1.0 - 10.0 scale
    is_user_claimed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    freshness_days: Mapped[int] = mapped_column(Integer, default=30, nullable=False)
    last_verified_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )

    # Relationships
    skill: Mapped["Skill"] = relationship("Skill")
    evidence: Mapped["Evidence"] = relationship("app.domains.evidence.models.Evidence")
