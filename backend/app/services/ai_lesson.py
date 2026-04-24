import json
from typing import Annotated, Any, Literal
from uuid import UUID, uuid4

import httpx
from pydantic import BaseModel, Field, TypeAdapter, ValidationError, field_validator

from app.core.config import Settings
from app.db.memory_store import LessonRecord, utcnow


OPENROUTER_CHAT_COMPLETIONS_URL = "https://openrouter.ai/api/v1/chat/completions"


class AiLessonError(RuntimeError):
    """Controlled error raised when AI lesson generation fails."""


class GeneratedProblemLesson(BaseModel):
    type: Literal["problem"]
    title: str = Field(..., min_length=1)
    summary: str = Field(..., min_length=1)
    simple_explanation: str = Field(..., min_length=1)
    key_points: list[str] = Field(..., min_length=3, max_length=3)
    example: str = Field(..., min_length=1)

    @field_validator("title", "summary", "simple_explanation", "example")
    @classmethod
    def _strip_text(cls, v: str) -> str:
        text = v.strip()
        if not text:
            raise ValueError("lesson fields cannot be empty")
        return text

    @field_validator("key_points")
    @classmethod
    def _strip_key_points(cls, v: list[str]) -> list[str]:
        points = [point.strip() for point in v]
        if any(not point for point in points):
            raise ValueError("key_points cannot contain empty items")
        return points


class GeneratedTheoryLesson(BaseModel):
    type: Literal["theory"]
    title: str = Field(..., min_length=1)
    simple_explanation: str = Field(..., min_length=1)
    key_points: list[str] = Field(..., min_length=3, max_length=3)
    example: str = Field(..., min_length=1)

    @field_validator("title", "simple_explanation", "example")
    @classmethod
    def _strip_text(cls, v: str) -> str:
        text = v.strip()
        if not text:
            raise ValueError("lesson fields cannot be empty")
        return text

    @field_validator("key_points")
    @classmethod
    def _strip_key_points(cls, v: list[str]) -> list[str]:
        points = [point.strip() for point in v]
        if any(not point for point in points):
            raise ValueError("key_points cannot contain empty items")
        return points


GeneratedLesson = Annotated[GeneratedProblemLesson | GeneratedTheoryLesson, Field(discriminator="type")]
_GENERATED_LESSON_ADAPTER = TypeAdapter(GeneratedLesson)


def generate_lesson_with_ai(*, user_id: UUID, raw_text: str, settings: Settings) -> LessonRecord:
    if not settings.openrouter_api_key:
        raise AiLessonError("OPENROUTER_API_KEY is required to generate AI lessons.")

    lesson = _request_lesson(raw_text=raw_text, settings=settings)
    return LessonRecord(
        id=uuid4(),
        user_id=user_id,
        raw_input_text=raw_text,
        title=lesson.title,
        summary=lesson.summary if isinstance(lesson, GeneratedProblemLesson) else None,
        simple_explanation=lesson.simple_explanation,
        key_points=lesson.key_points,
        example=lesson.example,
        created_at=utcnow(),
    )


def _request_lesson(*, raw_text: str, settings: Settings) -> GeneratedLesson:
    payload = {
        "model": settings.openrouter_model,
        "messages": [
            {"role": "system", "content": LUMI_LESSON_SYSTEM_PROMPT},
            {"role": "user", "content": f"User input\n\n{raw_text.strip()}"},
        ],
        "temperature": 0.2,
        "response_format": {
            "type": "json_schema",
            "json_schema": {
                "name": "lumi_lesson",
                "strict": True,
                "schema": _lesson_schema(),
            },
        },
    }

    raw_content = _post_openrouter_json(settings=settings, payload=payload)
    try:
        return _GENERATED_LESSON_ADAPTER.validate_python(raw_content)
    except ValidationError as exc:
        raise AiLessonError(f"OpenRouter returned invalid lesson content: {exc.errors()[0]['msg']}") from exc


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
        raise AiLessonError("OpenRouter lesson generation timed out.") from exc
    except httpx.HTTPStatusError as exc:
        detail = _openrouter_error_detail(exc.response)
        raise AiLessonError(f"OpenRouter lesson generation failed: {detail}") from exc
    except httpx.HTTPError as exc:
        raise AiLessonError(f"OpenRouter lesson generation failed: {exc}") from exc

    try:
        body = response.json()
        content = body["choices"][0]["message"]["content"]
    except (KeyError, IndexError, TypeError, ValueError) as exc:
        raise AiLessonError("OpenRouter returned an unexpected lesson response shape.") from exc

    if isinstance(content, str):
        try:
            return json.loads(content)
        except json.JSONDecodeError as exc:
            raise AiLessonError("OpenRouter returned malformed JSON lesson content.") from exc
    if isinstance(content, dict):
        return content
    raise AiLessonError("OpenRouter returned empty lesson content.")


def _lesson_schema() -> dict[str, Any]:
    text_field = {"type": "string", "minLength": 1}
    key_points_field = {"type": "array", "items": text_field, "minItems": 3, "maxItems": 3}
    problem = {
        "type": "object",
        "properties": {
            "type": {"const": "problem"},
            "title": text_field,
            "summary": text_field,
            "simple_explanation": text_field,
            "key_points": key_points_field,
            "example": text_field,
        },
        "required": ["type", "title", "summary", "simple_explanation", "key_points", "example"],
        "additionalProperties": False,
    }
    theory = {
        "type": "object",
        "properties": {
            "type": {"const": "theory"},
            "title": text_field,
            "simple_explanation": text_field,
            "key_points": key_points_field,
            "example": text_field,
        },
        "required": ["type", "title", "simple_explanation", "key_points", "example"],
        "additionalProperties": False,
    }
    return {
        "anyOf": [problem, theory],
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


LUMI_LESSON_SYSTEM_PROMPT = """
You are Lumi, an AI learning assistant inside the Lumi & Memo app.

Your job is to explain the user's input in a way that is clear, concise, structured, beginner-friendly, and easy to turn into study cards later.

You must return your answer as valid JSON only. Do not include markdown. Do not include code fences. Do not include extra commentary outside the JSON.

Task:
Analyze the user's input and determine whether it is:
1. a problem-solving / exercise / question that requires solving
or
2. a theory / concept / definition / explanatory topic

If the input is a problem-solving task, return these sections:
- type
- title
- summary
- simple_explanation
- key_points
- example

If the input is a theory/concept task, return these sections:
- type
- title
- simple_explanation
- key_points
- example

Important:
- For theory/concept inputs, do not include summary.
- For problem-solving inputs, include summary.
- key_points must always contain exactly 3 short items.
- example must always be easy to understand and practical.
- Use the same language as the user's input.
- If the user writes in Vietnamese, respond in Vietnamese.
- If the user writes in English, respond in English.

Output rules:
- title: short, specific, natural, suitable as a lesson card title.
- summary: only for problem-solving inputs, 1 to 2 sentences, briefly state what the problem is asking and what the learner should focus on.
- simple_explanation: explain the core idea in a simple way, avoid jargon when possible, and explain necessary jargon clearly.
- key_points: exactly 3 bullet-like strings, short, useful, memorable, and non-repetitive.
- example: give one simple example or practical framing. For problem-solving, show a small intuitive example or how to think about the solution. For theory, show a real-world example or intuitive analogy.

Classification guidance:
- Treat the input as problem-solving if it includes a direct question to solve, equations, calculations, "find", "solve", "calculate", "compute", "determine", exercises, homework-style prompts, or anything clearly asking for an answer or solution process.
- Treat the input as theory/concept if it includes "what is", "explain", "define", "why", "how does it work", concept descriptions, theory, principles, definitions, or overviews.
- If uncertain, choose the format that is most useful for learning.
""".strip()
