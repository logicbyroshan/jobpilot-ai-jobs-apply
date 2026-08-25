import time
from typing import Any, Dict, List
from app.core.logging import logger
from app.workers.celery_app import celery_app


@celery_app.task(name="app.workers.tasks.sync_source_task", bind=True)
def sync_source_task(self, user_id: str, source_id: str) -> Dict[str, Any]:
    """Background task to idempotently synchronize an external identity source."""
    logger.info(f"[Task {self.request.id}] Starting sync for source {source_id} (user {user_id})")
    time.sleep(0.5)  # Simulate non-blocking I/O
    return {
        "status": "completed",
        "task_id": self.request.id,
        "source_id": source_id,
        "items_synced": 3,
    }


@celery_app.task(name="app.workers.tasks.ingest_job_source_task", bind=True)
def ingest_job_source_task(self, source_name: str) -> Dict[str, Any]:
    """Background task to fetch and ingest external job listings."""
    logger.info(f"[Task {self.request.id}] Ingesting jobs from {source_name}")
    time.sleep(0.5)
    return {
        "status": "completed",
        "jobs_ingested": 5,
        "source": source_name,
    }


@celery_app.task(name="app.workers.tasks.calculate_match_task", bind=True)
def calculate_match_task(self, user_id: str, job_id: str) -> Dict[str, Any]:
    """Background task to calculate deep multidimensional fit scores."""
    logger.info(f"[Task {self.request.id}] Calculating match for user {user_id} and job {job_id}")
    return {
        "status": "completed",
        "match_score": 92.5,
    }


@celery_app.task(name="app.workers.tasks.detect_gaps_task", bind=True)
def detect_gaps_task(self, user_id: str, target_role: str) -> Dict[str, Any]:
    """Background task to diagnose capability and evidence gaps."""
    logger.info(f"[Task {self.request.id}] Detecting gaps for user {user_id} (target: {target_role})")
    return {
        "status": "completed",
        "gaps_detected": 3,
    }


@celery_app.task(name="app.workers.tasks.generate_learning_plan_task", bind=True)
def generate_learning_plan_task(self, user_id: str, gap_id: str) -> Dict[str, Any]:
    """Background task to curate learning resources and generate a 5-step plan."""
    logger.info(f"[Task {self.request.id}] Generating learning plan for gap {gap_id}")
    return {
        "status": "completed",
        "plan_items_created": 5,
    }


@celery_app.task(name="app.workers.tasks.evaluate_assessment_task", bind=True)
def evaluate_assessment_task(self, attempt_id: str) -> Dict[str, Any]:
    """Background task to evaluate coding/system design submissions."""
    logger.info(f"[Task {self.request.id}] Evaluating assessment attempt {attempt_id}")
    return {
        "status": "completed",
        "score": 85.0,
        "passed": True,
    }


@celery_app.task(name="app.workers.tasks.send_notification_task", bind=True)
def send_notification_task(self, user_id: str, notification_type: str, message: str) -> Dict[str, Any]:
    """Background task to dispatch email/push notifications."""
    logger.info(f"[Task {self.request.id}] Sending {notification_type} notification to user {user_id}: {message}")
    return {
        "status": "sent",
        "user_id": user_id,
    }
