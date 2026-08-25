# JobPilot Data Model & Persistence Schema

JobPilot uses PostgreSQL as the primary system of record, utilizing UUID primary keys, timezone-aware timestamps, foreign keys with cascade constraints, and unique constraints.

---

## Core Entities & Relationships

```mermaid
erDiagram
    User ||--o| ProfessionalIdentity : "has"
    User ||--o{ CareerGoal : "defines"
    User ||--o{ SourceConnection : "connects"
    User ||--o{ Evidence : "owns"
    User ||--o{ SkillEvidence : "possesses"
    User ||--o{ Match : "matched_to"
    User ||--o{ Gap : "diagnosed_with"
    User ||--o{ LearningPlan : "follows"
    User ||--o{ AssessmentAttempt : "takes"
    User ||--o{ Application : "submits"
    
    Skill ||--o{ SkillEvidence : "referenced_in"
    Skill ||--o{ JobRequirement : "required_by"
    Skill ||--o{ Assessment : "tested_in"
    
    Job ||--o{ JobRequirement : "specifies"
    Job ||--o{ Match : "evaluated_in"
    Job ||--o{ Application : "applied_to"
    
    Application ||--o{ ApplicationArtifact : "contains"
    Application ||--o{ ApplicationEvent : "records"
```
