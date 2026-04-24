import type { ReactNode } from "react";

export function MobileContainer({ children }: { children: ReactNode }) {
  return <div className="mx-auto w-full max-w-md px-4 sm:px-5">{children}</div>;
}
