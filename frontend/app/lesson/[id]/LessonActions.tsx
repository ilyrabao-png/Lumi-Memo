"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { LmCard } from "@/components/ui/LmCard";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { SecondaryButton } from "@/components/ui/SecondaryButton";
import { generateFlashcards } from "@/lib/api";

type Props = {
  lessonId: string;
};

export function LessonActions({ lessonId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onGenerate() {
    setError(null);
    setLoading(true);
    try {
      await generateFlashcards(lessonId);
      router.push("/review");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not generate flashcards.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <LmCard padding="lg" className="space-y-4 border-lm-lineStrong">
      <div>
        <p className="text-sm font-extrabold text-lm-ink">Turn this into memory</p>
        <p className="mt-2 text-sm font-medium leading-relaxed text-lm-inkMuted">
          Memo will craft five cards from this lesson. If cards already exist for this lesson, we&apos;ll reuse them.
        </p>
      </div>
      <PrimaryButton type="button" onClick={onGenerate} disabled={loading}>
        {loading ? "Working…" : "Generate flashcards"}
      </PrimaryButton>
      <SecondaryButton type="button" onClick={() => router.push("/review")}>
        Go to review
      </SecondaryButton>
      {error ? <p className="text-center text-sm font-bold text-lm-danger">{error}</p> : null}
    </LmCard>
  );
}
