from typing import List, Optional
from fastapi import APIRouter, Body, Depends, Path, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import CurrentUser, get_current_user
from app.domains.assessments.schemas import (
    AssessmentAttemptResponse,
    AssessmentConsentRequest,
    AssessmentIntegrityEventRequest,
    AssessmentResponse,
    AssessmentSessionResponse,
    AssessmentSubmissionRequest,
)
from app.domains.assessments.services import AssessmentService

router = APIRouter(tags=["Prove & Assessments"])


@router.get("/prove/assessments", response_model=List[AssessmentResponse])
@router.get("/assessments", response_model=List[AssessmentResponse])
async def list_assessments(
    skill_id: Optional[str] = Query(None, description="Filter assessments by evaluated skill ID"),
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """Retrieve available competency assessments."""
    return await AssessmentService.list_assessments(db, skill_id)


@router.get("/prove/assessments/{assessment_id}", response_model=AssessmentResponse)
@router.get("/assessments/{assessment_id}", response_model=AssessmentResponse)
async def get_assessment_detail(
    assessment_id: str = Path(..., description="ID of the assessment"),
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """Retrieve detailed questions and evaluation criteria for an assessment."""
    assessment = await AssessmentService.get_assessment_by_id(db, assessment_id)
    resp = AssessmentResponse.model_validate(assessment)
    resp.skills_evaluated = ["Distributed Systems", "Consensus & Quorums", "Fault Tolerance", "State Machines"]
    return resp


@router.post("/prove/assessments/{assessment_id}/session", response_model=AssessmentSessionResponse)
async def start_assessment_session(
    assessment_id: str = Path(..., description="ID of the assessment to start"),
    consent: AssessmentConsentRequest = Body(default_factory=AssessmentConsentRequest),
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """Start an authenticated, proctored assessment session following consent verification."""
    return await AssessmentService.start_session(db, current_user.id, assessment_id, consent)


@router.post("/prove/sessions/{session_id}/integrity-events")
async def log_integrity_event(
    session_id: str = Path(..., description="Assessment session ID"),
    event: AssessmentIntegrityEventRequest = Body(...),
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """Record assessment environment integrity signals (e.g. fullscreen exit, focus lost)."""
    return await AssessmentService.log_integrity_event(db, current_user.id, session_id, event)


@router.post("/prove/assessments/{assessment_id}/submit", response_model=AssessmentAttemptResponse)
@router.post("/prove/sessions/{assessment_id}/submit", response_model=AssessmentAttemptResponse)
@router.post("/assessments/{assessment_id}/submit", response_model=AssessmentAttemptResponse)
async def submit_assessment(
    assessment_id: str = Path(..., description="ID of the assessment"),
    submission: AssessmentSubmissionRequest = Body(...),
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """Submit assessment answers for deterministic evaluation and closed-loop skill level boosting."""
    return await AssessmentService.submit_assessment(db, current_user.id, assessment_id, submission)
