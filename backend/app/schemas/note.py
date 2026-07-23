from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class NoteCreate(BaseModel):
    note_text: str
    action_type: str | None = None
    author: str | None = None


class NoteResponse(BaseModel):
    id: UUID
    complaint_id: UUID
    note_text: str
    action_type: str | None = None
    author: str | None = None
    created_at: datetime

    class Config:
        from_attributes = True


class StatusUpdate(BaseModel):
    status: str
