from typing import Dict, List
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.domains.skills.models import Skill, SkillEvidence
from app.domains.skills.schemas import SkillEvidenceItemResponse, UserSkillProfileResponse


class SkillService:
    @staticmethod
    async def list_all_skills(session: AsyncSession) -> List[Skill]:
        result = await session.execute(select(Skill).order_by(Skill.name.asc()))
        return list(result.scalars().all())

    @staticmethod
    async def get_user_skills(session: AsyncSession, user_id: str) -> List[UserSkillProfileResponse]:
        # Query skill evidences with joins to skill and evidence
        result = await session.execute(
            select(SkillEvidence)
            .where(SkillEvidence.user_id == user_id)
            .options(
                selectinload(SkillEvidence.skill),
                selectinload(SkillEvidence.evidence),
            )
        )
        evidences = list(result.scalars().all())

        # Group by skill
        skills_map: Dict[str, List[SkillEvidence]] = {}
        for se in evidences:
            if se.skill_id not in skills_map:
                skills_map[se.skill_id] = []
            skills_map[se.skill_id].append(se)

        profiles: List[UserSkillProfileResponse] = []
        for skill_id, se_list in skills_map.items():
            first_se = se_list[0]
            skill = first_se.skill
            sources = list({se.evidence.source_type for se in se_list if se.evidence})
            avg_proficiency = sum(se.proficiency_estimate for se in se_list) / len(se_list)
            max_confidence = max(se.confidence for se in se_list)

            items = [
                SkillEvidenceItemResponse(
                    id=se.id,
                    skill_id=se.skill_id,
                    evidence_id=se.evidence_id,
                    strength=se.strength,
                    confidence=se.confidence,
                    proficiency_estimate=se.proficiency_estimate,
                    is_user_claimed=se.is_user_claimed,
                    is_verified=se.is_verified,
                    freshness_days=se.freshness_days,
                    last_verified_at=se.last_verified_at,
                    evidence=se.evidence,
                )
                for se in se_list
            ]

            profiles.append(
                UserSkillProfileResponse(
                    skill_id=skill.id,
                    skill_name=skill.name,
                    category=skill.category,
                    proficiency_score=round(avg_proficiency, 1),
                    strength=first_se.strength,
                    confidence=max_confidence,
                    is_verified=any(se.is_verified for se in se_list),
                    evidence_count=len(se_list),
                    evidence_sources=sources,
                    evidence_items=items,
                )
            )

        profiles.sort(key=lambda x: x.proficiency_score, reverse=True)
        return profiles
