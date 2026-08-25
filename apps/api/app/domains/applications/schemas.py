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
    eligible_count: int = 12


class ApplicationPolicyUpdate(BaseModel):
    mode: Optional[str] = None
    is_auto_apply_enabled: Optional[bool] = None
    min_match_score: Optional[float] = None
    daily_application_limit: Optional[int] = None
    requires_user_approval: Optional[bool] = None


# ==============================================================================
# Resume Center & Auto-Apply Execution Schemas
# ==============================================================================

class ResumeVersionResponse(BaseModel):
    id: str
    name: str
    target_role: str
    version_type: str  # "MASTER", "TAILORED"
    summary: str
    emphasized_skills: List[str]
    reduced_skills: List[str]
    change_rationale: str
    truthfulness_verified: bool = True
    updated_at: str


class TailorResumeRequest(BaseModel):
    job_id: str


class AutoApplyPreviewResponse(BaseModel):
    eligible_opportunities_count: int
    meets_rules_count: int
    needs_review_count: int
    blocked_count: int
    applied_today_count: int
    daily_limit: int
    min_match_score: float
    eligible_jobs: List[dict]


class AutoApplyExecutionItem(BaseModel):
    id: str
    company_name: str
    role_title: str
    match_score: float
    status: str  # "QUEUED", "PROCESSING", "SUBMITTED", "NEEDS_REVIEW", "FAILED"
    failure_reason: Optional[str] = None
    can_fix: bool = False
    timestamp: str


class AutoApplyExecutionResponse(BaseModel):
    queued_count: int
    processing_count: int
    submitted_count: int
    needs_review_count: int
    failed_count: int
    executions: List[AutoApplyExecutionItem]
