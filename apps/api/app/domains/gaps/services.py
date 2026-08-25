from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.errors import ResourceNotFoundException
from app.domains.gaps.models import Gap
from app.domains.gaps.schemas import GapCreate


class GapService:
    @staticmethod
    async def list_user_gaps(
        session: AsyncSession,
        user_id: str,
        status: Optional[str] = None,
        priority: Optional[str] = None,
    ) -> List[Gap]:
        query = (
            select(Gap)
            .where(Gap.user_id == user_id)
            .options(
                selectinload(Gap.skill),
                selectinload(Gap.job),
            )
            .order_by(Gap.importance.desc())
        )
        if status:
            query = query.where(Gap.status == status)
        if priority:
            query = query.where(Gap.priority == priority)

        result = await session.execute(query)
        return list(result.scalars().all())

    @staticmethod
    async def get_gap_by_id(session: AsyncSession, user_id: str, gap_id: str) -> Gap:
        result = await session.execute(
            select(Gap)
            .where(Gap.id == gap_id, Gap.user_id == user_id)
            .options(
                selectinload(Gap.skill),
                selectinload(Gap.job),
            )
        )
        gap = result.scalar_one_or_none()
        if not gap:
            raise ResourceNotFoundException(f"Gap {gap_id} not found")
        return gap

    @staticmethod
    async def create_gap(session: AsyncSession, user_id: str, data: GapCreate) -> Gap:
        gap = Gap(
            user_id=user_id,
            skill_id=data.skill_id,
            job_id=data.job_id,
            gap_type=data.gap_type,
            title=data.title,
            current_level=data.current_level,
            target_level=data.target_level,
            importance=data.importance,
            confidence=data.confidence,
            priority=data.priority,
            rationale=data.rationale,
            estimated_effort_hours=data.estimated_effort_hours,
            expected_impact=data.expected_impact,
            status=data.status,
        )
        session.add(gap)
        await session.flush()
        return await GapService.get_gap_by_id(session, user_id, gap.id)
