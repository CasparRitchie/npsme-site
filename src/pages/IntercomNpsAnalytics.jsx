import React from "react";
import Seo from "../components/Seo";
import PageHeader from "../components/PageHeader";
import { useLanguage } from "../i18n/LanguageContext";
import { translations } from "../i18n/translations";
import { useLocation, Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

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
      />

      <PageHeader iconLabel="NPS Me" tag="NPS Me / Intercom NPS">
        <div className="pt-4 grid md:grid-cols-12 gap-10">
          <div className="md:col-span-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl leading-tight font-semibold tracking-tight text-white">
              {tr("intercomNps.h1")}
            </h1>
            <p className="mt-5 text-slate-300 max-w-2xl">
              {tr("intercomNps.intro")}
            </p>
            <p className="mt-4 text-slate-300 max-w-2xl">
              {tr("intercomNps.pillarLinkPrefix")}{" "}
              <Link
                to={lang === "fr" ? "/fr/nps-intelligence-layer" : "/nps-intelligence-layer"}
                className="underline decoration-white/30 underline-offset-4 hover:text-white"
              >
                {tr("intercomNps.pillarLinkText")}
              </Link>
              {tr("intercomNps.pillarLinkSuffix")}
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Link
                to={lang === "fr" ? "/fr/book" : "/book"}
                className="group inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold bg-[#22C55E] text-[#0B0F19] hover:bg-[#16A34A] transition"
              >
                {tr("intercomNps.cta")}
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </Link>

              <Link
                to={lang === "fr" ? "/fr/demo-survey-page" : "/demo-survey-page"}
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
      {/* TODO: sections we’ll write next: What Intercom gives you / What’s missing / How NPS Me fills the gap / FAQs */}
    </div>
  );
}
