export type Lesson = {
  id: string;
  user_id: string;
  title: string;
  summary: string | null;
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

export type TypedAnswerTest = {
  id: string;
  lesson_id: string;
  type: "typed_answer";
  question: string;
  correct_answer: string;
  explanation: string;
};

export type MultipleChoiceTest = {
  id: string;
  lesson_id: string;
  type: "multiple_choice";
  question: string;
  correct_answer: string;
  explanation: string;
  options: string[];
};

export type FlashcardTest = TypedAnswerTest | MultipleChoiceTest;

export type ReviewSession = {
  flashcards: Flashcard[];
  tests: FlashcardTest[];
};

export type TestAnswerResult = {
  correct: boolean;
  correct_answer: string;
  explanation: string;
};

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
