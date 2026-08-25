from typing import List

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import ResourceNotFoundException
from app.domains.career_goals.models import CareerGoal
from app.domains.career_goals.schemas import CareerGoalCreate, CareerGoalUpdate


class CareerGoalService:
    @staticmethod
    async def list_user_goals(session: AsyncSession, user_id: str) -> List[CareerGoal]:
        result = await session.execute(
            select(CareerGoal).where(CareerGoal.user_id == user_id).order_by(CareerGoal.priority.asc())
        )
        return list(result.scalars().all())

    @staticmethod
    async def create_goal(session: AsyncSession, user_id: str, data: CareerGoalCreate) -> CareerGoal:
        goal = CareerGoal(
            user_id=user_id,
            target_role=data.target_role,
            target_seniority=data.target_seniority,
            location_preference=data.location_preference,
            is_remote_preferred=data.is_remote_preferred,
            employment_type=data.employment_type,
            target_salary_min=data.target_salary_min,
            target_salary_max=data.target_salary_max,
            target_currency=data.target_currency,
            priority=data.priority,
            is_active=data.is_active,
        )
        session.add(goal)
        await session.flush()
        return goal

    @staticmethod
    async def update_goal(
        session: AsyncSession, user_id: str, goal_id: str, data: CareerGoalUpdate
    ) -> CareerGoal:
        result = await session.execute(
            select(CareerGoal).where(CareerGoal.id == goal_id, CareerGoal.user_id == user_id)
        )
        goal = result.scalar_one_or_none()
        if not goal:
            raise ResourceNotFoundException(f"Career goal {goal_id} not found")

        for key, val in data.model_dump(exclude_unset=True).items():
            setattr(goal, key, val)
        await session.flush()
        return goal
