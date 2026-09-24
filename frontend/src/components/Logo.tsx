export function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className="flex items-center gap-2.5" data-testid="brand-logo">
      <svg width="38" height="38" viewBox="0 0 64 64" aria-hidden="true" className="shrink-0">
        <rect width="64" height="64" rx="14" fill="#1D5FD1" />
        <path
          d="M14 32 L32 17 L50 32"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M20 31 v14 h24 v-14"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M29 45 v-8 h6 v8" fill="none" stroke="#E8A4B8" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="flex flex-col leading-none">
        <span className={`font-heading text-lg font-extrabold uppercase tracking-tight ${light ? "text-cream" : "text-royal"}`}>
          Minh Lâm
        </span>
        <span className={`mt-0.5 text-[9px] font-bold uppercase tracking-[0.12em] ${light ? "text-cream/60" : "text-ink-soft"}`}>
          Đại lý số 1 Nội thất Hòa Phát
        </span>
      </span>
    </span>
  );
}
