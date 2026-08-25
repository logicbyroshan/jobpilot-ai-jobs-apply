from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import CurrentUser, get_current_user
from app.domains.career_goals.schemas import (
    CareerGoalCreate,
    CareerGoalResponse,
    CareerGoalUpdate,
)
from app.domains.career_goals.services import CareerGoalService

router = APIRouter(tags=["Career Goals"])


@router.get("/career-goals", response_model=List[CareerGoalResponse])
@router.get("/goals", response_model=List[CareerGoalResponse])
async def list_career_goals(
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """List the user's active career goals and target positions."""
    return await CareerGoalService.list_user_goals(db, current_user.id)


@router.post("/career-goals", response_model=CareerGoalResponse)
@router.post("/goals", response_model=CareerGoalResponse)
async def create_career_goal(
    data: CareerGoalCreate,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """Define a new target role/career goal."""
    return await CareerGoalService.create_goal(db, current_user.id, data)


@router.patch("/career-goals/{goal_id}", response_model=CareerGoalResponse)
@router.patch("/goals/{goal_id}", response_model=CareerGoalResponse)
async def update_career_goal(
    goal_id: str,
    data: CareerGoalUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """Update an existing career goal."""
    return await CareerGoalService.update_goal(db, current_user.id, goal_id, data)
