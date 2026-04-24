from datetime import datetime
from enum import Enum
from uuid import UUID

from pydantic import BaseModel, Field


class ReviewRating(str, Enum):
    forgot = "forgot"
    hard = "hard"
    good = "good"
    easy = "easy"


class FlashcardGenerateRequest(BaseModel):
    lesson_id: UUID


class FlashcardOut(BaseModel):
    id: UUID
    lesson_id: UUID
    front: str
    back: str
    difficulty: str
    review_count: int
    next_review_at: datetime
    created_at: datetime


class FlashcardReviewRequest(BaseModel):
    rating: ReviewRating


class FlashcardReviewResult(BaseModel):
    flashcard: FlashcardOut
