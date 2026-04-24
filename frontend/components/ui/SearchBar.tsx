type Props = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
};

export function SearchBar({ value, onChange, placeholder = "Search…" }: Props) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-lm-inkFaint">⌕</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-2xl border border-lm-line bg-lm-surfaceElevated pl-10 pr-3 text-sm font-medium text-lm-ink shadow-sm outline-none ring-lm-orange/25 placeholder:text-lm-inkFaint focus:ring-4"
      />
    </div>
  );
}
