# JobPilot Domain Boundaries & Engines

Each domain in JobPilot maintains clear ownership and business rules.

---

## Domain Breakdown

| Domain | Entity Ownership | Key Engine / Canonical Service |
|---|---|---|
| **Identity** | User, ProfessionalIdentity, Experience, Project | `NextActionEngine` (computes highest-yield next step) |
| **Sources** | SourceConnection, SourceSyncRun, SecretStore | `GitHubConnector` (OAuth, repo metadata, commits) |
| **Evidence** | Evidence (EXPERIENCE, PROJECT, ASSESSMENT, GITHUB) | Provenance Tracker & Citation Normalizer |
| **Skills** | Canonical Skills, SkillEvidence | `SkillScoringEngine` (weighted evidence, 0-10 levels, freshness) |
| **Career Goals** | CareerGoal (target role, seniority, salary floor) | Goal Direction & Priority Engine |
| **Jobs** | Company, Job, JobRequirement | Job Normalization & Deduplication |
| **Matching** | Match (4-factor breakdown & explanations) | `MatchEngine` (Deterministic + Semantic Hybrid) |
| **Gaps** | Gap (SKILL, EVIDENCE, EXPERIENCE, OUTCOME) | `GapAnalysisEngine` & `GapPriorityEngine` |
| **Learning** | LearningResource, LearningPlan, LearningPlanItem | `LearningPlanEngine` (5-phase blueprint: Learn, Practice, Build, Review, Prove) |
| **Assessments** | AssessmentBlueprint, Questions, Attempts | `AssessmentEngine` (deterministic scoring & skill verification) |
| **Applications** | Application, ApplicationArtifact, Policy | `ApplicationService` (truthfulness grounding & policy guardrails) |
| **Outcomes** | ApplicationEvent, OutcomeFeedback | `OutcomeAnalysisEngine` (conversion funnel & bottleneck diagnosis) |
