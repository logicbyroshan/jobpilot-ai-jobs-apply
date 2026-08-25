from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, EmailStr


class ExperienceBase(BaseModel):
    company_name: str
    title: str
    location: Optional[str] = None
    is_remote: bool = False
    start_date: str
    end_date: Optional[str] = None
    is_current: bool = False
    description: Optional[str] = None
    technologies_json: List[str] = []


class ExperienceCreate(ExperienceBase):
    pass


class ExperienceResponse(ExperienceBase):
    model_config = ConfigDict(from_attributes=True)
    id: str
    identity_id: str
    created_at: datetime
    updated_at: datetime


class ProjectBase(BaseModel):
    title: str
    description: Optional[str] = None
    url: Optional[str] = None
    repository_url: Optional[str] = None
    technologies_json: List[str] = []
    stars_count: int = 0
    provenance_source: str = "github"


class ProjectCreate(ProjectBase):
    pass


class ProjectResponse(ProjectBase):
    model_config = ConfigDict(from_attributes=True)
    id: str
    identity_id: str
    created_at: datetime
    updated_at: datetime


class ProfessionalIdentityBase(BaseModel):
    headline: str
    bio: Optional[str] = None
    years_of_experience: float = 0.0
    current_level: str = "Mid-Level"
    profile_confidence: float = 0.85
    summary_json: dict = {}


class ProfessionalIdentityUpdate(BaseModel):
    headline: Optional[str] = None
    bio: Optional[str] = None
    years_of_experience: Optional[float] = None
    current_level: Optional[str] = None


class ProfessionalIdentityResponse(ProfessionalIdentityBase):
    model_config = ConfigDict(from_attributes=True)
    id: str
    user_id: str
    full_name: Optional[str] = None
    email: Optional[str] = None
    avatar_url: Optional[str] = None
    experiences: List[ExperienceResponse] = []
    projects: List[ProjectResponse] = []
    created_at: datetime
    updated_at: datetime


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    email: str
    full_name: str
    avatar_url: Optional[str] = None
    is_active: bool
    is_verified: bool
    created_at: datetime
    updated_at: datetime
