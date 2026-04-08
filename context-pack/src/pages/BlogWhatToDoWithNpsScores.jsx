// src/pages/BlogWhatToDoWithNpsScores.jsx
import React from "react";
import Seo from "../components/Seo";
import { Link, useLocation } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import { useLanguage } from "../i18n/LanguageContext";
import { translations } from "../i18n/translations";
import { localizePath } from "../i18n/pathHelpers";

function RelatedLinks({ title, children }) {
  return (
    <section className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
      <h2 className="text-xl md:text-2xl font-semibold text-white">{title}</h2>
      <div className="mt-3 space-y-3 text-slate-300">{children}</div>
    </section>
  );
}

export default function BlogWhatToDoWithNpsScores() {
  const { lang } = useLanguage();
  const tr = (p, f) => translations(lang, p, f);
  const location = useLocation();

  const BASE = "blogWhatToDoWithNpsScores";
  const DATE_PUBLISHED = "2025-11-12";
  const DATE_MODIFIED = "2025-11-12";

  const base = "blogWhatToDoWithNpsScores";

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B0F19] via-[#0C1224] to-[#0B0F19] text-slate-200">
      <Seo
        path={location.pathname}
        lang={lang}
        title={translations(lang, `${base}.seo.title`)}
        description={translations(lang, `${base}.seo.description`)}
        altPaths={{
          en: "/blog/what-to-do-with-nps-scores",
          fr: "/fr/blog/what-to-do-with-nps-scores",
        }}
      />

      {/* BlogPosting JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: tr(
              `${BASE}.h1`,
              tr(`${BASE}.header.title`, tr(`${BASE}.seo.title`, "Blog post"))
            ),
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

      <PageHeader
        iconLabel={translations(lang, `${base}.header.iconLabel`)}
        tag={translations(lang, `${base}.header.tag`)}
        accent={translations(lang, `${base}.header.accent`)}
        title={translations(lang, `${base}.header.title`)}
        subtitle={translations(lang, `${base}.header.subtitle`)}
      />

      <main className="mx-auto max-w-4xl px-6 py-10 md:py-14 space-y-10 md:space-y-12">
        {/* Intro */}
        <section className="mt-8 rounded-2xl border border-white/10 bg-black/30 p-5 md:p-6">
          <p className="text-sm md:text-base text-slate-200 leading-relaxed">
            {translations(lang, `${base}.intro`)}
          </p>

          <p className="mt-3 text-slate-300">
            {lang === "fr"
              ? "Si vous voulez une vision plus large de la façon dont les scores, verbatims et thèmes peuvent être reliés, commencez par la "
              : "If you want the bigger picture on how scores, verbatims, and recurring themes connect, start with the "}
            <Link
              to={localizePath("/nps-intelligence-layer", lang)}
              className="text-link"
            >
              {lang === "fr" ? "couche d’intelligence NPS" : "NPS intelligence layer"}
            </Link>
            {lang === "fr"
              ? ", puis revenez ici pour voir ce que cela change concrètement lorsqu’un score arrive."
              : ", then come back here to see what that means in practice once a score comes in."}
          </p>
        </section>

        {/* 1 - Present in three views */}
        <section className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5 md:p-6">
          <h2 className="flex items-center gap-3 text-lg md:text-xl font-semibold text-white">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#7C3AED] to-[#22C55E] text-[11px] font-bold">
              1
            </span>
            <span>{translations(lang, `${base}.sections.1.title`)}</span>
          </h2>

          <div className="mt-3 space-y-3 text-sm md:text-base text-slate-200 leading-relaxed">
            <ul className="list-disc list-inside space-y-2">
              <li>
                <strong>{translations(lang, `${base}.sections.1.bullets.1.strong`)}</strong>{" "}
                {translations(lang, `${base}.sections.1.bullets.1.text`)}
              </li>
              <li>
                <strong>{translations(lang, `${base}.sections.1.bullets.2.strong`)}</strong>{" "}
                {translations(lang, `${base}.sections.1.bullets.2.text`)}
              </li>
              <li>
                <strong>{translations(lang, `${base}.sections.1.bullets.3.strong`)}</strong>{" "}
                {translations(lang, `${base}.sections.1.bullets.3.text`)}
              </li>
            </ul>

            <p className="text-xs md:text-sm text-slate-400">
              {translations(lang, `${base}.sections.1.tip`)}
            </p>
          </div>
        </section>

        {/* 2 - Sample size & stability */}
        <section className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5 md:p-6">
          <h2 className="flex items-center gap-3 text-lg md:text-xl font-semibold text-white">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#22C55E] to-[#7C3AED] text-[11px] font-bold">
              2
            </span>
            <span>{translations(lang, `${base}.sections.2.title`)}</span>
          </h2>

          <div className="mt-3 space-y-3 text-sm md:text-base text-slate-200 leading-relaxed">
            <p>{translations(lang, `${base}.sections.2.p1`)}</p>
            <ul className="list-disc list-inside space-y-2">
              <li>{translations(lang, `${base}.sections.2.bullets.1`)}</li>
              <li>{translations(lang, `${base}.sections.2.bullets.2`)}</li>
              <li>{translations(lang, `${base}.sections.2.bullets.3`)}</li>
            </ul>
          </div>
        </section>

        {/* 3 - Look beyond the score */}
        <section className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5 md:p-6">
          <h2 className="flex items-center gap-3 text-lg md:text-xl font-semibold text-white">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#7C3AED] to-[#22C55E] text-[11px] font-bold">
              3
            </span>
            <span>{translations(lang, `${base}.sections.3.title`)}</span>
          </h2>

          <div className="mt-3 space-y-3 text-sm md:text-base text-slate-200 leading-relaxed">
            <p>{translations(lang, `${base}.sections.3.p1`)}</p>
            <p>{translations(lang, `${base}.sections.3.p2`)}</p>

            <p className="mt-3 text-slate-300">
              {lang === "fr"
                ? "Pour voir un exemple concret de ce que cela donne lorsque l’analyse des commentaires est reliée à un workflow opérationnel, consultez "
                : "For a practical example of what this looks like when comment analysis is connected to an operational workflow, see "}
              <Link
                to={localizePath("/blog/intercom-nps-beyond-the-score", lang)}
                className="text-link"
              >
                {lang === "fr"
                  ? "notre article sur le NPS dans une plateforme de messagerie client"
                  : "our article on running NPS inside a customer messaging platform"}
              </Link>
              .
            </p>
          </div>
        </section>

        {/* 4 - Repeat responders */}
        <section className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5 md:p-6">
          <h2 className="flex items-center gap-3 text-lg md:text-xl font-semibold text-white">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#22C55E] to-[#7C3AED] text-[11px] font-bold">
              4
            </span>
            <span>{translations(lang, `${base}.sections.4.title`)}</span>
          </h2>

          <div className="mt-3 space-y-3 text-sm md:text-base text-slate-200 leading-relaxed">
            <p>{translations(lang, `${base}.sections.4.p1`)}</p>
            <ul className="list-disc list-inside space-y-2">
              <li>{translations(lang, `${base}.sections.4.bullets.1`)}</li>
              <li>{translations(lang, `${base}.sections.4.bullets.2`)}</li>
              <li>{translations(lang, `${base}.sections.4.bullets.3`)}</li>
            </ul>
          </div>
        </section>

        {/* 5 - Where to focus */}
        <section className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5 md:p-6">
          <h2 className="flex items-center gap-3 text-lg md:text-xl font-semibold text-white">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#7C3AED] to-[#22C55E] text-[11px] font-bold">
              5
            </span>
            <span>{translations(lang, `${base}.sections.5.title`)}</span>
          </h2>

          <div className="mt-3 space-y-3 text-sm md:text-base text-slate-200 leading-relaxed">
            <p>
              {translations(lang, `${base}.sections.5.p1a`)}
              <strong>{translations(lang, `${base}.sections.5.p1strong`)}</strong>
              {translations(lang, `${base}.sections.5.p1b`)}
            </p>

            <ul className="list-disc list-inside space-y-2">
              <li>
                <strong>{translations(lang, `${base}.sections.5.bullets.1.strong`)}</strong>{" "}
                {translations(lang, `${base}.sections.5.bullets.1.text`)}
              </li>
              <li>
                <strong>{translations(lang, `${base}.sections.5.bullets.2.strong`)}</strong>{" "}
                {translations(lang, `${base}.sections.5.bullets.2.text`)}
              </li>
              <li>
                <strong>{translations(lang, `${base}.sections.5.bullets.3.strong`)}</strong>{" "}
                {translations(lang, `${base}.sections.5.bullets.3.text`)}
              </li>
            </ul>
          </div>
        </section>

        {/* 6 - Cuts that lead to action */}
        <section className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5 md:p-6">
          <h2 className="flex items-center gap-3 text-lg md:text-xl font-semibold text-white">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#22C55E] to-[#7C3AED] text-[11px] font-bold">
              6
            </span>
            <span>{translations(lang, `${base}.sections.6.title`)}</span>
          </h2>

          <div className="mt-3 space-y-3 text-sm md:text-base text-slate-200 leading-relaxed">
            <ul className="list-disc list-inside space-y-2">
              <li>
                <strong>{translations(lang, `${base}.sections.6.bullets.1.strong`)}</strong>{" "}
                {translations(lang, `${base}.sections.6.bullets.1.text`)}
              </li>
              <li>
                <strong>{translations(lang, `${base}.sections.6.bullets.2.strong`)}</strong>{" "}
                {translations(lang, `${base}.sections.6.bullets.2.text`)}
              </li>
              <li>
                <strong>{translations(lang, `${base}.sections.6.bullets.3.strong`)}</strong>{" "}
                {translations(lang, `${base}.sections.6.bullets.3.text`)}
              </li>
              <li>
                <strong>{translations(lang, `${base}.sections.6.bullets.4.strong`)}</strong>{" "}
                {translations(lang, `${base}.sections.6.bullets.4.text`)}
              </li>
            </ul>

            <p className="text-xs md:text-sm text-slate-400">
              {translations(lang, `${base}.sections.6.tip`)}
            </p>

            <p className="mt-3 text-slate-300">
              {lang === "fr"
                ? "Si votre enjeu consiste surtout à structurer les données, les verbatims et les signaux pour guider l’action, la "
                : "If your main challenge is turning data, verbatims, and signals into prioritised action, the "}
              <Link
                to={localizePath("/nps-intelligence-layer", lang)}
                className="text-link"
              >
                {lang === "fr" ? "couche d’intelligence NPS" : "NPS intelligence layer"}
              </Link>
              {lang === "fr"
                ? " donne une vue plus large du cadre analytique."
                : " gives a broader view of the analytical framework."}
            </p>
          </div>
        </section>

        {/* 7 - Close the loop */}
        <section className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5 md:p-6">
          <h2 className="flex items-center gap-3 text-lg md:text-xl font-semibold text-white">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#7C3AED] to-[#22C55E] text-[11px] font-bold">
              7
            </span>
            <span>{translations(lang, `${base}.sections.7.title`)}</span>
          </h2>

          <div className="mt-3 space-y-3 text-sm md:text-base text-slate-200 leading-relaxed">
            <p>{translations(lang, `${base}.sections.7.p1`)}</p>

            <p className="mt-3 text-slate-300">
              {lang === "fr"
                ? "Sur ce point, vous pouvez aussi lire "
                : "On that point, you can also read "}
              <Link
                to={localizePath("/blog/closing-the-loop", lang)}
                className="text-link"
              >
                {lang === "fr" ? "Boucler la boucle" : "Closing the loop"}
              </Link>
              {lang === "fr"
                ? ", qui développe plus en détail la logique de suivi et de réponse."
                : ", which explores follow-up and response workflows in more detail."}
            </p>
          </div>
        </section>

        {/* Bottom line */}
        <section className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5 md:p-6">
          <h2 className="flex items-center gap-3 text-lg md:text-xl font-semibold text-white">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#22C55E] to-[#7C3AED] text-[11px] font-bold">
              8
            </span>
            <span>{translations(lang, `${base}.sections.8.title`)}</span>
          </h2>

          <p className="mt-3 text-sm md:text-base text-slate-200 leading-relaxed">
            {translations(lang, `${base}.sections.8.p1`)}
          </p>
        </section>

        {/* Related reading */}
        <RelatedLinks title={lang === "fr" ? "À lire aussi" : "Related reading"}>
          <p className="text-slate-300">
            {lang === "fr"
              ? "Pour voir ce qu’un score NPS peut déclencher lorsqu’il est intégré à un workflow opérationnel, consultez "
              : "To see what an NPS score can trigger once it is built into an operational workflow, see "}
            <Link
              to={localizePath("/blog/intercom-nps-beyond-the-score", lang)}
              className="text-link"
            >
              {lang === "fr"
                ? "notre article sur le NPS dans une plateforme de messagerie client"
                : "our article on running NPS inside a customer messaging platform"}
            </Link>
            .
          </p>

          <p className="text-slate-300">
            {lang === "fr"
              ? "Si vos scores stagnent et que vous cherchez à comprendre pourquoi, l’article "
              : "If your scores are not moving and you want to understand why, the article "}
            <Link
              to={localizePath("/blog/why-nps-isnt-improving", lang)}
              className="text-link"
            >
              {lang === "fr"
                ? "Pourquoi le NPS ne progresse pas"
                : "Why NPS isn’t improving"}
            </Link>
            {lang === "fr"
              ? " complète bien cette lecture."
              : " is a useful companion read."}
          </p>

          <p className="text-slate-300">
            {lang === "fr"
              ? "Pour une vue plus complète de la manière dont les scores, commentaires et thèmes peuvent être reliés, consultez la "
              : "For a broader view of how scores, comments, and themes can be linked together, explore the "}
            <Link
              to={localizePath("/nps-intelligence-layer", lang)}
              className="text-link"
            >
              {lang === "fr" ? "couche d’intelligence NPS" : "NPS intelligence layer"}
            </Link>
            .
          </p>

          <p className="text-slate-300">
            {lang === "fr"
              ? "Si vous souhaitez discuter de votre propre programme NPS, vous pouvez aussi "
              : "If you want to discuss your own NPS programme, you can also "}
            <Link
              to={localizePath("/book", lang)}
              className="text-link"
            >
              {lang === "fr" ? "réserver un échange" : "book a conversation"}
            </Link>
            .
          </p>
        </RelatedLinks>

        {/* CTA footer */}
        <footer className="mt-12">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#141B2E] via-[#0B1120] to-[#0B0F19] p-6 md:p-8 text-center">
            <p className="text-sm md:text-base text-slate-200">
              {translations(lang, `${base}.cta.title`)}
            </p>
            <p className="mt-2 text-xs md:text-sm text-slate-400 max-w-2xl mx-auto">
              {translations(lang, `${base}.cta.subtitle`)}
            </p>

            <div className="mt-5 flex flex-col sm:flex-row justify-center gap-3">
              <Link
                to={localizePath("/products", lang)}
                className="rounded-2xl px-6 py-2.5 text-sm font-semibold bg-[#7C3AED] hover:bg-[#6D28D9] transition"
              >
                {translations(lang, `${base}.cta.primary`)}
              </Link>
              <Link
                to={localizePath("/book", lang)}
                className="rounded-2xl px-6 py-2.5 text-sm font-semibold bg-[#22C55E] text-[#020617] hover:bg-[#16A34A] transition"
              >
                {translations(lang, `${base}.cta.secondary`)}
              </Link>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
