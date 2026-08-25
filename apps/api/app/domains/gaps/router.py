from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import CurrentUser, get_current_user
from app.domains.gaps.schemas import GapCreate, GapResponse
from app.domains.gaps.services import GapService

router = APIRouter(prefix="/gaps", tags=["Gap Diagnosis"])


@router.get("", response_model=List[GapResponse])
async def list_gaps(
    status: Optional[str] = Query(None, description="ACTIVE, IN_PROGRESS, RESOLVED"),
    priority: Optional[str] = Query(None, description="CRITICAL, HIGH, MEDIUM, LOW"),
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """Retrieve diagnosed career, skill, and evidence gaps."""
    return await GapService.list_user_gaps(db, current_user.id, status=status, priority=priority)


@router.get("/{gap_id}", response_model=GapResponse)
async def get_gap_detail(
    gap_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """Retrieve details and rationale for a specific gap."""
    return await GapService.get_gap_by_id(db, current_user.id, gap_id)


@router.post("", response_model=GapResponse)
async def create_gap(
    data: GapCreate,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """Register or diagnose a new capability gap."""
    return await GapService.create_gap(db, current_user.id, data)
