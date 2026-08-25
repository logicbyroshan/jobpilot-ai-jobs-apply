from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class SourceBase(BaseModel):
    source_type: str
    display_name: str
    source_url: Optional[str] = None
    metadata_json: dict = {}


class SourceCreate(SourceBase):
    pass


class SourceConnectRequest(BaseModel):
    source_url: Optional[str] = None
    mock_token: Optional[str] = "mock_auth_token_xyz"


class SourceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    user_id: str
    source_type: str
    display_name: str
    status: str
    source_url: Optional[str] = None
    last_synced_at: Optional[datetime] = None
    sync_status_message: Optional[str] = None
    metadata_json: dict = {}
    created_at: datetime
    updated_at: datetime


class SourceSyncResponse(BaseModel):
    source_id: str
    status: str
    message: str
    synced_at: datetime
    items_detected: int
