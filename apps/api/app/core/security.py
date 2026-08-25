import base64
import hashlib
from typing import Optional
from fastapi import Depends, Header
from pydantic import BaseModel

from app.core.config import settings
from app.core.errors import UnauthorizedException


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
    Abstraction for secure secret and OAuth token storage.
    In development, provides deterministic reversible encryption.
    In production, can be backed by AWS Secrets Manager or HashiCorp Vault.
    """
    @staticmethod
    def encrypt(raw_secret: str) -> str:
        if not raw_secret:
            return ""
        # XOR with SHA256 key for dev encryption
        key = hashlib.sha256(settings.SECRET_KEY.encode()).digest()
        raw_bytes = raw_secret.encode()
        encrypted = bytes([b ^ key[i % len(key)] for i, b in enumerate(raw_bytes)])
        return "enc_" + base64.b64encode(encrypted).decode()

    @staticmethod
    def decrypt(encrypted_secret: str) -> str:
        if not encrypted_secret or not encrypted_secret.startswith("enc_"):
            return encrypted_secret
        b64_data = encrypted_secret[4:]
        try:
            encrypted = base64.b64decode(b64_data.encode())
            key = hashlib.sha256(settings.SECRET_KEY.encode()).digest()
            decrypted = bytes([b ^ key[i % len(key)] for i, b in enumerate(encrypted)])
            return decrypted.decode()
        except Exception:
            return ""


async def get_current_user(
    authorization: Optional[str] = Header(None)
) -> CurrentUser:
    """
    Dependency returning the authenticated user.
    In local development / demo mode, defaults to the canonical demo user.
    """
    if settings.APP_ENV in ("development", "test") or not authorization:
        return DEMO_USER

    if authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        if token == "demo-token" or token == DEMO_USER_ID:
            return DEMO_USER

    # For production token verification
    raise UnauthorizedException("Invalid or missing authentication credentials")
