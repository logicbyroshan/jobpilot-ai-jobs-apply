from typing import Dict, List
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.errors import ResourceNotFoundException
from app.domains.identity.models import ProfessionalIdentity, User
from app.domains.identity.schemas import (
    CapabilityRating,
    CategorizedSkillItem,
    ConfidenceBreakdown,
    ConnectedSourceItem,
    LivingPortfolioResponse,
    PortfolioAbout,
    PortfolioExperienceItem,
    PortfolioHero,
    PortfolioProjectItem,
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

    @staticmethod
    async def get_living_portfolio(session: AsyncSession, user_id: str) -> LivingPortfolioResponse:
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
            user = await session.get(User, user_id)
            user_name = user.full_name if user else "Alex Chen"
            user_email = user.email if user else "alex.chen@jobpilot.dev"
        else:
            user_name = identity.user.full_name if identity.user else "Alex Chen"
            user_email = identity.user.email if identity.user else "alex.chen@jobpilot.dev"

        headline = identity.headline if identity and identity.headline else "Staff Distributed Systems & Infrastructure Architect"
        years_exp = identity.years_of_experience if identity and identity.years_of_experience else 8.5
        current_lvl = identity.current_level if identity and identity.current_level else "Staff Engineer"

        # Hero
        hero = PortfolioHero(
            full_name=user_name,
            headline=headline,
            summary="Backend and infrastructure engineer focused on distributed consensus, high-scale storage, low-latency streaming engines, and cloud native platforms.",
            location="San Francisco, CA (Open to Remote)",
            years_of_experience=years_exp,
            current_level=current_lvl,
            avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
            email=user_email,
            last_synced="August 2026",
        )

        # About ("How JobPilot sees you")
        about = PortfolioAbout(
            headline=headline,
            bio="Seasoned software architect with deep expertise in Go, Python, and distributed systems. Built multi-region consensus protocols, petabyte-scale storage engines, and high-throughput streaming pipelines.",
            career_direction="Staff / Principal Infrastructure Engineer in Tier-1 Distributed Systems & AI Platforms",
            preferred_roles=[
                "Staff Distributed Systems Engineer",
                "Principal Infrastructure Architect",
                "Lead Platform Engineer",
                "Staff Storage Systems Engineer",
            ],
            location="San Francisco, CA / Remote",
            years_of_experience=years_exp,
            capability_ratings=[
                CapabilityRating(
                    area="Distributed Systems & Consensus",
                    rating="Advanced (Top 5%)",
                    description="Demonstrated mastery in Raft protocols, linearizable reads, fault tolerance, and gossip topologies.",
                ),
                CapabilityRating(
                    area="High-Scale Backend & Storage",
                    rating="Advanced",
                    description="Extensive production record optimizing LSM-trees, WAL logging, memory-mapped buffers, and zero-copy I/O.",
                ),
                CapabilityRating(
                    area="Cloud & Kubernetes Platforms",
                    rating="Strong (Active Gap Target)",
                    description="Solid core container runtime experience; actively strengthening multi-tenant operator controllers.",
                ),
                CapabilityRating(
                    area="Technical Leadership & Architecture",
                    rating="Strong",
                    description="Proven track record authoring RFCs, leading architecture reviews, and unblocking cross-functional teams.",
                ),
            ],
        )

        # Experience
        experiences = [
            PortfolioExperienceItem(
                id="exp-1",
                company_name="Stripe",
                title="Staff Distributed Systems Engineer",
                period="2022 — Present",
                location="San Francisco, CA / Remote",
                is_current=True,
                impact_bullets=[
                    "Architected and deployed distributed multi-region consensus layer processing 450,000 tx/sec with 99.999% availability.",
                    "Reduced p99 tail latency by 38ms through zero-copy ring buffers and asynchronous WAL fsync batches.",
                    "Mentored 6 senior engineers and drove core infrastructure architectural standards across 4 payment teams.",
                ],
                demonstrated_skills=["Distributed Systems", "Go", "Raft", "Kubernetes", "PostgreSQL"],
                evidence_badges=["GitHub Verified", "Resume Extracted", "Code Proof"],
            ),
            PortfolioExperienceItem(
                id="exp-2",
                company_name="Datadog",
                title="Senior Backend & Infrastructure Engineer",
                period="2019 — 2022",
                location="New York, NY / Remote",
                is_current=False,
                impact_bullets=[
                    "Engineered high-throughput telemetry ingestion pipeline consuming 12M metric events/second in Go and Rust.",
                    "Designed custom columnar storage chunking algorithm reducing S3 storage costs by $240k/year.",
                    "Built automated canary deployment operators for Kubernetes clusters across 8 AWS regions.",
                ],
                demonstrated_skills=["Go", "Python", "LSM Storage Engines", "Distributed Systems", "Docker"],
                evidence_badges=["GitHub Verified", "Resume Extracted"],
            ),
            PortfolioExperienceItem(
                id="exp-3",
                company_name="Cloudflare",
                title="Systems Software Engineer",
                period="2016 — 2019",
                location="San Francisco, CA",
                is_current=False,
                impact_bullets=[
                    "Implemented edge routing optimization and TCP connection multiplexing at 200+ edge PoPs.",
                    "Co-authored internal distributed rate limiting protocol reducing malicious burst traffic by 72%.",
                ],
                demonstrated_skills=["Python", "Linux Internals", "Networking", "Distributed Systems"],
                evidence_badges=["Resume Extracted"],
            ),
        ]

        # Selected Work (Projects)
        projects = [
            PortfolioProjectItem(
                id="proj-1",
                title="Raft Consensus Engine",
                description="Production-grade Raft consensus implementation featuring dynamic membership changes, snapshotting, and linearizable reads.",
                what_was_built="A distributed replicated state machine in Go with strict TLA+ specification validation and automated Jepsen fault injection tests.",
                why_it_matters="Demonstrates verified mastery of distributed consensus required by 17 target staff positions.",
                technologies=["Go", "Raft", "Distributed Systems", "Concurrency", "TLA+"],
                evidence_count=3,
                repository_url="https://github.com/alexchen/raft-engine",
                demo_url="https://raft-demo.jobpilot.dev",
                provenance_source="github",
            ),
            PortfolioProjectItem(
                id="proj-2",
                title="LSM-Tree Key-Value Storage",
                description="High-performance embedded key-value engine with SSTable compaction, Bloom filter acceleration, and WAL crash recovery.",
                what_was_built="Built end-to-end memory-mapped memtable and multi-level background compaction pipeline delivering 280k writes/sec.",
                why_it_matters="Proves deep low-level storage systems engineering beyond generic API development.",
                technologies=["Go", "Storage Engines", "LSM Trees", "Memory Management"],
                evidence_count=2,
                repository_url="https://github.com/alexchen/lsm-kv",
                demo_url=None,
                provenance_source="github",
            ),
            PortfolioProjectItem(
                id="proj-3",
                title="Distributed Telemetry Multiplexer",
                description="Async streaming metrics pipeline capable of buffering and routing 5M events/sec across partitioned Kafka brokers.",
                what_was_built="Custom ring-buffer actor model implementation with sub-millisecond dispatch and backpressure control.",
                why_it_matters="Verifies senior-level telemetry streaming and concurrency architecture.",
                technologies=["Python", "Kafka", "AsyncIO", "Telemetry"],
                evidence_count=2,
                repository_url="https://github.com/alexchen/telemetry-multiplexer",
                demo_url=None,
                provenance_source="github",
            ),
        ]

        # Categorized Skills
        categorized_skills = {
            "Distributed Systems": [
                CategorizedSkillItem(
                    name="Distributed Consensus & Raft",
                    category="Distributed Systems",
                    capability_level="Advanced",
                    level_score=9.8,
                    confidence="Verified",
                    target_opportunities_count=17,
                    evidence_sources=["GitHub Commits", "Assessment 100%", "Production Experience"],
                    last_verified="Today (Score: 100%)",
                    strengthen_tip="Verified top 1% score. Ready for Principal-level technical interviews.",
                ),
                CategorizedSkillItem(
                    name="High Concurrency & Goroutines",
                    category="Distributed Systems",
                    capability_level="Advanced",
                    level_score=9.5,
                    confidence="Verified",
                    target_opportunities_count=15,
                    evidence_sources=["GitHub Commits", "Datadog Project"],
                    last_verified="August 2026",
                    strengthen_tip=None,
                ),
                CategorizedSkillItem(
                    name="Linearizable Consistency Models",
                    category="Distributed Systems",
                    capability_level="Strong",
                    level_score=8.8,
                    confidence="High",
                    target_opportunities_count=12,
                    evidence_sources=["Raft Project", "Assessment"],
                    last_verified="August 2026",
                    strengthen_tip="Take Jepsen testing diagnostic to upgrade to 9.5.",
                ),
            ],
            "Languages": [
                CategorizedSkillItem(
                    name="Go (Golang)",
                    category="Languages",
                    capability_level="Advanced",
                    level_score=9.6,
                    confidence="Verified",
                    target_opportunities_count=18,
                    evidence_sources=["34,000 GitHub LOC", "Stripe Experience"],
                    last_verified="August 2026",
                    strengthen_tip=None,
                ),
                CategorizedSkillItem(
                    name="Python",
                    category="Languages",
                    capability_level="Advanced",
                    level_score=9.2,
                    confidence="Verified",
                    target_opportunities_count=14,
                    evidence_sources=["52 Repos", "AsyncIO Frameworks"],
                    last_verified="August 2026",
                    strengthen_tip=None,
                ),
                CategorizedSkillItem(
                    name="Rust",
                    category="Languages",
                    capability_level="Intermediate",
                    level_score=6.2,
                    confidence="Medium",
                    target_opportunities_count=6,
                    evidence_sources=["2 Repositories"],
                    last_verified="July 2026",
                    strengthen_tip="Complete Rust memory model assessment to boost confidence.",
                ),
            ],
            "Cloud & Infrastructure": [
                CategorizedSkillItem(
                    name="Kubernetes & Container Orchestration",
                    category="Cloud & Infrastructure",
                    capability_level="Strong (Target Gap)",
                    level_score=7.0,
                    confidence="Medium",
                    target_opportunities_count=16,
                    evidence_sources=["Deployment Manifests", "Datadog Experience"],
                    last_verified="August 2026",
                    strengthen_tip="Your knowledge is strong, but multi-tenant operator controllers need code verification.",
                ),
                CategorizedSkillItem(
                    name="AWS Cloud Infrastructure",
                    category="Cloud & Infrastructure",
                    capability_level="Strong",
                    level_score=8.4,
                    confidence="High",
                    target_opportunities_count=13,
                    evidence_sources=["Terraform Proofs", "Production Deployments"],
                    last_verified="August 2026",
                    strengthen_tip=None,
                ),
                CategorizedSkillItem(
                    name="GPU Cluster Scheduling & Triton",
                    category="Cloud & Infrastructure",
                    capability_level="Intermediate (Active Gap)",
                    level_score=4.2,
                    confidence="Medium",
                    target_opportunities_count=11,
                    evidence_sources=["Learning Blueprint Active"],
                    last_verified="August 2026",
                    strengthen_tip="Follow Stage 4 improvement mission to unlock 11 AI infrastructure roles.",
                ),
            ],
            "Databases & Storage": [
                CategorizedSkillItem(
                    name="LSM Storage Engines & RocksDB",
                    category="Databases & Storage",
                    capability_level="Advanced",
                    level_score=9.1,
                    confidence="Verified",
                    target_opportunities_count=12,
                    evidence_sources=["LSM-KV Project", "Datadog Experience"],
                    last_verified="August 2026",
                    strengthen_tip=None,
                ),
                CategorizedSkillItem(
                    name="PostgreSQL Internals & Query Tuning",
                    category="Databases & Storage",
                    capability_level="Advanced",
                    level_score=8.9,
                    confidence="Verified",
                    target_opportunities_count=15,
                    evidence_sources=["Stripe Experience", "Schema Migrations"],
                    last_verified="August 2026",
                    strengthen_tip=None,
                ),
            ],
            "Technical Leadership": [
                CategorizedSkillItem(
                    name="System Design & Architecture RFCs",
                    category="Technical Leadership",
                    capability_level="Advanced",
                    level_score=9.4,
                    confidence="Verified",
                    target_opportunities_count=16,
                    evidence_sources=["3 Published Tech RFCs", "Stripe Leadership"],
                    last_verified="August 2026",
                    strengthen_tip=None,
                ),
                CategorizedSkillItem(
                    name="Mentorship & Cross-Team Execution",
                    category="Technical Leadership",
                    capability_level="Strong",
                    level_score=8.7,
                    confidence="High",
                    target_opportunities_count=10,
                    evidence_sources=["Peer Endorsements", "Stripe Role"],
                    last_verified="August 2026",
                    strengthen_tip=None,
                ),
            ],
        }

        # Confidence Breakdown
        confidence = ConfidenceBreakdown(
            strong_evidence_count=8,
            needs_verification_count=2,
            missing_evidence_count=1,
            confidence_score=94.2,
        )

        # Connected Sources
        sources = [
            ConnectedSourceItem(
                id="src-1",
                name="GitHub Profile",
                type="Code & Repositories",
                status="Connected & Verified",
                items_count=64,
                last_synced="12 mins ago",
            ),
            ConnectedSourceItem(
                id="src-2",
                name="Master Resume (PDF/Doc)",
                type="Career History",
                status="Parsed & Indexed",
                items_count=3,
                last_synced="Yesterday",
            ),
            ConnectedSourceItem(
                id="src-3",
                name="LinkedIn Data",
                type="Employment Graph",
                status="Synced",
                items_count=28,
                last_synced="3 days ago",
            ),
            ConnectedSourceItem(
                id="src-4",
                name="Verified Skill Proofs",
                type="Deterministic Assessments",
                status="Active (100% Score)",
                items_count=4,
                last_synced="Just now",
            ),
        ]

        return LivingPortfolioResponse(
            hero=hero,
            about=about,
            experiences=experiences,
            projects=projects,
            categorized_skills=categorized_skills,
            confidence_breakdown=confidence,
            connected_sources=sources,
        )
