<div align="center">

<img src="apps/web/public/logo-dark.png" alt="JobPilot Logo" width="200" />

# JobPilot

### The AI-Powered Career Operating System

*A closed-loop autonomous platform for continuous professional identity modeling, intelligent opportunity matching, skill gap diagnostics, guided learning, competency proving, and governed application execution.*

```
    ┌─────── KNOW ◄───────────────────────────────────────┐
    │         │                                           │
    ▼         ▼                                           │
  MATCH ──► GAP ──► IMPROVE ──► PROVE ──► APPLY ──► OUTCOME
```

---

[![FastAPI](https://img.shields.io/badge/FastAPI-0.111.0-009688.svg?style=flat&logo=FastAPI)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black.svg?style=flat&logo=next.js)](https://nextjs.org)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB.svg?style=flat&logo=python)](https://python.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue.svg?style=flat&logo=typescript)](https://typescriptlang.org)
[![SQLite](https://img.shields.io/badge/SQLite-Standalone_Zero--Docker-003B57.svg?style=flat&logo=sqlite)](https://sqlite.org)
[![Authentication](https://img.shields.io/badge/Auth-Google_SSO_+_JWT-4285F4.svg?style=flat&logo=google)](https://github.com/logicbyroshan/jobpilot-ai-jobs-apply)

</div>

---

## 🌟 Key Features

* 🔐 **Full Authentication Suite**: Supports **Sign in / Sign up with Google SSO** and standard email/password authentication with PBKDF2 cryptography and JWT tokens.
* ⚡ **Zero-Docker Architecture**: Operates 100% standalone out-of-the-box using asynchronous SQLite (`aiosqlite`) with automated schema generation and seeding.
* 🧠 **Evidence-Backed Identity (KNOW)**: Integrates GitHub repos, commits, and resume signals into a verified competency graph.
* 🎯 **Multi-Dimensional Matching (MATCH)**: Scores Technical Fit ($50\%$), Experience Fit ($30\%$), and Preference Fit ($20\%$).
* 🔍 **Skill Gap Diagnostics (GAP)**: Quantifies deficits and estimates match score impact upon completion.
* 📚 **Targeted Learning Plans (IMPROVE)**: Curates high-signal literature and hands-on milestones.
* 🧪 **Competency Proving Engine (PROVE)**: Real-time technical scenarios with instant automated grading and live skill upgrades.
* 🤖 **Governed Autonomous Applications (APPLY)**: Tailors resumes and cover letters with verifiable provenance source citations under strict policy rules.
* 📊 **Funnel & Bottleneck Analytics (OUTCOME)**: Identifies conversion drop-offs and feeds back into the recommendation model.

---

## 🚀 Quickstart Guide (Zero Docker Required)

### Prerequisites
- **Python 3.11+**
- **Node.js 18+** and **npm**

---

### Step 1: Clone and Set Up the Backend API (`apps/api`)

```bash
# 1. Navigate to the API directory
cd apps/api

# 2. Create and activate a Python virtual environment
python -m venv .venv

# On Windows (PowerShell):
.venv\Scripts\activate
# On macOS/Linux:
source .venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Initialize the standalone database with the demo dataset
python ../../scripts/seed.py

# 5. Start the FastAPI development server
uvicorn app.main:app --reload --port 8000
```

> **API Gateway**: `http://localhost:8000`  
> **Interactive Swagger Documentation**: `http://localhost:8000/docs`  
> **ReDoc API Documentation**: `http://localhost:8000/redoc`

---

### Step 2: Set Up & Launch the Web Application (`apps/web`)

```bash
# In a new terminal tab, navigate to the web directory
cd apps/web

# Install dependencies
npm install

# Start the Next.js development server
npm run dev
```

> **Web Application**: `http://localhost:3000`  
> **Login Page**: `http://localhost:3000/login`  
> **Register Page**: `http://localhost:3000/register`

---

## 🔑 Demo Credentials

To explore the full 8-stage career operating loop with a rich pre-configured profile:

| Field | Value |
| :--- | :--- |
| **Email** | `alex.chen@jobpilot.dev` |
| **Password** | `MasterPassword2026!` |
| **Google SSO** | Click **"Sign in with Google"** on `/login` |
| **Quick Access** | Click **"⚡ 1-Click Demo Login"** on `/login` |

---

## 📐 Monorepo Project Structure

```
JobPilot/
├── apps/
│   ├── api/                     # FastAPI Backend (Python 3.11+)
│   │   ├── app/
│   │   │   ├── core/            # Config, Async SQLite DB, Security, Seeder
│   │   │   ├── domains/         # 12 Modular Monolith Domain Contexts
│   │   │   │   ├── auth/        # Google SSO, JWT, Password Cryptography, Router
│   │   │   │   ├── identity/    # Profiles, Work Experience, Projects
│   │   │   │   ├── sources/     # GitHub, LinkedIn, Resume Ingestion
│   │   │   │   ├── skills/      # Skill Ontology & Evidence Graph
│   │   │   │   ├── jobs/        # Companies, Jobs, Requirements
│   │   │   │   ├── matching/    # Multi-Dimensional Scorer
│   │   │   │   ├── gaps/        # Deficit Diagnostics & Impact Estimator
│   │   │   │   ├── learning/    # Learning Plans & Curated Resource Index
│   │   │   │   ├── assessments/ # Quizzes, Evaluations, Skill Boosts
│   │   │   │   ├── applications/# Tailored Resumes, Artifacts, Policy
│   │   │   │   ├── outcomes/    # Conversion Funnel & Lifecycle Events
│   │   │   │   ├── orchestration# Background Scheduler & Loop Tasks
│   │   │   │   └── analytics/   # Macro Telemetry & Velocity
│   │   │   └── main.py          # Application Factory & Route Registration
│   │   └── tests/               # 16 Async Pytest End-to-End Test Cases
│   │
│   └── web/                     # Next.js 14 Web Application
│       ├── app/                 # App Router Pages & Components
│       │   ├── page.tsx         # Operating Loop Command Center
│       │   ├── login/           # Google SSO & Email/Password Login
│       │   ├── register/        # Google SSO & Email Registration
│       │   ├── know/            # Stage 1: Identity & Evidence Graph
│       │   ├── match/           # Stage 2: Opportunity Radar
│       │   ├── gap/             # Stage 3: Skill Gap Diagnostics
│       │   ├── improve/         # Stage 4: Curated Learning Pathways
│       │   ├── prove/           # Stage 5: Proving Quizzes & Evaluations
│       │   ├── apply/           # Stage 6: Application Pipeline & Policy
│       │   └── outcome/         # Stage 7: Conversion Funnel & Feedback
│       └── lib/
│           ├── auth-context.tsx # React Auth Context & Token Management
│           ├── api.ts           # Type-safe API Client with Fallback Mocks
│           └── types.ts         # TypeScript Domain Schemas
│
├── docs/                        # Architectural Specifications
│   ├── architecture.md          # System Architecture & Tech Matrix
│   ├── domain_model.md          # 12 Domain Boundaries & Invariants
│   ├── closed_loop.md           # Mathematical Formulations of the Loop
│   └── autonomous_execution.md  # Safety Guardrails & Governance Policies
│
└── scripts/
    └── seed.py                  # Standalone Zero-Docker Demo Seeder
```

---

## 🧪 Running Automated Tests

```bash
# Run all 16 backend domain and auth test cases
pytest apps/api/tests -v

# Run Next.js production build and static page validation
npm run build --prefix apps/web
```

---

## 📄 License

Distributed under the **MIT License**.
