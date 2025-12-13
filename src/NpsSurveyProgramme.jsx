// src/NpsSurveyProgramme.jsx
import React from "react";
import { motion } from "framer-motion";
import Seo from "./components/Seo";
import PageHeader from "./components/PageHeader";
import { useLanguage } from "./i18n/LanguageContext";
import { translations } from "./i18n/translations";

export default function NpsSurveyProgramme() {
  const { lang } = useLanguage();
  const tr = (p, f) => translations(lang, p, f);

  const steps = translations(lang, "surveyProgramme.howItWorks.steps", []);
  const pulseBullets = translations(lang, "surveyProgramme.pulseBox.bullets", []);
  const leftBullets = translations(lang, "surveyProgramme.twoCol.left.bullets", []);
  const rightBullets = translations(lang, "surveyProgramme.twoCol.right.bullets", []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B0F19] via-[#0C1224] to-[#0B0F19] text-slate-200">
      <Seo
        path="/nps-survey-programme"
        title={tr("surveyProgramme.seoTitle")}
        description={tr("surveyProgramme.seoDescription")}
      />

      <PageHeader
        iconLabel={tr("surveyProgramme.header.iconLabel")}
        tag={tr("surveyProgramme.header.tag")}
        accent={tr("surveyProgramme.header.accent")}
        title=""
        subtitle={tr("surveyProgramme.header.subtitle")}
      />

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

        {/* CTA */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-semibold text-white mb-3">
            {tr("surveyProgramme.cta.title")}
          </h2>
          <p className="text-slate-400 mb-6">
            {tr("surveyProgramme.cta.body")}
          </p>
          {/* keep anchors stable */}
          <a
            href="/#contact"
            className="inline-block rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#22C55E] px-6 py-3 font-medium text-white hover:opacity-90 transition"
          >
            {tr("surveyProgramme.cta.button")}
          </a>
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
              <a
                href="/demo-survey-page"
                className="inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-semibold bg-[#7C3AED] hover:bg-[#6D28D9] text-white transition"
              >
                {tr("surveyProgramme.demo.button")}
              </a>
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
