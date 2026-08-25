from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.errors import ResourceNotFoundException
from app.domains.applications.models import (
    Application,
    ApplicationArtifact,
    ApplicationPolicy,
)
from app.domains.applications.schemas import (
    ApplicationCreate,
    ApplicationPolicyUpdate,
    ApplicationStatusUpdate,
)
from app.domains.jobs.models import Job, JobRequirement
from app.domains.matching.models import Match
from app.domains.outcomes.models import ApplicationEvent


class ApplicationService:
    @staticmethod
    async def list_user_applications(
        session: AsyncSession, user_id: str, status: Optional[str] = None
    ) -> List[Application]:
        query = (
            select(Application)
            .where(Application.user_id == user_id)
            .options(
                selectinload(Application.job).selectinload(Job.company),
                selectinload(Application.job).selectinload(Job.requirements).selectinload(JobRequirement.skill),
                selectinload(Application.artifacts),
            )
            .order_by(Application.created_at.desc())
        )
        if status:
            query = query.where(Application.status == status)

        result = await session.execute(query)
        return list(result.scalars().all())

    @staticmethod
    async def get_application_by_id(
        session: AsyncSession, user_id: str, app_id: str
    ) -> Application:
        result = await session.execute(
            select(Application)
            .where(Application.id == app_id, Application.user_id == user_id)
            .options(
                selectinload(Application.job).selectinload(Job.company),
                selectinload(Application.job).selectinload(Job.requirements).selectinload(JobRequirement.skill),
                selectinload(Application.artifacts),
            )
        )
        app = result.scalar_one_or_none()
        if not app:
            raise ResourceNotFoundException(f"Application {app_id} not found")
        return app

    @staticmethod
    async def create_application(
        session: AsyncSession, user_id: str, data: ApplicationCreate
    ) -> Application:
        # Check job
        job_res = await session.execute(
            select(Job).where(Job.id == data.job_id).options(selectinload(Job.company))
        )
        job = job_res.scalar_one_or_none()
        if not job:
            raise ResourceNotFoundException(f"Job {data.job_id} not found")

        # Get match score if exists
        match_res = await session.execute(
            select(Match).where(Match.user_id == user_id, Match.job_id == job.id)
        )
        match = match_res.scalar_one_or_none()
        match_score = match.overall_score if match else 88.0

        # Retrieve user policy for governance
        policy = await ApplicationService.get_policy(session, user_id)

        app = Application(
            user_id=user_id,
            job_id=job.id,
            status="DRAFT",
            tailored_role_title=data.tailored_role_title or job.title,
            match_score_at_application=match_score,
            notes=data.notes or f"Governed under {policy.mode} policy (Min match threshold: {policy.min_match_score}%)",
        )
        session.add(app)
        await session.flush()

        # Generate standard tailored artifact kit shell with provenance
        artifact = ApplicationArtifact(
            application_id=app.id,
            artifact_type="TAILORED_RESUME",
            title=f"Tailored Resume for {job.company.name if job.company else 'Target'} - {job.title}",
            content_text=f"Tailored summary highlighting relevant backend architecture and evidence-backed capabilities for {job.title}.",
            provenance_sources_json=["github", "experience", "assessment"],
        )
        session.add(artifact)

        # Record initial event
        event = ApplicationEvent(
            application_id=app.id,
            user_id=user_id,
            event_type="DRAFT_CREATED",
            notes=f"Draft application created for {job.title}",
        )
        session.add(event)

        await session.flush()
        return await ApplicationService.get_application_by_id(session, user_id, app.id)

    @staticmethod
    async def update_status(
        session: AsyncSession, user_id: str, app_id: str, data: ApplicationStatusUpdate
    ) -> Application:
        app = await ApplicationService.get_application_by_id(session, user_id, app_id)
        old_status = app.status
        app.status = data.status

        now = datetime.now(timezone.utc)
        if data.status == "SUBMITTED" and not app.applied_at:
            app.applied_at = now
        if data.notes:
            app.notes = data.notes

        # Record audit outcome event
        event = ApplicationEvent(
            application_id=app.id,
            user_id=user_id,
            event_type=data.status,
            occurred_at=now,
            notes=f"Status transitioned from {old_status} to {data.status}. {data.notes or ''}".strip(),
        )
        session.add(event)

        await session.flush()
        return app

    @staticmethod
    async def get_policy(session: AsyncSession, user_id: str) -> ApplicationPolicy:
        result = await session.execute(
            select(ApplicationPolicy).where(ApplicationPolicy.user_id == user_id)
        )
        policy = result.scalar_one_or_none()
        if not policy:
            policy = ApplicationPolicy(
                user_id=user_id,
                mode="MANUAL",
                is_auto_apply_enabled=False,
                min_match_score=85.0,
                daily_application_limit=5,
                requires_user_approval=True,
            )
            session.add(policy)
            await session.flush()
        return policy

    @staticmethod
    async def update_policy(
        session: AsyncSession, user_id: str, data: ApplicationPolicyUpdate
    ) -> ApplicationPolicy:
        policy = await ApplicationService.get_policy(session, user_id)
        for key, val in data.model_dump(exclude_unset=True).items():
            setattr(policy, key, val)
        await session.flush()
        return policy
