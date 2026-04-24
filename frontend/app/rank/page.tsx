import { LmCard } from "@/components/ui/LmCard";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { getProfileSummary } from "@/lib/api";
import { MOCK_LEADERBOARD } from "@/lib/mock/leaderboard";
import { computeProgression } from "@/lib/progression";

export default async function RankPage() {
  let profile: Awaited<ReturnType<typeof getProfileSummary>> | null = null;
  let error: string | null = null;
  try {
    profile = await getProfileSummary();
  } catch (e) {
    error = e instanceof Error ? e.message : "Could not load your stats.";
  }

  const progression = profile
    ? computeProgression({
        totalLessons: profile.total_lessons,
        totalFlashcards: profile.total_flashcards,
        streak: profile.streak,
        activityCount: profile.recent_activity.length,
      })
    : computeProgression({ totalLessons: 0, totalFlashcards: 0, streak: 0, activityCount: 0 });

  const youRank = 4;

  return (
    <main className="space-y-5">
      <ScreenHeader title="Leaderboard" subtitle="Weekly rankings" backHref="/" />

      {error ? (
        <LmCard padding="lg" className="border-lm-lineStrong">
          <p className="text-sm font-bold text-lm-danger">{error}</p>
          <p className="mt-2 text-sm text-lm-inkMuted">Showing mock rankings only for now.</p>
        </LmCard>
      ) : null}

      <LmCard padding="lg" className="relative overflow-hidden border-lm-orange/25 bg-gradient-to-br from-lm-goldSoft/40 via-white to-lm-blueSoft/30">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/50 blur-2xl" />
        <div className="relative flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-white text-3xl shadow-lm-card">🦊</div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-extrabold uppercase tracking-wide text-lm-inkFaint">Your rank</p>
            <p className="mt-1 text-lg font-extrabold text-lm-ink">#{youRank} · Learning Fox</p>
            <div className="mt-2 flex flex-wrap gap-2 text-xs font-extrabold text-lm-inkMuted">
              <span className="rounded-full bg-white/70 px-2 py-1">{progression.xp} XP</span>
              <span className="rounded-full bg-white/70 px-2 py-1">Lvl {progression.level}</span>
              <span className="rounded-full bg-white/70 px-2 py-1">{profile?.streak ?? 0} streak</span>
            </div>
          </div>
        </div>
      </LmCard>

      <div className="grid grid-cols-3 gap-2">
        {MOCK_LEADERBOARD.slice(0, 3).map((row) => (
          <LmCard key={row.id} padding="sm" className="text-center">
            <div className="text-2xl">{row.avatar}</div>
            <p className="mt-2 text-xs font-extrabold text-lm-inkFaint">#{row.rank}</p>
            <p className="mt-1 truncate text-sm font-extrabold text-lm-ink">{row.name}</p>
            <p className="mt-1 text-[0.65rem] font-bold text-lm-inkMuted">{row.xp} XP</p>
          </LmCard>
        ))}
      </div>

      <LmCard padding="none" className="overflow-hidden">
        <div className="border-b border-lm-line bg-lm-bgDeep/35 px-4 py-3">
          <p className="text-xs font-extrabold uppercase tracking-wide text-lm-inkFaint">All rankings</p>
        </div>
        <ul className="divide-y divide-lm-line">
          {MOCK_LEADERBOARD.map((row) => (
            <li key={row.id} className="flex items-center gap-3 px-4 py-3">
              <p className="w-8 text-sm font-extrabold text-lm-inkMuted">#{row.rank}</p>
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-lm-bgDeep text-lg">{row.avatar}</div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-extrabold text-lm-ink">{row.name}</p>
                <p className="text-xs font-semibold text-lm-inkMuted">
                  Level {row.level} · {row.streak} streak
                </p>
              </div>
              <p className="text-xs font-extrabold text-lm-orange">{row.xp} XP</p>
            </li>
          ))}
          <li className="flex items-center gap-3 bg-lm-goldSoft/35 px-4 py-3">
            <p className="w-8 text-sm font-extrabold text-lm-orange">#{youRank}</p>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-lg shadow-sm">🦊</div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-extrabold text-lm-ink">You</p>
              <p className="text-xs font-semibold text-lm-inkMuted">
                Level {progression.level} · {profile?.streak ?? 0} streak
              </p>
            </div>
            <p className="text-xs font-extrabold text-lm-orange">{progression.xp} XP</p>
          </li>
        </ul>
      </LmCard>

      <LmCard padding="md" className="border-dashed border-lm-lineStrong">
        <p className="text-xs font-extrabold uppercase tracking-wide text-lm-inkFaint">Mock data</p>
        <p className="mt-2 text-sm font-medium text-lm-inkMuted">
          Rankings are illustrative until a real leaderboard API ships. Your XP/level here are derived from your actual
          lessons, cards, streak, and activity counts.
        </p>
      </LmCard>
    </main>
  );
}
