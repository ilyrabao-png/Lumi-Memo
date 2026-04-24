from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException

from app.api.deps import get_user_id
from app.db import memory_store
from app.schemas.lesson import LessonGenerateRequest, LessonOut
from app.services.mock_lesson import build_mock_lesson

router = APIRouter()


def _to_lesson_out(row: memory_store.LessonRecord) -> LessonOut:
    return LessonOut(
        id=row.id,
        user_id=row.user_id,
        title=row.title,
        summary=row.summary,
        simple_explanation=row.simple_explanation,
        key_points=row.key_points,
        example=row.example,
        raw_input_text=row.raw_input_text,
        created_at=row.created_at,
    )


@router.post("/generate", response_model=LessonOut)
def generate_lesson(payload: LessonGenerateRequest, user_id: UUID = Depends(get_user_id)) -> LessonOut:
    lesson = build_mock_lesson(user_id, payload)
    memory_store.store.save_lesson(lesson)
    memory_store.store.bump_lessons_created(user_id, lesson.created_at.date())
    return _to_lesson_out(lesson)


@router.get("", response_model=list[LessonOut])
def list_lessons(user_id: UUID = Depends(get_user_id)) -> list[LessonOut]:
    rows = memory_store.store.list_lessons_for_user(user_id)
    return [_to_lesson_out(r) for r in rows]


@router.get("/{lesson_id}", response_model=LessonOut)
def get_lesson(lesson_id: UUID, user_id: UUID = Depends(get_user_id)) -> LessonOut:
    row = memory_store.store.get_lesson(lesson_id)
    if row is None or row.user_id != user_id:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return _to_lesson_out(row)
