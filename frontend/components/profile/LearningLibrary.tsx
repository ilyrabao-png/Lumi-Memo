"use client";

import { useMemo, useState } from "react";

import { Chip } from "@/components/ui/Chip";
import { LessonArchiveCard } from "@/components/ui/LessonArchiveCard";
import { LmCard } from "@/components/ui/LmCard";
import { SearchBar } from "@/components/ui/SearchBar";
import { lessonDisplayDate, lessonMastery, lessonProgressCounts, lessonSubject } from "@/lib/lesson-meta";
import type { Lesson } from "@/types/api";

const CATEGORIES = ["All", "Science", "Math", "Language", "Humanities", "General"] as const;

type Props = {
  lessons: Lesson[];
};

export function LearningLibrary({ lessons }: Props) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<(typeof CATEGORIES)[number]>("All");
  const [sort, setSort] = useState<"recent" | "az">("recent");

  const filtered = useMemo(() => {
    let rows = lessons.slice();
    if (q.trim()) {
      const n = q.toLowerCase();
      rows = rows.filter((l) => l.title.toLowerCase().includes(n) || l.summary.toLowerCase().includes(n));
    }
    if (cat !== "All") {
      rows = rows.filter((l) => lessonSubject(l) === cat);
    }
    rows.sort((a, b) => {
      if (sort === "az") return a.title.localeCompare(b.title);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    return rows;
  }, [lessons, q, cat, sort]);

  return (
    <section className="space-y-4">
      <div>
        <h2 className="font-display text-xl font-bold text-lm-ink">My Learning Library</h2>
        <p className="mt-1 text-sm text-lm-inkMuted">Browse everything you&apos;ve turned into lessons.</p>
      </div>

      <LmCard padding="md" className="space-y-4">
        <SearchBar value={q} onChange={setQ} placeholder="Search lessons…" />
        <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {CATEGORIES.map((c) => (
            <Chip key={c} active={cat === c} onClick={() => setCat(c)}>
              {c}
            </Chip>
          ))}
        </div>
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-bold text-lm-ink">
            {filtered.length} lesson{filtered.length === 1 ? "" : "s"}
          </p>
          <div className="flex items-center gap-2 text-xs font-extrabold text-lm-inkMuted">
            <span>Sort</span>
            <button
              type="button"
              onClick={() => setSort("recent")}
              className={`rounded-full px-3 py-1 ${sort === "recent" ? "bg-lm-orange text-white" : "bg-lm-bgDeep/60"}`}
            >
              Recent
            </button>
            <button
              type="button"
              onClick={() => setSort("az")}
              className={`rounded-full px-3 py-1 ${sort === "az" ? "bg-lm-orange text-white" : "bg-lm-bgDeep/60"}`}
            >
              A–Z
            </button>
          </div>
        </div>
      </LmCard>

      {filtered.length === 0 ? (
        <LmCard padding="lg" className="border-dashed border-lm-lineStrong text-center">
          <p className="text-sm font-bold text-lm-ink">No lessons match</p>
          <p className="mt-2 text-sm text-lm-inkMuted">Try another search or category.</p>
        </LmCard>
      ) : (
        <div className="space-y-3">
          {filtered.map((lesson) => {
            const mastery = lessonMastery(lesson);
            const { done, total } = lessonProgressCounts(lesson);
            return (
              <LessonArchiveCard
                key={lesson.id}
                href={`/lesson/${lesson.id}`}
                title={lesson.title}
                subject={lessonSubject(lesson)}
                dateLabel={lessonDisplayDate(lesson)}
                mastery={mastery}
                done={done}
                total={total}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}
