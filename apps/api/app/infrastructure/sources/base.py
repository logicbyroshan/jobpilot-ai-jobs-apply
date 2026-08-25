from typing import Any, Dict, List, Optional, Protocol

from pydantic import BaseModel


class SyncedEvidenceItem(BaseModel):
    external_id: str
    evidence_type: str
    title: str
    description: Optional[str] = None
    confidence: float = 0.9
    raw_payload: Dict[str, Any] = {}
    metadata: Dict[str, Any] = {}


class SourceSyncResult(BaseModel):
    status: str
    items_synced: int
    evidence_items: List[SyncedEvidenceItem]
    sync_message: str


class SourceConnector(Protocol):
    """
    Standard protocol for all professional identity source connectors.
    """
    async def connect(self, auth_payload: Dict[str, Any]) -> Dict[str, Any]:
        ...

    async def disconnect(self) -> bool:
        ...

    async def sync(self, user_id: str) -> SourceSyncResult:
        ...

    async def get_status(self) -> Dict[str, Any]:
        ...
