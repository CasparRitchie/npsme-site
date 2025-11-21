// src/pages/BlogEthicsOfContactSelection.jsx
import React from "react";
import Seo from "../components/Seo";
import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader";

export default function BlogEthicsOfContactSelection() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B0F19] via-[#0C1224] to-[#0B0F19] text-slate-200">
      <Seo
        path="/blog/ethics-of-contact-selection"
        title="Are We Asking the Right People? The Ethics of Contact Selection in Customer Feedback | NPS Me"
        description="Cherry-picking who receives a survey can inflate NPS® and damage credibility. Principles and guardrails to keep feedback fair, representative, and actionable."
      />

      <main className="mx-auto max-w-4xl px-6 py-10 md:py-14 space-y-10 md:space-y-12">
        {/* Meta header */}
        <PageHeader
          tag="CX & NPS / Blog"
          accent="Are We Asking the Right People?"
          title="The Ethics of Contact Selection in Customer Feedback"
          subtitle="Cherry-picking who receives a survey can inflate NPS and damage credibility. Here’s how to keep sampling fair, representative, and actionable."
        />
        {/* <header>
          <p className="text-[11px] uppercase tracking-[0.25em] text-[#22C55E] mb-2">
            Blog • Customer Experience
          </p>

          <h1 className="text-3xl md:text-4xl font-semibold text-white leading-tight">
            Are We Asking the Right People? The Ethics of Contact Selection in Customer Feedback
          </h1>

          <p className="mt-3 text-xs md:text-sm text-slate-400">
            A practical guide to sampling integrity and avoiding “score shaping”
          </p>

          <div className="mt-6 h-px w-24 bg-gradient-to-r from-[#22C55E] via-[#7C3AED] to-transparent" />
        </header> */}

        {/* Intro */}
        <section className="mt-8 rounded-2xl border border-white/10 bg-black/30 p-5 md:p-6">
          <p className="text-sm md:text-base text-slate-200 leading-relaxed">
            In CX, data integrity is everything. One of the easiest ways to distort customer truth
            is deciding <em>who</em> gets surveyed. If sampling can be steered — intentionally or not —
            the resulting Net Promoter Score (NPS)® becomes a measure of survey design, not advocacy.
          </p>
        </section>

        {/* 1 – Temptation to shape the sample */}
        <section className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5 md:p-6">
          <h2 className="flex items-center gap-3 text-lg md:text-xl font-semibold text-white">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#7C3AED] to-[#22C55E] text-[11px] font-bold">
              1
            </span>
            <span>The temptation to “shape” the sample</span>
          </h2>

          <div className="mt-3 space-y-3 text-sm md:text-base text-slate-200 leading-relaxed">
            <p>
              Many teams use CRM fields like <strong>“Available for Survey”</strong> or account-level
              <strong> “Do Not Survey” (DNS)</strong>. These are useful controls — legal, contractual
              or truly unsuitable contacts do exist — but they also create a slippery slope.
            </p>
            <p>
              It becomes tempting to exclude unhappy voices to protect a quarterly metric.
            </p>
            <p>
              Over time this looks like improvement on paper, while real friction persists.
              Leadership allocates investment based on biased data; customers notice they aren’t being asked — or worse, that their voices don’t count.
            </p>
          </div>
        </section>

        {/* 2 – Response rates vs authenticity */}
        <section className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5 md:p-6">
          <h2 className="flex items-center gap-3 text-lg md:text-xl font-semibold text-white">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#22C55E] to-[#7C3AED] text-[11px] font-bold">
              2
            </span>
            <span>Response rates vs authenticity</span>
          </h2>

          <div className="mt-3 space-y-3 text-sm md:text-base text-slate-200 leading-relaxed">
            <p>
              Driving responses is good; coaching scores is not. Reminders should focus on{" "}
              <em>participation</em> (“Your feedback helps us improve”), not outcomes
              (“Please give us 9–10”). The latter erodes trust and undermines the very purpose of feedback.
            </p>

            <blockquote className="border-l-4 border-[#22C55E] pl-4 italic text-slate-400">
              “If you’re happy, give us a 9 or 10 — anything else counts as bad.”<br />
              This common message may lift the number, but it destroys credibility.
            </blockquote>

            <p>
              The moment respondents sense that the goal is to “look good” rather than learn,
              the value of the entire programme starts to erode.
            </p>
          </div>
        </section>

        {/* 3 – Guardrails */}
        <section className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5 md:p-6">
          <h2 className="flex items-center gap-3 text-lg md:text-xl font-semibold text-white">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#7C3AED] to-[#22C55E] text-[11px] font-bold">
              3
            </span>
            <span>Guardrails for ethical contact selection</span>
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-sm md:text-base text-slate-200">
            <li>
              <strong>Automate random sampling with auditable rules.</strong>{" "}
              Define eligibility (tenure, recent activity, legal constraints) and log every exclusion with a reason.
            </li>
            <li>
              <strong>Separate ownership of score from ownership of action.</strong>{" "}
              CX ops should run sampling; teams own fixes and outcomes.
            </li>
            <li>
              <strong>Tighten DNS controls.</strong>{" "}
              Require written rationale and time-bound reviews. Use approvals for account-wide DNS to prevent misuse.
            </li>
            <li>
              <strong>Rotate fairly and cap frequency.</strong>{" "}
              Avoid over-surveying helpful contacts and under-surveying detractors; set cool-off periods.
            </li>
            <li>
              <strong>Standardise comms content.</strong>{" "}
              Company-authored reminder templates reduce coaching risk while improving response rates.
            </li>
            <li>
              <strong>Publish what you learned.</strong>{" "}
              Share themes, fixes shipped, and measurable impact. Transparency earns future participation.
            </li>
          </ul>
        </section>

        {/* 4 – What “good” looks like */}
        <section className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5 md:p-6">
          <h2 className="flex items-center gap-3 text-lg md:text-xl font-semibold text-white">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#22C55E] to-[#7C3AED] text-[11px] font-bold">
              4
            </span>
            <span>What “good” looks like</span>
          </h2>

          <div className="mt-3 space-y-3 text-sm md:text-base text-slate-200 leading-relaxed">
            <p>
              You’ll know your programme is healthy when:
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Exclusions trend low and are clearly justified.</li>
              <li>Response rates climb without coaching language.</li>
              <li>The distribution of scores is stable and believable.</li>
              <li>
                Leaders celebrate problems found and fixed — not just a single number on a slide.
              </li>
            </ul>
          </div>
        </section>

        {/* 5 – Key takeaways + attribution */}
        <section className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5 md:p-6">
          <h2 className="flex items-center gap-3 text-lg md:text-xl font-semibold text-white">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#7C3AED] to-[#22C55E] text-[11px] font-bold">
              5
            </span>
            <span>Key takeaways</span>
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-sm md:text-base text-slate-200">
            <li><strong>Ethical sampling protects data integrity.</strong></li>
            <li><strong>Automate eligibility; audit exclusions.</strong></li>
            <li><strong>Reward learning and improvement, not score-keeping.</strong></li>
            <li><strong>Transparency builds trust and future response.</strong></li>
          </ul>

          <div className="mt-5 rounded-2xl border border-white/10 bg-black/30 p-4 text-[11px] leading-relaxed text-slate-400">
            <p>
              Attribution: NPS® and Net Promoter Score® are registered service marks of Bain &amp; Company, Inc.,
              Fred Reichheld, and Satmetrix Systems, Inc. References here are descriptive only. NPS Me is
              independent and not affiliated with those parties.
            </p>
          </div>
        </section>

        {/* CTA footer */}
        <footer className="mt-12">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#141B2E] via-[#0B1120] to-[#0B0F19] p-6 md:p-8 text-center">
            <p className="text-sm md:text-base text-slate-200">
              Want help tightening sampling rules and boosting trustworthy response rates?
            </p>
            <p className="mt-2 text-xs md:text-sm text-slate-400 max-w-2xl mx-auto">
              NPS Me can design ethical sampling logic, DNS governance and communication
              frameworks that protect the integrity — and credibility — of your NPS programme.
            </p>

            <div className="mt-5 flex flex-col sm:flex-row justify-center gap-3">
              <Link
                to="/products"
                className="rounded-2xl px-6 py-2.5 text-sm font-semibold bg-[#7C3AED] hover:bg-[#6D28D9] transition"
              >
                Explore NPS Me services
              </Link>
              <Link
                to="/book"
                className="rounded-2xl px-6 py-2.5 text-sm font-semibold bg-[#22C55E] text-[#020617] hover:bg-[#16A34A] transition"
              >
                Book a discovery call
              </Link>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
