from datetime import datetime, timezone
from typing import List, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.errors import ResourceNotFoundException
from app.core.security import SecretVault
from app.domains.evidence.models import Evidence
from app.domains.sources.models import Source, SourceConnection
from app.domains.sources.schemas import SourceConnectRequest, SourceSyncResponse
from app.infrastructure.sources.github import GitHubConnector


class SourceService:
    @staticmethod
    async def list_sources(session: AsyncSession, user_id: str) -> List[Source]:
        result = await session.execute(
            select(Source).where(Source.user_id == user_id).order_by(Source.created_at.asc())
        )
        return list(result.scalars().all())

    @staticmethod
    async def get_source_by_id(session: AsyncSession, user_id: str, source_id: str) -> Source:
        result = await session.execute(
            select(Source).where(Source.id == source_id, Source.user_id == user_id)
        )
        source = result.scalar_one_or_none()
        if not source:
            raise ResourceNotFoundException(f"Source {source_id} not found")
        return source

    @staticmethod
    async def connect_source(
        session: AsyncSession, user_id: str, source_type: str, req: SourceConnectRequest
    ) -> Source:
        result = await session.execute(
            select(Source).where(Source.user_id == user_id, Source.source_type == source_type)
        )
        source = result.scalar_one_or_none()

        display_names = {
            "github": "GitHub",
            "linkedin": "LinkedIn",
            "portfolio": "Personal Portfolio",
            "resume": "Resume Document",
        }

        if not source:
            source = Source(
                user_id=user_id,
                source_type=source_type,
                display_name=display_names.get(source_type, source_type.capitalize()),
                status="connected",
                source_url=req.source_url,
                last_synced_at=datetime.now(timezone.utc),
                sync_status_message="Connected successfully",
            )
            session.add(source)
            await session.flush()
        else:
            source.status = "connected"
            if req.source_url:
                source.source_url = req.source_url
            source.last_synced_at = datetime.now(timezone.utc)
            source.sync_status_message = "Reconnected successfully"

        # Create or update connection with encrypted token
        raw_token = req.mock_token or "mock_token"
        encrypted_token = SecretVault.encrypt(raw_token)
        conn_res = await session.execute(
            select(SourceConnection).where(SourceConnection.source_id == source.id)
        )
        conn = conn_res.scalar_one_or_none()
        if not conn:
            conn = SourceConnection(
                source_id=source.id,
                encrypted_token=encrypted_token,
                scopes_json=["read:user", "repo"] if source_type == "github" else ["read"],
            )
            session.add(conn)
        else:
            conn.encrypted_token = encrypted_token

        await session.flush()
        return source

    @staticmethod
    async def disconnect_source(session: AsyncSession, user_id: str, source_id: str) -> Source:
        source = await SourceService.get_source_by_id(session, user_id, source_id)
        source.status = "disconnected"
        source.sync_status_message = "Disconnected by user"
        await session.flush()
        return source

    @staticmethod
    async def sync_source(
        session: AsyncSession, user_id: str, source_id: str, access_token: Optional[str] = None
    ) -> SourceSyncResponse:
        source = await SourceService.get_source_by_id(session, user_id, source_id)
        now = datetime.now(timezone.utc)

        # Retrieve token if not directly supplied
        token = access_token
        if not token:
            conn_res = await session.execute(
                select(SourceConnection).where(SourceConnection.source_id == source.id)
            )
            conn = conn_res.scalar_one_or_none()
            if conn and conn.encrypted_token:
                try:
                    token = SecretVault.decrypt(conn.encrypted_token)
                except Exception:
                    token = None

        items_detected = 0
        sync_message = "Evidence synchronized successfully"

        if source.source_type == "github":
            connector = GitHubConnector(
                client_id=settings.GITHUB_CLIENT_ID or "",
                client_secret=settings.GITHUB_CLIENT_SECRET or "",
            )
            sync_res = await connector.sync(user_id, access_token=token)
            items_detected = sync_res.items_synced
            sync_message = sync_res.sync_message

            # Persist synced evidence items into database
            for item in sync_res.evidence_items:
                ev_res = await session.execute(
                    select(Evidence).where(
                        Evidence.user_id == user_id,
                        Evidence.external_id == item.external_id,
                    )
                )
                ev = ev_res.scalar_one_or_none()
                if not ev:
                    ev = Evidence(
                        user_id=user_id,
                        source_id=source.id,
                        source_type="github",
                        evidence_type=item.evidence_type,
                        external_id=item.external_id,
                        title=item.title,
                        description=item.description,
                        confidence=item.confidence,
                        metadata_json=item.metadata,
                    )
                    session.add(ev)
                else:
                    ev.title = item.title
                    ev.description = item.description
                    ev.confidence = item.confidence
                    ev.metadata_json = item.metadata

        source.status = "connected"
        source.last_synced_at = now
        source.sync_status_message = sync_message
        await session.flush()

        return SourceSyncResponse(
            source_id=source.id,
            status="success",
            message=sync_message,
            synced_at=now,
            items_detected=max(items_detected, 1),
        )
