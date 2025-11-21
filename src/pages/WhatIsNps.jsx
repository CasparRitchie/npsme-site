// src/pages/WhatIsNps.jsx
import React from "react";
import { Link } from "react-router-dom";
import Seo from "../components/Seo";
import PageHeader from "../components/PageHeader";


export default function WhatIsNps() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B0F19] via-[#0C1224] to-[#0B0F19] text-slate-200">
      <Seo
        path="/what-is-nps"
        title="What is Net Promoter Score (NPS)? | NPS Me"
        description="Plain English guide to Net Promoter Score (NPS): how it works, how to calculate it, where it helps, where it misleads, and how to act on feedback."
      />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="pointer-events-none absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_20%_20%,#7C3AED_0%,transparent_35%),radial-gradient(circle_at_80%_30%,#22C55E_0%,transparent_25%)]" />
        <div className="relative mx-auto max-w-5xl px-6 py-12">
          <p className="text-xs uppercase tracking-widest text-[#22C55E]">
            Guide • Customer Experience
          </p>
          <h1 className="mt-3 text-3xl md:text-4xl font-semibold text-white leading-tight">
            What is Net Promoter Score (NPS)?
          </h1>
          <p className="mt-4 text-slate-300 max-w-2xl">
            A practical explanation of how NPS works, where it is useful, where it can go wrong,
            and how to use it as a starting point for real customer improvement rather than
            just a number on a dashboard.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-4xl px-6 py-10 space-y-10 text-slate-300">
        {/* Core question */}
        <article className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-white">
            The core NPS question
          </h2>
          <p className="mt-4">
            Net Promoter Score is built around one simple question:
          </p>
          <p className="mt-3 text-lg text-white font-medium">
            “How likely are you to recommend [company] to a friend or colleague?”
          </p>
          <p className="mt-4">
            Respondents answer on a 0 to 10 scale, where 0 means “not at all likely”
            and 10 means “extremely likely”. What matters is not the average, but
            how people are grouped.
          </p>

          <div className="mt-6 rounded-2xl bg-black/30 border border-white/10 p-5 text-sm">
            <div className="font-semibold text-white">Three groups</div>
            <div className="mt-3 grid gap-4 md:grid-cols-3">
              <div>
                <div className="text-[#ef4444] font-semibold">Detractors (0–6)</div>
                <p className="mt-1 text-xs text-slate-300">
                  At risk, unhappy, or blocked. More likely to churn, complain, or warn others.
                </p>
              </div>
              <div>
                <div className="text-[#f97316] font-semibold">Passives (7–8)</div>
                <p className="mt-1 text-xs text-slate-300">
                  Reasonably satisfied but not enthusiastic. Could be tempted by a competitor.
                </p>
              </div>
              <div>
                <div className="text-[#22C55E] font-semibold">Promoters (9–10)</div>
                <p className="mt-1 text-xs text-slate-300">
                  Loyal advocates who are more likely to stay, expand, and recommend you.
                </p>
              </div>
            </div>
          </div>
        </article>

        {/* Calculation */}
        <article className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-white">
            How Net Promoter Score is calculated
          </h2>
          <p className="mt-4">
            The NPS formula is intentionally simple. For a given sample of responses:
          </p>
          <ol className="mt-3 list-decimal list-inside space-y-2 text-sm">
            <li>Work out the percentage of Promoters (9–10).</li>
            <li>Work out the percentage of Detractors (0–6).</li>
            <li>Subtract Detractors from Promoters.</li>
          </ol>
          <p className="mt-4 text-sm">
            For example, if 60 percent of respondents are Promoters and 20 percent are Detractors,
            your NPS is <span className="text-white font-semibold">+40</span>.
          </p>

          <div className="mt-6">
            <div className="text-xs uppercase tracking-wider text-slate-400">
              NPS scale illustration
            </div>

            {/* The main NPS bar */}
            <div className="mt-2 flex text-[11px] font-medium text-slate-300">
              {/* Detractors (0–6) */}
              <div className="flex-[7] bg-[#ef4444] rounded-l-2xl py-2 text-center">
                Detractors
              </div>
              {/* Passives (7–8) */}
              <div className="flex-[2] bg-[#f97316] py-2 text-center">
                Passives
              </div>
              {/* Promoters (9–10) */}
              <div className="flex-[2] bg-[#22C55E] rounded-r-2xl py-2 text-center">
                Promoters
              </div>
            </div>

            {/* Scale numbers 0–10 */}
            <div className="mt-2 flex justify-between text-[11px] text-slate-400 font-mono">
              {[...Array(11).keys()].map((num) => (
                <span key={num}>{num}</span>
              ))}
            </div>
          </div>
        </article>

        {/* Relationship vs transactional */}
        <article className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-white">
            Relationship NPS and transactional NPS
          </h2>
          <p className="mt-4 text-sm">
            NPS is not a single thing. The same question behaves differently depending on
            when you ask it and what just happened to the customer.
          </p>
          <div className="mt-4 grid gap-6 md:grid-cols-2 text-sm">
            <div className="rounded-2xl bg-black/30 border border-white/10 p-4">
              <div className="text-white font-semibold">Relationship NPS</div>
              <p className="mt-2 text-slate-300">
                Sent periodically to a sample of customers to understand overall brand sentiment.
                This is the number that often appears on executive dashboards.
              </p>
              <ul className="mt-3 list-disc list-inside space-y-1 text-xs text-slate-300">
                <li>Good for tracking overall direction over time.</li>
                <li>Not great at highlighting exactly what is broken.</li>
              </ul>
            </div>
            <div className="rounded-2xl bg-black/30 border border-white/10 p-4">
              <div className="text-white font-semibold">Transactional or milestone NPS</div>
              <p className="mt-2 text-slate-300">
                Sent after key journey moments, such as onboarding, first delivery, renewal,
                or support closure.
              </p>
              <ul className="mt-3 list-disc list-inside space-y-1 text-xs text-slate-300">
                <li>Pinpoints where the experience creates friction.</li>
                <li>Much more useful for guiding concrete improvements.</li>
              </ul>
            </div>
          </div>
        </article>

        {/* Beyond the score */}
        <article className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-white">
            Beyond the score: why comments matter more than the number
          </h2>
          <p className="mt-4 text-sm">
            A common criticism of NPS is that one number cannot capture the quality of a business.
            That is true. A single score on its own is a very crude signal. It is also shaped
            by culture and context.
          </p>
          <p className="mt-3 text-sm">
            Someone in one country may see a 7 out of 10 as a good mark. In another market,
            anything below a 9 looks mediocre. In some cultures people avoid giving 10 unless
            everything really is perfect. In others, giving a 10 is simply a polite way to say
            that things were fine.
          </p>
          <p className="mt-3 text-sm">
            This is why the open comment that sits next to the NPS question is so important.
            The comment tells you what is driving the score. It points to specific friction,
            specific delights, and real language that you can share internally.
          </p>
          <ul className="mt-4 list-disc list-inside space-y-2 text-sm">
            <li>Use NPS as a routing tool to the comments, not as the whole story.</li>
            <li>Read what Detractors are saying first, then look at Promoters.</li>
            <li>Look for patterns in language, not just changes of two or three points.</li>
          </ul>
        </article>

        {/* Pitfalls and good practice */}
        <article className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-white">
            Common pitfalls and how to avoid them
          </h2>
          <div className="mt-4 grid gap-6 md:grid-cols-2 text-sm">
            <div>
              <div className="font-semibold text-white">Pitfalls</div>
              <ul className="mt-3 list-disc list-inside space-y-2">
                <li>Focusing only on the headline score and ignoring underlying comments.</li>
                <li>Letting teams control who is invited to respond, which introduces bias.</li>
                <li>Over-surveying the same contacts and creating fatigue.</li>
                <li>Coaching customers to “give us a 9 or 10” instead of asking for honest feedback.</li>
              </ul>
            </div>
            <div>
              <div className="font-semibold text-white">Better practice</div>
              <ul className="mt-3 list-disc list-inside space-y-2">
                <li>Use transparent, representative sampling rules.</li>
                <li>Track NPS alongside retention, repeat purchase, and support volume.</li>
                <li>Publish regular internal summaries that explain what customers are saying.</li>
                <li>Reward teams for fixing root causes, not for pushing the score up at all costs.</li>
              </ul>
            </div>
          </div>
        </article>

        {/* Closing the loop */}
        <article className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-white">
            Making NPS useful: close the loop and show progress
          </h2>
          <p className="mt-4 text-sm">
            The value of NPS comes from what you do with it. The companies that see the most
            impact treat surveys as the start of a conversation, not the end.
          </p>
          <ul className="mt-3 list-disc list-inside space-y-2 text-sm">
            <li>Follow up with customers who raise issues, especially high value accounts.</li>
            <li>Group comments into themes that map to real processes and owners.</li>
            <li>Agree a small number of fixes, ship them, and track the effect on both NPS and hard outcomes.</li>
            <li>Share simple “you said, we did” updates so customers can see that speaking up is worth it.</li>
          </ul>
          <p className="mt-3 text-sm">
            Over time this builds trust. Customers see that feedback leads to change, teams see
            that insight leads to better results, and the NPS score becomes one useful signal
            in a wider customer health picture.
          </p>
        </article>

        {/* CTA */}
        <article className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#141B2E] to-[#0F172A] p-8 text-center">
          <h2 className="text-2xl font-semibold text-white">
            Want help designing an NPS program that actually drives change?
          </h2>
          <p className="mt-3 text-sm text-slate-300 max-w-2xl mx-auto">
            NPS Me works with teams to design fair surveys, realistic sampling,
            and practical follow-up so that every point of feedback has somewhere to go.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/products"
              className="rounded-2xl px-6 py-3 text-sm font-semibold bg-[#7C3AED] hover:bg-[#6D28D9] transition"
            >
              Explore services
            </Link>
            <a
              href="/#contact"
              className="rounded-2xl px-6 py-3 text-sm font-semibold bg-[#22C55E] text-[#0B0F19] hover:bg-[#16A34A] transition"
            >
              Book a discovery call
            </a>
          </div>
          <p className="mt-8 text-[11px] leading-relaxed text-slate-500">
            NPS and Net Promoter Score are registered service marks of Bain &amp; Company, Inc.,
            Fred Reichheld, and Satmetrix Systems, Inc. References on this page are descriptive only.
            NPS Me is independent and not affiliated with or endorsed by those parties.
          </p>
        </article>
      </section>
    </div>
  );
}
