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
    question_type: str  # "KNOWLEDGE", "CODING", "SYSTEM_DESIGN", "SCENARIO"
    options_json: List[str] = []
    points: int
    starter_code: Optional[str] = None


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
    skills_evaluated: List[str] = []
    required_permissions: List[str] = ["Browser focus", "Fullscreen"]
    skill: Optional[SkillResponse] = None
    questions: List[AssessmentQuestionResponse] = []
    created_at: datetime


class AssessmentConsentRequest(BaseModel):
    camera_consent: bool = False
    microphone_consent: bool = False
    screen_share_consent: bool = False
    fullscreen_consent: bool = True
    focus_monitoring_consent: bool = True


class AssessmentSessionResponse(BaseModel):
    session_id: str
    assessment_id: str
    assessment: AssessmentResponse
    started_at: str
    expires_at: str
    status: str
    integrity_status: str  # "NORMAL", "REVIEW_RECOMMENDED"


class AssessmentIntegrityEventRequest(BaseModel):
    event_type: str  # "TAB_HIDDEN", "FULLSCREEN_EXIT", "FOCUS_LOST", "MIC_DISABLED"
    timestamp: str
    severity: str = "LOW"
    metadata: dict = {}


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
    skill_name: str = "Distributed Consensus & Raft"
    skill_level_before: float = 8.0
    skill_level_after: float = 9.8
    skill_proficiency_boost: float = 1.8
    feedback_summary: Optional[str] = None
    breakdown: Dict[str, float] = {
        "Core Concepts": 10.0,
        "Practical Reasoning": 9.6,
        "Architectural Tradeoffs": 9.4,
        "Failure Modes": 10.0,
    }
    what_improved: List[str] = [
        "Verified mastery of Raft leader election quorums and split-brain resolution.",
        "Demonstrated deep understanding of linearizable vs sequential consistency.",
        "Profile readiness updated in core career graph.",
    ]
    what_still_needs_work: List[str] = [
        "Optional: Explore multi-raft range partitioning for further scaling beyond 1M tx/sec.",
    ]
    evaluations: List[AssessmentEvaluationItem] = []
    unlocked_opportunities_count: int = 12
    recalculated_matches_notice: str = "Match scores successfully recalculated. 12 Tier-1 positions now exceed your 90% threshold."
    submitted_at: datetime
    created_at: datetime
