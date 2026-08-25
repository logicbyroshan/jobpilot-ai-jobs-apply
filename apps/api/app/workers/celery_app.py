from celery import Celery
from app.core.config import settings

celery_app = Celery(
    "jobpilot_workers",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
    include=["app.workers.tasks"],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=300,
    task_routes={
        "app.workers.tasks.sync_source_task": {"queue": "source_sync"},
        "app.workers.tasks.ingest_job_source_task": {"queue": "job_ingestion"},
        "app.workers.tasks.calculate_match_task": {"queue": "matching"},
        "app.workers.tasks.detect_gaps_task": {"queue": "matching"},
        "app.workers.tasks.generate_learning_plan_task": {"queue": "learning"},
        "app.workers.tasks.evaluate_assessment_task": {"queue": "assessment"},
        "app.workers.tasks.send_notification_task": {"queue": "notifications"},
    },
)
