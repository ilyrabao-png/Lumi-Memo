import { LmCard } from "@/components/ui/LmCard";

type Props = {
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
};

export function AchievementCard({ title, description, icon, unlocked }: Props) {
  return (
    <LmCard
      padding="sm"
      className={`${unlocked ? "" : "opacity-60 grayscale"} border-lm-line`}
    >
      <div className="flex gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-lm-bgDeep text-xl">{icon}</div>
        <div className="min-w-0">
          <p className="text-sm font-extrabold text-lm-ink">{title}</p>
          <p className="mt-1 text-xs font-medium leading-relaxed text-lm-inkMuted">{description}</p>
          <p className="mt-2 text-[0.65rem] font-extrabold uppercase tracking-wide text-lm-orange">
            {unlocked ? "Unlocked" : "Locked"}
          </p>
        </div>
      </div>
    </LmCard>
  );
}
