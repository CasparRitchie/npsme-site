// src/pages/SocialListeningIndex.jsx
import React from "react";
import { Link } from "react-router-dom";
import { REPORTS } from "../data/socialReports";
import Seo from "../components/Seo";
import PageHeader from "../components/PageHeader";


// ---------- helpers (outside the component) ----------
const fmtPct = (n) => `${Math.round(n * 100)}%`;
const arrow = (d) => (d > 0 ? "↑" : d < 0 ? "↓" : "→");

function summarizeReport(r) {
  // deltas
  const sFirst = r.sentimentSeries?.[0] ?? 0;
  const sLast = r.sentimentSeries?.[r.sentimentSeries.length - 1] ?? 0;
  const nFirst = r.npsStyleSeries?.[0] ?? 0;
  const nLast = r.npsStyleSeries?.[r.npsStyleSeries.length - 1] ?? 0;

  const sentimentDelta = sLast - sFirst;       // points
  const npsDelta = nLast - nFirst;             // points
  const ticketsDownPct = r?.kpis?.ticketsDown ?? 0;

  // biggest-moving theme
  const topTheme = (r.themes || []).slice().sort((a, b) =>
    Math.abs(parseFloat(b.change)) - Math.abs(parseFloat(a.change))
  )[0];

  // optional short quote
  const q = (r.quotes || [])[0]?.txt || "";
  const shortQuote = q.length > 90 ? `${q.slice(0, 87)}…` : q;

  const bullets = [
    `Sentiment ${arrow(sentimentDelta)} ${sentimentDelta >= 0 ? "+" : ""}${sentimentDelta} pts (now ${sLast}).`,
    Math.abs(npsDelta) >= (topTheme ? Math.abs(parseFloat(topTheme.change)) : 0)
      ? `NPS-style index ${arrow(npsDelta)} ${npsDelta >= 0 ? "+" : ""}${npsDelta} over 8 weeks.`
      : topTheme
      ? `${topTheme.name}: ${topTheme.change} (${topTheme.sev === "bad" ? "needs attention" : topTheme.sev === "mid" ? "steady" : "improving"}).`
      : `NPS-style index ${arrow(npsDelta)} ${npsDelta >= 0 ? "+" : ""}${npsDelta} over 8 weeks.`,
    ticketsDownPct > 0.005
      ? `Tickets per 1k orders ${fmtPct(ticketsDownPct)} lower.`
      : shortQuote
      ? `“${shortQuote}”`
      : `Tickets per 1k orders ${fmtPct(ticketsDownPct)} lower.`,
  ];

  return { bullets };
}
// -----------------------------------------------------

export default function SocialListeningIndex() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B0F19] via-[#0C1224] to-[#0B0F19] text-slate-200">
      <Seo
        path="/social-listening"
        title="Social Listening Reports (Anonymised) | NPS Me"
        description="Anonymised weekly CX Pulse reports showing sentiment trends, themes, and actions — how we turn feedback into growth."
      />

      <PageHeader
        iconLabel="Social listening gallery"
        tag="CX Pulse / Social listening"
        title="Social Listening Reports (Anonymised)"
        subtitle="Examples of our weekly CX Pulse format using anonymised client data. Each shows top themes, quote snippets, actions, and impact."
      />

      <section className="mx-auto max-w-7xl px-6 py-10 grid gap-6 md:grid-cols-3">
        {REPORTS.map((r) => {
          const { bullets } = summarizeReport(r);
          return (
            <Link
              key={r.slug}
              to={`/social-listening/${r.slug}`}
              className="rounded-2xl border border-white/10 bg-white/5 p-5 hover:bg-white/10 transition"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#22C55E]" />
                <div>
                  <div className="text-white font-semibold">{r.clientName}</div>
                  <div className="text-xs text-slate-400">
                    {r.industry} • {r.period}
                  </div>
                </div>
              </div>

              <div className="mt-4 text-sm text-slate-300">
                {bullets.map((b, i) => (
                  <div key={i}>{b}</div>
                ))}
              </div>

              <div className="mt-4 text-xs text-slate-400">View report →</div>
            </Link>
          );
        })}
      </section>
    </div>
  );
}
