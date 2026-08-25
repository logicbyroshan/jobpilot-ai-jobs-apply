from typing import List

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domains.evidence.models import Evidence
from app.domains.evidence.schemas import EvidenceCreate


class EvidenceService:
    @staticmethod
    async def list_user_evidence(session: AsyncSession, user_id: str) -> List[Evidence]:
        result = await session.execute(
            select(Evidence).where(Evidence.user_id == user_id).order_by(Evidence.observed_at.desc())
        )
        return list(result.scalars().all())

    @staticmethod
    async def create_evidence(session: AsyncSession, user_id: str, data: EvidenceCreate) -> Evidence:
        evidence = Evidence(
            user_id=user_id,
            source_id=data.source_id,
            source_type=data.source_type,
            evidence_type=data.evidence_type,
            external_id=data.external_id,
            title=data.title,
            description=data.description,
            confidence=data.confidence,
            raw_payload_json=data.raw_payload_json,
            metadata_json=data.metadata_json,
        )
        session.add(evidence)
        await session.flush()
        return evidence
