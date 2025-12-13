// src/pages/BlogClosingTheLoop.jsx
import React from "react";
import Seo from "../components/Seo";
import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import { useLanguage } from "../i18n/LanguageContext";
import { translations } from "../i18n/translations";

export default function BlogClosingTheLoop() {
  const { lang } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B0F19] via-[#0C1224] to-[#0B0F19] text-slate-200">
      <Seo
        path="/blog/closing-the-loop"
        title={translations(lang, "blogClosingLoop.seo.title")}
        description={translations(lang, "blogClosingLoop.seo.description")}
      />

      <PageHeader
        iconLabel={translations(lang, "blogClosingLoop.header.iconLabel")}
        tag={translations(lang, "blogClosingLoop.header.tag")}
        accent={translations(lang, "blogClosingLoop.header.accent")}
        title={translations(lang, "blogClosingLoop.header.title")}
        subtitle={translations(lang, "blogClosingLoop.header.subtitle")}
      />

      <main className="mx-auto max-w-4xl px-6 py-10 md:py-14 space-y-10 md:space-y-12">

        {/* Intro */}
        <section className="mt-8 rounded-2xl border border-white/10 bg-black/30 p-5 md:p-6">
          <p className="text-sm md:text-base text-slate-200 leading-relaxed">
            {translations(lang, "blogClosingLoop.intro.p1")}
          </p>
          <p className="mt-3 text-sm md:text-base text-slate-200 leading-relaxed">
            {translations(lang, "blogClosingLoop.intro.p2")}
          </p>
        </section>

        {/* Sections */}
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <section
            key={n}
            className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5 md:p-6"
          >
            <h2 className="flex items-center gap-3 text-lg md:text-xl font-semibold text-white">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#22C55E] to-[#7C3AED] text-[11px] font-bold">
                {n}
              </span>
              <span>
                {translations(lang, `blogClosingLoop.sections.${n}.title`)}
              </span>
            </h2>
            <div className="mt-3 space-y-3 text-sm md:text-base text-slate-200 leading-relaxed">
              <p>{translations(lang, `blogClosingLoop.sections.${n}.p1`)}</p>
              <p>{translations(lang, `blogClosingLoop.sections.${n}.p2`)}</p>
            </div>
          </section>
        ))}

        {/* CTA */}
        <footer className="mt-12">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#141B2E] via-[#0B1120] to-[#0B0F19] p-6 md:p-8 text-center">
            <p className="text-sm md:text-base text-slate-200">
              {translations(lang, "blogClosingLoop.cta.lead")}
            </p>
            <p className="mt-2 text-xs md:text-sm text-slate-400 max-w-2xl mx-auto">
              {translations(lang, "blogClosingLoop.cta.sub")}
            </p>
            <div className="mt-5 flex flex-col sm:flex-row justify-center gap-3">
              <Link
                to="/products"
                className="rounded-2xl px-6 py-2.5 text-sm font-semibold bg-[#7C3AED] hover:bg-[#6D28D9] transition"
              >
                {translations(lang, "blogClosingLoop.cta.services")}
              </Link>
              <Link
                to="/book"
                className="rounded-2xl px-6 py-2.5 text-sm font-semibold bg-[#22C55E] text-[#020617] hover:bg-[#16A34A] transition"
              >
                {translations(lang, "blogClosingLoop.cta.book")}
              </Link>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
