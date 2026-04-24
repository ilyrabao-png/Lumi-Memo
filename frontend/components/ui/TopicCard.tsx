import Link from "next/link";

type Tone = "orange" | "blue" | "brown";

const tones: Record<Tone, string> = {
  orange: "from-[#FFF6EE] via-[#FFECD9] to-[#FFE2CF]",
  blue: "from-[#EEF5FB] via-[#E4EDF8] to-[#DDE8F5]",
  brown: "from-[#F6EDE8] via-[#EFE4DD] to-[#E8D9D1]",
};

type Props = {
  title: string;
  subtitle: string;
  tone: Tone;
  href?: string;
  /** Show trailing “View” affordance (intended for linked rows). */
  showView?: boolean;
};

export function TopicCard({ title, subtitle, tone, href, showView }: Props) {
  const showChevron = Boolean(href && showView);

  const inner = (
    <div
      className={`relative flex min-h-[92px] flex-col justify-center overflow-hidden rounded-[1.2rem] border border-lm-line/80 bg-gradient-to-br p-[1.05rem] shadow-lm-stat ring-1 ring-black/[0.02] ${tones[tone]}`}
    >
      <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-white/45 blur-2xl" />
      <div className="pointer-events-none absolute -left-8 bottom-[-40%] h-32 w-32 rounded-full bg-lm-goldSoft/35 blur-2xl" />

      <div className={`relative flex items-start gap-3 ${showChevron ? "pr-1" : ""}`}>
        <div className="min-w-0 flex-1">
          <p className="text-[0.98rem] font-extrabold leading-snug tracking-tight text-lm-ink">{title}</p>
          <p className="mt-1.5 text-[0.72rem] font-semibold leading-snug text-lm-inkMuted">{subtitle}</p>
        </div>
        {showChevron ? (
          <span className="mt-0.5 shrink-0 text-[0.72rem] font-extrabold tracking-wide text-lm-orange">View&nbsp;›</span>
        ) : null}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="group block transition duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lm-home-cta active:translate-y-0"
      >
        {inner}
      </Link>
    );
  }
  return <div>{inner}</div>;
}
