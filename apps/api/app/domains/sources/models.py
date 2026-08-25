from datetime import datetime
from typing import Optional
from sqlalchemy import DateTime, ForeignKey, String, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base, TimestampMixin, UUIDPrimaryKeyMixin


class Source(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "sources"

    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    source_type: Mapped[str] = mapped_column(String(50), nullable=False)  # github, linkedin, resume, portfolio
    display_name: Mapped[str] = mapped_column(String(100), nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="disconnected", nullable=False)  # connected, disconnected, syncing, imported, error
    source_url: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    last_synced_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    sync_status_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    metadata_json: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)

    connection: Mapped[Optional["SourceConnection"]] = relationship(
        "SourceConnection", back_populates="source", uselist=False, cascade="all, delete-orphan"
    )


class SourceConnection(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "source_connections"

    source_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("sources.id", ondelete="CASCADE"), unique=True, index=True, nullable=False
    )
    encrypted_token: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    encrypted_refresh_token: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    scopes_json: Mapped[list] = mapped_column(JSON, default=list, nullable=False)
    expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    source: Mapped["Source"] = relationship("Source", back_populates="connection")
