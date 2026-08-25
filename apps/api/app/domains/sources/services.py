from datetime import datetime, timezone
from typing import List

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import ResourceNotFoundException
from app.core.security import SecretVault
from app.domains.sources.models import Source, SourceConnection
from app.domains.sources.schemas import SourceConnectRequest, SourceSyncResponse


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
                sync_status_message="Connected successfully via mock provider",
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
        encrypted_token = SecretVault.encrypt(req.mock_token or "mock_token")
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
    async def sync_source(session: AsyncSession, user_id: str, source_id: str) -> SourceSyncResponse:
        source = await SourceService.get_source_by_id(session, user_id, source_id)
        now = datetime.now(timezone.utc)
        source.status = "connected"
        source.last_synced_at = now
        source.sync_status_message = f"Synchronized successfully at {now.strftime('%H:%M:%S')}"
        await session.flush()

        return SourceSyncResponse(
            source_id=source.id,
            status="success",
            message="Evidence synchronized idempotently",
            synced_at=now,
            items_detected=4,
        )
