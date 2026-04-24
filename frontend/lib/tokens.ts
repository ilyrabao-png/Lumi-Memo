/**
 * Lumi & Memo design tokens — single source for Tailwind + runtime (e.g. inline styles).
 * Adjust here to retheme the app.
 */
export const colors = {
  bg: "#F7F1E8",
  bgDeep: "#EFE6D8",
  surface: "#FFFBF6",
  surfaceElevated: "#FFFFFF",
  ink: "#2B2622",
  inkMuted: "#7A6F66",
  inkFaint: "#A89B91",
  line: "rgba(43, 38, 34, 0.08)",
  lineStrong: "rgba(43, 38, 34, 0.12)",
  orange: "#E85D2C",
  orangeDeep: "#C94A1F",
  gold: "#F2C14E",
  goldSoft: "#F8E6B5",
  blue: "#9BB7D4",
  blueSoft: "#D9E6F2",
  brown: "#8B6F5E",
  brownSoft: "#E8D8CF",
  coral: "#FF8A6A",
  success: "#3FA796",
  danger: "#D14B4B",
  /** Memo — memory / review / retention (cool, calm, luminous) */
  memoMist: "#E8F1FA",
  memoIce: "#DDEAF7",
  memoSky: "#B7D1EA",
  memoAqua: "#A8C5E6",
  memoCore: "#7EA3CC",
  memoSteel: "#93B8D8",
  memoDeep: "#5E7FA3",
  /** Rating accents (review) */
  ratingForgot: "#D97757",
  ratingHard: "#E5A84A",
  ratingGood: "#3FA796",
  ratingEasy: "#6B9BD1",
} as const;

/** Home hero wordmark — Figma-aligned lockup (also used by `HomeWordmark`). */
export const wordmark = {
  /** Warm orange → coral → gold, soft stops for a luminous print feel */
  lumiGradient:
    "linear-gradient(112deg, #E04A1E 0%, #EA6B32 28%, #F08F4A 52%, #EEC45A 78%, #E8D078 100%)",
  /** Muted powder blue — calm, not gray, not saturated */
  memo: "#7B93B0",
  /** Warm bridge between gradient and blue — subtle, not a third “word” */
  amp: "rgba(110, 98, 90, 0.36)",
} as const;

export const radii = {
  sm: "0.75rem",
  md: "1rem",
  lg: "1.25rem",
  xl: "1.5rem",
  "2xl": "1.75rem",
  "3xl": "2rem",
  pill: "9999px",
} as const;

export const shadows = {
  card: "0 10px 30px rgba(43, 38, 34, 0.08), 0 2px 8px rgba(43, 38, 34, 0.04)",
  cardHover: "0 16px 40px rgba(43, 38, 34, 0.1), 0 4px 12px rgba(43, 38, 34, 0.06)",
  nav: "0 -8px 32px rgba(43, 38, 34, 0.08)",
  fab: "0 12px 28px rgba(232, 93, 44, 0.35), 0 4px 12px rgba(43, 38, 34, 0.12)",
  /** Home stat row — soft lift, tight diffusion */
  stat: "0 3px 10px rgba(43, 38, 34, 0.05), 0 14px 28px rgba(43, 38, 34, 0.06)",
  /** Home Lumi orb */
  lumiOrb: "0 10px 26px rgba(232, 93, 44, 0.28), 0 3px 10px rgba(43, 38, 34, 0.1)",
  /** Home hero CTA slab */
  homeCta: "0 20px 50px rgba(220, 95, 55, 0.28), 0 10px 26px rgba(43, 38, 34, 0.1)",
  /** Bottom FAB — richer, app-like */
  fabStrong: "0 18px 40px rgba(232, 93, 44, 0.45), 0 8px 18px rgba(43, 38, 34, 0.14)",
  /** Memo surfaces — cool lift */
  memoCard: "0 12px 32px rgba(70, 110, 150, 0.12), 0 4px 14px rgba(43, 38, 34, 0.05)",
  memoCta: "0 18px 44px rgba(90, 130, 175, 0.22), 0 8px 22px rgba(43, 38, 34, 0.08)",
  memoFab: "0 12px 28px rgba(100, 140, 190, 0.35), 0 4px 12px rgba(43, 38, 34, 0.1)",
  insetSoft: "inset 0 1px 0 rgba(255,255,255,0.65)",
} as const;

export const spacing = {
  section: "1.5rem",
  cardPad: "1.25rem",
} as const;

export const typography = {
  titleScreen: "text-[1.65rem] leading-tight font-extrabold tracking-tight",
  subtitle: "text-sm leading-relaxed",
  meta: "text-xs font-semibold uppercase tracking-wide",
} as const;

/** Gradient strings for inline `style` or arbitrary Tailwind via style */
export const gradients = {
  cta: `linear-gradient(135deg, ${colors.orange} 0%, ${colors.gold} 100%)`,
  ctaSoft: `linear-gradient(135deg, #FFD4A8 0%, ${colors.goldSoft} 55%, ${colors.blueSoft} 100%)`,
  banner: `linear-gradient(120deg, ${colors.orange} 0%, ${colors.coral} 45%, ${colors.gold} 100%)`,
  /** Home “remember today” — softer, richer coral→amber */
  homeHero: `linear-gradient(150deg, #FF9A62 0%, ${colors.orange} 34%, #FF9B6A 58%, #FFC98A 88%, ${colors.gold} 100%)`,
  /** Memo — powder → cornflower → steel (premium calm) */
  memoHero: `linear-gradient(148deg, ${colors.memoAqua} 0%, ${colors.memoCore} 42%, ${colors.memoSky} 78%, ${colors.memoIce} 100%)`,
  memoBar: `linear-gradient(90deg, ${colors.memoDeep} 0%, ${colors.memoCore} 40%, ${colors.memoSky} 100%)`,
  bar: `linear-gradient(90deg, ${colors.orange} 0%, ${colors.gold} 100%)`,
} as const;
