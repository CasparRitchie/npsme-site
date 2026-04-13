import React from "react";
import { Link, useLocation } from "react-router-dom";
import { GraduationCap, ArrowRight, CheckCircle2 } from "lucide-react";
import Seo from "./components/Seo";
import PageHeader from "./components/PageHeader";
import { useLanguage } from "./i18n/LanguageContext.jsx";
import { TRANSLATIONS, translations } from "./i18n/translations.js";
import { localizePath } from "./i18n/pathHelpers.js";

export default function Training() {
  const { lang } = useLanguage();
  const location = useLocation();
  const dict = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const audiences = dict?.training?.audiences?.items || [];
  const topics = dict?.training?.topics?.items || [];
  const formats = dict?.training?.formats?.items || [];
  const outcomes = dict?.training?.outcomes?.items || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B0F19] via-[#0C1224] to-[#0B0F19] text-slate-200">
      <Seo
        path={location.pathname}
        lang={lang}
        title={translations(lang, "training.seoTitle")}
        description={translations(lang, "training.seoDescription")}
      />

      <PageHeader
        iconLabel={translations(lang, "training.header.iconLabel")}
        tag={translations(lang, "training.header.tag")}
        accent={translations(lang, "training.header.accent")}
        title={translations(lang, "training.header.title")}
        subtitle={translations(lang, "training.header.subtitle")}
      />

      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
          <h2 className="text-xl md:text-2xl font-semibold text-white">
            {translations(lang, "training.intro.title")}
          </h2>
          <p className="mt-3 text-slate-300 max-w-3xl">
            {translations(lang, "training.intro.body")}
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <Panel
            icon={<GraduationCap className="h-5 w-5 text-white" />}
            title={translations(lang, "training.audiences.title")}
            items={audiences}
          />
          <Panel
            icon={<GraduationCap className="h-5 w-5 text-white" />}
            title={translations(lang, "training.topics.title")}
            items={topics}
          />
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <Panel
            icon={<GraduationCap className="h-5 w-5 text-white" />}
            title={translations(lang, "training.formats.title")}
            items={formats}
          />
          <Panel
            icon={<GraduationCap className="h-5 w-5 text-white" />}
            title={translations(lang, "training.outcomes.title")}
            items={outcomes}
          />
        </div>

        <div className="mt-10 rounded-3xl border border-white/10 bg-gradient-to-br from-[#141B2E] to-[#0F172A] p-8 text-center">
          <h3 className="text-2xl font-semibold text-white">
            {translations(lang, "training.cta.title")}
          </h3>
          <p className="mt-3 text-slate-300 max-w-2xl mx-auto">
            {translations(lang, "training.cta.body")}
          </p>

          <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to={localizePath("/book", lang)}
              className="rounded-2xl px-6 py-3 text-sm font-semibold bg-[#22C55E] text-[#0B0F19] hover:bg-[#16A34A] transition inline-flex items-center justify-center gap-2"
            >
              {translations(lang, "training.cta.primary")}
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              to={localizePath("/products", lang)}
              className="rounded-2xl px-6 py-3 text-sm font-semibold bg-[#7C3AED] hover:bg-[#6D28D9] transition inline-flex items-center justify-center gap-2"
            >
              {translations(lang, "training.cta.secondary")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function Panel({ icon, title, items }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#22C55E] flex items-center justify-center">
          {icon}
        </div>
        <h3 className="text-white font-semibold">{title}</h3>
      </div>

      <ul className="mt-4 space-y-2 text-sm text-slate-300">
        {(items || []).map((item) => (
          <li key={item} className="flex gap-2">
            <CheckCircle2 className="h-4 w-4 text-[#22C55E] mt-0.5 shrink-0" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
