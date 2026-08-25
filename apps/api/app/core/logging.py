import contextvars
import json
import logging
import sys
import time
from datetime import datetime, timezone
from typing import Any, Dict

request_id_ctx: contextvars.ContextVar[str] = contextvars.ContextVar("request_id", default="")
task_id_ctx: contextvars.ContextVar[str] = contextvars.ContextVar("task_id", default="")


class StructuredJSONFormatter(logging.Formatter):
    """
    JSON log formatter ensuring machine-readable, structured logs
    without leaking sensitive tokens or credentials.
    """
    SENSITIVE_KEYS = {"password", "secret", "token", "authorization", "api_key", "secret_key"}

    def format(self, record: logging.LogRecord) -> str:
        log_entry: Dict[str, Any] = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }

        req_id = request_id_ctx.get()
        if req_id:
            log_entry["request_id"] = req_id

        task_id = task_id_ctx.get()
        if task_id:
            log_entry["task_id"] = task_id

        if hasattr(record, "extra_fields"):
            safe_extra = {
                k: ("[REDACTED]" if any(s in k.lower() for s in self.SENSITIVE_KEYS) else v)
                for k, v in record.extra_fields.items()
            }
            log_entry.update(safe_extra)

        if record.exc_info:
            log_entry["exception"] = self.formatException(record.exc_info)

        return json.dumps(log_entry)


def setup_logging(level: str = "INFO") -> None:
    """Configures root logger with structured JSON output."""
    root_logger = logging.getLogger()
    root_logger.setLevel(getattr(logging, level.upper(), logging.INFO))

    # Remove existing handlers
    for handler in root_logger.handlers[:]:
        root_logger.removeHandler(handler)

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(StructuredJSONFormatter())
    root_logger.addHandler(handler)


logger = logging.getLogger("jobpilot")
