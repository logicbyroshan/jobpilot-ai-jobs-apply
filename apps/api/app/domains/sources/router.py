from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import CurrentUser, get_current_user
from app.domains.sources.schemas import (
    SourceConnectRequest,
    SourceResponse,
    SourceSyncResponse,
)
from app.domains.sources.services import SourceService

router = APIRouter(prefix="/sources", tags=["Sources & Integrations"])


@router.get("", response_model=List[SourceResponse])
async def list_sources(
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """List all connected and available professional identity sources."""
    return await SourceService.list_sources(db, current_user.id)


@router.post("/{source_type}/connect", response_model=SourceResponse)
async def connect_source(
    source_type: str,
    req: SourceConnectRequest,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """Connect a source provider (GitHub, LinkedIn, Resume, Portfolio) with mock credentials."""
    return await SourceService.connect_source(db, current_user.id, source_type, req)


@router.post("/{source_id}/sync", response_model=SourceSyncResponse)
async def sync_source(
    source_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """Trigger synchronization for a specific source."""
    return await SourceService.sync_source(db, current_user.id, source_id)


@router.post("/{source_id}/disconnect", response_model=SourceResponse)
async def disconnect_source(
    source_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """Disconnect a source provider."""
    return await SourceService.disconnect_source(db, current_user.id, source_id)
