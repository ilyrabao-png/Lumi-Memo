import Link from "next/link";

import { ProgressBar } from "@/components/ui/ProgressBar";

type Props = {
  href: string;
  title: string;
  subject: string;
  dateLabel: string;
  mastery: number;
  done: number;
  total: number;
};

export function LessonArchiveCard({ href, title, subject, dateLabel, mastery, done, total }: Props) {
  return (
    <Link
      href={href}
      className="block rounded-[1.25rem] border border-lm-line bg-lm-surfaceElevated p-4 shadow-lm-card transition hover:-translate-y-0.5 hover:shadow-lm-card-hover"
    >
      <div className="flex gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-lm-blueSoft text-xl">📘</div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[0.95rem] font-extrabold text-lm-ink">{title}</p>
          <p className="mt-0.5 text-xs font-semibold text-lm-inkMuted">
            {subject} · {dateLabel}
          </p>
          <div className="mt-3 space-y-1.5">
            <ProgressBar value={mastery} />
            <p className="text-right text-[0.7rem] font-bold text-lm-inkMuted">
              {done}/{total} checkpoints
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
