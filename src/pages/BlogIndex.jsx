// src/pages/BlogIndex.jsx
import React from "react";
import { Link } from "react-router-dom";
import Seo from "../components/Seo";
import PageHeader from "../components/PageHeader";
import { useLanguage } from "../i18n/LanguageContext";
import { translations } from "../i18n/translations";

const POSTS = [
  {
    slug: "ethics-of-contact-selection",
    titleKey: "blog.posts.ethicsOfContactSelection.title",
    excerptKey: "blog.posts.ethicsOfContactSelection.excerpt",
    date: "2025-10-23",
    readTime: "6 min",
    tags: ["NPS", "Sampling", "B2B"],
  },
  {
    slug: "ethical-surveys",
    titleKey: "blog.posts.ethicalSurveys.title",
    excerptKey: "blog.posts.ethicalSurveys.excerpt",
    date: "2025-10-15",
    readTime: "7 min",
    tags: ["NPS", "Ethics", "Survey Design"],
  },
  {
    slug: "closing-the-loop",
    titleKey: "blog.posts.closingTheLoop.title",
    excerptKey: "blog.posts.closingTheLoop.excerpt",
    date: "2025-11-04",
    readTime: "9 min",
    tags: ["NPS", "Customer Feedback", "Trust"],
  },
  {
    slug: "what-to-do-with-nps-scores",
    titleKey: "blog.posts.whatToDoWithNps.title",
    excerptKey: "blog.posts.whatToDoWithNps.excerpt",
    date: "2025-11-12",
    readTime: "8 min",
    tags: ["NPS", "Reporting", "CX"],
  },
  {
    slug: "sending-nps-before-christmas",
    titleKey: "blog.posts.sendingBeforeChristmas.title",
    excerptKey: "blog.posts.sendingBeforeChristmas.excerpt",
    date: "2025-12-01",
    readTime: "8 min",
    tags: ["NPS", "Seasonal", "SMB"],
  },
  {
    slug: "why-nps-isnt-improving",
    titleKey: "blog.posts.whyNpsIsntImproving.title",
    excerptKey: "blog.posts.whyNpsIsntImproving.excerpt",
    date: "2025-12-03",
    readTime: "6 min",
    tags: ["NPS", "CX", "Fundamentals"],
  },
  {
    slug: "data-visualisation-cx-insights",
    titleKey: "blog.posts.dataVisualisationCx.title",
    excerptKey: "blog.posts.dataVisualisationCx.excerpt",
    date: "2025-12-08",
    readTime: "7 min",
    tags: ["CX", "Data", "Visualisation"],
  },
  {
    slug: "intercom-nps-beyond-the-score",
    titleKey: "blog.posts.intercomNpsBeyondScore.title",
    excerptKey: "blog.posts.intercomNpsBeyondScore.excerpt",
    date: "2026-03-05",
    readTime: "7 min",
    tags: ["Intercom", "NPS", "Analytics"],
  },
];

export default function BlogIndex() {
  const { lang } = useLanguage();
  const prefix = lang === "fr" ? "/fr" : "";

  const posts = [...POSTS].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B0F19] via-[#0C1224] to-[#0B0F19] text-slate-200">
      <Seo
        path={`${prefix}/blog`}
        title={translations(lang, "blog.seo.title")}
        description={translations(lang, "blog.seo.description")}
      />

      <PageHeader
        iconLabel={translations(lang, "blog.header.iconLabel")}
        tag={translations(lang, "blog.header.tag")}
        accent={translations(lang, "blog.header.accent")}
        title={translations(lang, "blog.header.title")}
        subtitle={translations(lang, "blog.header.subtitle")}
      />

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid gap-6 md:grid-cols-2">
          {posts.map((p) => (
            <article
              key={p.slug}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 hover:border-white/20 transition"
            >
              <div className="text-xs text-slate-400">
                <time dateTime={p.date}>
                  {new Date(p.date).toLocaleDateString(lang, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </time>{" "}
                • {p.readTime}
              </div>

              <h2 className="mt-2 text-xl font-semibold text-white">
                <Link to={`${prefix}/blog/${p.slug}`} className="hover:underline">
                  {translations(lang, p.titleKey)}
                </Link>
              </h2>

              <p className="mt-2 text-slate-300 text-sm">
                {translations(lang, p.excerptKey)}
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                {p.tags.map((t) => (
                  <span
                    key={t}
                    className="text-[11px] px-2 py-0.5 rounded-lg bg-black/20 border border-white/10 text-slate-400"
                  >
                    {t}
                  </span>
                ))}
              </div>

              <div className="mt-4">
                <Link
                  to={`${prefix}/blog/${p.slug}`}
                  className="inline-flex items-center gap-2 text-sm text-[#22C55E] hover:text-[#16A34A]"
                >
                  {translations(lang, "blog.readPost")} →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
