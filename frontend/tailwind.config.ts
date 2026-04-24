import type { Config } from "tailwindcss";

import { colors, gradients, shadows } from "./lib/tokens";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-sans)", "ui-serif", "Georgia"],
      },
      colors: {
        lm: colors as Record<string, string>,
      },
      boxShadow: {
        "lm-card": shadows.card,
        "lm-card-hover": shadows.cardHover,
        "lm-nav": shadows.nav,
        "lm-fab": shadows.fab,
        "lm-stat": shadows.stat,
        "lm-lumi-orb": shadows.lumiOrb,
        "lm-home-cta": shadows.homeCta,
        "lm-fab-strong": shadows.fabStrong,
        "lm-memo-card": shadows.memoCard,
        "lm-memo-cta": shadows.memoCta,
        "lm-memo-fab": shadows.memoFab,
      },
      backgroundImage: {
        "lm-cta": gradients.cta,
        "lm-cta-soft": gradients.ctaSoft,
        "lm-banner": gradients.banner,
        "lm-bar": gradients.bar,
        "lm-home-hero": gradients.homeHero,
        "lm-memo-hero": gradients.memoHero,
        "lm-memo-bar": gradients.memoBar,
      },
    },
  },
  plugins: [],
};

export default config;
