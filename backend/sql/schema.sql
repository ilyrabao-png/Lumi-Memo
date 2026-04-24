-- Lumi & Memo — initial schema for Supabase (PostgreSQL)
-- Apply via Supabase SQL editor or migrations.

-- users: Supabase auth owns auth.users; this table mirrors app profile if needed.
-- MVP assumption: we store app-specific aggregates keyed by auth user id (uuid).
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  raw_input_text TEXT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  simple_explanation TEXT NOT NULL,
  example TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.lesson_key_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES public.lessons (id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  position INT NOT NULL
);

CREATE TABLE IF NOT EXISTS public.flashcards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.lessons (id) ON DELETE CASCADE,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  difficulty TEXT NOT NULL DEFAULT 'medium',
  review_count INT NOT NULL DEFAULT 0,
  next_review_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flashcard_id UUID NOT NULL REFERENCES public.flashcards (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  rating TEXT NOT NULL,
  reviewed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.daily_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  date DATE NOT NULL,
  lessons_created INT NOT NULL DEFAULT 0,
  flashcards_reviewed INT NOT NULL DEFAULT 0,
  streak_value INT NOT NULL DEFAULT 0,
  UNIQUE (user_id, date)
);

CREATE INDEX IF NOT EXISTS idx_lessons_user_created ON public.lessons (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_flashcards_user_next ON public.flashcards (user_id, next_review_at);
CREATE INDEX IF NOT EXISTS idx_reviews_user_time ON public.reviews (user_id, reviewed_at DESC);
