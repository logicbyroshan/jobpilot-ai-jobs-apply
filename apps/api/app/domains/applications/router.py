from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import CurrentUser, get_current_user
from app.domains.applications.schemas import (
    ApplicationCreate,
    ApplicationPolicyResponse,
    ApplicationPolicyUpdate,
    ApplicationResponse,
    ApplicationStatusUpdate,
)
from app.domains.applications.services import ApplicationService

router = APIRouter(prefix="/applications", tags=["Applications & Execution"])


@router.get("", response_model=List[ApplicationResponse])
async def list_applications(
    status: Optional[str] = Query(None, description="Filter by status (DRAFT, SUBMITTED, INTERVIEW, etc.)"),
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """Retrieve all job applications in the user's pipeline."""
    return await ApplicationService.list_user_applications(db, current_user.id, status=status)


@router.get("/policy", response_model=ApplicationPolicyResponse)
async def get_application_policy(
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """Retrieve the user's automation policy controls (Manual / Assisted / Auto-Apply)."""
    return await ApplicationService.get_policy(db, current_user.id)


@router.patch("/policy", response_model=ApplicationPolicyResponse)
async def update_application_policy(
    data: ApplicationPolicyUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """Update automation controls and safeguards."""
    return await ApplicationService.update_policy(db, current_user.id, data)


@router.get("/{app_id}", response_model=ApplicationResponse)
async def get_application_detail(
    app_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """Retrieve application details, tailored artifacts, and current stage."""
    return await ApplicationService.get_application_by_id(db, current_user.id, app_id)


@router.post("", response_model=ApplicationResponse)
async def create_application(
    data: ApplicationCreate,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """Create a new draft application and generate its initial tailored artifact kit."""
    return await ApplicationService.create_application(db, current_user.id, data)


@router.patch("/{app_id}/status", response_model=ApplicationResponse)
async def update_application_status(
    app_id: str,
    data: ApplicationStatusUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """Update application stage (e.g. SUBMITTED, INTERVIEW, OFFER, REJECTED) and log outcome event."""
    return await ApplicationService.update_status(db, current_user.id, app_id, data)
