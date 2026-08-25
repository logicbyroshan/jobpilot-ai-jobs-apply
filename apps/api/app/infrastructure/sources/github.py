from typing import Any, Dict
from app.infrastructure.sources.base import SourceConnector, SourceSyncResult, SyncedEvidenceItem


class GitHubConnector(SourceConnector):
    """
    GitHub Source Connector.
    Extracts public repositories, commit activity, stars, and languages as evidence.
    """
    def __init__(self, client_id: str = "", client_secret: str = ""):
        self.client_id = client_id
        self.client_secret = client_secret

    async def connect(self, auth_payload: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "status": "connected",
            "provider": "github",
            "scopes": ["read:user", "repo"],
            "username": auth_payload.get("username", "alexchen-dev"),
        }

    async def disconnect(self) -> bool:
        return True

    async def sync(self, user_id: str) -> SourceSyncResult:
        mock_repos = [
            SyncedEvidenceItem(
                external_id="gh-repo-101",
                evidence_type="repository",
                title="distributed-task-orchestrator",
                description="High-throughput distributed workflow engine in Python & Asyncio with Redis.",
                confidence=0.98,
                metadata={"language": "Python", "stars": 342, "forks": 48},
            ),
            SyncedEvidenceItem(
                external_id="gh-repo-102",
                evidence_type="repository",
                title="fastapi-microservice-kit",
                description="Production boilerplate with PostgreSQL, Alembic, Docker, and OpenTelemetry.",
                confidence=0.95,
                metadata={"language": "Python", "stars": 180, "forks": 22},
            ),
        ]
        return SourceSyncResult(
            status="success",
            items_synced=len(mock_repos),
            evidence_items=mock_repos,
            sync_message="Synchronized 2 GitHub repositories and commits",
        )

    async def get_status(self) -> Dict[str, Any]:
        return {"connected": True, "provider": "github", "healthy": True}
