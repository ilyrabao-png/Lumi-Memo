import type { ReactNode } from "react";

import Link from "next/link";

import { IconBack } from "@/components/icons";

type Props = {
  title: string;
  subtitle?: string;
  rightSlot?: ReactNode;
  backHref?: string;
};

export function ScreenHeader({ title, subtitle, rightSlot, backHref }: Props) {
  return (
    <header className="mb-5 flex items-start gap-3">
      {backHref ? (
        <Link
          href={backHref}
          className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-lm-line bg-lm-surfaceElevated text-lm-ink shadow-sm"
          aria-label="Back"
        >
          <IconBack className="h-5 w-5" />
        </Link>
      ) : (
        <span className="mt-0.5 h-10 w-10 shrink-0" aria-hidden />
      )}
      <div className="min-w-0 flex-1">
        <h1 className="font-display text-[1.6rem] font-bold leading-tight tracking-tight text-lm-ink">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm leading-relaxed text-lm-inkMuted">{subtitle}</p> : null}
      </div>
      {rightSlot ? <div className="shrink-0 pt-0.5">{rightSlot}</div> : <span className="h-10 w-10 shrink-0" aria-hidden />}
    </header>
  );
}
