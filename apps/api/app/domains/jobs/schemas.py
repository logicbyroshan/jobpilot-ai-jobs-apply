from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict

from app.domains.skills.schemas import SkillResponse


class CompanyBase(BaseModel):
    name: str
    website_url: Optional[str] = None
    logo_url: Optional[str] = None
    industry: str = "Technology"
    size_range: Optional[str] = "100-500"
    location: Optional[str] = None
    description: Optional[str] = None


class CompanyResponse(CompanyBase):
    model_config = ConfigDict(from_attributes=True)
    id: str
    created_at: datetime
    updated_at: datetime


class JobRequirementResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    job_id: str
    skill_id: Optional[str] = None
    requirement_type: str
    importance: int
    confidence: float
    source_text: str
    normalized_interpretation: Optional[str] = None
    skill: Optional[SkillResponse] = None


class JobBase(BaseModel):
    title: str
    seniority: str = "Senior"
    employment_type: str = "FULL_TIME"
    location: str = "Remote"
    is_remote: bool = True
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    salary_currency: str = "USD"
    raw_description: Optional[str] = None
    normalized_description: Optional[str] = None
    responsibilities_json: List[str] = []
    requirements_summary_json: List[str] = []
    is_active: bool = True


class JobCreate(JobBase):
    company_name: str
    company_industry: Optional[str] = "Technology"
    requirements: List[str] = []


class JobResponse(JobBase):
    model_config = ConfigDict(from_attributes=True)
    id: str
    company_id: str
    job_source_id: Optional[str] = None
    canonical_url: Optional[str] = None
    posted_at: datetime
    company: Optional[CompanyResponse] = None
    requirements: List[JobRequirementResponse] = []
    created_at: datetime
    updated_at: datetime
