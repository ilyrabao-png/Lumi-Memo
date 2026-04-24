"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { IconHome, IconPlus, IconRank, IconReview, IconUser } from "@/components/icons";

const tabs = [
  { href: "/", label: "Home", Icon: IconHome, match: (p: string) => p === "/", accent: "lumi" as const },
  { href: "/review", label: "Review", Icon: IconReview, match: (p: string) => p.startsWith("/review"), accent: "memo" as const },
  { href: "/rank", label: "Rank", Icon: IconRank, match: (p: string) => p.startsWith("/rank"), accent: "neutral" as const },
  {
    href: "/profile",
    label: "Profile",
    Icon: IconUser,
    match: (p: string) => p.startsWith("/profile") || p.startsWith("/settings"),
    accent: "neutral" as const,
  },
] as const;

function TabLink({
  href,
  label,
  Icon,
  active,
  accent,
}: {
  href: string;
  label: string;
  Icon: typeof IconHome;
  active: boolean;
  accent: "lumi" | "memo" | "neutral";
}) {
  const activeShell =
    accent === "memo" && active
      ? "bg-lm-memoIce/80 ring-1 ring-lm-memoSky/40"
      : accent === "lumi" && active
        ? "bg-lm-orange/[0.09]"
        : active
          ? "bg-black/[0.03]"
          : "hover:bg-black/[0.02]";

  const activeInk =
    accent === "memo" && active
      ? "text-lm-memoDeep"
      : accent === "lumi" && active
        ? "text-lm-orange"
        : active
          ? "text-lm-ink"
          : "text-lm-inkMuted";

  return (
    <Link href={href} className={`flex flex-1 flex-col items-center justify-end rounded-2xl pb-1.5 pt-1.5 transition ${activeShell}`}>
      <div className={`flex flex-col items-center gap-0.5 ${activeInk}`}>
        <Icon className="h-[22px] w-[22px]" />
        <span className="text-[0.62rem] font-extrabold uppercase tracking-[0.12em]">{label}</span>
      </div>
    </Link>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  const addActive = pathname.startsWith("/lesson/new");

  return (
    <nav className="pointer-events-none fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-safe">
      <div className="pointer-events-auto relative mx-auto w-full max-w-md px-3">
        <div className="relative mb-2 rounded-[1.85rem] border border-white/70 bg-lm-surfaceElevated/[0.92] px-1.5 shadow-lm-nav backdrop-blur-2xl ring-1 ring-black/[0.04]">
          <div className="flex items-end pb-1 pt-0.5">
            <div className="flex flex-1">
              <TabLink href={tabs[0].href} label={tabs[0].label} Icon={tabs[0].Icon} active={tabs[0].match(pathname)} accent={tabs[0].accent} />
              <TabLink href={tabs[1].href} label={tabs[1].label} Icon={tabs[1].Icon} active={tabs[1].match(pathname)} accent={tabs[1].accent} />
            </div>
            <div className="w-[4.25rem] shrink-0" />
            <div className="flex flex-1">
              <TabLink href={tabs[2].href} label={tabs[2].label} Icon={tabs[2].Icon} active={tabs[2].match(pathname)} accent={tabs[2].accent} />
              <TabLink href={tabs[3].href} label={tabs[3].label} Icon={tabs[3].Icon} active={tabs[3].match(pathname)} accent={tabs[3].accent} />
            </div>
          </div>
        </div>

        <Link
          href="/lesson/new"
          aria-label="Add lesson"
          className={`pointer-events-auto absolute left-1/2 top-[-1.55rem] flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full bg-gradient-to-br from-lm-orange via-lm-coral to-lm-gold text-white shadow-lm-fab-strong ring-[5px] ring-lm-bg ring-offset-0 transition hover:-translate-y-0.5 hover:brightness-[1.03] active:translate-y-0 active:scale-[0.97] ${
            addActive ? "ring-lm-goldSoft/90" : ""
          }`}
        >
          <span className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-t from-black/10 to-transparent" />
          <IconPlus className="relative h-7 w-7 drop-shadow-[0_2px_6px_rgba(0,0,0,0.2)]" />
        </Link>
      </div>
    </nav>
  );
}
