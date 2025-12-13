// src/pages/CxCockpit.jsx
import React from "react";
import Seo from "../components/Seo";
import PageHeader from "../components/PageHeader";
import DemoResultsPanel from "../components/DemoResultsPanel";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { translations } from "../i18n/translations.js";
import { localizePath } from "../i18n/pathHelpers.js";

export default function CxCockpit() {
  const { lang } = useLanguage();

  const title = translations(lang, "cxCockpit.seoTitle", "CX Cockpit (Demo) | NPS Me");
  const description = translations(
    lang,
    "cxCockpit.seoDescription",
    "Explore your customer experience cockpit: NPS, journey stages, response funnels and verbatim themes in one place."
  );

  const path = localizePath("/cx-cockpit", lang);

  return (
    <>
      <Seo path={path} lang={lang} title={title} description={description} />

      <PageHeader
        iconLabel={translations(lang, "cxCockpit.iconLabel", "CX Cockpit")}
        tag={translations(lang, "cxCockpit.tag", "NPS Me / Demo")}
        accent={translations(lang, "cxCockpit.accent", "CX cockpit")}
        title={translations(lang, "cxCockpit.headerTitle", "fly your customer experience spaceship")}
        subtitle={translations(
          lang,
          "cxCockpit.headerSubtitle",
          "A single view of NPS scores, journey stages, response funnels and verbatim themes. This demo cockpit uses the live NPS Me sandbox data."
        )}
      >
        {/* Optional: “live feed” pill row inside header, so it matches your page header style */}
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/40 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-slate-300">
            <span className="inline-flex h-2 w-2 rounded-full bg-[#22C55E] animate-pulse" />
            <span>{translations(lang, "cxCockpit.liveFeed", "Live demo data feed")}</span>
          </div>

          <p className="max-w-xl text-[11px] text-slate-400">
            {translations(
              lang,
              "cxCockpit.liveFeedNote",
              "For a real client build, this cockpit would connect to your production survey and CRM events."
            )}
          </p>
        </div>
      </PageHeader>

      <div className="mx-auto max-w-7xl px-6 py-8 sm:py-12 space-y-8">
        {/* Main cockpit grid */}
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] items-start">
          {/* Left */}
          <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-4 sm:p-6 shadow-2xl shadow-black/40">
            <h2 className="text-sm font-semibold text-slate-100 mb-1">
              {translations(lang, "cxCockpit.leftTitle", "NPS & journey instrumentation")}
            </h2>
            <p className="text-[11px] text-slate-500 mb-4">
              {translations(
                lang,
                "cxCockpit.leftSub",
                "Filter by contact, company, result type and stage to see how your NPS is behaving across the customer journey."
              )}
            </p>

            <DemoResultsPanel />
          </div>

          {/* Right */}
          <div className="space-y-4">
            <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-4 sm:p-5">
              <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">
                {translations(lang, "cxCockpit.upcomingDial", "Upcoming dial")}
              </p>
              <h3 className="text-sm font-semibold text-slate-100">
                {translations(lang, "cxCockpit.raceTitle", "Race chart – NPS over time by segment")}
              </h3>
              <p className="mt-1 text-[11px] text-slate-500">
                {translations(lang, "cxCockpit.raceBody", "")}
              </p>
              <div className="mt-3 h-32 rounded-2xl border border-dashed border-slate-700/70 bg-slate-900/40 flex items-center justify-center text-[11px] text-slate-600">
                {translations(lang, "cxCockpit.racePlaceholder", "Race chart placeholder")}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-950/90 p-4 sm:p-5">
              <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">
                {translations(lang, "cxCockpit.upcomingDial", "Upcoming dial")}
              </p>
              <h3 className="text-sm font-semibold text-slate-100">
                {translations(lang, "cxCockpit.copilotTitle", "CX co-pilot summary")}
              </h3>
              <p className="mt-1 text-[11px] text-slate-500">
                {translations(lang, "cxCockpit.copilotBody", "")}
              </p>
              <div className="mt-3 h-24 rounded-2xl border border-dashed border-slate-700/70 bg-slate-900/40 flex items-center justify-center text-[11px] text-slate-600 text-center px-4">
                {translations(lang, "cxCockpit.copilotPlaceholder", "AI commentary placeholder")}
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
