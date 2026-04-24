import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

const baseClass =
  "inline-flex min-h-[3rem] w-full items-center justify-center rounded-2xl border border-lm-lineStrong bg-lm-surfaceElevated px-4 text-sm font-bold text-lm-ink shadow-sm transition hover:bg-lm-surface active:scale-[0.99] disabled:opacity-50";

type LinkProps = { href: string; children: ReactNode; className?: string };
type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode; className?: string };

export function SecondaryButton(props: LinkProps | BtnProps) {
  if ("href" in props) {
    const { href, children, className } = props;
    return (
      <Link href={href} className={`${baseClass} ${className ?? ""}`}>
        {children}
      </Link>
    );
  }
  const { children, className, ...rest } = props;
  return (
    <button className={`${baseClass} ${className ?? ""}`} {...rest}>
      {children}
    </button>
  );
}
