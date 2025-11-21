// src/Products.jsx
import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, LineChart, Search, Newspaper } from "lucide-react";
import Seo from "./components/Seo";
import PageHeader from "../components/PageHeader";


export default function Products() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B0F19] via-[#0C1224] to-[#0B0F19] text-slate-200">
      <Seo
        path="/products"
        title="Productized CX Services: Audits, Momentum Program & Weekly CX Pulse | NPS Me"
        description="Pick a CX package to improve NPS®, reduce support load, and grow retention: Feedback Foundations, Momentum Program, and weekly CX Pulse reports."
      />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_20%_20%,#7C3AED_0%,transparent_35%),radial-gradient(circle_at_80%_30%,#22C55E_0%,transparent_25%)]" />
        <div className="mx-auto max-w-7xl px-6 pt-16 pb-10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#22C55E]" />
            <p className="text-xs uppercase tracking-widest text-[#22C55E]">
              Productized CX services
            </p>
          </div>

          <h1 className="mt-3 text-4xl md:text-5xl font-semibold tracking-tight text-white">
            Productized services that turn feedback into growth
          </h1>
          <p className="mt-4 text-slate-300 max-w-2xl">
            Pick the package that fits your stage—from foundations, to enablement,
            to a weekly CX intelligence feed you can act on.
          </p>
        </div>
      </section>

      {/* Product cards */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="grid gap-6 md:grid-cols-3">
          <ProductCard
            icon={<Search className="h-5 w-5 text-white" />}
            title="Feedback Foundations"
            price="from £450"
            bullets={[
              "Review mining & journey audit",
              "Baseline NPS®/CSAT/CES & quick wins",
              "Prioritised roadmap (effort/impact)"
            ]}
            // ⬇ changed to /book
            cta={{ label: "Request audit", href: "/book" }}
          />

          <ProductCard
            icon={<LineChart className="h-5 w-5 text-white" />}
            title="Momentum Program"
            price="from £850/mo"
            bullets={[
              "Hands-on implementation & enablement",
              "Monthly review cycles & dashboards",
              "Measured lift on key outcomes"
            ]}
            // ⬇ changed to /book
            cta={{ label: "Book discovery", href: "/book" }}
          />

          <ProductCard
            featured
            icon={<Newspaper className="h-5 w-5 text-white" />}
            title="CX Pulse Report (weekly)"
            price="from £190/mo"
            bullets={[
              "Social listening across X/LinkedIn/Reddit/Reviews",
              "Top themes, sentiment & competitor pulse",
              "1-page actionable summary + next steps"
            ]}
            cta={{ label: "See sample report", href: "/cx-pulse-sample" }}
            footnote="Starts manual, scales with automation. Cancel anytime."
          />
        </div>

        {/* Explainer for CX Pulse */}
        <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl md:text-2xl font-semibold text-white">What you get in the weekly CX Pulse</h2>
          <div className="mt-4 grid md:grid-cols-2 gap-6 text-sm text-slate-300">
            <ul className="space-y-2 list-disc pl-5">
              <li>Sentiment pulse (WoW change, drivers)</li>
              <li>Emerging topics (3–5 themes with examples)</li>
              <li>Competitor comparison (optional)</li>
            </ul>
            <ul className="space-y-2 list-disc pl-5">
              <li>Plain-English insight summary (what to do next)</li>
              <li>Lightweight dashboard (rolling trends)</li>
              <li>Delivery on the same weekday, every week</li>
            </ul>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-10 rounded-3xl border border-white/10 bg-gradient-to-br from-[#141B2E] to-[#0F172A] p-8 text-center">
          <h3 className="text-2xl font-semibold text-white">Ready for a sample?</h3>
          <p className="mt-3 text-slate-300 max-w-2xl mx-auto">
            I’ll run a one-off CX Pulse on your brand and send you the PDF within a few days.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:hello@npsme.com?subject=Sample%20CX%20Pulse%20request"
              className="rounded-2xl px-6 py-3 text-sm font-semibold bg-[#22C55E] text-[#0B0F19] hover:bg-[#16A34A] transition inline-flex items-center justify-center gap-2"
            >
              Email hello@npsme.com
              <ArrowRight className="h-4 w-4" />
            </a>
            {/* ⬇ changed to internal Link -> /book */}
            <Link
              to="/book"
              className="rounded-2xl px-6 py-3 text-sm font-semibold bg-[#7C3AED] hover:bg-[#6D28D9] transition inline-flex items-center justify-center gap-2"
            >
              Book discovery
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function ProductCard({ icon, title, price, bullets, cta, featured = false, footnote }) {
  const isInternal = cta?.href && cta.href.startsWith("/") && !cta.href.startsWith("//");
  const CTA = isInternal ? Link : "a";
  const ctaProps = isInternal
    ? { to: cta.href }
    : { href: cta.href, target: cta.href.startsWith("http") ? "_blank" : undefined, rel: "noreferrer" };

  return (
    <div
      className={
        "rounded-2xl border p-6 " +
        (featured
          ? "border-[#7C3AED]/40 bg-gradient-to-br from-[#141B2E] to-[#0F172A] shadow-[0_0_0_1px_rgba(124,58,237,0.25)]"
          : "border-white/10 bg-white/5")
      }
    >
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#22C55E] flex items-center justify-center">
          {icon}
        </div>
        <h3 className="font-semibold text-white">{title}</h3>
      </div>
      <div className="mt-2 text-sm text-slate-400">{price}</div>
      <ul className="mt-4 space-y-2 text-sm text-slate-300 list-disc pl-5">
        {bullets.map((b) => (
          <li key={b}>{b}</li>
        ))}
      </ul>

      <CTA
        {...ctaProps}
        className="mt-6 inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold bg-[#22C55E] text-[#0B0F19] hover:bg-[#16A34A] transition"
      >
        {cta.label}
        <ArrowRight className="h-4 w-4" />
      </CTA>

      {footnote && <p className="mt-3 text-[11px] text-slate-500">{footnote}</p>}
    </div>
  );
}
