from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.errors import ResourceNotFoundException
from app.core.logging import logger
from app.domains.assessments.models import (
    Assessment,
    AssessmentAttempt,
    AssessmentQuestion,
)
from app.domains.assessments.schemas import (
    AssessmentAttemptResponse,
    AssessmentEvaluationItem,
    AssessmentSubmissionRequest,
)
from app.domains.evidence.models import Evidence
from app.domains.skills.models import SkillEvidence


class AssessmentService:
    @staticmethod
    async def list_assessments(
        session: AsyncSession, skill_id: Optional[str] = None
    ) -> List[Assessment]:
        query = (
            select(Assessment)
            .options(
                selectinload(Assessment.skill),
                selectinload(Assessment.questions),
            )
            .order_by(Assessment.title.asc())
        )
        if skill_id:
            query = query.where(Assessment.skill_id == skill_id)

        result = await session.execute(query)
        return list(result.scalars().all())

    @staticmethod
    async def get_assessment_by_id(session: AsyncSession, assessment_id: str) -> Assessment:
        result = await session.execute(
            select(Assessment)
            .where(Assessment.id == assessment_id)
            .options(
                selectinload(Assessment.skill),
                selectinload(Assessment.questions),
            )
        )
        assessment = result.scalar_one_or_none()
        if not assessment:
            raise ResourceNotFoundException(f"Assessment {assessment_id} not found")
        return assessment

    @staticmethod
    async def submit_assessment(
        session: AsyncSession,
        user_id: str,
        assessment_id: str,
        submission: AssessmentSubmissionRequest,
    ) -> AssessmentAttemptResponse:
        assessment = await AssessmentService.get_assessment_by_id(session, assessment_id)

        # Strict deterministic grading against question answer keys
        correct_count = 0
        total_questions = len(assessment.questions)
        evaluations: List[AssessmentEvaluationItem] = []

        for q in assessment.questions:
            user_ans = submission.answers.get(q.id, "").strip()
            is_correct = False
            if user_ans and q.correct_answer:
                u_clean = user_ans.strip().upper()
                c_clean = q.correct_answer.strip().upper()
                if u_clean == c_clean:
                    is_correct = True
                elif len(u_clean) == 1 and c_clean.startswith(u_clean):
                    is_correct = True
                elif len(c_clean) == 1 and u_clean.startswith(c_clean):
                    is_correct = True

            if is_correct:
                correct_count += 1

            evaluations.append(
                AssessmentEvaluationItem(
                    question_id=q.id,
                    user_answer=user_ans,
                    correct_answer=q.correct_answer,
                    is_correct=is_correct,
                    explanation=q.explanation,
                )
            )

        score = round((correct_count / total_questions) * 100.0, 1) if total_questions else 100.0
        passed = score >= assessment.passing_score
        boost = 1.8 if passed else 0.0

        attempt = AssessmentAttempt(
            assessment_id=assessment.id,
            user_id=user_id,
            status="EVALUATED",
            score=score,
            passed=passed,
            skill_proficiency_boost=boost,
            feedback_summary=f"Scored {score}%. {'Demonstrated strong command of core principles.' if passed else 'Review architecture edge cases and retry.'}",
            submitted_at=datetime.now(timezone.utc),
        )
        session.add(attempt)
        await session.flush()

        # If passed, register verified evidence, upgrade skill evidence, and trigger closed-loop feedback!
        if passed and assessment.skill_id:
            now = datetime.now(timezone.utc)
            evidence = Evidence(
                user_id=user_id,
                source_type="assessment",
                evidence_type="assessment_result",
                title=f"Verified: {assessment.title}",
                description=f"Passed assessment with score of {score}%. Validated production-level capability.",
                confidence=0.98,
                observed_at=now,
            )
            session.add(evidence)
            await session.flush()

            # Check existing skill evidence or create new
            se_res = await session.execute(
                select(SkillEvidence).where(
                    SkillEvidence.user_id == user_id,
                    SkillEvidence.skill_id == assessment.skill_id,
                )
            )
            existing_se = se_res.scalars().first()
            if existing_se:
                existing_se.proficiency_estimate = min(10.0, existing_se.proficiency_estimate + boost)
                existing_se.is_verified = True
                existing_se.last_verified_at = now
            else:
                new_se = SkillEvidence(
                    user_id=user_id,
                    skill_id=assessment.skill_id,
                    evidence_id=evidence.id,
                    strength="STRONG",
                    confidence=0.95,
                    proficiency_estimate=7.5,
                    is_verified=True,
                    last_verified_at=now,
                )
                session.add(new_se)

            await session.flush()

            # Trigger Stage 5 -> Stage 2 Closed-Loop Re-calculation
            try:
                from app.domains.matching.services import MatchService
                await MatchService.recalculate_matches(session, user_id)
            except Exception as e:
                logger.warning(f"Closed-loop match recalculation notice: {e}")

        resp = AssessmentAttemptResponse.model_validate(attempt)
        resp.evaluations = evaluations
        return resp
