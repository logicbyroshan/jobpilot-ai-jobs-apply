from typing import Any, Dict, List, Optional, Protocol
from pydantic import BaseModel


class DiscoveredJobPayload(BaseModel):
    external_id: str
    canonical_url: str
    company_name: str
    title: str
    location: str
    is_remote: bool
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    raw_description: str
    requirements: List[str] = []


class JobSourceConnector(Protocol):
    """
    Protocol for external job ingestion connectors (ATS feeds, Company Portals, Verified APIs).
    """
    async def discover_jobs(self, limit: int = 50) -> List[DiscoveredJobPayload]:
        ...

    async def fetch_job(self, external_id: str) -> Optional[DiscoveredJobPayload]:
        ...

    async def health_check(self) -> Dict[str, Any]:
        ...
