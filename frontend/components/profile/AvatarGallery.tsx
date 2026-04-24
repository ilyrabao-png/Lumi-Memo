"use client";

import { useMemo, useState } from "react";

import { LmCard } from "@/components/ui/LmCard";
import { MOCK_AVATARS, type AvatarItem } from "@/lib/mock/avatars";

export function AvatarGallery() {
  const initial = useMemo(() => MOCK_AVATARS.map((a) => ({ ...a })), []);
  const [items, setItems] = useState<AvatarItem[]>(initial);

  function pick(id: string) {
    setItems((rows) =>
      rows.map((r) => ({
        ...r,
        selected: Boolean(r.unlocked && r.id === id),
      })),
    );
  }

  return (
    <section className="space-y-3">
      <div>
        <h2 className="font-display text-xl font-bold text-lm-ink">Your avatars</h2>
        <p className="mt-1 text-sm text-lm-inkMuted">Pick a study buddy. More unlock as you progress.</p>
      </div>
      <LmCard padding="md" className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {items.map((a) => (
          <button
            key={a.id}
            type="button"
            disabled={!a.unlocked}
            onClick={() => pick(a.id)}
            className={`rounded-2xl border px-2 py-3 text-center transition ${
              a.selected
                ? "border-lm-orange bg-lm-goldSoft/60 shadow-lm-card"
                : "border-lm-line bg-lm-surfaceElevated hover:bg-lm-surface"
            } ${!a.unlocked ? "cursor-not-allowed opacity-45" : ""}`}
          >
            <div className="text-2xl">{a.emoji}</div>
            <div className="mt-2 text-[0.65rem] font-extrabold text-lm-ink">{a.label}</div>
            {!a.unlocked ? <div className="mt-1 text-[0.6rem] font-bold text-lm-inkFaint">Locked</div> : null}
          </button>
        ))}
      </LmCard>
    </section>
  );
}
