import type { CSSProperties } from "react";

import { wordmark } from "@/lib/tokens";

const lumiSpanStyle: CSSProperties = {
  backgroundImage: wordmark.lumiGradient,
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
};

/**
 * “Lumi & Memo” lockup for the Home header — gradient Lumi, soft ampersand, powder Memo.
 */
export function HomeWordmark() {
  return (
    <h1 className="font-display text-[1.72rem] leading-[1.12] tracking-[-0.03em]">
      <span className="inline-flex flex-wrap items-baseline gap-x-[0.14em]">
        <span
          className="relative inline-block font-bold drop-shadow-[0_1px_14px_rgba(234,98,46,0.2)]"
          style={lumiSpanStyle}
        >
          Lumi
        </span>
        <span className="select-none font-medium text-[0.84em] tracking-[-0.06em]" style={{ color: wordmark.amp }}>
          {"\u2009&\u2009"}
        </span>
        <span className="font-semibold tracking-[-0.025em]" style={{ color: wordmark.memo }}>
          Memo
        </span>
      </span>
    </h1>
  );
}
