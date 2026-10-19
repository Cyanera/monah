/** Wheat-ear mark: a stem with paired grains, drawn in SVG so it scales crisply. */
export function WheatMark({ className = "size-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <rect width="64" height="64" rx="18" fill="currentColor" />
      <path d="M32 54V22" stroke="#f4e7bf" strokeWidth="3.4" strokeLinecap="round" fill="none" />
      <g fill="#e8c76f">
        <path d="M32 11c4.2 3.2 5.2 7.6 3 11.8-4.2-2.2-5.2-7.2-3-11.8z" />
        <path d="M32 26c-6.2-1-9.4-5.2-9.4-9.6 5.2 0 9.4 3.2 9.4 9.6z" />
        <path d="M32 26c6.2-1 9.4-5.2 9.4-9.6-5.2 0-9.4 3.2-9.4 9.6z" />
        <path d="M32 37.5c-6.2-1-9.4-5.2-9.4-9.6 5.2 0 9.4 3.2 9.4 9.6z" />
        <path d="M32 37.5c6.2-1 9.4-5.2 9.4-9.6-5.2 0-9.4 3.2-9.4 9.6z" />
        <path d="M32 49c-6.2-1-9.4-5.2-9.4-9.6 5.2 0 9.4 3.2 9.4 9.6z" />
        <path d="M32 49c6.2-1 9.4-5.2 9.4-9.6-5.2 0-9.4 3.2-9.4 9.6z" />
      </g>
    </svg>
  );
}

export function Logo({ tone = "dark", showTagline = false }: { tone?: "dark" | "light"; showTagline?: boolean }) {
  const light = tone === "light";
  return (
    <span className="inline-flex items-center gap-3">
      <WheatMark className={`size-10 shrink-0 ${light ? "text-olive-600" : "text-olive-700"}`} />
      <span className="flex flex-col leading-tight">
        <span className={`text-3xl font-black ${light ? "text-cream" : "text-olive-800"}`}>مُونة</span>
        {showTagline && (
          <span className={`text-xs ${light ? "text-olive-200" : "text-olive-600"}`}>من فائض النعمة، نصنع الكفاية</span>
        )}
      </span>
    </span>
  );
}
