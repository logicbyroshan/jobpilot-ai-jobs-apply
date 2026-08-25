from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict

from app.domains.evidence.schemas import EvidenceResponse


class SkillBase(BaseModel):
    name: str
    category: str = "General"
    description: Optional[str] = None


class SkillCreate(SkillBase):
    pass


class SkillResponse(SkillBase):
    model_config = ConfigDict(from_attributes=True)
    id: str
    created_at: datetime
    updated_at: datetime


class SkillEvidenceItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    skill_id: str
    evidence_id: str
    strength: str
    confidence: float
    proficiency_estimate: float
    is_user_claimed: bool
    is_verified: bool
    freshness_days: int
    last_verified_at: datetime
    evidence: Optional[EvidenceResponse] = None


class UserSkillProfileResponse(BaseModel):
    skill_id: str
    skill_name: str
    category: str
    proficiency_score: float
    strength: str
    confidence: float
    is_verified: bool
    evidence_count: int
    evidence_sources: List[str]
    evidence_items: List[SkillEvidenceItemResponse] = []
