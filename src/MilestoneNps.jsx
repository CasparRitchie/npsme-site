// src/MilestoneNps.jsx
import React from "react";
import { Star, LineChart, Wrench, Gauge, ClipboardList, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import Seo from "./components/Seo";
import PageHeader from "../components/PageHeader";


export default function MilestoneNps() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B0F19] via-[#0C1224] to-[#0B0F19] text-slate-200">
      <Seo
        path="/milestone-nps"
        title="Milestone (Transactional) NPS® & Survey Signals | NPS Me"
        description="Capture customer sentiment at key journey moments to reveal friction in context. Implement close-the-loop and theme tracking for actionable CX."
      />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="pointer-events-none absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_20%_20%,#7C3AED_0%,transparent_35%),radial-gradient(circle_at_80%_30%,#22C55E_0%,transparent_25%)]" />
        <div className="mx-auto max-w-7xl px-6 pt-16 pb-12">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#22C55E]" />
            <p className="text-xs uppercase tracking-widest text-[#22C55E]">
              Milestone / transactional NPS
            </p>
          </div>

          <h1 className="mt-3 text-3xl sm:text-4xl md:text-5xl leading-tight font-semibold tracking-tight text-white">
            Milestone (Transactional) NPS &amp; Survey Signals
          </h1>
          <p className="mt-4 text-slate-300 max-w-3xl">
            A practical framework to capture feedback at key journey moments, turn it into
            prioritised work, and measure lift. We reference Net Promoter Score (NPS)®
            descriptively alongside CSAT, CES and behavioral data.
          </p>
          <div className="mt-6 flex gap-3">
            <Link
              to="/impact"
              className="inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold bg-[#22C55E] text-[#0B0F19] hover:bg-[#16A34A] transition"
            >
              Estimate your impact
            </Link>
            <a
              href="/#contact"
              className="inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold bg-[#7C3AED] hover:bg-[#6D28D9] transition"
            >
              Book discovery
            </a>
          </div>
        </div>
      </section>

      {/* 4-Stage method */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="max-w-2xl">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-white">
            The 4-stage method (simple, repeatable)
          </h2>
          <p className="mt-3 text-slate-300">
            Clear steps, fast wins, and compounding improvements. We meet you where you are and
            prioritise what moves the needle.
          </p>
        </div>

        <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: "1) Discovery", icon: Star, desc: "Audit reviews, surveys, tickets and flows. Map friction. Establish baseline metrics." },
            { title: "2) Recommend", icon: LineChart, desc: "Prioritised playbook with owners, effort/impact scores and timelines." },
            { title: "3) Implement", icon: Wrench, desc: "Hands-on enablement: scripts, templates, automation, training. Unblock fast." },
            { title: "4) Monitor", icon: Gauge, desc: "Track NPS/CSAT/CES & review velocity. Iterate monthly. Celebrate and scale wins." },
          ].map((card) => (
            <div key={card.title} className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#22C55E] flex items-center justify-center">
                  <card.icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-semibold text-white">{card.title}</h3>
              </div>
              <p className="mt-3 text-sm text-slate-300">{card.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Where milestone surveys fit */}
      <section className="mx-auto max-w-7xl px-6 pb-12">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
          <h3 className="text-xl md:text-2xl font-semibold text-white">Where milestone surveys fit</h3>
          <div className="mt-4 grid gap-6 md:grid-cols-3">
            {[
              {
                title: "Order placed",
                q: "Based on your ordering experience, how likely are you to recommend us (0–10)?",
                why: "Test checkout clarity, pricing transparency and payment reliability."
              },
              {
                title: "Onboarding finished",
                q: "After onboarding, how likely are you to recommend us (0–10)?",
                why: "Gauge setup friction, documentation gaps, enablement quality."
              },
              {
                title: "First delivery/use",
                q: "After your first delivery/use, how likely are you to recommend us (0–10)?",
                why: "Reveal fulfilment speed/accuracy, product readiness, first-use UX."
              },
            ].map((card) => (
              <div key={card.title} className="rounded-2xl border border-white/10 bg-black/20 p-5">
                <div className="text-white font-semibold">{card.title}</div>
                <div className="mt-2 text-sm text-slate-200">{card.q}</div>
                <div className="mt-2 text-xs text-slate-400">{card.why}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Implementation checklist + What we track */}
      <section className="mx-auto max-w-7xl px-6 pb-16">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-6">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-white" />
              <h4 className="text-white font-semibold">Implementation in 5 steps</h4>
            </div>
            <ol className="mt-3 space-y-2 list-decimal pl-5 text-sm text-slate-300">
              <li>Map milestones (checkout, onboarding, first value, renewal, support closure).</li>
              <li>Trigger surveys via your existing stack (ESP, product, helpdesk, CDP).</li>
              <li>Ask 0–10 + one open text; keep it short.</li>
              <li>Pipe results into a central view and tag by milestone.</li>
              <li>Close the loop and run monthly root-cause reviews.</li>
            </ol>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-6">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-white" />
              <h4 className="text-white font-semibold">What we track</h4>
            </div>
            <ul className="mt-3 space-y-2 list-disc pl-5 text-sm text-slate-300">
              <li>Score distribution by milestone (Promoters/Passives/Detractors).</li>
              <li>Themes by frequency & impact (effort vs. volume).</li>
              <li>Time-to-contact & close-the-loop rates.</li>
              <li>Downstream effects (repeat tickets, churn risk, review velocity).</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
