import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

const lumiClass =
  "inline-flex min-h-[3.25rem] w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-lm-orange to-lm-gold px-4 text-[0.95rem] font-bold text-white shadow-lm-fab transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-55";

const memoClass =
  "inline-flex min-h-[3.25rem] w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-lm-memoDeep via-lm-memoCore to-lm-memoSky px-4 text-[0.95rem] font-bold text-white shadow-lm-memo-fab transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-55";

function baseFor(variant: "lumi" | "memo" | undefined) {
  return variant === "memo" ? memoClass : lumiClass;
}

type LinkProps = {
  href: string;
  children: ReactNode;
  className?: string;
  variant?: "lumi" | "memo";
};

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  className?: string;
  variant?: "lumi" | "memo";
};

export function PrimaryButton(props: LinkProps | BtnProps) {
  if ("href" in props) {
    const { href, children, className, variant } = props;
    return (
      <Link href={href} className={`${baseFor(variant)} ${className ?? ""}`}>
        {children}
      </Link>
    );
  }
  const { children, className, variant, ...rest } = props;
  return (
    <button className={`${baseFor(variant)} ${className ?? ""}`} {...rest}>
      {children}
    </button>
  );
}
