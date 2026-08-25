# Asynchronous Processing & Worker Architecture

JobPilot uses **Celery + Redis** for asynchronous background execution.

---

## 1. Asynchronous Task Queues

| Queue | Handled Tasks |
|---|---|
| `source_sync` | GitHub OAuth repository synchronization, document parsing |
| `matching` | Batch match recalculation triggered by Stage 5 skill verifications |
| `ai` | Resume layout extraction, job requirements extraction |
| `notifications` | Asynchronous in-app and email event dispatching |

---

## 2. Event Dispatching Flow

```
AssessmentCompleted
      │
      ▼
SkillVerified
      │
      ▼
ProfileUpdated
      │
      ▼
Celery Task: recalculate_user_matches
      │
      ▼
MatchRecalculated ──► Invalidate Client Cache ──► Notify Unlocked Matches (+12)
```
