// src/pages/BlogSendingNpsBeforeChristmas.jsx
import React from "react";
import { Link } from "react-router-dom";
import Seo from "../components/Seo";
import PageHeader from "../components/PageHeader";
import { useLanguage } from "../i18n/LanguageContext";
import { translations } from "../i18n/translations";

export default function BlogSendingNpsBeforeChristmas() {
  const { lang } = useLanguage();

  const seoTitle = translations(lang, "blogSendingNpsBeforeChristmas.seo.title");
  const seoDescription = translations(
    lang,
    "blogSendingNpsBeforeChristmas.seo.description"
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B0F19] via-[#0C1224] to-[#0B0F19] text-slate-200">
      <Seo
        path="/blog/sending-nps-before-christmas"
        title={seoTitle}
        description={seoDescription}
      />

      {/* Header */}
      <PageHeader
        iconLabel={translations(lang, "blogSendingNpsBeforeChristmas.header.iconLabel")}
        tag={translations(lang, "blogSendingNpsBeforeChristmas.header.tag")}
        accent={translations(lang, "blogSendingNpsBeforeChristmas.header.accent")}
        title={translations(lang, "blogSendingNpsBeforeChristmas.header.title")}
        subtitle={translations(lang, "blogSendingNpsBeforeChristmas.header.subtitle")}
      />

      {/* Content */}
      <main className="mx-auto max-w-4xl px-6 py-10 md:py-14 space-y-10 md:space-y-12">
        {/* Intro */}
        <section className="space-y-4 text-sm sm:text-base leading-relaxed">
          <p>
            {translations(lang, "blogSendingNpsBeforeChristmas.intro.p1a")}{" "}
            <span className="text-[#22C55E] font-medium">
              {translations(lang, "blogSendingNpsBeforeChristmas.intro.p1b")}
            </span>{" "}
            {translations(lang, "blogSendingNpsBeforeChristmas.intro.p1c")}
          </p>

          <p>{translations(lang, "blogSendingNpsBeforeChristmas.intro.p2")}</p>
          <p>{translations(lang, "blogSendingNpsBeforeChristmas.intro.p3")}</p>

          <p className="font-medium text-slate-100">
            {translations(lang, "blogSendingNpsBeforeChristmas.intro.p4")}
          </p>
        </section>

        <ArticleSection
          number="1"
          title={translations(lang, "blogSendingNpsBeforeChristmas.sections.1.title")}
        >
          <p>{translations(lang, "blogSendingNpsBeforeChristmas.sections.1.p1")}</p>
          <p>{translations(lang, "blogSendingNpsBeforeChristmas.sections.1.p2")}</p>
          <p>{translations(lang, "blogSendingNpsBeforeChristmas.sections.1.p3")}</p>

          <ul className="mt-3 space-y-1.5 text-sm sm:text-base">
            <li>{translations(lang, "blogSendingNpsBeforeChristmas.sections.1.bullets.1")}</li>
            <li>{translations(lang, "blogSendingNpsBeforeChristmas.sections.1.bullets.2")}</li>
            <li>{translations(lang, "blogSendingNpsBeforeChristmas.sections.1.bullets.3")}</li>
            <li>{translations(lang, "blogSendingNpsBeforeChristmas.sections.1.bullets.4")}</li>
          </ul>

          <p className="mt-4">
            {translations(lang, "blogSendingNpsBeforeChristmas.sections.1.p4a")}{" "}
            <span className="text-[#7C3AED] font-medium">
              {translations(lang, "blogSendingNpsBeforeChristmas.sections.1.p4b")}
            </span>
            {translations(lang, "blogSendingNpsBeforeChristmas.sections.1.p4c")}
          </p>
        </ArticleSection>

        <ArticleSection
          number="2"
          title={translations(lang, "blogSendingNpsBeforeChristmas.sections.2.title")}
        >
          <p>{translations(lang, "blogSendingNpsBeforeChristmas.sections.2.p1")}</p>

          <KeyLabel>✔ {translations(lang, "blogSendingNpsBeforeChristmas.sections.2.k1.label")}</KeyLabel>
          <p>{translations(lang, "blogSendingNpsBeforeChristmas.sections.2.k1.p1")}</p>
          <ul className="mt-2 space-y-1.5">
            <li>{translations(lang, "blogSendingNpsBeforeChristmas.sections.2.k1.bullets.1")}</li>
            <li>{translations(lang, "blogSendingNpsBeforeChristmas.sections.2.k1.bullets.2")}</li>
            <li>{translations(lang, "blogSendingNpsBeforeChristmas.sections.2.k1.bullets.3")}</li>
            <li>{translations(lang, "blogSendingNpsBeforeChristmas.sections.2.k1.bullets.4")}</li>
          </ul>

          <KeyLabel className="mt-4">✔ {translations(lang, "blogSendingNpsBeforeChristmas.sections.2.k2.label")}</KeyLabel>
          <p>{translations(lang, "blogSendingNpsBeforeChristmas.sections.2.k2.p1")}</p>

          <KeyLabel className="mt-4">✔ {translations(lang, "blogSendingNpsBeforeChristmas.sections.2.k3.label")}</KeyLabel>
          <p>
            {translations(lang, "blogSendingNpsBeforeChristmas.sections.2.k3.p1")}
            <br />
            <span className="italic text-slate-100">
              {translations(lang, "blogSendingNpsBeforeChristmas.sections.2.k3.q")}
            </span>
            <br />
            {translations(lang, "blogSendingNpsBeforeChristmas.sections.2.k3.scale")}{" "}
            <span className="font-medium text-[#22C55E]">
              {translations(lang, "blogSendingNpsBeforeChristmas.sections.2.k3.range")}
            </span>
          </p>

          <KeyLabel className="mt-4">✔ {translations(lang, "blogSendingNpsBeforeChristmas.sections.2.k4.label")}</KeyLabel>
          <p>
            <span className="italic text-slate-100">
              {translations(lang, "blogSendingNpsBeforeChristmas.sections.2.k4.q")}
            </span>
          </p>

          <KeyLabel className="mt-4">✔ {translations(lang, "blogSendingNpsBeforeChristmas.sections.2.k5.label")}</KeyLabel>
          <p>
            {translations(lang, "blogSendingNpsBeforeChristmas.sections.2.k5.p1")}{" "}
            <span className="text-[#22C55E] font-medium">
              {translations(lang, "blogSendingNpsBeforeChristmas.sections.2.k5.p2")}
            </span>
          </p>

          <KeyLabel className="mt-4">✔ {translations(lang, "blogSendingNpsBeforeChristmas.sections.2.k6.label")}</KeyLabel>
          <p>{translations(lang, "blogSendingNpsBeforeChristmas.sections.2.k6.p1")}</p>
          <ul className="mt-2 space-y-1.5">
            <li>{translations(lang, "blogSendingNpsBeforeChristmas.sections.2.k6.bullets.1")}</li>
            <li>{translations(lang, "blogSendingNpsBeforeChristmas.sections.2.k6.bullets.2")}</li>
            <li>{translations(lang, "blogSendingNpsBeforeChristmas.sections.2.k6.bullets.3")}</li>
            <li>{translations(lang, "blogSendingNpsBeforeChristmas.sections.2.k6.bullets.4")}</li>
            <li>{translations(lang, "blogSendingNpsBeforeChristmas.sections.2.k6.bullets.5")}</li>
          </ul>

          <p className="mt-4">
            {translations(lang, "blogSendingNpsBeforeChristmas.sections.2.p2a")}{" "}
            <span className="font-medium text-slate-100">
              {translations(lang, "blogSendingNpsBeforeChristmas.sections.2.p2b")}
            </span>
          </p>
        </ArticleSection>

        <ArticleSection
          number="3"
          title={translations(lang, "blogSendingNpsBeforeChristmas.sections.3.title")}
        >
          <p>{translations(lang, "blogSendingNpsBeforeChristmas.sections.3.p1")}</p>
          <p className="mt-2 font-medium text-slate-100">
            {translations(lang, "blogSendingNpsBeforeChristmas.sections.3.p2")}
          </p>
          <p className="mt-2">{translations(lang, "blogSendingNpsBeforeChristmas.sections.3.p3")}</p>

          <KeyLabel className="mt-4">{translations(lang, "blogSendingNpsBeforeChristmas.sections.3.bestWindows")}</KeyLabel>
          <ul className="mt-2 space-y-1.5">
            <li>
              •{" "}
              <span className="font-medium text-[#22C55E]">
                {translations(lang, "blogSendingNpsBeforeChristmas.sections.3.bullets.1.range")}
              </span>{" "}
              → {translations(lang, "blogSendingNpsBeforeChristmas.sections.3.bullets.1.note")}
            </li>
            <li>
              •{" "}
              <span className="font-medium">
                {translations(lang, "blogSendingNpsBeforeChristmas.sections.3.bullets.2.range")}
              </span>{" "}
              → {translations(lang, "blogSendingNpsBeforeChristmas.sections.3.bullets.2.note")}
            </li>
            <li>
              • {translations(lang, "blogSendingNpsBeforeChristmas.sections.3.bullets.3")}
            </li>
          </ul>

          <p className="mt-4">{translations(lang, "blogSendingNpsBeforeChristmas.sections.3.p4")}</p>
          <ul className="mt-2 space-y-1.5">
            <li>{translations(lang, "blogSendingNpsBeforeChristmas.sections.3.rules.1")}</li>
            <li>{translations(lang, "blogSendingNpsBeforeChristmas.sections.3.rules.2")}</li>
            <li>{translations(lang, "blogSendingNpsBeforeChristmas.sections.3.rules.3")}</li>
          </ul>

          <p className="mt-4">
            {translations(lang, "blogSendingNpsBeforeChristmas.sections.3.p5a")}{" "}
            <span className="font-medium text-[#7C3AED]">
              {translations(lang, "blogSendingNpsBeforeChristmas.sections.3.p5b")}
            </span>
            {translations(lang, "blogSendingNpsBeforeChristmas.sections.3.p5c")}
          </p>
        </ArticleSection>

        <ArticleSection
          number="4"
          title={translations(lang, "blogSendingNpsBeforeChristmas.sections.4.title")}
        >
          <p>{translations(lang, "blogSendingNpsBeforeChristmas.sections.4.p1")}</p>

          <p className="mt-3 font-medium text-slate-100">
            {translations(lang, "blogSendingNpsBeforeChristmas.sections.4.principlesTitle")}
          </p>
          <ul className="mt-2 space-y-1.5">
            <li>{translations(lang, "blogSendingNpsBeforeChristmas.sections.4.principles.1")}</li>
            <li>{translations(lang, "blogSendingNpsBeforeChristmas.sections.4.principles.2")}</li>
            <li>{translations(lang, "blogSendingNpsBeforeChristmas.sections.4.principles.3")}</li>
            <li>{translations(lang, "blogSendingNpsBeforeChristmas.sections.4.principles.4")}</li>
            <li>{translations(lang, "blogSendingNpsBeforeChristmas.sections.4.principles.5")}</li>
          </ul>

          {lang === "fr" ? (
  <div className="mt-5 rounded-2xl border border-white/10 bg-black/40 p-4 sm:p-5">
    <p className="text-xs uppercase tracking-[0.2em] text-[#7C3AED] mb-2">
      {translations(lang, "blogSendingNpsBeforeChristmas.sections.4.templateFr.label")}
    </p>
    <pre className="text-xs sm:text-sm bg-slate-900/60 border border-slate-700/70 rounded-2xl px-4 py-3 text-slate-100 whitespace-pre-wrap break-words">
      {translations(lang, "blogSendingNpsBeforeChristmas.sections.4.templateFr.body")}
    </pre>
  </div>
) : (
  <div className="mt-5 rounded-2xl border border-white/10 bg-black/40 p-4 sm:p-5">
    <p className="text-xs uppercase tracking-[0.2em] text-[#22C55E] mb-2">
      {translations(lang, "blogSendingNpsBeforeChristmas.sections.4.templateEn.label")}
    </p>
    <pre className="text-xs sm:text-sm bg-slate-900/60 border border-slate-700/70 rounded-2xl px-4 py-3 text-slate-100 whitespace-pre-wrap break-words">
      {translations(lang, "blogSendingNpsBeforeChristmas.sections.4.templateEn.body")}
    </pre>
  </div>
)}

        </ArticleSection>

        <ArticleSection
          number="5"
          title={translations(lang, "blogSendingNpsBeforeChristmas.sections.5.title")}
        >
          <p>{translations(lang, "blogSendingNpsBeforeChristmas.sections.5.p1")}</p>
          <ul className="mt-3 space-y-1.5">
            <li>
              <span className="text-rose-400 font-semibold">
                {translations(lang, "blogSendingNpsBeforeChristmas.sections.5.items.1.title")}
              </span>
              <br />
              <span className="text-sm text-slate-300">
                {translations(lang, "blogSendingNpsBeforeChristmas.sections.5.items.1.note")}
              </span>
            </li>

            <li>
              <span className="text-rose-400 font-semibold">
                {translations(lang, "blogSendingNpsBeforeChristmas.sections.5.items.2.title")}
              </span>
              <br />
              <span className="text-sm text-slate-300">
                {translations(lang, "blogSendingNpsBeforeChristmas.sections.5.items.2.note")}
              </span>
            </li>

            <li>
              <span className="text-rose-400 font-semibold">
                {translations(lang, "blogSendingNpsBeforeChristmas.sections.5.items.3.title")}
              </span>
              <br />
              <span className="text-sm text-slate-300">
                {translations(lang, "blogSendingNpsBeforeChristmas.sections.5.items.3.note")}
              </span>
            </li>

            <li>
              <span className="text-rose-400 font-semibold">
                {translations(lang, "blogSendingNpsBeforeChristmas.sections.5.items.4.title")}
              </span>
              <br />
              <span className="text-sm text-slate-300">
                {translations(lang, "blogSendingNpsBeforeChristmas.sections.5.items.4.note")}
              </span>
            </li>

            <li>
              <span className="text-rose-400 font-semibold">
                {translations(lang, "blogSendingNpsBeforeChristmas.sections.5.items.5.title")}
              </span>
              <br />
              <span className="text-sm text-slate-300">
                {translations(lang, "blogSendingNpsBeforeChristmas.sections.5.items.5.note")}
              </span>
            </li>
          </ul>
        </ArticleSection>

        <ArticleSection
          number="6"
          title={translations(lang, "blogSendingNpsBeforeChristmas.sections.6.title")}
        >
          <p>{translations(lang, "blogSendingNpsBeforeChristmas.sections.6.p1")}</p>

          <KeyLabel className="mt-4">{translations(lang, "blogSendingNpsBeforeChristmas.sections.6.promoters.label")}</KeyLabel>
          <ul className="mt-2 space-y-1.5">
            <li>{translations(lang, "blogSendingNpsBeforeChristmas.sections.6.promoters.bullets.1")}</li>
            <li>{translations(lang, "blogSendingNpsBeforeChristmas.sections.6.promoters.bullets.2")}</li>
            <li>{translations(lang, "blogSendingNpsBeforeChristmas.sections.6.promoters.bullets.3")}</li>
          </ul>

          <KeyLabel className="mt-4">{translations(lang, "blogSendingNpsBeforeChristmas.sections.6.passives.label")}</KeyLabel>
          <ul className="mt-2 space-y-1.5">
            <li>{translations(lang, "blogSendingNpsBeforeChristmas.sections.6.passives.bullets.1")}</li>
            <li>{translations(lang, "blogSendingNpsBeforeChristmas.sections.6.passives.bullets.2")}</li>
          </ul>

          <KeyLabel className="mt-4">{translations(lang, "blogSendingNpsBeforeChristmas.sections.6.detractors.label")}</KeyLabel>
          <ul className="mt-2 space-y-1.5">
            <li>{translations(lang, "blogSendingNpsBeforeChristmas.sections.6.detractors.bullets.1")}</li>
            <li>{translations(lang, "blogSendingNpsBeforeChristmas.sections.6.detractors.bullets.2")}</li>
            <li>{translations(lang, "blogSendingNpsBeforeChristmas.sections.6.detractors.bullets.3")}</li>
          </ul>

          <p className="mt-4">
            {translations(lang, "blogSendingNpsBeforeChristmas.sections.6.p2a")}{" "}
            <span className="font-medium text-[#22C55E]">
              {translations(lang, "blogSendingNpsBeforeChristmas.sections.6.p2b")}
            </span>
            {translations(lang, "blogSendingNpsBeforeChristmas.sections.6.p2c")}
          </p>
        </ArticleSection>

        <ArticleSection
          number="7"
          title={translations(lang, "blogSendingNpsBeforeChristmas.sections.7.title")}
        >
          <p>{translations(lang, "blogSendingNpsBeforeChristmas.sections.7.p1")}</p>

          <KeyLabel className="mt-4">{translations(lang, "blogSendingNpsBeforeChristmas.sections.7.beginner.label")}</KeyLabel>
          <ul className="mt-2 space-y-1.5">
            <li>{translations(lang, "blogSendingNpsBeforeChristmas.sections.7.beginner.bullets.1")}</li>
            <li>{translations(lang, "blogSendingNpsBeforeChristmas.sections.7.beginner.bullets.2")}</li>
          </ul>

          <KeyLabel className="mt-4">{translations(lang, "blogSendingNpsBeforeChristmas.sections.7.mid.label")}</KeyLabel>
          <ul className="mt-2 space-y-1.5">
            <li>{translations(lang, "blogSendingNpsBeforeChristmas.sections.7.mid.bullets.1")}</li>
            <li>{translations(lang, "blogSendingNpsBeforeChristmas.sections.7.mid.bullets.2")}</li>
          </ul>

          <KeyLabel className="mt-4">{translations(lang, "blogSendingNpsBeforeChristmas.sections.7.turnkey.label")}</KeyLabel>
          <p className="mt-2">{translations(lang, "blogSendingNpsBeforeChristmas.sections.7.turnkey.p1")}</p>
          <ul className="mt-2 space-y-1.5">
            <li>{translations(lang, "blogSendingNpsBeforeChristmas.sections.7.turnkey.bullets.1")}</li>
            <li>{translations(lang, "blogSendingNpsBeforeChristmas.sections.7.turnkey.bullets.2")}</li>
            <li>{translations(lang, "blogSendingNpsBeforeChristmas.sections.7.turnkey.bullets.3")}</li>
            <li>{translations(lang, "blogSendingNpsBeforeChristmas.sections.7.turnkey.bullets.4")}</li>
            <li>{translations(lang, "blogSendingNpsBeforeChristmas.sections.7.turnkey.bullets.5")}</li>
            <li>{translations(lang, "blogSendingNpsBeforeChristmas.sections.7.turnkey.bullets.6")}</li>
            <li>{translations(lang, "blogSendingNpsBeforeChristmas.sections.7.turnkey.bullets.7")}</li>
            <li>{translations(lang, "blogSendingNpsBeforeChristmas.sections.7.turnkey.bullets.8")}</li>
            <li>{translations(lang, "blogSendingNpsBeforeChristmas.sections.7.turnkey.bullets.9")}</li>
            <li>{translations(lang, "blogSendingNpsBeforeChristmas.sections.7.turnkey.bullets.10")}</li>
            <li>{translations(lang, "blogSendingNpsBeforeChristmas.sections.7.turnkey.bullets.11")}</li>
          </ul>

          <p className="mt-4">
            {translations(lang, "blogSendingNpsBeforeChristmas.sections.7.p2a")}{" "}
            <span className="font-medium text-[#7C3AED]">
              {translations(lang, "blogSendingNpsBeforeChristmas.sections.7.p2b")}
            </span>
            {translations(lang, "blogSendingNpsBeforeChristmas.sections.7.p2c")}
          </p>
        </ArticleSection>

        <ArticleSection
          number="8"
          title={translations(lang, "blogSendingNpsBeforeChristmas.sections.8.title")}
        >
          <p>{translations(lang, "blogSendingNpsBeforeChristmas.sections.8.p1")}</p>
          <ol className="mt-3 space-y-1.5 list-decimal pl-5 text-sm sm:text-base">
            <li>{translations(lang, "blogSendingNpsBeforeChristmas.sections.8.steps.1")}</li>
            <li>{translations(lang, "blogSendingNpsBeforeChristmas.sections.8.steps.2")}</li>
            <li>{translations(lang, "blogSendingNpsBeforeChristmas.sections.8.steps.3")}</li>
            <li>{translations(lang, "blogSendingNpsBeforeChristmas.sections.8.steps.4")}</li>
            <li>
              {translations(lang, "blogSendingNpsBeforeChristmas.sections.8.steps.5a")}
              <ul className="mt-1.5 space-y-1.5 list-disc pl-4 text-[13px] sm:text-sm text-slate-300">
                <li>{translations(lang, "blogSendingNpsBeforeChristmas.sections.8.steps.5bullets.1")}</li>
                <li>{translations(lang, "blogSendingNpsBeforeChristmas.sections.8.steps.5bullets.2")}</li>
                <li>{translations(lang, "blogSendingNpsBeforeChristmas.sections.8.steps.5bullets.3")}</li>
                <li>{translations(lang, "blogSendingNpsBeforeChristmas.sections.8.steps.5bullets.4")}</li>
                <li>{translations(lang, "blogSendingNpsBeforeChristmas.sections.8.steps.5bullets.5")}</li>
              </ul>
            </li>
            <li>{translations(lang, "blogSendingNpsBeforeChristmas.sections.8.steps.6")}</li>
          </ol>

          <p className="mt-4">{translations(lang, "blogSendingNpsBeforeChristmas.sections.8.p2")}</p>
        </ArticleSection>

        {/* Conclusion + CTA */}
        <section className="rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6 md:p-7 space-y-4">
          <h2 className="text-lg sm:text-xl font-semibold text-white">
            {translations(lang, "blogSendingNpsBeforeChristmas.conclusion.title")}
          </h2>

          <p className="text-sm sm:text-base">
            {translations(lang, "blogSendingNpsBeforeChristmas.conclusion.p1")}
          </p>

          <ul className="mt-2 space-y-1.5 text-sm sm:text-base">
            <li>{translations(lang, "blogSendingNpsBeforeChristmas.conclusion.bullets.1")}</li>
            <li>{translations(lang, "blogSendingNpsBeforeChristmas.conclusion.bullets.2")}</li>
            <li>{translations(lang, "blogSendingNpsBeforeChristmas.conclusion.bullets.3")}</li>
          </ul>

          <p className="mt-3 text-sm sm:text-base">
            {translations(lang, "blogSendingNpsBeforeChristmas.conclusion.p2")}
          </p>

          <p className="mt-4 text-sm sm:text-base">
            {translations(lang, "blogSendingNpsBeforeChristmas.conclusion.p3")}
          </p>

          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            <Link
              to="/demo-survey-page"
              className="inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-sm font-semibold bg-[#7C3AED] hover:bg-[#6D28D9] text-white"
            >
              {translations(lang, "blogSendingNpsBeforeChristmas.conclusion.btnDemo")}
            </Link>

            <Link
              to="/book"
              className="inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-sm font-semibold bg-[#22C55E] text-[#0B0F19] hover:bg-[#16A34A]"
            >
              {translations(lang, "blogSendingNpsBeforeChristmas.conclusion.btnBook")}
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

/* --- Small layout helpers --- */

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
