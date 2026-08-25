from typing import Any, Dict, List, Tuple

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.domains.skills.models import Skill, SkillEvidence
from app.domains.skills.schemas import SkillEvidenceItemResponse, UserSkillProfileResponse


class SkillScoringEngine:
    """
    Canonical evidence-weighted skill scoring engine.
    Calculates 0-10 internal proficiency, confidence ratings, and freshness status.
    """

    SOURCE_WEIGHTS: Dict[str, float] = {
        "ASSESSMENT_VERIFIED": 1.0,
        "ASSESSMENT": 1.0,
        "PROJECT": 0.85,
        "GITHUB_REPO": 0.80,
        "GITHUB_COMMIT": 0.80,
        "EXPERIENCE": 0.75,
        "RESUME_CITATION": 0.50,
        "RESUME_CLAIM": 0.50,
        "USER_CLAIM": 0.20,
    }

    @classmethod
    def get_human_level(cls, score: float) -> str:
        if score >= 9.0:
            return "ADVANCED"
        elif score >= 7.5:
            return "PROFICIENT"
        elif score >= 5.5:
            return "WORKING"
        elif score >= 3.5:
            return "FOUNDATIONAL"
        return "NOVICE"

    @classmethod
    def get_freshness_status(cls, freshness_days: int) -> str:
        if freshness_days <= 90:
            return "FRESH"
        elif freshness_days <= 365:
            return "AGING"
        return "STALE"

    @classmethod
    def compute_proficiency(
        cls,
        evidence_items: List[Dict[str, Any]],
    ) -> Tuple[float, float, str, str]:
        """
        Computes (composite_proficiency 0-10, confidence 0-1, human_level, freshness_status).
        """
        if not evidence_items:
            return 3.0, 0.3, "NOVICE", "STALE"

        weighted_sum = 0.0
        total_weight = 0.0
        max_confidence = 0.0
        min_freshness = 9999

        for ev in evidence_items:
            source_type = ev.get("source_type", "USER_CLAIM").upper()
            weight = cls.SOURCE_WEIGHTS.get(source_type, 0.40)
            proficiency = float(ev.get("proficiency_estimate", 5.0))
            confidence = float(ev.get("confidence", 0.70))
            freshness = int(ev.get("freshness_days", 30))

            weighted_sum += proficiency * weight
            total_weight += weight
            max_confidence = max(max_confidence, confidence)
            min_freshness = min(min_freshness, freshness)

        composite = round(weighted_sum / total_weight, 1) if total_weight > 0 else 5.0
        composite = max(1.0, min(10.0, composite))
        human_level = cls.get_human_level(composite)
        freshness_status = cls.get_freshness_status(min_freshness)

        return composite, round(max_confidence, 2), human_level, freshness_status


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

            # Format items for scoring engine
            ev_dicts = [
                {
                    "source_type": se.evidence.source_type if se.evidence else "USER_CLAIM",
                    "proficiency_estimate": se.proficiency_estimate,
                    "confidence": se.confidence,
                    "freshness_days": se.freshness_days,
                }
                for se in se_list
            ]

            composite_prof, conf, human_lvl, freshness = SkillScoringEngine.compute_proficiency(ev_dicts)

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
                    proficiency_score=composite_prof,
                    strength=first_se.strength,
                    confidence=conf,
                    is_verified=any(se.is_verified for se in se_list),
                    evidence_count=len(se_list),
                    evidence_sources=sources,
                    evidence_items=items,
                )
            )

        profiles.sort(key=lambda x: x.proficiency_score, reverse=True)
        return profiles
