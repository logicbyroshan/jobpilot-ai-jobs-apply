from typing import Dict, List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.errors import ResourceNotFoundException
from app.domains.learning.models import LearningPlan, LearningPlanItem, Resource
from app.domains.learning.schemas import (
    CustomSkillAnalysisRequest,
    CustomSkillAnalysisResponse,
    DailyPlanResponse,
    LearningPlanItemResponse,
    LearningPlanResponse,
    LearningResourceCard,
    LearningTaskResponse,
    PlanWeekRequest,
)

# In-memory storage for user-scheduled Kanban tasks during active session
_TASKS_STORE: Dict[str, List[LearningTaskResponse]] = {}


def _get_default_tasks_for_user(user_id: str) -> List[LearningTaskResponse]:
    return [
        LearningTaskResponse(
            id="task-101",
            user_id=user_id,
            source_gap_id="gap-gpu-1",
            learning_plan_id="plan-gpu-1",
            title="Read Kubernetes Scheduling Concepts & Operator Internals",
            description="Deep dive into scheduling constraints, node selectors, affinity rules, and taints/tolerations.",
            estimated_minutes=15,
            scheduled_day="TODAY",
            priority="CRITICAL",
            status="TODAY",
            task_type="READ",
            order=1,
            resource=LearningResourceCard(
                title="Kubernetes Scheduling Deep Dive (Official Architecture)",
                resource_type="Documentation",
                cost="FREE",
                duration_minutes=15,
                why_chosen="Your target roles frequently require scheduling knowledge and your current evidence is weak in operator controllers.",
                what_you_will_learn=[
                    "Scheduling constraints and score algorithms",
                    "Node selectors, affinity, and anti-affinity",
                    "Taints, tolerations, and daemonset priorities",
                ],
                url="https://kubernetes.io/docs/concepts/scheduling-eviction/kube-scheduler/",
            ),
        ),
        LearningTaskResponse(
            id="task-102",
            user_id=user_id,
            source_gap_id="gap-gpu-1",
            learning_plan_id="plan-gpu-1",
            title="Watch Triton Multi-Model Dynamic Batching Protocol",
            description="Analyze model concurrent execution, dynamic queue management, and GPU memory partitioning.",
            estimated_minutes=22,
            scheduled_day="TODAY",
            priority="HIGH",
            status="TODAY",
            task_type="WATCH",
            order=2,
            resource=LearningResourceCard(
                title="Triton Architecture: High-Throughput Model Serving",
                resource_type="Video",
                cost="FREE",
                duration_minutes=22,
                why_chosen="Required by Anthropic & Datadog AI infrastructure positions.",
                what_you_will_learn=[
                    "Dynamic batching vs sequence batching",
                    "CUDA stream isolation and thread pools",
                    "Memory pinning with IPC handles",
                ],
                url="https://github.com/triton-inference-server/server",
            ),
        ),
        LearningTaskResponse(
            id="task-103",
            user_id=user_id,
            source_gap_id="gap-gpu-1",
            learning_plan_id="plan-gpu-1",
            title="Complete Triton Async Client Lab Exercise",
            description="Build a Python AsyncIO client pooling requests into a batched Triton gRPC serving endpoint.",
            estimated_minutes=20,
            scheduled_day="TODAY",
            priority="HIGH",
            status="IN_PROGRESS",
            task_type="PRACTICE",
            order=3,
            resource=LearningResourceCard(
                title="Practical Lab: Triton gRPC Streaming Async Client",
                resource_type="Lab",
                cost="FREE",
                duration_minutes=20,
                why_chosen="Hands-on coding evidence to verify senior streaming concurrency capability.",
                what_you_will_learn=[
                    "gRPC bi-directional streaming in Python/Go",
                    "Batch response dispatching and timeout hedging",
                ],
                url="https://github.com/triton-inference-server/client",
            ),
        ),
        LearningTaskResponse(
            id="task-104",
            user_id=user_id,
            source_gap_id="gap-gpu-1",
            learning_plan_id="plan-gpu-1",
            title="Build Custom Kubernetes Mutating Webhook Operator",
            description="Create an admission controller injecting GPU sidecar telemetry into inference pods.",
            estimated_minutes=60,
            scheduled_day="THURSDAY",
            priority="HIGH",
            status="BACKLOG",
            task_type="BUILD",
            order=4,
            resource=LearningResourceCard(
                title="Building Production Kubernetes Operators in Go (Kubebuilder)",
                resource_type="Project",
                cost="FREE",
                duration_minutes=60,
                why_chosen="Creates verifiable GitHub proof demonstrating end-to-end operator engineering.",
                what_you_will_learn=[
                    "CRD controller reconciliation loops",
                    "Mutating/Validating admission webhooks",
                ],
                url="https://book.kubebuilder.io/",
            ),
        ),
        LearningTaskResponse(
            id="task-105",
            user_id=user_id,
            source_gap_id="gap-gpu-1",
            learning_plan_id="plan-gpu-1",
            title="Kubernetes Core Architecture Fundamentals",
            description="Review API server, etcd quorums, and kubelet state sync.",
            estimated_minutes=30,
            scheduled_day="MONDAY",
            priority="MEDIUM",
            status="DONE",
            task_type="READ",
            order=5,
            resource=None,
        ),
        LearningTaskResponse(
            id="task-106",
            user_id=user_id,
            source_gap_id="gap-gpu-1",
            learning_plan_id="plan-gpu-1",
            title="GPU Cluster Scheduling Verification Diagnostic",
            description="Complete deterministic competency assessment to upgrade profile skill score from 4.2 to 7.5.",
            estimated_minutes=25,
            scheduled_day="FRIDAY",
            priority="CRITICAL",
            status="READY_TO_PROVE",
            task_type="TEST",
            order=6,
            resource=LearningResourceCard(
                title="JobPilot Diagnostic: GPU Cluster Scheduling & Triton",
                resource_type="Lab",
                cost="FREE",
                duration_minutes=25,
                why_chosen="Unlocks 11 top-tier AI infrastructure opportunities.",
                what_you_will_learn=["Score verification report added to living portfolio."],
                url="/prove",
            ),
        ),
    ]


class LearningService:
    @staticmethod
    async def get_user_plans(session: AsyncSession, user_id: str) -> List[LearningPlanResponse]:
        result = await session.execute(
            select(LearningPlan)
            .where(LearningPlan.user_id == user_id)
            .options(
                selectinload(LearningPlan.items).selectinload(LearningPlanItem.resource)
            )
            .order_by(LearningPlan.created_at.desc())
        )
        plans = result.scalars().all()
        if not plans:
            # Return demo active plan
            return [
                LearningPlanResponse(
                    id="plan-gpu-1",
                    title="GPU Cluster Scheduling & Triton Serving Blueprint",
                    target_skill="GPU Cluster Scheduling & Triton Serving Layer",
                    current_level=4.2,
                    target_level=7.5,
                    progress_percentage=42.0,
                    estimated_duration_days=14,
                    status="IN_PROGRESS",
                    items=[],
                )
            ]
        return [LearningPlanResponse.model_validate(p) for p in plans]

    list_user_plans = get_user_plans

    @staticmethod
    async def toggle_plan_item(
        session: AsyncSession, plan_id: str, item_id: str
    ) -> LearningPlanResponse:
        result = await session.execute(
            select(LearningPlanItem)
            .where(
                LearningPlanItem.id == item_id,
                LearningPlanItem.learning_plan_id == plan_id,
            )
            .options(selectinload(LearningPlanItem.resource))
        )
        item = result.scalar_one_or_none()
        if not item:
            raise ResourceNotFoundException(f"Learning plan item {item_id} not found")

        item.is_completed = not item.is_completed
        item.status = "COMPLETED" if item.is_completed else "IN_PROGRESS"
        await session.flush()

        plan_res = await session.execute(
            select(LearningPlan)
            .where(LearningPlan.id == plan_id)
            .options(
                selectinload(LearningPlan.items).selectinload(LearningPlanItem.resource)
            )
        )
        plan = plan_res.scalar_one_or_none()
        if not plan:
            raise ResourceNotFoundException(f"Learning plan {plan_id} not found")

        completed_items = sum(1 for it in plan.items if it.is_completed)
        total_items = len(plan.items)
        plan.progress_percentage = round((completed_items / total_items) * 100.0, 1) if total_items else 0.0
        await session.flush()
        return LearningPlanResponse.model_validate(plan)

    @staticmethod
    async def list_resources(session: AsyncSession) -> List[Resource]:
        result = await session.execute(select(Resource).order_by(Resource.quality_score.desc()))
        return list(result.scalars().all())

    @staticmethod
    async def get_daily_plan(session: AsyncSession, user_id: str) -> DailyPlanResponse:
        if user_id not in _TASKS_STORE or not _TASKS_STORE[user_id]:
            _TASKS_STORE[user_id] = _get_default_tasks_for_user(user_id)

        user_tasks = _TASKS_STORE[user_id]

        today_tasks = [t for t in user_tasks if t.status in ("TODAY", "IN_PROGRESS")]
        done_tasks = [t for t in user_tasks if t.status == "DONE"]
        proof_tasks = [t for t in user_tasks if t.status == "READY_TO_PROVE"]

        kanban = {
            "BACKLOG": [t for t in user_tasks if t.status == "BACKLOG"],
            "TODAY": [t for t in user_tasks if t.status == "TODAY"],
            "IN_PROGRESS": [t for t in user_tasks if t.status == "IN_PROGRESS"],
            "DONE": [t for t in user_tasks if t.status == "DONE"],
            "READY_TO_PROVE": [t for t in user_tasks if t.status == "READY_TO_PROVE"],
        }

        return DailyPlanResponse(
            today_focus_skill="GPU Cluster Scheduling & Triton Serving Layer",
            current_level=4.2,
            target_level=7.5,
            target_role_impact="Unlocks 11 Tier-1 AI Infrastructure Opportunities",
            tasks_completed_count=len(done_tasks),
            total_tasks_count=len(user_tasks),
            concepts_practiced_count=3,
            total_concepts_count=5,
            proof_completed_count=0,
            total_proof_count=1,
            today_tasks=today_tasks,
            kanban_columns=kanban,
        )

    @staticmethod
    async def update_task_status(
        session: AsyncSession, user_id: str, task_id: str, new_status: str
    ) -> LearningTaskResponse:
        if user_id not in _TASKS_STORE:
            _TASKS_STORE[user_id] = _get_default_tasks_for_user(user_id)

        for task in _TASKS_STORE[user_id]:
            if task.id == task_id:
                task.status = new_status
                return task

        raise ResourceNotFoundException(f"Task {task_id} not found")

    @staticmethod
    async def plan_my_week(
        session: AsyncSession, user_id: str, req: PlanWeekRequest
    ) -> DailyPlanResponse:
        # Re-generate organized weekly scheduled tasks
        _TASKS_STORE[user_id] = _get_default_tasks_for_user(user_id)
        return await LearningService.get_daily_plan(session, user_id)

    @staticmethod
    async def analyze_custom_skill(
        session: AsyncSession, user_id: str, req: CustomSkillAnalysisRequest
    ) -> CustomSkillAnalysisResponse:
        new_task = LearningTaskResponse(
            id=f"custom-task-{len(_TASKS_STORE.get(user_id, [])) + 1}",
            user_id=user_id,
            title=f"Learn {req.skill_name} Architecture & Best Practices",
            description=f"Initial deep dive into {req.skill_name} targeting staff-level job requirements.",
            estimated_minutes=35,
            scheduled_day="TODAY",
            priority="HIGH",
            status="TODAY",
            task_type="READ",
            order=1,
            resource=LearningResourceCard(
                title=f"{req.skill_name} Production Guide",
                resource_type="Documentation",
                cost="FREE",
                duration_minutes=35,
                why_chosen=f"Strengthens custom goal: {req.goal}",
                what_you_will_learn=[
                    "Core architecture and syntax",
                    "Integration with existing distributed systems stack",
                ],
                url="https://github.com",
            ),
        )

        if user_id not in _TASKS_STORE:
            _TASKS_STORE[user_id] = _get_default_tasks_for_user(user_id)

        _TASKS_STORE[user_id].insert(0, new_task)

        return CustomSkillAnalysisResponse(
            skill_name=req.skill_name,
            relevance_score=88.5,
            target_opportunities_unlocked=8,
            estimated_effort_hours=14.0,
            diagnostic_gap=f"Missing practical code evidence for {req.skill_name}",
            recommended_plan_id=f"plan-{req.skill_name.lower().replace(' ', '-')}",
            initial_tasks=[new_task],
        )


class LearningPlanEngine:
    @staticmethod
    def generate_plan_blueprint(
        target_skill: str, current_level: float, target_level: float
    ) -> List[dict]:
        return [
            {"item_type": "LEARN", "title": f"Deep Dive: {target_skill} Core Architecture", "estimated_minutes": 45},
            {"item_type": "PRACTICE", "title": f"Hands-on Lab: {target_skill} Scenarios", "estimated_minutes": 60},
            {"item_type": "BUILD", "title": f"Project: Production {target_skill} Module", "estimated_minutes": 90},
            {"item_type": "REVIEW", "title": f"Architecture Review & Tradeoffs for {target_skill}", "estimated_minutes": 30},
            {"item_type": "PROVE", "title": f"Diagnostic Assessment for {target_skill}", "estimated_minutes": 30},
        ]

