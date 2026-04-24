import Link from "next/link";

import { HomeWordmark } from "@/components/brand/HomeWordmark";
import { LumiMarkButton } from "@/components/LumiMarkButton";
import { LmCard } from "@/components/ui/LmCard";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { StatCard } from "@/components/ui/StatCard";
import { TopicCard } from "@/components/ui/TopicCard";
import { getDueToday, getLessons, getProfileSummary } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import { MOCK_SAMPLE_TOPICS } from "@/lib/mock/sample-topics";
import { computeProgression, XP_PER_LEVEL } from "@/lib/progression";

const topicTones = ["orange", "blue", "brown"] as const;

export default async function HomePage() {
  let dueCount = 0;
  let streak = 0;
  let lessons: Awaited<ReturnType<typeof getLessons>> = [];
  let loadError: string | null = null;
  let profile: Awaited<ReturnType<typeof getProfileSummary>> | null = null;

  try {
    const [dueCards, p, ls] = await Promise.all([getDueToday(), getProfileSummary(), getLessons()]);
    dueCount = dueCards.length;
    streak = p.streak;
    profile = p;
    lessons = ls;
  } catch (e) {
    loadError = e instanceof Error ? e.message : "Could not reach the API.";
  }

  const progression = profile
    ? computeProgression({
        totalLessons: profile.total_lessons,
        totalFlashcards: profile.total_flashcards,
        streak: profile.streak,
        activityCount: profile.recent_activity.length,
      })
    : computeProgression({ totalLessons: 0, totalFlashcards: 0, streak: 0, activityCount: 0 });

  const xpLabel = `${progression.xpToNextLevel} XP to Level ${progression.level + 1}`;

  return (
    <main className="space-y-5">
      <header className="flex items-start justify-between gap-4">
        <div className="min-w-0 pt-0.5">
          <HomeWordmark />
          <p className="mt-2 text-[0.8125rem] font-semibold leading-snug text-lm-inkMuted">
            Welcome back! Ready to learn?
          </p>
        </div>
        <LumiMarkButton />
      </header>

      {loadError ? (
        <LmCard padding="lg" className="border-lm-lineStrong bg-lm-surfaceElevated">
          <p className="text-sm font-bold text-lm-danger">We couldn&apos;t reach your study server.</p>
          <p className="mt-2 text-sm leading-relaxed text-lm-inkMuted">
            {loadError} — confirm the API is running at{" "}
            <span className="rounded-lg bg-lm-bgDeep px-2 py-0.5 font-mono text-xs text-lm-ink">
              {process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000"}
            </span>
          </p>
        </LmCard>
      ) : null}

      <div className="grid grid-cols-3 gap-2">
        <StatCard icon="📇" label="To Review" value={dueCount} hint="due today" tone="memo" />
        <StatCard icon="🔥" label="Streak" value={streak} hint="day streak" tone="default" />
        <StatCard icon="✨" label="Level" value={progression.level} hint="learner rank" tone="blue" />
      </div>

      <LmCard
        padding="lg"
        className="space-y-4 rounded-[1.35rem] border-lm-line/90 bg-lm-surfaceElevated shadow-lm-home-cta ring-1 ring-black/[0.035]"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[0.62rem] font-extrabold uppercase tracking-[0.16em] text-lm-inkFaint">Experience</p>
            <p className="mt-2 text-[0.95rem] font-extrabold leading-snug text-lm-ink">
              {progression.xp} XP
              <span className="mt-1 block text-[0.78rem] font-semibold leading-snug text-lm-inkMuted">{xpLabel}</span>
            </p>
          </div>
          <div className="shrink-0 rounded-full border border-lm-line bg-lm-bgDeep/35 px-3 py-1.5 text-center shadow-inner">
            <p className="text-[0.58rem] font-extrabold uppercase tracking-[0.14em] text-lm-inkFaint">Level</p>
            <p className="mt-0.5 text-sm font-extrabold tabular-nums text-lm-ink">{progression.level}</p>
          </div>
        </div>
        <ProgressBar premium value={progression.xpIntoLevel} max={XP_PER_LEVEL} />
      </LmCard>

      <div className="relative overflow-hidden rounded-[1.65rem] bg-lm-memo-hero p-[1px] shadow-lm-memo-cta ring-1 ring-white/40">
        <div className="relative rounded-[1.6rem] bg-gradient-to-br from-white/35 via-white/14 to-lm-memoIce/25 px-5 py-6 sm:px-6 sm:py-7">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-lm-memoDeep/10 via-transparent to-white/20" />
          <div className="relative">
            <p className="max-w-[19rem] text-[1.12rem] font-extrabold leading-snug tracking-tight text-white drop-shadow-[0_2px_12px_rgba(40,70,100,0.25)]">
              {dueCount > 0 ? `${dueCount} things to remember today` : "Your memory check-in for today"}
            </p>
            <p className="mt-2.5 max-w-[21rem] text-[0.8125rem] font-semibold leading-relaxed text-white/95">
              {dueCount > 0
                ? "Memo keeps your knowledge on a gentle schedule — short reviews beat last-minute cramming."
                : "You're all set for now. Memo will remind you when it's time to review again."}
            </p>
            <div className="mt-6 max-w-[14.5rem]">
              <Link
                href="/review"
                className="inline-flex min-h-[3.25rem] w-full items-center justify-center rounded-2xl bg-white/95 px-4 text-[0.95rem] font-extrabold text-lm-memoDeep shadow-[0_10px_28px_rgba(40,80,120,0.2)] ring-1 ring-lm-memoSky/50 transition hover:bg-white hover:shadow-[0_14px_34px_rgba(40,80,120,0.22)] active:scale-[0.99]"
              >
                Open review
              </Link>
            </div>
          </div>
        </div>
      </div>

      <section className="space-y-3.5">
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <h2 className="font-display text-[1.05rem] font-extrabold tracking-tight text-lm-ink">Recent topics</h2>
            <p className="mt-0.5 text-[0.72rem] font-semibold text-lm-inkMuted">Pick up where you left off</p>
          </div>
          <Link
            href="/lesson/new"
            className="mb-0.5 inline-flex items-center rounded-full bg-lm-orange/10 px-3 py-1.5 text-[0.68rem] font-extrabold tracking-wide text-lm-orange ring-1 ring-lm-orange/15 transition hover:bg-lm-orange/15"
          >
            New +
          </Link>
        </div>

        {lessons.length > 0 ? (
          <div className="space-y-2.5">
            {lessons.slice(0, 4).map((lesson, i) => (
              <TopicCard
                key={lesson.id}
                href={`/lesson/${lesson.id}`}
                title={lesson.title}
                subtitle={`Updated · ${formatDateTime(lesson.created_at)}`}
                tone={topicTones[i % topicTones.length]}
                showView
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2.5">
            <LmCard padding="sm" className="border-dashed border-lm-lineStrong bg-lm-surface/80">
              <p className="text-[0.62rem] font-extrabold uppercase tracking-[0.14em] text-lm-inkFaint">Sample topics</p>
              <p className="mt-1 text-sm font-medium leading-relaxed text-lm-inkMuted">
                These are visual examples until your first real lesson appears here.
              </p>
            </LmCard>
            <div className="space-y-2.5">
              {MOCK_SAMPLE_TOPICS.map((t) => (
                <TopicCard key={t.id} title={t.title} subtitle={t.subtitle} tone={t.accent} />
              ))}
            </div>
            <PrimaryButton href="/lesson/new">Create your first lesson</PrimaryButton>
          </div>
        )}
      </section>
    </main>
  );
}
