from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import CurrentUser, get_current_user
from app.domains.identity.schemas import (
    LivingPortfolioResponse,
    ProfessionalIdentityResponse,
    ProfessionalIdentityUpdate,
    UserResponse,
)
from app.domains.identity.services import IdentityService

router = APIRouter(tags=["Identity & Profile"])


@router.get("/profile/portfolio", response_model=LivingPortfolioResponse)
@router.get("/identity/portfolio", response_model=LivingPortfolioResponse)
async def get_my_living_portfolio(
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """Retrieve the user's Living Professional Portfolio."""
    return await IdentityService.get_living_portfolio(db, current_user.id)


@router.get("/profile", response_model=ProfessionalIdentityResponse)
@router.get("/identity", response_model=ProfessionalIdentityResponse)
async def get_my_profile(
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """Retrieve the authenticated user's evidence-backed professional identity."""
    return await IdentityService.get_identity_by_user_id(db, current_user.id)


@router.patch("/profile", response_model=ProfessionalIdentityResponse)
@router.patch("/identity", response_model=ProfessionalIdentityResponse)
async def update_my_profile(
    update_data: ProfessionalIdentityUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """Update professional identity fields."""
    return await IdentityService.update_identity(db, current_user.id, update_data)


@router.get("/profile/me", response_model=UserResponse)
@router.get("/identity/me", response_model=UserResponse)
async def get_current_user_info(
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """Retrieve user account information."""
    return await IdentityService.get_user_by_id(db, current_user.id)
