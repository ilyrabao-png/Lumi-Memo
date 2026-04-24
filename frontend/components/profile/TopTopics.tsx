import { LmCard } from "@/components/ui/LmCard";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { lessonMastery } from "@/lib/lesson-meta";
import { MOCK_TOP_TOPICS } from "@/lib/mock/top-topics";
import type { Lesson } from "@/types/api";

type Row = { id: string; name: string; mastery: number; mock?: boolean };

function buildRows(lessons: Lesson[]): Row[] {
  const fromLessons: Row[] = lessons.slice(0, 4).map((l) => ({
    id: l.id,
    name: l.title,
    mastery: lessonMastery(l),
  }));

  const merged = [...fromLessons];
  let i = 0;
  while (merged.length < 4) {
    const m = MOCK_TOP_TOPICS[i % MOCK_TOP_TOPICS.length];
    merged.push({ id: `mock-${m.id}-${i}`, name: m.name, mastery: m.mastery, mock: true });
    i += 1;
  }
  return merged.slice(0, 4);
}

export function TopTopics({ lessons }: { lessons: Lesson[] }) {
  const rows = buildRows(lessons);

  return (
    <section className="space-y-3">
      <div>
        <h2 className="font-display text-xl font-bold text-lm-ink">Top topics</h2>
        <p className="mt-1 text-sm text-lm-inkMuted">Where your memory is strengthening the most.</p>
      </div>

      <div className="space-y-3">
        {rows.map((row) => (
          <LmCard key={row.id} padding="md" className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-extrabold text-lm-ink">{row.name}</p>
                <p className="mt-1 text-xs font-semibold text-lm-inkMuted">
                  Mastery · {Math.round(row.mastery * 100)}%{row.mock ? " · sample" : ""}
                </p>
              </div>
              <span className="rounded-full bg-lm-blueSoft px-2 py-1 text-[0.65rem] font-extrabold text-lm-inkMuted">
                Focus
              </span>
            </div>
            <ProgressBar value={row.mastery} max={1} />
          </LmCard>
        ))}
      </div>
    </section>
  );
}
