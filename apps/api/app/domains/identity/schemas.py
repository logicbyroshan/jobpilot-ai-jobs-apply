from datetime import datetime
from typing import Dict, List, Optional

from pydantic import BaseModel, ConfigDict


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


# ==============================================================================
# Living Professional Portfolio Schemas
# ==============================================================================

class PortfolioHero(BaseModel):
    full_name: str
    headline: str
    summary: str
    location: str
    years_of_experience: float
    current_level: str
    avatar_url: Optional[str] = None
    email: str
    last_synced: str


class CapabilityRating(BaseModel):
    area: str
    rating: str  # e.g., "Advanced", "Strong", "Intermediate"
    description: str


class PortfolioAbout(BaseModel):
    headline: str
    bio: str
    career_direction: str
    preferred_roles: List[str]
    location: str
    years_of_experience: float
    capability_ratings: List[CapabilityRating]


class PortfolioExperienceItem(BaseModel):
    id: str
    company_name: str
    title: str
    period: str
    location: str
    is_current: bool
    impact_bullets: List[str]
    demonstrated_skills: List[str]
    evidence_badges: List[str]  # e.g., ["GitHub Verified", "Resume Extracted", "Code Proof"]


class PortfolioProjectItem(BaseModel):
    id: str
    title: str
    description: str
    what_was_built: str
    why_it_matters: str
    technologies: List[str]
    evidence_count: int
    repository_url: Optional[str] = None
    demo_url: Optional[str] = None
    provenance_source: str


class CategorizedSkillItem(BaseModel):
    name: str
    category: str
    capability_level: str  # "Advanced", "Strong", "Intermediate"
    level_score: float     # e.g., 9.2
    confidence: str        # "High", "Medium", "Verified"
    target_opportunities_count: int
    evidence_sources: List[str]
    last_verified: str
    strengthen_tip: Optional[str] = None


class ConfidenceBreakdown(BaseModel):
    strong_evidence_count: int
    needs_verification_count: int
    missing_evidence_count: int
    confidence_score: float  # e.g. 94.2


class ConnectedSourceItem(BaseModel):
    id: str
    name: str
    type: str
    status: str
    items_count: int
    last_synced: str


class LivingPortfolioResponse(BaseModel):
    hero: PortfolioHero
    about: PortfolioAbout
    experiences: List[PortfolioExperienceItem]
    projects: List[PortfolioProjectItem]
    categorized_skills: Dict[str, List[CategorizedSkillItem]]
    confidence_breakdown: ConfidenceBreakdown
    connected_sources: List[ConnectedSourceItem]
