// src/components/PageHeader.jsx
import React from "react";
import { motion } from "framer-motion";

export default function PageHeader({
  title,
  subtitle = "",
  tag = "CX & NPS / Page",
  accent = "",
  iconLabel = "CX & NPS",
  children,
}) {
  const hasCustomContent = Boolean(children);

  return (
    <section className="relative z-0 overflow-visible border-b border-white/10">
      {/* Background gradients */}
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-30 bg-[radial-gradient(circle_at_15%_20%,#7C3AED_0%,transparent_35%),radial-gradient(circle_at_85%_30%,#22C55E_0%,transparent_25%)]" />
      <div className="relative mx-auto max-w-7xl px-6 py-10 md:py-14">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          {/* Icon + label row */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#22C55E]" />
            <p className="text-xs uppercase tracking-widest text-[#22C55E]">
              {iconLabel}
            </p>
          </div>

          {/* Tag pill */}
          <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/40 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-slate-300">
            <span className="h-1.5 w-1.5 rounded-full bg-[#22C55E]" />
            {tag}
          </div>

          {/* Either: custom content OR default title/subtitle */}
          {hasCustomContent ? (
            <div className="mt-4">
              {children}
            </div>
          ) : (
            <>
              {/* Default title */}
              <h1 className="mt-4 text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-white max-w-3xl">
                {accent && <span className="text-[#22C55E]">{accent} </span>}
                <span className="text-slate-100">{title}</span>
              </h1>

              {/* Default subtitle */}
              {subtitle && (
                <p className="mt-4 max-w-2xl text-sm sm:text-base text-slate-300">
                  {subtitle}
                </p>
              )}
            </>
          )}

          {/* Gradient divider */}
          <div className="mt-6 h-px w-full bg-gradient-to-r from-[#7C3AED] via-[#22C55E] to-transparent" />
        </motion.div>
      </div>
    </section>
  );
}
