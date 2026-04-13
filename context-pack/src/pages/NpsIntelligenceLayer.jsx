// src/pages/NpsIntelligenceLayer.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowRight, CheckCircle2 } from "lucide-react";

import Seo from "../components/Seo";
import PageHeader from "../components/PageHeader";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { TRANSLATIONS, translations } from "../i18n/translations.js";
import { localizePath } from "../i18n/pathHelpers.js";

export default function NpsIntelligenceLayer() {
  const location = useLocation();
  const { lang } = useLanguage();
  const dict = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const bulletsPain = dict?.npsIntelligenceLayer?.sections?.pain?.bullets || [];
  const bulletsLayer = dict?.npsIntelligenceLayer?.sections?.layer?.bullets || [];
  const bulletsDeliver = dict?.npsIntelligenceLayer?.sections?.deliver?.bullets || [];
  const bulletsFit = dict?.npsIntelligenceLayer?.sections?.fit?.bullets || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B0F19] via-[#0C1224] to-[#0B0F19] text-slate-200">
      <Seo
        path={location.pathname}
        lang={lang}
        title={translations(
          lang,
          "npsIntelligenceLayer.seoTitle",
          "NPS Analytics Layer for Intercom, Medallia and CX Tools | NPS Me"
        )}
        description={translations(
          lang,
          "npsIntelligenceLayer.seoDescription",
          "Already using Intercom or Medallia? NPS Me adds NPS analytics, reporting and prioritisation on top of your existing tools to turn feedback into action."
        )}
      />

      <PageHeader
        iconLabel={translations(
          lang,
          "npsIntelligenceLayer.header.iconLabel",
          "NPS Me / CX Intelligence"
        )}
        tag={translations(lang, "npsIntelligenceLayer.header.tag", "NPS Me / Strategy")}
        accent={translations(lang, "npsIntelligenceLayer.header.accent", "Intelligence layer")}
        title={translations(lang, "npsIntelligenceLayer.header.title", "your CX tools don’t provide")}
        subtitle={translations(
          lang,
          "npsIntelligenceLayer.header.subtitle",
          "Your tools collect signals. We turn them into decisions, priorities, and action."
        )}
      />

      <section className="mx-auto max-w-5xl px-6 pb-20">
        {/* Hero card */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
          <h2 className="text-2xl md:text-3xl font-semibold text-white">
            {translations(
              lang,
              "npsIntelligenceLayer.hero.title",
              "NPS analytics and prioritisation on top of your existing tools"
            )}
          </h2>

          <p className="mt-4 text-slate-300 leading-relaxed">
            {translations(
              lang,
              "npsIntelligenceLayer.hero.body1",
              "If you already use Intercom, Medallia or another survey platform but still struggle to prioritise actions, explain scores or turn feedback into change, this page is for you."
            )}
          </p>

          <p className="mt-3 text-slate-300 leading-relaxed">
            {translations(
              lang,
              "npsIntelligenceLayer.hero.body2",
              "Most teams do not need another survey tool. They need a clearer way to interpret NPS, analyse comments, and decide what to do next."
            )}
          </p>

          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <Link
              to={localizePath("/book", lang)}
              className="inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3 text-sm font-semibold bg-[#22C55E] text-[#0B0F19] hover:bg-[#16A34A] transition"
            >
              {translations(lang, "npsIntelligenceLayer.hero.ctaPrimary", "Book a CX review")}
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              to={localizePath("/cx-pulse-sample", lang)}
              className="inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3 text-sm font-semibold bg-[#7C3AED] hover:bg-[#6D28D9] transition"
            >
              {translations(
                lang,
                "npsIntelligenceLayer.hero.ctaSecondary",
                "See a sample CX Pulse"
              )}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Section: Pain */}
        <div className="mt-10 rounded-3xl border border-white/10 bg-gradient-to-br from-[#141B2E] to-[#0F172A] p-6 md:p-8">
          <h3 className="text-xl md:text-2xl font-semibold text-white">
            {translations(
              lang,
              "npsIntelligenceLayer.sections.pain.title",
              "Why teams still feel stuck with Intercom or Medallia"
            )}
          </h3>

          <p className="mt-3 text-slate-300 leading-relaxed">
            {translations(
              lang,
              "npsIntelligenceLayer.sections.pain.body",
              "These platforms are strong at collecting signals. The gap is turning those signals into clear priorities and decisions."
            )}
          </p>

          <ul className="mt-5 space-y-2 text-sm text-slate-300">
            {bulletsPain.map((item) => (
              <li key={item} className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 mt-0.5 text-white/70" />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <p className="mt-5 text-slate-300 leading-relaxed">
            {translations(
              lang,
              "npsIntelligenceLayer.sections.pain.footer",
              "The result is too much reporting and not enough improvement."
            )}
          </p>
        </div>

        {/* Section: Layer */}
        <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
          <h3 className="text-xl md:text-2xl font-semibold text-white">
            {translations(
              lang,
              "npsIntelligenceLayer.sections.layer.title",
              "Introducing the NPS Me Intelligence Layer"
            )}
          </h3>

          <p className="mt-3 text-slate-300 leading-relaxed">
            {translations(
              lang,
              "npsIntelligenceLayer.sections.layer.body",
              "We sit on top of your existing tools. We do not replace Intercom, Medallia, or your survey platform. We connect, interpret, and elevate what they already capture."
            )}
          </p>

          <ul className="mt-5 grid gap-3 md:grid-cols-2 text-sm text-slate-300">
            {bulletsLayer.map((item) => (
              <li
                key={item}
                className="flex gap-2 rounded-2xl border border-white/10 bg-white/5 p-4"
              >
                <CheckCircle2 className="h-4 w-4 mt-0.5 text-white/70" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Section: Intercom example */}
        <div className="mt-10 rounded-3xl border border-white/10 bg-gradient-to-br from-[#141B2E] to-[#0F172A] p-6 md:p-8">
          <h3 className="text-xl md:text-2xl font-semibold text-white">
            {translations(lang, "npsIntelligenceLayer.sections.intercom.title", "Example: Intercom + NPS Me")}
          </h3>

          <p className="mt-3 text-slate-300 leading-relaxed">
            {translations(
              lang,
              "npsIntelligenceLayer.sections.intercom.body",
              "Intercom can tell you who responded, what score they gave, and what they wrote. NPS Me adds the strategic layer that turns that into priorities."
            )}
          </p>

          <figure className="mt-6 rounded-3xl border border-white/10 bg-black/20 p-4 md:p-6">
            <img
              src="/npsme_intercom_diagram.png"
              alt="Intercom + NPS Me intelligence loop: People send feedback via Intercom, NPS Me turns it into decisions, and actions flow back into Intercom."
              title="Intercom + NPS Me intelligence layer loop"
              loading="lazy"
              decoding="async"
              width={1200}
              height={900}
              className="w-full h-auto rounded-2xl"
            />
            <figcaption className="mt-3 text-xs text-slate-400">
              {translations(
                lang,
                "npsIntelligenceLayer.sections.intercom.diagramCaption",
                "Example loop: Intercom captures feedback → NPS Me adds intelligence → decisions → actions back into Intercom."
              )}
            </figcaption>
          </figure>

          <div className="mt-5 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="text-sm font-semibold text-white">
                {translations(
                  lang,
                  "npsIntelligenceLayer.sections.intercom.boxLeftTitle",
                  "Intercom gives you"
                )}
              </div>
              <ul className="mt-3 space-y-2 text-sm text-slate-300 list-disc pl-5">
                {(dict?.npsIntelligenceLayer?.sections?.intercom?.left || []).map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="text-sm font-semibold text-white">
                {translations(
                  lang,
                  "npsIntelligenceLayer.sections.intercom.boxRightTitle",
                  "NPS Me adds"
                )}
              </div>
              <ul className="mt-3 space-y-2 text-sm text-slate-300 list-disc pl-5">
                {(dict?.npsIntelligenceLayer?.sections?.intercom?.right || []).map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </div>
          </div>

          <p className="mt-5 text-slate-300 leading-relaxed">
            {translations(
              lang,
              "npsIntelligenceLayer.sections.intercom.footer",
              "Instead of another dashboard, teams get clarity, narrative, and priorities."
            )}
          </p>
        </div>

        {/* Related insights */}
        <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
          <h3 className="text-sm font-semibold text-slate-300">
            {translations(lang, "npsIntelligenceLayer.related.title", "Related insights")}
          </h3>

          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link
                to={localizePath("/intercom-nps-analytics", lang)}
                className="text-slate-200 hover:text-white hover:underline"
              >
                {translations(
                  lang,
                  "npsIntelligenceLayer.related.links.intercom",
                  "Intercom NPS: what it shows, what it misses, and how to act"
                )}
              </Link>
            </li>

            <li>
              <Link
                to={localizePath("/milestone-nps", lang)}
                className="text-slate-200 hover:text-white hover:underline"
              >
                {translations(
                  lang,
                  "npsIntelligenceLayer.related.links.milestone",
                  "Milestone NPS: measure friction across the journey"
                )}
              </Link>
            </li>

            <li>
              <Link
                to={localizePath("/cx-pulse-sample", lang)}
                className="text-slate-200 hover:text-white hover:underline"
              >
                {translations(
                  lang,
                  "npsIntelligenceLayer.related.links.pulse",
                  "See a sample CX Pulse (what leaders actually read)"
                )}
              </Link>
            </li>
          </ul>
        </div>

        {/* Section: Medallia note */}
        <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
          <h3 className="text-xl md:text-2xl font-semibold text-white">
            {translations(
              lang,
              "npsIntelligenceLayer.sections.medallia.title",
              "Where Medallia still needs interpretation and action"
            )}
          </h3>

          <p className="mt-3 text-slate-300 leading-relaxed">
            {translations(
              lang,
              "npsIntelligenceLayer.sections.medallia.body1",
              "Enterprise CX platforms are powerful and feature-rich. In large organisations, that flexibility can sometimes result in complex configurations and insight that is harder to translate into everyday decisions."
            )}
          </p>

          <p className="mt-3 text-slate-300 leading-relaxed">
            {translations(
              lang,
              "npsIntelligenceLayer.sections.medallia.body2",
              "Access to more data does not automatically create clarity. NPS Me is designed to help teams focus on what matters most: turning feedback into clear priorities and practical action, without unnecessary complexity."
            )}
          </p>
        </div>

        {/* Section: Deliver */}
        <div className="mt-10 rounded-3xl border border-white/10 bg-gradient-to-br from-[#141B2E] to-[#0F172A] p-6 md:p-8">
          <h3 className="text-xl md:text-2xl font-semibold text-white">
            {translations(
              lang,
              "npsIntelligenceLayer.sections.deliver.title",
              "What the intelligence layer delivers"
            )}
          </h3>

          <ul className="mt-5 space-y-2 text-sm text-slate-300">
            {bulletsDeliver.map((item) => (
              <li key={item} className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 mt-0.5 text-white/70" />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <p className="mt-5 text-slate-300 leading-relaxed">
            {translations(
              lang,
              "npsIntelligenceLayer.sections.deliver.footer",
              "Always grounded in your data. Always focused on what to do next."
            )}
          </p>
        </div>

        {/* Section: Fit */}
        <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
          <h3 className="text-xl md:text-2xl font-semibold text-white">
            {translations(lang, "npsIntelligenceLayer.sections.fit.title", "Who this is for")}
          </h3>

          <ul className="mt-5 space-y-2 text-sm text-slate-300">
            {bulletsFit.map((item) => (
              <li key={item} className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 mt-0.5 text-white/70" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Continue exploring */}
        <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
          <h3 className="text-xl font-semibold text-white">
            {translations(lang, "npsIntelligenceLayer.continueExploring.title")}
          </h3>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Link
              to={localizePath("/intercom-nps-analytics", lang)}
              className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-200 hover:bg-white/10 transition"
            >
              {translations(lang, "npsIntelligenceLayer.continueExploring.intercom")}
            </Link>

            <Link
              to={localizePath("/milestone-nps", lang)}
              className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-200 hover:bg-white/10 transition"
            >
              {translations(lang, "npsIntelligenceLayer.continueExploring.milestone")}
            </Link>

            <Link
              to={localizePath("/what-is-nps", lang)}
              className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-200 hover:bg-white/10 transition"
            >
              {translations(lang, "npsIntelligenceLayer.continueExploring.whatIsNps")}
            </Link>

            <Link
              to={localizePath("/nps-survey-programme", lang)}
              className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-200 hover:bg-white/10 transition"
            >
              {translations(lang, "npsIntelligenceLayer.continueExploring.surveyProgramme")}
            </Link>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-10 rounded-3xl border border-white/10 bg-gradient-to-br from-[#141B2E] to-[#0F172A] p-8 text-center">
          <h3 className="text-2xl font-semibold text-white">
            {translations(lang, "npsIntelligenceLayer.cta.title", "Ready to add clarity on top of your tools?")}
          </h3>

          <p className="mt-3 text-slate-300 max-w-2xl mx-auto">
            {translations(
              lang,
              "npsIntelligenceLayer.cta.body",
              "We start with your current setup, the questions you struggle to answer, and the decisions you need to make. Then we build a simple, action-focused layer on top."
            )}
          </p>

          <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to={localizePath("/book", lang)}
              className="rounded-2xl px-6 py-3 text-sm font-semibold bg-[#22C55E] text-[#0B0F19] hover:bg-[#16A34A] transition inline-flex items-center justify-center gap-2"
            >
              {translations(lang, "npsIntelligenceLayer.cta.primary", "Book a CX review")}
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              to={localizePath("/cx-pulse-sample", lang)}
              className="rounded-2xl px-6 py-3 text-sm font-semibold bg-[#7C3AED] hover:bg-[#6D28D9] transition inline-flex items-center justify-center gap-2"
            >
              {translations(lang, "npsIntelligenceLayer.cta.secondary", "See a sample CX Pulse")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <p className="mt-4 text-xs text-slate-400">
            {translations(
              lang,
              "npsIntelligenceLayer.cta.note",
              "No platform switch required. No survey rebuild required."
            )}
          </p>
        </div>
      </section>
    </div>
  );
}
