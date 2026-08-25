from datetime import datetime, timezone
from typing import Any, Callable, Dict, List, Type
from pydantic import BaseModel, Field

from app.core.logging import logger


class DomainEvent(BaseModel):
    event_id: str = Field(default_factory=lambda: str(datetime.now(timezone.utc).timestamp()))
    event_type: str
    occurred_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    payload: Dict[str, Any] = {}


# Concrete Domain Events
class ProfileUpdated(DomainEvent):
    event_type: str = "ProfileUpdated"


class SourceSynced(DomainEvent):
    event_type: str = "SourceSynced"


class EvidenceAdded(DomainEvent):
    event_type: str = "EvidenceAdded"


class SkillEvidenceUpdated(DomainEvent):
    event_type: str = "SkillEvidenceUpdated"


class CareerGoalCreated(DomainEvent):
    event_type: str = "CareerGoalCreated"


class JobDiscovered(DomainEvent):
    event_type: str = "JobDiscovered"


class JobUpdated(DomainEvent):
    event_type: str = "JobUpdated"


class MatchCalculated(DomainEvent):
    event_type: str = "MatchCalculated"


class GapDetected(DomainEvent):
    event_type: str = "GapDetected"


class LearningPlanCreated(DomainEvent):
    event_type: str = "LearningPlanCreated"


class LearningItemCompleted(DomainEvent):
    event_type: str = "LearningItemCompleted"


class AssessmentCompleted(DomainEvent):
    event_type: str = "AssessmentCompleted"


class SkillVerified(DomainEvent):
    event_type: str = "SkillVerified"


class ApplicationSubmitted(DomainEvent):
    event_type: str = "ApplicationSubmitted"


class ApplicationStatusChanged(DomainEvent):
    event_type: str = "ApplicationStatusChanged"


class OutcomeRecorded(DomainEvent):
    event_type: str = "OutcomeRecorded"


class EventDispatcher:
    """In-process and worker-ready domain event dispatcher."""
    _subscribers: Dict[str, List[Callable[[DomainEvent], Any]]] = {}

    @classmethod
    def subscribe(cls, event_type: str, handler: Callable[[DomainEvent], Any]) -> None:
        if event_type not in cls._subscribers:
            cls._subscribers[event_type] = []
        cls._subscribers[event_type].append(handler)

    @classmethod
    async def dispatch(cls, event: DomainEvent) -> None:
        logger.info(f"Dispatched Domain Event [{event.event_type}]: {event.payload}")
        handlers = cls._subscribers.get(event.event_type, [])
        for handler in handlers:
            try:
                res = handler(event)
                if hasattr(res, "__await__"):
                    await res
            except Exception as e:
                logger.error(f"Error handling event {event.event_type}: {e}", exc_info=True)
