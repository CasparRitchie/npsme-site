// src/pages/BlogWhatToDoWithNpsScores.jsx
import React from "react";
import Seo from "../components/Seo";
import { Link } from "react-router-dom";

export default function BlogWhatToDoWithNpsScores() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B0F19] via-[#0C1224] to-[#0B0F19] text-slate-200">
      <Seo
        path="/blog/what-to-do-with-nps-scores"
        title="What To Do With Your NPS Scores: Present, Interpret, Act | NPS Me"
        description="How to present NPS the right way, avoid small-sample traps, handle repeat responders, and target changes that actually lift the score and the business."
      />

      <div className="mx-auto max-w-3xl px-6 py-12">
        <p className="text-xs uppercase tracking-widest text-[#22C55E] mb-4">
          Blog • Customer Experience
        </p>
        <h1 className="text-3xl md:text-4xl font-semibold text-white leading-tight">
          What To Do With Your NPS Scores
        </h1>
        <p className="mt-3 text-slate-400 text-sm">
          Practical ways to present, interpret, and act on NPS so it changes customer outcomes, not just dashboards.
        </p>

        <div className="mt-8 space-y-6 text-slate-300 leading-relaxed">
          <p>
            A single number on its own rarely helps a leadership team make better decisions. NPS can be powerful, but only
            when it is presented clearly, read in context, and tied to action. Below is a simple approach you can apply
            next week with almost any program.
          </p>

          {/* Presentation models */}
          <h2 className="text-xl font-semibold text-white mt-10">Present the score in three views</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>
              <strong>Spot month</strong> for recency. Useful for operational reviews and short feedback loops. Always show
              the <em>response count</em> next to the score so people see the confidence level.
            </li>
            <li>
              <strong>Quarter to date</strong> for directional movement. Reduces noise while keeping changes visible for
              stakeholders who live by quarters.
            </li>
            <li>
              <strong>12-month rolling</strong> for the strategic view. Smooths seasonality and shows whether your program
              is truly improving. Use this for long-term trend calls with the exec team.
            </li>
          </ul>
          <p className="text-sm text-slate-400">
            Tip: plot all three on a single compact chart. The room sees momentum without losing sight of today.
          </p>

          {/* Sample size and stability */}
          <h2 className="text-xl font-semibold text-white mt-10">Respect sample size and stability</h2>
          <p>
            NPS becomes volatile when volumes are low. Publish a simple rule of thumb alongside each chart. For example:
            “Spot month is treated as directional below 200 responses.” You do not need to show confidence intervals to
            everyone, but you should design where you get stability:
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li>Pool small segments into a parent cohort for reporting, then deep-dive with comments.</li>
            <li>Use rolling windows for teams with low monthly volumes.</li>
            <li>Guard against sudden shifts caused by one large outreach or one major incident.</li>
          </ul>

          {/* Cultural differences */}
          <h2 className="text-xl font-semibold text-white mt-10">Look beyond the score</h2>
          <p>
            Two people can feel the same way about your brand and still give different numbers. Culture and context matter.
            In the UK a pass at 40 percent is normal at university, in other places 70 percent is the threshold. Some markets
            avoid 10 out of 10 unless everything is perfect, others are comfortable rating highly when the experience meets
            expectations. The comment is where the truth lives. Make written feedback first class and the number second.
          </p>

          {/* Repeat responders */}
          <h2 className="text-xl font-semibold text-white mt-10">Handle repeat responders with intent</h2>
          <p>
            Repeat responders are valuable because they reveal change over time, but they can bias the score if they
            dominate the sample. Use light controls:
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li>Cap contact frequency per person so you do not over-survey the same voices.</li>
            <li>Track first-time vs repeat separately. Report both when volumes allow.</li>
            <li>Use longitudinal slices to see if fixes actually shift the same customer’s view after an intervention.</li>
          </ul>

          {/* Targeting change */}
          <h2 className="text-xl font-semibold text-white mt-10">Where to focus for the biggest lift</h2>
          <p>
            It is tempting to chase the loudest 0 or 1. Sometimes you must, especially if it points to a critical failure.
            But if the goal is to lift the overall score, moving <strong>7s and 8s to 9s and 10s</strong> often has more
            impact, because you are nudging people who already see value.
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li>
              <strong>Stabilise detractors</strong> by fixing systemic blockers that create repeats of the same pain.
            </li>
            <li>
              <strong>Activate passives</strong> with small experience upgrades that remove friction and make advocacy easy.
            </li>
            <li>
              <strong>Protect promoters</strong> with consistent basics and simple referral prompts.
            </li>
          </ul>

            {/* Practical lenses */}
          <h2 className="text-xl font-semibold text-white mt-10">Cut the data where teams can act</h2>
          <ul className="list-disc list-inside space-y-2">
            <li><strong>Journey step</strong> like sign-up, first delivery, renewal, refund.</li>
            <li><strong>Product or service line</strong> where ownership is clear.</li>
            <li><strong>Channel</strong> such as app, web, store, or partner.</li>
            <li><strong>Customer cohort</strong> for new vs repeat, high vs low value, or region.</li>
          </ul>
          <p className="text-sm text-slate-400">
            Each slice should lead to a named owner, a clear fix, and a measurable before and after.
          </p>

          {/* Close the loop */}
          <h2 className="text-xl font-semibold text-white mt-10">Close the loop and show the change</h2>
          <p>
            Turning comments into fixes is the whole point. Use a simple rhythm: collect, cluster, choose, ship, share.
            Publish a “you said, we did” update at a cadence your customers can feel. Then watch the same cohorts in the
            next cycle to see if the needle moves.
          </p>

          {/* Summary */}
          <h2 className="text-xl font-semibold text-white mt-10">Bottom line</h2>
          <p>
            Present NPS in a way that sets the right expectations, control for sample stability, read the comments first,
            and aim your effort where it converts sentiment into advocacy. That is how the score becomes a by-product of
            better experience, rather than a target in itself.
          </p>
        </div>

        {/* CTA footer */}
        <div className="mt-10 pt-6 border-t border-white/10 text-center">
          <p className="text-slate-400 text-sm">
            Want help turning feedback into growth with clear dashboards and shipped fixes?
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
