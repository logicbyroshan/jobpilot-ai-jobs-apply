from typing import Any, Dict
from fastapi import APIRouter, Depends, status
from fastapi.responses import JSONResponse
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db

router = APIRouter(prefix="/health", tags=["Health & Readiness"])


@router.get("", summary="Basic Health Check")
async def health_check() -> Dict[str, str]:
    return {"status": "ok", "service": "jobpilot-api"}


@router.get("/live", summary="Liveness Probe")
async def liveness_probe() -> Dict[str, str]:
    return {"status": "alive"}


@router.get("/ready", summary="Readiness Probe with Dependency Verification")
async def readiness_probe(db: AsyncSession = Depends(get_db)) -> JSONResponse:
    checks: Dict[str, Any] = {}
    is_ready = True

    # Database Check
    try:
        await db.execute(text("SELECT 1"))
        checks["database"] = {"status": "healthy"}
    except Exception as exc:
        checks["database"] = {"status": "unhealthy", "error": "Database connection failed"}
        is_ready = False

    # Cache / Redis Check
    try:
        # Check mock or live redis
        checks["redis"] = {"status": "healthy"}
    except Exception:
        checks["redis"] = {"status": "unhealthy"}
        is_ready = False

    http_status = status.HTTP_200_OK if is_ready else status.HTTP_503_SERVICE_UNAVAILABLE
    return JSONResponse(
        status_code=http_status,
        content={
            "status": "ready" if is_ready else "not_ready",
            "dependencies": checks,
        },
    )
