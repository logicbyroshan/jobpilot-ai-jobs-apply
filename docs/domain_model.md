# JobPilot — Domain Model & Boundary Specifications

## 1. Domain Catalog

JobPilot is partitioned into 12 discrete domains, each adhering to bounded context principles:

```
apps/api/app/domains/
├── identity/       # User profiles, work history, projects, preferences
├── sources/        # External connectors (GitHub, LinkedIn, Resume parsers)
├── skills/         # Normalized skill ontology, evidence graph, proficiency
├── jobs/           # Normalized job opportunities, companies, requirements
├── matching/       # Multi-dimensional matching & scoring engine
├── gaps/           # Skill, evidence, and experience gap diagnostics
├── learning/       # Curated resource registry & customized learning plans
├── assessments/    # Proving quizzes, scenario tests, and score evaluations
├── applications/   # Tailored resumes, cover letters, and application tracking
├── outcomes/       # Conversion funnels, lifecycle events, bottleneck metrics
├── orchestration/  # Background workflows & loop execution engine
└── analytics/      # Aggregated performance telemetry and ROI reporting
```

---

## 2. Detailed Domain Specifications

### 1. `identity` Domain
- **Responsibilities**: Manages candidate baseline attributes, verified contact details, work experience records, and project repositories.
- **Key Entities**: `User`, `Experience`, `Project`, `UserPreference`.
- **Invariants**: 
  - Each `User` has exactly one active `UserPreference` configuration.
  - Work experiences cannot have start dates in the future.

### 2. `sources` Domain
- **Responsibilities**: Interfaces with external data providers, handles OAuth authentication, and orchestrates periodic synchronization of profile signals.
- **Key Entities**: `SourceConnection`, `SourceSyncJob`.
- **Supported Connectors**: `GitHubConnector`, `LinkedInConnector`, `ResumeDocumentConnector`.

### 3. `skills` Domain
- **Responsibilities**: Maintains a canonical ontology of technical competencies and anchors them to verifiable evidence items.
- **Key Entities**: `Skill`, `UserSkillEvidence`, `EvidenceItem`.
- **Evidence Types**: `COMMIT`, `PULL_REQUEST`, `RESUME_LINE`, `ASSESSMENT_PASS`, `PROJECT_DEPLOYMENT`.
- **Strength Enum**: `STRONG`, `MODERATE`, `WEAK`.

### 4. `jobs` Domain
- **Responsibilities**: Aggregates, deduplicates, and normalizes job openings from market boards, parsing granular skill requirements.
- **Key Entities**: `Company`, `Job`, `JobRequirement`.
- **Requirements Weighting**: `MUST_HAVE` (weight: 1.0), `NICE_TO_HAVE` (weight: 0.5), `BONUS` (weight: 0.25).

### 5. `matching` Domain
- **Responsibilities**: Computes multi-dimensional alignment between a candidate's verified skill profile and open job requirements.
- **Key Entities**: `JobMatch`.
- **Recommendation Categories**: `STRONG_MATCH` ($\ge 85\%$), `GOOD_MATCH` ($70\text{--}84\%$), `STRETCH` ($50\text{--}69\%$), `LOW_MATCH` ($< 50\%$).

### 6. `gaps` Domain
- **Responsibilities**: Quantifies the delta between current candidate proficiency and target role requirements.
- **Key Entities**: `SkillGap`.
- **Gap Types**: `SKILL_GAP`, `EVIDENCE_GAP`, `EXPERIENCE_GAP`.
- **Priorities**: `CRITICAL`, `HIGH`, `MEDIUM`, `LOW`.

### 7. `learning` Domain
- **Responsibilities**: Curates an authoritative index of educational resources and creates tailored learning plans with trackable steps.
- **Key Entities**: `Resource`, `LearningPlan`, `LearningPlanItem`.
- **Item Types**: `READ`, `WATCH`, `PRACTICE`, `BUILD`, `PROVE`.

### 8. `assessments` Domain
- **Responsibilities**: Generates and scores technical assessments, providing immediate feedback and calibrating verified skill levels.
- **Key Entities**: `Assessment`, `AssessmentQuestion`, `AssessmentAttempt`, `AssessmentEvaluation`.
- **Feedback Loop**: Scoring $\ge \text{passing\_score}$ updates the corresponding `UserSkillEvidence` record in the `skills` domain.

### 9. `applications` Domain
- **Responsibilities**: Manages the application lifecycle, drafts tailored resumes and cover letters with evidence provenance citations, and enforces autonomous policy guardrails.
- **Key Entities**: `Application`, `ApplicationArtifact`, `ApplicationPolicy`.
- **Modes**: `MANUAL`, `ASSISTED`, `AUTONOMOUS`.

### 10. `outcomes` Domain
- **Responsibilities**: Records funnel stage progressions, calculates conversion rates, and detects system bottlenecks.
- **Key Entities**: `ApplicationEvent`, `FunnelSnapshot`.
- **Stages**: `DRAFT` $\to$ `SUBMITTED` $\to$ `RECRUITER_RESPONSE` $\to$ `INTERVIEW` $\to$ `TECHNICAL_ROUND` $\to$ `FINAL_ROUND` $\to$ `OFFER` $\to$ `REJECTED` / `WITHDRAWN`.

### 11. `orchestration` Domain
- **Responsibilities**: Manages the asynchronous loop scheduler, Celery task triggers, and periodic re-indexing cron jobs.

### 12. `analytics` Domain
- **Responsibilities**: Aggregates macro telemetry across users, tracking career velocity, skill acquisition rate, and market match trends.
