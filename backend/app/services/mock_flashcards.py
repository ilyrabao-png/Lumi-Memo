from uuid import UUID, uuid4

from app.db.memory_store import FlashcardRecord, LessonRecord, utcnow
from app.services.scheduling import utc_start_of_day


def build_mock_flashcards(user_id: UUID, lesson: LessonRecord) -> list[FlashcardRecord]:
    """Creates five flashcards from a lesson (mock until LLM-backed generation exists)."""
    now = utcnow()
    due = utc_start_of_day(now)

    templates: list[tuple[str, str, str]] = [
        (
            f"What is the main topic of: “{lesson.title}”?",
            lesson.summary,
            "easy",
        ),
        (
            "Explain the core idea in plain language.",
            lesson.simple_explanation,
            "medium",
        ),
        (
            "Name one key point from the lesson.",
            lesson.key_points[0],
            "medium",
        ),
        (
            "Name another key point from the lesson.",
            lesson.key_points[1],
            "medium",
        ),
        (
            "Give a quick example application.",
            lesson.example,
            "hard",
        ),
    ]

    cards: list[FlashcardRecord] = []
    for front, back, difficulty in templates:
        cards.append(
            FlashcardRecord(
                id=uuid4(),
                user_id=user_id,
                lesson_id=lesson.id,
                front=front,
                back=back,
                difficulty=difficulty,
                review_count=0,
                next_review_at=due,
                created_at=now,
            )
        )
    return cards
