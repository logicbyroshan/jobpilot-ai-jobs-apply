# JobPilot Backend Architecture

JobPilot is an **AI Career Operating System** structured as a high-cohesion **Modular Monolith**.

---

## 1. Architectural Philosophy: The Modular Monolith

Rather than introducing distributed microservices with high operational overhead and network failure modes, JobPilot utilizes a single monolithic backend with strict domain boundaries:

```
                         API (FastAPI)
                              │
                              ▼
                    APPLICATION LAYER
                              │
       ┌──────────────────────┼───────────────────────┐
       │                      │                       │
       ▼                      ▼                       ▼
     KNOW                  MARKET                  CAREER
   (Identity,           INTELLIGENCE            INTELLIGENCE
    Sources,            (Jobs, Sources,         (Gaps, Learning,
    Evidence,            Requirements)           Assessments)
    Skills)                   │                       │
       │                      ▼                       │
       └──────────────► MATCHING ENGINE ◄─────────────┘
                              │
                              ▼
                      APPLY & OUTCOME
                  (Applications, Policies,
                     Conversion Funnel)
```

---

## 2. Infrastructure Stack

- **Framework**: Python 3.11+, FastAPI, Pydantic v2, SQLAlchemy 2.0 Async
- **Database & Search**: PostgreSQL with `pgvector` for semantic embeddings and relational consistency
- **Async Workers & Caching**: Redis + Celery with exponential backoff retries
- **Storage**: S3-compatible object storage with signed URLs and local fallback
- **AI Gateway**: Provider-independent abstraction (Mock, OpenAI, Anthropic) with deterministic caching
- **Testing**: pytest, pytest-asyncio, httpx AsyncClient (27/27 tests passed)
