from typing import Any, Dict, List, Optional, Tuple

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.errors import ResourceNotFoundException
from app.domains.gaps.models import Gap
from app.domains.gaps.schemas import GapCreate


class GapPriorityEngine:
    """
    Evaluates career impact, market frequency, and deficit magnitude to prioritize gaps.
    """

    @staticmethod
    def calculate_priority(
        target_role_coverage_pct: float,
        level_deficit: float,
        is_hard_requirement: bool,
    ) -> Tuple[str, float]:
        """
        Returns (priority_label, importance_score 0-1.0)
        """
        score = (target_role_coverage_pct * 0.50) + (min(level_deficit / 5.0, 1.0) * 0.30)
        if is_hard_requirement:
            score += 0.20

        score = round(min(1.0, max(0.1, score)), 2)

        if score >= 0.80:
            return "CRITICAL", score
        elif score >= 0.60:
            return "HIGH", score
        elif score >= 0.40:
            return "MEDIUM", score
        return "LOW", score


class GapAnalysisEngine:
    """
    Canonical gap detection engine discovering capability, evidence, and outcome deficits.
    """

    @staticmethod
    def diagnose_deficits(
        user_skills_map: Dict[str, float],
        verified_skills_set: set,
        job_requirements: List[Dict[str, Any]],
        outcome_history: Optional[List[Dict[str, Any]]] = None,
    ) -> List[Dict[str, Any]]:
        detected_gaps: List[Dict[str, Any]] = []

        for req in job_requirements:
            skill_name = req.get("name", "")
            target_level = float(req.get("target_level", 7.0))
            is_required = req.get("required", True)

            current_level = user_skills_map.get(skill_name.lower(), 0.0)

            # 1. Complete Skill Gap (User lacks skill entirely)
            if current_level == 0.0:
                priority, importance = GapPriorityEngine.calculate_priority(
                    target_role_coverage_pct=0.74,
                    level_deficit=target_level,
                    is_hard_requirement=is_required,
                )
                detected_gaps.append({
                    "title": f"{skill_name} Competency Deficit",
                    "gap_type": "SKILL_GAP",
                    "current_level": 0.0,
                    "target_level": target_level,
                    "priority": priority,
                    "importance": importance,
                    "rationale": "Required in target roles. Currently absent from your verified professional identity.",
                    "expected_impact": "Blocks 74% of target roles in this seniority band",
                    "estimated_effort_hours": 24,
                })

            # 2. Capability Gap (User level < target level)
            elif current_level < target_level - 1.0:
                deficit = target_level - current_level
                priority, importance = GapPriorityEngine.calculate_priority(
                    target_role_coverage_pct=0.65,
                    level_deficit=deficit,
                    is_hard_requirement=is_required,
                )
                detected_gaps.append({
                    "title": f"{skill_name} Production Mastery",
                    "gap_type": "EXPERIENCE_GAP",
                    "current_level": current_level,
                    "target_level": target_level,
                    "priority": priority,
                    "importance": importance,
                    "rationale": f"Current capability ({current_level}/10) is below target seniority expectation ({target_level}/10).",
                    "expected_impact": "Unlocks top-tier compensation bands when resolved",
                    "estimated_effort_hours": int(deficit * 6),
                })

            # 3. Evidence Gap (User has skill but not verified with proof)
            elif skill_name.lower() not in verified_skills_set:
                detected_gaps.append({
                    "title": f"{skill_name} Proof Verification",
                    "gap_type": "EVIDENCE_GAP",
                    "current_level": current_level,
                    "target_level": target_level,
                    "priority": "HIGH",
                    "importance": 0.75,
                    "rationale": "Knowledge documented, but lacks objective diagnostic proof in Stage 5.",
                    "expected_impact": "Directly boosts match confidence across recruiters",
                    "estimated_effort_hours": 2,
                })

        return detected_gaps


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
