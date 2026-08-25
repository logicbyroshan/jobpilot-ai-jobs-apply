from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class CareerGoalBase(BaseModel):
    target_role: str
    target_seniority: str = "Senior"
    location_preference: Optional[str] = "Remote / United States"
    is_remote_preferred: bool = True
    employment_type: str = "FULL_TIME"
    target_salary_min: Optional[int] = 160000
    target_salary_max: Optional[int] = 210000
    target_currency: str = "USD"
    priority: int = 1
    is_active: bool = True


class CareerGoalCreate(CareerGoalBase):
    pass


class CareerGoalUpdate(BaseModel):
    target_role: Optional[str] = None
    target_seniority: Optional[str] = None
    location_preference: Optional[str] = None
    is_remote_preferred: Optional[bool] = None
    employment_type: Optional[str] = None
    target_salary_min: Optional[int] = None
    target_salary_max: Optional[int] = None
    priority: Optional[int] = None
    is_active: Optional[bool] = None


class CareerGoalResponse(CareerGoalBase):
    model_config = ConfigDict(from_attributes=True)
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime
