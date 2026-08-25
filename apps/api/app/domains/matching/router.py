from typing import List, Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import CurrentUser, get_current_user
from app.domains.matching.schemas import MatchRecalculateResponse, MatchResponse
from app.domains.matching.services import MatchService

router = APIRouter(tags=["Matching & Fit Engine"])


@router.get("/matches", response_model=List[MatchResponse])
@router.get("/matching", response_model=List[MatchResponse])
async def list_matches(
    category: Optional[str] = Query(None, description="STRONG_MATCH, STRETCH, LOW_MATCH"),
    min_score: Optional[float] = Query(None, ge=0.0, le=100.0),
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """Retrieve personalized job matches for the authenticated user."""
    return await MatchService.list_user_matches(db, current_user.id, category=category, min_score=min_score)


@router.get("/matches/{match_id}", response_model=MatchResponse)
@router.get("/matching/{match_id}", response_model=MatchResponse)
async def get_match_detail(
    match_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """Retrieve detailed match alignment and fit metrics."""
    return await MatchService.get_match_by_id(db, current_user.id, match_id)


@router.post("/matches/recalculate", response_model=MatchRecalculateResponse)
@router.post("/matching/recalculate", response_model=MatchRecalculateResponse)
async def recalculate_matches(
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """Trigger on-demand deterministic match recalculation based on latest evidence."""
    return await MatchService.recalculate_matches(db, current_user.id)
