// src/MilestoneNps.jsx
import React from "react";
import { Star, LineChart, Wrench, Gauge, ClipboardList, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import Seo from "./components/Seo";
import PageHeader from "./components/PageHeader";
import { useLanguage } from "./i18n/LanguageContext";
import { translations } from "./i18n/translations";

export default function MilestoneNps() {
  const { lang } = useLanguage();

  const methodCards = translations(lang, "milestonePage.method.cards", []);
  const fitCards = translations(lang, "milestonePage.fit.cards", []);
  const steps = translations(lang, "milestonePage.checklist.steps", []);
  const trackItems = translations(lang, "milestonePage.track.items", []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B0F19] via-[#0C1224] to-[#0B0F19] text-slate-200">
      <Seo
        path="/milestone-nps"
        title={translations(lang, "milestonePage.seoTitle", "Milestone (Transactional) NPS® & Survey Signals | NPS Me")}
        description={translations(
          lang,
          "milestonePage.seoDescription",
          "Capture customer sentiment at key journey moments to reveal friction in context. Implement close-the-loop and theme tracking for actionable CX."
        )}
        lang={lang}
      />

      <PageHeader
        iconLabel={translations(lang, "milestonePage.header.iconLabel", "Milestone / transactional NPS")}
        tag={translations(lang, "milestonePage.header.tag", "NPS Me / Milestone NPS")}
      >
        <>
          <h1 className="mt-3 text-3xl sm:text-4xl md:text-5xl leading-tight font-semibold tracking-tight text-white">
            {translations(lang, "milestonePage.header.title", "Milestone (Transactional) NPS & Survey Signals")}
          </h1>

          <p className="mt-4 text-slate-300 max-w-3xl">
            {translations(
              lang,
              "milestonePage.header.intro",
              "A practical framework to capture feedback at key journey moments, turn it into prioritised work, and measure lift. We reference Net Promoter Score (NPS)® descriptively alongside CSAT, CES and behavioral data."
            )}
          </p>

          <div className="mt-6 flex gap-3 flex-wrap">
            <Link
              to="/impact"
              className="inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold bg-[#22C55E] text-[#0B0F19] hover:bg-[#16A34A] transition"
            >
              {translations(lang, "milestonePage.header.ctaImpact", "Estimate your impact")}
            </Link>

            <a
              href="/#contact"
              className="inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold bg-[#7C3AED] hover:bg-[#6D28D9] transition"
            >
              {translations(lang, "milestonePage.header.ctaBook", "Book discovery")}
            </a>
          </div>
        </>
      </PageHeader>

      {/* 4-Stage method */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="max-w-2xl">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-white">
            {translations(lang, "milestonePage.method.title", "The 4-stage method (simple, repeatable)")}
          </h2>
          <p className="mt-3 text-slate-300">
            {translations(
              lang,
              "milestonePage.method.intro",
              "Clear steps, fast wins, and compounding improvements. We meet you where you are and prioritise what moves the needle."
            )}
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
      <section className="mx-auto max-w-7xl px-6 pb-16">
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
    </div>
  );
}
