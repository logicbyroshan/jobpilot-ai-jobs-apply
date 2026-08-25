from datetime import datetime
from typing import Dict, List, Optional

from pydantic import BaseModel, ConfigDict

from app.domains.skills.schemas import SkillResponse


class AssessmentQuestionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    assessment_id: str
    order_index: int
    prompt: str
    question_type: str
    options_json: List[str] = []
    points: int


class AssessmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    skill_id: Optional[str] = None
    title: str
    assessment_type: str
    time_limit_minutes: int
    passing_score: float
    difficulty: str
    description: Optional[str] = None
    skill: Optional[SkillResponse] = None
    questions: List[AssessmentQuestionResponse] = []
    created_at: datetime


class AssessmentSubmissionRequest(BaseModel):
    answers: Dict[str, str]  # question_id -> user answer string


class AssessmentEvaluationItem(BaseModel):
    question_id: str
    user_answer: str
    correct_answer: str
    is_correct: bool
    explanation: Optional[str] = None


class AssessmentAttemptResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    assessment_id: str
    user_id: str
    status: str
    score: float
    passed: bool
    skill_proficiency_boost: float
    feedback_summary: Optional[str] = None
    evaluations: List[AssessmentEvaluationItem] = []
    submitted_at: datetime
    created_at: datetime

