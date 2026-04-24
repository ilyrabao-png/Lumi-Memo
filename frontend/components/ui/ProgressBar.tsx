type Props = {
  value: number;
  max?: number;
  className?: string;
  thick?: boolean;
  /** Taller rail + softer fill for hero cards (e.g. Home XP — Lumi). */
  premium?: boolean;
  /** Memo retention / review sessions — cool gradient fill. */
  memo?: boolean;
};

export function ProgressBar({ value, max = 1, className = "", thick = false, premium = false, memo = false }: Props) {
  const pct = Math.max(0, Math.min(100, (value / Math.max(max, 0.0001)) * 100));
  const height = premium ? "h-[14px]" : thick ? "h-3.5" : "h-2.5";
  const track = memo
    ? "bg-lm-memoIce/90 ring-1 ring-lm-memoSky/40"
    : "bg-lm-bgDeep/55 ring-1 ring-lm-line/60";

  const fill = memo ? (
    <div
      className="relative h-full rounded-full bg-lm-memo-bar shadow-[inset_0_-2px_6px_rgba(0,0,0,0.06)]"
      style={{ width: `${pct}%` }}
    />
  ) : (
    <div
      className={`relative h-full rounded-full bg-gradient-to-r from-lm-orange via-lm-coral to-lm-gold shadow-[inset_0_-2px_6px_rgba(0,0,0,0.08)] ${
        premium ? "shadow-[0_0_0_1px_rgba(255,255,255,0.35)_inset]" : ""
      }`}
      style={{ width: `${pct}%` }}
    />
  );

  return (
    <div className={`relative w-full overflow-hidden rounded-full ${track} ${height} ${className}`}>
      <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/25 to-transparent opacity-60" />
      {fill}
    </div>
  );
}
