from typing import List
from fastapi import APIRouter, Body, Depends, Path
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import CurrentUser, get_current_user
from app.domains.learning.schemas import (
    CustomSkillAnalysisRequest,
    CustomSkillAnalysisResponse,
    DailyPlanResponse,
    LearningPlanItemResponse,
    LearningPlanResponse,
    LearningTaskResponse,
    PlanWeekRequest,
    ResourceResponse,
)
from app.domains.learning.services import LearningService

router = APIRouter(tags=["Improve & Learning"])


@router.get("/improve/plans", response_model=List[LearningPlanResponse])
@router.get("/improve/learning-plans", response_model=List[LearningPlanResponse])
@router.get("/learning/plans", response_model=List[LearningPlanResponse])
async def get_my_learning_plans(
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """Retrieve active learning blueprints for the authenticated user."""
    return await LearningService.get_user_plans(db, current_user.id)


@router.post("/learning/plans/{plan_id}/items/{item_id}/toggle", response_model=LearningPlanResponse)
@router.post("/improve/plans/{plan_id}/items/{item_id}/toggle", response_model=LearningPlanResponse)
async def toggle_plan_item(
    plan_id: str = Path(..., description="ID of the learning plan"),
    item_id: str = Path(..., description="ID of the item to toggle"),
    db: AsyncSession = Depends(get_db),
):
    """Toggle completion status of a learning plan item."""
    return await LearningService.toggle_plan_item(db, plan_id, item_id)


@router.get("/learning/resources", response_model=List[ResourceResponse])
@router.get("/improve/resources", response_model=List[ResourceResponse])
async def get_learning_resources(
    db: AsyncSession = Depends(get_db),
):
    """Retrieve curated learning resources."""
    return await LearningService.list_resources(db)


@router.get("/improve/daily-plan", response_model=DailyPlanResponse)
@router.get("/improve/tasks", response_model=DailyPlanResponse)
@router.get("/learning/tasks", response_model=DailyPlanResponse)
async def get_my_daily_plan(
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """Retrieve the user's daily focus tasks and Kanban task columns."""
    return await LearningService.get_daily_plan(db, current_user.id)


@router.patch("/improve/tasks/{task_id}/status", response_model=LearningTaskResponse)
async def update_task_status(
    task_id: str = Path(..., description="ID of the task to update"),
    status: str = Body(..., embed=True, description="New status (BACKLOG, TODAY, IN_PROGRESS, DONE, READY_TO_PROVE)"),
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """Update Kanban task status."""
    return await LearningService.update_task_status(db, current_user.id, task_id, status)


@router.post("/improve/plan-week", response_model=DailyPlanResponse)
async def plan_my_week(
    req: PlanWeekRequest,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """Auto-plan weekly roadmap based on active gaps, goal timeline, and available hours."""
    return await LearningService.plan_my_week(db, current_user.id, req)


@router.post("/improve/custom-skill", response_model=CustomSkillAnalysisResponse)
async def analyze_custom_skill(
    req: CustomSkillAnalysisRequest,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """Analyze a user-defined skill or goal against target roles and generate an actionable mission."""
    return await LearningService.analyze_custom_skill(db, current_user.id, req)
