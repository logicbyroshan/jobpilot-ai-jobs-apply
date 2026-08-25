from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

from app.domains.skills.schemas import SkillResponse


class GapBase(BaseModel):
    title: str
    gap_type: str = "SKILL_GAP"
    current_level: float = 3.0
    target_level: float = 7.0
    importance: int = 4
    confidence: float = 0.9
    priority: str = "HIGH"
    rationale: Optional[str] = None
    estimated_effort_hours: int = 20
    expected_impact: Optional[str] = None
    status: str = "ACTIVE"


class GapCreate(GapBase):
    skill_id: Optional[str] = None
    job_id: Optional[str] = None


class GapResponse(GapBase):
    model_config = ConfigDict(from_attributes=True)
    id: str
    user_id: str
    skill_id: Optional[str] = None
    job_id: Optional[str] = None
    skill: Optional[SkillResponse] = None
    created_at: datetime
    updated_at: datetime
