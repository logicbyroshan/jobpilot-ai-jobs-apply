from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict

from app.domains.jobs.schemas import JobResponse


class MatchResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    user_id: str
    job_id: str
    career_goal_id: Optional[str] = None
    overall_score: float
    technical_fit: float
    experience_fit: float
    preference_fit: float
    location_fit: float
    seniority_fit: float
    recommendation_category: str
    explanation: Optional[str] = None
    matched_skills_json: List[str] = []
    missing_skills_json: List[str] = []
    calculated_at: datetime
    job: Optional[JobResponse] = None
    created_at: datetime
    updated_at: datetime


class MatchRecalculateResponse(BaseModel):
    matches_calculated: int
    strong_matches_count: int
    stretch_matches_count: int
    timestamp: datetime
