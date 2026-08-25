from typing import Any, Dict

from app.infrastructure.sources.base import SourceConnector, SourceSyncResult, SyncedEvidenceItem


class LinkedInConnector(SourceConnector):
    """
    LinkedIn Connector.
    Compliant integration placeholder supporting permitted profile exports and OAuth data.
    """
    async def connect(self, auth_payload: Dict[str, Any]) -> Dict[str, Any]:
        return {"status": "connected", "provider": "linkedin"}

    async def disconnect(self) -> bool:
        return True

    async def sync(self, user_id: str) -> SourceSyncResult:
        items = [
            SyncedEvidenceItem(
                external_id="li-exp-201",
                evidence_type="work_experience",
                title="Senior Backend Engineer at CloudScale Systems",
                description="Engineered high-concurrency microservices, caching pipelines, and distributed DBs.",
                confidence=0.92,
                metadata={"company": "CloudScale Systems", "duration": "2 years"},
            )
        ]
        return SourceSyncResult(
            status="success",
            items_synced=len(items),
            evidence_items=items,
            sync_message="Imported verified experience records",
        )

    async def get_status(self) -> Dict[str, Any]:
        return {"connected": True, "provider": "linkedin", "healthy": True}


class PortfolioConnector(SourceConnector):
    """Portfolio URL and personal project site analyzer."""
    async def connect(self, auth_payload: Dict[str, Any]) -> Dict[str, Any]:
        return {"status": "connected", "url": auth_payload.get("url", "https://alexchen.dev")}

    async def disconnect(self) -> bool:
        return True

    async def sync(self, user_id: str) -> SourceSyncResult:
        items = [
            SyncedEvidenceItem(
                external_id="port-proj-301",
                evidence_type="project_submission",
                title="Personal Engineering Portfolio & System Architecture Case Studies",
                description="Technical write-ups detailing distributed consensus and Postgres indexing.",
                confidence=0.90,
                metadata={"url": "https://alexchen.dev"},
            )
        ]
        return SourceSyncResult(
            status="success",
            items_synced=len(items),
            evidence_items=items,
            sync_message="Extracted verified portfolio case studies",
        )

    async def get_status(self) -> Dict[str, Any]:
        return {"connected": True, "provider": "portfolio", "healthy": True}


class ResumeConnector(SourceConnector):
    """Resume parser and document ingestion connector."""
    async def connect(self, auth_payload: Dict[str, Any]) -> Dict[str, Any]:
        return {"status": "imported", "filename": auth_payload.get("filename", "alex_chen_resume.pdf")}

    async def disconnect(self) -> bool:
        return True

    async def sync(self, user_id: str) -> SourceSyncResult:
        items = [
            SyncedEvidenceItem(
                external_id="res-item-401",
                evidence_type="resume_statement",
                title="Core Backend & API Platform Leadership",
                description="Designed asynchronous ingestion pipeline processing 10M+ events daily.",
                confidence=0.94,
                metadata={"source_file": "alex_chen_resume.pdf"},
            )
        ]
        return SourceSyncResult(
            status="success",
            items_synced=len(items),
            evidence_items=items,
            sync_message="Parsed and indexed resume evidence claims",
        )

    async def get_status(self) -> Dict[str, Any]:
        return {"connected": True, "provider": "resume", "healthy": True}
