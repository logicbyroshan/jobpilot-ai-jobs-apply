from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import CurrentUser, get_current_user
from app.domains.evidence.schemas import EvidenceCreate, EvidenceResponse
from app.domains.evidence.services import EvidenceService

router = APIRouter(prefix="/evidence", tags=["Evidence & Provenance"])


@router.get("", response_model=List[EvidenceResponse])
async def list_evidence(
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """List all evidence records proving the user's professional claims."""
    return await EvidenceService.list_user_evidence(db, current_user.id)


@router.post("", response_model=EvidenceResponse)
async def create_evidence(
    data: EvidenceCreate,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """Add a new verified evidence record with provenance."""
    return await EvidenceService.create_evidence(db, current_user.id, data)
