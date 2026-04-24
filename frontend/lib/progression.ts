/**
 * Temporary XP / level model until the backend exposes progression.
 * Uses real profile counts so it stays loosely tied to actual usage.
 */
export type Progression = {
  xp: number;
  level: number;
  xpIntoLevel: number;
  xpToNextLevel: number;
};

export const XP_PER_LEVEL = 650;

export function computeProgression(input: {
  totalLessons: number;
  totalFlashcards: number;
  streak: number;
  /** Count of recent_activity items from API, as a rough signal of reviews */
  activityCount: number;
}): Progression {
  const xp =
    input.totalLessons * 140 +
    input.totalFlashcards * 18 +
    input.streak * 40 +
    input.activityCount * 25;

  const level = Math.max(1, Math.floor(xp / XP_PER_LEVEL) + 1);
  const xpIntoLevel = xp % XP_PER_LEVEL;
  const xpToNextLevel = XP_PER_LEVEL - xpIntoLevel;

  return { xp, level, xpIntoLevel, xpToNextLevel };
}
