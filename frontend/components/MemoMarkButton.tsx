import Link from "next/link";

export function MemoMarkButton({ href = "/review" }: { href?: string }) {
  return (
    <Link
      href={href}
      className="flex h-11 w-11 items-center justify-center rounded-full border border-lm-memoSky/50 bg-gradient-to-br from-lm-memoIce via-white to-lm-memoSky/50 text-lg shadow-lm-memo-fab ring-2 ring-white/90 transition hover:brightness-[1.02] active:scale-95"
      aria-label="Memo"
      title="Memo"
    >
      <span className="leading-none drop-shadow-sm">🧠</span>
    </Link>
  );
}
