from typing import Any, Dict, List, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.errors import ResourceNotFoundException
from app.domains.learning.models import LearningPlan, LearningPlanItem, Resource
from app.domains.learning.schemas import LearningPlanCreate


class LearningPlanEngine:
    """
    Constructs high-yield, phased 5-step learning pathways grounded in real deficits.
    """

    @staticmethod
    def generate_plan_blueprint(
        target_skill: str,
        current_level: float,
        target_level: float,
    ) -> List[Dict[str, Any]]:
        return [
            {
                "title": f"1. Learn: {target_skill} Core Architecture & Fundamentals",
                "item_type": "LEARN",
                "estimated_minutes": 45,
                "status": "COMPLETED" if current_level >= 4.0 else "IN_PROGRESS",
                "is_completed": current_level >= 4.0,
            },
            {
                "title": f"2. Practice: Hands-On {target_skill} Configuration & Lab",
                "item_type": "PRACTICE",
                "estimated_minutes": 60,
                "status": "IN_PROGRESS" if current_level >= 4.0 else "PENDING",
                "is_completed": False,
            },
            {
                "title": f"3. Build: Reproducible Production GitHub Artifact for {target_skill}",
                "item_type": "BUILD",
                "estimated_minutes": 120,
                "status": "PENDING",
                "is_completed": False,
            },
            {
                "title": "4. Review: Architecture Trade-Offs & Interview Deep-Dive",
                "item_type": "REVIEW",
                "estimated_minutes": 30,
                "status": "PENDING",
                "is_completed": False,
            },
            {
                "title": f"5. Prove: Stage 5 Diagnostic Assessment for {target_skill}",
                "item_type": "PROVE",
                "estimated_minutes": 25,
                "status": "LOCKED",
                "is_completed": False,
            },
        ]


class LearningService:
    @staticmethod
    async def list_resources(session: AsyncSession, topic: Optional[str] = None) -> List[Resource]:
        query = select(Resource).order_by(Resource.quality_score.desc())
        result = await session.execute(query)
        resources = list(result.scalars().all())
        if topic:
            resources = [r for r in resources if any(topic.lower() in t.lower() for t in r.topics_json)]
        return resources

    @staticmethod
    async def list_user_plans(session: AsyncSession, user_id: str) -> List[LearningPlan]:
        result = await session.execute(
            select(LearningPlan)
            .where(LearningPlan.user_id == user_id)
            .options(
                selectinload(LearningPlan.items).selectinload(LearningPlanItem.resource),
                selectinload(LearningPlan.gap),
            )
            .order_by(LearningPlan.created_at.desc())
        )
        return list(result.scalars().all())

    @staticmethod
    async def get_plan_by_id(session: AsyncSession, user_id: str, plan_id: str) -> LearningPlan:
        result = await session.execute(
            select(LearningPlan)
            .where(LearningPlan.id == plan_id, LearningPlan.user_id == user_id)
            .options(
                selectinload(LearningPlan.items).selectinload(LearningPlanItem.resource),
                selectinload(LearningPlan.gap),
            )
        )
        plan = result.scalar_one_or_none()
        if not plan:
            raise ResourceNotFoundException(f"Learning plan {plan_id} not found")
        return plan

    @staticmethod
    async def create_learning_plan(
        session: AsyncSession, user_id: str, data: LearningPlanCreate
    ) -> LearningPlan:
        plan_title = data.title or f"Mastering {data.target_skill} & Production Architecture"
        plan = LearningPlan(
            user_id=user_id,
            gap_id=data.gap_id,
            title=plan_title,
            target_skill=data.target_skill,
            current_level=data.current_level,
            target_level=data.target_level,
            progress_percentage=0.0,
            estimated_duration_days=14,
            status="IN_PROGRESS",
        )
        session.add(plan)
        await session.flush()

        # Generate 5-step structured blueprint
        blueprint = LearningPlanEngine.generate_plan_blueprint(
            target_skill=data.target_skill,
            current_level=data.current_level,
            target_level=data.target_level,
        )

        for idx, item_data in enumerate(blueprint):
            item = LearningPlanItem(
                learning_plan_id=plan.id,
                title=item_data["title"],
                item_type=item_data["item_type"],
                order_index=idx,
                is_completed=item_data["is_completed"],
                status=item_data["status"],
                estimated_minutes=item_data["estimated_minutes"],
            )
            session.add(item)

        await session.flush()
        return await LearningService.get_plan_by_id(session, user_id, plan.id)

    @staticmethod
    async def toggle_item_completion(
        session: AsyncSession, user_id: str, plan_id: str, item_id: str
    ) -> LearningPlan:
        plan = await LearningService.get_plan_by_id(session, user_id, plan_id)
        target_item = next((item for item in plan.items if item.id == item_id), None)
        if not target_item:
            raise ResourceNotFoundException(f"Plan item {item_id} not found")

        # Toggle state
        target_item.is_completed = not target_item.is_completed
        target_item.status = "COMPLETED" if target_item.is_completed else "IN_PROGRESS"

        completed_count = sum(1 for item in plan.items if item.is_completed)
        plan.progress_percentage = round((completed_count / len(plan.items)) * 100.0, 1) if plan.items else 0.0

        if plan.progress_percentage >= 100.0:
            plan.status = "COMPLETED"
        else:
            plan.status = "IN_PROGRESS"

        await session.flush()
        return await LearningService.get_plan_by_id(session, user_id, plan_id)
