// src/pages/BlogIntercomNpsBeyondTheScore.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import Seo from "../components/Seo";
import PageHeader from "../components/PageHeader";
import { useLanguage } from "../i18n/LanguageContext";
import { translations } from "../i18n/translations";
import { localizePath } from "../i18n/pathHelpers";

function ArticleSection({ title, children }) {
  return (
    <section className="mt-10">
      <h2 className="text-xl md:text-2xl font-semibold text-white">{title}</h2>
      <div className="mt-3 text-slate-300 leading-relaxed space-y-4">{children}</div>
    </section>
  );
}

function Callout({ title, children }) {
  return (
    <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
      <div className="text-sm font-semibold text-white">{title}</div>
      <div className="mt-3 text-sm text-slate-300 leading-relaxed">{children}</div>
    </div>
  );
}

export default function BlogIntercomNpsBeyondTheScore() {
  const { lang } = useLanguage();
  const tr = (p, f) => translations(lang, p, f);
  const location = useLocation();
  const BASE = "blogIntercomNps";
  const DATE_PUBLISHED = "2026-03-05";
  const DATE_MODIFIED = "2026-03-05";

  const bullets = tr("blogIntercomNps.sections.problem.bullets", []);
  const outcomes = tr("blogIntercomNps.sections.outcomes.bullets", []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B0F19] via-[#0C1224] to-[#0B0F19] text-slate-200">
      <Seo
        path={location.pathname}
        lang={lang}
        title={tr("blogIntercomNps.seo.title")}
        description={tr("blogIntercomNps.seo.description")}
        altPaths={{
          en: "/blog/intercom-nps-beyond-the-score",
          fr: "/fr/blog/intercom-nps-au-dela-du-score",
        }}
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

      <PageHeader iconLabel="Blog" tag={tr("blogIntercomNps.header.tag")}>
        <div className="pt-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl leading-tight font-semibold tracking-tight text-white">
            {tr("blogIntercomNps.h1")}
          </h1>

          <p className="mt-5 text-slate-300 max-w-3xl">
            {tr("blogIntercomNps.intro")}
          </p>

          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <Link
              to={localizePath("/intercom-nps-analytics", lang)}
              className="inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold bg-[#22C55E] text-[#0B0F19] hover:bg-[#16A34A] transition"
            >
              {tr("blogIntercomNps.ctaPrimary")}
            </Link>

            <Link
              to={localizePath("/book", lang)}
              className="inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold bg-white/10 hover:bg-white/15 border border-white/10 transition text-white"
            >
              {tr("blogIntercomNps.ctaSecondary")}
            </Link>
          </div>
        </div>
      </PageHeader>

      <article className="mx-auto max-w-3xl px-6 pb-20">
        <ArticleSection title={tr("blogIntercomNps.sections.context.title")}>
          <p>{tr("blogIntercomNps.sections.context.p1")}</p>
          <p>{tr("blogIntercomNps.sections.context.p2")}</p>
        </ArticleSection>

        <ArticleSection title={tr("blogIntercomNps.sections.problem.title")}>
          <p>{tr("blogIntercomNps.sections.problem.p1")}</p>

          {Array.isArray(bullets) && bullets.length > 0 ? (
            <ul className="mt-4 space-y-2 list-disc pl-5 text-slate-300">
              {bullets.map((b) => (
                <li key={String(b)}>{b}</li>
              ))}
            </ul>
          ) : null}

          <p className="mt-4">{tr("blogIntercomNps.sections.problem.p2")}</p>
        </ArticleSection>

        <Callout title={tr("blogIntercomNps.callouts.insight.title")}>
          {tr("blogIntercomNps.callouts.insight.body")}
        </Callout>

        <ArticleSection title={tr("blogIntercomNps.sections.approach.title")}>
          <p>{tr("blogIntercomNps.sections.approach.p1")}</p>
          <p>{tr("blogIntercomNps.sections.approach.p2")}</p>
        </ArticleSection>

        <ArticleSection title={tr("blogIntercomNps.sections.implementation.title")}>
          <p>{tr("blogIntercomNps.sections.implementation.p1")}</p>
          <p>{tr("blogIntercomNps.sections.implementation.p2")}</p>
          <p>{tr("blogIntercomNps.sections.implementation.p3")}</p>
          <p>{tr("blogIntercomNps.sections.implementation.p4")}</p>
        </ArticleSection>

        <ArticleSection title={tr("blogIntercomNps.sections.iteration.title")}>
          <p>{tr("blogIntercomNps.sections.iteration.p1")}</p>
          <p>{tr("blogIntercomNps.sections.iteration.p2")}</p>
          <p>{tr("blogIntercomNps.sections.iteration.p3")}</p>
          <p>{tr("blogIntercomNps.sections.iteration.p4")}</p>
        </ArticleSection>

        <ArticleSection title={tr("blogIntercomNps.sections.cxImpact.title")}>
          <p>{tr("blogIntercomNps.sections.cxImpact.p1")}</p>
          <p>{tr("blogIntercomNps.sections.cxImpact.p2")}</p>
          <p>{tr("blogIntercomNps.sections.cxImpact.p3")}</p>
          <p>{tr("blogIntercomNps.sections.cxImpact.p4")}</p>
        </ArticleSection>

        <ArticleSection title={tr("blogIntercomNps.sections.data.title")}>
          <p>{tr("blogIntercomNps.sections.data.p1")}</p>
          <p>{tr("blogIntercomNps.sections.data.p2")}</p>
        </ArticleSection>

        <Callout title={tr("blogIntercomNps.callouts.privacy.title")}>
          {tr("blogIntercomNps.callouts.privacy.body")}
        </Callout>

        <ArticleSection title={tr("blogIntercomNps.sections.outcomes.title")}>
          <p>{tr("blogIntercomNps.sections.outcomes.p1")}</p>

          {Array.isArray(outcomes) && outcomes.length > 0 ? (
            <ul className="mt-4 space-y-2 list-disc pl-5 text-slate-300">
              {outcomes.map((b) => (
                <li key={String(b)}>{b}</li>
              ))}
            </ul>
          ) : null}

          <p className="mt-4">{tr("blogIntercomNps.sections.outcomes.p2")}</p>
        </ArticleSection>

        <Callout title={tr("blogIntercomNps.callouts.next.title")}>
          <div className="space-y-4">
            <p>{tr("blogIntercomNps.callouts.next.body")}</p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to={localizePath("/intercom-nps-analytics", lang)}
                className="inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold bg-[#7C3AED] hover:bg-[#6D28D9] transition text-white"
              >
                {tr("blogIntercomNps.callouts.next.button1")}
              </Link>

              <Link
                to={localizePath("/book", lang)}
                className="inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold bg-white/10 hover:bg-white/15 border border-white/10 transition text-white"
              >
                {tr("blogIntercomNps.callouts.next.button2")}
              </Link>
            </div>
          </div>
        </Callout>
      </article>
    </div>
  );
}
