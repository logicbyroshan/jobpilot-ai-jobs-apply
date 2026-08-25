import asyncio
from datetime import datetime, timezone
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import async_session_factory, init_db
from app.core.logging import logger, setup_logging
from app.core.security import DEMO_USER_ID, SecretVault
from app.domains.auth.security import hash_password
from app.domains.applications.models import (
    Application,
    ApplicationArtifact,
    ApplicationPolicy,
)
from app.domains.assessments.models import (
    Assessment,
    AssessmentAttempt,
    AssessmentQuestion,
)
from app.domains.career_goals.models import CareerGoal
from app.domains.evidence.models import Evidence
from app.domains.gaps.models import Gap
from app.domains.identity.models import (
    Experience,
    ProfessionalIdentity,
    Project,
    User,
)
from app.domains.jobs.models import Company, Job, JobRequirement, JobSource
from app.domains.learning.models import LearningPlan, LearningPlanItem, Resource
from app.domains.matching.models import Match
from app.domains.outcomes.models import ApplicationEvent, OutcomeFeedback
from app.domains.skills.models import Skill, SkillEvidence
from app.domains.sources.models import Source, SourceConnection


async def seed_database(session: AsyncSession | None = None) -> None:
    """Seeds a rich, realistic demo dataset representing the entire JobPilot loop."""
    if session is not None:
        await _seed_with_session(session)
    else:
        setup_logging()
        await init_db()
        async with async_session_factory() as s:
            await _seed_with_session(s)


async def _seed_with_session(session: AsyncSession) -> None:
    # Check if already seeded
    user_res = await session.execute(select(User).where(User.id == DEMO_USER_ID))
    if user_res.scalar_one_or_none():
        logger.info("Database already seeded with demo dataset. Skipping.")
        return

    logger.info("Seeding JobPilot production-grade demo dataset...")

    # 1. User & Professional Identity (KNOW)
    user = User(
        id=DEMO_USER_ID,
        email="alex.chen@jobpilot.dev",
        full_name="Alex Chen",
        hashed_password=hash_password("MasterPassword2026!"),
        auth_provider="local",
        avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
        is_active=True,
        is_verified=True,
    )
    session.add(user)
    await session.flush()

    identity = ProfessionalIdentity(
        user_id=user.id,
        headline="Senior Backend & Distributed Systems Engineer",
        bio="Backend engineer with 4.5+ years building high-throughput asynchronous APIs, scalable distributed pipelines, and resilient database architectures in Python, FastAPI, and PostgreSQL.",
        years_of_experience=4.5,
        current_level="Senior",
        profile_confidence=0.88,
        summary_json={
            "core_competencies": ["Distributed Systems", "Async Python", "PostgreSQL Internals", "API Design"],
            "evidence_strength": "High",
            "verified_skills": 8,
        },
    )
    session.add(identity)
    await session.flush()

    # Experiences
    exp1 = Experience(
        identity_id=identity.id,
        company_name="CloudScale Systems",
        title="Senior Backend Engineer",
        location="San Francisco, CA (Remote)",
        is_remote=True,
        start_date="2022-03",
        end_date=None,
        is_current=True,
        description="Architected core ingestion pipelines handling 50k+ req/sec using FastAPI, Celery, and PostgreSQL. Reduced query latency by 40% using pgvector and targeted indexing.",
        technologies_json=["Python", "FastAPI", "PostgreSQL", "Redis", "Docker", "AWS"],
    )
    exp2 = Experience(
        identity_id=identity.id,
        company_name="FinFlow Global",
        title="Backend Software Engineer",
        location="New York, NY",
        is_remote=False,
        start_date="2020-06",
        end_date="2022-02",
        is_current=False,
        description="Built transactional payment settlement APIs in Python. Designed database audit logs and automated reconciliation services.",
        technologies_json=["Python", "PostgreSQL", "Docker", "CI/CD", "Redis"],
    )
    session.add_all([exp1, exp2])

    # Projects
    proj1 = Project(
        identity_id=identity.id,
        title="Distributed Task Orchestrator",
        description="A fault-tolerant distributed DAG execution engine built with Python asyncio, Redis streams, and PostgreSQL state machine persistence.",
        repository_url="https://github.com/alexchen-dev/distributed-task-orchestrator",
        url="https://orchestrator.alexchen.dev",
        technologies_json=["Python", "Asyncio", "Redis", "PostgreSQL"],
        stars_count=342,
        provenance_source="github",
    )
    proj2 = Project(
        identity_id=identity.id,
        title="FastAPI Production Microservice Kit",
        description="Enterprise template featuring clean architecture, async SQLAlchemy 2.0, Alembic migrations, pgvector, and automated test harnesses.",
        repository_url="https://github.com/alexchen-dev/fastapi-microservice-kit",
        technologies_json=["FastAPI", "SQLAlchemy", "Docker", "Alembic"],
        stars_count=185,
        provenance_source="github",
    )
    session.add_all([proj1, proj2])

    # 2. Sources (KNOW)
    src_github = Source(
        user_id=user.id,
        source_type="github",
        display_name="GitHub (@alexchen-dev)",
        status="connected",
        source_url="https://github.com/alexchen-dev",
        last_synced_at=datetime.now(timezone.utc),
        sync_status_message="Synchronized 14 repositories, 42 pull requests",
        metadata_json={"public_repos": 18, "followers": 142},
    )
    src_resume = Source(
        user_id=user.id,
        source_type="resume",
        display_name="Resume (Alex_Chen_2026.pdf)",
        status="imported",
        source_url="/storage/resumes/alex_chen_2026.pdf",
        last_synced_at=datetime.now(timezone.utc),
        sync_status_message="Parsed 8 verified claims and career history",
    )
    src_portfolio = Source(
        user_id=user.id,
        source_type="portfolio",
        display_name="Personal Engineering Portfolio",
        status="connected",
        source_url="https://alexchen.dev",
        last_synced_at=datetime.now(timezone.utc),
        sync_status_message="Verified technical case studies",
    )
    src_linkedin = Source(
        user_id=user.id,
        source_type="linkedin",
        display_name="LinkedIn Profile",
        status="disconnected",
        source_url=None,
        sync_status_message="Available for connection",
    )
    session.add_all([src_github, src_resume, src_portfolio, src_linkedin])
    await session.flush()

    conn_gh = SourceConnection(
        source_id=src_github.id,
        encrypted_token=SecretVault.encrypt("mock_github_oauth_token_alexchen"),
        scopes_json=["read:user", "repo"],
    )
    session.add(conn_gh)

    # 3. Evidence Items (PROVENANCE)
    ev1 = Evidence(
        user_id=user.id,
        source_id=src_github.id,
        source_type="github",
        evidence_type="repository",
        external_id="gh-repo-101",
        title="Repository: distributed-task-orchestrator",
        description="Demonstrates production mastery of Python asyncio concurrency, DAG graph resolution, and Redis locks.",
        confidence=0.98,
        raw_payload_json={"stars": 342, "language": "Python", "lines_of_code": 8400},
    )
    ev2 = Evidence(
        user_id=user.id,
        source_id=src_github.id,
        source_type="github",
        evidence_type="repository",
        external_id="gh-repo-102",
        title="Repository: fastapi-microservice-kit",
        description="Demonstrates clean architecture, async SQLAlchemy 2.0, migrations, and Docker containerization.",
        confidence=0.96,
        raw_payload_json={"stars": 185, "language": "Python"},
    )
    ev3 = Evidence(
        user_id=user.id,
        source_id=src_resume.id,
        source_type="resume",
        evidence_type="work_experience",
        title="Senior Backend Role at CloudScale Systems",
        description="Verified experience leading API architecture and high-throughput ingestion pipelines.",
        confidence=0.94,
    )
    ev4 = Evidence(
        user_id=user.id,
        source_id=src_portfolio.id,
        source_type="portfolio",
        evidence_type="project_submission",
        title="System Architecture Case Study: Database Partitioning",
        description="Published deep dive on PostgreSQL table partitioning, indexing strategies, and connection pooling.",
        confidence=0.91,
    )
    session.add_all([ev1, ev2, ev3, ev4])
    await session.flush()

    # 4. Normalized Skills & Skill Evidence (KNOW)
    skills_data = [
        ("Python", "Backend", "Core high-level programming language for async backend development."),
        ("FastAPI", "Backend", "Modern, fast web framework for building APIs with Python."),
        ("PostgreSQL", "Database", "Relational database with JSONB and pgvector capabilities."),
        ("Docker", "DevOps", "Container platform for packaging and executing applications."),
        ("Redis", "Database", "In-memory data structure store for caching and pub/sub."),
        ("AWS", "Cloud", "Amazon Web Services cloud computing platform."),
        ("Kubernetes", "DevOps", "Production container orchestration and cluster management."),
        ("System Design", "Architecture", "Designing scalable, fault-tolerant distributed systems."),
        ("CI/CD", "DevOps", "Continuous Integration and Continuous Deployment pipelines."),
        ("GraphQL", "Backend", "API query language and runtime for fulfilling queries."),
    ]

    skill_records = {}
    for name, cat, desc in skills_data:
        skill = Skill(name=name, category=cat, description=desc)
        session.add(skill)
        skill_records[name] = skill
    await session.flush()

    # Connect Skills to Evidence
    se_entries = [
        (skill_records["Python"], ev1, "STRONG", 0.98, 9.2),
        (skill_records["FastAPI"], ev2, "STRONG", 0.96, 9.0),
        (skill_records["PostgreSQL"], ev4, "STRONG", 0.93, 8.8),
        (skill_records["Docker"], ev2, "STRONG", 0.90, 8.4),
        (skill_records["Redis"], ev1, "STRONG", 0.92, 8.5),
        (skill_records["AWS"], ev3, "MODERATE", 0.85, 6.2),
        (skill_records["Kubernetes"], ev2, "WEAK", 0.70, 3.5),
        (skill_records["System Design"], ev4, "MODERATE", 0.80, 4.2),
    ]

    for skill_obj, ev_obj, strength, conf, prof in se_entries:
        se = SkillEvidence(
            user_id=user.id,
            skill_id=skill_obj.id,
            evidence_id=ev_obj.id,
            strength=strength,
            confidence=conf,
            proficiency_estimate=prof,
            is_verified=True,
        )
        session.add(se)
    await session.flush()

    # 5. Career Goal (GOALS)
    goal = CareerGoal(
        user_id=user.id,
        target_role="Senior Backend / Distributed Systems Engineer",
        target_seniority="Senior",
        location_preference="Remote (US / Global)",
        is_remote_preferred=True,
        employment_type="FULL_TIME",
        target_salary_min=165000,
        target_salary_max=215000,
        priority=1,
        is_active=True,
    )
    session.add(goal)
    await session.flush()

    # 6. Companies & Jobs (JOB DOMAIN)
    job_source = JobSource(name="Verified Career Feed", source_type="ats")
    session.add(job_source)
    await session.flush()

    companies_data = [
        ("DataScale Labs", "https://datascale.io", "Data & AI Infrastructure", "100-500", "San Francisco, CA"),
        ("Starlight Cloud", "https://starlight.cloud", "Cloud Platform", "500-1000", "Seattle, WA"),
        ("Apex AI Systems", "https://apexai.dev", "AI & Machine Learning", "50-200", "New York, NY"),
        ("CloudPulse", "https://cloudpulse.io", "Observability & Telemetry", "200-500", "Austin, TX"),
        ("Nexus Vector", "https://nexusvector.com", "Vector Search & Retrieval", "20-50", "Remote"),
        ("HyperQueue", "https://hyperqueue.dev", "Distributed Streaming", "50-100", "San Francisco, CA"),
    ]

    comp_records = {}
    for name, web, ind, sz, loc in companies_data:
        comp = Company(name=name, website_url=web, industry=ind, size_range=sz, location=loc)
        session.add(comp)
        comp_records[name] = comp
    await session.flush()

    jobs_data = [
        (
            comp_records["DataScale Labs"],
            "Senior Backend Engineer — Distributed Infrastructure",
            "Senior",
            "San Francisco, CA / Remote",
            True,
            175000,
            220000,
            ["Python", "FastAPI", "PostgreSQL", "Redis", "Distributed Systems", "Kubernetes"],
            "We are seeking a Senior Backend Engineer to lead our distributed data pipeline ingestion engine. You will own architecture, caching layers, and high-throughput microservices.",
        ),
        (
            comp_records["Nexus Vector"],
            "Senior Platform Engineer — Vector Search",
            "Senior",
            "Remote",
            True,
            180000,
            230000,
            ["Python", "FastAPI", "PostgreSQL", "Docker", "AWS", "System Design"],
            "Join our core platform engineering team building low-latency vector indexing services and pgvector querying backends.",
        ),
        (
            comp_records["Starlight Cloud"],
            "Staff Backend Engineer — Cloud Control Plane",
            "Staff",
            "Seattle, WA / Remote",
            True,
            195000,
            250000,
            ["Python", "Kubernetes", "AWS", "System Design", "Docker"],
            "Architect resilient cloud control planes and multitenant infrastructure services serving global enterprises.",
        ),
        (
            comp_records["Apex AI Systems"],
            "Backend API Engineer — AI Infrastructure",
            "Senior",
            "New York, NY / Remote",
            True,
            165000,
            210000,
            ["Python", "FastAPI", "Docker", "Redis", "PostgreSQL"],
            "Build scalable AI inference gateway APIs and streaming token response backends.",
        ),
        (
            comp_records["CloudPulse"],
            "Senior Systems Engineer — Telemetry & Metrics",
            "Senior",
            "Austin, TX / Remote",
            True,
            170000,
            215000,
            ["Python", "PostgreSQL", "Redis", "Docker", "System Design"],
            "Design time-series metrics storage and real-time observability dashboards.",
        ),
        (
            comp_records["HyperQueue"],
            "Distributed Systems Backend Engineer",
            "Senior",
            "Remote",
            True,
            175000,
            225000,
            ["Python", "FastAPI", "Kubernetes", "System Design", "AWS"],
            "Own our core event orchestration queues and distributed scheduler persistence layer.",
        ),
    ]

    job_records = []
    for comp, title, sen, loc, rem, smin, smax, reqs, desc in jobs_data:
        job = Job(
            company_id=comp.id,
            job_source_id=job_source.id,
            title=title,
            seniority=sen,
            location=loc,
            is_remote=rem,
            salary_min=smin,
            salary_max=smax,
            raw_description=desc,
            normalized_description=desc,
            responsibilities_json=[
                "Design and execute scalable asynchronous backend services.",
                "Optimize database schemas, indexes, and queries.",
                "Participate in architectural reviews and mentorship.",
            ],
            requirements_summary_json=reqs,
            is_active=True,
        )
        session.add(job)
        await session.flush()
        job_records.append((job, reqs))

        for req_name in reqs:
            sk = skill_records.get(req_name)
            req_obj = JobRequirement(
                job_id=job.id,
                skill_id=sk.id if sk else None,
                requirement_type="REQUIRED" if req_name in ("Python", "FastAPI", "PostgreSQL") else "PREFERRED",
                importance=5 if req_name in ("Python", "FastAPI") else 3,
                source_text=f"Must have strong hands-on experience with {req_name}",
                normalized_interpretation=req_name,
            )
            session.add(req_obj)
    await session.flush()

    # 7. Matches (MATCH DOMAIN)
    match_scores = [
        (job_records[0][0], 93.5, 94.0, 95.0, 100.0, "STRONG_MATCH", ["Python", "FastAPI", "PostgreSQL", "Redis"], ["Kubernetes"], "Exceptional alignment on async Python backend stack and distributed DB architectures. Primary growth area is Kubernetes cluster operations."),
        (job_records[1][0], 91.0, 92.0, 90.0, 100.0, "STRONG_MATCH", ["Python", "FastAPI", "PostgreSQL", "Docker"], ["System Design"], "Strong technical fit with vector indexing and PostgreSQL internals."),
        (job_records[3][0], 89.5, 90.0, 88.0, 100.0, "STRONG_MATCH", ["Python", "FastAPI", "Docker", "Redis", "PostgreSQL"], [], "Direct match on all required API gateway and database tech stack requirements."),
        (job_records[4][0], 84.0, 85.0, 86.0, 100.0, "STRONG_MATCH", ["Python", "PostgreSQL", "Redis", "Docker"], ["System Design"], "Solid match for observability data pipelines."),
        (job_records[2][0], 71.5, 68.0, 78.0, 90.0, "STRETCH", ["Python", "Docker"], ["Kubernetes", "AWS", "System Design"], "High-impact Staff role requiring deeper production Kubernetes orchestration and multi-region AWS design experience."),
    ]

    for j_obj, overall, tech, exp, pref, cat, matched, missing, expl in match_scores:
        m = Match(
            user_id=user.id,
            job_id=j_obj.id,
            career_goal_id=goal.id,
            overall_score=overall,
            technical_fit=tech,
            experience_fit=exp,
            preference_fit=pref,
            recommendation_category=cat,
            explanation=expl,
            matched_skills_json=matched,
            missing_skills_json=missing,
        )
        session.add(m)
    await session.flush()

    # 8. Gaps (GAP DOMAIN)
    gap1 = Gap(
        user_id=user.id,
        skill_id=skill_records["System Design"].id,
        job_id=job_records[0][0].id,
        gap_type="SKILL_GAP",
        title="Distributed Systems & Large-Scale System Design",
        current_level=4.1,
        target_level=7.5,
        importance=5,
        confidence=0.92,
        priority="CRITICAL",
        rationale="Senior Backend roles require demonstrating mastery of partitioned databases, consensus protocols, and rate-limiting patterns in architectural interviews.",
        estimated_effort_hours=28,
        expected_impact="+18% overall match readiness across 6 Senior Backend roles",
        status="ACTIVE",
    )
    gap2 = Gap(
        user_id=user.id,
        skill_id=skill_records["Kubernetes"].id,
        job_id=job_records[0][0].id,
        gap_type="EVIDENCE_GAP",
        title="Kubernetes Production Troubleshooting & Cluster Workloads",
        current_level=3.0,
        target_level=6.5,
        importance=4,
        confidence=0.88,
        priority="HIGH",
        rationale="Current profile has Docker containerization evidence but lacks verified deployment or debugging proof in Kubernetes environments.",
        estimated_effort_hours=20,
        expected_impact="+12% match boost on cloud infrastructure opportunities",
        status="ACTIVE",
    )
    gap3 = Gap(
        user_id=user.id,
        skill_id=skill_records["AWS"].id,
        gap_type="SKILL_GAP",
        title="AWS Cloud Architecture & Serverless Primitives",
        current_level=5.4,
        target_level=7.0,
        importance=3,
        confidence=0.85,
        priority="MEDIUM",
        rationale="Solid foundational knowledge, but lacks hands-on verification of VPC networking, IAM policies, and RDS failover setups.",
        estimated_effort_hours=16,
        expected_impact="+8% technical fit on platform engineering roles",
        status="ACTIVE",
    )
    session.add_all([gap1, gap2, gap3])
    await session.flush()

    # 9. Learning Resources & Plans (IMPROVE DOMAIN)
    resources_data = [
        ("Designing Data-Intensive Applications", "Martin Kleppmann (O'Reilly)", "https://dataintensive.net", "PAID", "BOOK", "ADVANCED", 25.0, ["System Design", "Distributed Systems", "PostgreSQL"], 4.9),
        ("ByteByteGo System Design Fundamentals", "Alex Xu", "https://bytebytego.com", "PAID", "COURSE", "INTERMEDIATE", 18.0, ["System Design", "Architecture"], 4.8),
        ("Official Kubernetes Documentation & Interactive Tutorials", "CNCF / Kubernetes", "https://kubernetes.io/docs/tutorials/", "FREE", "DOCUMENTATION", "INTERMEDIATE", 12.0, ["Kubernetes", "DevOps"], 4.9),
        ("Distributed Systems Lecture Series", "MIT OpenCourseWare (6.824)", "https://pdos.csail.mit.edu/6.824/", "FREE", "COURSE", "ADVANCED", 30.0, ["Distributed Systems", "Consensus"], 5.0),
        ("PostgreSQL 16 Performance Optimization & Index Tuning", "PostgreSQL Global Development Group", "https://www.postgresql.org/docs/current/performance-tips.html", "FREE", "DOCUMENTATION", "ADVANCED", 8.0, ["PostgreSQL", "Database"], 4.9),
        ("Build a Mini Raft Distributed Consensus Engine in Python", "JobPilot Interactive Labs", "https://jobpilot.dev/labs/raft-consensus", "FREE", "PROJECT", "ADVANCED", 14.0, ["Python", "Distributed Systems"], 4.8),
        ("Kubernetes Hard Way: Production Cluster Architecture", "Kelsey Hightower", "https://github.com/kelseyhightower/kubernetes-the-hard-way", "FREE", "TUTORIAL", "ADVANCED", 16.0, ["Kubernetes", "DevOps"], 5.0),
        ("AWS Well-Architected Framework: Reliability Pillar", "AWS Documentation", "https://aws.amazon.com/architecture/well-architected/", "FREE", "DOCUMENTATION", "INTERMEDIATE", 6.0, ["AWS", "Architecture"], 4.7),
    ]

    res_records = []
    for title, prov, url, cost, rtype, diff, dur, top, qscore in resources_data:
        res_obj = Resource(
            title=title,
            provider=prov,
            url=url,
            cost=cost,
            resource_type=rtype,
            difficulty=diff,
            duration_hours=dur,
            topics_json=top,
            quality_score=qscore,
        )
        session.add(res_obj)
        res_records.append(res_obj)
    await session.flush()

    # Learning Plan for System Design Gap
    plan = LearningPlan(
        user_id=user.id,
        gap_id=gap1.id,
        title="Mastering Distributed Systems & High-Scale Architecture",
        target_skill="System Design",
        current_level=4.1,
        target_level=7.5,
        progress_percentage=42.0,
        estimated_duration_days=21,
        status="IN_PROGRESS",
    )
    session.add(plan)
    await session.flush()

    plan_items_data = [
        ("1. Storage Engines, LSM-Trees & B-Tree Tradeoffs", "READ", 0, True, 60, "COMPLETED", res_records[0]),
        ("2. Distributed Transactions & 2-Phase Commit Primitives", "WATCH", 1, True, 90, "COMPLETED", res_records[3]),
        ("3. Consistent Hashing & Distributed Cache Invalidation", "READ", 2, False, 45, "IN_PROGRESS", res_records[1]),
        ("4. Build Rate-Limiter with Token Bucket & Redis Sharding", "BUILD", 3, False, 120, "PENDING", res_records[5]),
        ("5. System Design Proving Assessment", "PROVE", 4, False, 30, "LOCKED", None),
    ]

    for ititle, itype, iorder, icomp, imin, istat, ires in plan_items_data:
        item = LearningPlanItem(
            learning_plan_id=plan.id,
            resource_id=ires.id if ires else None,
            title=ititle,
            item_type=itype,
            order_index=iorder,
            is_completed=icomp,
            estimated_minutes=imin,
            status=istat,
        )
        session.add(item)
    await session.flush()

    # 10. Assessments (PROVE DOMAIN)
    asm1 = Assessment(
        skill_id=skill_records["Kubernetes"].id,
        title="Kubernetes Production Diagnostics & Cluster Workloads",
        assessment_type="KNOWLEDGE",
        time_limit_minutes=20,
        passing_score=75.0,
        difficulty="INTERMEDIATE",
        description="Validate hands-on understanding of Pod lifecycle, CrashLoopBackOff troubleshooting, ingress controllers, and resource limits.",
    )
    asm2 = Assessment(
        skill_id=skill_records["System Design"].id,
        title="Distributed Systems & Database Scaling Architecture",
        assessment_type="SYSTEM_DESIGN",
        time_limit_minutes=30,
        passing_score=70.0,
        difficulty="ADVANCED",
        description="Evaluate architectural decisions for read-heavy vs write-heavy workloads, partition tolerance, and eventual consistency.",
    )
    session.add_all([asm1, asm2])
    await session.flush()

    # Questions for Assessment 1 (Kubernetes)
    q1 = AssessmentQuestion(
        assessment_id=asm1.id,
        order_index=0,
        prompt="A Kubernetes Pod is stuck in 'CrashLoopBackOff' status after deployment. What is the most systematic first command sequence to diagnose the root cause?",
        question_type="MULTIPLE_CHOICE",
        options_json=[
            "A) Run 'kubectl describe pod <pod-name>' followed by 'kubectl logs <pod-name> --previous'",
            "B) Delete the deployment and redeploy with higher memory limits immediately",
            "C) Restart the kubelet daemon on all worker nodes",
            "D) Run 'kubectl get nodes' to verify cluster connectivity",
        ],
        correct_answer="A",
        explanation="Checking pod events via 'kubectl describe' and viewing crashed container logs via '--previous' immediately surfaces application crashes, OOM kills, and config errors.",
        points=25,
    )
    q2 = AssessmentQuestion(
        assessment_id=asm1.id,
        order_index=1,
        prompt="When configuring a StatefulSet for a distributed database replica, what mechanism guarantees that each Pod maintains stable network identity across restarts?",
        question_type="MULTIPLE_CHOICE",
        options_json=[
            "A) A Headless Service with ClusterIP: None",
            "B) A NodePort service targeting port 8080",
            "C) A static Ingress resource with sticky sessions",
            "D) A persistent DaemonSet controller",
        ],
        correct_answer="A",
        explanation="StatefulSets use a Headless Service (ClusterIP: None) to generate deterministic, predictable DNS entries for each replica pod (e.g. db-0.db-service).",
        points=25,
    )
    q3 = AssessmentQuestion(
        assessment_id=asm1.id,
        order_index=2,
        prompt="What occurs when a container exceeds its configured 'limits.memory' specification in Kubernetes?",
        question_type="MULTIPLE_CHOICE",
        options_json=[
            "A) The Linux kernel OOM Killer immediately terminates the container with exit code 137",
            "B) CPU execution is throttled to 10% capacity",
            "C) The Pod is migrated to another node with zero downtime",
            "D) Kubernetes automatically doubles the memory limit",
        ],
        correct_answer="A",
        explanation="Unlike CPU limits which cause throttling via CFS, memory limit violations result in immediate OOM termination by the OS kernel.",
        points=25,
    )
    q4 = AssessmentQuestion(
        assessment_id=asm1.id,
        order_index=3,
        prompt="How does a 'ReadinessProbe' differ from a 'LivenessProbe' in production container routing?",
        question_type="MULTIPLE_CHOICE",
        options_json=[
            "A) Readiness failure removes the Pod from Service endpoints; Liveness failure triggers container restart",
            "B) Readiness restarts the node; Liveness terminates the cluster",
            "C) Liveness checks network latency; Readiness checks disk storage",
            "D) There is no difference; both probes execute the same internal handler",
        ],
        correct_answer="A",
        explanation="Readiness probes control traffic routing to prevent serving requests to initializing pods, whereas Liveness probes detect deadlocks and restart unhealthy containers.",
        points=25,
    )
    # Questions for Assessment 2 (System Design)
    q5 = AssessmentQuestion(
        assessment_id=asm2.id,
        order_index=0,
        prompt="In a write-heavy distributed counter system, what architectural approach best prevents lock contention on a single row while maintaining eventual accuracy?",
        question_type="MULTIPLE_CHOICE",
        options_json=[
            "A) Write sharding across N sub-counters with periodic asynchronous rollup aggregation",
            "B) Global distributed row locking with serializable isolation level",
            "C) Synchronous two-phase commit across all database read replicas",
            "D) Storing all increments in an un-indexed text file on disk",
        ],
        correct_answer="A",
        explanation="Sharding write counters across independent buckets disperses concurrent row locks, aggregating sum on read queries.",
        points=25,
    )
    q6 = AssessmentQuestion(
        assessment_id=asm2.id,
        order_index=1,
        prompt="Which consensus algorithm protocol is specifically optimized for multi-Paxos leader election and state machine log replication?",
        question_type="MULTIPLE_CHOICE",
        options_json=[
            "A) Raft Consensus Algorithm",
            "B) Round Robin DNS",
            "C) Consistent Hashing with Virtual Nodes",
            "D) Bloom Filter membership checking",
        ],
        correct_answer="A",
        explanation="Raft decomposes consensus into explicit leader election, log replication, and safety guarantees.",
        points=25,
    )
    session.add_all([q1, q2, q3, q4, q5, q6])
    await session.flush()

    # 11. Applications (APPLY DOMAIN)
    app1 = Application(
        user_id=user.id,
        job_id=job_records[0][0].id,
        status="INTERVIEW",
        tailored_role_title="Senior Backend Engineer — Distributed Infrastructure",
        match_score_at_application=93.5,
        applied_at=datetime(2026, 8, 10, 14, 30, tzinfo=timezone.utc),
        notes="Completed initial screening. System Design architecture round scheduled with VP of Engineering.",
    )
    app2 = Application(
        user_id=user.id,
        job_id=job_records[1][0].id,
        status="TECHNICAL_ROUND",
        tailored_role_title="Senior Platform Engineer — Vector Search",
        match_score_at_application=91.0,
        applied_at=datetime(2026, 8, 12, 9, 0, tzinfo=timezone.utc),
        notes="Take-home coding benchmark completed. Technical discussion on pgvector indexing next.",
    )
    app3 = Application(
        user_id=user.id,
        job_id=job_records[3][0].id,
        status="SUBMITTED",
        tailored_role_title="Backend API Engineer — AI Infrastructure",
        match_score_at_application=89.5,
        applied_at=datetime(2026, 8, 20, 16, 45, tzinfo=timezone.utc),
        notes="Application submitted with tailored high-concurrency API portfolio artifact.",
    )
    app4 = Application(
        user_id=user.id,
        job_id=job_records[4][0].id,
        status="DRAFT",
        tailored_role_title="Senior Systems Engineer — Telemetry & Metrics",
        match_score_at_application=84.0,
        notes="Reviewing tailored cover letter emphasizing PostgreSQL optimization evidence.",
    )
    app5 = Application(
        user_id=user.id,
        job_id=job_records[2][0].id,
        status="OFFER",
        tailored_role_title="Senior Backend Engineer — Cloud Services",
        match_score_at_application=92.0,
        applied_at=datetime(2026, 7, 28, 11, 0, tzinfo=timezone.utc),
        notes="Offer letter received: $190,000 base + equity package. Decision pending.",
    )
    app6 = Application(
        user_id=user.id,
        job_id=job_records[5][0].id,
        status="REJECTED",
        tailored_role_title="Distributed Systems Backend Engineer",
        match_score_at_application=78.0,
        applied_at=datetime(2026, 7, 15, 10, 0, tzinfo=timezone.utc),
        notes="Feedback received: Strong Python async foundation, but required deeper multi-region Raft experience.",
    )
    session.add_all([app1, app2, app3, app4, app5, app6])
    await session.flush()

    # Application Policy
    policy = ApplicationPolicy(
        user_id=user.id,
        mode="MANUAL",
        is_auto_apply_enabled=False,
        min_match_score=85.0,
        daily_application_limit=5,
        requires_user_approval=True,
    )
    session.add(policy)

    # 12. Outcomes & Funnel Events (OUTCOME DOMAIN)
    events_data = [
        (app1.id, "INTERVIEW_SCHEDULED", datetime(2026, 8, 18, 15, 0, tzinfo=timezone.utc), "System Architecture interview scheduled with Hiring Manager"),
        (app1.id, "RECRUITER_RESPONSE", datetime(2026, 8, 14, 11, 30, tzinfo=timezone.utc), "Recruiter screen completed with positive recommendation"),
        (app2.id, "TECHNICAL_INTERVIEW", datetime(2026, 8, 17, 14, 0, tzinfo=timezone.utc), "Live coding session on asynchronous request batching"),
        (app5.id, "OFFER", datetime(2026, 8, 22, 10, 0, tzinfo=timezone.utc), "Official offer package received"),
        (app6.id, "REJECTION", datetime(2026, 8, 5, 16, 0, tzinfo=timezone.utc), "Outcome recorded with post-interview feedback"),
    ]

    for aid, etype, odate, notes in events_data:
        ev = ApplicationEvent(
            application_id=aid,
            user_id=user.id,
            event_type=etype,
            occurred_at=odate,
            notes=notes,
        )
        session.add(ev)

    # Outcome feedback linking to gap identification
    feedback = OutcomeFeedback(
        application_id=app6.id,
        feedback_stage="SYSTEM_DESIGN",
        bottleneck_identified="Distributed Consensus & Multi-Region Sharding",
        structured_rating=3,
        raw_feedback="Candidate has great async coding speed but struggled to articulate partition tolerance tradeoffs under split-brain network partitions.",
    )
    session.add(feedback)

    await session.commit()
    logger.info("Successfully seeded JobPilot database with complete career operating loop dataset!")


if __name__ == "__main__":
    asyncio.run(seed_database())
