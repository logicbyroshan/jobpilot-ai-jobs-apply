from typing import List, Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import CurrentUser, get_current_user
from app.domains.assessments.schemas import (
    AssessmentAttemptResponse,
    AssessmentResponse,
    AssessmentSubmissionRequest,
)
from app.domains.assessments.services import AssessmentService

router = APIRouter(prefix="/assessments", tags=["Assessments & Verification"])


@router.get("", response_model=List[AssessmentResponse])
async def list_assessments(
    skill_id: Optional[str] = Query(None, description="Filter by skill ID"),
    db: AsyncSession = Depends(get_db),
):
    """List available skill proving assessments."""
    return await AssessmentService.list_assessments(db, skill_id=skill_id)


@router.get("/{assessment_id}", response_model=AssessmentResponse)
async def get_assessment(
    assessment_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Retrieve an assessment with questions and blueprints."""
    return await AssessmentService.get_assessment_by_id(db, assessment_id)


@router.post("/{assessment_id}/submit", response_model=AssessmentAttemptResponse)
async def submit_assessment(
    assessment_id: str,
    submission: AssessmentSubmissionRequest,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """Submit assessment answers for deterministic evaluation and skill score upgrading."""
    return await AssessmentService.submit_assessment(db, current_user.id, assessment_id, submission)
