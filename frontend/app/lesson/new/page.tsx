"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { IconSparkle } from "@/components/icons";
import { LmCard } from "@/components/ui/LmCard";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { generateLesson } from "@/lib/api";

export default function NewLessonPage() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!text.trim()) {
      setError("Paste some text to create a lesson.");
      return;
    }
    setLoading(true);
    try {
      const lesson = await generateLesson(text);
      router.push(`/lesson/${lesson.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="space-y-5">
      <ScreenHeader title="Add Lesson" subtitle="Lumi prepares a calm, structured lesson from your notes." backHref="/" />

      <div className="relative overflow-hidden rounded-[1.5rem] bg-lm-banner p-[1px] shadow-lm-card">
        <div className="rounded-[1.45rem] bg-white/10 p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/25 text-2xl shadow-inner">🌤️</div>
            <div className="min-w-0">
              <p className="text-lg font-extrabold text-white">Hi, I&apos;m Lumi!</p>
              <p className="mt-2 text-sm font-semibold leading-relaxed text-white/90">
                I&apos;ll help you understand any topic. Just share what you&apos;d like to learn.
              </p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <LmCard padding="none" className="overflow-hidden">
          <div className="border-b border-lm-line bg-lm-bgDeep/40 px-5 py-4">
            <p className="text-sm font-extrabold text-lm-ink">Paste your content</p>
            <p className="mt-1 text-xs font-semibold text-lm-inkMuted">Notes, articles, or class snippets work great.</p>
          </div>
          <label htmlFor="raw" className="sr-only">
            Source text
          </label>
          <textarea
            id="raw"
            name="raw"
            rows={10}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Drop your text here…"
            className="w-full resize-y bg-transparent px-5 py-4 text-sm font-medium leading-relaxed text-lm-ink outline-none placeholder:text-lm-inkFaint"
            disabled={loading}
          />
        </LmCard>

        {error ? (
          <LmCard padding="md" className="border-lm-lineStrong">
            <p className="text-sm font-bold text-lm-danger">{error}</p>
          </LmCard>
        ) : null}

        <PrimaryButton type="submit" disabled={loading} className="gap-2">
          <IconSparkle className="h-5 w-5 text-white/95" />
          {loading ? "Generating…" : "Generate Lesson"}
        </PrimaryButton>
      </form>

      <div className="grid grid-cols-2 gap-3">
        <LmCard padding="md" className="relative overflow-hidden opacity-70">
          <div className="absolute right-3 top-3 rounded-full bg-lm-bgDeep px-2 py-1 text-[0.6rem] font-extrabold uppercase tracking-wide text-lm-inkMuted">
            Coming soon
          </div>
          <p className="text-sm font-extrabold text-lm-ink">Upload PDF</p>
          <p className="mt-2 text-xs font-semibold text-lm-inkMuted">Bring readings straight into Lumi.</p>
        </LmCard>
        <LmCard padding="md" className="relative overflow-hidden opacity-70">
          <div className="absolute right-3 top-3 rounded-full bg-lm-bgDeep px-2 py-1 text-[0.6rem] font-extrabold uppercase tracking-wide text-lm-inkMuted">
            Coming soon
          </div>
          <p className="text-sm font-extrabold text-lm-ink">Add Photo</p>
          <p className="mt-2 text-xs font-semibold text-lm-inkMuted">Snap a page and learn on the go.</p>
        </LmCard>
      </div>
    </main>
  );
}
