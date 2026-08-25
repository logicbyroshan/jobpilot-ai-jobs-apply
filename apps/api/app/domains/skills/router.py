from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import CurrentUser, get_current_user
from app.domains.skills.schemas import SkillResponse, UserSkillProfileResponse
from app.domains.skills.services import SkillService

router = APIRouter(prefix="/skills", tags=["Skills & Mastery"])


@router.get("", response_model=List[UserSkillProfileResponse])
@router.get("/profile", response_model=List[UserSkillProfileResponse])
async def get_my_skills(
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """Retrieve the user's evidence-backed skills with proficiency and provenance."""
    return await SkillService.get_user_skills(db, current_user.id)


@router.get("/catalog", response_model=List[SkillResponse])
async def get_all_skills(
    db: AsyncSession = Depends(get_db),
):
    """Retrieve canonical global skills catalog."""
    return await SkillService.list_all_skills(db)
