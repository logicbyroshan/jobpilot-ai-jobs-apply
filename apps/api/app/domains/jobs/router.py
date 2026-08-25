from typing import List, Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.domains.jobs.schemas import JobCreate, JobResponse
from app.domains.jobs.services import JobService

router = APIRouter(prefix="/jobs", tags=["Jobs & Opportunities"])


@router.get("", response_model=List[JobResponse])
async def list_jobs(
    role: Optional[str] = Query(None, description="Filter by job title/role keyword"),
    remote_only: Optional[bool] = Query(None, description="Filter remote positions only"),
    limit: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """List normalized canonical job opportunities."""
    return await JobService.list_jobs(db, limit=limit, role=role, remote_only=remote_only)


@router.get("/{job_id}", response_model=JobResponse)
async def get_job_detail(
    job_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Retrieve detailed job requirement specs and company details."""
    return await JobService.get_job_by_id(db, job_id)


@router.post("", response_model=JobResponse)
async def create_job(
    data: JobCreate,
    db: AsyncSession = Depends(get_db),
):
    """Manually ingest or create a canonical job record."""
    return await JobService.create_job(db, data)
