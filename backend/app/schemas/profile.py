from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel


class RecentActivityItem(BaseModel):
    kind: str
    label: str
    at: datetime


class ProfileSummaryOut(BaseModel):
    user_id: UUID
    total_lessons: int
    total_flashcards: int
    streak: int
    recent_activity: list[RecentActivityItem]
