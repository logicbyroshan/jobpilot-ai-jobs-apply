from datetime import datetime
from typing import Dict, List, Optional
from pydantic import BaseModel, ConfigDict


class ResourceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    title: str
    provider: str
    url: str
    cost: str
    resource_type: str
    difficulty: str
    duration_hours: float
    topics_json: List[str] = []
    quality_score: float = 4.8


class LearningPlanItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    learning_plan_id: str
    title: str
    item_type: str
    order_index: int
    is_completed: bool
    estimated_minutes: int
    status: str
    resource: Optional[ResourceResponse] = None


class LearningPlanResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    title: str
    target_skill: str
    current_level: float
    target_level: float
    progress_percentage: float
    estimated_duration_days: int
    status: str
    items: List[LearningPlanItemResponse] = []


# ==============================================================================
# Daily Plan & Kanban Task Schemas
# ==============================================================================

class LearningResourceCard(BaseModel):
    title: str
    resource_type: str  # "Documentation", "Video", "Lab", "Project", "Course"
    cost: str           # "FREE", "PAID"
    duration_minutes: int
    why_chosen: str
    what_you_will_learn: List[str]
    url: str


class LearningTaskResponse(BaseModel):
    id: str
    user_id: str
    source_gap_id: Optional[str] = None
    learning_plan_id: Optional[str] = None
    title: str
    description: str
    estimated_minutes: int
    scheduled_day: str  # "TODAY", "MONDAY", "TUESDAY", etc.
    priority: str       # "CRITICAL", "HIGH", "MEDIUM"
    status: str         # "BACKLOG", "TODAY", "IN_PROGRESS", "DONE", "READY_TO_PROVE"
    task_type: str      # "READ", "WATCH", "PRACTICE", "BUILD", "REVIEW", "TEST"
    order: int
    resource: Optional[LearningResourceCard] = None


class DailyPlanResponse(BaseModel):
    today_focus_skill: str
    current_level: float
    target_level: float
    target_role_impact: str
    tasks_completed_count: int
    total_tasks_count: int
    concepts_practiced_count: int
    total_concepts_count: int
    proof_completed_count: int
    total_proof_count: int
    today_tasks: List[LearningTaskResponse]
    kanban_columns: Dict[str, List[LearningTaskResponse]]


class PlanWeekRequest(BaseModel):
    available_hours_per_week: Optional[float] = 10.0
    primary_focus_skill: Optional[str] = None


class CustomSkillAnalysisRequest(BaseModel):
    skill_name: str
    current_confidence: Optional[str] = "Intermediate"
    goal: Optional[str] = "Learn for Staff/Principal target roles"


class CustomSkillAnalysisResponse(BaseModel):
    skill_name: str
    relevance_score: float
    target_opportunities_unlocked: int
    estimated_effort_hours: float
    diagnostic_gap: str
    recommended_plan_id: str
    initial_tasks: List[LearningTaskResponse]
