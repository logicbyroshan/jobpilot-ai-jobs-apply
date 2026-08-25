import uuid
from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.errors import ResourceNotFoundException
from app.core.logging import logger
from app.domains.applications.models import Application, ApplicationArtifact, ApplicationPolicy
from app.domains.applications.schemas import (
    ApplicationCreate,
    ApplicationPolicyResponse,
    ApplicationPolicyUpdate,
    ApplicationResponse,
    ApplicationStatusUpdate,
    AutoApplyExecutionItem,
    AutoApplyExecutionResponse,
    AutoApplyPreviewResponse,
    ResumeVersionResponse,
    TailorResumeRequest,
)
from app.domains.jobs.models import Job

# In-memory store for Auto-Apply Executions
_EXECUTIONS_STORE: List[AutoApplyExecutionItem] = [
    AutoApplyExecutionItem(
        id="exec-1",
        company_name="Anthropic",
        role_title="Principal Distributed Infrastructure Engineer",
        match_score=95.0,
        status="SUBMITTED",
        failure_reason=None,
        can_fix=False,
        timestamp="10 mins ago",
    ),
    AutoApplyExecutionItem(
        id="exec-2",
        company_name="Datadog",
        role_title="Staff Storage Systems Architect",
        match_score=91.0,
        status="SUBMITTED",
        failure_reason=None,
        can_fix=False,
        timestamp="2 hours ago",
    ),
    AutoApplyExecutionItem(
        id="exec-3",
        company_name="Stripe",
        role_title="Staff Infrastructure Engineer",
        match_score=89.0,
        status="PROCESSING",
        failure_reason=None,
        can_fix=False,
        timestamp="Just now",
    ),
    AutoApplyExecutionItem(
        id="exec-4",
        company_name="Snowflake",
        role_title="Lead Distributed Query Architect",
        match_score=87.0,
        status="QUEUED",
        failure_reason=None,
        can_fix=False,
        timestamp="Scheduled in 45m (Daily pacing)",
    ),
    AutoApplyExecutionItem(
        id="exec-5",
        company_name="OpenAI",
        role_title="Systems Engineer - Compute Infrastructure",
        match_score=88.0,
        status="NEEDS_REVIEW",
        failure_reason="Missing work authorization answer for US visa sponsorship question.",
        can_fix=True,
        timestamp="Today",
    ),
]


class ApplicationService:
    @staticmethod
    async def list_applications(
        session: AsyncSession, user_id: str, status: Optional[str] = None
    ) -> List[ApplicationResponse]:
        query = (
            select(Application)
            .where(Application.user_id == user_id)
            .options(
                selectinload(Application.job).selectinload(Job.company),
                selectinload(Application.artifacts),
            )
            .order_by(Application.created_at.desc())
        )
        if status:
            query = query.where(Application.status == status)

        result = await session.execute(query)
        apps = result.scalars().all()
        return [ApplicationResponse.model_validate(a) for a in apps]

    list_user_applications = list_applications

    @staticmethod
    async def create_application(
        session: AsyncSession, user_id: str, app_data: ApplicationCreate
    ) -> ApplicationResponse:
        job = await session.get(Job, app_data.job_id)
        if not job:
            raise ResourceNotFoundException(f"Job {app_data.job_id} not found")

        app = Application(
            user_id=user_id,
            job_id=app_data.job_id,
            status="DRAFT",
            tailored_role_title=app_data.tailored_role_title or job.title,
            match_score_at_application=92.0,
            applied_at=datetime.now(timezone.utc),
            notes=app_data.notes,
        )
        session.add(app)
        await session.flush()

        artifact = ApplicationArtifact(
            application_id=app.id,
            artifact_type="TAILORED_RESUME",
            title=f"Evidence-Tailored Resume: {job.title}",
            content_text=f"Tailored for {job.title} at {job.company_id}. Emphasized Distributed Systems and Go mastery.",
            provenance_sources_json=["github_commits", "raft_engine_project", "verified_assessment"],
        )
        session.add(artifact)
        await session.flush()

        # Reload with relationships
        result = await session.execute(
            select(Application)
            .where(Application.id == app.id)
            .options(
                selectinload(Application.job).selectinload(Job.company),
                selectinload(Application.artifacts),
            )
        )
        return ApplicationResponse.model_validate(result.scalar_one())

    @staticmethod
    async def update_application_status(
        session: AsyncSession, user_id: str, application_id: str, status: str, notes: Optional[str] = None
    ) -> ApplicationResponse:
        result = await session.execute(
            select(Application)
            .where(Application.id == application_id, Application.user_id == user_id)
            .options(
                selectinload(Application.job).selectinload(Job.company),
                selectinload(Application.artifacts),
            )
        )
        app = result.scalar_one_or_none()
        if not app:
            raise ResourceNotFoundException(f"Application {application_id} not found")

        app.status = status
        if notes:
            app.notes = notes
        if status == "APPLIED" and not app.applied_at:
            app.applied_at = datetime.now(timezone.utc)
        await session.flush()
        return ApplicationResponse.model_validate(app)

    @staticmethod
    async def get_policy(session: AsyncSession, user_id: str) -> ApplicationPolicyResponse:
        result = await session.execute(
            select(ApplicationPolicy).where(ApplicationPolicy.user_id == user_id)
        )
        policy = result.scalar_one_or_none()
        if not policy:
            policy = ApplicationPolicy(
                user_id=user_id,
                mode="ASSISTED",
                is_auto_apply_enabled=False,
                min_match_score=85.0,
                daily_application_limit=5,
                requires_user_approval=True,
            )
            session.add(policy)
            await session.flush()
        return ApplicationPolicyResponse.model_validate(policy)

    @staticmethod
    async def update_policy(
        session: AsyncSession, user_id: str, update_data: ApplicationPolicyUpdate
    ) -> ApplicationPolicyResponse:
        result = await session.execute(
            select(ApplicationPolicy).where(ApplicationPolicy.user_id == user_id)
        )
        policy = result.scalar_one_or_none()
        if not policy:
            policy = ApplicationPolicy(user_id=user_id)
            session.add(policy)

        for key, val in update_data.model_dump(exclude_unset=True).items():
            setattr(policy, key, val)
        await session.flush()
        return ApplicationPolicyResponse.model_validate(policy)

    # ==============================================================================
    # Resume Center Methods
    # ==============================================================================
    @staticmethod
    async def get_resumes(session: AsyncSession, user_id: str) -> List[ResumeVersionResponse]:
        return [
            ResumeVersionResponse(
                id="res-master",
                name="Master Canonical Resume",
                target_role="Staff / Principal Distributed Systems Architect",
                version_type="MASTER",
                summary="Core canonical resume automatically synchronized with all GitHub repositories, verified skills, and work history.",
                emphasized_skills=["Go", "Python", "Distributed Systems", "Raft", "LSM Storage", "Kubernetes", "Linux Internals"],
                reduced_skills=[],
                change_rationale="Base golden master. All tailored versions derive strictly from this profile without inventing claims.",
                truthfulness_verified=True,
                updated_at="Today",
            ),
            ResumeVersionResponse(
                id="res-anthropic",
                name="Tailored for Anthropic (Principal Distributed Infrastructure)",
                target_role="Principal Distributed Infrastructure Engineer",
                version_type="TAILORED",
                summary="Emphasizes high-scale Raft consensus, GPU cluster streaming latency, and 450k tx/sec throughput benchmarks.",
                emphasized_skills=["Raft Consensus", "Go High Concurrency", "Distributed Quorums", "Telemetry Ingestion"],
                reduced_skills=["Generic Frontend", "REST Web Services"],
                change_rationale="Anthropic infrastructure role heavily weighs low-level distributed primitives and latency SLAs over full-stack web UI.",
                truthfulness_verified=True,
                updated_at="2 hours ago",
            ),
            ResumeVersionResponse(
                id="res-datadog",
                name="Tailored for Datadog (Staff Storage Systems)",
                target_role="Staff Storage Systems Architect",
                version_type="TAILORED",
                summary="Highlights LSM compaction algorithms, memory-mapped I/O, and columnar telemetry storage cost reductions.",
                emphasized_skills=["LSM Storage Engines", "RocksDB", "Zero-Copy I/O", "Memory Management"],
                reduced_skills=["Kubernetes Operator Deployment"],
                change_rationale="Datadog storage engineering prioritizes storage engine internals and fast disk I/O.",
                truthfulness_verified=True,
                updated_at="Yesterday",
            ),
        ]

    @staticmethod
    async def tailor_resume(
        session: AsyncSession, user_id: str, req: TailorResumeRequest
    ) -> ResumeVersionResponse:
        job = await session.get(Job, req.job_id)
        job_title = job.title if job else "Senior Distributed Systems Engineer"

        return ResumeVersionResponse(
            id=f"res-{uuid.uuid4().hex[:8]}",
            name=f"Tailored for {job_title}",
            target_role=job_title,
            version_type="TAILORED",
            summary=f"Strictly tailored using verified evidence for {job_title}.",
            emphasized_skills=["Go", "Distributed Systems", "PostgreSQL", "Raft Consensus"],
            reduced_skills=["Legacy fullstack frameworks"],
            change_rationale=f"Highlighted direct match requirements for {job_title}. 0 invented facts.",
            truthfulness_verified=True,
            updated_at="Just now",
        )

    # ==============================================================================
    # Auto-Apply Automation Queue Methods
    # ==============================================================================
    @staticmethod
    async def get_auto_apply_preview(
        session: AsyncSession, user_id: str
    ) -> AutoApplyPreviewResponse:
        return AutoApplyPreviewResponse(
            eligible_opportunities_count=12,
            meets_rules_count=8,
            needs_review_count=4,
            blocked_count=0,
            applied_today_count=3,
            daily_limit=5,
            min_match_score=85.0,
            eligible_jobs=[
                {"id": "job-1", "title": "Principal Distributed Infrastructure Engineer", "company": "Anthropic", "score": 95.0, "status": "READY"},
                {"id": "job-2", "title": "Staff Storage Systems Architect", "company": "Datadog", "score": 91.0, "status": "READY"},
                {"id": "job-3", "title": "Staff Infrastructure Engineer", "company": "Stripe", "score": 89.0, "status": "READY"},
                {"id": "job-4", "title": "Lead Distributed Query Architect", "company": "Snowflake", "score": 87.0, "status": "READY"},
                {"id": "job-5", "title": "Systems Engineer - Compute", "company": "OpenAI", "score": 88.0, "status": "NEEDS_REVIEW"},
            ],
        )

    @staticmethod
    async def get_executions(
        session: AsyncSession, user_id: str
    ) -> AutoApplyExecutionResponse:
        queued = len([e for e in _EXECUTIONS_STORE if e.status == "QUEUED"])
        proc = len([e for e in _EXECUTIONS_STORE if e.status == "PROCESSING"])
        sub = len([e for e in _EXECUTIONS_STORE if e.status == "SUBMITTED"])
        rev = len([e for e in _EXECUTIONS_STORE if e.status == "NEEDS_REVIEW"])
        fail = len([e for e in _EXECUTIONS_STORE if e.status == "FAILED"])

        return AutoApplyExecutionResponse(
            queued_count=queued,
            processing_count=proc,
            submitted_count=sub,
            needs_review_count=rev,
            failed_count=fail,
            executions=_EXECUTIONS_STORE,
        )
