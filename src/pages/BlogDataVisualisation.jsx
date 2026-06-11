// src/pages/BlogCxDataVisualisation.jsx
import React from "react";
import Seo from "../components/Seo";
import PageHeader from "../components/PageHeader";
import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext";
import { translations } from "../i18n/translations";

export default function BlogCxDataVisualisation() {
  const { lang } = useLanguage();
  const tr = (p, f) => translations(lang, p, f);
  const location = useLocation();

  const BASE = "blogCxDataViz";
  const DATE_PUBLISHED = "2025-12-08";
  const DATE_MODIFIED = "2025-12-08";

  const title = translations(lang, "blogCxDataViz.seo.baseTitle");
  const description = translations(lang, "blogCxDataViz.seo.description");

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B0F19] via-[#0C1224] to-[#0B0F19] text-slate-200">
      <Seo
        path={location.pathname}
        lang={lang}
        title={translations(lang, "blogCxDataViz.seo.title")}
        description={translations(lang, "blogCxDataViz.seo.description")}
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

      {/* Header */}
      <PageHeader
        iconLabel={translations(lang, "blogCxDataViz.header.iconLabel")}
        tag={translations(lang, "blogCxDataViz.header.tag")}
        accent={translations(lang, "blogCxDataViz.header.accent")}
        title={translations(lang, "blogCxDataViz.header.title")}
        subtitle={translations(lang, "blogCxDataViz.header.subtitle")}
      />

      {/* Content */}
      <main className="mx-auto max-w-4xl px-6 py-10 md:py-14 space-y-10 md:space-y-12">
        {/* Intro */}
        <section className="space-y-4 text-sm sm:text-base leading-relaxed">
          <p>{translations(lang, "blogCxDataViz.intro.p1")}</p>
          <p>{translations(lang, "blogCxDataViz.intro.p2")}</p>
          <p>{translations(lang, "blogCxDataViz.intro.p3")}</p>
          <p>{translations(lang, "blogCxDataViz.intro.p4")}</p>
        </section>

        {/* 1. Dashboards aren't the destination */}
        <ArticleSection
          number="1"
          title={translations(lang, "blogCxDataViz.sections.1.title")}
        >
          <p>{translations(lang, "blogCxDataViz.sections.1.p1")}</p>

          <ul className="mt-3 space-y-1.5 text-sm sm:text-base">
            <li>{translations(lang, "blogCxDataViz.sections.1.bullets.1")}</li>
            <li>{translations(lang, "blogCxDataViz.sections.1.bullets.2")}</li>
            <li>{translations(lang, "blogCxDataViz.sections.1.bullets.3")}</li>
            <li>{translations(lang, "blogCxDataViz.sections.1.bullets.4")}</li>
          </ul>

          <p className="mt-4">
            {translations(lang, "blogCxDataViz.sections.1.p2a")}{" "}
            <span className="font-semibold text-slate-100">
              {translations(lang, "blogCxDataViz.sections.1.p2b")}
            </span>
          </p>
        </ArticleSection>

        {/* 2. Three layers of visual insight */}
        <ArticleSection
          number="2"
          title={translations(lang, "blogCxDataViz.sections.2.title")}
        >
          <KeyLabel>{translations(lang, "blogCxDataViz.sections.2.layer1.label")}</KeyLabel>
          <p className="mt-2">{translations(lang, "blogCxDataViz.sections.2.layer1.p1")}</p>
          <ul className="mt-2 space-y-1.5">
            <li>{translations(lang, "blogCxDataViz.sections.2.layer1.bullets.1")}</li>
            <li>{translations(lang, "blogCxDataViz.sections.2.layer1.bullets.2")}</li>
            <li>{translations(lang, "blogCxDataViz.sections.2.layer1.bullets.3")}</li>
            <li>{translations(lang, "blogCxDataViz.sections.2.layer1.bullets.4")}</li>
          </ul>
          <p className="mt-2">
            {translations(lang, "blogCxDataViz.sections.2.layer1.p2a")}{" "}
            <em>{translations(lang, "blogCxDataViz.sections.2.layer1.p2b")}</em>{" "}
            {translations(lang, "blogCxDataViz.sections.2.layer1.p2c")}{" "}
            <em>{translations(lang, "blogCxDataViz.sections.2.layer1.p2d")}</em>
          </p>

          <KeyLabel className="mt-5">
            {translations(lang, "blogCxDataViz.sections.2.layer2.label")}
          </KeyLabel>
          <p className="mt-2">{translations(lang, "blogCxDataViz.sections.2.layer2.p1")}</p>
          <ul className="mt-2 space-y-1.5">
            <li>{translations(lang, "blogCxDataViz.sections.2.layer2.bullets.1")}</li>
            <li>{translations(lang, "blogCxDataViz.sections.2.layer2.bullets.2")}</li>
            <li>{translations(lang, "blogCxDataViz.sections.2.layer2.bullets.3")}</li>
            <li>{translations(lang, "blogCxDataViz.sections.2.layer2.bullets.4")}</li>
          </ul>
          <p className="mt-2">
            {translations(lang, "blogCxDataViz.sections.2.layer2.p2a")}{" "}
            <em>{translations(lang, "blogCxDataViz.sections.2.layer2.p2b")}</em>
          </p>

          <KeyLabel className="mt-5">
            {translations(lang, "blogCxDataViz.sections.2.layer3.label")}
          </KeyLabel>
          <p className="mt-2">{translations(lang, "blogCxDataViz.sections.2.layer3.p1")}</p>
          <ul className="mt-2 space-y-1.5">
            <li>{translations(lang, "blogCxDataViz.sections.2.layer3.bullets.1")}</li>
            <li>{translations(lang, "blogCxDataViz.sections.2.layer3.bullets.2")}</li>
            <li>{translations(lang, "blogCxDataViz.sections.2.layer3.bullets.3")}</li>
          </ul>
          <p className="mt-2">{translations(lang, "blogCxDataViz.sections.2.layer3.p2")}</p>
        </ArticleSection>

        {/* 3. Visuals that consistently deliver insight */}
        <ArticleSection
          number="3"
          title={translations(lang, "blogCxDataViz.sections.3.title")}
        >
          <h3 className="font-semibold text-slate-100 mt-1">
            {translations(lang, "blogCxDataViz.sections.3.items.1.title")}
          </h3>
          <p className="mt-2">{translations(lang, "blogCxDataViz.sections.3.items.1.p1")}</p>
          <p className="mt-2">{translations(lang, "blogCxDataViz.sections.3.items.1.p2")}</p>

          <h3 className="font-semibold text-slate-100 mt-4">
            {translations(lang, "blogCxDataViz.sections.3.items.2.title")}
          </h3>
          <p className="mt-2">{translations(lang, "blogCxDataViz.sections.3.items.2.p1")}</p>
          <p className="mt-2">{translations(lang, "blogCxDataViz.sections.3.items.2.p2")}</p>

          <h3 className="font-semibold text-slate-100 mt-4">
            {translations(lang, "blogCxDataViz.sections.3.items.3.title")}
          </h3>
          <p className="mt-2">{translations(lang, "blogCxDataViz.sections.3.items.3.p1")}</p>
          <p className="mt-2">{translations(lang, "blogCxDataViz.sections.3.items.3.p2")}</p>

          <h3 className="font-semibold text-slate-100 mt-4">
            {translations(lang, "blogCxDataViz.sections.3.items.4.title")}
          </h3>
          <p className="mt-2">{translations(lang, "blogCxDataViz.sections.3.items.4.p1")}</p>
          <p className="mt-2">{translations(lang, "blogCxDataViz.sections.3.items.4.p2")}</p>

          <h3 className="font-semibold text-slate-100 mt-4">
            {translations(lang, "blogCxDataViz.sections.3.items.5.title")}
          </h3>
          <p className="mt-2">{translations(lang, "blogCxDataViz.sections.3.items.5.p1")}</p>
        </ArticleSection>

        {/* 4. Common mistakes */}
        <ArticleSection
          number="4"
          title={translations(lang, "blogCxDataViz.sections.4.title")}
        >
          <ul className="mt-2 space-y-1.5">
            <li>{translations(lang, "blogCxDataViz.sections.4.bullets.1")}</li>
            <li>{translations(lang, "blogCxDataViz.sections.4.bullets.2")}</li>
            <li>{translations(lang, "blogCxDataViz.sections.4.bullets.3")}</li>
            <li>{translations(lang, "blogCxDataViz.sections.4.bullets.4")}</li>
            <li>{translations(lang, "blogCxDataViz.sections.4.bullets.5")}</li>
          </ul>

          <p className="mt-4">{translations(lang, "blogCxDataViz.sections.4.p1")}</p>
        </ArticleSection>

        {/* 5. Workflow */}
        <ArticleSection
          number="5"
          title={translations(lang, "blogCxDataViz.sections.5.title")}
        >
          <h3 className="font-semibold text-slate-100 mt-1">
            {translations(lang, "blogCxDataViz.sections.5.steps.1.title")}
          </h3>
          <p className="mt-2">{translations(lang, "blogCxDataViz.sections.5.steps.1.p1")}</p>
          <ul className="mt-2 space-y-1.5">
            <li>{translations(lang, "blogCxDataViz.sections.5.steps.1.bullets.1")}</li>
            <li>{translations(lang, "blogCxDataViz.sections.5.steps.1.bullets.2")}</li>
          </ul>

          <h3 className="font-semibold text-slate-100 mt-4">
            {translations(lang, "blogCxDataViz.sections.5.steps.2.title")}
          </h3>
          <p className="mt-2">{translations(lang, "blogCxDataViz.sections.5.steps.2.p1")}</p>

          <h3 className="font-semibold text-slate-100 mt-4">
            {translations(lang, "blogCxDataViz.sections.5.steps.3.title")}
          </h3>
          <p className="mt-2">{translations(lang, "blogCxDataViz.sections.5.steps.3.p1")}</p>

          <h3 className="font-semibold text-slate-100 mt-4">
            {translations(lang, "blogCxDataViz.sections.5.steps.4.title")}
          </h3>
          <p className="mt-2">
            {translations(lang, "blogCxDataViz.sections.5.steps.4.p1a")}{" "}
            <em>{translations(lang, "blogCxDataViz.sections.5.steps.4.p1b")}</em>
          </p>
          <p className="mt-2">{translations(lang, "blogCxDataViz.sections.5.steps.4.p2")}</p>
        </ArticleSection>

        {/* 6. Quick wins */}
        <ArticleSection
          number="6"
          title={translations(lang, "blogCxDataViz.sections.6.title")}
        >
          <ul className="mt-2 space-y-1.5">
            <li>{translations(lang, "blogCxDataViz.sections.6.bullets.1")}</li>
            <li>{translations(lang, "blogCxDataViz.sections.6.bullets.2")}</li>
            <li>{translations(lang, "blogCxDataViz.sections.6.bullets.3")}</li>
            <li>{translations(lang, "blogCxDataViz.sections.6.bullets.4")}</li>
          </ul>

          <p className="mt-4">{translations(lang, "blogCxDataViz.sections.6.p1")}</p>
        </ArticleSection>

        {/* Closing / CTA */}
        <section className="rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6 md:p-7 space-y-4">
          <h2 className="text-lg sm:text-xl font-semibold text-white">
            {translations(lang, "blogCxDataViz.closing.title")}
          </h2>
          <p className="text-sm sm:text-base">
            {translations(lang, "blogCxDataViz.closing.p1a")} <strong>NPS Me</strong>{" "}
            {translations(lang, "blogCxDataViz.closing.p1b")}
          </p>

          <ul className="mt-2 space-y-1.5 text-sm sm:text-base">
            <li>{translations(lang, "blogCxDataViz.closing.bullets.1")}</li>
            <li>{translations(lang, "blogCxDataViz.closing.bullets.2")}</li>
            <li>{translations(lang, "blogCxDataViz.closing.bullets.3")}</li>
          </ul>

          <p className="mt-3 text-sm sm:text-base">
            <a
              href="/book"
              className="inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-sm font-semibold bg-[#22C55E] text-[#0B0F19] hover:bg-[#16A34A]"
            >
              {translations(lang, "blogCxDataViz.closing.ctaBtn")}
            </a>{" "}
            {translations(lang, "blogCxDataViz.closing.p2")}
          </p>
        </section>
      </main>
    </div>
  );
}

/* --- Small layout helpers (same pattern as Christmas blog style) --- */

function ArticleSection({ number, title, children }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-black/30 p-5 sm:p-6 md:p-7">
      <div className="flex items-baseline gap-2 mb-3">
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[#7C3AED] to-[#22C55E] text-[11px] font-semibold text-white">
          {number}
        </span>
        <h2 className="text-base sm:text-lg md:text-xl font-semibold text-white">
          {title}
        </h2>
      </div>
      <div className="mt-1 space-y-3 text-sm sm:text-base leading-relaxed text-slate-200">
        {children}
      </div>
    </section>
  );
}

function KeyLabel({ children, className = "" }) {
  return (
    <p
      className={[
        "inline-flex items-center gap-2 text-sm font-semibold text-slate-100",
        className,
      ].join(" ")}
    >
      <span className="h-1.5 w-4 rounded-full bg-gradient-to-r from-[#7C3AED] to-[#22C55E]" />
      <span>{children}</span>
    </p>
  );
}
