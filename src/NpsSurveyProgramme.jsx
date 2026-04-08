// src/NpsSurveyProgramme.jsx
import React from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import Seo from "./components/Seo";
import PageHeader from "./components/PageHeader";
import { useLanguage } from "./i18n/LanguageContext";
import { translations } from "./i18n/translations";
import { localizePath } from "./i18n/pathHelpers";

export default function NpsSurveyProgramme() {
  const { lang } = useLanguage();
  const tr = (p, f) => translations(lang, p, f);
  const location = useLocation();

  const steps = translations(lang, "surveyProgramme.howItWorks.steps", []);
  const pulseBullets = translations(lang, "surveyProgramme.pulseBox.bullets", []);
  const leftBullets = translations(lang, "surveyProgramme.twoCol.left.bullets", []);
  const rightBullets = translations(lang, "surveyProgramme.twoCol.right.bullets", []);

  // Localised destinations (avoid bouncing FR users back to EN)
  const homeWithContactHash = `${localizePath("/", lang)}#contact`;
  const demoSurveyPagePath = localizePath("/demo-survey-page", lang);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B0F19] via-[#0C1224] to-[#0B0F19] text-slate-200">
      <Seo
        path={location.pathname}
        title={tr("surveyProgramme.seoTitle")}
        description={tr("surveyProgramme.seoDescription")}
      />

      <PageHeader
        iconLabel={tr("surveyProgramme.header.iconLabel")}
        tag={tr("surveyProgramme.header.tag")}
        accent={tr("surveyProgramme.header.accent")}
        title={tr("surveyProgramme.header.title")}
        subtitle={tr("surveyProgramme.header.subtitle")}
      />

      {/* Intro copy */}
      <section className="mx-auto max-w-4xl px-6 pt-8">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-white">
            {tr("surveyProgramme.introBox.title")}
          </h2>

          <p className="mt-4 text-slate-300">
            {tr("surveyProgramme.introBox.p1")}
          </p>

          <p className="mt-3 text-slate-300">
            {tr("surveyProgramme.introBox.p2")}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        {/* How it works */}
        <div className="mt-10 grid md:grid-cols-4 gap-6">
          {steps.map((item) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="rounded-2xl border border-white/10 bg-white/5 p-5 flex flex-col"
            >
              <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-[#7C3AED] to-[#22C55E] text-xs font-semibold text-white mb-3">
                {tr("surveyProgramme.howItWorks.stepLabel").replace("{n}", item.step)}
              </div>
              <h3 className="text-white text-lg font-medium mb-2">{item.title}</h3>
              <p className="text-slate-400 text-sm flex-1">{item.text}</p>
            </motion.div>
          ))}
        </div>

        {/* Rapid pulse use case */}
        <div className="mt-16 rounded-3xl border border-white/10 bg-black/30 p-8">
          <h2 className="text-2xl font-semibold text-white mb-3">
            {tr("surveyProgramme.pulseBox.title")}
          </h2>
          <p className="text-slate-400 mb-4 max-w-3xl">
            {tr("surveyProgramme.pulseBox.body")}
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-300 text-sm">
            {pulseBullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </div>

        {/* What your client sees */}
        <div className="mt-16 grid md:grid-cols-2 gap-8">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-xl text-white mb-3">
              {tr("surveyProgramme.twoCol.left.title")}
            </h3>
            <p className="text-slate-400 text-sm mb-4">
              {tr("surveyProgramme.twoCol.left.intro")}
            </p>
            <ul className="list-disc pl-5 space-y-1 text-sm text-slate-300">
              {leftBullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#0C1224] p-6">
            <h3 className="text-xl text-white mb-3">
              {tr("surveyProgramme.twoCol.right.title")}
            </h3>
            <p className="text-slate-400 text-sm mb-4">
              {tr("surveyProgramme.twoCol.right.intro")}
            </p>
            <ul className="list-disc pl-5 space-y-1 text-sm text-slate-300">
              {rightBullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* internal-link strip */}
        <div className="mt-16 rounded-2xl border border-white/10 bg-black/20 p-5">
          <div className="text-xs uppercase tracking-widest text-slate-400">
            {tr("surveyProgramme.related.title")}
          </div>

          <div className="mt-3 flex flex-wrap gap-3">
            <Link
              to={localizePath("/what-is-nps", lang)}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10 transition"
            >
              {tr("surveyProgramme.related.whatIsNps")}
            </Link>

            <Link
              to={localizePath("/milestone-nps", lang)}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10 transition"
            >
              {tr("surveyProgramme.related.milestone")}
            </Link>

            <Link
              to={localizePath("/intercom-nps-analytics", lang)}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10 transition"
            >
              {tr("surveyProgramme.related.intercom")}
            </Link>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-semibold text-white mb-3">
            {tr("surveyProgramme.cta.title")}
          </h2>
          <p className="text-slate-400 mb-6">
            {tr("surveyProgramme.cta.body")}
          </p>

          {/* Keep anchor behaviour, but localise the base path */}
          <Link
            to={homeWithContactHash}
            className="inline-block rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#22C55E] px-6 py-3 font-medium text-white hover:opacity-90 transition"
          >
            {tr("surveyProgramme.cta.button")}
          </Link>
        </div>

        {/* Demo CTA */}
        <div className="mt-20 mx-auto max-w-5xl">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h2 className="text-xl md:text-2xl font-semibold text-white">
                {tr("surveyProgramme.demo.title")}
              </h2>
              <p className="mt-2 text-sm text-slate-300 max-w-xl">
                {tr("surveyProgramme.demo.body")}
              </p>
            </div>

            <div className="flex flex-col items-start gap-2 shrink-0">
              <Link
                to={demoSurveyPagePath}
                className="inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-semibold bg-[#7C3AED] hover:bg-[#6D28D9] text-white transition"
              >
                {tr("surveyProgramme.demo.button")}
              </Link>
              <p className="text-[11px] text-slate-400 max-w-[200px]">
                {tr("surveyProgramme.demo.note")}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
