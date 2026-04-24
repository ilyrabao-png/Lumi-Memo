import type { ReactNode } from "react";

import { LmCard } from "@/components/ui/LmCard";

type Props = {
  label: string;
  value: ReactNode;
  hint?: string;
  tone?: "default" | "gold" | "blue" | "memo";
  /** Small visual anchor in the stat tile (emoji). */
  icon: string;
};

const toneRings: Record<NonNullable<Props["tone"]>, string> = {
  default: "bg-lm-blueSoft/80 text-lg shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]",
  gold: "bg-gradient-to-br from-lm-goldSoft to-white text-lg shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]",
  blue: "bg-gradient-to-br from-lm-blueSoft to-white text-lg shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]",
  memo: "bg-gradient-to-br from-lm-memoIce to-lm-memoSky/60 text-lg shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]",
};

const tones: Record<NonNullable<Props["tone"]>, string> = {
  default: "text-lm-ink",
  gold: "text-lm-orange",
  blue: "text-lm-blue",
  memo: "text-lm-memoDeep",
};

const ringAccent: Partial<Record<NonNullable<Props["tone"]>, string>> = {
  gold: "ring-lm-orange/10",
  memo: "ring-lm-memoSky/35",
};

export function StatCard({ label, value, hint, tone = "default", icon }: Props) {
  const accent = ringAccent[tone] ?? "";
  return (
    <LmCard
      padding="sm"
      className={`min-h-[118px] rounded-[1.2rem] border-lm-line/90 bg-lm-surfaceElevated shadow-lm-stat ring-1 ring-black/[0.03] ${accent}`}
    >
      <div className="flex flex-col items-center text-center">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-full border border-white/70 ${toneRings[tone]}`}
          aria-hidden
        >
          {icon}
        </div>
        <p className="mt-2.5 text-[0.62rem] font-bold uppercase tracking-[0.14em] text-lm-inkFaint">{label}</p>
        <p className={`mt-1 text-[1.35rem] font-extrabold leading-none tabular-nums tracking-tight ${tones[tone]}`}>
          {value}
        </p>
        {hint ? <p className="mt-1.5 text-[0.68rem] font-semibold leading-tight text-lm-inkMuted">{hint}</p> : null}
      </div>
    </LmCard>
  );
}
