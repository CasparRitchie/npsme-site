import React from "react";
import Seo from "../components/Seo";
import PageHeader from "../components/PageHeader";
import { useLanguage } from "../i18n/LanguageContext";
import { translations } from "../i18n/translations";
import { useLocation, Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { localizePath } from "../i18n/pathHelpers";

export default function IntercomNpsAnalytics() {
  const { lang } = useLanguage();
  const tr = (p, f) => translations(lang, p, f);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B0F19] via-[#0C1224] to-[#0B0F19] text-slate-200">
      <Seo
        path={location.pathname}
        title={tr("intercomNps.seo.title")}
        description={tr("intercomNps.seo.description")}
        alternates={[
          { lang: "en", href: "https://www.npsme.com/intercom-nps-analytics" },
          { lang: "fr", href: "https://www.npsme.com/fr/analyse-nps-intercom" },
          { lang: "x-default", href: "https://www.npsme.com/intercom-nps-analytics" },
        ]}
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
