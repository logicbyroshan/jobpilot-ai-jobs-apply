from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict


class ApplicationEventResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    application_id: str
    user_id: str
    event_type: str
    occurred_at: datetime
    notes: Optional[str] = None
    metadata_json: dict = {}
    created_at: datetime


class OutcomeFeedbackCreate(BaseModel):
    application_id: str
    feedback_stage: str = "TECHNICAL"
    bottleneck_identified: Optional[str] = None
    structured_rating: Optional[int] = 3
    raw_feedback: Optional[str] = None


class OutcomeFeedbackResponse(OutcomeFeedbackCreate):
    model_config = ConfigDict(from_attributes=True)
    id: str
    created_at: datetime


class FunnelStageMetric(BaseModel):
    stage: str
    count: int
    conversion_rate_percentage: float


class FunnelAnalyticsResponse(BaseModel):
    total_applications: int
    recruiter_responses: int
    interviews: int
    technical_rounds: int
    final_rounds: int
    offers: int
    rejections: int
    stages: List[FunnelStageMetric]
    primary_bottleneck: str
    strategic_recommendation: str
    recent_events: List[ApplicationEventResponse] = []
