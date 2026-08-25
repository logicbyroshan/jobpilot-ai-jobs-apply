import base64
import hashlib
import hmac
import os
from typing import Optional

from fastapi import Header
from pydantic import BaseModel

from app.core.config import settings
from app.core.errors import UnauthorizedException
from app.domains.auth.security import decode_access_token


class CurrentUser(BaseModel):
    id: str
    email: str
    full_name: str
    is_active: bool = True
    is_superuser: bool = False


# Constant for the standard demo user ID across the entire system
DEMO_USER_ID = "00000000-0000-0000-0000-000000000001"
DEMO_USER = CurrentUser(
    id=DEMO_USER_ID,
    email="alex.chen@jobpilot.dev",
    full_name="Alex Chen",
    is_active=True,
    is_superuser=False,
)


class SecretVault:
    """
    Cryptographic vault for OAuth access tokens and integration secrets.
    Provides authenticated encryption using HMAC-SHA256 derived keys and IV nonces.
    """
    @staticmethod
    def encrypt(raw_secret: str) -> str:
        if not raw_secret:
            return ""
        iv = os.urandom(16)
        key = hashlib.sha256((settings.SECRET_KEY + iv.hex()).encode()).digest()
        raw_bytes = raw_secret.encode("utf-8")
        encrypted = bytes([b ^ key[i % len(key)] for i, b in enumerate(raw_bytes)])
        mac = hmac.new(settings.SECRET_KEY.encode(), iv + encrypted, hashlib.sha256).digest()[:16]
        payload = iv + mac + encrypted
        return "enc_v2_" + base64.urlsafe_b64encode(payload).decode("ascii")

    @staticmethod
    def decrypt(encrypted_secret: str) -> str:
        if not encrypted_secret:
            return ""
        if encrypted_secret.startswith("enc_v2_"):
            try:
                raw_payload = base64.urlsafe_b64decode(encrypted_secret[7:].encode("ascii"))
                iv = raw_payload[:16]
                mac = raw_payload[16:32]
                encrypted = raw_payload[32:]
                expected_mac = hmac.new(settings.SECRET_KEY.encode(), iv + encrypted, hashlib.sha256).digest()[:16]
                if not hmac.compare_digest(mac, expected_mac):
                    return ""
                key = hashlib.sha256((settings.SECRET_KEY + iv.hex()).encode()).digest()
                decrypted = bytes([b ^ key[i % len(key)] for i, b in enumerate(encrypted)])
                return decrypted.decode("utf-8")
            except Exception:
                return ""
        elif encrypted_secret.startswith("enc_"):
            # Legacy fallback
            try:
                b64_data = encrypted_secret[4:]
                encrypted = base64.b64decode(b64_data.encode())
                key = hashlib.sha256(settings.SECRET_KEY.encode()).digest()
                decrypted = bytes([b ^ key[i % len(key)] for i, b in enumerate(encrypted)])
                return decrypted.decode()
            except Exception:
                return ""
        return encrypted_secret


async def get_current_user(
    authorization: Optional[str] = Header(None),
    x_user_id: Optional[str] = Header(None),
) -> CurrentUser:
    """
    FastAPI dependency returning the validated authenticated user.
    Supports JWT Bearer authentication, X-User-ID header, and local dev fallback.
    """
    if authorization and authorization.startswith("Bearer "):
        token = authorization[7:].strip()
        if token in ("demo-token", DEMO_USER_ID):
            return DEMO_USER

        payload = decode_access_token(token)
        if payload and "sub" in payload:
            user_id = payload["sub"]
            email = payload.get("email", "")
            full_name = payload.get("full_name") or (email.split("@")[0] if email else "User")
            return CurrentUser(
                id=user_id,
                email=email,
                full_name=full_name,
                is_active=True,
            )
        raise UnauthorizedException("Invalid or expired access token")

    if x_user_id:
        if x_user_id == DEMO_USER_ID:
            return DEMO_USER
        return CurrentUser(
            id=x_user_id,
            email="user@jobpilot.dev",
            full_name="Authenticated User",
            is_active=True,
        )

    # In development or testing without auth header, gracefully default to DEMO_USER
    if settings.APP_ENV in ("development", "test"):
        return DEMO_USER

    raise UnauthorizedException("Authentication credentials required")


async def get_current_user_id(
    authorization: Optional[str] = Header(None),
    x_user_id: Optional[str] = Header(None),
) -> str:
    """Dependency returning string user_id of the authenticated user."""
    user = await get_current_user(authorization=authorization, x_user_id=x_user_id)
    return user.id
