from typing import Any, Dict, List, Optional

from pydantic import BaseModel


class NextAction(BaseModel):
    action_type: str
    title: str
    description: str
    rationale: str
    estimated_time_minutes: int
    impact_score: float
    target_stage: str
    action_url: str
    cta_label: str
    metadata: Dict[str, Any] = {}


class NextActionEngine:
    """
    Evaluates user profile, active gaps, learning progress, assessment readiness,
    and application pipeline state to compute the single highest-yield next action.
    """

    @staticmethod
    def evaluate_next_action(
        has_career_goal: bool,
        verified_skills_count: int,
        critical_gaps: List[Dict[str, Any]],
        assessments_ready: List[Dict[str, Any]],
        in_progress_learning: Optional[Dict[str, Any]],
        active_interviews: List[Dict[str, Any]],
        top_matches: List[Dict[str, Any]],
    ) -> NextAction:
        # Priority 1: Missing Career Direction
        if not has_career_goal:
            return NextAction(
                action_type="SET_CAREER_GOAL",
                title="Define Your Target Career Direction",
                description="Specify your target role title, seniority, and compensation expectations.",
                rationale="JobPilot requires your target career goal to calibrate matching and gap diagnostics.",
                estimated_time_minutes=3,
                impact_score=9.9,
                target_stage="KNOW",
                action_url="/know",
                cta_label="Set Career Goal",
            )

        # Priority 2: Ready Assessment with high unlock potential
        if assessments_ready:
            top_asm = assessments_ready[0]
            return NextAction(
                action_type="PROVE_SKILL",
                title=f"Prove Skill: {top_asm.get('skill_name', 'Distributed Systems')}",
                description=f"Complete the {top_asm.get('title', 'Skill Assessment')} to verify live problem-solving capability.",
                rationale="Your knowledge improved in Stage 4. Passing this assessment verifies your level and unlocks 12 higher-signal opportunities.",
                estimated_time_minutes=top_asm.get("time_limit_minutes", 20),
                impact_score=9.5,
                target_stage="PROVE",
                action_url="/prove",
                cta_label="Start Assessment",
                metadata={"assessment_id": top_asm.get("id")},
            )

        # Priority 3: Active interview preparation
        if active_interviews:
            top_int = active_interviews[0]
            return NextAction(
                action_type="PREPARE_INTERVIEW",
                title=f"Prepare for {top_int.get('company_name', 'Anthropic')} Interview",
                description="Review tailored system design architecture notes and verified evidence citations.",
                rationale="Addressing technical round drop-off ensures maximum conversion from interview to offer.",
                estimated_time_minutes=25,
                impact_score=9.2,
                target_stage="APPLY",
                action_url="/applications",
                cta_label="Review Preparation Kit",
            )

        # Priority 4: Active daily focus sprint in learning plan
        if in_progress_learning:
            return NextAction(
                action_type="CONTINUE_LEARNING",
                title="Complete Today's Focus Sprint",
                description="Read dynamic batching scheduler architecture and practice configuring model config.",
                rationale="Closing your active deficit moves your capability from level 4.1 to target 7.5.",
                estimated_time_minutes=35,
                impact_score=8.8,
                target_stage="IMPROVE",
                action_url="/improve",
                cta_label="Start Today's Sprint",
            )

        # Priority 5: High-signal unapplied match
        if top_matches and top_matches[0].get("overall_score", 0) >= 90:
            top_m = top_matches[0]
            return NextAction(
                action_type="REVIEW_OPPORTUNITY",
                title=f"Review High-Fit Opportunity: {top_m.get('job_title', 'Staff Engineer')}",
                description=f"{top_m.get('company_name', 'Company')} matched at {top_m.get('overall_score', 94):.0f}% technical alignment.",
                rationale="Your verified evidence profile matches 95%+ of this role's core requirements.",
                estimated_time_minutes=10,
                impact_score=8.5,
                target_stage="MATCH",
                action_url="/opportunities",
                cta_label="View Opportunity",
            )

        # Fallback: General profile enrichment
        return NextAction(
            action_type="ENRICH_IDENTITY",
            title="Enrich Professional Evidence Graph",
            description="Connect additional GitHub repositories or work experience citations.",
            rationale="More verified artifacts increase your profile confidence and matching accuracy.",
            estimated_time_minutes=5,
            impact_score=7.5,
            target_stage="KNOW",
            action_url="/sources",
            cta_label="Manage Sources",
        )
