# Local Development & Setup Guide

This guide walks you through setting up and running JobPilot locally.

---

## 1. Prerequisites

- Python 3.11+
- Node.js 18+ & npm
- PostgreSQL & Redis (or Docker Compose)

---

## 2. Quickstart with Docker Compose

```bash
# 1. Start all backend infrastructure (Postgres, Redis, Celery worker)
docker compose up -d --build

# 2. Run Database Migrations & Seed
apps/api/.venv/Scripts/python.exe -m alembic upgrade head
apps/api/.venv/Scripts/python.exe -m app.core.seed

# 3. Start Backend API Server
apps/api/.venv/Scripts/python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# 4. Start Next.js Frontend
cd apps/web
npm install
npm run dev
```

The application is now accessible at:
- **Frontend Web UI**: `http://localhost:3000`
- **Backend API & Swagger Docs**: `http://localhost:8000/docs`
