import type { Flashcard, Lesson, ProfileSummary, ReviewRating, ReviewSession, TestAnswerResult } from "@/types/api";

import { getApiBaseUrl } from "@/lib/api-base";

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const base = getApiBaseUrl();
  let res: Response;
  try {
    res = await fetch(`${base}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
      cache: "no-store",
    });
  } catch (e) {
    const reason = e instanceof Error ? e.message : "Network error";
    throw new Error(`Cannot reach API at ${base}: ${reason}`);
  }

  const text = await res.text();
  if (!res.ok) {
    let detail: string | null = null;
    try {
      const parsed = JSON.parse(text) as { detail?: unknown };
      if (typeof parsed.detail === "string") {
        detail = parsed.detail;
      }
    } catch {
      // Fall through to the raw server response below.
    }
    throw new Error(detail ?? (text || `${res.status} ${res.statusText}`));
  }

  if (!text) {
    throw new Error(`Empty response from ${path}`);
  }

  let data: unknown;
  try {
    data = JSON.parse(text) as unknown;
  } catch {
    throw new Error(`Invalid JSON from ${path}`);
  }

  return data as T;
}

function assertFlashcardArray(data: unknown, path: string): Flashcard[] {
  if (!Array.isArray(data)) {
    throw new Error(`Invalid ${path} response: expected JSON array`);
  }
  return data as Flashcard[];
}

export async function generateLesson(rawText: string): Promise<Lesson> {
  return apiRequest<Lesson>("/lessons/generate", {
    method: "POST",
    body: JSON.stringify({ raw_text: rawText }),
  });
}

export async function getLessons(): Promise<Lesson[]> {
  const data = await apiRequest<unknown>("/lessons");
  if (!Array.isArray(data)) {
    throw new Error("Invalid /lessons response: expected JSON array");
  }
  return data as Lesson[];
}

export async function getLessonById(id: string): Promise<Lesson> {
  return apiRequest<Lesson>(`/lessons/${encodeURIComponent(id)}`);
}

export async function generateFlashcards(lessonId: string): Promise<Flashcard[]> {
  const data = await apiRequest<unknown>("/flashcards/generate", {
    method: "POST",
    body: JSON.stringify({ lesson_id: lessonId }),
  });
  return assertFlashcardArray(data, "/flashcards/generate");
}

export async function getDueToday(): Promise<Flashcard[]> {
  const data = await apiRequest<unknown>("/flashcards/due-today");
  return assertFlashcardArray(data, "/flashcards/due-today");
}

export async function getReviewSession(): Promise<ReviewSession> {
  return apiRequest<ReviewSession>("/flashcards/review-session");
}

export async function reviewFlashcard(
  flashcardId: string,
  rating: ReviewRating,
): Promise<{ flashcard: Flashcard }> {
  return apiRequest<{ flashcard: Flashcard }>(
    `/flashcards/${encodeURIComponent(flashcardId)}/review`,
    {
      method: "POST",
      body: JSON.stringify({ rating }),
    },
  );
}

export async function learnFlashcard(flashcardId: string): Promise<{ flashcard: Flashcard }> {
  return reviewFlashcard(flashcardId, "good");
}

export async function submitTypedAnswer(testId: string, answer: string): Promise<TestAnswerResult> {
  return apiRequest<TestAnswerResult>(`/flashcards/tests/${encodeURIComponent(testId)}/answer`, {
    method: "POST",
    body: JSON.stringify({ answer }),
  });
}

export async function submitMultipleChoice(testId: string, selectedOption: string): Promise<TestAnswerResult> {
  return apiRequest<TestAnswerResult>(`/flashcards/tests/${encodeURIComponent(testId)}/answer`, {
    method: "POST",
    body: JSON.stringify({ selected_option: selectedOption }),
  });
}

export async function getProfileSummary(): Promise<ProfileSummary> {
  return apiRequest<ProfileSummary>("/profile/summary");
}
