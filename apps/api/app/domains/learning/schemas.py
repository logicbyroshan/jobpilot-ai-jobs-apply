from datetime import datetime
from typing import List, Optional
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
    quality_score: float
    created_at: datetime


class LearningPlanItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    learning_plan_id: str
    resource_id: Optional[str] = None
    title: str
    item_type: str
    order_index: int
    is_completed: bool
    estimated_minutes: int
    status: str
    resource: Optional[ResourceResponse] = None


class LearningPlanCreate(BaseModel):
    gap_id: Optional[str] = None
    target_skill: str
    title: Optional[str] = None
    current_level: float = 3.0
    target_level: float = 7.0


class LearningPlanResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    user_id: str
    gap_id: Optional[str] = None
    title: str
    target_skill: str
    current_level: float
    target_level: float
    progress_percentage: float
    estimated_duration_days: int
    status: str
    items: List[LearningPlanItemResponse] = []
    created_at: datetime
    updated_at: datetime
