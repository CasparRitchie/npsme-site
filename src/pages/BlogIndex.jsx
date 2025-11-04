// src/pages/BlogIndex.jsx
import React from "react";
import { Link } from "react-router-dom";
import Seo from "../components/Seo";

const POSTS = [
  {
    slug: "ethics-of-contact-selection",
    title: "Are We Asking the Right People? Ethical Contact Selection in B2B NPS",
    excerpt:
      "When account teams choose who gets surveyed, the data can drift. A practical guide to fair sampling, DNS governance, and response coaching.",
    date: "2025-10-23",
    readTime: "6 min",
    tags: ["NPS", "Sampling", "B2B"],
  },
  {
    slug: "ethical-surveys",
    title: "When Feedback Fatigue Sets In: The Ethics of Customer Contact Selection",
    excerpt:
      "How contact selection, DNS flags, and response-pressure can quietly distort NPS  -  and what to do instead.",
    date: "2025-10-15",
    readTime: "7 min",
    tags: ["NPS", "Ethics", "Survey Design"],
  },
  {
    slug: "closing-the-loop",
    title: "Beyond the Score: Why Closing the Loop Builds Trust",
    excerpt: "NPS is more than a number. Learn why closing the loop with customers builds credibility and drives lasting improvement.",
    date: "2025-11-04",
    readTime: "9 min",
    tags: ["NPS", "Customer Feedback", "Trust"],
  },
  // Add more posts here as you publish them
];

export default function BlogIndex() {
  const posts = [...POSTS].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B0F19] via-[#0C1224] to-[#0B0F19] text-slate-200">
      <Seo
        path="/blog"
        title="Blog | NPS Me - Practical CX & NPS Insights"
        description="Opinionated, practitioner-grade guidance on improving customer experience (CX) and Net Promoter Score (NPS) ethically."
      />

      {/* Header */}
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="pointer-events-none absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_20%_20%,#7C3AED_0%,transparent_35%),radial-gradient(circle_at_80%_30%,#22C55E_0%,transparent_25%)]" />
        <div className="mx-auto max-w-7xl px-6 py-12">
          <p className="text-xs uppercase tracking-widest text-slate-400">Insights</p>
          <h1 className="mt-2 text-3xl md:text-4xl font-semibold tracking-tight text-white">
            Blog  -  CX & NPS, done properly
          </h1>
          <p className="mt-3 max-w-2xl text-slate-300">
            Pragmatic lessons from real programmes. Fewer buzzwords, more outcomes.
          </p>
        </div>
      </section>

      {/* Posts grid */}
      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid gap-6 md:grid-cols-2">
          {posts.map((p) => (
            <article
              key={p.slug}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 hover:border-white/20 transition"
            >
              <div className="text-xs text-slate-400">
                <time dateTime={p.date}>
                  {new Date(p.date).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </time>{" "}
                • {p.readTime}
              </div>
              <h2 className="mt-2 text-xl font-semibold text-white">
                <Link to={`/blog/${p.slug}`} className="hover:underline">
                  {p.title}
                </Link>
              </h2>
              <p className="mt-2 text-slate-300 text-sm">{p.excerpt}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {p.tags.map((t) => (
                  <span
                    key={t}
                    className="text-[11px] px-2 py-0.5 rounded-lg bg黑/20 border border-white/10 text-slate-400"
                  >
                    {t}
                  </span>
                ))}
              </div>
              <div className="mt-4">
                <Link
                  to={`/blog/${p.slug}`}
                  className="inline-flex items-center gap-2 text-sm text-[#22C55E] hover:text-[#16A34A]"
                >
                  Read post →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
