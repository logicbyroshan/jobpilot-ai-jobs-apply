from typing import List, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.errors import ResourceNotFoundException
from app.domains.jobs.models import Company, Job, JobRequirement
from app.domains.jobs.schemas import JobCreate
from app.domains.skills.models import Skill


class JobService:
    @staticmethod
    async def list_jobs(
        session: AsyncSession,
        limit: int = 50,
        role: Optional[str] = None,
        remote_only: Optional[bool] = None,
    ) -> List[Job]:
        query = (
            select(Job)
            .where(Job.is_active)
            .options(
                selectinload(Job.company),
                selectinload(Job.requirements).selectinload(JobRequirement.skill),
            )
            .order_by(Job.posted_at.desc())
            .limit(limit)
        )

        if remote_only is not None and remote_only:
            query = query.where(Job.is_remote)

        result = await session.execute(query)
        jobs = list(result.scalars().all())

        if role:
            jobs = [j for j in jobs if role.lower() in j.title.lower()]

        return jobs

    @staticmethod
    async def get_job_by_id(session: AsyncSession, job_id: str) -> Job:
        result = await session.execute(
            select(Job)
            .where(Job.id == job_id)
            .options(
                selectinload(Job.company),
                selectinload(Job.requirements).selectinload(JobRequirement.skill),
            )
        )
        job = result.scalar_one_or_none()
        if not job:
            raise ResourceNotFoundException(f"Job {job_id} not found")
        return job

    @staticmethod
    async def create_job(session: AsyncSession, data: JobCreate) -> Job:
        # Check or create company
        comp_res = await session.execute(select(Company).where(Company.name == data.company_name))
        company = comp_res.scalar_one_or_none()
        if not company:
            company = Company(
                name=data.company_name,
                industry=data.company_industry or "Technology",
                location=data.location,
            )
            session.add(company)
            await session.flush()

        job = Job(
            company_id=company.id,
            title=data.title,
            seniority=data.seniority,
            employment_type=data.employment_type,
            location=data.location,
            is_remote=data.is_remote,
            salary_min=data.salary_min,
            salary_max=data.salary_max,
            salary_currency=data.salary_currency,
            raw_description=data.raw_description,
            normalized_description=data.normalized_description,
            responsibilities_json=data.responsibilities_json,
            requirements_summary_json=data.requirements_summary_json,
            is_active=data.is_active,
        )
        session.add(job)
        await session.flush()

        # Add requirements
        for req_text in data.requirements:
            # Try to match existing skill
            skill_res = await session.execute(select(Skill).where(Skill.name.ilike(f"%{req_text}%")))
            skill = skill_res.scalars().first()

            req = JobRequirement(
                job_id=job.id,
                skill_id=skill.id if skill else None,
                requirement_type="REQUIRED",
                importance=4,
                source_text=req_text,
                normalized_interpretation=skill.name if skill else req_text,
            )
            session.add(req)

        await session.flush()
        return await JobService.get_job_by_id(session, job.id)
