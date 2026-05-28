// src/components/landing/LandingContactSection.jsx
import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "../../i18n/LanguageContext";
import { translations } from "../../i18n/translations";
import { localizePath } from "../../i18n/pathHelpers";

export default function LandingContactSection() {
  const { lang } = useLanguage();
  const tr = (p, f) => translations(lang, p, f);

  return (
    <section id="contact" className="mx-auto max-w-7xl px-6 pb-24">
      <div className="rounded-3xl bg-gradient-to-br from-[#141B2E] to-[#0F172A] p-8 text-center md:p-12 border border-white/10">
        <h2 className="text-2xl font-semibold text-white md:text-3xl">
          {tr("landing.contact.title")}
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-slate-300">
          {tr("landing.contact.body")}
        </p>

        <div className="mt-6 flex flex-col justify-center gap-4 sm:flex-row">
          <a
            href="mailto:hello@npsme.com"
            className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-[#22C55E] px-6 py-3 text-sm font-semibold text-[#0B0F19] transition hover:bg-[#16A34A]"
          >
            {tr("landing.contact.emailCta")}
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </a>

          <Link
            to={localizePath("/book", lang)}
            className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-[#7C3AED] px-6 py-3 text-sm font-semibold transition hover:bg-[#6D28D9]"
          >
            {tr("landing.contact.bookCta")}
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
