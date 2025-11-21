// src/pages/WhyNpsMe.jsx
import React from "react";
import { Link } from "react-router-dom";
import Seo from "../components/Seo";
import { CheckCircle2, ArrowRight, LineChart, Users, Wrench } from "lucide-react";
import PageHeader from "../components/PageHeader";


export default function WhyNpsMe() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B0F19] via-[#0C1224] to-[#0B0F19] text-slate-200">
      <Seo
        path="/why-nps-me"
        title="Why NPS Me: Pragmatic CX consulting for real business impact"
        description="NPS Me helps you turn customer feedback into measurable outcomes: higher retention, more repeat revenue, and lower support costs, without big-consultancy overhead."
      />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="pointer-events-none absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_20%_20%,#7C3AED_0%,transparent_35%),radial-gradient(circle_at_80%_30%,#22C55E_0%,transparent_25%)]" />
        <div className="mx-auto max-w-7xl px-6 py-12 relative">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#22C55E]" />
            <p className="text-xs uppercase tracking-widest text-[#22C55E]">
              Why NPS Me
            </p>
          </div>
          <h1 className="mt-2 text-3xl md:text-4xl font-semibold tracking-tight text-white">
            CX consulting that connects feedback to the bottom line
          </h1>
          <p className="mt-4 max-w-2xl text-slate-300">
            NPS Me exists to bridge a gap. Many teams collect NPS and survey data. Fewer turn it
            into fewer churn events, more repeat revenue, and less firefighting in support.
            We help you do that, quickly, without a huge consulting army on your payroll.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Link
              to="/book"
              className="inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-semibold bg-[#22C55E] text-[#0B0F19] hover:bg-[#16A34A] transition"
            >
              Book a discovery call
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="/#demo"
              className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white"
            >
              Try the NPS style demo
            </a>
          </div>
        </div>
      </section>

      {/* What we actually do */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <h2 className="text-2xl md:text-3xl font-semibold text-white">
          What you get when you work with NPS Me
        </h2>
        <p className="mt-3 max-w-3xl text-slate-300">
          We combine CX strategy, data analysis, and hands on enablement. That means we do not only
          tell you where the problems are. We help fix them with you. That can include survey design,
          review mining, workflow changes, scripts, training, dashboards, and even changes to your
          digital journeys and internal tools.
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <ValueCard
            icon={LineChart}
            title="From feedback to P and L"
            points={[
              "Tie customer feedback to repeat rate, churn, and ticket volume.",
              "Prioritise changes by commercial impact, not loudest voice.",
              "Make it easy for Finance and CX to speak the same language.",
            ]}
          />
          <ValueCard
            icon={Users}
            title="Practical help for your teams"
            points={[
              "Coaching for account, support, and product teams.",
              "Templates, playbooks, and scripts that fit your tone of voice.",
              "Support to embed new routines, not just one off workshops.",
            ]}
          />
          <ValueCard
            icon={Wrench}
            title="Systems and journeys that work"
            points={[
              "Help to tune surveys, journeys, forms, and messaging.",
              "Partner with your product or IT teams on small but high impact changes.",
              "Make better use of the tools you already own before buying new ones.",
            ]}
          />
        </div>
      </section>

      {/* NPS Me vs big consultancy */}
      <section className="mx-auto max-w-7xl px-6 pb-12">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-white">
            Why choose us instead of a big consulting firm
          </h2>
          <p className="mt-3 text-slate-300 max-w-3xl">
            Large audit and consulting firms can do great work, but they also come with high
            overhead, long lead times, and a lot of people in the room. NPS Me is built to be
            lean, expert, and focused on movement, not theatre.
          </p>

          <div className="mt-6 grid gap-6 md:grid-cols-2 text-sm">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
              <h3 className="text-sm font-semibold text-slate-200 mb-2">
                Typical big consultancy
              </h3>
              <ul className="space-y-2 text-slate-300">
                <li>Layers of partners, directors, and juniors on projects.</li>
                <li>Set piece reports and frameworks that may not fit your reality.</li>
                <li>High day rates and long commitments before you see value.</li>
                <li>Focus on the slide deck more than on your teams changing how they work.</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-[#22C55E]/40 bg-gradient-to-br from-[#141B2E] to-[#0F172A] p-5">
              <h3 className="text-sm font-semibold text-slate-50 mb-2">NPS Me approach</h3>
              <ul className="space-y-2 text-slate-200">
                <li>Direct access to an experienced CX lead, not a revolving junior team.</li>
                <li>Work shaped around your existing tools and data, not a generic template.</li>
                <li>Transparent, scoped engagements that respect your budget.</li>
                <li>Hands on support for implementation, not just recommendations.</li>
              </ul>
            </div>
          </div>

          <p className="mt-6 text-xs text-slate-400">
            NPS Me is part of the cxms.fr group, which combines customer experience expertise with
            practical digital and data skills. That means we can help you both understand the story
            in your feedback and build the processes, content, and journeys that move the numbers.
          </p>
        </div>
      </section>

      {/* Proof points / reassurance */}
      <section className="mx-auto max-w-7xl px-6 pb-16">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-white">
            How working with us feels
          </h2>
          <div className="mt-5 grid gap-6 md:grid-cols-3 text-sm">
            {[
              "Clear framing of the problem and what success looks like.",
              "Regular, honest check ins. No hiding behind jargon.",
              "Simple artefacts your teams actually read and use.",
              "Respect for your constraints, culture, and in house expertise.",
              "A focus on sustainable change, not one quarter spikes.",
              "A partner who can speak to execs and practitioners in the same week.",
            ].map((item) => (
              <div key={item} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-[#22C55E]" />
                <span className="text-slate-300">{item}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/products"
              className="rounded-2xl px-6 py-3 text-sm font-semibold bg-[#7C3AED] hover:bg-[#6D28D9] transition inline-flex items-center justify-center gap-2"
            >
              Explore productized services
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/book"
              className="rounded-2xl px-6 py-3 text-sm font-semibold bg-[#22C55E] text-[#0B0F19] hover:bg-[#16A34A] transition inline-flex items-center justify-center gap-2"
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

function ValueCard({ icon: Icon, title, points }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#22C55E] flex items-center justify-center">
          <Icon className="h-5 w-5 text-white" />
        </div>
        <h3 className="font-semibold text-white">{title}</h3>
      </div>
      <ul className="mt-3 space-y-2 text-sm text-slate-300 list-disc pl-5">
        {points.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>
    </div>
  );
}
