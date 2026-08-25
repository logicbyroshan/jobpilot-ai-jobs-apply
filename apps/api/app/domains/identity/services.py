from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.errors import ResourceNotFoundException
from app.domains.identity.models import ProfessionalIdentity, User
from app.domains.identity.schemas import ProfessionalIdentityUpdate


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
    ) -> ProfessionalIdentity:
        result = await session.execute(
            select(ProfessionalIdentity)
            .where(ProfessionalIdentity.user_id == user_id)
            .options(
                selectinload(ProfessionalIdentity.experiences),
                selectinload(ProfessionalIdentity.projects),
            )
        )
        identity = result.scalar_one_or_none()
        if not identity:
            raise ResourceNotFoundException(f"Professional identity for user {user_id} not found")
        return identity

    @staticmethod
    async def update_identity(
        session: AsyncSession, user_id: str, update_data: ProfessionalIdentityUpdate
    ) -> ProfessionalIdentity:
        identity = await IdentityService.get_identity_by_user_id(session, user_id)
        for key, val in update_data.model_dump(exclude_unset=True).items():
            setattr(identity, key, val)
        await session.flush()
        return identity
