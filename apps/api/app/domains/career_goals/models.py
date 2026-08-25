from typing import Optional

from sqlalchemy import Boolean, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base, TimestampMixin, UUIDPrimaryKeyMixin


class CareerGoal(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "career_goals"

    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    target_role: Mapped[str] = mapped_column(String(100), nullable=False)
    target_seniority: Mapped[str] = mapped_column(String(50), default="Senior", nullable=False)
    location_preference: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    is_remote_preferred: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    employment_type: Mapped[str] = mapped_column(String(50), default="FULL_TIME", nullable=False)
    target_salary_min: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    target_salary_max: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    target_currency: Mapped[str] = mapped_column(String(10), default="USD", nullable=False)
    priority: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
