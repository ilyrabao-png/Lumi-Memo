from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, HTTPException

from app.api.deps import get_user_id
from app.db import memory_store
from app.db.memory_store import FlashcardRecord, ReviewRecord, utcnow
from app.schemas.flashcard import (
    FlashcardGenerateRequest,
    FlashcardOut,
    FlashcardReviewRequest,
    FlashcardReviewResult,
)
from app.services.mock_flashcards import build_mock_flashcards
from app.services.scheduling import compute_next_review_at, utc_end_of_day

router = APIRouter()


def _to_flashcard_out(row: FlashcardRecord) -> FlashcardOut:
    return FlashcardOut(
        id=row.id,
        lesson_id=row.lesson_id,
        front=row.front,
        back=row.back,
        difficulty=row.difficulty,
        review_count=row.review_count,
        next_review_at=row.next_review_at,
        created_at=row.created_at,
    )


@router.post("/generate", response_model=list[FlashcardOut])
def generate_flashcards(
    payload: FlashcardGenerateRequest,
    user_id: UUID = Depends(get_user_id),
) -> list[FlashcardOut]:
    lesson = memory_store.store.get_lesson(payload.lesson_id)
    if lesson is None or lesson.user_id != user_id:
        raise HTTPException(status_code=404, detail="Lesson not found")

    existing = [c for c in memory_store.store.list_flashcards_for_user(user_id) if c.lesson_id == lesson.id]
    if existing:
        return [_to_flashcard_out(c) for c in existing]

    cards = build_mock_flashcards(user_id, lesson)
    memory_store.store.save_flashcards(cards)
    return [_to_flashcard_out(c) for c in cards]


@router.get("/due-today", response_model=list[FlashcardOut])
def due_today(user_id: UUID = Depends(get_user_id)) -> list[FlashcardOut]:
    now = utcnow()
    end = utc_end_of_day(now)
    due = [c for c in memory_store.store.list_flashcards_for_user(user_id) if c.next_review_at <= end]
    due.sort(key=lambda c: c.next_review_at)
    return [_to_flashcard_out(c) for c in due]


@router.post("/{flashcard_id}/review", response_model=FlashcardReviewResult)
def review_flashcard(
    flashcard_id: UUID,
    payload: FlashcardReviewRequest,
    user_id: UUID = Depends(get_user_id),
) -> FlashcardReviewResult:
    card = memory_store.store.get_flashcard(flashcard_id)
    if card is None or card.user_id != user_id:
        raise HTTPException(status_code=404, detail="Flashcard not found")

    now = utcnow()
    card.review_count += 1
    card.next_review_at = compute_next_review_at(now, payload.rating)
    memory_store.store.update_flashcard(card)

    memory_store.store.append_review(
        ReviewRecord(
            id=uuid4(),
            flashcard_id=card.id,
            user_id=user_id,
            rating=payload.rating.value,
            reviewed_at=now,
        )
    )
    memory_store.store.bump_flashcards_reviewed(user_id, now.date())

    return FlashcardReviewResult(flashcard=_to_flashcard_out(card))
