import React from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { getReportBySlug } from "../data/socialReports";
import Seo from "../components/Seo";
import { ArrowRight, TrendingUp, MessageSquare, AlertTriangle, CheckCircle2 } from "lucide-react";

import { useLanguage } from "../i18n/LanguageContext";
import { translations as t } from "../i18n/translations";

function interpolate(template, vars) {
  if (typeof template !== "string") return "";
  return template.replace(/\{(\w+)\}/g, (_, k) => (vars?.[k] ?? ""));
}

export default function SocialListeningReport() {
  const { lang } = useLanguage();
  const { slug } = useParams();
  const r = getReportBySlug(slug);

  if (!r) {
    return (
      <div className="min-h-screen bg-[#0B0F19] text-slate-200 grid place-items-center p-8">
        <div className="text-center">
          <h1 className="text-3xl font-semibold text-white">
            {t(lang, "socialListeningReport.notFound.title")}
          </h1>
          <p className="mt-3 text-slate-400">
            {t(lang, "socialListeningReport.notFound.body")}{" "}
            <Link to="/social-listening" className="text-[#22C55E] underline">
              {t(lang, "socialListeningReport.notFound.link")}
            </Link>
          </p>
        </div>
      </div>
    );
  }

  // ----- Brand / color helpers -----
  const brandGreen = "#22C55E";
  const brandPurple = "#7C3AED";
  const red = "#ef4444";
  const amber = "#f59e0b";
  const green = "#22c55e";
  const sevColor = (s) => (s === "good" ? green : s === "mid" ? amber : red);

  // ----- Tiny sparkline -----
  const Spark = ({ series, color = brandGreen }) => (
    <svg viewBox="0 0 100 28" className="w-full h-10">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        points={series
          .map((v, i) => {
            const x = (i / (series.length - 1)) * 100;
            const min = Math.min(...series);
            const max = Math.max(...series);
            const y = 26 - ((v - min) / (max - min || 1)) * 24;
            return `${x},${y}`;
          })
          .join(" ")}
      />
    </svg>
  );

  // ----- Diverging bar: negative left, positive right -----
  const DivergingBar = ({ value = 0, min = -100, max = 100, colorPos = green, colorNeg = red }) => {
    const clamped = Math.max(min, Math.min(max, value));
    const pct = ((Math.abs(clamped) / (max - min)) * 100) * 2;
    const isNeg = clamped < 0;

    return (
      <div className="w-full">
        <div className="h-2 rounded-full bg-white/10 overflow-hidden relative">
          <div className="absolute left-1/2 top-0 h-2 w-px bg-white/20" />
          <div
            className="h-2"
            style={{
              width: `${pct}%`,
              marginLeft: isNeg ? `calc(50% - ${pct}%)` : "50%",
              backgroundColor: isNeg ? colorNeg : colorPos,
              borderTopLeftRadius: isNeg ? "9999px" : 0,
              borderBottomLeftRadius: isNeg ? "9999px" : 0,
              borderTopRightRadius: isNeg ? 0 : "9999px",
              borderBottomRightRadius: isNeg ? 0 : "9999px",
            }}
          />
        </div>
      </div>
    );
  };

  // ----- Simple deltas -----
  const sentimentDelta =
    r.sentimentSeries[r.sentimentSeries.length - 1] - r.sentimentSeries[0];
  const npsDelta =
    r.npsStyleSeries[r.npsStyleSeries.length - 1] - r.npsStyleSeries[0];

  // ----- Per-page SEO + JSON-LD -----
  const pagePath = `/social-listening/${r.slug}`;
  const pageUrl = `https://www.npsme.com${pagePath}`;

  const titleTpl = t(lang, "socialListeningReport.seo.title");
  const descriptionTpl = t(lang, "socialListeningReport.seo.description");

  const title = interpolate(titleTpl, { industry: r.industry });
  const description = interpolate(descriptionTpl, { industry: r.industry, period: r.period });

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: interpolate(t(lang, "socialListeningReport.seo.title"), { industry: r.industry })
      .replace(" | NPS Me", ""),
    description,
    author: { "@type": "Organization", name: "NPS Me" },
    publisher: {
      "@type": "Organization",
      name: "NPS Me",
      logo: { "@type": "ImageObject", url: "https://www.npsme.com/favicon-512.png" },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": pageUrl },
    datePublished: new Date().toISOString(),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://www.npsme.com/" },
      {
        "@type": "ListItem",
        position: 2,
        name: "Social Listening",
        item: "https://www.npsme.com/social-listening",
      },
      { "@type": "ListItem", position: 3, name: r.clientName, item: pageUrl },
    ],
  };

  const sourcesLine = interpolate(t(lang, "socialListeningReport.header.sources"), {
    period: r.period,
    sources: r.sources.join(", "),
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B0F19] via-[#0C1224] to-[#0B0F19] text-slate-200">
      <Seo path={pagePath} title={title} description={description} />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(articleJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbJsonLd)}</script>
      </Helmet>

      {/* Header */}
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="pointer-events-none absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_20%_20%,#7C3AED_0%,transparent_35%),radial-gradient(circle_at_80%_30%,#22C55E_0%,transparent_25%)]" />
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#22C55E]" />
            <p className="text-xs tracking-widest text-slate-400 uppercase">
              {t(lang, "socialListeningReport.header.badge")}
            </p>
          </div>

          <h1 className="mt-2 text-3xl md:text-4xl font-semibold tracking-tight text-white">
            {interpolate(t(lang, "socialListeningReport.header.title"), {
              clientName: r.clientName,
            })}
          </h1>

          <p className="mt-3 max-w-2xl text-slate-300">{sourcesLine}</p>

          <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-slate-300">
            <TrendingUp className="h-4 w-4" />
            <span>{t(lang, "socialListeningReport.header.trendNote")}</span>
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="mx-auto max-w-7xl px-6 py-10 grid md:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="text-xs uppercase tracking-wider text-slate-400">
            {t(lang, "socialListeningReport.highlights.sentimentLabel")}
          </div>
          <div className="mt-1 text-2xl font-semibold text-white">
            {sentimentDelta >= 0 ? "+" : ""}
            {sentimentDelta} pts
          </div>
          <Spark series={r.sentimentSeries} color={brandGreen} />
          <div className="text-xs text-slate-400">
            {t(lang, "socialListeningReport.highlights.sentimentNote")}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="text-xs uppercase tracking-wider text-slate-400">
            {t(lang, "socialListeningReport.highlights.npsLabel")}
          </div>
          <div className="mt-1 text-2xl font-semibold text-white">
            {npsDelta >= 0 ? "+" : ""}
            {npsDelta}
          </div>
          <Spark series={r.npsStyleSeries} color={brandPurple} />
          <div className="text-xs text-slate-400">
            {t(lang, "socialListeningReport.highlights.npsNote")}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="text-xs uppercase tracking-wider text-slate-400">
            {t(lang, "socialListeningReport.highlights.supportLabel")}
          </div>
          <div className="mt-1 text-2xl font-semibold text-white">
            {interpolate(t(lang, "socialListeningReport.highlights.supportValue"), {
              pct: Math.round(r.kpis.ticketsDown * 100),
            })}
          </div>
          <div className="mt-2">
            <DivergingBar
              value={Math.round(r.kpis.ticketsDown * 100)}
              colorPos={green}
              colorNeg={red}
            />
          </div>
          <div className="mt-2 text-xs text-slate-400">
            {t(lang, "socialListeningReport.highlights.supportNote")}
          </div>
        </div>
      </section>

      {/* Quotes */}
      <section className="mx-auto max-w-7xl px-6 pb-10">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
          <h2 className="text-xl md:text-2xl font-semibold text-white">
            {t(lang, "socialListeningReport.sections.quotesTitle")}
          </h2>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {r.quotes.map((q, i) => (
              <div key={i} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex items-center gap-2 text-slate-400 text-xs">
                  <MessageSquare className="h-4 w-4" />
                  {q.src} • {t(lang, "socialListeningReport.sections.anonymised")}
                </div>
                <p className="mt-2 text-sm text-slate-200">“{q.txt}”</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Themes with diverging bars */}
      <section className="mx-auto max-w-7xl px-6 pb-10">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
          <h2 className="text-xl md:text-2xl font-semibold text-white">
            {t(lang, "socialListeningReport.sections.themesTitle")}
          </h2>

          <div className="mt-5 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {r.themes.map((tItem) => {
              const changeVal = parseFloat(tItem.change.replace("%", ""));
              const color = sevColor(tItem.sev);

              return (
                <div key={tItem.name} className="rounded-2xl border border-white/10 bg-black/20 p-5">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-white">{tItem.name}</div>
                    <span
                      className="text-xs px-2 py-0.5 rounded-lg"
                      style={{ backgroundColor: color, color: "#0B0F19" }}
                    >
                      {tItem.change}
                    </span>
                  </div>

                  <div className="mt-3">
                    <DivergingBar value={changeVal} colorPos={color} colorNeg={red} />
                  </div>

                  <p className="mt-2 text-sm text-slate-300">{tItem.notes}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex items-center gap-3 text-xs text-slate-400">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            {t(lang, "socialListeningReport.sections.movementNote")}
          </div>
        </div>
      </section>

      {/* Actions & Impact */}
      <section className="mx-auto max-w-7xl px-6 pb-16">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#141B2E] to-[#0F172A] p-8 text-center">
          <h3 className="text-2xl font-semibold text-white">
            {t(lang, "socialListeningReport.sections.actionsTitle")}
          </h3>

          <ul className="mt-4 space-y-2 text-sm text-slate-300 max-w-2xl mx-auto text-left">
            {r.actions.map((i) => (
              <li key={i} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-[#22C55E]" />
                <span>{i}</span>
              </li>
            ))}
          </ul>

          <div className="mt-6 grid md:grid-cols-3 gap-6">
            <ImpactCard
              label={t(lang, "socialListeningReport.impact.repeatLabel")}
              value={`+${Math.round(r.kpis.repeatLift * 100)}%`}
              note={t(lang, "socialListeningReport.impact.repeatNote")}
            />
            <ImpactCard
              label={t(lang, "socialListeningReport.impact.churnLabel")}
              value={`−${Math.round(r.kpis.churnDown * 100)}%`}
              note={t(lang, "socialListeningReport.impact.churnNote")}
            />
            <ImpactCard
              label={t(lang, "socialListeningReport.impact.ticketsLabel")}
              value={`−${Math.round(r.kpis.ticketsDown * 100)}%`}
              note={t(lang, "socialListeningReport.impact.ticketsNote")}
            />
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/products"
              className="rounded-2xl px-6 py-3 text-sm font-semibold bg-[#7C3AED] hover:bg-[#6D28D9] transition inline-flex items-center justify-center gap-2"
            >
              {t(lang, "socialListeningReport.ctas.products")}{" "}
              <ArrowRight className="h-4 w-4" />
            </Link>

            <a
              href="/#contact"
              className="rounded-2xl px-6 py-3 text-sm font-semibold bg-[#22C55E] text-[#0B0F19] hover:bg-[#16A34A] transition inline-flex items-center justify-center gap-2"
            >
              {t(lang, "socialListeningReport.ctas.book")}{" "}
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

function ImpactCard({ label, value, note }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
      <div className="text-xs uppercase tracking-wider text-slate-400">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-white">{value}</div>
      <div className="mt-1 text-xs text-slate-400">{note}</div>
    </div>
  );
}
