import type { ReactNode } from "react";

import { BottomNav } from "@/components/BottomNav";
import { MobileContainer } from "@/components/layout/MobileContainer";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-lm-bg">
      <MobileContainer>
        <div className="pb-28 pt-6 sm:pt-8">{children}</div>
      </MobileContainer>
      <BottomNav />
    </div>
  );
}
