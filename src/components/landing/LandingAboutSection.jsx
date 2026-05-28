// src/components/landing/LandingAboutSection.jsx
import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useLanguage } from "../../i18n/LanguageContext";
import { translations } from "../../i18n/translations";
import { localizePath } from "../../i18n/pathHelpers";

export default function LandingAboutSection() {
  const { lang } = useLanguage();
  const tr = (p, f) => translations(lang, p, f);
  const aboutBullets = translations(lang, "landing.about.bullets", []);

  return (
    <section id="about" className="mx-auto max-w-7xl px-6 pb-20">
      <h2 className="text-2xl font-semibold text-white md:text-3xl">
        {tr("landing.about.title")}
      </h2>
      <p className="mt-3 max-w-2xl text-slate-300">
        {tr("landing.about.body")}
      </p>

      <ul className="mt-6 space-y-3 text-sm text-slate-300">
        {aboutBullets.map((t) => (
          <li key={t} className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 text-[#22C55E]" />
            <span>{t}</span>
          </li>
        ))}
      </ul>

      <Link
        to={localizePath("/about", lang)}
        className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-2.5 text-sm font-semibold transition hover:bg-white/15"
      >
        {tr("landing.about.cta", "Read more")}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </section>
  );
}
