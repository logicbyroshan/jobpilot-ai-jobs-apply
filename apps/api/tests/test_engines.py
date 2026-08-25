from app.domains.gaps.services import GapAnalysisEngine, GapPriorityEngine
from app.domains.identity.engine import NextActionEngine
from app.domains.learning.services import LearningPlanEngine
from app.domains.outcomes.services import OutcomeAnalysisEngine
from app.domains.skills.services import SkillScoringEngine


def test_skill_scoring_engine_weights_and_levels():
    evidence_items = [
        {"source_type": "ASSESSMENT", "proficiency_estimate": 9.5, "confidence": 0.98, "freshness_days": 10},
        {"source_type": "PROJECT", "proficiency_estimate": 8.5, "confidence": 0.90, "freshness_days": 30},
        {"source_type": "EXPERIENCE", "proficiency_estimate": 8.0, "confidence": 0.85, "freshness_days": 60},
    ]
    prof, conf, level, freshness = SkillScoringEngine.compute_proficiency(evidence_items)

    assert prof >= 8.5
    assert conf >= 0.95
    assert level in ("PROFICIENT", "ADVANCED")
    assert freshness == "FRESH"


def test_gap_priority_engine_calculation():
    # Critical gap (High coverage + high deficit + required)
    priority, score = GapPriorityEngine.calculate_priority(
        target_role_coverage_pct=0.85,
        level_deficit=4.5,
        is_hard_requirement=True,
    )
    assert priority == "CRITICAL"
    assert score >= 0.80

    # Low gap (Low coverage + small deficit + optional)
    priority, score = GapPriorityEngine.calculate_priority(
        target_role_coverage_pct=0.20,
        level_deficit=1.0,
        is_hard_requirement=False,
    )
    assert priority in ("LOW", "MEDIUM")


def test_gap_analysis_engine_diagnostics():
    user_skills = {"python": 9.0, "fastapi": 8.5, "postgresql": 8.0}
    verified_skills = {"python", "fastapi"}

    job_requirements = [
        {"name": "Kubernetes", "target_level": 7.5, "required": True},  # Missing -> SKILL_GAP
        {"name": "PostgreSQL", "target_level": 8.0, "required": True},  # Not in verified -> EVIDENCE_GAP
        {"name": "Python", "target_level": 9.0, "required": True},      # Matched
    ]

    gaps = GapAnalysisEngine.diagnose_deficits(
        user_skills_map=user_skills,
        verified_skills_set=verified_skills,
        job_requirements=job_requirements,
    )

    gap_types = [g["gap_type"] for g in gaps]
    assert "SKILL_GAP" in gap_types
    assert "EVIDENCE_GAP" in gap_types


def test_learning_plan_engine_blueprint():
    blueprint = LearningPlanEngine.generate_plan_blueprint(
        target_skill="GPU Triton Serving",
        current_level=4.1,
        target_level=7.5,
    )

    assert len(blueprint) == 5
    types = [item["item_type"] for item in blueprint]
    assert types == ["LEARN", "PRACTICE", "BUILD", "REVIEW", "PROVE"]


def test_outcome_analysis_engine_bottleneck():
    # Drop-off in technical rounds
    bottleneck_stage, reason, recommendation, impact = OutcomeAnalysisEngine.diagnose_bottleneck(
        total=18,
        recruiter=6,
        technical=2,
        final=1,
        offers=0,
    )

    assert bottleneck_stage == "TECHNICAL_INTERVIEW"
    assert "drop-off" in reason.lower()
    assert impact >= 9.0


def test_next_action_engine_priorities():
    # Priority when assessment is ready
    action = NextActionEngine.evaluate_next_action(
        has_career_goal=True,
        verified_skills_count=8,
        critical_gaps=[{"id": "gap-1", "title": "Kubernetes"}],
        assessments_ready=[{"id": "asm-1", "title": "Raft Consensus", "skill_name": "Raft Consensus"}],
        in_progress_learning=None,
        active_interviews=[],
        top_matches=[],
    )

    assert action.action_type == "PROVE_SKILL"
    assert action.target_stage == "PROVE"
    assert action.cta_label == "Start Assessment"
