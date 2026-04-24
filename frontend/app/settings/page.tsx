"use client";

import { useMemo, useState } from "react";

import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { LmCard } from "@/components/ui/LmCard";
import { SecondaryButton } from "@/components/ui/SecondaryButton";

type ToggleProps = {
  label: string;
  description?: string;
  on: boolean;
  onToggle: () => void;
};

function ToggleRow({ label, description, on, onToggle }: ToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-start justify-between gap-4 rounded-2xl border border-lm-line bg-lm-surfaceElevated px-4 py-3 text-left shadow-sm transition hover:bg-lm-surface"
    >
      <div className="min-w-0">
        <p className="text-sm font-extrabold text-lm-ink">{label}</p>
        {description ? <p className="mt-1 text-xs font-semibold text-lm-inkMuted">{description}</p> : null}
      </div>
      <span
        className={`relative mt-0.5 inline-flex h-7 w-12 shrink-0 items-center rounded-full p-1 transition ${
          on ? "bg-lm-orange" : "bg-lm-bgDeep"
        }`}
      >
        <span
          className={`h-5 w-5 rounded-full bg-white shadow transition ${on ? "translate-x-5" : "translate-x-0"}`}
        />
      </span>
    </button>
  );
}

export default function SettingsPage() {
  const [notif, setNotif] = useState(true);
  const [streakWarn, setStreakWarn] = useState(true);
  const [daily, setDaily] = useState(true);
  const [language, setLanguage] = useState("English");
  const [theme, setTheme] = useState("Light");

  const langs = useMemo(() => ["English", "Español", "Français"], []);
  const themes = useMemo(() => ["Light", "Dark", "System"], []);

  return (
    <main className="space-y-5">
      <ScreenHeader title="Settings" subtitle="Tune reminders and study comfort." backHref="/profile" />

      <LmCard padding="md" className="space-y-3 border-dashed border-lm-lineStrong">
        <p className="text-xs font-extrabold uppercase tracking-wide text-lm-inkFaint">Local preview</p>
        <p className="text-sm font-medium text-lm-inkMuted">
          These controls update UI state only. Wire them to Supabase preferences when your backend is ready.
        </p>
      </LmCard>

      <section className="space-y-3">
        <p className="text-xs font-extrabold uppercase tracking-wide text-lm-inkFaint">Account</p>
        <LmCard padding="md" className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-extrabold text-lm-ink">Email</p>
              <p className="mt-1 text-xs font-semibold text-lm-inkMuted">you@example.com</p>
            </div>
            <SecondaryButton type="button" className="!w-auto min-h-[2.75rem] px-4">
              Edit
            </SecondaryButton>
          </div>
        </LmCard>
      </section>

      <section className="space-y-3">
        <p className="text-xs font-extrabold uppercase tracking-wide text-lm-inkFaint">Language & theme</p>
        <LmCard padding="md" className="space-y-3">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-extrabold text-lm-ink">Language</p>
            <div className="flex flex-wrap gap-2">
              {langs.map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLanguage(l)}
                  className={`rounded-full px-3 py-2 text-xs font-extrabold ${
                    language === l ? "bg-lm-orange text-white" : "bg-lm-bgDeep/60 text-lm-inkMuted"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2 border-t border-lm-line pt-3">
            <p className="text-sm font-extrabold text-lm-ink">Theme</p>
            <div className="flex flex-wrap gap-2">
              {themes.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTheme(t)}
                  className={`rounded-full px-3 py-2 text-xs font-extrabold ${
                    theme === t ? "bg-lm-orange text-white" : "bg-lm-bgDeep/60 text-lm-inkMuted"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </LmCard>
      </section>

      <section className="space-y-3">
        <p className="text-xs font-extrabold uppercase tracking-wide text-lm-inkFaint">Notifications</p>
        <div className="space-y-2">
          <ToggleRow label="Daily review reminders" description="A gentle nudge when cards are waiting." on={daily} onToggle={() => setDaily((v) => !v)} />
          <ToggleRow label="Streak warnings" description="Heads-up before a streak might rest." on={streakWarn} onToggle={() => setStreakWarn((v) => !v)} />
          <ToggleRow label="Product updates" description="Occasional notes from Lumi & Memo." on={notif} onToggle={() => setNotif((v) => !v)} />
        </div>
      </section>

      <section className="space-y-3">
        <p className="text-xs font-extrabold uppercase tracking-wide text-lm-inkFaint">Study session</p>
        <LmCard padding="md" className="space-y-3">
          <label className="block text-sm font-extrabold text-lm-ink">
            Daily review time
            <input
              defaultValue="7:30 PM"
              className="mt-2 w-full rounded-2xl border border-lm-line bg-lm-surfaceElevated px-4 py-3 text-sm font-semibold text-lm-ink outline-none focus:ring-4 focus:ring-lm-orange/20"
            />
          </label>
          <label className="block text-sm font-extrabold text-lm-ink">
            Cards per session
            <input
              defaultValue="20"
              type="number"
              className="mt-2 w-full rounded-2xl border border-lm-line bg-lm-surfaceElevated px-4 py-3 text-sm font-semibold text-lm-ink outline-none focus:ring-4 focus:ring-lm-orange/20"
            />
          </label>
        </LmCard>
      </section>

      <section className="space-y-3">
        <p className="text-xs font-extrabold uppercase tracking-wide text-lm-inkFaint">Privacy</p>
        <LmCard padding="md" className="space-y-2">
          <SecondaryButton type="button">Download my data</SecondaryButton>
          <SecondaryButton type="button">Delete account</SecondaryButton>
        </LmCard>
      </section>
    </main>
  );
}
