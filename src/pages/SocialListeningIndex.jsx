// src/pages/SocialListeningIndex.jsx
import React from "react";
import { Link } from "react-router-dom";
import { REPORTS } from "../data/socialReports";
import Seo from "../components/Seo";

export default function SocialListeningIndex() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B0F19] via-[#0C1224] to-[#0B0F19] text-slate-200">
      <Seo
        path="/social-listening"
        title="Social Listening Reports (Anonymised) | NPS Me"
        description="Anonymised weekly CX Pulse reports showing sentiment trends, themes, and actions - how we turn feedback into growth."
      />

      <section className="relative overflow-hidden border-b border-white/10">
        <div className="pointer-events-none absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_20%_20%,#7C3AED_0%,transparent_35%),radial-gradient(circle_at_80%_30%,#22C55E_0%,transparent_25%)]" />
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#22C55E]" />
            <p className="text-xs tracking-widest text-slate-400 uppercase">Gallery</p>
          </div>
          <h1 className="mt-2 text-3xl md:text-4xl font-semibold tracking-tight text-white">
            Social Listening Reports (Anonymised)
          </h1>
          <p className="mt-3 max-w-2xl text-slate-300">
            Examples of our weekly CX Pulse format using anonymised client data. Each shows top themes, quote snippets, actions, and impact.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10 grid gap-6 md:grid-cols-3">
        {REPORTS.map((r) => (
          <Link
            key={r.slug}
            to={`/social-listening/${r.slug}`}
            className="rounded-2xl border border-white/10 bg-white/5 p-5 hover:bg-white/10 transition"
          >
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#22C55E]" />
              <div>
                <div className="text-white font-semibold">{r.clientName}</div>
                <div className="text-xs text-slate-400">{r.industry} • {r.period}</div>
              </div>
            </div>
            <div className="mt-4 text-sm text-slate-300">
              <div>Sentiment ↑ trend with realistic dips.</div>
              <div>NPS-style index improving across 8 weeks.</div>
              <div>Tickets per 1k orders {Math.round(r.kpis.ticketsDown * 100)}% lower.</div>
            </div>
            <div className="mt-4 text-xs text-slate-400">View report →</div>
          </Link>
        ))}
      </section>
    </div>
  );
}
