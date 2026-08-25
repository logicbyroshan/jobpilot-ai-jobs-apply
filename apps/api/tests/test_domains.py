import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_identity_profile(client: AsyncClient):
    response = await client.get("/api/v1/profile")
    assert response.status_code == 200
    data = response.json()
    assert data["headline"] is not None
    assert len(data["experiences"]) >= 2
    assert len(data["projects"]) >= 2

    # Test me endpoint
    me_resp = await client.get("/api/v1/profile/me")
    assert me_resp.status_code == 200
    assert me_resp.json()["email"] == "alex.chen@jobpilot.dev"


@pytest.mark.asyncio
async def test_sources_and_sync(client: AsyncClient):
    response = await client.get("/api/v1/sources")
    assert response.status_code == 200
    sources = response.json()
    assert len(sources) >= 3

    # Test sync trigger
    source_id = sources[0]["id"]
    sync_resp = await client.post(f"/api/v1/sources/{source_id}/sync")
    assert sync_resp.status_code == 200
    sync_json = sync_resp.json()
    assert "items_detected" in sync_json or "items_synced" in sync_json


@pytest.mark.asyncio
async def test_skills_profile(client: AsyncClient):
    response = await client.get("/api/v1/skills/profile")
    assert response.status_code == 200
    skills = response.json()
    assert len(skills) >= 5
    # Verify provenance
    for skill in skills:
        assert "skill_name" in skill
        assert "evidence_items" in skill


@pytest.mark.asyncio
async def test_matches_and_scoring(client: AsyncClient):
    response = await client.get("/api/v1/matches")
    assert response.status_code == 200
    matches = response.json()
    assert len(matches) >= 3
    assert matches[0]["overall_score"] > 80.0
    assert "job" in matches[0]

    # Test recalculation
    recalc_resp = await client.post("/api/v1/matches/recalculate")
    assert recalc_resp.status_code == 200
    assert len(recalc_resp.json()) >= 1


@pytest.mark.asyncio
async def test_gaps_diagnosis(client: AsyncClient):
    response = await client.get("/api/v1/gaps")
    assert response.status_code == 200
    gaps = response.json()
    assert len(gaps) >= 1
    assert "gap_type" in gaps[0]
    assert "priority" in gaps[0]


@pytest.mark.asyncio
async def test_learning_plans(client: AsyncClient):
    response = await client.get("/api/v1/learning/plans")
    assert response.status_code == 200
    plans = response.json()
    assert len(plans) >= 1
    assert "items" in plans[0]

    # Toggle item completion
    plan_id = plans[0]["id"]
    item_id = plans[0]["items"][0]["id"]
    toggle_resp = await client.post(f"/api/v1/learning/plans/{plan_id}/items/{item_id}/toggle")
    assert toggle_resp.status_code == 200
    assert "progress_percentage" in toggle_resp.json()


@pytest.mark.asyncio
async def test_assessments_and_proving(client: AsyncClient):
    response = await client.get("/api/v1/assessments")
    assert response.status_code == 200
    assessments = response.json()
    assert len(assessments) >= 1

    asm_id = assessments[0]["id"]
    # Get questions
    asm_detail = await client.get(f"/api/v1/assessments/{asm_id}")
    assert asm_detail.status_code == 200
    questions = asm_detail.json()["questions"]
    assert len(questions) > 0

    # Submit answers with question IDs
    submission = {
        "answers": {q["id"]: "A" for q in questions}
    }
    sub_resp = await client.post(f"/api/v1/assessments/{asm_id}/submit", json=submission)
    assert sub_resp.status_code == 200
    sub_data = sub_resp.json()
    assert "score" in sub_data
    assert "passed" in sub_data


@pytest.mark.asyncio
async def test_applications_and_policy(client: AsyncClient):
    response = await client.get("/api/v1/applications")
    assert response.status_code == 200
    apps = response.json()
    assert len(apps) >= 1

    # Check policy
    policy_resp = await client.get("/api/v1/applications/policy")
    assert policy_resp.status_code == 200
    assert policy_resp.json()["mode"] in ("MANUAL", "ASSISTED", "AUTONOMOUS", "AUTO_APPLY")

    # Update policy
    update_resp = await client.patch(
        "/api/v1/applications/policy",
        json={"daily_application_limit": 10, "min_match_score": 90.0},
    )
    assert update_resp.status_code == 200
    assert update_resp.json()["daily_application_limit"] == 10


@pytest.mark.asyncio
async def test_outcomes_funnel(client: AsyncClient):
    response = await client.get("/api/v1/outcomes/funnel")
    assert response.status_code == 200
    funnel = response.json()
    assert "total_applications" in funnel
    assert "stages" in funnel
    assert len(funnel["stages"]) >= 4
    assert "primary_bottleneck" in funnel
