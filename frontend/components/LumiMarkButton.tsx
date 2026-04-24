import Link from "next/link";

export function LumiMarkButton() {
  return (
    <Link
      href="/lesson/new"
      className="relative flex h-[3.15rem] w-[3.15rem] shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-lm-orange via-lm-coral to-lm-gold text-[1.15rem] shadow-lm-lumi-orb ring-[3px] ring-white/90 ring-offset-2 ring-offset-lm-bg transition hover:-translate-y-0.5 hover:shadow-lm-home-cta hover:brightness-[1.02] active:translate-y-0 active:scale-[0.98]"
      aria-label="Meet Lumi"
      title="Start with Lumi"
    >
      <span className="relative z-[1] leading-none drop-shadow-[0_2px_6px_rgba(0,0,0,0.18)]">🌤️</span>
      <span className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-t from-black/10 to-transparent" />
    </Link>
  );
}
