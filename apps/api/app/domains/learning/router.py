from typing import List, Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import CurrentUser, get_current_user
from app.domains.learning.schemas import (
    LearningPlanCreate,
    LearningPlanResponse,
    ResourceResponse,
)
from app.domains.learning.services import LearningService

router = APIRouter(prefix="/learning", tags=["Learning & Improvement"])


@router.get("/resources", response_model=List[ResourceResponse])
async def list_resources(
    topic: Optional[str] = Query(None, description="Filter resources by topic keyword"),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve catalog of curated learning resources (docs, courses, tutorials, exercises)."""
    return await LearningService.list_resources(db, topic=topic)


@router.get("/plans", response_model=List[LearningPlanResponse])
async def list_my_learning_plans(
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """Retrieve active learning plans addressing career and skill gaps."""
    return await LearningService.list_user_plans(db, current_user.id)


@router.post("/plans", response_model=LearningPlanResponse)
async def create_learning_plan(
    data: LearningPlanCreate,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """Generate a structured learning plan for a targeted gap."""
    return await LearningService.create_learning_plan(db, current_user.id, data)


@router.post("/plans/{plan_id}/items/{item_id}/toggle", response_model=LearningPlanResponse)
async def toggle_plan_item(
    plan_id: str,
    item_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """Toggle completion status of a learning plan item."""
    return await LearningService.toggle_item_completion(db, current_user.id, plan_id, item_id)
