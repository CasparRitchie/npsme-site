// src/pages/BlogWhyNpsIsntImproving.jsx
import React from "react";
import { Link } from "react-router-dom";
import Seo from "../components/Seo";
import PageHeader from "../components/PageHeader";

export default function BlogWhyNpsIsntImproving() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B0F19] via-[#0C1224] to-[#0B0F19] text-slate-200">
      <Seo
        path="/blog/why-nps-isnt-improving"
        title="Why Your NPS Isn't Improving - Even When Your CX Looks Better | NPS Me"
        description="A practical guide to understanding flat NPS, invisible friction, sampling drift, and what to fix first when scores won't move."
      />

      {/* Shared blog hero */}
      <PageHeader
        iconLabel="Understanding NPS and CX"
        tag="CX & NPS / Blog"
        title="Why your NPS isn't improving - even when your CX looks better"
        subtitle="A practical guide to understanding flat NPS, invisible friction, sampling drift, and what to fix first when scores won't move."
      />

      {/* Content */}
      <section className="mx-auto max-w-3xl px-6 py-12">
        <div className="space-y-8 text-slate-300 leading-relaxed">
          <p>
            In every company there comes a moment where the team genuinely feels things have improved -
            fewer complaints, better onboarding, cleaner support flow - and yet the{" "}
            <span className="font-semibold text-slate-100">NPS score refuses to move.</span>
          </p>

          <p>
            It's frustrating. Demoralising. And it usually sparks a round of “Maybe NPS is just broken”
            conversations internally.
          </p>

          <p>
            But it's not. Flat NPS is almost always a <em>signal</em> - just not the one you think.
          </p>

          <p>Here's why.</p>

          {/* 1. Improvements happened… */}
          <h2 className="text-xl font-semibold text-white mt-8">
            1. Improvements happened… but only for some customers
          </h2>
          <p>
            Most teams fix friction <em>where it's loudest</em>:
          </p>
          <ul className="mt-3 list-disc list-inside space-y-1">
            <li>a support backlog</li>
            <li>complaints about delivery</li>
            <li>onboarding confusion</li>
            <li>a clunky checkout step</li>
          </ul>
          <p className="mt-3">
            These fixes help a subset of customers, often the ones already leaning towards “Passive”.
          </p>
          <p>
            But if the customers who are giving the{" "}
            <span className="font-semibold text-slate-100">0–6 scores</span> aren't experiencing that
            improvement - or worse, they're still stuck in slow, high-friction processes - NPS barely
            moves.
          </p>
          <p className="mt-2">
            <span className="font-semibold text-slate-100">
              NPS is weighted by your worst experience, not your best.
            </span>{" "}
            Detractors pull harder than Promoters lift.
          </p>

          {/* 2. Expectations */}
          <h2 className="text-xl font-semibold text-white mt-8">
            2. You improved processes - but didn't improve expectations
          </h2>
          <p>
            One of the biggest hidden blockers:
          </p>
          <p className="mt-2 italic text-slate-400">
            Customers judge you based on what they <span className="not-italic">think</span> should happen,
            not what actually happened.
          </p>
          <p className="mt-3">
            Improving the operations without improving the <em>promise</em> often creates flat NPS because
            expectations drag sentiment down even when delivery is solid.
          </p>
          <p className="mt-3">
            Classic pattern:
          </p>
          <ul className="mt-2 list-disc list-inside space-y-1">
            <li>Onboarding got faster → great</li>
            <li>Communication didn't change → customer still feels lost</li>
            <li>NPS: unchanged</li>
          </ul>
          <p className="mt-3">
            If expectations stay vague, NPS stays flat.
          </p>

          {/* 3. Close the loop */}
          <h2 className="text-xl font-semibold text-white mt-8">
            3. You reduced friction - but didn't close the loop
          </h2>
          <p>
            Customers don't magically know you fixed the thing they complained about.
          </p>
          <p className="mt-3">
            Teams often launch improvements quietly, thinking “customers will notice”.
          </p>
          <p>They don't.</p>
          <p className="mt-3">
            <span className="font-semibold text-slate-100">
              Closing the loop creates perceived improvement
            </span>
            , which is what moves NPS:
          </p>
          <ul className="mt-2 list-disc list-inside space-y-1">
            <li>“We heard you.”</li>
            <li>“We've changed X.”</li>
            <li>“It now works like this.”</li>
          </ul>
          <p className="mt-3">
            A 30-second email can do more for NPS than a 3-month engineering project.
          </p>

          {/* 4. Sample drift */}
          <h2 className="text-xl font-semibold text-white mt-8">
            4. Sample drift is disguising real improvement
          </h2>
          <p>
            This is the most common hidden reason.
          </p>
          <p className="mt-3">
            If the mix of people you're surveying changes - even slightly - your NPS will behave strangely.
          </p>
          <p className="mt-3">Examples:</p>
          <ul className="mt-2 list-disc list-inside space-y-1">
            <li>Your most frustrated segment now makes up more of the sample.</li>
            <li>New customers respond more than long-term ones.</li>
            <li>Support-triggered surveys skew the mix.</li>
            <li>A change in CRM logic suddenly excludes “happy” segments.</li>
          </ul>
          <p className="mt-3">
            The underlying experience <em>has</em> improved, but the surveyed set has shifted in the opposite
            direction.
          </p>
          <p className="mt-3">
            <span className="font-semibold text-slate-100">
              If sampling isn't stable and representative, NPS becomes a weather report, not a trend.
            </span>
          </p>

          {/* 5. Promoters */}
          <h2 className="text-xl font-semibold text-white mt-8">
            5. Promoters don't score higher - they just complain less
          </h2>
          <p>
            This one surprises people.
          </p>
          <p className="mt-3">
            Often you fix friction → customers feel happier → they stop complaining.
          </p>
          <p>
            But they also don't suddenly become raving fans.
          </p>
          <p className="mt-3">
            Moving someone from 6 → 7 is good for churn and support effort, but it does nothing for NPS
            (both are non-Promoter).
          </p>
          <p className="mt-3">
            This creates “silent success”:
          </p>
          <ul className="mt-2 list-disc list-inside space-y-1">
            <li>fewer refunds</li>
            <li>fewer escalations</li>
            <li>better sentiment</li>
            <li>NPS unchanged</li>
          </ul>
          <p className="mt-3">
            The business improves - but NPS doesn't reflect it until you cross a threshold.
          </p>

          {/* 6. Symptom vs cause */}
          <h2 className="text-xl font-semibold text-white mt-8">
            6. You fixed the symptom, not the cause
          </h2>
          <p>
            Teams often fix visible problems:
          </p>
          <ul className="mt-2 list-disc list-inside space-y-1">
            <li>slow replies</li>
            <li>confusing emails</li>
            <li>high contact rates</li>
          </ul>
          <p className="mt-3">
            But the root cause lives deeper:
          </p>
          <ul className="mt-2 list-disc list-inside space-y-1">
            <li>unclear SLAs</li>
            <li>broken internal tools</li>
            <li>mismatched pricing vs value</li>
            <li>internal KPIs incentivising speed, not clarity</li>
          </ul>
          <p className="mt-3">
            Unless you fix the origin, you get short-term uplift… and then everything plateaus again.
          </p>
          <p className="mt-3">
            <span className="font-semibold text-slate-100">
              NPS is a system score - not a quick-win score.
            </span>
          </p>

          {/* 7. Expectations rising */}
          <h2 className="text-xl font-semibold text-white mt-8">
            7. Customers' expectations rose faster than your improvements
          </h2>
          <p>
            This is the paradox of CX:
          </p>
          <p className="mt-2 italic text-slate-400">
            When you improve something, customers expect even more.
          </p>
          <p className="mt-3">
            It's why Amazon improves delivery speed and still gets complaints.
          </p>
          <p className="mt-3">
            Your “big wins” quickly become “base expectations”.
          </p>
          <p className="mt-3">
            So the NPS line stays flat while the bar keeps rising.
          </p>
          <p className="mt-3">
            Flat NPS doesn't always mean “no progress”. Sometimes it means{" "}
            <span className="font-semibold text-slate-100">
              progress was absorbed into baseline.
            </span>
          </p>

          {/* What actually moves NPS */}
          <h2 className="text-xl font-semibold text-white mt-10">
            So what actually moves NPS?
          </h2>
          <ul className="mt-3 list-disc list-inside space-y-2">
            <li>Fixing friction at the root, not just the symptom.</li>
            <li>Clear, proactive expectation setting.</li>
            <li>Representative, stable sampling.</li>
            <li>Real close-the-loop routines, not boilerplate.</li>
            <li>Improvements that reach Detractors, not just Passives.</li>
            <li>Cross-functional fixes across Product, CX, Ops and Support.</li>
            <li>Repeated communication so people can feel the change.</li>
          </ul>

          {/* Simple test */}
          <h2 className="text-xl font-semibold text-white mt-10">
            A simple test: did we reduce annoyances, or improve the journey?
          </h2>
          <p className="mt-3">
            Reducing annoyances <span className="italic">stabilises</span> NPS.
          </p>
          <p>
            Improving the journey <span className="italic">lifts</span> NPS.
          </p>
          <p className="mt-3">
            Most teams spend 90% of their time on the first.
          </p>
          <p>
            Your NPS is telling you which you've done.
          </p>
        </div>

        {/* CTA footer */}
        <div className="mt-12 pt-6 border-t border-white/10 text-center">
          <p className="text-slate-400 text-sm">
            If your NPS feels stuck even though your teams are working hard, we can help you diagnose what's really going on.
          </p>
          <div className="mt-4 flex flex-col sm:flex-row justify-center gap-3">
            <Link
              to="/products"
              className="rounded-2xl px-6 py-3 text-sm font-semibold bg-[#7C3AED] hover:bg-[#6D28D9] transition"
            >
              Explore NPS Me services
            </Link>
            <Link
              to="/book"
              className="rounded-2xl px-6 py-3 text-sm font-semibold bg-[#22C55E] text-[#0B0F19] hover:bg-[#16A34A] transition"
            >
              Book a discovery call
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
