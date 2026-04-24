from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class LessonGenerateRequest(BaseModel):
    raw_text: str = Field(..., min_length=1, description="Pasted source text for the lesson")


class LessonKeyPoint(BaseModel):
    content: str


class LessonOut(BaseModel):
    id: UUID
    user_id: UUID
    title: str
    summary: str | None = None
    simple_explanation: str
    key_points: list[str] = Field(..., min_length=3, max_length=3)
    example: str
    raw_input_text: str
    created_at: datetime
