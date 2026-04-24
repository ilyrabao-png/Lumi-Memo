import Link from "next/link";

import { AvatarGallery } from "@/components/profile/AvatarGallery";
import { LearningLibrary } from "@/components/profile/LearningLibrary";
import { TopTopics } from "@/components/profile/TopTopics";
import { IconSettings } from "@/components/icons";
import { AchievementCard } from "@/components/ui/AchievementCard";
import { LmCard } from "@/components/ui/LmCard";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { getLessons, getProfileSummary } from "@/lib/api";
import { MOCK_ACHIEVEMENTS } from "@/lib/mock/achievements";
import { computeProgression, XP_PER_LEVEL } from "@/lib/progression";

export default async function ProfilePage() {
  let profile: Awaited<ReturnType<typeof getProfileSummary>>;
  let lessons: Awaited<ReturnType<typeof getLessons>> = [];
  let error: string | null = null;

  try {
    const [p, ls] = await Promise.all([getProfileSummary(), getLessons()]);
    profile = p;
    lessons = ls;
  } catch (e) {
    error = e instanceof Error ? e.message : "Could not load profile.";
    profile = {
      user_id: "",
      total_lessons: 0,
      total_flashcards: 0,
      streak: 0,
      recent_activity: [],
    };
  }

  const progression = computeProgression({
    totalLessons: profile.total_lessons,
    totalFlashcards: profile.total_flashcards,
    streak: profile.streak,
    activityCount: profile.recent_activity.length,
  });

  const reviewsLogged = profile.recent_activity.filter((a) => a.kind === "review").length;

  return (
    <main className="space-y-6">
      <ScreenHeader
        title="Your Profile"
        subtitle="Warm progress, gentle pace."
        rightSlot={
          <Link
            href="/settings"
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-lm-line bg-lm-surfaceElevated text-lm-ink shadow-sm transition hover:bg-lm-surface"
            aria-label="Settings"
          >
            <IconSettings className="h-5 w-5" />
          </Link>
        }
      />

      {error ? (
        <LmCard padding="lg" className="border-lm-lineStrong">
          <p className="text-sm font-bold text-lm-danger">{error}</p>
          <p className="mt-2 text-sm text-lm-inkMuted">Some sections below use mock visuals until the API responds.</p>
        </LmCard>
      ) : null}

      <LmCard padding="lg" className="relative overflow-hidden">
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-lm-goldSoft/50 blur-3xl" />
        <div className="relative flex items-start gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-4xl shadow-lm-card">🦊</div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-extrabold uppercase tracking-wide text-lm-inkFaint">Learner</p>
            <p className="mt-1 text-xl font-extrabold text-lm-ink">Learning Fox</p>
            <p className="mt-2 text-sm font-medium text-lm-inkMuted">Small steps add up — you&apos;re building something meaningful.</p>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between gap-3 text-xs font-extrabold text-lm-inkMuted">
                <span>
                  {progression.xpToNextLevel} XP to Level {progression.level + 1}
                </span>
                <span>Level {progression.level}</span>
              </div>
              <ProgressBar thick value={progression.xpIntoLevel} max={XP_PER_LEVEL} />
            </div>
          </div>
        </div>
      </LmCard>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <LmCard padding="sm" className="text-center">
          <p className="text-[0.65rem] font-extrabold uppercase tracking-wide text-lm-inkFaint">Streak</p>
          <p className="mt-2 text-2xl font-extrabold text-lm-orange">{profile.streak}</p>
        </LmCard>
        <LmCard padding="sm" className="text-center">
          <p className="text-[0.65rem] font-extrabold uppercase tracking-wide text-lm-inkFaint">Lessons</p>
          <p className="mt-2 text-2xl font-extrabold text-lm-ink">{profile.total_lessons}</p>
        </LmCard>
        <LmCard padding="sm" className="text-center">
          <p className="text-[0.65rem] font-extrabold uppercase tracking-wide text-lm-inkFaint">Cards</p>
          <p className="mt-2 text-2xl font-extrabold text-lm-ink">{profile.total_flashcards}</p>
        </LmCard>
        <LmCard padding="sm" className="text-center">
          <p className="text-[0.65rem] font-extrabold uppercase tracking-wide text-lm-inkFaint">Reviewed</p>
          <p className="mt-2 text-2xl font-extrabold text-lm-ink">{reviewsLogged || profile.total_flashcards}</p>
          <p className="mt-1 text-[0.6rem] font-bold text-lm-inkFaint">{reviewsLogged ? "events" : "cards (est.)"}</p>
        </LmCard>
      </div>

      <TopTopics lessons={lessons} />

      <section className="space-y-3">
        <div>
          <h2 className="font-display text-xl font-bold text-lm-ink">Recent achievements</h2>
          <p className="mt-1 text-sm text-lm-inkMuted">Celebrate the little wins along the way.</p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {MOCK_ACHIEVEMENTS.map((a) => (
            <AchievementCard key={a.id} {...a} />
          ))}
        </div>
      </section>

      <LearningLibrary lessons={lessons} />

      <AvatarGallery />

      <LmCard padding="md" className="text-center">
        <p className="text-sm font-bold text-lm-ink">Need Supabase auth?</p>
        <p className="mt-2 text-sm text-lm-inkMuted">We&apos;ll wire sign-in here next — for now this is a styled placeholder.</p>
        <div className="mt-4">
          <Link href="/auth" className="text-sm font-extrabold text-lm-orange underline-offset-4 hover:underline">
            View auth placeholder
          </Link>
        </div>
      </LmCard>
    </main>
  );
}
