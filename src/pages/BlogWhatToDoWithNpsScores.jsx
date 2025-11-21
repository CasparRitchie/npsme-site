// src/pages/BlogWhatToDoWithNpsScores.jsx
import React from "react";
import Seo from "../components/Seo";
import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader";


export default function BlogWhatToDoWithNpsScores() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B0F19] via-[#0C1224] to-[#0B0F19] text-slate-200">
      <Seo
        path="/blog/what-to-do-with-nps-scores"
        title="What To Do With Your NPS Scores: Present, Interpret, Act | NPS Me"
        description="How to present NPS the right way, avoid small-sample traps, handle repeat responders, and target changes that actually lift the score and the business."
      />

        {/* Meta header */}
        <PageHeader
          iconLabel="Interpreting NPS"
          tag="CX & NPS / Blog"
          accent="What To Do With Your NPS Scores. "
          title="Practical ways to present, interpret, and act on NPS..."
          subtitle="...so it changes customer outcomes, not just dashboards."
        />
      <main className="mx-auto max-w-4xl px-6 py-10 md:py-14 space-y-10 md:space-y-12">

        {/* Intro */}
        <section className="mt-8 rounded-2xl border border-white/10 bg-black/30 p-5 md:p-6">
          <p className="text-sm md:text-base text-slate-200 leading-relaxed">
            A single number on its own rarely helps a leadership team make better decisions.
            NPS can be powerful, but only when it is presented clearly, read in context,
            and tied to action. Below is a simple approach you can apply next week with
            almost any programme.
          </p>
        </section>

        {/* 1 – Present in three views */}
        <section className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5 md:p-6">
          <h2 className="flex items-center gap-3 text-lg md:text-xl font-semibold text-white">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#7C3AED] to-[#22C55E] text-[11px] font-bold">
              1
            </span>
            <span>Present the score in three views</span>
          </h2>

          <div className="mt-3 space-y-3 text-sm md:text-base text-slate-200 leading-relaxed">
            <ul className="list-disc list-inside space-y-2">
              <li>
                <strong>Spot month</strong> for recency. Useful for operational reviews and short
                feedback loops. Always show the <em>response count</em> next to the score so people
                see the confidence level.
              </li>
              <li>
                <strong>Quarter to date</strong> for directional movement. Reduces noise while
                keeping changes visible for stakeholders who live by quarters.
              </li>
              <li>
                <strong>12-month rolling</strong> for the strategic view. Smooths seasonality and
                shows whether your programme is truly improving. Use this for long-term trend calls
                with the exec team.
              </li>
            </ul>

            <p className="text-xs md:text-sm text-slate-400">
              Tip: plot all three on a single compact chart. The room sees momentum without losing
              sight of today.
            </p>
          </div>
        </section>

        {/* 2 – Sample size & stability */}
        <section className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5 md:p-6">
          <h2 className="flex items-center gap-3 text-lg md:text-xl font-semibold text-white">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#22C55E] to-[#7C3AED] text-[11px] font-bold">
              2
            </span>
            <span>Respect sample size and stability</span>
          </h2>

          <div className="mt-3 space-y-3 text-sm md:text-base text-slate-200 leading-relaxed">
            <p>
              NPS becomes volatile when volumes are low. Publish a simple rule of thumb alongside
              each chart. For example: “Spot month is treated as directional below 200 responses.”
              You don’t need to show confidence intervals to everyone, but you should design where
              you get stability:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>Pool small segments into a parent cohort for reporting, then deep-dive with comments.</li>
              <li>Use rolling windows for teams with low monthly volumes.</li>
              <li>Guard against sudden shifts caused by one large outreach or one major incident.</li>
            </ul>
          </div>
        </section>

        {/* 3 – Look beyond the score */}
        <section className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5 md:p-6">
          <h2 className="flex items-center gap-3 text-lg md:text-xl font-semibold text-white">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#7C3AED] to-[#22C55E] text-[11px] font-bold">
              3
            </span>
            <span>Look beyond the score</span>
          </h2>

          <div className="mt-3 space-y-3 text-sm md:text-base text-slate-200 leading-relaxed">
            <p>
              Two people can feel the same way about your brand and still give different numbers.
              Culture and context matter. In the UK, a pass at 40% is normal at university; in
              other places 70% is the threshold. Some markets avoid 10 out of 10 unless everything
              is perfect, others are comfortable rating highly when the experience simply meets
              expectations.
            </p>
            <p>
              The comment is where the truth lives. Make written feedback first-class and the
              number second.
            </p>
          </div>
        </section>

        {/* 4 – Repeat responders */}
        <section className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5 md:p-6">
          <h2 className="flex items-center gap-3 text-lg md:text-xl font-semibold text-white">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#22C55E] to-[#7C3AED] text-[11px] font-bold">
              4
            </span>
            <span>Handle repeat responders with intent</span>
          </h2>

          <div className="mt-3 space-y-3 text-sm md:text-base text-slate-200 leading-relaxed">
            <p>
              Repeat responders are valuable because they reveal change over time, but they can bias
              the score if they dominate the sample. Use light controls:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>Cap contact frequency per person so you don’t over-survey the same voices.</li>
              <li>Track first-time vs repeat separately and report both when volumes allow.</li>
              <li>
                Use longitudinal slices to see if fixes actually shift the same customer’s view
                after an intervention.
              </li>
            </ul>
          </div>
        </section>

        {/* 5 – Where to focus */}
        <section className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5 md:p-6">
          <h2 className="flex items-center gap-3 text-lg md:text-xl font-semibold text-white">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#7C3AED] to-[#22C55E] text-[11px] font-bold">
              5
            </span>
            <span>Where to focus for the biggest lift</span>
          </h2>

          <div className="mt-3 space-y-3 text-sm md:text-base text-slate-200 leading-relaxed">
            <p>
              It’s tempting to chase the loudest 0 or 1. Sometimes you must, especially if it points
              to a critical failure. But if the goal is to lift the overall score, moving{" "}
              <strong>7s and 8s to 9s and 10s</strong> often has more impact, because you’re nudging
              people who already see value.
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>
                <strong>Stabilise detractors</strong> by fixing systemic blockers that create repeats
                of the same pain.
              </li>
              <li>
                <strong>Activate passives</strong> with small experience upgrades that remove
                friction and make advocacy easy.
              </li>
              <li>
                <strong>Protect promoters</strong> with consistent basics and simple referral prompts.
              </li>
            </ul>
          </div>
        </section>

        {/* 6 – Cuts that lead to action */}
        <section className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5 md:p-6">
          <h2 className="flex items-center gap-3 text-lg md:text-xl font-semibold text-white">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#22C55E] to-[#7C3AED] text-[11px] font-bold">
              6
            </span>
            <span>Cut the data where teams can act</span>
          </h2>

          <div className="mt-3 space-y-3 text-sm md:text-base text-slate-200 leading-relaxed">
            <ul className="list-disc list-inside space-y-2">
              <li>
                <strong>Journey step</strong> like sign-up, first delivery, renewal, refund.
              </li>
              <li>
                <strong>Product or service line</strong> where ownership is clear.
              </li>
              <li>
                <strong>Channel</strong> such as app, web, store, or partner.
              </li>
              <li>
                <strong>Customer cohort</strong> for new vs repeat, high vs low value, or region.
              </li>
            </ul>
            <p className="text-xs md:text-sm text-slate-400">
              Each slice should lead to a named owner, a clear fix, and a measurable “before and
              after”.
            </p>
          </div>
        </section>

        {/* 7 – Close the loop */}
        <section className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5 md:p-6">
          <h2 className="flex items-center gap-3 text-lg md:text-xl font-semibold text-white">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#7C3AED] to-[#22C55E] text-[11px] font-bold">
              7
            </span>
            <span>Close the loop and show the change</span>
          </h2>

          <div className="mt-3 space-y-3 text-sm md:text-base text-slate-200 leading-relaxed">
            <p>
              Turning comments into fixes is the whole point. Use a simple rhythm: collect, cluster,
              choose, ship, share. Publish a “you said, we did” update at a cadence your customers
              can feel. Then watch the same cohorts in the next cycle to see if the needle moves.
            </p>
          </div>
        </section>

        {/* Bottom line */}
        <section className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5 md:p-6">
          <h2 className="flex items-center gap-3 text-lg md:text-xl font-semibold text-white">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#22C55E] to-[#7C3AED] text-[11px] font-bold">
              8
            </span>
            <span>Bottom line</span>
          </h2>

          <p className="mt-3 text-sm md:text-base text-slate-200 leading-relaxed">
            Present NPS in a way that sets the right expectations, control for sample stability,
            read the comments first, and aim your effort where it converts sentiment into advocacy.
            That’s how the score becomes a by-product of better experience, rather than a target
            in itself.
          </p>
        </section>

        {/* CTA footer */}
        <footer className="mt-12">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#141B2E] via-[#0B1120] to-[#0B0F19] p-6 md:p-8 text-center">
            <p className="text-sm md:text-base text-slate-200">
              Want help turning feedback into growth with clear dashboards and shipped fixes?
            </p>
            <p className="mt-2 text-xs md:text-sm text-slate-400 max-w-2xl mx-auto">
              NPS Me can help you design reporting lenses, stabilise noisy scores, and link NPS
              directly to actionable change in your customer journey.
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
