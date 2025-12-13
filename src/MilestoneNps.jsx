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
  const tr = (p, f) => translations(lang, p, f);

  const methodCards = translations(lang, "milestonePage.method.cards", []);
  const fitCards = translations(lang, "milestonePage.fit.cards", []);
  const steps = translations(lang, "milestonePage.checklist.steps", []);
  const trackItems = translations(lang, "milestonePage.track.items", []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B0F19] via-[#0C1224] to-[#0B0F19] text-slate-200">
      <Seo
        path="/milestone-nps"
        title={tr("milestonePage.seoTitle")}
        description={tr("milestonePage.seoDescription")}
      />

      <PageHeader iconLabel={tr("milestonePage.header.iconLabel")} tag={tr("milestonePage.header.tag")}>
        <>
          <h1 className="mt-3 text-3xl sm:text-4xl md:text-5xl leading-tight font-semibold tracking-tight text-white">
            {tr("milestonePage.header.title")}
          </h1>

          <p className="mt-4 text-slate-300 max-w-3xl">
            {tr("milestonePage.header.intro")}
          </p>

          <div className="mt-6 flex gap-3 flex-wrap">
            <Link
              to="/impact"
              className="inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold bg-[#22C55E] text-[#0B0F19] hover:bg-[#16A34A] transition"
            >
              {tr("milestonePage.header.ctaImpact")}
            </Link>

            {/* keeping anchors stable as agreed */}
            <a
              href="/#contact"
              className="inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold bg-[#7C3AED] hover:bg-[#6D28D9] transition"
            >
              {tr("milestonePage.header.ctaBook")}
            </a>
          </div>
        </>
      </PageHeader>

      {/* 4-Stage method */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="max-w-2xl">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-white">
            {tr("milestonePage.method.title")}
          </h2>
          <p className="mt-3 text-slate-300">
            {tr("milestonePage.method.intro")}
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
            {tr("milestonePage.fit.title")}
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
                {tr("milestonePage.checklist.stepsTitle")}
              </h4>
            </div>

            <ol className="mt-3 space-y-2 list-decimal pl-5 text-sm text-slate-300">
              {steps.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 p-6">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-white" />
              <h4 className="text-white font-semibold">
                {tr("milestonePage.track.title")}
              </h4>
            </div>

            <ul className="mt-3 space-y-2 list-disc pl-5 text-sm text-slate-300">
              {trackItems.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
