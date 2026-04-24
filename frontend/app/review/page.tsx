"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { MemoMarkButton } from "@/components/MemoMarkButton";
import { EmptyState } from "@/components/ui/EmptyState";
import { FlashcardReviewCard } from "@/components/ui/FlashcardReviewCard";
import { LmCard } from "@/components/ui/LmCard";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { SecondaryButton } from "@/components/ui/SecondaryButton";
import { getReviewSession, learnFlashcard, submitMultipleChoice, submitTypedAnswer } from "@/lib/api";
import type { Flashcard, FlashcardTest, TestAnswerResult } from "@/types/api";

type Phase = "learn" | "test" | "complete";

export default function ReviewPage() {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [tests, setTests] = useState<FlashcardTest[]>([]);
  const [phase, setPhase] = useState<Phase>("learn");
  const [cardIndex, setCardIndex] = useState(0);
  const [testIndex, setTestIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [typedAnswer, setTypedAnswer] = useState("");
  const [selectedOption, setSelectedOption] = useState("");
  const [feedback, setFeedback] = useState<TestAnswerResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const session = await getReviewSession();
      setCards(session.flashcards);
      setTests(session.tests);
      setCardIndex(0);
      setTestIndex(0);
      setRevealed(false);
      setTypedAnswer("");
      setSelectedOption("");
      setFeedback(null);
      if (session.flashcards.length > 0) {
        setPhase("learn");
      } else if (session.tests.length > 0) {
        setPhase("test");
      } else {
        setPhase("learn");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load your review session.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const currentCard = cards[cardIndex];
  const currentTest = tests[testIndex];
  const learnedCount = phase === "learn" ? cardIndex : cards.length;
  const answeredCount = phase === "test" ? testIndex : phase === "complete" ? tests.length : 0;
  const totalItems = cards.length + tests.length;
  const completedItems = learnedCount + answeredCount;
  const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  const subtitle = useMemo(() => {
    if (totalItems === 0) return "No cards queued";
    if (phase === "learn") return `${learnedCount} of ${cards.length} cards learned`;
    if (phase === "test") return `${answeredCount} of ${tests.length} tests complete`;
    return "Session complete";
  }, [answeredCount, cards.length, learnedCount, phase, tests.length, totalItems]);

  const topicLabel =
    currentCard != null
      ? (() => {
          const words = currentCard.front.split(" ").slice(0, 3).join(" ");
          return words.length > 28 ? `${words.slice(0, 28)}...` : words;
        })()
      : "Today's deck";

  async function completeCurrentCard() {
    if (!currentCard) return;
    const next = cardIndex + 1;
    if (next >= cards.length) {
      setCardIndex(cards.length);
      setRevealed(false);
      if (tests.length > 0) {
        setPhase("test");
      } else {
        void completeSession();
      }
    } else {
      setCardIndex(next);
      setRevealed(false);
    }
  }

  async function completeSession() {
    setBusy(true);
    setError(null);
    try {
      await Promise.all(cards.map((card) => learnFlashcard(card.id)));
      setPhase("complete");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save this review session.");
    } finally {
      setBusy(false);
    }
  }

  async function submitCurrentTest() {
    if (!currentTest || feedback) return;
    setBusy(true);
    setError(null);
    try {
      const result =
        currentTest.type === "typed_answer"
          ? await submitTypedAnswer(currentTest.id, typedAnswer)
          : await submitMultipleChoice(currentTest.id, selectedOption);
      setFeedback(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not check this answer.");
    } finally {
      setBusy(false);
    }
  }

  function continueAfterTest() {
    const next = testIndex + 1;
    setFeedback(null);
    setTypedAnswer("");
    setSelectedOption("");
    if (next >= tests.length) {
      setTestIndex(tests.length);
      void completeSession();
    } else {
      setTestIndex(next);
    }
  }

  return (
    <main className="space-y-5">
      <ScreenHeader title="Review Session" subtitle={subtitle} backHref="/" rightSlot={<MemoMarkButton href="/" />} />

      {loading ? (
        <LmCard padding="lg" className="border-lm-memoSky/30 bg-gradient-to-br from-lm-memoMist/50 to-white shadow-lm-memo-card">
          <p className="text-center text-sm font-semibold text-lm-memoDeep/80">Gathering your review session...</p>
        </LmCard>
      ) : null}

      {error ? (
        <EmptyState
          title="Could not reach Memo"
          description={error}
          action={{ label: "Try again", onClick: () => void load() }}
          icon="signal"
          variant="memo"
        />
      ) : null}

      {!loading && !error && totalItems === 0 ? (
        <EmptyState
          title="You're caught up for now"
          description="Memo will remind you when it's time to review again. Add a lesson whenever you're ready for more to remember."
          action={{ label: "Add a new lesson", href: "/lesson/new" }}
          icon="memo"
          variant="memo"
        />
      ) : null}

      {!loading && !error && totalItems > 0 ? (
        <>
          <LmCard padding="md" className="space-y-3 border-lm-memoSky/30 bg-gradient-to-br from-lm-memoMist/40 via-white to-lm-memoIce/30 shadow-lm-memo-card ring-1 ring-lm-memoSky/20">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-extrabold uppercase tracking-wide text-lm-memoDeep/70">Progress</p>
              <p className="text-xs font-extrabold text-lm-memoDeep">{Math.round(progress)}%</p>
            </div>
            <ProgressBar thick memo value={progress} max={100} />
          </LmCard>

          {phase === "learn" && currentCard ? (
            <div className="space-y-4">
              <FlashcardReviewCard
                topicLabel={topicLabel}
                question={currentCard.front}
                answer={currentCard.back}
                revealed={revealed}
                onReveal={() => setRevealed(true)}
              />

              {revealed ? (
                <div className="grid gap-2 sm:grid-cols-2">
                  <SecondaryButton type="button" disabled={busy} onClick={() => void completeCurrentCard()}>
                    Next
                  </SecondaryButton>
                  <PrimaryButton type="button" variant="memo" disabled={busy} onClick={() => void completeCurrentCard()}>
                    I learned this
                  </PrimaryButton>
                </div>
              ) : null}

              <p className="text-center text-xs font-semibold text-lm-memoDeep/75">
                Card {cardIndex + 1} of {cards.length}
              </p>
            </div>
          ) : null}

          {phase === "test" && currentTest ? (
            <TestPanel
              test={currentTest}
              typedAnswer={typedAnswer}
              selectedOption={selectedOption}
              feedback={feedback}
              busy={busy}
              onTypedAnswer={setTypedAnswer}
              onSelectOption={setSelectedOption}
              onSubmit={() => void submitCurrentTest()}
              onContinue={continueAfterTest}
            />
          ) : null}

          {phase === "complete" ? (
            <LmCard padding="lg" className="border-lm-memoSky/40 bg-gradient-to-b from-lm-memoMist/90 via-white to-lm-memoIce/40 shadow-lm-memo-card ring-1 ring-lm-memoSky/25">
              <div className="text-center">
                <p className="mt-1 font-display text-lg font-extrabold text-lm-memoDeep">Session complete</p>
                <p className="mt-2 text-sm font-medium leading-relaxed text-lm-inkMuted">
                  Memo saved today&apos;s cards and tests. The next review dates are lined up.
                </p>
                <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
                  <PrimaryButton type="button" variant="memo" className="sm:!max-w-[200px]" onClick={() => void load()}>
                    Review again
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
        </>
      ) : null}

      {!loading && !error && totalItems > 0 && phase !== "complete" ? (
        <div className="pb-2 text-center">
          <Link href="/" className="text-xs font-extrabold text-lm-memoDeep underline-offset-4 hover:underline">
            Save and exit for now
          </Link>
        </div>
      ) : null}
    </main>
  );
}

type TestPanelProps = {
  test: FlashcardTest;
  typedAnswer: string;
  selectedOption: string;
  feedback: TestAnswerResult | null;
  busy: boolean;
  onTypedAnswer: (value: string) => void;
  onSelectOption: (value: string) => void;
  onSubmit: () => void;
  onContinue: () => void;
};

function TestPanel({
  test,
  typedAnswer,
  selectedOption,
  feedback,
  busy,
  onTypedAnswer,
  onSelectOption,
  onSubmit,
  onContinue,
}: TestPanelProps) {
  const canSubmit = test.type === "typed_answer" ? typedAnswer.trim().length > 0 : selectedOption.length > 0;

  return (
    <LmCard padding="lg" className="space-y-5 border-lm-memoSky/35 bg-gradient-to-b from-white via-lm-memoMist/25 to-white shadow-lm-memo-card ring-1 ring-lm-memoIce/80">
      <div className="space-y-2">
        <p className="text-xs font-extrabold uppercase tracking-wide text-lm-memoCore">Test</p>
        <h2 className="text-lg font-extrabold leading-snug text-lm-ink">{test.question}</h2>
      </div>

      {test.type === "typed_answer" ? (
        <input
          value={typedAnswer}
          disabled={Boolean(feedback) || busy}
          onChange={(e) => onTypedAnswer(e.target.value)}
          className="min-h-[3.25rem] w-full rounded-2xl border border-lm-lineStrong bg-white px-4 text-sm font-semibold text-lm-ink outline-none transition focus:border-lm-memoSky focus:ring-4 focus:ring-lm-memoSky/15 disabled:bg-lm-surface"
          placeholder="Type your answer"
        />
      ) : (
        <div className="grid gap-2">
          {test.options.map((option) => {
            const selected = selectedOption === option;
            return (
              <button
                key={option}
                type="button"
                disabled={Boolean(feedback) || busy}
                onClick={() => onSelectOption(option)}
                className={`min-h-[3rem] rounded-2xl border px-4 text-left text-sm font-bold transition disabled:cursor-not-allowed ${
                  selected
                    ? "border-lm-memoSky bg-lm-memoIce text-lm-memoDeep ring-2 ring-lm-memoSky/25"
                    : "border-lm-lineStrong bg-white text-lm-ink hover:bg-lm-surface"
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>
      )}

      {feedback ? (
        <div
          className={`rounded-2xl border p-4 ${
            feedback.correct
              ? "border-lm-ratingGood/35 bg-lm-ratingGood/10 text-lm-success"
              : "border-lm-ratingForgot/35 bg-lm-ratingForgot/10 text-lm-danger"
          }`}
        >
          <p className="text-sm font-extrabold">{feedback.correct ? "Correct" : "Not quite"}</p>
          {!feedback.correct ? (
            <p className="mt-2 text-sm font-semibold leading-relaxed text-lm-ink">Correct answer: {feedback.correct_answer}</p>
          ) : null}
          <p className="mt-2 text-sm font-medium leading-relaxed text-lm-inkMuted">{feedback.explanation}</p>
        </div>
      ) : null}

      {feedback ? (
        <PrimaryButton type="button" variant="memo" disabled={busy} onClick={onContinue}>
          Continue
        </PrimaryButton>
      ) : (
        <PrimaryButton type="button" variant="memo" disabled={!canSubmit || busy} onClick={onSubmit}>
          Check answer
        </PrimaryButton>
      )}
    </LmCard>
  );
}
