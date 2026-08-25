from typing import Optional

from pydantic import BaseModel, Field


class UserRegisterRequest(BaseModel):
    email: str = Field(..., min_length=3, description="User email address")
    password: str = Field(..., min_length=6, description="Password must be at least 6 characters")
    full_name: str = Field(..., min_length=2)
    headline: Optional[str] = "Software Engineer"


class UserLoginRequest(BaseModel):
    email: str
    password: str


class GoogleAuthRequest(BaseModel):
    id_token: Optional[str] = None
    email: str
    full_name: str
    avatar_url: Optional[str] = None
    google_id: Optional[str] = None


class OAuthSignInRequest(BaseModel):
    provider: str = Field(default="github", description="OAuth provider: github or linkedin")
    code: Optional[str] = None
    access_token: Optional[str] = None
    email: Optional[str] = None
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    provider_user_id: Optional[str] = None


class UserAuthResponse(BaseModel):
    id: str
    email: str
    full_name: str
    avatar_url: Optional[str] = None
    headline: Optional[str] = None
    years_of_experience: float = 0.0
    current_level: str = "Mid-Level"
    auth_provider: str = "local"
    is_verified: bool = False


class AuthTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserAuthResponse
