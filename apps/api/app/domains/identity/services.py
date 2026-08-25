from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.errors import ResourceNotFoundException
from app.domains.identity.models import ProfessionalIdentity, User
from app.domains.identity.schemas import (
    ProfessionalIdentityResponse,
    ProfessionalIdentityUpdate,
)


class IdentityService:
    @staticmethod
    async def get_user_by_id(session: AsyncSession, user_id: str) -> User:
        result = await session.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if not user:
            raise ResourceNotFoundException(f"User {user_id} not found")
        return user

    @staticmethod
    async def get_identity_by_user_id(
        session: AsyncSession, user_id: str
    ) -> ProfessionalIdentityResponse:
        result = await session.execute(
            select(ProfessionalIdentity)
            .where(ProfessionalIdentity.user_id == user_id)
            .options(
                selectinload(ProfessionalIdentity.user),
                selectinload(ProfessionalIdentity.experiences),
                selectinload(ProfessionalIdentity.projects),
            )
        )
        identity = result.scalar_one_or_none()
        if not identity:
            raise ResourceNotFoundException(f"Professional identity for user {user_id} not found")

        resp = ProfessionalIdentityResponse.model_validate(identity)
        if identity.user:
            resp.full_name = identity.user.full_name
            resp.email = identity.user.email
            resp.avatar_url = identity.user.avatar_url
        return resp

    @staticmethod
    async def update_identity(
        session: AsyncSession, user_id: str, update_data: ProfessionalIdentityUpdate
    ) -> ProfessionalIdentityResponse:
        result = await session.execute(
            select(ProfessionalIdentity)
            .where(ProfessionalIdentity.user_id == user_id)
            .options(
                selectinload(ProfessionalIdentity.user),
                selectinload(ProfessionalIdentity.experiences),
                selectinload(ProfessionalIdentity.projects),
            )
        )
        identity = result.scalar_one_or_none()
        if not identity:
            raise ResourceNotFoundException(f"Professional identity for user {user_id} not found")

        for key, val in update_data.model_dump(exclude_unset=True).items():
            setattr(identity, key, val)
        await session.flush()

        resp = ProfessionalIdentityResponse.model_validate(identity)
        if identity.user:
            resp.full_name = identity.user.full_name
            resp.email = identity.user.email
            resp.avatar_url = identity.user.avatar_url
        return resp
