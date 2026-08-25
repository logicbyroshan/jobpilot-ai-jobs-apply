import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_not_found_error_handling(client: AsyncClient):
    resp = await client.get("/api/v1/jobs/non-existent-uuid-12345")
    assert resp.status_code == 404
    err = resp.json()
    assert "error" in err
    assert "not found" in err["error"]["message"].lower()


@pytest.mark.asyncio
async def test_gap_not_found(client: AsyncClient):
    resp = await client.get("/api/v1/gaps/non-existent-gap-id")
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_assessment_not_found(client: AsyncClient):
    resp = await client.get("/api/v1/assessments/non-existent-assessment")
    assert resp.status_code == 404
