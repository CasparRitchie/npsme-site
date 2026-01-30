import React, { useEffect, useState } from "react";
import Seo from "../components/Seo";
import PageHeader from "../components/PageHeader";
import { useLocation, Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";
import { translations } from "../i18n/translations";
import { localizePath } from "../i18n/pathHelpers";

function StatCard({ label, value, sub }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/10 p-5">
      <div className="text-xs text-slate-400">{label}</div>
      <div className="mt-2 text-3xl font-semibold text-white">{value}</div>
      {sub ? <div className="mt-2 text-sm text-slate-300">{sub}</div> : null}
    </div>
  );
}

function prettyDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function EnvolaExample() {
  const { lang } = useLanguage();
  const tr = (p, f) => translations(lang, p, f);
  const location = useLocation();

  const [live, setLive] = useState({ loading: true, data: null, error: null });

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const url = "/api/intercom/public/nps-summary?content_id=189616&days=30";
        const r = await fetch(url);
        const j = await r.json();
        if (!cancelled) {
          setLive({ loading: false, data: j, error: r.ok ? null : (j?.error || "Error") });
        }
      } catch (e) {
        if (!cancelled) setLive({ loading: false, data: null, error: e.message });
      }
    }

    run();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B0F19] via-[#0C1224] to-[#0B0F19] text-slate-200">
      <Seo
        path={location.pathname}
        lang={lang}
        title={tr("envola.seo.title", "Envola — Intercom NPS Analytics (Live Example) | NPSme")}
        description={tr(
          "envola.seo.description",
          "A live, anonymised example showing how NPSme layers analytics on top of Intercom NPS."
        )}
        altPaths={{
          en: "/envola",
          fr: "/fr/exemple-envola",
        }}
      />

      <PageHeader iconLabel="NPS Me" tag={tr("envola.tag", "Client example / Envola")}>
        <div className="pt-4 grid md:grid-cols-12 gap-10">
          <div className="md:col-span-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl leading-tight font-semibold tracking-tight text-white">
              {tr("envola.h1", "Envola — Intercom NPS Analytics")}
            </h1>

            <p className="mt-5 text-slate-300 max-w-2xl">
              {tr(
                "envola.intro",
                "This is a live, anonymised example. It shows what NPSme can surface once an NPS survey is running in Intercom — starting with score + distribution, and soon drivers, themes, and recommendations."
              )}
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Link
                to={localizePath("/intercom-nps-analytics", lang)}
                className="group inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold bg-[#22C55E] text-[#0B0F19] hover:bg-[#16A34A] transition"
              >
                {tr("envola.ctaPrimary", "See how it works")}
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </Link>

              <Link
                to={localizePath("/book", lang)}
                className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white"
              >
                {tr("envola.ctaSecondary", "Book a CX review")}
              </Link>
            </div>
          </div>
        </div>
      </PageHeader>

      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
          <h2 className="text-2xl md:text-3xl font-semibold text-white">
            {tr("envola.live.title", "Live snapshot (last 30 days)")}
          </h2>
          <p className="mt-3 text-slate-300 max-w-3xl">
            {tr(
              "envola.live.subtitle",
              "Aggregated only — no personal data. Data source: Intercom survey completions → NPSme clean store."
            )}
          </p>

          {live.loading && <p className="mt-6 text-sm text-slate-300">{tr("common.loading", "Loading…")}</p>}
          {!live.loading && live.error && <p className="mt-6 text-sm text-red-300">Error: {live.error}</p>}

          {!live.loading && live.data?.ok && (
            <>
              {live.data.responses === 0 ? (
                <div className="mt-6 rounded-2xl border border-white/10 bg-black/10 p-5 text-sm text-slate-300">
                  {tr(
                    "envola.live.noData",
                    `No completions yet in the last ${live.data.window_days} days. Once responses arrive, this panel updates automatically.`
                  )}
                </div>
              ) : (
                <div className="mt-6 grid gap-4 md:grid-cols-4">
                  <StatCard
                    label={tr("envola.live.kpiNps", `NPS (last ${live.data.window_days} days)`)}
                    value={live.data.nps === null ? "—" : live.data.nps}
                    sub={tr(
                      "envola.live.kpiSub",
                      `${live.data.responses} responses • confidence: ${live.data.confidence}`
                    )}
                  />
                  <StatCard label={tr("envola.live.promoters", "Promoters")} value={live.data.promoters} sub={tr("envola.live.promotersSub", "Scores 9–10")} />
                  <StatCard label={tr("envola.live.passives", "Passives")} value={live.data.passives} sub={tr("envola.live.passivesSub", "Scores 7–8")} />
                  <StatCard label={tr("envola.live.detractors", "Detractors")} value={live.data.detractors} sub={tr("envola.live.detractorsSub", "Scores 0–6")} />
                </div>
              )}

              <div className="mt-6 text-xs text-slate-400">
                {tr("envola.live.meta", "Survey ID: 189616")} • {tr("envola.live.lastResponse", "Last response")}{" "}
                {prettyDate(live.data.newest_response_at)}
              </div>

              {live.data.responses < 10 && (
                <div className="mt-4 text-xs text-slate-400">
                  {tr(
                    "envola.live.earlyNote",
                    "Note: early sample. NPS will stabilise as response volume increases."
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
          <h2 className="text-xl md:text-2xl font-semibold text-white">
            {tr("envola.next.title", "Coming next on this page")}
          </h2>
          <ul className="mt-4 space-y-2 text-sm text-slate-300 list-disc pl-5">
            <li>{tr("envola.next.a", "Response rate (shown vs completed) and completion time from export reconciliation")}</li>
            <li>{tr("envola.next.b", "Theme detection on comments (onboarding, WiFi, billing, support, reliability…)")}</li>
            <li>{tr("envola.next.c", "Driver analysis: what correlates most with detractors vs promoters")}</li>
            <li>{tr("envola.next.d", "AI-assisted recommendations (cached, evidence-based, configurable)")}</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
