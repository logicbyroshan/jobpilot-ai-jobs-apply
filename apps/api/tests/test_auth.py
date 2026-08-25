import pytest
from httpx import AsyncClient

from app.domains.auth.security import (
    create_access_token,
    decode_access_token,
    hash_password,
    verify_password,
)


def test_password_hashing():
    pwd = "MySecretPassword123!"
    hashed = hash_password(pwd)
    assert hashed.startswith("pbkdf2_sha256$")
    assert verify_password(pwd, hashed) is True
    assert verify_password("WrongPassword", hashed) is False


def test_jwt_token_generation_and_decoding():
    payload = {"sub": "user-12345", "email": "test@example.com"}
    token = create_access_token(payload)
    decoded = decode_access_token(token)
    assert decoded is not None
    assert decoded["sub"] == "user-12345"
    assert decoded["email"] == "test@example.com"


@pytest.mark.asyncio
async def test_auth_register_and_login_flow(client: AsyncClient):
    # 1. Register new user
    reg_payload = {
        "email": "sarah.connor@jobpilot.dev",
        "password": "ResistancePassword2026!",
        "full_name": "Sarah Connor",
        "headline": "Lead Systems Architect",
    }
    reg_resp = await client.post("/api/v1/auth/register", json=reg_payload)
    assert reg_resp.status_code == 201
    reg_data = reg_resp.json()
    assert "access_token" in reg_data
    assert reg_data["user"]["email"] == "sarah.connor@jobpilot.dev"
    assert reg_data["user"]["full_name"] == "Sarah Connor"
    token = reg_data["access_token"]

    # 2. Prevent duplicate registration
    dup_resp = await client.post("/api/v1/auth/register", json=reg_payload)
    assert dup_resp.status_code == 400

    # 3. Login with correct password
    login_resp = await client.post(
        "/api/v1/auth/login",
        json={
            "email": "sarah.connor@jobpilot.dev",
            "password": "ResistancePassword2026!",
        },
    )
    assert login_resp.status_code == 200
    login_data = login_resp.json()
    assert "access_token" in login_data

    # 4. Login with incorrect password
    bad_login_resp = await client.post(
        "/api/v1/auth/login",
        json={
            "email": "sarah.connor@jobpilot.dev",
            "password": "WrongPassword!",
        },
    )
    assert bad_login_resp.status_code == 401

    # 5. Access /me endpoint with Bearer token
    me_resp = await client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert me_resp.status_code == 200
    me_data = me_resp.json()
    assert me_data["email"] == "sarah.connor@jobpilot.dev"


@pytest.mark.asyncio
async def test_google_sso_flow(client: AsyncClient):
    google_payload = {
        "email": "dev.google.user@example.com",
        "full_name": "Google Dev User",
        "avatar_url": "https://lh3.googleusercontent.com/a/default-user",
        "google_id": "google_109283019283",
    }
    sso_resp = await client.post("/api/v1/auth/google", json=google_payload)
    assert sso_resp.status_code == 200
    sso_data = sso_resp.json()
    assert "access_token" in sso_data
    assert sso_data["user"]["auth_provider"] == "google"
    assert sso_data["user"]["email"] == "dev.google.user@example.com"
    token = sso_data["access_token"]

    # Retrieve profile
    me_resp = await client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert me_resp.status_code == 200
    assert me_resp.json()["email"] == "dev.google.user@example.com"
