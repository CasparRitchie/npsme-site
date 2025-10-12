// src/CxPulseSample.jsx
import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, TrendingUp, MessageSquare, AlertTriangle, CheckCircle2 } from "lucide-react";

export default function CxPulseSample() {
  // ---------- Fake-but-realistic sample data ----------
  const weekOnWeek = { // non-linear, small dips for realism
    sentimentScore: [48, 46, 51, 49, 55, 57, 54, 60], // %
    npsStyle:       [12,  8, 14, 13, 18, 21, 19, 24], // index
  };

  const themes = [
    { name: "Onboarding clarity", change: "+17%", sev: "good",   notes: "New 3-step checklist cut confusion. Fewer ‘how do I start?’ posts." },
    { name: "Delivery reliability", change: "+9%",  sev: "mid",    notes: "Intermittent delays still mentioned. Clear ETA emails reduced WISMO." },
    { name: "Billing transparency", change: "+3%",  sev: "mid",    notes: "Edge cases around discounts/refunds improved; still pops up monthly." },
    { name: "Support responsiveness", change: "+22%", sev: "good", notes: "Macro replies removed; first-response SLA posted publicly." },
    { name: "Mobile app stability", change: "-4%",  sev: "bad",    notes: "New version introduced a crash loop for a subset of devices." },
  ];

  const quotes = [
    { src: "Twitter", txt: "The welcome checklist made day 1 so much easier. Actually knew what to do next 👏" },
    { src: "Trustpilot", txt: "Had a delivery hiccup, but their ETA email and follow-up made it painless." },
    { src: "Reddit", txt: "Please fix the latest Android build—keeps freezing on sign-in." },
    { src: "App Store", txt: "Support replied quickly AND with a real solution. Big improvement from last month." },
  ];

  const implemented = [
    "Launched 3-step onboarding checklist & first-week emails (open rate 54%).",
    "ETA+tracking email for shipments; added ‘running late?’ self-serve link.",
    "Replaced boilerplate macros with short, diagnostic prompts in support.",
    "Added billing explainer in Help Center; linked from invoice emails.",
  ];

  const impact = {
    repeatLift: 0.06,   // +6% repeat
    churnDown: 0.02,    // -2% churn/refunds
    ticketsDown: 0.25,  // -25% tickets per 1k orders
  };

  // ---------- Small helpers ----------
  const brandGreen = "#22C55E";
  const brandPurple = "#7C3AED";
  const red = "#ef4444";
  const amber = "#f59e0b";
  const green = "#22c55e";

  const sevColor = (s) => (s === "good" ? green : s === "mid" ? amber : red);

  const Bar = ({ value, max = 100, color = brandPurple, label }) => (
    <div className="w-full">
      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-2 rounded-full"
          style={{ width: `${Math.max(0, Math.min(100, (value / max) * 100))}%`, backgroundColor: color }}
        />
      </div>
      {label && <div className="mt-1 text-xs text-slate-400">{label}</div>}
    </div>
  );

  const Spark = ({ series, color = brandGreen }) => (
    <svg viewBox="0 0 100 28" className="w-full h-10">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        points={series
          .map((v, i) => {
            const x = (i / (series.length - 1)) * 100;
            const y = 26 - ((v - Math.min(...series)) / (Math.max(...series) - Math.min(...series) || 1)) * 24;
            return `${x},${y}`;
          })
          .join(" ")}
      />
    </svg>
  );

  const Footer = () => (
    <div className="mt-10 text-[11px] leading-relaxed text-slate-500">
      <div className="text-slate-400">
        © {new Date().getFullYear()} NPS Me. All rights reserved.
      </div>
      <div className="mt-2">
        NPS® and Net Promoter Score® are registered service marks of Bain &amp; Company, Inc., Fred Reichheld,
        and Satmetrix Systems, Inc. References here are descriptive only. NPS Me is independent and not
        affiliated with or endorsed by those parties.
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B0F19] via-[#0C1224] to-[#0B0F19] text-slate-200">
      {/* Top banner */}
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="pointer-events-none absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_20%_20%,#7C3AED_0%,transparent_35%),radial-gradient(circle_at_80%_30%,#22C55E_0%,transparent_25%)]" />
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#22C55E]" />
            <p className="text-xs tracking-widest text-slate-400 uppercase">Sample</p>
          </div>
          <h1 className="mt-2 text-3xl md:text-4xl font-semibold tracking-tight text-white">
            CX Pulse Report – <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7C3AED] to-[#22C55E]">Sample Client</span>
          </h1>
          <p className="mt-3 max-w-2xl text-slate-300">
            Weekly signal from public social channels and review sites. Themes, sentiment, and what to do next—summarised on one page.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-slate-300">
            <TrendingUp className="h-4 w-4" />
            <span>Period: last 8 weeks (rolling)</span>
            <span className="opacity-50">•</span>
            <span>Sources: Twitter/X, Reddit, App/Play store reviews, Trustpilot</span>
          </div>
        </div>
      </section>

      {/* Highlights & trends */}
      <section className="mx-auto max-w-7xl px-6 py-10 grid md:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="text-xs uppercase tracking-wider text-slate-400">Headline sentiment</div>
          <div className="mt-1 text-2xl font-semibold text-white">+12 pts WoW</div>
          <Spark series={weekOnWeek.sentimentScore} color={brandGreen} />
          <div className="text-xs text-slate-400">Composite positivity score (0–100)</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="text-xs uppercase tracking-wider text-slate-400">NPS-style index</div>
          <div className="mt-1 text-2xl font-semibold text-white">+6 vs. Week 1</div>
          <Spark series={weekOnWeek.npsStyle} color={brandPurple} />
          <div className="text-xs text-slate-400">Detractors vs Promoters balance (scaled)</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="text-xs uppercase tracking-wider text-slate-400">Support load proxy</div>
          <div className="mt-1 text-2xl font-semibold text-white">−25% tickets</div>
          <Bar value={impact.ticketsDown * 100} color={brandGreen} label="Tickets per 1k orders (relative)" />
          <div className="mt-2 text-xs text-slate-400">From macro removal + better first response</div>
        </div>
      </section>

      {/* Qual insights */}
      <section className="mx-auto max-w-7xl px-6 pb-10">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
          <h2 className="text-xl md:text-2xl font-semibold text-white">What customers are saying</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {quotes.map((q, i) => (
              <div key={i} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex items-center gap-2 text-slate-400 text-xs">
                  <MessageSquare className="h-4 w-4" />
                  {q.src} • anonymised
                </div>
                <p className="mt-2 text-sm text-slate-200">“{q.txt}”</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Themes */}
      <section className="mx-auto max-w-7xl px-6 pb-10">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
          <h2 className="text-xl md:text-2xl font-semibold text-white">Top themes & movement</h2>
          <div className="mt-5 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {themes.map((t) => (
              <div key={t.name} className="rounded-2xl border border-white/10 bg-black/20 p-5">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-white">{t.name}</div>
                  <span className="text-xs px-2 py-0.5 rounded-lg" style={{ backgroundColor: sevColor(t.sev), color: "#0B0F19" }}>
                    {t.change}
                  </span>
                </div>
                <div className="mt-3">
                  <Bar value={Math.random() * 100} color={sevColor(t.sev)} label="Theme volume (relative)" />
                </div>
                <p className="mt-2 text-sm text-slate-300">{t.notes}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-3 text-xs text-slate-400">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            Movement is week-on-week; ‘volume’ bars are normalised to protect privacy.
          </div>
        </div>
      </section>

      {/* What we did */}
      <section className="mx-auto max-w-7xl px-6 pb-10">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
          <h2 className="text-xl md:text-2xl font-semibold text-white">Actions shipped this cycle</h2>
          <ul className="mt-4 space-y-2 text-sm text-slate-300">
            {implemented.map((i) => (
              <li key={i} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-[#22C55E]" />
                <span>{i}</span>
              </li>
            ))}
          </ul>

          {/* Impact summary */}
          <div className="mt-6 grid md:grid-cols-3 gap-6">
            <ImpactCard label="Repeat purchase lift" value="+6%" note="Cohort 30–60d repeat rate" color={brandGreen} />
            <ImpactCard label="Churn/refunds reduction" value="−2%" note="Refunds per 1k orders" color={brandGreen} />
            <ImpactCard label="Tickets per 1k orders" value="−25%" note="After ETA emails & SLA revamp" color={brandGreen} />
          </div>
        </div>
      </section>

      {/* Next steps */}
      <section className="mx-auto max-w-7xl px-6 pb-16">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#141B2E] to-[#0F172A] p-8 text-center">
          <h3 className="text-2xl font-semibold text-white">Next steps we recommend</h3>
          <ul className="mt-4 text-slate-300 text-sm space-y-2 max-w-2xl mx-auto">
            <li>Ship an emergency patch for the Android crash loop; track store reviews for 2 weeks.</li>
            <li>Add proactive “running late?” banner to order tracking to pre-empt tickets.</li>
            <li>Publish public SLAs; continue first-response coaching with examples.</li>
            <li>Run a 4-week A/B on billing explainer placement inside the invoice PDF.</li>
          </ul>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/products"
              className="rounded-2xl px-6 py-3 text-sm font-semibold bg-[#7C3AED] hover:bg-[#6D28D9] transition inline-flex items-center justify-center gap-2"
            >
              Explore productized services <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="/#contact"
              className="rounded-2xl px-6 py-3 text-sm font-semibold bg-[#22C55E] text-[#0B0F19] hover:bg-[#16A34A] transition inline-flex items-center justify-center gap-2"
            >
              Book discovery <ArrowRight className="h-4 w-4" />
            </a>
          </div>
          <Footer />
        </div>
      </section>
    </div>
  );
}

function ImpactCard({ label, value, note, color }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
      <div className="text-xs uppercase tracking-wider text-slate-400">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-white" style={{ color }}>{value}</div>
      <div className="mt-1 text-xs text-slate-400">{note}</div>
    </div>
  );
}
