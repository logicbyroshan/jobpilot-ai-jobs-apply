from typing import Any, Dict, List, Optional

from app.infrastructure.jobs.base import DiscoveredJobPayload, JobSourceConnector


class ATSConnector(JobSourceConnector):
    """Greenhouse / Lever / Ashby ATS Ingestion Adapter."""
    def __init__(self, ats_provider: str = "Greenhouse"):
        self.ats_provider = ats_provider

    async def discover_jobs(self, limit: int = 50) -> List[DiscoveredJobPayload]:
        return [
            DiscoveredJobPayload(
                external_id="gh-job-801",
                canonical_url="https://boards.greenhouse.io/datascale/jobs/801",
                company_name="DataScale Labs",
                title="Staff Backend Infrastructure Engineer",
                location="San Francisco, CA / Remote",
                is_remote=True,
                salary_min=185000,
                salary_max=235000,
                raw_description="Design high-throughput ingestion pipelines and database sharding architectures.",
                requirements=["Python", "FastAPI", "PostgreSQL", "Kafka", "Kubernetes", "AWS"],
            )
        ]

    async def fetch_job(self, external_id: str) -> Optional[DiscoveredJobPayload]:
        jobs = await self.discover_jobs(limit=1)
        return jobs[0] if jobs else None

    async def health_check(self) -> Dict[str, Any]:
        return {"status": "healthy", "provider": self.ats_provider}


class CompanyCareerConnector(JobSourceConnector):
    """Direct Company Career Portal Webhook/Feed Connector."""
    async def discover_jobs(self, limit: int = 50) -> List[DiscoveredJobPayload]:
        return []

    async def fetch_job(self, external_id: str) -> Optional[DiscoveredJobPayload]:
        return None

    async def health_check(self) -> Dict[str, Any]:
        return {"status": "healthy", "provider": "CareerPortal"}


class APIJobConnector(JobSourceConnector):
    """Normalized API Ingestion Partner Adapter."""
    async def discover_jobs(self, limit: int = 50) -> List[DiscoveredJobPayload]:
        return []

    async def fetch_job(self, external_id: str) -> Optional[DiscoveredJobPayload]:
        return None

    async def health_check(self) -> Dict[str, Any]:
        return {"status": "healthy", "provider": "APIJobFeed"}
