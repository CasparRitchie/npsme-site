// src/pages/WhatIsNps.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import Seo from "../components/Seo";
import PageHeader from "../components/PageHeader";
import { useLanguage } from "../i18n/LanguageContext";
import { translations } from "../i18n/translations";
import { localizePath } from "../i18n/pathHelpers";

export default function WhatIsNps() {
  const { lang } = useLanguage();
  const tr = (p, f) => translations(lang, p, f);
  const location = useLocation();

  const calcSteps = translations(lang, "whatIsNps.calc.steps", []);
  const relBullets = translations(lang, "whatIsNps.types.relationship.bullets", []);
  const txnBullets = translations(lang, "whatIsNps.types.transactional.bullets", []);
  const beyondBullets = translations(lang, "whatIsNps.beyond.bullets", []);
  const pitfallsList = translations(lang, "whatIsNps.pitfalls.pitfallsList", []);
  const betterList = translations(lang, "whatIsNps.pitfalls.betterList", []);
  const closeBullets = translations(lang, "whatIsNps.closeLoop.bullets", []);

  const productsPath = localizePath("/products", lang);
  const homeWithContactHash = `${localizePath("/", lang)}#contact`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B0F19] via-[#0C1224] to-[#0B0F19] text-slate-200">
      <Seo
        path={location.pathname}
        title={tr("whatIsNps.seoTitle")}
        description={tr("whatIsNps.seoDescription")}
      />

      <PageHeader
        iconLabel={tr("whatIsNps.header.iconLabel")}
        tag={tr("whatIsNps.header.tag")}
      >
        <>
          <h1 className="mt-3 text-3xl md:text-4xl font-semibold text-white leading-tight max-w-3xl">
            {tr("whatIsNps.header.title")}
          </h1>
          <p className="mt-4 text-slate-300 max-w-2xl">
            {tr("whatIsNps.header.subtitle")}
          </p>
        </>
      </PageHeader>

      <section className="mx-auto max-w-4xl px-6 py-10 space-y-10 text-slate-300">
        {/* Quick links */}
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-slate-300">
          <div className="text-xs uppercase tracking-widest text-slate-400">
            {tr("whatIsNps.quickLinks.title")}
          </div>

          <div className="mt-3 flex flex-wrap gap-3">
            <Link
              to={localizePath("/milestone-nps", lang)}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 hover:bg-white/10 transition"
            >
              {tr("whatIsNps.quickLinks.milestone")}
            </Link>

            <Link
              to={localizePath("/nps-survey-programme", lang)}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 hover:bg-white/10 transition"
            >
              {tr("whatIsNps.quickLinks.surveyProgramme")}
            </Link>

            <Link
              to={localizePath("/nps-intelligence-layer", lang)}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 hover:bg-white/10 transition"
            >
              {tr("whatIsNps.quickLinks.intelligenceLayer")}
            </Link>
          </div>
        </div>

        {/* Core question */}
        <article className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-white">{tr("whatIsNps.core.title")}</h2>
          <p className="mt-4">{tr("whatIsNps.core.intro")}</p>
          <p className="mt-3 text-lg text-white font-medium">{tr("whatIsNps.core.question")}</p>
          <p className="mt-4">{tr("whatIsNps.core.body1")}</p>

          <div className="mt-6 rounded-2xl bg-black/30 border border-white/10 p-5 text-sm">
            <div className="font-semibold text-white">{tr("whatIsNps.core.groupsTitle")}</div>
            <div className="mt-3 grid gap-4 md:grid-cols-3">
              <div>
                <div className="text-[#ef4444] font-semibold">
                  {tr("whatIsNps.core.groups.detractors.label")}
                </div>
                <p className="mt-1 text-xs text-slate-300">
                  {tr("whatIsNps.core.groups.detractors.text")}
                </p>
              </div>
              <div>
                <div className="text-[#f97316] font-semibold">
                  {tr("whatIsNps.core.groups.passives.label")}
                </div>
                <p className="mt-1 text-xs text-slate-300">
                  {tr("whatIsNps.core.groups.passives.text")}
                </p>
              </div>
              <div>
                <div className="text-[#22C55E] font-semibold">
                  {tr("whatIsNps.core.groups.promoters.label")}
                </div>
                <p className="mt-1 text-xs text-slate-300">
                  {tr("whatIsNps.core.groups.promoters.text")}
                </p>
              </div>
            </div>
          </div>
        </article>

        {/* Calculation */}
        <article className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-white">{tr("whatIsNps.calc.title")}</h2>
          <p className="mt-4">{tr("whatIsNps.calc.intro")}</p>

          <ol className="mt-3 list-decimal list-inside space-y-2 text-sm">
            {calcSteps.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>

          <p className="mt-4 text-sm">
            {tr("whatIsNps.calc.example").replace("{value}", "+40")}
          </p>

          <div className="mt-6">
            <div className="text-xs uppercase tracking-wider text-slate-400">
              {tr("whatIsNps.calc.scaleLabel")}
            </div>

            <div className="mt-2 flex text-[11px] font-medium text-slate-300">
              <div className="flex-[7] bg-[#ef4444] rounded-l-2xl py-2 text-center">
                {tr("whatIsNps.calc.bar.detractors")}
              </div>
              <div className="flex-[2] bg-[#f97316] py-2 text-center">
                {tr("whatIsNps.calc.bar.passives")}
              </div>
              <div className="flex-[2] bg-[#22C55E] rounded-r-2xl py-2 text-center">
                {tr("whatIsNps.calc.bar.promoters")}
              </div>
            </div>

            <div className="mt-2 flex justify-between text-[11px] text-slate-400 font-mono">
              {[...Array(11).keys()].map((num) => (
                <span key={num}>{num}</span>
              ))}
            </div>
          </div>
        </article>

        {/* Relationship vs transactional */}
        <article className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-white">{tr("whatIsNps.types.title")}</h2>
          <p className="mt-4 text-sm">{tr("whatIsNps.types.intro")}</p>

          <div className="mt-4 grid gap-6 md:grid-cols-2 text-sm">
            <div className="rounded-2xl bg-black/30 border border-white/10 p-4">
              <div className="text-white font-semibold">
                {tr("whatIsNps.types.relationship.title")}
              </div>
              <p className="mt-2 text-slate-300">{tr("whatIsNps.types.relationship.body")}</p>
              <ul className="mt-3 list-disc list-inside space-y-1 text-xs text-slate-300">
                {relBullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl bg-black/30 border border-white/10 p-4">
              <div className="text-white font-semibold">
                {tr("whatIsNps.types.transactional.title")}
              </div>
              <p className="mt-2 text-slate-300">{tr("whatIsNps.types.transactional.body")}</p>
              <ul className="mt-3 list-disc list-inside space-y-1 text-xs text-slate-300">
                {txnBullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </div>
          </div>
        </article>

        {/* Beyond the score */}
        <article className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-white">{tr("whatIsNps.beyond.title")}</h2>
          <p className="mt-4 text-sm">{tr("whatIsNps.beyond.p1")}</p>
          <p className="mt-3 text-sm">{tr("whatIsNps.beyond.p2")}</p>
          <p className="mt-3 text-sm">{tr("whatIsNps.beyond.p3")}</p>

          <ul className="mt-4 list-disc list-inside space-y-2 text-sm">
            {beyondBullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </article>

        {/* Pitfalls and good practice */}
        <article className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-white">{tr("whatIsNps.pitfalls.title")}</h2>

          <div className="mt-4 grid gap-6 md:grid-cols-2 text-sm">
            <div>
              <div className="font-semibold text-white">{tr("whatIsNps.pitfalls.pitfallsTitle")}</div>
              <ul className="mt-3 list-disc list-inside space-y-2">
                {pitfallsList.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            </div>

            <div>
              <div className="font-semibold text-white">{tr("whatIsNps.pitfalls.betterTitle")}</div>
              <ul className="mt-3 list-disc list-inside space-y-2">
                {betterList.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            </div>
          </div>
        </article>

        {/* Closing the loop */}
        <article className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-white">{tr("whatIsNps.closeLoop.title")}</h2>
          <p className="mt-4 text-sm">{tr("whatIsNps.closeLoop.intro")}</p>

          <ul className="mt-3 list-disc list-inside space-y-2 text-sm">
            {closeBullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>

          <p className="mt-3 text-sm">{tr("whatIsNps.closeLoop.outro")}</p>
        </article>

        {/* CTA */}
        <article className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#141B2E] to-[#0F172A] p-8 text-center">
          <h2 className="text-2xl font-semibold text-white">{tr("whatIsNps.cta.title")}</h2>
          <p className="mt-3 text-sm text-slate-300 max-w-2xl mx-auto">
            {tr("whatIsNps.cta.body")}
          </p>

          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to={productsPath}
              className="rounded-2xl px-6 py-3 text-sm font-semibold bg-[#7C3AED] hover:bg-[#6D28D9] transition"
            >
              {tr("whatIsNps.cta.explore")}
            </Link>

            <Link
              to={homeWithContactHash}
              className="rounded-2xl px-6 py-3 text-sm font-semibold bg-[#22C55E] text-[#0B0F19] hover:bg-[#16A34A] transition"
            >
              {tr("whatIsNps.cta.book")}
            </Link>
          </div>

          <p className="mt-8 text-[11px] leading-relaxed text-slate-500">
            {tr("whatIsNps.cta.disclaimer")}
          </p>
        </article>
      </section>
    </div>
  );
}
