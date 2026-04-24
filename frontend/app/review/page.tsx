"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { MemoMarkButton } from "@/components/MemoMarkButton";
import { RatingBar } from "@/components/review/RatingBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { FlashcardReviewCard } from "@/components/ui/FlashcardReviewCard";
import { LmCard } from "@/components/ui/LmCard";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { getDueToday, reviewFlashcard } from "@/lib/api";
import type { Flashcard, ReviewRating } from "@/types/api";

export default function ReviewPage() {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reviewsDone, setReviewsDone] = useState(0);
  const [roundComplete, setRoundComplete] = useState(false);

  const pullDue = useCallback(async (): Promise<Flashcard[]> => {
    return getDueToday();
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setRoundComplete(false);
    try {
      const due = await pullDue();
      setCards(due);
      setIndex(0);
      setReviewsDone(0);
      setRevealed(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load cards.");
    } finally {
      setLoading(false);
    }
  }, [pullDue]);

  useEffect(() => {
    void load();
  }, [load]);

  const total = cards.length;
  const current = total > 0 ? cards[Math.min(index, total - 1)] : undefined;
  const reviewedLabel = total > 0 ? `${reviewsDone} of ${total} reviewed` : "No cards queued";
  const progress = total > 0 ? (reviewsDone / total) * 100 : 0;

  const topicLabel =
    current != null
      ? (() => {
          const words = current.front.split(" ").slice(0, 3).join(" ");
          return words.length > 28 ? `${words.slice(0, 28)}…` : words;
        })()
      : "Today's deck";

  async function onRate(rating: ReviewRating) {
    if (!current) return;
    setBusy(true);
    setError(null);
    try {
      await reviewFlashcard(current.id, rating);
      setReviewsDone((n) => n + 1);
      const next = index + 1;
      if (next >= cards.length) {
        const remaining = await pullDue();
        setCards(remaining);
        setIndex(0);
        setReviewsDone(0);
        setRevealed(false);
        if (remaining.length === 0) {
          setRoundComplete(true);
        }
      } else {
        setIndex(next);
        setRevealed(false);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Review failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="space-y-5">
      <ScreenHeader
        title="Review Session"
        subtitle={reviewedLabel}
        backHref="/"
        rightSlot={<MemoMarkButton href="/" />}
      />

      {loading ? (
        <LmCard padding="lg" className="border-lm-memoSky/30 bg-gradient-to-br from-lm-memoMist/50 to-white shadow-lm-memo-card">
          <p className="text-center text-sm font-semibold text-lm-memoDeep/80">Gathering your due cards…</p>
        </LmCard>
      ) : null}

      {error ? (
        <EmptyState
          title="Could not reach Memo"
          description={error}
          action={{ label: "Try again", onClick: () => void load() }}
          icon="📡"
          variant="memo"
        />
      ) : null}

      {!loading && !error && total === 0 && roundComplete ? (
        <LmCard padding="lg" className="border-lm-memoSky/40 bg-gradient-to-b from-lm-memoMist/90 via-white to-lm-memoIce/40 shadow-lm-memo-card ring-1 ring-lm-memoSky/25">
          <div className="text-center">
            <p className="text-2xl">✨</p>
            <p className="mt-3 font-display text-lg font-extrabold text-lm-memoDeep">Round complete</p>
            <p className="mt-2 text-sm font-medium leading-relaxed text-lm-inkMuted">
              You cleared every due card in this session. Memo will line up the next reviews for you.
            </p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <PrimaryButton type="button" variant="memo" className="sm:!max-w-[200px]" onClick={() => setRoundComplete(false)}>
                Done
              </PrimaryButton>
              <Link
                href="/"
                className="inline-flex min-h-[2.85rem] items-center justify-center rounded-2xl border border-lm-memoSky/50 px-4 text-sm font-extrabold text-lm-memoDeep transition hover:bg-lm-memoIce/60"
              >
                Back home
              </Link>
            </div>
          </div>
        </LmCard>
      ) : null}

      {!loading && !error && total === 0 && !roundComplete ? (
        <EmptyState
          title="You're caught up for now"
          description="Memo will remind you when it's time to review again. Add a lesson whenever you're ready for more to remember."
          action={{ label: "Add a new lesson", href: "/lesson/new" }}
          icon="🧠"
          variant="memo"
        />
      ) : null}

      {!loading && !error && total > 0 ? (
        <>
          <LmCard padding="md" className="space-y-3 border-lm-memoSky/30 bg-gradient-to-br from-lm-memoMist/40 via-white to-lm-memoIce/30 shadow-lm-memo-card ring-1 ring-lm-memoSky/20">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-extrabold uppercase tracking-wide text-lm-memoDeep/70">Progress</p>
              <p className="text-xs font-extrabold text-lm-memoDeep">{Math.round(progress)}%</p>
            </div>
            <ProgressBar thick memo value={progress} max={100} />
          </LmCard>

          {current ? (
            <div className="space-y-4">
              <FlashcardReviewCard
                topicLabel={topicLabel}
                question={current.front}
                answer={current.back}
                revealed={revealed}
                onReveal={() => setRevealed(true)}
              />

              {revealed ? <RatingBar disabled={busy} onRate={(r) => void onRate(r)} /> : null}

              <p className="text-center text-xs font-semibold text-lm-memoDeep/75">
                Card {index + 1} of {total}
              </p>
            </div>
          ) : null}
        </>
      ) : null}

      {!loading && !error && total > 0 ? (
        <div className="pb-2 text-center">
          <Link href="/" className="text-xs font-extrabold text-lm-memoDeep underline-offset-4 hover:underline">
            Save & exit for now
          </Link>
        </div>
      ) : null}
    </main>
  );
}
