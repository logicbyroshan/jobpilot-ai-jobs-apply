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
    AutoApplyExecutionResponse,
    AutoApplyPreviewResponse,
    ResumeVersionResponse,
    TailorResumeRequest,
)
from app.domains.applications.services import ApplicationService

router = APIRouter(prefix="/applications", tags=["Applications & Execution"])


@router.get("", response_model=List[ApplicationResponse])
async def list_applications(
    status: Optional[str] = Query(None, description="Filter by status (DRAFT, APPLIED, INTERVIEW, OFFER, REJECTED)"),
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """List tracked applications across the governing pipeline."""
    return await ApplicationService.list_applications(db, current_user.id, status)


@router.post("", response_model=ApplicationResponse)
async def create_application(
    app_data: ApplicationCreate,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """Create and submit an evidence-backed application package."""
    return await ApplicationService.create_application(db, current_user.id, app_data)


@router.patch("/{application_id}/status", response_model=ApplicationResponse)
async def update_application_status(
    application_id: str,
    status_data: dict,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """Update pipeline status of an application."""
    return await ApplicationService.update_application_status(
        db, current_user.id, application_id, status_data.get("status", "DRAFT"), status_data.get("notes")
    )


@router.get("/policy", response_model=ApplicationPolicyResponse)
async def get_application_policy(
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """Retrieve automation and safety policies for application execution."""
    return await ApplicationService.get_policy(db, current_user.id)


@router.patch("/policy", response_model=ApplicationPolicyResponse)
async def update_application_policy(
    policy_data: ApplicationPolicyUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """Update automation mode, daily limits, and approval requirements."""
    return await ApplicationService.update_policy(db, current_user.id, policy_data)


@router.get("/resumes", response_model=List[ResumeVersionResponse])
async def get_resumes(
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """Retrieve Master Resume and tailored job-specific versions."""
    return await ApplicationService.get_resumes(db, current_user.id)


@router.post("/tailor-resume", response_model=ResumeVersionResponse)
async def tailor_resume(
    req: TailorResumeRequest,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """Generate an evidence-backed tailored resume version without false claims."""
    return await ApplicationService.tailor_resume(db, current_user.id, req)


@router.get("/auto-apply/preview", response_model=AutoApplyPreviewResponse)
async def get_auto_apply_preview(
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """Preview eligible opportunities matching safety rules prior to auto-apply execution."""
    return await ApplicationService.get_auto_apply_preview(db, current_user.id)


@router.get("/automation", response_model=AutoApplyExecutionResponse)
async def get_automation_queue(
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """Retrieve real-time auto-apply execution queue status."""
    return await ApplicationService.get_executions(db, current_user.id)
