import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_complete_career_operating_loop(client: AsyncClient):
    """
    Validates the end-to-end 7-stage career loop:
    1. Auth / Identity (KNOW)
    2. Opportunity Radar (MATCH)
    3. Competency Diagnostics (GAP)
    4. Curated Pathways (IMPROVE)
    5. Proving Assessments & Feedback (PROVE -> MATCH)
    6. Application Execution (APPLY)
    7. Conversion Funnel (OUTCOME)
    """
    # 1. Register a new user
    reg_resp = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "sarah.connor@jobpilot.dev",
            "password": "SecurePassword123!",
            "full_name": "Sarah Connor",
            "headline": "Lead Systems & Cloud Architect",
        },
    )
    assert reg_resp.status_code == 201
    auth_data = reg_resp.json()
    token = auth_data["access_token"]
    assert auth_data["user"]["id"] is not None
    headers = {"Authorization": f"Bearer {token}"}

    # 2. KNOW: Retrieve Profile
    profile_resp = await client.get("/api/v1/profile", headers=headers)
    assert profile_resp.status_code == 200
    profile = profile_resp.json()
    assert profile["headline"] == "Lead Systems & Cloud Architect"
    assert profile["email"] == "sarah.connor@jobpilot.dev"

    # 3. MATCH: Initial Recalculation
    match_recalc = await client.post("/api/v1/matches/recalculate", headers=headers)
    assert match_recalc.status_code == 200
    recalc_data = match_recalc.json()
    assert recalc_data["matches_calculated"] > 0

    # Retrieve Matches
    matches_resp = await client.get("/api/v1/matches", headers=headers)
    assert matches_resp.status_code == 200
    matches = matches_resp.json()
    assert len(matches) > 0
    top_match = matches[0]

    # 4. GAP: Check Diagnosed Gaps
    gaps_resp = await client.get("/api/v1/gaps", headers=headers)
    assert gaps_resp.status_code == 200

    # 5. IMPROVE: List Resources & Plans
    resources_resp = await client.get("/api/v1/learning/resources")
    assert resources_resp.status_code == 200
    assert len(resources_resp.json()) > 0

    # 6. PROVE: List Assessments and Submit with Strict Evaluation
    assessments_resp = await client.get("/api/v1/assessments")
    assert assessments_resp.status_code == 200
    assessments = assessments_resp.json()
    assert len(assessments) > 0
    asm = assessments[0]

    # Build answers: match the correct answers for all questions
    answers = {}
    for q in asm["questions"]:
        # Answer with the question's first option or key
        answers[q["id"]] = "A"

    submit_resp = await client.post(
        f"/api/v1/assessments/{asm['id']}/submit",
        headers=headers,
        json={"answers": answers},
    )
    assert submit_resp.status_code == 200
    sub_data = submit_resp.json()
    assert "evaluations" in sub_data
    assert len(sub_data["evaluations"]) == len(asm["questions"])

    # 7. APPLY: Policy Retrieval and Application Creation
    policy_resp = await client.get("/api/v1/applications/policy", headers=headers)
    assert policy_resp.status_code == 200
    policy = policy_resp.json()
    assert policy["daily_application_limit"] >= 1

    app_create_resp = await client.post(
        "/api/v1/applications",
        headers=headers,
        json={
            "job_id": top_match["job"]["id"],
            "tailored_role_title": top_match["job"]["title"],
            "notes": "Automated closed-loop submission test",
        },
    )
    assert app_create_resp.status_code == 200
    created_app = app_create_resp.json()
    assert created_app["status"] == "DRAFT"
    assert len(created_app["artifacts"]) > 0

    # 8. OUTCOME: Funnel Analytics
    funnel_resp = await client.get("/api/v1/outcomes/funnel", headers=headers)
    assert funnel_resp.status_code == 200
    funnel = funnel_resp.json()
    assert "stages" in funnel
    assert len(funnel["stages"]) == 5
