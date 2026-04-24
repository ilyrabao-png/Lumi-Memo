import Link from "next/link";

import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { LmCard } from "@/components/ui/LmCard";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { SecondaryButton } from "@/components/ui/SecondaryButton";

export default function AuthPage() {
  return (
    <main className="space-y-5">
      <ScreenHeader title="Welcome in" subtitle="Supabase Auth will land here soon." backHref="/profile" />

      <LmCard padding="lg" className="space-y-3">
        <p className="text-sm font-medium leading-relaxed text-lm-inkMuted">
          For now, the API uses a default dev user. When auth is connected, this screen will host email magic links,
          passwords, or OAuth — whatever you choose for Lumi & Memo.
        </p>
      </LmCard>

      <PrimaryButton type="button" disabled>
        Continue with email
      </PrimaryButton>
      <SecondaryButton type="button" disabled>
        Continue with Google
      </SecondaryButton>

      <LmCard padding="md" className="text-center">
        <p className="text-xs font-extrabold uppercase tracking-wide text-lm-inkFaint">Design note</p>
        <p className="mt-2 text-sm text-lm-inkMuted">Buttons are disabled intentionally in this MVP skeleton.</p>
      </LmCard>

      <div className="text-center">
        <Link href="/" className="text-sm font-extrabold text-lm-orange underline-offset-4 hover:underline">
          Back to home
        </Link>
      </div>
    </main>
  );
}
