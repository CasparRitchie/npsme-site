// src/NpsSurveyProgramme.jsx
import React from "react";
import { motion } from "framer-motion";
import Seo from "./components/Seo";
import PageHeader from "../components/PageHeader";


export default function NpsSurveyProgramme() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B0F19] via-[#0C1224] to-[#0B0F19] text-slate-200">
      <Seo
        path="/nps-survey-programme"
        title="Your personalised NPS Survey Programme | NPS Me"
        description="Upload your customer list and we'll run a structured NPS survey programme for you - invitations, reminders, dashboards and insight-ready exports."
      />

      <section className="mx-auto max-w-6xl px-6 py-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mb-10"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#22C55E]" />
            <p className="text-xs uppercase tracking-widest text-[#22C55E]">
              NPS survey programme
            </p>
          </div>

          <h1 className="mt-3 text-3xl md:text-4xl font-semibold text-white">
            Your personalised NPS Survey Programme
          </h1>
          <p className="mt-3 text-lg text-slate-400 max-w-3xl">
            Provide us with a file of your customers' contact information and we'll run a structured NPS
            programme for you - invitations, reminders, dashboards and export-ready data - so you can
            focus on acting on the insight, not wrestling with tools.
          </p>
        </motion.div>

        {/* How it works */}
        <div className="mt-10 grid md:grid-cols-4 gap-6">
        {[
          {
            step: "1",
            title: "Upload your list",
            text: "You send us a CSV/Excel with customer name, email, company and any groupings you care about (sector, segment, persona, CSM, etc.).",
          },
          {
            step: "2",
            title: "We set up the survey",
            text: "We configure your NPS survey, branding and timing - including who to ask, when, and how often to follow up.",
          },
          {
            step: "3",
            title: "Invitations & reminders",
            text: "Invitations go out via email, with optional targeted reminders to non-responders. Every response is tracked and stored for analysis.",
          },
          {
            step: "4",
            title: "Live CX dashboard",
            text: "You get a secure portal with live NPS, response rates and verbatim comments, plus CSV exports you can drop straight into PowerPoint, Excel or your BI tool.",
          },
        ].map((item) => (
          <div
            key={item.step}
            className="rounded-2xl border border-white/10 bg-white/5 p-5 flex flex-col"
          >
            <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-[#7C3AED] to-[#22C55E] text-xs font-semibold text-white mb-3">
              Step {item.step}
            </div>
            <h3 className="text-white text-lg font-medium mb-2">
              {item.title}
            </h3>
            <p className="text-slate-400 text-sm flex-1">{item.text}</p>
          </div>
        ))}
      </div>

      {/* Pre-Christmas use case */}
      <div className="mt-16 rounded-3xl border border-white/10 bg-black/30 p-8">
        <h2 className="text-2xl font-semibold text-white mb-3">
          Perfect for a rapid, easy to set up, customer pulse
        </h2>
        <p className="text-slate-400 mb-4 max-w-3xl">
          If you have a list of customers you want to hear from quickly, we can spin up a focused NPS survey in days - not months.
          You send the list, we handle the invites and tracking, and you log in
          to see live NPS, completion and comments as they come in.
        </p>
        <ul className="list-disc pl-5 space-y-1 text-slate-300 text-sm">
          <li>Single CSV upload - no complex tooling for your team.</li>
          <li>Branded NPS survey, tuned to your tone of voice.</li>
          <li>Live NPS and completion rates throughout the survey window.</li>
          <li>Comment feed you can filter by segment, persona or CSM.</li>
        </ul>
      </div>

      {/* What your client sees */}
      <div className="mt-16 grid md:grid-cols-2 gap-8">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h3 className="text-xl text-white mb-3">Client dashboard</h3>
          <p className="text-slate-400 text-sm mb-4">
            Each client gets their own secure view of their survey programme -
            no heavy tooling or admin. They can see:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-sm text-slate-300">
            <li>Current NPS and response rate.</li>
            <li>Breakdowns by segment, sector or persona.</li>
            <li>Verbatim comments, ready to tag and share.</li>
            <li>CSV export of the latest status at any time.</li>
          </ul>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0C1224] p-6">
          <h3 className="text-xl text-white mb-3">Under the hood</h3>
          <p className="text-slate-400 text-sm mb-4">
            Behind the scenes, NPS Me handles secure storage, deduplicated
            invitations, tracking and reminders - so you don't need to build or
            buy a heavy CX platform just to run one survey programme.
          </p>
          <ul className="list-disc pl-5 space-y-1 text-sm text-slate-300">
            <li>Contact file stored securely and versioned.</li>
            <li>Unique links per customer to avoid duplicate responses.</li>
            <li>Optional notifications when new responses arrive.</li>
            <li>Clear audit trail of what was sent and when.</li>
          </ul>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-16 text-center">
        <h2 className="text-2xl font-semibold text-white mb-3">
          Want to run an NPS survey with your customers?
        </h2>
        <p className="text-slate-400 mb-6">
          Share your customer list and a target go-live date and we'll propose a
          simple, end-to-end survey plan - including email copy, timings and how
          we'll report back.
        </p>
        <a
          href="/#contact"
          className="inline-block rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#22C55E] px-6 py-3 font-medium text-white hover:opacity-90 transition"
        >
          Talk with us to set up your survey programme →
        </a>
      </div>
      {/* Demo CTA – link to live NPS demo */}
      <div className="mt-20 mx-auto max-w-5xl">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">

          {/* Left text */}
          <div>
            <h2 className="text-xl md:text-2xl font-semibold text-white">
              Try the NPS survey demo
            </h2>
            <p className="mt-2 text-sm text-slate-300 max-w-xl">
              See how invitations, reminders, scoring, and dashboards all work —
              exactly as your customers would experience them. Quick, safe, and
              designed to show how NPSme runs full programmes.
            </p>
          </div>

          {/* CTA */}
          <div className="flex flex-col items-start gap-2 shrink-0">
            <a
              href="/demo-survey-page"
              className="inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-semibold bg-[#7C3AED] hover:bg-[#6D28D9] text-white transition"
            >
              Open the NPS demo
            </a>
            <p className="text-[11px] text-slate-400 max-w-[200px]">
              Sends a real invite and logs your demo response into the metrics.
            </p>
          </div>
        </div>
      </div>
    </section>
  </div>
  );
}
