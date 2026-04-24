from dataclasses import dataclass, field
from datetime import date, datetime, timezone
from threading import Lock
from uuid import UUID, uuid4


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


@dataclass
class LessonRecord:
    id: UUID
    user_id: UUID
    raw_input_text: str
    title: str
    summary: str | None
    simple_explanation: str
    key_points: list[str]
    example: str
    created_at: datetime


@dataclass
class FlashcardRecord:
    id: UUID
    user_id: UUID
    lesson_id: UUID
    front: str
    back: str
    difficulty: str
    review_count: int
    next_review_at: datetime
    created_at: datetime


@dataclass
class LessonTestRecord:
    id: UUID
    user_id: UUID
    lesson_id: UUID
    type: str
    question: str
    correct_answer: str
    explanation: str
    options: list[str] | None
    created_at: datetime


@dataclass
class ReviewRecord:
    id: UUID
    flashcard_id: UUID
    user_id: UUID
    rating: str
    reviewed_at: datetime


@dataclass
class DailyProgressRecord:
    id: UUID
    user_id: UUID
    day: date
    lessons_created: int = 0
    flashcards_reviewed: int = 0
    streak_value: int = 0


@dataclass
class MemoryStore:
    lessons: dict[UUID, LessonRecord] = field(default_factory=dict)
    flashcards: dict[UUID, FlashcardRecord] = field(default_factory=dict)
    lesson_tests: dict[UUID, LessonTestRecord] = field(default_factory=dict)
    reviews: list[ReviewRecord] = field(default_factory=list)
    daily_progress: dict[tuple[UUID, date], DailyProgressRecord] = field(default_factory=dict)
    _lock: Lock = field(default_factory=Lock, repr=False)

    def save_lesson(self, lesson: LessonRecord) -> None:
        with self._lock:
            self.lessons[lesson.id] = lesson

    def get_lesson(self, lesson_id: UUID) -> LessonRecord | None:
        with self._lock:
            return self.lessons.get(lesson_id)

    def list_lessons_for_user(self, user_id: UUID) -> list[LessonRecord]:
        with self._lock:
            rows = [l for l in self.lessons.values() if l.user_id == user_id]
            rows.sort(key=lambda l: l.created_at, reverse=True)
            return rows

    def save_flashcards(self, cards: list[FlashcardRecord]) -> None:
        with self._lock:
            for c in cards:
                self.flashcards[c.id] = c

    def list_flashcards_for_user(self, user_id: UUID) -> list[FlashcardRecord]:
        with self._lock:
            return [c for c in self.flashcards.values() if c.user_id == user_id]

    def get_flashcard(self, flashcard_id: UUID) -> FlashcardRecord | None:
        with self._lock:
            return self.flashcards.get(flashcard_id)

    def save_lesson_tests(self, tests: list[LessonTestRecord]) -> None:
        with self._lock:
            for test in tests:
                self.lesson_tests[test.id] = test

    def list_tests_for_lesson(self, user_id: UUID, lesson_id: UUID) -> list[LessonTestRecord]:
        with self._lock:
            rows = [t for t in self.lesson_tests.values() if t.user_id == user_id and t.lesson_id == lesson_id]
            rows.sort(key=lambda t: t.created_at)
            return rows

    def list_tests_for_lessons(self, user_id: UUID, lesson_ids: set[UUID]) -> list[LessonTestRecord]:
        with self._lock:
            rows = [t for t in self.lesson_tests.values() if t.user_id == user_id and t.lesson_id in lesson_ids]
            rows.sort(key=lambda t: t.created_at)
            return rows

    def get_lesson_test(self, test_id: UUID) -> LessonTestRecord | None:
        with self._lock:
            return self.lesson_tests.get(test_id)

    def update_flashcard(self, card: FlashcardRecord) -> None:
        with self._lock:
            self.flashcards[card.id] = card

    def append_review(self, review: ReviewRecord) -> None:
        with self._lock:
            self.reviews.append(review)

    def bump_lessons_created(self, user_id: UUID, day: date) -> None:
        with self._lock:
            key = (user_id, day)
            row = self.daily_progress.get(key)
            if row is None:
                row = DailyProgressRecord(id=uuid4(), user_id=user_id, day=day)
                self.daily_progress[key] = row
            row.lessons_created += 1
            row.streak_value = self._compute_streak_unlocked(user_id, day)

    def bump_flashcards_reviewed(self, user_id: UUID, day: date) -> None:
        with self._lock:
            key = (user_id, day)
            row = self.daily_progress.get(key)
            if row is None:
                row = DailyProgressRecord(id=uuid4(), user_id=user_id, day=day)
                self.daily_progress[key] = row
            row.flashcards_reviewed += 1
            row.streak_value = self._compute_streak_unlocked(user_id, day)

    def current_streak(self, user_id: UUID) -> int:
        with self._lock:
            today = utcnow().date()
            return self._compute_streak_unlocked(user_id, today)

    def _compute_streak_unlocked(self, user_id: UUID, end_day: date) -> int:
        """Count consecutive days ending at end_day with any learning activity."""
        streak = 0
        d = end_day
        while True:
            row = self.daily_progress.get((user_id, d))
            active = row is not None and (row.lessons_created > 0 or row.flashcards_reviewed > 0)
            if not active:
                break
            streak += 1
            d = d.fromordinal(d.toordinal() - 1)
        return streak

    def recent_activity(self, user_id: UUID, limit: int = 8) -> list[tuple[str, str, datetime]]:
        with self._lock:
            events: list[tuple[str, str, datetime]] = []
            for lesson in self.lessons.values():
                if lesson.user_id != user_id:
                    continue
                events.append(("lesson", f"Lesson: {lesson.title}", lesson.created_at))
            for rev in reversed(self.reviews):
                if rev.user_id != user_id:
                    continue
                card = self.flashcards.get(rev.flashcard_id)
                label = "Reviewed a card"
                if card:
                    label = f"Review: {card.front[:48]}…" if len(card.front) > 48 else f"Review: {card.front}"
                events.append(("review", label, rev.reviewed_at))
            events.sort(key=lambda e: e[2], reverse=True)
            return events[:limit]


store = MemoryStore()
