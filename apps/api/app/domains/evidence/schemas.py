from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class EvidenceBase(BaseModel):
    source_type: str
    evidence_type: str
    external_id: Optional[str] = None
    title: str
    description: Optional[str] = None
    confidence: float = 0.9
    raw_payload_json: dict = {}
    metadata_json: dict = {}


class EvidenceCreate(EvidenceBase):
    source_id: Optional[str] = None


class EvidenceResponse(EvidenceBase):
    model_config = ConfigDict(from_attributes=True)
    id: str
    user_id: str
    source_id: Optional[str] = None
    observed_at: datetime
    created_at: datetime
    updated_at: datetime
