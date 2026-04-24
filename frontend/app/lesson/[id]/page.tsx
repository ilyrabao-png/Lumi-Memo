import { notFound } from "next/navigation";

import { LmCard } from "@/components/ui/LmCard";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { getLessonById } from "@/lib/api";
import { formatDateTime } from "@/lib/format";

import { LessonActions } from "./LessonActions";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function LessonDetailPage({ params }: Props) {
  const { id } = await params;
  let lesson: Awaited<ReturnType<typeof getLessonById>>;
  try {
    lesson = await getLessonById(id);
  } catch {
    notFound();
  }

  return (
    <main className="space-y-5">
      <ScreenHeader title={lesson.title} subtitle={`Created ${formatDateTime(lesson.created_at)}`} backHref="/" />

      <LmCard padding="lg" className="space-y-2">
        <h2 className="text-xs font-extrabold uppercase tracking-wide text-lm-inkFaint">Summary</h2>
        <p className="text-sm font-medium leading-relaxed text-lm-inkMuted">{lesson.summary}</p>
      </LmCard>

      <LmCard padding="lg" className="space-y-2">
        <h2 className="text-xs font-extrabold uppercase tracking-wide text-lm-inkFaint">Simple explanation</h2>
        <p className="text-sm font-medium leading-relaxed text-lm-inkMuted">{lesson.simple_explanation}</p>
      </LmCard>

      <LmCard padding="lg" className="space-y-3">
        <h2 className="text-xs font-extrabold uppercase tracking-wide text-lm-inkFaint">Key points</h2>
        <ol className="space-y-2">
          {lesson.key_points.map((point, i) => (
            <li key={i} className="flex gap-3 text-sm font-medium leading-relaxed text-lm-inkMuted">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-lm-goldSoft text-xs font-extrabold text-lm-orange">
                {i + 1}
              </span>
              <span>{point}</span>
            </li>
          ))}
        </ol>
      </LmCard>

      <LmCard padding="lg" className="space-y-2">
        <h2 className="text-xs font-extrabold uppercase tracking-wide text-lm-inkFaint">Example</h2>
        <p className="text-sm font-medium leading-relaxed text-lm-inkMuted">{lesson.example}</p>
      </LmCard>

      <LessonActions lessonId={lesson.id} />
    </main>
  );
}
