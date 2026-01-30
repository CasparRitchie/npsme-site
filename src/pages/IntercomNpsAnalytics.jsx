import React from "react";
import Seo from "../components/Seo";
import PageHeader from "../components/PageHeader";
import { useLanguage } from "../i18n/LanguageContext";
import { translations } from "../i18n/translations";
import { useLocation, Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { localizePath } from "../i18n/pathHelpers";
import { useEffect, useState } from "react";

export default function IntercomNpsAnalytics() {
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
        if (!cancelled) setLive({ loading: false, data: j, error: r.ok ? null : (j?.error || "Error") });
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
        title={tr("intercomNps.seo.title")}
        description={tr("intercomNps.seo.description")}
        altPaths={{
          en: "/intercom-nps-analytics",
          fr: "/fr/analyse-nps-intercom",
        }}
      />


      <PageHeader iconLabel="NPS Me" tag="NPS Me / Intercom NPS">
        <div className="pt-4 grid md:grid-cols-12 gap-10">
          <div className="md:col-span-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl leading-tight font-semibold tracking-tight text-white">
              {tr("intercomNps.h1")}
            </h1>

            <p className="mt-5 text-slate-300 max-w-2xl">{tr("intercomNps.intro")}</p>

            <p className="mt-4 text-slate-300 max-w-2xl">
              {tr("intercomNps.pillarLinkPrefix")}{" "}
              <Link
                to={localizePath("/nps-intelligence-layer", lang)}
                className="underline decoration-white/30 underline-offset-4 hover:text-white"
              >
                {tr("intercomNps.pillarLinkText")}
              </Link>
              {tr("intercomNps.pillarLinkSuffix")}
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Link
                to={localizePath("/book", lang)}
                className="group inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold bg-[#22C55E] text-[#0B0F19] hover:bg-[#16A34A] transition"
              >
                {tr("intercomNps.cta")}
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </Link>

              <Link
                to={localizePath("/demo-survey-page", lang)}
                className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white"
              >
                {tr("intercomNps.secondaryCta")}
              </Link>
            </div>
          </div>
        </div>
      </PageHeader>

      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
          <h2 className="text-2xl md:text-3xl font-semibold text-white">
            {tr("intercomNps.sections.whatIntercomDoesWell.title")}
          </h2>
          <p className="mt-3 text-slate-300 max-w-3xl">
            {tr("intercomNps.sections.whatIntercomDoesWell.body")}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
          <h2 className="text-2xl md:text-3xl font-semibold text-white">
            {tr("intercomNps.sections.whereIntercomFallsShort.title")}
          </h2>

          <p className="mt-3 text-slate-300 max-w-3xl">
            {tr("intercomNps.sections.whereIntercomFallsShort.body")}
          </p>

          <ul className="mt-4 space-y-2 text-sm text-slate-300 list-disc pl-5">
            {tr("intercomNps.sections.whereIntercomFallsShort.bullets", []).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
          <h2 className="text-2xl md:text-3xl font-semibold text-white">
            {tr("intercomNps.sections.howNpsMeFillsTheGap.title")}
          </h2>

          <p className="mt-3 text-slate-300 max-w-3xl">
            {tr("intercomNps.sections.howNpsMeFillsTheGap.body")}
          </p>

          <ul className="mt-4 space-y-2 text-sm text-slate-300 list-disc pl-5">
            {tr("intercomNps.sections.howNpsMeFillsTheGap.bullets", []).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>
      
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
          <h2 className="text-2xl md:text-3xl font-semibold text-white">
            {tr("intercomNps.sections.livePreview.title", "Live preview (public demo)")}
          </h2>

          <p className="mt-3 text-slate-300 max-w-3xl">
            {tr(
              "intercomNps.sections.livePreview.body",
              "This is a real-time, anonymised snapshot pulled from Intercom survey completions. No personal data is shown."
            )}
          </p>

          {live.loading && (
            <p className="mt-6 text-sm text-slate-300">Loading…</p>
          )}

          {!live.loading && live.error && (
            <p className="mt-6 text-sm text-red-300">Error: {live.error}</p>
          )}

          {!live.loading && live.data?.ok && (
            <div className="mt-6 grid gap-4 md:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-black/10 p-5">
                <div className="text-xs text-slate-400">NPS (last {live.data.window_days} days)</div>
                <div className="mt-2 text-3xl font-semibold text-white">
                  {live.data.nps === null ? "—" : live.data.nps}
                </div>
                <div className="mt-2 text-sm text-slate-300">
                  {live.data.responses} responses • confidence: {live.data.confidence}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/10 p-5">
                <div className="text-xs text-slate-400">Promoters</div>
                <div className="mt-2 text-3xl font-semibold text-white">{live.data.promoters}</div>
                <div className="mt-2 text-sm text-slate-300">Scores 9–10</div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/10 p-5">
                <div className="text-xs text-slate-400">Passives</div>
                <div className="mt-2 text-3xl font-semibold text-white">{live.data.passives}</div>
                <div className="mt-2 text-sm text-slate-300">Scores 7–8</div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/10 p-5">
                <div className="text-xs text-slate-400">Detractors</div>
                <div className="mt-2 text-3xl font-semibold text-white">{live.data.detractors}</div>
                <div className="mt-2 text-sm text-slate-300">Scores 0–6</div>
              </div>
            </div>
          )}

          <div className="mt-6 text-xs text-slate-400">
            Survey ID: 189616 • Source: Intercom webhook completions → NPSme clean store (aggregated)
          </div>
        </div>
      </section>
      {/* Related insights */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
          <h2 className="text-lg font-semibold text-white">
            {tr("intercomNps.related.title", "Related insights")}
          </h2>

          <p className="mt-2 text-sm text-slate-300 max-w-3xl">
            {tr(
              "intercomNps.related.subtitle",
              "If you’re improving NPS in Intercom, these pages help you move from scores to decisions."
            )}
          </p>

          <ul className="mt-5 space-y-3 text-sm">
            <li>
              <Link
                to={localizePath("/nps-intelligence-layer", lang)}
                className="text-slate-200 hover:text-white hover:underline underline-offset-4 decoration-white/20"
              >
                {tr(
                  "intercomNps.related.links.layer",
                  "The NPS Intelligence Layer: add priorities on top of Intercom"
                )}
              </Link>
            </li>

            <li>
              <Link
                to={localizePath("/milestone-nps", lang)}
                className="text-slate-200 hover:text-white hover:underline underline-offset-4 decoration-white/20"
              >
                {tr(
                  "intercomNps.related.links.milestone",
                  "Milestone NPS: find where the journey is breaking"
                )}
              </Link>
            </li>

            <li>
              <Link
                to={localizePath("/what-is-nps", lang)}
                className="text-slate-200 hover:text-white hover:underline underline-offset-4 decoration-white/20"
              >
                {tr(
                  "intercomNps.related.links.whatIsNps",
                  "What is NPS? The bits most teams miss"
                )}
              </Link>
            </li>

            <li className="pt-2">
              <Link
                to={localizePath("/book", lang)}
                className="inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold bg-[#7C3AED] hover:bg-[#6D28D9] transition text-white"
              >
                {tr("intercomNps.related.links.book", "Book a CX review")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </li>
          </ul>
        </div>
      </section>

      {/* TODO: sections we’ll write next: What Intercom gives you / What’s missing / How NPS Me fills the gap / FAQs */}
    </div>
  );
}
