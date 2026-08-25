from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import CurrentUser, get_current_user
from app.domains.outcomes.schemas import (
    ApplicationEventResponse,
    FunnelAnalyticsResponse,
    OutcomeFeedbackCreate,
    OutcomeFeedbackResponse,
)
from app.domains.outcomes.services import OutcomeService

router = APIRouter(prefix="/outcomes", tags=["Outcomes & Analytics"])


@router.get("/funnel", response_model=FunnelAnalyticsResponse)
async def get_career_funnel(
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """Retrieve application conversion funnel metrics, bottleneck detection, and event history."""
    return await OutcomeService.calculate_funnel_analytics(db, current_user.id)


@router.get("/events", response_model=List[ApplicationEventResponse])
async def list_application_events(
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """Retrieve historical career and application status transition events."""
    return await OutcomeService.list_user_events(db, current_user.id)


@router.post("/feedback", response_model=OutcomeFeedbackResponse)
async def record_feedback(
    data: OutcomeFeedbackCreate,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """Record post-interview or outcome feedback to diagnose future capability gaps."""
    return await OutcomeService.record_feedback(db, current_user.id, data)
