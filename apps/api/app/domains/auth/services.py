import uuid
from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status

from app.domains.auth.schemas import (
    UserRegisterRequest,
    UserLoginRequest,
    GoogleAuthRequest,
    AuthTokenResponse,
    UserAuthResponse,
)
from app.domains.auth.security import (
    hash_password,
    verify_password,
    create_access_token,
)
from app.domains.identity.models import User, ProfessionalIdentity
from app.domains.career_goals.models import CareerGoal
from app.domains.applications.models import ApplicationPolicy


class AuthService:
    """Authentication and identity lifecycle service."""

    @staticmethod
    async def _format_user_auth_response(user: User, db: AsyncSession) -> UserAuthResponse:
        # Load identity if not loaded
        result = await db.execute(
            select(ProfessionalIdentity).where(ProfessionalIdentity.user_id == user.id)
        )
        identity = result.scalars().first()

        headline = identity.headline if identity else "Software Engineer"
        years_of_exp = identity.years_of_experience if identity else 0.0
        current_lvl = identity.current_level if identity else "Mid-Level"

        return UserAuthResponse(
            id=user.id,
            email=user.email,
            full_name=user.full_name,
            avatar_url=user.avatar_url,
            headline=headline,
            years_of_experience=years_of_exp,
            current_level=current_lvl,
            auth_provider=user.auth_provider,
            is_verified=user.is_verified,
        )

    @classmethod
    async def register(cls, db: AsyncSession, req: UserRegisterRequest) -> AuthTokenResponse:
        # Check if user with email already exists
        existing = await db.execute(select(User).where(User.email == req.email.lower()))
        if existing.scalars().first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An account with this email already exists.",
            )

        new_user = User(
            id=str(uuid.uuid4()),
            email=req.email.lower(),
            full_name=req.full_name,
            hashed_password=hash_password(req.password),
            auth_provider="local",
            is_active=True,
            is_verified=False,
        )
        db.add(new_user)
        await db.flush()

        # Create baseline ProfessionalIdentity
        identity = ProfessionalIdentity(
            user_id=new_user.id,
            headline=req.headline or "Software Engineer",
            bio="",
            years_of_experience=2.0,
            current_level="Mid-Level",
            profile_confidence=0.75,
            summary_json={"core_competencies": ["Backend", "Python", "APIs"]},
        )
        db.add(identity)

        # Create baseline CareerGoal
        goal = CareerGoal(
            user_id=new_user.id,
            target_role="Software Engineer",
            target_seniority="Senior",
            location_preference="Remote",
            is_remote_preferred=True,
            target_salary_min=120000,
            target_salary_max=180000,
        )
        db.add(goal)

        # Create baseline ApplicationPolicy
        policy = ApplicationPolicy(
            user_id=new_user.id,
            mode="ASSISTED",
            is_auto_apply_enabled=False,
            min_match_score=80.0,
            daily_application_limit=5,
            requires_user_approval=True,
        )
        db.add(policy)
        await db.commit()

        token = create_access_token({"sub": new_user.id, "email": new_user.email})
        user_resp = await cls._format_user_auth_response(new_user, db)

        return AuthTokenResponse(
            access_token=token,
            token_type="bearer",
            user=user_resp,
        )

    @classmethod
    async def login(cls, db: AsyncSession, req: UserLoginRequest) -> AuthTokenResponse:
        result = await db.execute(select(User).where(User.email == req.email.lower()))
        user = result.scalars().first()

        if not user or not user.hashed_password or not verify_password(req.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password.",
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account has been deactivated.",
            )

        token = create_access_token({"sub": user.id, "email": user.email})
        user_resp = await cls._format_user_auth_response(user, db)

        return AuthTokenResponse(
            access_token=token,
            token_type="bearer",
            user=user_resp,
        )

    @classmethod
    async def google_auth(cls, db: AsyncSession, req: GoogleAuthRequest) -> AuthTokenResponse:
        """
        Handles Google SSO sign-in / sign-up.
        If user exists with email, logs them in. If not, automatically provisions their profile.
        """
        email_clean = req.email.lower()
        result = await db.execute(select(User).where(User.email == email_clean))
        user = result.scalars().first()

        if not user:
            # Create new user via Google SSO
            user = User(
                id=str(uuid.uuid4()),
                email=email_clean,
                full_name=req.full_name,
                avatar_url=req.avatar_url,
                google_id=req.google_id or f"google_{uuid.uuid4().hex[:12]}",
                auth_provider="google",
                is_active=True,
                is_verified=True,  # Google verified email
            )
            db.add(user)
            await db.flush()

            # Create baseline ProfessionalIdentity
            identity = ProfessionalIdentity(
                user_id=user.id,
                headline="Software Engineer",
                bio="Google Authenticated Profile",
                years_of_experience=3.0,
                current_level="Mid-Level",
                profile_confidence=0.80,
                summary_json={"core_competencies": ["Full Stack", "Distributed Systems"]},
            )
            db.add(identity)

            # Create baseline CareerGoal
            goal = CareerGoal(
                user_id=user.id,
                target_role="Software Engineer",
                target_seniority="Senior",
                location_preference="Remote",
                is_remote_preferred=True,
                target_salary_min=130000,
                target_salary_max=200000,
            )
            db.add(goal)

            # Create baseline ApplicationPolicy
            policy = ApplicationPolicy(
                user_id=user.id,
                mode="ASSISTED",
                is_auto_apply_enabled=False,
                min_match_score=80.0,
                daily_application_limit=5,
                requires_user_approval=True,
            )
            db.add(policy)
            await db.commit()
        else:
            # Update google ID / avatar if needed
            if req.google_id and not user.google_id:
                user.google_id = req.google_id
            if req.avatar_url and not user.avatar_url:
                user.avatar_url = req.avatar_url
            await db.commit()

        token = create_access_token({"sub": user.id, "email": user.email})
        user_resp = await cls._format_user_auth_response(user, db)

        return AuthTokenResponse(
            access_token=token,
            token_type="bearer",
            user=user_resp,
        )

    @classmethod
    async def get_current_user_profile(cls, user_id: str, db: AsyncSession) -> UserAuthResponse:
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalars().first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )
        return await cls._format_user_auth_response(user, db)
