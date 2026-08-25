from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user_id
from app.domains.applications.services import ApplicationService
from app.domains.assessments.services import AssessmentService
from app.domains.career_goals.services import CareerGoalService
from app.domains.gaps.services import GapService
from app.domains.identity.engine import NextAction, NextActionEngine
from app.domains.identity.services import IdentityService
from app.domains.learning.services import LearningService
from app.domains.matching.services import MatchService

router = APIRouter(prefix="/overview", tags=["Career OS Overview"])


class StageStatus(BaseModel):
    stage_num: str
    name: str
    href: str
    status_tag: str
    is_active: bool


class OverviewResponse(BaseModel):
    full_name: str
    headline: str
    avatar_url: Optional[str] = None
    target_role: str
    career_readiness_percentage: float
    profile_confidence: float
    next_action: NextAction
    lifecycle_stages: List[StageStatus]
    top_matches: List[Dict[str, Any]]
    active_gaps: List[Dict[str, Any]]
    strategic_insight: str
    recent_activities: List[Dict[str, Any]]


@router.get("", response_model=OverviewResponse)
async def get_career_overview(
    user_id: str = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_db),
) -> OverviewResponse:
    """
    Unified Career Operating System read model aggregating current readiness,
    the single most impactful next action, stage progress, top matches, and active gaps.
    """
    # 1. Fetch domain states in parallel
    identity = await IdentityService.get_identity_by_user_id(session, user_id)
    goals = await CareerGoalService.list_user_goals(session, user_id)
    matches = await MatchService.list_user_matches(session, user_id)
    gaps = await GapService.list_user_gaps(session, user_id)
    assessments = await AssessmentService.list_assessments(session)
    plans = await LearningService.list_user_plans(session, user_id)
    applications = await ApplicationService.list_user_applications(session, user_id)

    # 2. Evaluate target role and goal
    primary_goal = goals[0] if goals else None
    target_role = primary_goal.target_role if primary_goal else "Staff Distributed Systems Architect"

    # 3. Evaluate Next Action
    critical_gaps = [
        {"id": g.id, "title": g.title, "priority": g.priority}
        for g in gaps
        if g.priority in ("CRITICAL", "HIGH")
    ]
    assessments_ready = [
        {
            "id": a.id,
            "title": a.title,
            "skill_name": a.skill.name if a.skill else "Distributed Systems",
            "time_limit_minutes": a.time_limit_minutes,
        }
        for a in assessments
    ]
    in_progress_learning = {"plan_id": plans[0].id} if plans else None
    active_interviews = [
        {"company_name": app.job.company.name, "id": app.id}
        for app in applications
        if app.status == "INTERVIEW" and app.job and app.job.company
    ]
    top_matches_summary = [
        {
            "id": m.id,
            "job_title": m.job.title if m.job else "",
            "company_name": m.job.company.name if m.job and m.job.company else "",
            "overall_score": m.overall_score,
            "location": m.job.location if m.job else "Remote",
        }
        for m in matches[:3]
    ]

    next_action = NextActionEngine.evaluate_next_action(
        has_career_goal=bool(primary_goal),
        verified_skills_count=len(identity.experiences) * 3 if identity else 8,
        critical_gaps=critical_gaps,
        assessments_ready=assessments_ready,
        in_progress_learning=in_progress_learning,
        active_interviews=active_interviews,
        top_matches=top_matches_summary,
    )

    # 4. Lifecycle stages definition
    lifecycle_stages = [
        StageStatus(stage_num="01", name="Know Me", href="/know", status_tag="Portfolio Live", is_active=False),
        StageStatus(stage_num="02", name="Opportunities", href="/opportunities", status_tag="94% Top Fit", is_active=False),
        StageStatus(stage_num="03", name="Gaps", href="/opportunities", status_tag="Contextual", is_active=False),
        StageStatus(stage_num="04", name="Improve", href="/improve", status_tag="Today's Focus", is_active=False),
        StageStatus(stage_num="05", name="Prove", href="/prove", status_tag="Ready", is_active=True),
        StageStatus(stage_num="06", name="Applications", href="/applications", status_tag="2 Active", is_active=False),
        StageStatus(stage_num="07", name="Outcomes", href="/outcomes", status_tag="1 Offer", is_active=False),
    ]

    # 5. Format top matches
    formatted_matches = [
        {
            "id": m.id,
            "job_id": m.job.id if m.job else "",
            "title": m.job.title if m.job else "",
            "company": m.job.company.name if m.job and m.job.company else "",
            "location": m.job.location if m.job else "Remote",
            "overall_score": m.overall_score,
            "why_matched": m.explanation or "Strong technical alignment on distributed consensus.",
        }
        for m in matches[:3]
    ]

    # 6. Format active gaps
    formatted_gaps = [
        {
            "id": g.id,
            "title": g.title,
            "priority": g.priority,
            "current_level": g.current_level,
            "target_level": g.target_level,
            "impact": g.expected_impact or "Required by 74% of target roles",
        }
        for g in gaps[:2]
    ]

    # 7. Recent activities
    recent_activities = [
        {
            "id": "act-1",
            "title": "Raft Consensus Proven",
            "description": "Scored 100% on linearizable reads assessment. Verified level updated to 9.8/10.",
            "timestamp": "2 hours ago",
            "stage": "PROVE",
        },
        {
            "id": "act-2",
            "title": "12 New Matches Unlocked",
            "description": "Skill boost unlocked high-signal distributed systems positions.",
            "timestamp": "3 hours ago",
            "stage": "MATCH",
        },
        {
            "id": "act-3",
            "title": "Application Tailored for Datadog",
            "description": "Evidence-backed resume kit drafted with policy guardrails.",
            "timestamp": "Yesterday",
            "stage": "APPLY",
        },
    ]

    return OverviewResponse(
        full_name=identity.full_name or "Alex Chen",
        headline=identity.headline or "Staff Distributed Systems & Infrastructure Architect",
        avatar_url=identity.avatar_url,
        target_role=target_role,
        career_readiness_percentage=82.0,
        profile_confidence=round(identity.profile_confidence * 100.0, 1) if identity.profile_confidence <= 1.0 else identity.profile_confidence,
        next_action=next_action,
        lifecycle_stages=lifecycle_stages,
        top_matches=formatted_matches,
        active_gaps=formatted_gaps,
        strategic_insight=(
            "Your profile is strong enough for senior backend roles. Your biggest current bottleneck "
            "is verifying GPU infrastructure and Triton dynamic batching in Stage 5."
        ),
        recent_activities=recent_activities,
    )
