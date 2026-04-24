"use client";

import type { ReviewRating } from "@/types/api";

type Props = {
  disabled?: boolean;
  onRate: (r: ReviewRating) => void;
};

const btn =
  "inline-flex min-h-[2.85rem] w-full items-center justify-center rounded-2xl px-2 text-[0.78rem] font-extrabold tracking-wide transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45";

export function RatingBar({ disabled, onRate }: Props) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      <button type="button" disabled={disabled} className={`${btn} border border-lm-ratingForgot/35 bg-lm-ratingForgot/12 text-lm-ratingForgot`} onClick={() => onRate("forgot")}>
        Forgot
      </button>
      <button type="button" disabled={disabled} className={`${btn} border border-amber-300/60 bg-amber-50 text-amber-900`} onClick={() => onRate("hard")}>
        Hard
      </button>
      <button type="button" disabled={disabled} className={`${btn} border border-lm-ratingGood/35 bg-lm-ratingGood/10 text-lm-success`} onClick={() => onRate("good")}>
        Good
      </button>
      <button type="button" disabled={disabled} className={`${btn} border border-lm-memoSky/55 bg-lm-memoIce text-lm-memoDeep`} onClick={() => onRate("easy")}>
        Easy
      </button>
    </div>
  );
}
