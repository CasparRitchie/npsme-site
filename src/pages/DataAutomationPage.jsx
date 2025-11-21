// src/DataAutomationPage.jsx
import React from "react";
import { Link } from "react-router-dom";
import { Database, Link2, Workflow, BarChart3, Clock, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";
import Seo from "../components/Seo";
import PageHeader from "../components/PageHeader";


export default function DataAutomationPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B0F19] via-[#0C1224] to-[#0B0F19] text-slate-200">
      <Seo
        path="/data-automation"
        title="Data, Automation & Insight — Transform Your Reporting | NPS Me"
        description="How NPS Me helps teams clean up messy data, connect systems, and automate reporting so people spend less time in spreadsheets and more time improving customer experience."
      />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="pointer-events-none absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_20%_20%,#7C3AED_0%,transparent_35%),radial-gradient(circle_at_80%_30%,#22C55E_0%,transparent_25%)]" />
        <div className="relative mx-auto max-w-7xl px-6 py-12">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#22C55E]" />
            <p className="text-xs tracking-widest text-[#22C55E] uppercase">
              Data, automation & insight
            </p>
          </div>

          <h1 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight text-white max-w-3xl">
            Your data should work for you, not the other way around
          </h1>

          <p className="mt-4 max-w-2xl text-slate-300 text-sm md:text-base">
            We help you connect, clean and automate your customer and operational data
            so teams spend less time wrangling spreadsheets and more time improving
            customer experience, revenue and retention.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Link
              to="/book"
              className="inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold bg-[#22C55E] text-[#0B0F19] hover:bg-[#16A34A] transition"
            >
              Book a discovery call
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/impact"
              className="inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold bg-[#7C3AED] hover:bg-[#6D28D9] transition"
            >
              Explore impact calculator
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <p className="mt-4 text-xs text-slate-400 max-w-xl">
            NPS Me combines CX, data and engineering skills in one place. No army of juniors,
            no eight–week slide decks. Just practical changes that free your people from manual
            reporting and make it obvious where to act.
          </p>
        </div>
      </section>

      {/* The problem */}
      <section className="mx-auto max-w-7xl px-6 py-12 grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="text-2xl font-semibold text-white">
            When data is messy, decisions slow down
          </h2>
          <p className="mt-3 text-sm md:text-base text-slate-300">
            Most teams are not short of data. They are short of time, trust and a clear view
            of what the numbers are saying. Common patterns we see:
          </p>

          <ul className="mt-4 space-y-3 text-sm text-slate-300">
            <li className="flex gap-2">
              <AlertCircle className="mt-0.5 h-4 w-4 text-amber-400" />
              <span>Ten dashboards, zero decisions because no one trusts which view is right.</span>
            </li>
            <li className="flex gap-2">
              <Clock className="mt-0.5 h-4 w-4 text-slate-400" />
              <span>Analysts exporting the same CSVs every week to rebuild the same reports.</span>
            </li>
            <li className="flex gap-2">
              <BarChart3 className="mt-0.5 h-4 w-4 text-slate-400" />
              <span>No clear link between NPS, churn and actual revenue outcomes.</span>
            </li>
            <li className="flex gap-2">
              <Database className="mt-0.5 h-4 w-4 text-slate-400" />
              <span>Different teams maintain their own spreadsheets and definitions of “the truth”.</span>
            </li>
          </ul>

          <p className="mt-4 text-sm text-slate-300">
            It is not that people do not care about data. It is that systems do not talk to each
            other and no one has the time or remit to untangle it.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <h3 className="text-sm font-semibold text-white">
            What we hear from leaders
          </h3>
          <p className="mt-3 text-sm text-slate-300 italic">
            “We have survey tools, CRM, support systems and product analytics, but I still cannot
            get a simple, joined up view of what customers are telling us and what it costs us
            if we ignore it.”
          </p>
          <p className="mt-3 text-sm text-slate-300 italic">
            “Every quarter we rebuild the same analysis from scratch instead of improving the
            underlying data flows.”
          </p>
          <p className="mt-4 text-xs text-slate-400">
            NPS Me exists to close that gap. We come from CX, operations and data backgrounds,
            which means we are as comfortable in SQL and APIs as we are in stakeholder workshops.
          </p>
        </div>
      </section>

      {/* What we actually do */}
      <section className="mx-auto max-w-7xl px-6 pb-12">
        <h2 className="text-2xl font-semibold text-white">How we help your data work harder</h2>
        <p className="mt-3 max-w-3xl text-sm md:text-base text-slate-300">
          We do not just recommend new tools. We work with what you already have, connect the
          right tables, build light automation and leave you with assets your team can run
          without us.
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#22C55E] flex items-center justify-center">
                <Link2 className="h-4 w-4 text-white" />
              </div>
              <h3 className="text-sm font-semibold text-white">Unify your data</h3>
            </div>
            <p className="mt-3 text-sm text-slate-300">
              Merge CRM, survey, support and billing data into a usable view. Clear keys,
              repeatable joins and definitions that Finance, CX and Ops can agree on.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#22C55E] flex items-center justify-center">
                <Workflow className="h-4 w-4 text-white" />
              </div>
              <h3 className="text-sm font-semibold text-white">Automate reporting</h3>
            </div>
            <p className="mt-3 text-sm text-slate-300">
              Replace manual exports with scripts and APIs that refresh dashboards on a schedule.
              Less copy–paste, fewer errors, more time to interpret what the numbers mean.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#22C55E] flex items-center justify-center">
                <BarChart3 className="h-4 w-4 text-white" />
              </div>
              <h3 className="text-sm font-semibold text-white">Build insight layers</h3>
            </div>
            <p className="mt-3 text-sm text-slate-300">
              Tie NPS and CSAT to churn, repeat purchase and support cost. Identify which themes
              actually move revenue, not just the score.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#22C55E] flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4 text-white" />
              </div>
              <h3 className="text-sm font-semibold text-white">Upskill your team</h3>
            </div>
            <p className="mt-3 text-sm text-slate-300">
              We sit with your analysts, product managers and CX leaders to make sure they can
              read, question and use the new views without needing a consultant in the room.
            </p>
          </div>
        </div>

        <div className="mt-8 text-sm text-slate-300 max-w-3xl">
          <p>
            Because we also design surveys, journeys and internal processes, we can go further
            than a typical reporting project. We do not stop at “here is your dashboard”. We
            help you plug those insights back into scripts, playbooks, SLAs and product changes.
          </p>
        </div>
      </section>

      {/* Outcomes */}
      <section className="mx-auto max-w-7xl px-6 pb-12">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8 grid gap-8 md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-semibold text-white">What this changes in practice</h2>
            <p className="mt-3 text-sm md:text-base text-slate-300">
              You do not need another giant consulting project. You need a cleaner, more honest
              picture of what is going on and simple ways to act on it every week.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-slate-300">
              <li className="flex gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-[#22C55E]" />
                <span>Faster time from “something looks wrong” to “we know what to fix”.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-[#22C55E]" />
                <span>Reduced manual reporting hours without adding another headcount.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-[#22C55E]" />
                <span>Fewer surprises between CX, Finance and Exec teams when numbers are challenged.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-[#22C55E]" />
                <span>Clear link between customer sentiment, operational friction and financial impact.</span>
              </li>
            </ul>
          </div>

          <div className="space-y-4 text-sm text-slate-300">
            <p>
              In previous roles and client work, we have seen simple automation and better joins
              unlock more value than a brand new tool ever could. Things like:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Joining NPS verbatims to refund and ticket data to size the real cost of problems.</li>
              <li>Automating weekly CX packs that used to take several hours of copy–paste work.</li>
              <li>Feeding “you said, we did” themes straight from analysis into internal comms.</li>
            </ul>
            <p className="text-xs text-slate-400">
              These are not off–the–shelf products. They are tailored to your stack and maturity,
              and built to be maintained by your own team rather than a long term external dependency.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 pb-16">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#141B2E] to-[#0F172A] p-8 md:p-10 text-center">
          <h2 className="text-2xl md:text-3xl font-semibold text-white">
            Most companies do not need more dashboards. They need better data.
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-sm md:text-base text-slate-300">
            If your teams are drowning in exports and still arguing about whose numbers are right,
            we can help you tidy the foundations and automate the boring parts so you can focus
            on customers again.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/book"
              className="inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3 text-sm font-semibold bg-[#22C55E] text-[#0B0F19] hover:bg-[#16A34A] transition"
            >
              Book a discovery call
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/products"
              className="inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3 text-sm font-semibold bg-[#7C3AED] hover:bg-[#6D28D9] transition"
            >
              View productized services
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <p className="mt-4 text-xs text-slate-400">
            NPS Me is independent and works alongside your existing partners, tools and teams.
          </p>
        </div>
      </section>
    </div>
  );
}
