import type { Lesson } from "@/types/api";

import { formatDateTime } from "@/lib/format";

const SUBJECTS = ["General", "Science", "Language", "Math", "Humanities"] as const;

/** Stable pseudo-random 0..1 from string (for UI-only progress bars). */
export function hash01(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i += 1) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return (h % 1000) / 1000;
}

export function lessonSubject(lesson: Lesson): string {
  const h = hash01(lesson.id);
  return SUBJECTS[Math.floor(h * SUBJECTS.length)] ?? "General";
}

export function lessonMastery(lesson: Lesson): number {
  const base = 0.35 + hash01(lesson.title) * 0.55;
  return Math.round(base * 100) / 100;
}

export function lessonProgressCounts(lesson: Lesson): { done: number; total: number } {
  const total = 6 + Math.floor(hash01(lesson.id + "t") * 5);
  const done = Math.min(total, Math.floor(lessonMastery(lesson) * total));
  return { done, total };
}

export function lessonDisplayDate(lesson: Lesson): string {
  return formatDateTime(lesson.created_at);
}
