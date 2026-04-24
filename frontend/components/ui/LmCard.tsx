import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
};

const pad: Record<NonNullable<Props["padding"]>, string> = {
  none: "",
  sm: "p-3.5",
  md: "p-4 sm:p-5",
  lg: "p-5 sm:p-6",
};

export function LmCard({ children, className = "", padding = "md" }: Props) {
  return (
    <div
      className={`rounded-[1.35rem] border border-lm-line bg-lm-surfaceElevated/95 shadow-lm-card ${pad[padding]} ${className}`}
    >
      {children}
    </div>
  );
}
