/**
 * MOCK: achievements — replace when backend exists.
 */
export type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
};

export const MOCK_ACHIEVEMENTS: Achievement[] = [
  {
    id: "first-lesson",
    title: "First Spark",
    description: "Created your first lesson with Lumi.",
    icon: "✨",
    unlocked: true,
  },
  {
    id: "streak-3",
    title: "On a Roll",
    description: "Study 3 days in a row.",
    icon: "🔥",
    unlocked: true,
  },
  {
    id: "review-50",
    title: "Memo Pro",
    description: "Review 50 cards total.",
    icon: "🧠",
    unlocked: false,
  },
  {
    id: "night-owl",
    title: "Night Owl",
    description: "Complete a review after 9pm.",
    icon: "🌙",
    unlocked: false,
  },
];
