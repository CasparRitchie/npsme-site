// src/MilestoneNps.jsx
import React from "react";
import {
  Star,
  LineChart,
  Wrench,
  Gauge,
  ClipboardList,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import Seo from "./components/Seo";
import PageHeader from "./components/PageHeader";
import { useLanguage } from "./i18n/LanguageContext";
import { translations } from "./i18n/translations";
import { localizePath } from "./i18n/pathHelpers";

export default function MilestoneNps() {
  const { lang } = useLanguage();
  const location = useLocation();

  const methodCards = translations(lang, "milestonePage.method.cards", []);
  const fitCards = translations(lang, "milestonePage.fit.cards", []);
  const steps = translations(lang, "milestonePage.checklist.steps", []);
  const trackItems = translations(lang, "milestonePage.track.items", []);

  const impactPath = localizePath("/impact", lang);
  const homeWithContactHash = `${localizePath("/", lang)}#contact`;

  // Related insights links (keep this tight: 3–5 max)
  const relatedLinks = [
    {
      path: "/what-is-nps",
      label: translations(
        lang,
        "milestonePage.related.links.whatIsNps",
        "What is NPS?"
      ),
    },

    {
      path: "/nps-survey-programme",
      label: translations(
        lang,
        "milestonePage.related.links.npsSurveyProgramme",
        "NPS survey programme"
      ),
    },

    {
      path: "/nps-intelligence-layer",
      label: translations(
        lang,
        "milestonePage.related.links.intelligenceLayer",
        "NPS intelligence layer"
      ),
    },

    {
      path: "/intercom-nps-analytics",
      label: translations(
        lang,
        "milestonePage.related.links.intercomNpsAnalytics",
        "Intercom NPS analytics"
      ),
    },

    {
      path: "/social-listening",
      label: translations(
        lang,
        "milestonePage.related.links.socialListening",
        "Social listening"
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B0F19] via-[#0C1224] to-[#0B0F19] text-slate-200">
      <Seo
        path={location.pathname}
        title={translations(
          lang,
          "milestonePage.seoTitle",
          "Milestone (Transactional) NPS® & Survey Signals | NPS Me"
        )}
        description={translations(
          lang,
          "milestonePage.seoDescription",
          "Capture customer sentiment at key journey moments to reveal friction in context. Implement close-the-loop and theme tracking for actionable CX."
        )}
        lang={lang}
      />

      <PageHeader
        iconLabel={translations(
          lang,
          "milestonePage.header.iconLabel",
          "Milestone / transactional NPS"
        )}
        tag={translations(lang, "milestonePage.header.tag", "NPS Me / Milestone NPS")}
      >
        <>
          <h1 className="mt-3 text-3xl sm:text-4xl md:text-5xl leading-tight font-semibold tracking-tight text-white">
            {translations(
              lang,
              "milestonePage.header.title",
              "Transactional NPS and milestone survey signals"
            )}
          </h1>

          <p className="mt-4 text-slate-300 max-w-3xl">
            {translations(
              lang,
              "milestonePage.header.intro",
              "A practical framework for transactional NPS and milestone surveys. Capture feedback at key journey moments, turn it into prioritised work, and measure lift over time alongside CSAT, CES and behavioural data."
            )}
          </p>

          <div className="mt-6 flex gap-3 flex-wrap">
            <Link
              to={impactPath}
              className="inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold bg-[#22C55E] text-[#0B0F19] hover:bg-[#16A34A] transition"
            >
              {translations(lang, "milestonePage.header.ctaImpact", "Estimate your impact")}
            </Link>

            <Link
              to={homeWithContactHash}
              className="inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold bg-[#7C3AED] hover:bg-[#6D28D9] transition"
            >
              {translations(lang, "milestonePage.header.ctaBook", "Book discovery")}
            </Link>
          </div>
        </>
      </PageHeader>

      {/* definition block */}
      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-white">
            {lang === "fr"
              ? "Qu’est-ce que le NPS transactionnel ?"
              : "What is transactional NPS?"}
          </h2>

          <p className="mt-4 text-slate-300 max-w-3xl">
            {lang === "fr"
              ? "Le NPS transactionnel, ou NPS par étape, mesure le ressenti client juste après un moment précis du parcours — par exemple après une commande, un onboarding ou une interaction de support."
              : "Transactional NPS, or milestone NPS, measures customer sentiment immediately after a specific journey moment such as an order, onboarding step or support interaction."}
          </p>

          <p className="mt-3 text-slate-300 max-w-3xl">
            {lang === "fr"
              ? "Il complète le NPS relationnel en aidant les équipes à relier les scores aux frictions concrètes et aux actions correctives."
              : "It complements relationship NPS by helping teams connect scores to specific friction points and improvement actions."}
          </p>
        </div>
      </section>

      {/* 4-Stage method */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="max-w-2xl">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-white">
            {translations(
              lang,
              "milestonePage.method.title",
              "The 4-stage method (simple, repeatable)"
            )}
          </h2>
          <p className="mt-3 text-slate-300">
            {translations(
              lang,
              "milestonePage.method.intro",
              "Clear steps, fast wins, and compounding improvements. We meet you where you are and prioritise what moves the needle."
            )}
          </p>
          <p className="mt-3 text-slate-300">
            {translations(lang, "milestonePage.method.linkPrefix", "If you want the bigger picture, start with the")}{" "}
            <Link
              to={localizePath("/nps-intelligence-layer", lang)}
              className="text-link"
            >
              {translations(lang, "milestonePage.method.linkText", "NPS intelligence layer")}
            </Link>
            {translations(lang, "milestonePage.method.linkSuffix", ", then apply it here to milestone surveys.")}
          </p>
        </div>

        <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {methodCards.map((card, idx) => {
            const icons = [Star, LineChart, Wrench, Gauge];
            const Icon = icons[idx] || Star;

            return (
              <div key={card.title || idx} className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#22C55E] flex items-center justify-center">
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-white">{card.title}</h3>
                </div>
                <p className="mt-3 text-sm text-slate-300">{card.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Where milestone surveys fit */}
      <section className="mx-auto max-w-7xl px-6 pb-12">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
          <h3 className="text-xl md:text-2xl font-semibold text-white">
            {translations(lang, "milestonePage.fit.title", "Where milestone surveys fit")}
          </h3>
          <p className="mt-3 text-slate-300 max-w-3xl">
            {translations(lang, "milestonePage.fit.linkPrefix", "If you run NPS in a tool like Intercom, see")}{" "}
            <Link
              to={localizePath("/intercom-nps-analytics", lang)}
              className="text-link"
            >
              {translations(lang, "milestonePage.fit.linkText", "how we turn Intercom comments into prioritised actions")}
            </Link>
            {translations(lang, "milestonePage.fit.linkSuffix", ".")}
          </p>

          <div className="mt-4 grid gap-6 md:grid-cols-3">
            {fitCards.map((card, idx) => (
              <div key={card.title || idx} className="rounded-2xl border border-white/10 bg-black/20 p-5">
                <div className="text-white font-semibold">{card.title}</div>
                <div className="mt-2 text-sm text-slate-200">{card.q}</div>
                <div className="mt-2 text-xs text-slate-400">{card.why}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Implementation checklist + What we track */}
      <section className="mx-auto max-w-7xl px-6 pb-8">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-6">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-white" />
              <h4 className="text-white font-semibold">
                {translations(lang, "milestonePage.checklist.stepsTitle", "Implementation in 5 steps")}
              </h4>
            </div>

            <ol className="mt-3 space-y-2 list-decimal pl-5 text-sm text-slate-300">
              {steps.map((s, i) => (
                <li key={`${i}-${s}`}>{s}</li>
              ))}
            </ol>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 p-6">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-white" />
              <h4 className="text-white font-semibold">
                {translations(lang, "milestonePage.track.title", "What we track")}
              </h4>
            </div>

            <ul className="mt-3 space-y-2 list-disc pl-5 text-sm text-slate-300">
              {trackItems.map((t, i) => (
                <li key={`${i}-${t}`}>{t}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Related insights (internal linking block) */}
      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-white">
            {translations(lang, "milestonePage.definition.title")}
          </h2>

          <p className="mt-4 text-slate-300 max-w-3xl">
            {translations(lang, "milestonePage.definition.p1")}
          </p>

          <p className="mt-3 text-slate-300 max-w-3xl">
            {translations(lang, "milestonePage.definition.p2")}
          </p>
        </div>
      </section>
    </div>
  );
}
