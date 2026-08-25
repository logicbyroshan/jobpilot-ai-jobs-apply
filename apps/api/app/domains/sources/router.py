from typing import List, Optional

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.core.security import CurrentUser, get_current_user
from app.domains.sources.schemas import (
    SourceConnectRequest,
    SourceResponse,
    SourceSyncResponse,
)
from app.domains.sources.services import SourceService
from app.infrastructure.sources.github import GitHubConnector

router = APIRouter(prefix="/sources", tags=["Sources & Integrations"])


@router.get("", response_model=List[SourceResponse])
async def list_sources(
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """List all connected and available professional identity sources."""
    return await SourceService.list_sources(db, current_user.id)


@router.get("/github/authorize")
async def get_github_authorize_url(
    redirect_uri: str = "http://localhost:3000/sources?provider=github",
    state: str = "jobpilot_auth",
    current_user: CurrentUser = Depends(get_current_user),
):
    """Generate GitHub OAuth URL configured with GITHUB_CLIENT_ID."""
    connector = GitHubConnector(
        client_id=settings.GITHUB_CLIENT_ID or "",
        client_secret=settings.GITHUB_CLIENT_SECRET or "",
    )
    url = connector.get_authorization_url(redirect_uri=redirect_uri, state=state)
    return {
        "authorization_url": url,
        "client_id_configured": bool(settings.GITHUB_CLIENT_ID),
    }


@router.post("/github/callback", response_model=SourceResponse)
async def github_oauth_callback(
    code: str,
    redirect_uri: Optional[str] = "http://localhost:3000/sources?provider=github",
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """Exchange OAuth code for access token, connect GitHub, and synchronize repositories."""
    connector = GitHubConnector(
        client_id=settings.GITHUB_CLIENT_ID or "",
        client_secret=settings.GITHUB_CLIENT_SECRET or "",
    )
    token_resp = await connector.exchange_code_for_token(code=code, redirect_uri=redirect_uri)
    access_token = token_resp.get("access_token")

    req = SourceConnectRequest(
        mock_token=access_token or "gh_oauth_token",
        source_url="https://github.com",
    )
    source = await SourceService.connect_source(db, current_user.id, "github", req)
    await SourceService.sync_source(db, current_user.id, source.id, access_token=access_token)
    return source


@router.post("/{source_type}/connect", response_model=SourceResponse)
async def connect_source(
    source_type: str,
    req: SourceConnectRequest,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """Connect a source provider (GitHub, LinkedIn, Resume, Portfolio)."""
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
