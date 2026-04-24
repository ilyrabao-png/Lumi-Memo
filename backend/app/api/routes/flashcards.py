from uuid import UUID, uuid4

from fastapi import APIRouter, Body, Depends, HTTPException

from app.api.deps import get_user_id
from app.core.config import Settings, get_settings
from app.db import memory_store
from app.db.memory_store import FlashcardRecord, LessonTestRecord, ReviewRecord, utcnow
from app.schemas.flashcard import (
    FlashcardGenerateRequest,
    FlashcardOut,
    FlashcardReviewRequest,
    FlashcardReviewResult,
    MultipleChoiceSubmitRequest,
    MultipleChoiceTestOut,
    ReviewSessionOut,
    TestAnswerResult,
    TypedAnswerSubmitRequest,
    TypedAnswerTestOut,
)
from app.services.ai_flashcards import AiGenerationError, AiGradingError, generate_flashcards_and_tests, grade_typed_answer_with_ai
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


def _to_test_out(row: LessonTestRecord) -> TypedAnswerTestOut | MultipleChoiceTestOut:
    if row.type == "multiple_choice":
        return MultipleChoiceTestOut(
            id=row.id,
            lesson_id=row.lesson_id,
            type="multiple_choice",
            question=row.question,
            correct_answer=row.correct_answer,
            explanation=row.explanation,
            options=row.options or [],
        )
    return TypedAnswerTestOut(
        id=row.id,
        lesson_id=row.lesson_id,
        type="typed_answer",
        question=row.question,
        correct_answer=row.correct_answer,
        explanation=row.explanation,
    )


@router.post("/generate", response_model=list[FlashcardOut])
def generate_flashcards(
    payload: FlashcardGenerateRequest,
    user_id: UUID = Depends(get_user_id),
    settings: Settings = Depends(get_settings),
) -> list[FlashcardOut]:
    lesson = memory_store.store.get_lesson(payload.lesson_id)
    if lesson is None or lesson.user_id != user_id:
        raise HTTPException(status_code=404, detail="Lesson not found")

    existing = [c for c in memory_store.store.list_flashcards_for_user(user_id) if c.lesson_id == lesson.id]
    if existing:
        return [_to_flashcard_out(c) for c in existing]

    try:
        cards, tests = generate_flashcards_and_tests(user_id=user_id, lesson=lesson, settings=settings)
    except AiGenerationError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    memory_store.store.save_flashcards(cards)
    memory_store.store.save_lesson_tests(tests)
    return [_to_flashcard_out(c) for c in cards]


@router.get("/due-today", response_model=list[FlashcardOut])
def due_today(user_id: UUID = Depends(get_user_id)) -> list[FlashcardOut]:
    now = utcnow()
    end = utc_end_of_day(now)
    due = [c for c in memory_store.store.list_flashcards_for_user(user_id) if c.next_review_at <= end]
    due.sort(key=lambda c: c.next_review_at)
    return [_to_flashcard_out(c) for c in due]


@router.get("/review-session", response_model=ReviewSessionOut)
def review_session(user_id: UUID = Depends(get_user_id)) -> ReviewSessionOut:
    now = utcnow()
    end = utc_end_of_day(now)
    due = [c for c in memory_store.store.list_flashcards_for_user(user_id) if c.next_review_at <= end]
    due.sort(key=lambda c: c.next_review_at)
    lesson_ids = {card.lesson_id for card in due}
    tests = memory_store.store.list_tests_for_lessons(user_id, lesson_ids) if lesson_ids else []
    return ReviewSessionOut(
        flashcards=[_to_flashcard_out(c) for c in due],
        tests=[_to_test_out(t) for t in tests],
    )


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


@router.post("/tests/{test_id}/answer", response_model=TestAnswerResult)
def answer_test(
    test_id: UUID,
    payload: TypedAnswerSubmitRequest | MultipleChoiceSubmitRequest = Body(...),
    user_id: UUID = Depends(get_user_id),
    settings: Settings = Depends(get_settings),
) -> TestAnswerResult:
    test = memory_store.store.get_lesson_test(test_id)
    if test is None or test.user_id != user_id:
        raise HTTPException(status_code=404, detail="Test not found")

    if test.type == "typed_answer":
        if not isinstance(payload, TypedAnswerSubmitRequest):
            raise HTTPException(status_code=422, detail="Typed-answer tests require an answer.")
        try:
            correct = grade_typed_answer_with_ai(
                question=test.question,
                correct_answer=test.correct_answer,
                learner_answer=payload.answer,
                settings=settings,
            )
        except AiGradingError as exc:
            raise HTTPException(status_code=502, detail=str(exc)) from exc
    elif test.type == "multiple_choice":
        if not isinstance(payload, MultipleChoiceSubmitRequest):
            raise HTTPException(status_code=422, detail="Multiple-choice tests require a selected_option.")
        correct = payload.selected_option.strip().casefold() == test.correct_answer.strip().casefold()
    else:
        raise HTTPException(status_code=500, detail="Unsupported test type.")

    return TestAnswerResult(correct=correct, correct_answer=test.correct_answer, explanation=test.explanation)
