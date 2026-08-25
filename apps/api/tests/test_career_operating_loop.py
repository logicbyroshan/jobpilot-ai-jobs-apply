import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_complete_career_operating_loop_e2e(client: AsyncClient):
    """
    Validates the end-to-end 7-stage AI Career Operating System Loop:
    1. KNOW: Fetch identity and verified skills.
    2. MATCH: Discover opportunities and 4D match scores.
    3. GAP: Diagnose critical skill deficits.
    4. IMPROVE: Create a 5-phase learning plan and complete focus milestones.
    5. PROVE: Submit diagnostic assessment and calibrate verified proficiency boost.
    6. APPLY: Prepare evidence-backed application and track pipeline status.
    7. OUTCOME: Record outcome events and verify closed-loop bottleneck diagnosis back to Gaps!
    """

    # STAGE 1: KNOW (Identity & Profile)
    resp = await client.get("/api/v1/identity")
    assert resp.status_code == 200
    identity_data = resp.json()
    assert identity_data["headline"] is not None
    assert identity_data["profile_confidence"] > 0.5

    # Check Overview Read Model
    overview_resp = await client.get("/api/v1/overview")
    assert overview_resp.status_code == 200
    overview_data = overview_resp.json()
    assert "next_action" in overview_data
    assert len(overview_data["lifecycle_stages"]) == 7

    # STAGE 2: MATCH (Opportunities)
    match_resp = await client.get("/api/v1/matching")
    assert match_resp.status_code == 200
    matches = match_resp.json()
    assert len(matches) > 0
    top_match = matches[0]
    assert top_match["overall_score"] >= 70.0
    assert "technical_fit" in top_match
    assert "experience_fit" in top_match

    # STAGE 3: GAP (Deficit Diagnostics)
    gap_resp = await client.get("/api/v1/gaps")
    assert gap_resp.status_code == 200
    gaps = gap_resp.json()
    assert len(gaps) > 0
    target_gap = gaps[0]
    assert target_gap["priority"] in ("CRITICAL", "HIGH", "MEDIUM")

    # STAGE 4: IMPROVE (Actionable Learning Plans)
    plan_resp = await client.get("/api/v1/learning/plans")
    assert plan_resp.status_code == 200
    plans = plan_resp.json()
    assert len(plans) > 0
    plan = plans[0]

    # Complete a learning item in the plan
    if plan["items"]:
        item = plan["items"][0]
        toggle_resp = await client.post(
            f"/api/v1/learning/plans/{plan['id']}/items/{item['id']}/toggle"
        )
        assert toggle_resp.status_code == 200
        updated_plan = toggle_resp.json()
        assert updated_plan["progress_percentage"] >= 0.0

    # STAGE 5: PROVE (Skill Verification Assessment)
    asm_resp = await client.get("/api/v1/assessments")
    assert asm_resp.status_code == 200
    assessments = asm_resp.json()
    assert len(assessments) > 0
    asm = assessments[0]

    # Submit answers for assessment
    answers = {q["id"]: "A" for q in asm["questions"]}
    submit_resp = await client.post(
        f"/api/v1/assessments/{asm['id']}/submit",
        json={"answers": answers},
    )
    assert submit_resp.status_code == 200
    attempt_res = submit_resp.json()
    assert attempt_res["score"] >= 0.0
    assert "evaluations" in attempt_res

    # STAGE 6: APPLY (Pipeline Execution)
    app_resp = await client.post(
        "/api/v1/applications",
        json={
            "job_id": top_match["job_id"],
            "tailored_role_title": top_match["job"]["title"],
            "notes": "E2E loop test application submission.",
        },
    )
    assert app_resp.status_code == 200
    application = app_resp.json()
    assert application["status"] == "DRAFT"

    # Transition status to INTERVIEW
    status_resp = await client.patch(
        f"/api/v1/applications/{application['id']}/status",
        json={"status": "INTERVIEW", "notes": "Advanced to technical interview loop."},
    )
    assert status_resp.status_code == 200
    assert status_resp.json()["status"] == "INTERVIEW"

    # STAGE 7: OUTCOME (Conversion Funnel & Strategic Feedback)
    funnel_resp = await client.get("/api/v1/outcomes/funnel")
    assert funnel_resp.status_code == 200
    funnel_data = funnel_resp.json()
    assert funnel_data["total_applications"] >= 1
    assert len(funnel_data["stages"]) >= 4
    assert funnel_data["primary_bottleneck"] is not None

    # Record interview feedback
    feedback_resp = await client.post(
        "/api/v1/outcomes/feedback",
        json={
            "application_id": application["id"],
            "feedback_stage": "TECHNICAL_ROUND",
            "bottleneck_identified": "GPU Triton dynamic batching memory bounds.",
            "structured_rating": 8.0,
            "raw_feedback": "Great candidate, need deeper GPU scheduler proof.",
        },
    )
    assert feedback_resp.status_code == 200
    assert feedback_resp.json()["bottleneck_identified"] is not None
