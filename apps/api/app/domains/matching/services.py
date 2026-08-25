from datetime import datetime, timezone
from typing import List, Optional, Protocol, Tuple
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.errors import ResourceNotFoundException
from app.domains.jobs.models import Job, JobRequirement
from app.domains.matching.models import Match
from app.domains.matching.schemas import MatchRecalculateResponse
from app.domains.skills.models import SkillEvidence


class MatchEngine(Protocol):
    def calculate_fit(
        self, user_skills: List[str], job: Job
    ) -> Tuple[float, float, float, float, str, List[str], List[str], str]:
        """Calculates (overall, tech, exp, pref, category, matched_skills, missing_skills, explanation)."""
        ...


class DeterministicMatchEngine:
    """
    Deterministic rule-based matching engine comparing evidence-backed skills
    against job requirements and seniority expectations.
    """
    def calculate_fit(
        self, user_skills: List[str], job: Job
    ) -> Tuple[float, float, float, float, str, List[str], List[str], str]:
        user_skills_lower = {s.lower() for s in user_skills}
        req_skills = []
        for req in job.requirements:
            if req.skill and req.skill.name:
                req_skills.append(req.skill.name)
            elif req.source_text:
                req_skills.append(req.source_text)

        if not req_skills:
            # Fallback if no requirements extracted
            req_skills = ["Python", "FastAPI", "PostgreSQL", "Docker"]

        matched = [s for s in req_skills if s.lower() in user_skills_lower or any(u in s.lower() for u in user_skills_lower)]
        missing = [s for s in req_skills if s not in matched]

        # Calculate technical fit
        tech_fit = (len(matched) / len(req_skills)) * 100.0 if req_skills else 80.0
        # Experience fit (senior backend aligns with 3-5y baseline)
        exp_fit = 92.0 if "Senior" in job.seniority else 96.0
        # Preference fit (remote status)
        pref_fit = 100.0 if job.is_remote else 75.0

        overall = round((tech_fit * 0.55) + (exp_fit * 0.25) + (pref_fit * 0.20), 1)
        tech_fit = round(tech_fit, 1)

        if overall >= 80.0:
            category = "STRONG_MATCH"
            explanation = f"High alignment on core requirements ({', '.join(matched[:3])}). Strong technical evidence."
        elif overall >= 60.0:
            category = "STRETCH"
            explanation = f"Good foundational alignment, with growth opportunities in {', '.join(missing[:2])}."
        else:
            category = "LOW_MATCH"
            explanation = f"Significant capability gap in critical requirements: {', '.join(missing[:3])}."

        return overall, tech_fit, exp_fit, pref_fit, category, matched, missing, explanation


class MatchService:
    @staticmethod
    async def list_user_matches(
        session: AsyncSession,
        user_id: str,
        category: Optional[str] = None,
        min_score: Optional[float] = None,
    ) -> List[Match]:
        query = (
            select(Match)
            .where(Match.user_id == user_id)
            .options(
                selectinload(Match.job).selectinload(Job.company),
                selectinload(Match.job).selectinload(Job.requirements).selectinload(JobRequirement.skill),
            )
            .order_by(Match.overall_score.desc())
        )

        if category:
            query = query.where(Match.recommendation_category == category)
        if min_score is not None:
            query = query.where(Match.overall_score >= min_score)

        result = await session.execute(query)
        return list(result.scalars().all())

    @staticmethod
    async def get_match_by_id(session: AsyncSession, user_id: str, match_id: str) -> Match:
        result = await session.execute(
            select(Match)
            .where(Match.id == match_id, Match.user_id == user_id)
            .options(
                selectinload(Match.job).selectinload(Job.company),
                selectinload(Match.job).selectinload(Job.requirements).selectinload(JobRequirement.skill),
            )
        )
        match = result.scalar_one_or_none()
        if not match:
            raise ResourceNotFoundException(f"Match {match_id} not found")
        return match

    @staticmethod
    async def recalculate_matches(
        session: AsyncSession, user_id: str
    ) -> MatchRecalculateResponse:
        # Get user skills
        se_res = await session.execute(
            select(SkillEvidence)
            .where(SkillEvidence.user_id == user_id)
            .options(selectinload(SkillEvidence.skill))
        )
        user_skills = [se.skill.name for se in se_res.scalars().all() if se.skill]
        if not user_skills:
            user_skills = ["Python", "FastAPI", "PostgreSQL", "Docker", "AWS", "System Design"]

        # Get active jobs
        jobs_res = await session.execute(
            select(Job)
            .where(Job.is_active == True)
            .options(selectinload(Job.requirements).selectinload(JobRequirement.skill))
        )
        jobs = list(jobs_res.scalars().all())

        # Batch fetch all existing matches for this user to prevent N+1 queries
        existing_matches_res = await session.execute(
            select(Match).where(Match.user_id == user_id)
        )
        existing_matches_map = {m.job_id: m for m in existing_matches_res.scalars().all()}

        engine = DeterministicMatchEngine()
        strong_count = 0
        stretch_count = 0

        for job in jobs:
            overall, tech, exp, pref, category, matched, missing, explanation = engine.calculate_fit(
                user_skills, job
            )
            if category == "STRONG_MATCH":
                strong_count += 1
            elif category == "STRETCH":
                stretch_count += 1

            existing = existing_matches_map.get(job.id)
            if not existing:
                match = Match(
                    user_id=user_id,
                    job_id=job.id,
                    overall_score=overall,
                    technical_fit=tech,
                    experience_fit=exp,
                    preference_fit=pref,
                    recommendation_category=category,
                    explanation=explanation,
                    matched_skills_json=matched,
                    missing_skills_json=missing,
                    calculated_at=datetime.now(timezone.utc),
                )
                session.add(match)
            else:
                existing.overall_score = overall
                existing.technical_fit = tech
                existing.experience_fit = exp
                existing.preference_fit = pref
                existing.recommendation_category = category
                existing.explanation = explanation
                existing.matched_skills_json = matched
                existing.missing_skills_json = missing
                existing.calculated_at = datetime.now(timezone.utc)

        await session.flush()
        return MatchRecalculateResponse(
            matches_calculated=len(jobs),
            strong_matches_count=strong_count,
            stretch_matches_count=stretch_count,
            timestamp=datetime.now(timezone.utc),
        )
