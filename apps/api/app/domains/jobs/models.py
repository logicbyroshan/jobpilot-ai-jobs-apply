from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base, TimestampMixin, UUIDPrimaryKeyMixin


class JobSource(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "job_sources"

    name: Mapped[str] = mapped_column(String(100), nullable=False)
    source_type: Mapped[str] = mapped_column(String(50), default="ats", nullable=False)  # ats, company_site, api_feed
    base_url: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    jobs: Mapped[List["Job"]] = relationship("Job", back_populates="job_source")


class Company(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "companies"

    name: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    website_url: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    logo_url: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    industry: Mapped[str] = mapped_column(String(100), default="Technology", nullable=False)
    size_range: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)  # e.g., "50-200", "500-1000"
    location: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    jobs: Mapped[List["Job"]] = relationship("Job", back_populates="company")


class Job(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "jobs"

    job_source_id: Mapped[Optional[str]] = mapped_column(
        String(36), ForeignKey("job_sources.id", ondelete="SET NULL"), index=True, nullable=True
    )
    company_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("companies.id", ondelete="CASCADE"), index=True, nullable=False
    )
    external_id: Mapped[Optional[str]] = mapped_column(String(255), index=True, nullable=True)
    canonical_url: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    seniority: Mapped[str] = mapped_column(String(50), default="Senior", nullable=False)
    employment_type: Mapped[str] = mapped_column(String(50), default="FULL_TIME", nullable=False)
    location: Mapped[str] = mapped_column(String(255), default="Remote", nullable=False)
    is_remote: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    salary_min: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    salary_max: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    salary_currency: Mapped[str] = mapped_column(String(10), default="USD", nullable=False)
    raw_description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    normalized_description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    responsibilities_json: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    requirements_summary_json: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    posted_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Relationships
    company: Mapped["Company"] = relationship("Company", back_populates="jobs", lazy="selectin")
    job_source: Mapped[Optional["JobSource"]] = relationship("JobSource", back_populates="jobs", lazy="selectin")
    requirements: Mapped[List["JobRequirement"]] = relationship(
        "JobRequirement", back_populates="job", cascade="all, delete-orphan", lazy="selectin"
    )


class JobRequirement(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "job_requirements"

    job_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("jobs.id", ondelete="CASCADE"), index=True, nullable=False
    )
    skill_id: Mapped[Optional[str]] = mapped_column(
        String(36), ForeignKey("skills.id", ondelete="SET NULL"), index=True, nullable=True
    )
    requirement_type: Mapped[str] = mapped_column(String(20), default="REQUIRED", nullable=False)  # REQUIRED, PREFERRED
    importance: Mapped[int] = mapped_column(Integer, default=3, nullable=False)  # 1-5
    confidence: Mapped[float] = mapped_column(Float, default=0.9, nullable=False)
    source_text: Mapped[str] = mapped_column(String(512), nullable=False)
    normalized_interpretation: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    job: Mapped["Job"] = relationship("Job", back_populates="requirements")
    skill: Mapped[Optional["app.domains.skills.models.Skill"]] = relationship("app.domains.skills.models.Skill", lazy="selectin")
