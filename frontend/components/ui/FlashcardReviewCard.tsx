import { LmCard } from "@/components/ui/LmCard";
import { PrimaryButton } from "@/components/ui/PrimaryButton";

type Props = {
  topicLabel: string;
  question: string;
  answer?: string;
  revealed: boolean;
  onReveal: () => void;
};

export function FlashcardReviewCard({ topicLabel, question, answer, revealed, onReveal }: Props) {
  return (
    <LmCard
      padding="lg"
      className="min-h-[280px] border-lm-memoSky/35 bg-gradient-to-b from-white via-lm-memoMist/30 to-white shadow-lm-memo-card ring-1 ring-lm-memoIce/80"
    >
      <div className="flex flex-col items-center text-center">
        <span className="rounded-full border border-lm-memoSky/40 bg-lm-memoIce/90 px-3 py-1 text-[0.65rem] font-extrabold uppercase tracking-wide text-lm-memoDeep">
          {topicLabel}
        </span>
        <p className="mt-5 text-lg font-extrabold leading-snug text-lm-ink">{question}</p>

        {!revealed ? (
          <div className="mt-8 w-full max-w-xs space-y-3">
            <p className="text-sm font-medium text-lm-memoDeep/80">Tap below when you&apos;re ready to recall.</p>
            <PrimaryButton type="button" variant="memo" onClick={onReveal}>
              Tap to reveal answer
            </PrimaryButton>
          </div>
        ) : (
          <div className="mt-6 w-full border-t border-lm-memoSky/35 pt-6 text-left">
            <p className="text-center text-[0.65rem] font-extrabold uppercase tracking-wide text-lm-memoCore">Answer</p>
            <p className="mt-3 text-center text-sm font-medium leading-relaxed text-lm-inkMuted">{answer}</p>
          </div>
        )}
      </div>
    </LmCard>
  );
}
