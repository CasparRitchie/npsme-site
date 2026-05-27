// src/pages/BlogEthicsOfContactSelection.jsx
import React from "react";
import Seo from "../components/Seo";
import { Link, useLocation } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import { useLanguage } from "../i18n/LanguageContext";
import { translations } from "../i18n/translations";
import { localizePath } from "../i18n/pathHelpers";

export default function BlogEthicsOfContactSelection() {
  const { lang } = useLanguage();
  const location = useLocation();
  const BASE = "blogEthicsOfContactSelection";
  const tr = (path, fallback = "") => translations(lang, path, fallback);
  const DATE_PUBLISHED = "2025-10-23";
  const DATE_MODIFIED = "2025-10-23";

  const seoTitle = tr(`${BASE}.seo.title`);
  const seoDescription = tr(`${BASE}.seo.description`);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B0F19] via-[#0C1224] to-[#0B0F19] text-slate-200">
      <Seo
        path="/blog/ethics-of-contact-selection"
        title={seoTitle}
        description={seoDescription}
      />
      {/* BlogPosting JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: tr(`${BASE}.header.title`, tr(`${BASE}.seo.title`, "Blog post")),
            description: tr(`${BASE}.seo.description`, ""),
            datePublished: DATE_PUBLISHED,
            dateModified: DATE_MODIFIED,
            inLanguage: lang,
            author: { "@type": "Person", name: "Caspar Ritchie" },
            publisher: { "@type": "Organization", name: "NPS Me" },
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": "https://www.npsme.com" + location.pathname,
            },
          }),
        }}
      />

      {/* Meta header */}
      <PageHeader
        iconLabel={translations(lang, "blogEthicsOfContactSelection.header.iconLabel")}
        tag={translations(lang, "blogEthicsOfContactSelection.header.tag")}
        accent={translations(lang, "blogEthicsOfContactSelection.header.accent")}
        title={translations(lang, "blogEthicsOfContactSelection.header.title")}
        subtitle={translations(lang, "blogEthicsOfContactSelection.header.subtitle")}
      />

      <main className="mx-auto max-w-4xl px-6 py-10 md:py-14 space-y-10 md:space-y-12">
        {/* Intro */}
        <section className="mt-8 rounded-2xl border border-white/10 bg-black/30 p-5 md:p-6">
          <p className="text-sm md:text-base text-slate-200 leading-relaxed">
            {translations(lang, "blogEthicsOfContactSelection.intro.p1a")}{" "}
            <em>{translations(lang, "blogEthicsOfContactSelection.intro.p1b")}</em>{" "}
            {translations(lang, "blogEthicsOfContactSelection.intro.p1c")}{" "}
            {translations(lang, "blogEthicsOfContactSelection.intro.p1d")}
          </p>
        </section>

        {/* 1 - Temptation to shape the sample */}
        <section className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5 md:p-6">
          <h2 className="flex items-center gap-3 text-lg md:text-xl font-semibold text-white">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#7C3AED] to-[#22C55E] text-[11px] font-bold">
              1
            </span>
            <span>{translations(lang, "blogEthicsOfContactSelection.sections.1.title")}</span>
          </h2>

          <div className="mt-3 space-y-3 text-sm md:text-base text-slate-200 leading-relaxed">
            <p>
              {translations(lang, "blogEthicsOfContactSelection.sections.1.p1a")}{" "}
              <strong>{translations(lang, "blogEthicsOfContactSelection.sections.1.p1b")}</strong>{" "}
              {translations(lang, "blogEthicsOfContactSelection.sections.1.p1c")}{" "}
              <strong>{translations(lang, "blogEthicsOfContactSelection.sections.1.p1d")}</strong>.
              {translations(lang, "blogEthicsOfContactSelection.sections.1.p1e")}
            </p>
            <p>{translations(lang, "blogEthicsOfContactSelection.sections.1.p2")}</p>
            <p>{translations(lang, "blogEthicsOfContactSelection.sections.1.p3")}</p>
          </div>
        </section>

        {/* 2 - Response rates vs authenticity */}
        <section className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5 md:p-6">
          <h2 className="flex items-center gap-3 text-lg md:text-xl font-semibold text-white">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#22C55E] to-[#7C3AED] text-[11px] font-bold">
              2
            </span>
            <span>{translations(lang, "blogEthicsOfContactSelection.sections.2.title")}</span>
          </h2>

          <div className="mt-3 space-y-3 text-sm md:text-base text-slate-200 leading-relaxed">
            <p>
              {translations(lang, "blogEthicsOfContactSelection.sections.2.p1a")}{" "}
              <em>{translations(lang, "blogEthicsOfContactSelection.sections.2.p1b")}</em>{" "}
              {translations(lang, "blogEthicsOfContactSelection.sections.2.p1c")}{" "}
              <em>{translations(lang, "blogEthicsOfContactSelection.sections.2.p1d")}</em>
              {translations(lang, "blogEthicsOfContactSelection.sections.2.p1e")}
            </p>

            <blockquote className="border-l-4 border-[#22C55E] pl-4 italic text-slate-400">
              {translations(lang, "blogEthicsOfContactSelection.sections.2.quoteLine1")}
              <br />
              {translations(lang, "blogEthicsOfContactSelection.sections.2.quoteLine2")}
            </blockquote>

            <p>{translations(lang, "blogEthicsOfContactSelection.sections.2.p2")}</p>
          </div>
        </section>

        {/* 3 - Guardrails */}
        <section className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5 md:p-6">
          <h2 className="flex items-center gap-3 text-lg md:text-xl font-semibold text-white">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#7C3AED] to-[#22C55E] text-[11px] font-bold">
              3
            </span>
            <span>{translations(lang, "blogEthicsOfContactSelection.sections.3.title")}</span>
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-sm md:text-base text-slate-200">
            <li>
              <strong>{translations(lang, "blogEthicsOfContactSelection.sections.3.bullets.1.bold")}</strong>{" "}
              {translations(lang, "blogEthicsOfContactSelection.sections.3.bullets.1.text")}
            </li>
            <li>
              <strong>{translations(lang, "blogEthicsOfContactSelection.sections.3.bullets.2.bold")}</strong>{" "}
              {translations(lang, "blogEthicsOfContactSelection.sections.3.bullets.2.text")}
            </li>
            <li>
              <strong>{translations(lang, "blogEthicsOfContactSelection.sections.3.bullets.3.bold")}</strong>{" "}
              {translations(lang, "blogEthicsOfContactSelection.sections.3.bullets.3.text")}
            </li>
            <li>
              <strong>{translations(lang, "blogEthicsOfContactSelection.sections.3.bullets.4.bold")}</strong>{" "}
              {translations(lang, "blogEthicsOfContactSelection.sections.3.bullets.4.text")}
            </li>
            <li>
              <strong>{translations(lang, "blogEthicsOfContactSelection.sections.3.bullets.5.bold")}</strong>{" "}
              {translations(lang, "blogEthicsOfContactSelection.sections.3.bullets.5.text")}
            </li>
            <li>
              <strong>{translations(lang, "blogEthicsOfContactSelection.sections.3.bullets.6.bold")}</strong>{" "}
              {translations(lang, "blogEthicsOfContactSelection.sections.3.bullets.6.text")}
            </li>
          </ul>
        </section>

        {/* 4 - What “good” looks like */}
        <section className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5 md:p-6">
          <h2 className="flex items-center gap-3 text-lg md:text-xl font-semibold text-white">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#22C55E] to-[#7C3AED] text-[11px] font-bold">
              4
            </span>
            <span>{translations(lang, "blogEthicsOfContactSelection.sections.4.title")}</span>
          </h2>

          <div className="mt-3 space-y-3 text-sm md:text-base text-slate-200 leading-relaxed">
            <p>{translations(lang, "blogEthicsOfContactSelection.sections.4.p1")}</p>
            <ul className="list-disc list-inside space-y-1">
              <li>{translations(lang, "blogEthicsOfContactSelection.sections.4.bullets.1")}</li>
              <li>{translations(lang, "blogEthicsOfContactSelection.sections.4.bullets.2")}</li>
              <li>{translations(lang, "blogEthicsOfContactSelection.sections.4.bullets.3")}</li>
              <li>{translations(lang, "blogEthicsOfContactSelection.sections.4.bullets.4")}</li>
            </ul>
          </div>
        </section>

        {/* 5 - Key takeaways + attribution */}
        <section className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5 md:p-6">
          <h2 className="flex items-center gap-3 text-lg md:text-xl font-semibold text-white">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#7C3AED] to-[#22C55E] text-[11px] font-bold">
              5
            </span>
            <span>{translations(lang, "blogEthicsOfContactSelection.sections.5.title")}</span>
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-sm md:text-base text-slate-200">
            <li>
              <strong>{translations(lang, "blogEthicsOfContactSelection.sections.5.bullets.1")}</strong>
            </li>
            <li>
              <strong>{translations(lang, "blogEthicsOfContactSelection.sections.5.bullets.2")}</strong>
            </li>
            <li>
              <strong>{translations(lang, "blogEthicsOfContactSelection.sections.5.bullets.3")}</strong>
            </li>
            <li>
              <strong>{translations(lang, "blogEthicsOfContactSelection.sections.5.bullets.4")}</strong>
            </li>
          </ul>

          <div className="mt-5 rounded-2xl border border-white/10 bg-black/30 p-4 text-[11px] leading-relaxed text-slate-400">
            <p>{translations(lang, "blogEthicsOfContactSelection.sections.5.attribution")}</p>
          </div>
        </section>

        {/* CTA footer */}
        <footer className="mt-12">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#141B2E] via-[#0B1120] to-[#0B0F19] p-6 md:p-8 text-center">
            <p className="text-sm md:text-base text-slate-200">
              {translations(lang, "blogEthicsOfContactSelection.cta.p1")}
            </p>
            <p className="mt-2 text-xs md:text-sm text-slate-400 max-w-2xl mx-auto">
              {translations(lang, "blogEthicsOfContactSelection.cta.p2")}
            </p>

            <div className="mt-5 flex flex-col sm:flex-row justify-center gap-3">
              <Link
                to={localizePath("/products", lang)}
                className="rounded-2xl px-6 py-2.5 text-sm font-semibold bg-[#7C3AED] hover:bg-[#6D28D9] transition"
              >
                {translations(lang, "blogEthicsOfContactSelection.cta.btnServices")}
              </Link>
              <Link
                to={localizePath("/book", lang)}
                className="rounded-2xl px-6 py-2.5 text-sm font-semibold bg-[#22C55E] text-[#020617] hover:bg-[#16A34A] transition"
              >
                {translations(lang, "blogEthicsOfContactSelection.cta.btnBook")}
              </Link>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
