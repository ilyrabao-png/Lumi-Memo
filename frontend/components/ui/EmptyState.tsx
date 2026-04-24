import type { ReactNode } from "react";

import { LmCard } from "@/components/ui/LmCard";
import { PrimaryButton } from "@/components/ui/PrimaryButton";

type Props = {
  title: string;
  description: string;
  action?: { label: string; href?: string; onClick?: () => void };
  icon?: ReactNode;
  /** Memo-themed panel (review / memory). */
  variant?: "default" | "memo";
};

export function EmptyState({ title, description, action, icon, variant = "default" }: Props) {
  const shell =
    variant === "memo"
      ? "border border-lm-memoSky/50 bg-gradient-to-b from-lm-memoMist/90 via-white to-lm-memoIce/50 shadow-lm-memo-card ring-1 ring-lm-memoSky/25"
      : "border border-dashed border-lm-lineStrong bg-lm-surface/90";

  return (
    <LmCard className={shell}>
      <div className="flex flex-col items-center text-center">
        {icon ? <div className="mb-3 text-3xl">{icon}</div> : null}
        <p className="text-base font-bold text-lm-ink">{title}</p>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-lm-inkMuted">{description}</p>
        {action ? (
          <div className="mt-5 w-full max-w-xs">
            {action.href ? (
              <PrimaryButton href={action.href} variant={variant === "memo" ? "memo" : "lumi"}>
                {action.label}
              </PrimaryButton>
            ) : (
              <PrimaryButton type="button" variant={variant === "memo" ? "memo" : "lumi"} onClick={action.onClick}>
                {action.label}
              </PrimaryButton>
            )}
          </div>
        ) : null}
      </div>
    </LmCard>
  );
}
