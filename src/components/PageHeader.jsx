import React from "react";

export default function PageHeader({
  title,
  subtitle = "",
  tag = "CX & NPS / Blog",
  accent = "",
}) {
  return (
    <section className="relative overflow-hidden border-b border-white/10">
      <div className="pointer-events-none absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_15%_20%,#7C3AED_0%,transparent_35%),radial-gradient(circle_at_85%_30%,#22C55E_0%,transparent_25%)]" />

      <div className="relative mx-auto max-w-7xl px-6 py-10 md:py-14">
        {/* Tag label */}
        <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/40 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-slate-300">
          <span className="h-1.5 w-1.5 rounded-full bg-[#22C55E]" />
          {tag}
        </div>

        {/* Title */}
        <h1 className="mt-4 text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-white max-w-3xl">
          {accent && <span className="text-[#22C55E]">{accent} </span>}
          <span className="text-slate-100">{title}</span>
        </h1>

        {/* Subtitle */}
        {subtitle && (
          <p className="mt-4 max-w-2xl text-sm sm:text-base text-slate-300">
            {subtitle}
          </p>
        )}

        {/* Divider */}
        <div className="mt-6 h-px w-full bg-gradient-to-r from-[#7C3AED] via-[#22C55E] to-transparent" />
      </div>
    </section>
  );
}
