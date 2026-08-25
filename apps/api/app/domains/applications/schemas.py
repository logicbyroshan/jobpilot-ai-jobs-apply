from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict

from app.domains.jobs.schemas import JobResponse


class ApplicationArtifactResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    application_id: str
    artifact_type: str
    title: str
    content_text: str
    provenance_sources_json: List[str] = []
    created_at: datetime


class ApplicationBase(BaseModel):
    job_id: str
    tailored_role_title: Optional[str] = None
    notes: Optional[str] = None


class ApplicationCreate(ApplicationBase):
    pass


class ApplicationStatusUpdate(BaseModel):
    status: str
    notes: Optional[str] = None


class ApplicationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    user_id: str
    job_id: str
    status: str
    tailored_role_title: Optional[str] = None
    match_score_at_application: float
    applied_at: Optional[datetime] = None
    notes: Optional[str] = None
    job: Optional[JobResponse] = None
    artifacts: List[ApplicationArtifactResponse] = []
    created_at: datetime
    updated_at: datetime


class ApplicationPolicyResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    user_id: str
    mode: str
    is_auto_apply_enabled: bool
    min_match_score: float
    daily_application_limit: int
    requires_user_approval: bool


class ApplicationPolicyUpdate(BaseModel):
    mode: Optional[str] = None
    is_auto_apply_enabled: Optional[bool] = None
    min_match_score: Optional[float] = None
    daily_application_limit: Optional[int] = None
    requires_user_approval: Optional[bool] = None
