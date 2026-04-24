export type Lesson = {
  id: string;
  user_id: string;
  title: string;
  summary: string;
  simple_explanation: string;
  key_points: string[];
  example: string;
  raw_input_text: string;
  created_at: string;
};

export type Flashcard = {
  id: string;
  lesson_id: string;
  front: string;
  back: string;
  difficulty: string;
  review_count: number;
  next_review_at: string;
  created_at: string;
};

export type ReviewRating = "forgot" | "hard" | "good" | "easy";

export type RecentActivityItem = {
  kind: string;
  label: string;
  at: string;
};

export type ProfileSummary = {
  user_id: string;
  total_lessons: number;
  total_flashcards: number;
  streak: number;
  recent_activity: RecentActivityItem[];
};
