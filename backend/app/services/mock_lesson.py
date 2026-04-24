from uuid import UUID, uuid4

from app.db.memory_store import LessonRecord, utcnow
from app.schemas.lesson import LessonGenerateRequest


def _title_from_text(text: str) -> str:
    line = text.strip().splitlines()[0] if text.strip() else "Untitled lesson"
    line = line.strip()
    if len(line) > 72:
        return line[:69] + "…"
    return line or "Untitled lesson"


def build_mock_lesson(user_id: UUID, payload: LessonGenerateRequest) -> LessonRecord:
    """Deterministic-enough mock lesson until a real LLM provider is wired in."""
    raw = payload.raw_text.strip()
    title = _title_from_text(raw)
    snippet = raw[:280] + ("…" if len(raw) > 280 else "")

    summary = (
        "This lesson breaks down your pasted text into a short overview you can scan "
        "before diving into details."
    )
    simple_explanation = (
        f"In simple terms: the core idea is about “{title}”. "
        "Focus on the main definition, why it matters, and one concrete takeaway you can reuse."
    )
    key_points = [
        "Identify the main concept and how it’s defined in your source text.",
        "Connect it to something you already know to make it stick.",
        "Write one sentence in your own words to check understanding.",
    ]
    example = (
        f"Example framing: if someone asked you to explain “{title}” in 30 seconds, "
        f"you could start with: “{snippet[:120]}…” and finish with why it’s useful."
    )

    return LessonRecord(
        id=uuid4(),
        user_id=user_id,
        raw_input_text=payload.raw_text,
        title=title,
        summary=summary,
        simple_explanation=simple_explanation,
        key_points=key_points,
        example=example,
        created_at=utcnow(),
    )
