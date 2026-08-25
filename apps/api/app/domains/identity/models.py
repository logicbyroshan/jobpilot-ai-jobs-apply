from typing import List, Optional

from sqlalchemy import JSON, Boolean, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base, TimestampMixin, UUIDPrimaryKeyMixin


class User(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    hashed_password: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    google_id: Mapped[Optional[str]] = mapped_column(String(255), unique=True, index=True, nullable=True)
    auth_provider: Mapped[str] = mapped_column(String(50), default="local", nullable=False)
    avatar_url: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Relationships
    identity: Mapped[Optional["ProfessionalIdentity"]] = relationship(
        "ProfessionalIdentity", back_populates="user", uselist=False, cascade="all, delete-orphan"
    )


class ProfessionalIdentity(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "professional_identities"

    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, index=True, nullable=False
    )
    headline: Mapped[str] = mapped_column(String(255), nullable=False)
    bio: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    years_of_experience: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    current_level: Mapped[str] = mapped_column(String(50), default="Mid-Level", nullable=False)
    profile_confidence: Mapped[float] = mapped_column(Float, default=0.85, nullable=False)
    summary_json: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="identity")
    experiences: Mapped[List["Experience"]] = relationship(
        "Experience", back_populates="identity", cascade="all, delete-orphan"
    )
    projects: Mapped[List["Project"]] = relationship(
        "Project", back_populates="identity", cascade="all, delete-orphan"
    )


class Experience(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "experiences"

    identity_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("professional_identities.id", ondelete="CASCADE"), index=True, nullable=False
    )
    company_name: Mapped[str] = mapped_column(String(255), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    location: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    is_remote: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    start_date: Mapped[str] = mapped_column(String(20), nullable=False)
    end_date: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    is_current: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    technologies_json: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)

    identity: Mapped["ProfessionalIdentity"] = relationship("ProfessionalIdentity", back_populates="experiences")


class Project(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "projects"

    identity_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("professional_identities.id", ondelete="CASCADE"), index=True, nullable=False
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    url: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    repository_url: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    technologies_json: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    stars_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    provenance_source: Mapped[str] = mapped_column(String(50), default="github", nullable=False)

    identity: Mapped["ProfessionalIdentity"] = relationship("ProfessionalIdentity", back_populates="projects")
