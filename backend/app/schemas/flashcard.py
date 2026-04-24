from datetime import datetime
from enum import Enum
from typing import Annotated, Literal
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


class TypedAnswerTestOut(BaseModel):
    id: UUID
    lesson_id: UUID
    type: Literal["typed_answer"]
    question: str
    correct_answer: str
    explanation: str


class MultipleChoiceTestOut(BaseModel):
    id: UUID
    lesson_id: UUID
    type: Literal["multiple_choice"]
    question: str
    correct_answer: str
    explanation: str
    options: list[str] = Field(..., min_length=2, max_length=6)


FlashcardTestOut = Annotated[TypedAnswerTestOut | MultipleChoiceTestOut, Field(discriminator="type")]


class ReviewSessionOut(BaseModel):
    flashcards: list[FlashcardOut]
    tests: list[FlashcardTestOut]


class TypedAnswerSubmitRequest(BaseModel):
    answer: str


class MultipleChoiceSubmitRequest(BaseModel):
    selected_option: str


class TestAnswerResult(BaseModel):
    correct: bool
    correct_answer: str
    explanation: str
