import React from "react";
import { Link } from "react-router-dom";
import { REPORTS } from "../data/socialReports";
import Seo from "../components/Seo";
import PageHeader from "../components/PageHeader";

import { useLanguage } from "../i18n/LanguageContext";
import { translations as t } from "../i18n/translations";

// ---------- helpers (outside the component) ----------
const fmtPct = (n) => `${Math.round(n * 100)}%`;
const arrow = (d) => (d > 0 ? "↑" : d < 0 ? "↓" : "→");
const signed = (n) => `${n >= 0 ? "+" : ""}${n}`;

function interpolate(template, vars) {
  if (typeof template !== "string") return "";
  return template.replace(/\{(\w+)\}/g, (_, k) => (vars?.[k] ?? ""));
}

function summarizeReport(r, lang) {
  // deltas
  const sFirst = r.sentimentSeries?.[0] ?? 0;
  const sLast = r.sentimentSeries?.[r.sentimentSeries.length - 1] ?? 0;
  const nFirst = r.npsStyleSeries?.[0] ?? 0;
  const nLast = r.npsStyleSeries?.[r.npsStyleSeries.length - 1] ?? 0;

  const sentimentDelta = sLast - sFirst; // points
  const npsDelta = nLast - nFirst; // points
  const ticketsDownPct = r?.kpis?.ticketsDown ?? 0;

  // biggest-moving theme
  const topTheme = (r.themes || []).slice().sort((a, b) =>
    Math.abs(parseFloat(b.change)) - Math.abs(parseFloat(a.change))
  )[0];

  // optional short quote
  const q = (r.quotes || [])[0]?.txt || "";
  const shortQuote = q.length > 90 ? `${q.slice(0, 87)}…` : q;

  // templates
  const sentimentLineTpl = t(lang, "socialListeningIndex.summarize.sentimentLine");
  const npsLineTpl = t(lang, "socialListeningIndex.summarize.npsLine");
  const themeLineTpl = t(lang, "socialListeningIndex.summarize.themeLine");
  const ticketsLineTpl = t(lang, "socialListeningIndex.summarize.ticketsLine");

  const themeStatus =
    topTheme?.sev
      ? t(lang, `socialListeningIndex.summarize.themeStatus.${topTheme.sev}`)
      : "";

  const bullets = [
    interpolate(sentimentLineTpl, {
      arrow: arrow(sentimentDelta),
      signedDelta: signed(sentimentDelta),
      last: sLast,
    }),
    Math.abs(npsDelta) >= (topTheme ? Math.abs(parseFloat(topTheme.change)) : 0)
      ? interpolate(npsLineTpl, {
          arrow: arrow(npsDelta),
          signedDelta: signed(npsDelta),
        })
      : topTheme
      ? interpolate(themeLineTpl, {
          name: topTheme.name,
          change: topTheme.change,
          status: themeStatus,
        })
      : interpolate(npsLineTpl, {
          arrow: arrow(npsDelta),
          signedDelta: signed(npsDelta),
        }),
    ticketsDownPct > 0.005
      ? interpolate(ticketsLineTpl, { pct: fmtPct(ticketsDownPct) })
      : shortQuote
      ? `“${shortQuote}”`
      : interpolate(ticketsLineTpl, { pct: fmtPct(ticketsDownPct) }),
  ];

  return { bullets };
}
// -----------------------------------------------------

export default function SocialListeningIndex() {
  const { lang } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B0F19] via-[#0C1224] to-[#0B0F19] text-slate-200">
      <Seo
        path="/social-listening"
        title={t(lang, "socialListeningIndex.seoTitle")}
        description={t(lang, "socialListeningIndex.seoDescription")}
      />

      <PageHeader
        iconLabel={t(lang, "socialListeningIndex.header.iconLabel")}
        tag={t(lang, "socialListeningIndex.header.tag")}
        title={t(lang, "socialListeningIndex.header.title")}
        subtitle={t(lang, "socialListeningIndex.header.subtitle")}
      />

      <section className="mx-auto max-w-7xl px-6 py-10 grid gap-6 md:grid-cols-3">
        {REPORTS.map((r) => {
          const { bullets } = summarizeReport(r, lang);

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

              <div className="mt-4 text-xs text-slate-400">
                {t(lang, "socialListeningIndex.card.viewReport")}
              </div>
            </Link>
          );
        })}
      </section>
    </div>
  );
}
