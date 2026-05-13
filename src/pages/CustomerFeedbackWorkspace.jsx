// src/pages/CustomerFeedbackWorkspace.jsx
import React from "react";
import { Link } from "react-router-dom";
import Seo from "../components/Seo";
import PageHeader from "../components/PageHeader";

export default function CustomerFeedbackWorkspace() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B0F19] via-[#0C1224] to-[#0B0F19] text-slate-200">
      <Seo
        path="/customer-feedback-workspace"
        title="Customer Feedback Workspace for Startups & SMEs | NPS Me"
        description="A private customer feedback workspace for importing NPS data, analysing responses, generating AI-assisted insights, and managing close-the-loop actions."
      />

      <PageHeader
        iconLabel="Workspace"
        tag="NPS Me / Customer Feedback Workspace"
        accent="Private feedback workspace"
        title="Turn customer feedback into clear actions"
        subtitle="A practical, private workspace for startups and SMEs who want to import NPS data, understand what customers are saying, and manage close-the-loop follow-up without buying an enterprise CX platform."
      />

      <main className="mx-auto max-w-6xl px-6 pb-20">
        <section className="grid gap-6 md:grid-cols-[1.3fr_0.7fr]">
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/30">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#22C55E]">
              Productised setup + workspace
            </p>

            <h2 className="mt-4 text-3xl font-bold text-white md:text-4xl">
              A working feedback system, not another vague dashboard.
            </h2>

            <p className="mt-4 text-slate-300 leading-7">
              NPS Me helps you move from scattered survey exports, NPS scores and
              customer comments to a private workspace where feedback can be
              imported, analysed and turned into visible follow-up actions.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/book?topic=customer-feedback-workspace"
                className="rounded-full bg-[#22C55E] px-5 py-3 text-sm font-bold text-[#06110B] shadow-lg shadow-[#22C55E]/20 transition hover:-translate-y-0.5 hover:bg-[#86EFAC]"
              >
                Book a setup discussion
              </Link>

              <Link
                to="/workspace/login"
                className="rounded-full border border-white/15 px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:border-[#22C55E]/60"
              >
                Workspace login
              </Link>
            </div>
          </div>

          <aside className="rounded-3xl border border-[#22C55E]/20 bg-[#22C55E]/[0.06] p-6">
            <h3 className="text-xl font-bold text-white">Typical starting point</h3>

            <ul className="mt-4 space-y-3 text-sm text-slate-300">
              <li>• You already collect NPS or survey feedback.</li>
              <li>• Feedback lives in CSV exports, Intercom, forms or spreadsheets.</li>
              <li>• Comments are useful, but no one has time to review them properly.</li>
              <li>• Follow-up happens inconsistently or disappears into Slack/email.</li>
              <li>• You are not ready for Medallia, Qualtrics or a heavy CX platform.</li>
            </ul>

            <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-sm text-slate-400">Setup from</p>
              <p className="mt-1 text-3xl font-black text-white">£2,500</p>
              <p className="mt-2 text-sm text-slate-300">
                Optional monthly support from £350/month.
              </p>
            </div>
          </aside>
        </section>

        <section className="mt-10 grid gap-6 md:grid-cols-3">
          <FeatureCard
            title="Import feedback data"
            text="Start with CSV or JSON exports. NPS Me normalises scores, dates, comments, customer fields and selected options into a reusable dataset."
          />

          <FeatureCard
            title="Understand the story"
            text="Review NPS performance, response patterns, promoters, passives, detractors and the comments behind the score."
          />

          <FeatureCard
            title="Close the loop"
            text="Turn feedback into a visible follow-up queue so detractors, risks and important comments do not disappear."
          />
        </section>

        <section className="mt-12 rounded-3xl border border-white/10 bg-white/[0.04] p-6 md:p-8">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#22C55E]">
              What you get
            </p>
            <h2 className="mt-3 text-3xl font-bold text-white">
              A practical customer feedback operating layer
            </h2>
            <p className="mt-4 text-slate-300 leading-7">
              The workspace is designed to sit on top of tools you already use.
              It does not replace Intercom, HubSpot, Zendesk or spreadsheets. It
              gives founders, CX leads and operations teams a clearer way to turn
              feedback into decisions and action.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <ChecklistItem title="Private workspace" text="Individual logins, workspace-scoped data and role-based controls." />
            <ChecklistItem title="Dataset import" text="Upload or paste feedback exports and save them for ongoing analysis." />
            <ChecklistItem title="NPS performance view" text="See score, distribution, buckets and trends from saved feedback." />
            <ChecklistItem title="Response explorer" text="Inspect the actual comments behind the numbers." />
            <ChecklistItem title="AI-assisted insight summary" text="Generate practical themes, risks and recommended actions." />
            <ChecklistItem title="Close-the-loop workflow" text="Track follow-up actions for customers and issues that need attention." />
            <ChecklistItem title="Setup support" text="NPS Me helps you get the first dataset imported and interpreted." />
            <ChecklistItem title="Optional monthly review" text="Add ongoing insight support, reporting and workflow improvement." />
          </div>
        </section>

        <section className="mt-12 grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <h2 className="text-2xl font-bold text-white">Who this is for</h2>
            <ul className="mt-5 space-y-3 text-slate-300">
              <li>• Startup founders who want to “tick the CX box” properly.</li>
              <li>• SMEs with feedback data but no dedicated CX team.</li>
              <li>• Customer success or operations leads who need a simple workflow.</li>
              <li>• Teams using Intercom, spreadsheets, CSV exports or survey tools.</li>
              <li>• Companies that need something lighter than an enterprise CX suite.</li>
            </ul>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <h2 className="text-2xl font-bold text-white">What this is not</h2>
            <ul className="mt-5 space-y-3 text-slate-300">
              <li>• Not a replacement for your CRM or support platform.</li>
              <li>• Not a heavy enterprise research programme.</li>
              <li>• Not just an AI summary tool.</li>
              <li>• Not a dashboard that leaves you to work out what to do next.</li>
            </ul>
          </div>
        </section>

        <section className="mt-12 rounded-3xl border border-[#22C55E]/20 bg-[#22C55E]/[0.06] p-6 md:p-8">
          <div className="grid gap-6 md:grid-cols-[1fr_0.8fr] md:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#22C55E]">
                Commercially simple
              </p>
              <h2 className="mt-3 text-3xl font-bold text-white">
                Start with a setup. Add support if it proves useful.
              </h2>
              <p className="mt-4 text-slate-300 leading-7">
                The first version is intentionally practical: set up the
                workspace, import the first dataset, review the findings, and
                agree how your team will close the loop. If the rhythm works, you
                can add monthly support, regular reporting or deeper integrations.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-black/20 p-6">
              <PricingLine label="Workspace setup" value="from £2,500" />
              <PricingLine label="Monthly support" value="from £350/month" />
              <PricingLine label="Integration work" value="quoted separately" />

              <Link
                to="/book?topic=customer-feedback-workspace"
                className="mt-6 inline-flex w-full justify-center rounded-full bg-[#22C55E] px-5 py-3 text-sm font-bold text-[#06110B] transition hover:bg-[#86EFAC]"
              >
                Book a setup discussion
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-12 rounded-3xl border border-white/10 bg-white/[0.04] p-6 md:p-8">
          <h2 className="text-3xl font-bold text-white">How setup works</h2>

          <div className="mt-8 grid gap-5 md:grid-cols-4">
            <StepCard
              number="1"
              title="Review your feedback source"
              text="We look at what you already collect: CSV, Intercom, survey tools, spreadsheets or exports."
            />
            <StepCard
              number="2"
              title="Create your workspace"
              text="You get a private workspace with individual user access and a simple import flow."
            />
            <StepCard
              number="3"
              title="Import the first dataset"
              text="We help map columns, check the data and create your first saved dataset."
            />
            <StepCard
              number="4"
              title="Turn insight into action"
              text="We review performance, comments, AI-assisted insights and close-the-loop priorities."
            />
          </div>
        </section>

        <section className="mt-12 text-center">
          <h2 className="text-3xl font-bold text-white">
            Want to see if this fits your team?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-300 leading-7">
            Book a short setup discussion. Bring a sample export or describe your
            current feedback process, and NPS Me will suggest the simplest route
            to a working feedback workflow.
          </p>

          <div className="mt-6 flex justify-center">
            <Link
              to="/book?topic=customer-feedback-workspace"
              className="rounded-full bg-[#22C55E] px-6 py-3 text-sm font-bold text-[#06110B] shadow-lg shadow-[#22C55E]/20 transition hover:-translate-y-0.5 hover:bg-[#86EFAC]"
            >
              Book a setup discussion
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

function FeatureCard({ title, text }) {
  return (
    <article className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
      <h3 className="text-xl font-bold text-white">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-300">{text}</p>
    </article>
  );
}

function ChecklistItem({ title, text }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <h3 className="font-bold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-300">{text}</p>
    </article>
  );
}

function PricingLine({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/10 py-3 last:border-b-0">
      <span className="text-sm text-slate-300">{label}</span>
      <strong className="text-right text-white">{value}</strong>
    </div>
  );
}

function StepCard({ number, title, text }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-black/20 p-5">
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#22C55E]/15 text-sm font-black text-[#86EFAC]">
        {number}
      </span>
      <h3 className="mt-4 font-bold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-300">{text}</p>
    </article>
  );
}
