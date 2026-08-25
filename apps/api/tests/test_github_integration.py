import pytest
from httpx import AsyncClient

from app.core.config import settings
from app.infrastructure.sources.github import GitHubConnector


@pytest.mark.asyncio
async def test_github_credentials_loaded():
    """Verify that GitHub OAuth credentials are appropriately loaded from environment."""
    assert settings.GITHUB_CLIENT_ID is not None, "GITHUB_CLIENT_ID should be set"
    assert settings.GITHUB_CLIENT_SECRET is not None, "GITHUB_CLIENT_SECRET should be set"
    assert len(settings.GITHUB_CLIENT_ID) > 0
    assert len(settings.GITHUB_CLIENT_SECRET) > 0


@pytest.mark.asyncio
async def test_github_authorization_url_generation():
    """Verify GitHub OAuth authorize URL structure."""
    connector = GitHubConnector(
        client_id=settings.GITHUB_CLIENT_ID,
        client_secret=settings.GITHUB_CLIENT_SECRET,
    )
    url = connector.get_authorization_url(
        redirect_uri="http://localhost:3000/sources?provider=github",
        state="test_state_123",
    )
    assert "https://github.com/login/oauth/authorize" in url
    assert f"client_id={settings.GITHUB_CLIENT_ID}" in url
    assert "scope=read:user,repo" in url
    assert "state=test_state_123" in url


@pytest.mark.asyncio
async def test_github_authorize_endpoint(client: AsyncClient):
    """Test GET /api/v1/sources/github/authorize endpoint."""
    # Register test user
    reg_resp = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "gh_test_user@jobpilot.dev",
            "password": "Password123!",
            "full_name": "GitHub Test Engineer",
            "headline": "Staff Systems Architect",
        },
    )
    assert reg_resp.status_code == 201
    token = reg_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Fetch authorize URL
    resp = await client.get("/api/v1/sources/github/authorize", headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert "authorization_url" in data
    assert data["client_id_configured"] is True
    assert f"client_id={settings.GITHUB_CLIENT_ID}" in data["authorization_url"]


@pytest.mark.asyncio
async def test_github_sync_and_evidence_persistence(client: AsyncClient):
    """Test connecting GitHub and syncing evidence."""
    reg_resp = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "gh_sync_user@jobpilot.dev",
            "password": "Password123!",
            "full_name": "GitHub Sync Engineer",
            "headline": "Staff Systems Architect",
        },
    )
    assert reg_resp.status_code == 201
    token = reg_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Connect GitHub source
    conn_resp = await client.post(
        "/api/v1/sources/github/connect",
        json={"source_url": "https://github.com", "mock_token": "gh_test_token"},
        headers=headers,
    )
    assert conn_resp.status_code == 200
    source_data = conn_resp.json()
    source_id = source_data["id"]

    # Trigger sync
    sync_resp = await client.post(f"/api/v1/sources/{source_id}/sync", headers=headers)
    assert sync_resp.status_code == 200
    sync_data = sync_resp.json()
    assert sync_data["status"] == "success"
    assert sync_data["items_detected"] >= 2

    # Verify evidence items created
    ev_resp = await client.get("/api/v1/evidence", headers=headers)
    assert ev_resp.status_code == 200
    evidence_list = ev_resp.json()
    assert len(evidence_list) >= 2
    gh_evidence = [e for e in evidence_list if e.get("source_type") == "github"]
    assert len(gh_evidence) >= 2
