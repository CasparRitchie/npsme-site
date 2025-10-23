// src/pages/BlogEthicsOfContactSelection.jsx
import React from "react";
import Seo from "../components/Seo";
import { Link } from "react-router-dom";

export default function BlogEthicsOfContactSelection() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B0F19] via-[#0C1224] to-[#0B0F19] text-slate-200">
      <Seo
        path="/blog/ethics-of-contact-selection"
        title="Are We Asking the Right People? The Ethics of Contact Selection in Customer Feedback | NPS Me"
        description="Cherry-picking who receives a survey can inflate NPS® and damage credibility. Principles and guardrails to keep feedback fair, representative, and actionable."
      />

      <div className="mx-auto max-w-3xl px-6 py-12">
        <p className="text-xs uppercase tracking-widest text-[#22C55E] mb-4">
          Blog • Customer Experience
        </p>

        <h1 className="text-3xl md:text-4xl font-semibold text-white leading-tight">
          Are We Asking the Right People? The Ethics of Contact Selection in Customer Feedback
        </h1>

        <p className="mt-3 text-slate-400 text-sm">
          A practical guide to sampling integrity and avoiding “score shaping”
        </p>

        <div className="mt-8 space-y-6 text-slate-300 leading-relaxed">
          <p>
            In CX, data integrity is everything. One of the easiest ways to distort customer truth
            is deciding <em>who</em> gets surveyed. If sampling can be steered—intentionally or not—
            the resulting Net Promoter Score (NPS)® becomes a measure of survey design, not advocacy.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10">The temptation to “shape” the sample</h2>
          <p>
            Many teams use CRM fields like <strong>“Available for Survey”</strong> or account-level
            <strong> “Do Not Survey” (DNS)</strong>. These are useful controls (legal, contractual,
            or truly unsuitable contacts exist), but they also create a slippery slope: it’s tempting
            to exclude unhappy voices to protect a quarterly metric.
          </p>
          <p>
            Over time this looks like improvement on paper, while real friction persists. Leadership
            allocates investment based on biased data; customers notice they aren’t being asked—or
            worse, that their voices don’t count.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10">Response rates vs authenticity</h2>
          <p>
            Driving responses is good; coaching scores is not. Reminders should focus on
            <em>participation</em> (“Your feedback helps us improve”), not outcomes (“Please give us 9–10”).
            The latter erodes trust and undermines the very purpose of feedback.
          </p>

          <blockquote className="border-l-4 border-[#22C55E] pl-4 italic text-slate-400">
            “If you’re happy, give us a 9 or 10—anything else counts as bad.”
            This common message may lift the number—but it destroys credibility.
          </blockquote>

          <h2 className="text-xl font-semibold text-white mt-10">Guardrails for ethical contact selection</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>
              <strong>Automate random sampling with auditable rules.</strong> Define eligibility
              (tenure, recent activity, legal constraints) and log every exclusion with a reason.
            </li>
            <li>
              <strong>Separate ownership of score from ownership of action.</strong> CX ops should
              run sampling; teams own fixes and outcomes.
            </li>
            <li>
              <strong>Tighten DNS controls.</strong> Require written rationale and time-bound reviews.
              Use approvals for account-wide DNS to prevent misuse.
            </li>
            <li>
              <strong>Rotate fairly and cap frequency.</strong> Avoid over-surveying helpful contacts
              and under-surveying detractors; set cool-off periods.
            </li>
            <li>
              <strong>Standardise comms content.</strong> Company-authored reminder templates reduce
              coaching risk while improving response rates.
            </li>
            <li>
              <strong>Publish what you learned.</strong> Share themes, fixes shipped, and measurable
              impact. Transparency earns future participation.
            </li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-10">What “good” looks like</h2>
          <p>
            You’ll know your programme is healthy when: (1) exclusions trend low and are justified,
            (2) response rates climb without coaching language, (3) the distribution of scores is
            stable and believable, and (4) leaders celebrate problems found and fixed—not just a
            single number.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10">Key takeaways</h2>
          <ul className="list-disc list-inside space-y-2">
            <li><strong>Ethical sampling protects data integrity.</strong></li>
            <li><strong>Automate eligibility; audit exclusions.</strong></li>
            <li><strong>Reward learning and improvement, not score-keeping.</strong></li>
            <li><strong>Transparency builds trust and future response.</strong></li>
          </ul>

          <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4 text-[11px] leading-relaxed text-slate-400">
            <p>
              Attribution: NPS® and Net Promoter Score® are registered service marks of Bain &amp; Company, Inc.,
              Fred Reichheld, and Satmetrix Systems, Inc. References here are descriptive only. NPS Me is
              independent and not affiliated with those parties.
            </p>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 text-center">
          <p className="text-slate-400 text-sm">
            Want help tightening sampling rules and boosting trustworthy response rates?
          </p>
          <div className="mt-4 flex flex-col sm:flex-row justify-center gap-3">
            <Link
              to="/products"
              className="rounded-2xl px-6 py-3 text-sm font-semibold bg-[#7C3AED] hover:bg-[#6D28D9] transition"
            >
              Explore NPS Me Services
            </Link>
            <a
              href="/#contact"
              className="rounded-2xl px-6 py-3 text-sm font-semibold bg-[#22C55E] text-[#0B0F19] hover:bg-[#16A34A] transition"
            >
              Book Discovery Call
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
