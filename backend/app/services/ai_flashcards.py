import json
from typing import Annotated, Any, Literal
from uuid import UUID, uuid4

import httpx
from pydantic import BaseModel, Field, ValidationError, field_validator, model_validator

from app.core.config import Settings
from app.db.memory_store import FlashcardRecord, LessonRecord, LessonTestRecord, utcnow
from app.services.scheduling import utc_start_of_day


OPENROUTER_CHAT_COMPLETIONS_URL = "https://openrouter.ai/api/v1/chat/completions"
RAW_TEXT_EXCERPT_LIMIT = 6000


class AiGenerationError(RuntimeError):
    """Controlled error raised when AI generation cannot produce valid study content."""


class AiGradingError(RuntimeError):
    """Controlled error raised when AI grading cannot complete."""


class GeneratedFlashcard(BaseModel):
    front: str = Field(..., min_length=1)
    back: str = Field(..., min_length=1)

    @field_validator("front", "back")
    @classmethod
    def _strip_text(cls, v: str) -> str:
        text = v.strip()
        if not text:
            raise ValueError("flashcard fields cannot be empty")
        return text


class GeneratedTypedAnswerTest(BaseModel):
    type: Literal["typed_answer"]
    source_flashcard_index: int = Field(..., ge=0)
    question: str = Field(..., min_length=1)
    correct_answer: str = Field(..., min_length=1)
    explanation: str = Field(..., min_length=1)

    @field_validator("question", "correct_answer", "explanation")
    @classmethod
    def _strip_text(cls, v: str) -> str:
        text = v.strip()
        if not text:
            raise ValueError("test fields cannot be empty")
        return text


class GeneratedMultipleChoiceTest(BaseModel):
    type: Literal["multiple_choice"]
    source_flashcard_index: int = Field(..., ge=0)
    question: str = Field(..., min_length=1)
    correct_answer: str = Field(..., min_length=1)
    explanation: str = Field(..., min_length=1)
    options: list[str] = Field(..., min_length=2, max_length=6)

    @field_validator("question", "correct_answer", "explanation")
    @classmethod
    def _strip_text(cls, v: str) -> str:
        text = v.strip()
        if not text:
            raise ValueError("test fields cannot be empty")
        return text

    @field_validator("options")
    @classmethod
    def _validate_options(cls, v: list[str]) -> list[str]:
        options = [option.strip() for option in v]
        if any(not option for option in options):
            raise ValueError("multiple-choice options cannot be empty")
        normalized = [option.casefold() for option in options]
        if len(set(normalized)) != len(normalized):
            raise ValueError("multiple-choice options cannot contain duplicates")
        return options

    @model_validator(mode="after")
    def _validate_correct_answer(self) -> "GeneratedMultipleChoiceTest":
        self.correct_answer = self.correct_answer.strip()
        return self


GeneratedTest = Annotated[GeneratedTypedAnswerTest | GeneratedMultipleChoiceTest, Field(discriminator="type")]


class GeneratedStudySet(BaseModel):
    flashcards: list[GeneratedFlashcard] = Field(..., min_length=3, max_length=10)
    tests: list[GeneratedTest] = Field(..., min_length=3, max_length=10)

    @model_validator(mode="after")
    def _validate_study_set(self) -> "GeneratedStudySet":
        fronts = [card.front.casefold() for card in self.flashcards]
        backs = [card.back.casefold() for card in self.flashcards]
        questions = [test.question.casefold() for test in self.tests]
        if len(fronts) != len(set(fronts)):
            raise ValueError("flashcards cannot contain duplicate fronts")
        if len(backs) != len(set(backs)):
            raise ValueError("flashcards cannot contain duplicate backs")
        if len(questions) != len(set(questions)):
            raise ValueError("tests cannot contain duplicate questions")
        for test in self.tests:
            if test.source_flashcard_index >= len(self.flashcards):
                raise ValueError("test source_flashcard_index is outside the flashcard list")
            source = self.flashcards[test.source_flashcard_index]
            test.question = source.front
            test.correct_answer = source.back
            if isinstance(test, GeneratedMultipleChoiceTest):
                test.options = _build_flashcard_back_options(self.flashcards, source.back)
        return self


class TypedAnswerGrade(BaseModel):
    correct: bool


def _build_flashcard_back_options(cards: list[GeneratedFlashcard], correct_answer: str) -> list[str]:
    options = [correct_answer]
    seen = {correct_answer.casefold()}
    for card in cards:
        back = card.back.strip()
        if back.casefold() in seen:
            continue
        options.append(back)
        seen.add(back.casefold())
        if len(options) >= 4:
            break
    return options


def generate_flashcards_and_tests(
    *,
    user_id: UUID,
    lesson: LessonRecord,
    settings: Settings,
) -> tuple[list[FlashcardRecord], list[LessonTestRecord]]:
    if not settings.openrouter_api_key:
        raise AiGenerationError("OPENROUTER_API_KEY is required to generate AI flashcards and tests.")

    study_set = _request_study_set(lesson=lesson, settings=settings)
    return _to_records(user_id=user_id, lesson=lesson, study_set=study_set)


def grade_typed_answer_with_ai(
    *,
    question: str,
    correct_answer: str,
    learner_answer: str,
    settings: Settings,
) -> bool:
    if learner_answer.strip().casefold() == correct_answer.strip().casefold():
        return True

    if not settings.openrouter_api_key:
        raise AiGradingError("OPENROUTER_API_KEY is required to grade typed answers.")

    payload = {
        "model": settings.openrouter_model,
        "messages": [
            {
                "role": "system",
                "content": (
                    "You grade short flashcard test answers. "
                    "Return only valid JSON matching the schema. "
                    "Mark correct when the learner answer has the same meaning as the expected answer, "
                    "including equivalent lists written with commas, spaces, or words like 'and'. "
                    "Do not require identical wording. Do not award correctness for missing or contradictory facts."
                ),
            },
            {
                "role": "user",
                "content": (
                    f"Question:\n{question}\n\n"
                    f"Expected answer:\n{correct_answer}\n\n"
                    f"Learner answer:\n{learner_answer}"
                ),
            },
        ],
        "temperature": 0,
        "response_format": {
            "type": "json_schema",
            "json_schema": {
                "name": "lumi_memo_typed_answer_grade",
                "strict": True,
                "schema": {
                    "type": "object",
                    "properties": {"correct": {"type": "boolean"}},
                    "required": ["correct"],
                    "additionalProperties": False,
                },
            },
        },
    }

    try:
        raw_content = _post_openrouter_json(settings=settings, payload=payload)
        return TypedAnswerGrade.model_validate(raw_content).correct
    except AiGenerationError as exc:
        raise AiGradingError(str(exc)) from exc
    except ValidationError as exc:
        raise AiGradingError("OpenRouter returned invalid grading content.") from exc


def _request_study_set(*, lesson: LessonRecord, settings: Settings) -> GeneratedStudySet:
    payload = {
        "model": settings.openrouter_model,
        "messages": [
            {
                "role": "system",
                "content": (
                    "You generate concise study material for a flashcard app. "
                    "Return only valid JSON matching the provided schema. "
                    "Create broad lesson coverage, avoid duplicates, and do not invent facts beyond the lesson."
                ),
            },
            {"role": "user", "content": _build_prompt(lesson)},
        ],
        "temperature": 0.3,
        "response_format": {
            "type": "json_schema",
            "json_schema": {
                "name": "lumi_memo_study_set",
                "strict": True,
                "schema": _study_set_schema(),
            },
        },
    }

    try:
        raw_content = _post_openrouter_json(settings=settings, payload=payload)
        return GeneratedStudySet.model_validate(raw_content)
    except ValidationError as exc:
        raise AiGenerationError(f"OpenRouter returned invalid study content: {exc.errors()[0]['msg']}") from exc


def _post_openrouter_json(*, settings: Settings, payload: dict[str, Any]) -> Any:
    headers = {
        "Authorization": f"Bearer {settings.openrouter_api_key}",
        "Content-Type": "application/json",
    }
    if settings.openrouter_site_url:
        headers["HTTP-Referer"] = settings.openrouter_site_url
    if settings.openrouter_app_title:
        headers["X-Title"] = settings.openrouter_app_title

    try:
        with httpx.Client(timeout=settings.openrouter_timeout_seconds) as client:
            response = client.post(OPENROUTER_CHAT_COMPLETIONS_URL, headers=headers, json=payload)
            response.raise_for_status()
    except httpx.TimeoutException as exc:
        raise AiGenerationError("OpenRouter request timed out.") from exc
    except httpx.HTTPStatusError as exc:
        detail = _openrouter_error_detail(exc.response)
        raise AiGenerationError(f"OpenRouter request failed: {detail}") from exc
    except httpx.HTTPError as exc:
        raise AiGenerationError(f"OpenRouter request failed: {exc}") from exc

    try:
        body = response.json()
        content = body["choices"][0]["message"]["content"]
    except (KeyError, IndexError, TypeError, ValueError) as exc:
        raise AiGenerationError("OpenRouter returned an unexpected response shape.") from exc

    if isinstance(content, str):
        try:
            raw_content: Any = json.loads(content)
        except json.JSONDecodeError as exc:
            raise AiGenerationError("OpenRouter returned malformed JSON study content.") from exc
    elif isinstance(content, dict):
        raw_content = content
    else:
        raise AiGenerationError("OpenRouter returned empty study content.")

    return raw_content


def _build_prompt(lesson: LessonRecord) -> str:
    raw_excerpt = lesson.raw_input_text[:RAW_TEXT_EXCERPT_LIMIT]
    key_points = "\n".join(f"- {point}" for point in lesson.key_points)
    return f"""
Generate a study set for this lesson.

Requirements:
- Create 3 to 10 flashcards.
- Create 3 to 10 tests.
- Test types must be typed_answer or multiple_choice.
- Every test must come only from one generated flashcard.
- Each test's source_flashcard_index must point to that flashcard's 0-based index in the flashcards array.
- Each test question must exactly equal its source flashcard front.
- Each test correct_answer must exactly equal its source flashcard back.
- Each typed_answer test must have question, correct_answer, and explanation.
- Each multiple_choice test must have question, correct_answer, explanation, and 2 to 6 options.
- Multiple-choice options must be unique, must all be generated flashcard backs, and exactly one option must equal correct_answer.
- The explanation should help the learner understand why the correct answer is right.
- Cover the lesson broadly and avoid duplicate cards or test questions.

Lesson title:
{lesson.title}

Summary:
{lesson.summary or "No separate summary was generated for this theory/concept lesson."}

Simple explanation:
{lesson.simple_explanation}

Key points:
{key_points}

Example:
{lesson.example}

Raw source excerpt:
{raw_excerpt}
""".strip()


def _study_set_schema() -> dict[str, Any]:
    text_field = {"type": "string", "minLength": 1}
    typed_answer = {
        "type": "object",
        "properties": {
            "type": {"const": "typed_answer"},
            "source_flashcard_index": {"type": "integer", "minimum": 0},
            "question": text_field,
            "correct_answer": text_field,
            "explanation": text_field,
        },
        "required": ["type", "source_flashcard_index", "question", "correct_answer", "explanation"],
        "additionalProperties": False,
    }
    multiple_choice = {
        "type": "object",
        "properties": {
            "type": {"const": "multiple_choice"},
            "source_flashcard_index": {"type": "integer", "minimum": 0},
            "question": text_field,
            "correct_answer": text_field,
            "explanation": text_field,
            "options": {
                "type": "array",
                "items": text_field,
                "minItems": 2,
                "maxItems": 6,
            },
        },
        "required": ["type", "source_flashcard_index", "question", "correct_answer", "explanation", "options"],
        "additionalProperties": False,
    }
    return {
        "type": "object",
        "properties": {
            "flashcards": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "front": text_field,
                        "back": text_field,
                    },
                    "required": ["front", "back"],
                    "additionalProperties": False,
                },
                "minItems": 3,
                "maxItems": 10,
            },
            "tests": {
                "type": "array",
                "items": {"anyOf": [typed_answer, multiple_choice]},
                "minItems": 3,
                "maxItems": 10,
            },
        },
        "required": ["flashcards", "tests"],
        "additionalProperties": False,
    }


def _openrouter_error_detail(response: httpx.Response) -> str:
    try:
        body = response.json()
    except ValueError:
        return f"{response.status_code} {response.text[:200]}"
    if isinstance(body, dict):
        error = body.get("error")
        if isinstance(error, dict) and error.get("message"):
            return str(error["message"])
        if body.get("message"):
            return str(body["message"])
    return f"{response.status_code} {response.text[:200]}"


def _to_records(
    *,
    user_id: UUID,
    lesson: LessonRecord,
    study_set: GeneratedStudySet,
) -> tuple[list[FlashcardRecord], list[LessonTestRecord]]:
    now = utcnow()
    due = utc_start_of_day(now)
    cards = [
        FlashcardRecord(
            id=uuid4(),
            user_id=user_id,
            lesson_id=lesson.id,
            front=card.front,
            back=card.back,
            difficulty="ai",
            review_count=0,
            next_review_at=due,
            created_at=now,
        )
        for card in study_set.flashcards
    ]
    tests = [
        LessonTestRecord(
            id=uuid4(),
            user_id=user_id,
            lesson_id=lesson.id,
            type=test.type,
            question=test.question,
            correct_answer=test.correct_answer,
            explanation=test.explanation,
            options=test.options if isinstance(test, GeneratedMultipleChoiceTest) else None,
            created_at=now,
        )
        for test in study_set.tests
    ]
    return cards, tests
