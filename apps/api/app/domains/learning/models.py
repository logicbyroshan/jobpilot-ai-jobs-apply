from typing import List, Optional
from sqlalchemy import Boolean, Float, ForeignKey, Integer, String, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base, TimestampMixin, UUIDPrimaryKeyMixin


class Resource(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "learning_resources"

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    provider: Mapped[str] = mapped_column(String(100), nullable=False)
    url: Mapped[str] = mapped_column(String(512), nullable=False)
    cost: Mapped[str] = mapped_column(String(20), default="FREE", nullable=False)  # FREE, PAID
    resource_type: Mapped[str] = mapped_column(
        String(50), default="DOCUMENTATION", nullable=False
    )  # DOCUMENTATION, COURSE, BOOK, PROJECT, TUTORIAL, EXERCISE
    difficulty: Mapped[str] = mapped_column(String(50), default="INTERMEDIATE", nullable=False)
    duration_hours: Mapped[float] = mapped_column(Float, default=5.0, nullable=False)
    topics_json: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    quality_score: Mapped[float] = mapped_column(Float, default=4.8, nullable=False)
    metadata_json: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)


class LearningPlan(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "learning_plans"

    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    gap_id: Mapped[Optional[str]] = mapped_column(
        String(36), ForeignKey("gaps.id", ondelete="SET NULL"), index=True, nullable=True
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    target_skill: Mapped[str] = mapped_column(String(100), nullable=False)
    current_level: Mapped[float] = mapped_column(Float, default=3.0, nullable=False)
    target_level: Mapped[float] = mapped_column(Float, default=7.0, nullable=False)
    progress_percentage: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    estimated_duration_days: Mapped[int] = mapped_column(Integer, default=14, nullable=False)
    status: Mapped[str] = mapped_column(String(30), default="IN_PROGRESS", nullable=False)  # IN_PROGRESS, COMPLETED, PAUSED

    # Relationships
    items: Mapped[List["LearningPlanItem"]] = relationship(
        "LearningPlanItem", back_populates="learning_plan", cascade="all, delete-orphan", order_by="LearningPlanItem.order_index"
    )
    gap: Mapped[Optional["app.domains.gaps.models.Gap"]] = relationship("app.domains.gaps.models.Gap")


class LearningPlanItem(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "learning_plan_items"

    learning_plan_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("learning_plans.id", ondelete="CASCADE"), index=True, nullable=False
    )
    resource_id: Mapped[Optional[str]] = mapped_column(
        String(36), ForeignKey("learning_resources.id", ondelete="SET NULL"), index=True, nullable=True
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    item_type: Mapped[str] = mapped_column(
        String(30), default="READ", nullable=False
    )  # READ, WATCH, BUILD, PRACTICE, PROVE
    order_index: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    is_completed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    estimated_minutes: Mapped[int] = mapped_column(Integer, default=45, nullable=False)
    status: Mapped[str] = mapped_column(
        String(30), default="PENDING", nullable=False
    )  # COMPLETED, IN_PROGRESS, LOCKED, PENDING

    learning_plan: Mapped["LearningPlan"] = relationship("LearningPlan", back_populates="items")
    resource: Mapped[Optional["Resource"]] = relationship("Resource")
