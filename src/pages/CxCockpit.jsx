// src/pages/CxCockpit.jsx
import React from "react";
import Seo from "../components/Seo";
import DemoResultsPanel from "../components/DemoResultsPanel";

export default function CxCockpit() {
  const title = "CX Cockpit (Demo) | NPS Me";
  const description =
    "Explore your customer experience cockpit: NPS, journey stages, response funnels and verbatim themes in one place.";

  return (
    <>
      <Seo path="/cx-cockpit" title={title} description={description} />

      {/* Layout already provides the background; this is just the page container */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        {/* Header / hero */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-3xl bg-gradient-to-tr from-[#7C3AED] via-[#4F46E5] to-[#22C55E] flex items-center justify-center text-xs font-semibold shadow-lg shadow-emerald-500/40">
              CX
            </div>
            <div>
              <p className="text-xs tracking-[0.18em] text-slate-400 uppercase">
                CX cockpit · demo
              </p>
              <h1 className="text-2xl sm:text-3xl font-semibold text-slate-50">
                Fly your customer experience spaceship
              </h1>
              <p className="mt-1 text-sm text-slate-400 max-w-xl">
                A single view of NPS scores, journey stages, response funnels and verbatim
                themes. This demo cockpit uses the live NPS Me sandbox data.
              </p>
            </div>
          </div>

          <div className="mt-2 sm:mt-0 flex flex-col items-start sm:items-end gap-2 text-xs text-slate-400">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/60 px-3 py-1">
              <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Live demo data feed</span>
            </div>
            <p className="max-w-xs text-[11px] text-slate-500">
              For a real client build, this cockpit would connect to your production survey
              and CRM events.
            </p>
          </div>
        </header>

        {/* Main cockpit grid */}
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] items-start">
          {/* Left: NPS charts + funnel + word cloud */}
          <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-4 sm:p-6 shadow-2xl shadow-black/40">
            <h2 className="text-sm font-semibold text-slate-100 mb-1">
              NPS & journey instrumentation
            </h2>
            <p className="text-[11px] text-slate-500 mb-4">
              Filter by contact, company, result type and stage to see how your NPS is behaving
              across the customer journey.
            </p>

            <DemoResultsPanel />
          </div>

          {/* Right: placeholders for future “dials” */}
          <div className="space-y-4">
            {/* Placeholder 1: Race chart over time / segments */}
            <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-4 sm:p-5">
              <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">
                Upcoming dial
              </p>
              <h3 className="text-sm font-semibold text-slate-100">
                Race chart – NPS over time by segment
              </h3>
              <p className="mt-1 text-[11px] text-slate-500">
                This panel will show a “race” animation of NPS by journey stage or by key
                customer segment, so you can literally watch different parts of the
                experience pull ahead or fall behind.
              </p>
              <div className="mt-3 h-32 rounded-2xl border border-dashed border-slate-700/70 bg-slate-900/40 flex items-center justify-center text-[11px] text-slate-600">
                Race chart placeholder
              </div>
            </div>

            {/* Placeholder 2: AI commentary */}
            <div className="rounded-3xl border border-slate-800 bg-slate-950/90 p-4 sm:p-5">
              <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">
                Upcoming dial
              </p>
              <h3 className="text-sm font-semibold text-slate-100">
                CX co-pilot summary
              </h3>
              <p className="mt-1 text-[11px] text-slate-500">
                Here we’ll add an AI “co-pilot” that reads the charts and verbatim themes
                and gives you a short briefing: where NPS is drifting, which journey stages
                are hurting, and where to focus next.
              </p>
              <div className="mt-3 h-24 rounded-2xl border border-dashed border-slate-700/70 bg-slate-900/40 flex items-center justify-center text-[11px] text-slate-600 text-center px-4">
                AI commentary placeholder
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
