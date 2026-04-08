// src/pages/BlogWhyNpsIsntImproving.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import Seo from "../components/Seo";
import PageHeader from "../components/PageHeader";
import { useLanguage } from "../i18n/LanguageContext";
import { translations } from "../i18n/translations";

export default function BlogWhyNpsIsntImproving() {
  const { lang } = useLanguage();
  const tr = (p, f) => translations(lang, p, f);
  const location = useLocation();

  const BASE = "blogWhyNpsIsntImproving";
  const DATE_PUBLISHED = "2025-12-03";
  const DATE_MODIFIED = "2025-12-03";
  const base = "blogWhyNpsIsntImproving";

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B0F19] via-[#0C1224] to-[#0B0F19] text-slate-200">
      <Seo
        path="/blog/why-nps-isnt-improving"
        title={translations(lang, `${base}.seo.title`)}
        description={translations(lang, `${base}.seo.description`)}
      />

      {/* BlogPosting JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: tr(`${BASE}.h1`, tr(`${BASE}.header.title`, tr(`${BASE}.seo.title`, "Blog post"))),
            description: tr(`${BASE}.seo.description`, ""),
            datePublished: DATE_PUBLISHED,
            dateModified: DATE_MODIFIED,
            inLanguage: lang,
            author: { "@type": "Person", name: "Caspar Ritchie" },
            publisher: { "@type": "Organization", name: "NPS Me" },
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": "https://npsme.com" + location.pathname,
            },
          }),
        }}
      />

      {/* Shared blog hero */}
      <PageHeader
        iconLabel={translations(lang, `${base}.header.iconLabel`)}
        tag={translations(lang, `${base}.header.tag`)}
        title={translations(lang, `${base}.header.title`)}
        subtitle={translations(lang, `${base}.header.subtitle`)}
      />

      {/* Content */}
      <section className="mx-auto max-w-3xl px-6 py-12">
        <div className="space-y-8 text-slate-300 leading-relaxed">
          <p>
            {translations(lang, `${base}.p.1.a`)}{" "}
            <span className="font-semibold text-slate-100">
              {translations(lang, `${base}.p.1.bStrong`)}
            </span>
          </p>

          <p>{translations(lang, `${base}.p.2`)}</p>

          <p>
            {translations(lang, `${base}.p.3.a`)} <em>{translations(lang, `${base}.p.3.bEm`)}</em>{" "}
            {translations(lang, `${base}.p.3.c`)}
          </p>

          <p>{translations(lang, `${base}.p.4`)}</p>

          {/* 1 */}
          <h2 className="text-xl font-semibold text-white mt-8">
            {translations(lang, `${base}.s.1.title`)}
          </h2>
          <p>{translations(lang, `${base}.s.1.p1`)}</p>
          <ul className="mt-3 list-disc list-inside space-y-1">
            <li>{translations(lang, `${base}.s.1.bullets.1`)}</li>
            <li>{translations(lang, `${base}.s.1.bullets.2`)}</li>
            <li>{translations(lang, `${base}.s.1.bullets.3`)}</li>
            <li>{translations(lang, `${base}.s.1.bullets.4`)}</li>
          </ul>
          <p className="mt-3">{translations(lang, `${base}.s.1.p2`)}</p>
          <p>
            {translations(lang, `${base}.s.1.p3.a`)}{" "}
            <span className="font-semibold text-slate-100">
              {translations(lang, `${base}.s.1.p3.bStrong`)}
            </span>{" "}
            {translations(lang, `${base}.s.1.p3.c`)}
          </p>
          <p className="mt-2">
            <span className="font-semibold text-slate-100">
              {translations(lang, `${base}.s.1.p4.strong`)}
            </span>{" "}
            {translations(lang, `${base}.s.1.p4.rest`)}
          </p>

          {/* 2 */}
          <h2 className="text-xl font-semibold text-white mt-8">
            {translations(lang, `${base}.s.2.title`)}
          </h2>
          <p>{translations(lang, `${base}.s.2.p1`)}</p>
          <p className="mt-2 italic text-slate-400">
            {translations(lang, `${base}.s.2.quote.a`)}{" "}
            <span className="not-italic">{translations(lang, `${base}.s.2.quote.bNotItalic`)}</span>{" "}
            {translations(lang, `${base}.s.2.quote.c`)}
          </p>
          <p className="mt-3">{translations(lang, `${base}.s.2.p2`)}</p>
          <p className="mt-3">{translations(lang, `${base}.s.2.p3`)}</p>
          <ul className="mt-2 list-disc list-inside space-y-1">
            <li>{translations(lang, `${base}.s.2.bullets.1`)}</li>
            <li>{translations(lang, `${base}.s.2.bullets.2`)}</li>
            <li>{translations(lang, `${base}.s.2.bullets.3`)}</li>
          </ul>
          <p className="mt-3">{translations(lang, `${base}.s.2.p4`)}</p>

          {/* 3 */}
          <h2 className="text-xl font-semibold text-white mt-8">
            {translations(lang, `${base}.s.3.title`)}
          </h2>
          <p>{translations(lang, `${base}.s.3.p1`)}</p>
          <p className="mt-3">{translations(lang, `${base}.s.3.p2`)}</p>
          <p>{translations(lang, `${base}.s.3.p3`)}</p>
          <p className="mt-3">
            <span className="font-semibold text-slate-100">
              {translations(lang, `${base}.s.3.p4.strong`)}
            </span>
            {translations(lang, `${base}.s.3.p4.rest`)}
          </p>
          <ul className="mt-2 list-disc list-inside space-y-1">
            <li>{translations(lang, `${base}.s.3.bullets.1`)}</li>
            <li>{translations(lang, `${base}.s.3.bullets.2`)}</li>
            <li>{translations(lang, `${base}.s.3.bullets.3`)}</li>
          </ul>
          <p className="mt-3">{translations(lang, `${base}.s.3.p5`)}</p>

          {/* 4 */}
          <h2 className="text-xl font-semibold text-white mt-8">
            {translations(lang, `${base}.s.4.title`)}
          </h2>
          <p>{translations(lang, `${base}.s.4.p1`)}</p>
          <p className="mt-3">{translations(lang, `${base}.s.4.p2`)}</p>
          <p className="mt-3">{translations(lang, `${base}.s.4.p3`)}</p>
          <p className="mt-3">{translations(lang, `${base}.s.4.p4`)}</p>
          <ul className="mt-2 list-disc list-inside space-y-1">
            <li>{translations(lang, `${base}.s.4.bullets.1`)}</li>
            <li>{translations(lang, `${base}.s.4.bullets.2`)}</li>
            <li>{translations(lang, `${base}.s.4.bullets.3`)}</li>
            <li>{translations(lang, `${base}.s.4.bullets.4`)}</li>
            <li>{translations(lang, `${base}.s.4.bullets.5`)}</li>
          </ul>
          <p className="mt-3">{translations(lang, `${base}.s.4.p5`)}</p>
          <p className="mt-3">
            <span className="font-semibold text-slate-100">
              {translations(lang, `${base}.s.4.p6.strong`)}
            </span>
          </p>

          {/* 5 */}
          <h2 className="text-xl font-semibold text-white mt-8">
            {translations(lang, `${base}.s.5.title`)}
          </h2>
          <p>{translations(lang, `${base}.s.5.p1`)}</p>
          <p className="mt-3">{translations(lang, `${base}.s.5.p2`)}</p>
          <p>{translations(lang, `${base}.s.5.p3`)}</p>
          <p className="mt-3">{translations(lang, `${base}.s.5.p4`)}</p>
          <p className="mt-3">{translations(lang, `${base}.s.5.p5`)}</p>
          <p className="mt-3">{translations(lang, `${base}.s.5.p6`)}</p>
          <ul className="mt-2 list-disc list-inside space-y-1">
            <li>{translations(lang, `${base}.s.5.bullets.1`)}</li>
            <li>{translations(lang, `${base}.s.5.bullets.2`)}</li>
            <li>{translations(lang, `${base}.s.5.bullets.3`)}</li>
            <li>{translations(lang, `${base}.s.5.bullets.4`)}</li>
          </ul>
          <p className="mt-3">{translations(lang, `${base}.s.5.p7`)}</p>

          {/* 6 */}
          <h2 className="text-xl font-semibold text-white mt-8">
            {translations(lang, `${base}.s.6.title`)}
          </h2>
          <p>{translations(lang, `${base}.s.6.p1`)}</p>
          <ul className="mt-2 list-disc list-inside space-y-1">
            <li>{translations(lang, `${base}.s.6.bulletsA.1`)}</li>
            <li>{translations(lang, `${base}.s.6.bulletsA.2`)}</li>
            <li>{translations(lang, `${base}.s.6.bulletsA.3`)}</li>
          </ul>
          <p className="mt-3">{translations(lang, `${base}.s.6.p2`)}</p>
          <ul className="mt-2 list-disc list-inside space-y-1">
            <li>{translations(lang, `${base}.s.6.bulletsB.1`)}</li>
            <li>{translations(lang, `${base}.s.6.bulletsB.2`)}</li>
            <li>{translations(lang, `${base}.s.6.bulletsB.3`)}</li>
            <li>{translations(lang, `${base}.s.6.bulletsB.4`)}</li>
          </ul>
          <p className="mt-3">{translations(lang, `${base}.s.6.p3`)}</p>
          <p className="mt-3">
            <span className="font-semibold text-slate-100">
              {translations(lang, `${base}.s.6.p4.strong`)}
            </span>
          </p>

          {/* 7 */}
          <h2 className="text-xl font-semibold text-white mt-8">
            {translations(lang, `${base}.s.7.title`)}
          </h2>
          <p>{translations(lang, `${base}.s.7.p1`)}</p>
          <p className="mt-2 italic text-slate-400">
            {translations(lang, `${base}.s.7.quote`)}
          </p>
          <p className="mt-3">{translations(lang, `${base}.s.7.p2`)}</p>
          <p className="mt-3">{translations(lang, `${base}.s.7.p3`)}</p>
          <p className="mt-3">{translations(lang, `${base}.s.7.p4`)}</p>
          <p className="mt-3">{translations(lang, `${base}.s.7.p5`)}</p>
          <p className="mt-3">{translations(lang, `${base}.s.7.p6.a`)}</p>
          <p className="mt-3">
            {translations(lang, `${base}.s.7.p7.a`)}{" "}
            <span className="font-semibold text-slate-100">
              {translations(lang, `${base}.s.7.p7.bStrong`)}
            </span>
          </p>

          {/* What moves NPS */}
          <h2 className="text-xl font-semibold text-white mt-10">
            {translations(lang, `${base}.moves.title`)}
          </h2>
          <ul className="mt-3 list-disc list-inside space-y-2">
            <li>{translations(lang, `${base}.moves.bullets.1`)}</li>
            <li>{translations(lang, `${base}.moves.bullets.2`)}</li>
            <li>{translations(lang, `${base}.moves.bullets.3`)}</li>
            <li>{translations(lang, `${base}.moves.bullets.4`)}</li>
            <li>{translations(lang, `${base}.moves.bullets.5`)}</li>
            <li>{translations(lang, `${base}.moves.bullets.6`)}</li>
            <li>{translations(lang, `${base}.moves.bullets.7`)}</li>
          </ul>

          {/* Simple test */}
          <h2 className="text-xl font-semibold text-white mt-10">
            {translations(lang, `${base}.test.title`)}
          </h2>
          <p className="mt-3">
            {translations(lang, `${base}.test.p1.a`)}{" "}
            <span className="italic">{translations(lang, `${base}.test.p1.bItalic`)}</span>{" "}
            {translations(lang, `${base}.test.p1.c`)}
          </p>
          <p>
            {translations(lang, `${base}.test.p2.a`)}{" "}
            <span className="italic">{translations(lang, `${base}.test.p2.bItalic`)}</span>{" "}
            {translations(lang, `${base}.test.p2.c`)}
          </p>
          <p className="mt-3">{translations(lang, `${base}.test.p3`)}</p>
          <p>{translations(lang, `${base}.test.p4`)}</p>
          <p className="mt-3">{translations(lang, `${base}.test.p5`)}</p>
          <p>{translations(lang, `${base}.test.p6`)}</p>
        </div>

        {/* CTA footer */}
        <div className="mt-12 pt-6 border-t border-white/10 text-center">
          <p className="text-slate-400 text-sm">
            {translations(lang, `${base}.cta.lead`)}
          </p>
          <div className="mt-4 flex flex-col sm:flex-row justify-center gap-3">
            <Link
              to="/products"
              className="rounded-2xl px-6 py-3 text-sm font-semibold bg-[#7C3AED] hover:bg-[#6D28D9] transition"
            >
              {translations(lang, `${base}.cta.primary`)}
            </Link>
            <Link
              to="/book"
              className="rounded-2xl px-6 py-3 text-sm font-semibold bg-[#22C55E] text-[#0B0F19] hover:bg-[#16A34A] transition"
            >
              {translations(lang, `${base}.cta.secondary`)}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
