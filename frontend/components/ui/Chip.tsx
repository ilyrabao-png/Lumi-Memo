type Props = {
  children: string;
  active?: boolean;
  onClick?: () => void;
};

export function Chip({ children, active, onClick }: Props) {
  const Comp = onClick ? "button" : "span";
  return (
    <Comp
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={`inline-flex shrink-0 items-center rounded-full border px-3 py-1.5 text-xs font-bold transition ${
        active
          ? "border-transparent bg-lm-orange text-white shadow-sm"
          : "border-lm-line bg-lm-surfaceElevated text-lm-inkMuted hover:text-lm-ink"
      }`}
    >
      {children}
    </Comp>
  );
}
