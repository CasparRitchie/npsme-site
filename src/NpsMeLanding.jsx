// src/NpsMeLanding.jsx
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Star, LineChart, Wrench, Gauge, CheckCircle2 } from "lucide-react";
import Seo from "./components/Seo";
import { computeNpsStats } from "../utils/nps";
import PageHeader from "./components/PageHeader";


// --- NPS explainer ---

function NpsExplainer() {
  return (
    <section id="nps-explainer" className="mx-auto max-w-7xl px-6 pb-20">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
        <h3 className="text-xl md:text-2xl font-semibold text-white">
          What is Net Promoter Score (NPS)® and how to use it fairly?
        </h3>

        <div className="mt-3 grid gap-6 md:grid-cols-2">
          <div className="text-slate-300 text-sm leading-relaxed">
            <p>
              Net Promoter Score (NPS)® is a customer sentiment metric that groups
              respondents by their likelihood to recommend a company on a 0-10 scale:
            </p>
            <ul className="mt-3 space-y-2 list-disc pl-5">
              <li><span className="text-white font-medium">Promoters</span>: 9-10</li>
              <li><span className="text-white font-medium">Passives</span>: 7-8</li>
              <li><span className="text-white font-medium">Detractors</span>: 0-6</li>
            </ul>
            <p className="mt-3">
              The score is calculated as{" "}
              <span className="text-white font-medium">% Promoters − % Detractors</span>.
            </p>
          </div>

          <div className="text-slate-300 text-sm leading-relaxed">
            <p className="text-white font-medium">Where it fits</p>
            <ul className="mt-2 space-y-2 list-disc pl-5">
              <li><span className="text-white">Relationship NPS</span>: periodic, brand-level sentiment.</li>
              <li>
                <span className="text-white">Transactional / stage-based</span>: sent after key milestones
                (e.g., order placed, onboarding, delivery).
              </li>
              <li>Best used alongside CSAT, CES, retention and review velocity.</li>
            </ul>
            <p className="mt-3 text-white font-medium">Good practice & cautions</p>
            <ul className="mt-2 space-y-2 list-disc pl-5">
              <li>Use representative sampling and avoid “gaming”.</li>
              <li>Close the loop with respondents and track root causes.</li>
              <li>NPS is directional — not a single source of truth.</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

// --- Milestone NPS explainer (unchanged) ---

function MilestoneNpsSection() {
  return (
    <section id="milestone-nps" className="mx-auto max-w-7xl px-6 pb-20">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
        <h2 className="text-2xl md:text-3xl font-semibold text-white">
          Milestone (transactional) NPS & survey signals for actionable CX
        </h2>
        <p className="mt-3 text-slate-300 max-w-3xl">
          Beyond a periodic, brand-level measure, milestone surveys capture sentiment at specific
          journey moments (e.g., order placed, onboarding completed, first delivery). We use this
          <span className="whitespace-nowrap"> “NPS®-style”</span> question and complementary signals
          to expose friction in context and prioritise the right fixes.
        </p>

        {/* Examples grid */}
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Order placed",
              q: "Based on your ordering experience, how likely are you to recommend us (0-10)?",
              why: "Test checkout clarity, pricing transparency, and payment reliability.",
            },
            {
              title: "Onboarding finished",
              q: "After onboarding, how likely are you to recommend us (0-10)?",
              why: "Gauge setup friction, documentation gaps, enablement quality.",
            },
            {
              title: "First delivery/use",
              q: "After your first delivery/use, how likely are you to recommend us (0-10)?",
              why: "Reveal fulfilment speed/accuracy, product readiness, first-use UX.",
            },
          ].map((card) => (
            <div key={card.title} className="rounded-2xl border border-white/10 bg-black/20 p-5">
              <div className="text-white font-semibold">{card.title}</div>
              <div className="mt-2 text-sm text-slate-200">{card.q}</div>
              <div className="mt-2 text-xs text-slate-400">{card.why}</div>
            </div>
          ))}
        </div>

        {/* Implementation checklist */}
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
            <div className="text-white font-semibold">Implementation in 5 steps</div>
            <ol className="mt-3 space-y-2 list-decimal pl-5 text-sm text-slate-300">
              <li>Map milestones (checkout, onboarding, first value, renewal, support closure).</li>
              <li>Trigger surveys via your stack (ESP, product, helpdesk, CDP).</li>
              <li>Ask 0-10 + one open text; keep it short.</li>
              <li>Pipe results to a central view; tag by milestone.</li>
              <li>Close the loop and run monthly root-cause reviews.</li>
            </ol>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
            <div className="text-white font-semibold">What we track</div>
            <ul className="mt-3 space-y-2 list-disc pl-5 text-sm text-slate-300">
              <li>Score distribution by milestone (Promoters/Passives/Detractors).</li>
              <li>Theme frequency & impact (effort vs. volume).</li>
              <li>Time-to-contact & close-the-loop rates.</li>
              <li>Downstream effects (repeat tickets, churn risk, review velocity).</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

// --- New: lightweight demo summary used on the landing ---

function DemoSummaryStrip() {
  const [stats, setStats] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError("");
        const res = await fetch("/api/demo-responses");
        if (!res.ok) throw new Error("Failed to load demo responses");
        const data = await res.json();
        const rows = data.rows || [];
        setStats(computeNpsStats(rows));
      } catch (err) {
        console.error("Error loading demo summary", err);
        setError("We couldn’t load the demo metrics right now.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return (
      <p className="text-sm text-slate-400">
        Loading live demo metrics…
      </p>
    );
  }

  if (error) {
    return (
      <p className="text-sm text-slate-400">
        {error}
      </p>
    );
  }

  if (!stats) {
    return (
      <p className="text-sm text-slate-400">
        No demo responses yet. Run the demo to see live NPS.
      </p>
    );
  }

  return (
    <div className="text-sm text-slate-300">
      <div className="flex items-baseline gap-2">
        <span className="text-xs uppercase tracking-widest text-slate-400">
          Live demo NPS
        </span>
      </div>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="text-2xl font-semibold text-white">
          {stats.nps === null ? "-" : stats.nps}
        </span>
        {stats.nps !== null && (
          <span className="text-xs text-slate-400">NPS</span>
        )}
      </div>
      <p className="mt-1 text-[11px] text-slate-500">
        Based on {stats.total} demo responses so far.
      </p>
    </div>
  );
}

// --- Main landing page ---

export default function NpsMeLanding() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B0F19] via-[#0C1224] to-[#0B0F19] text-slate-200">
      <Seo
        path="/"
        title="Customer Experience (CX) Consulting & NPS Improvement | NPS Me"
        description="Pragmatic CX consulting to diagnose friction, prioritise fixes, and ship measurable gains - lift NPS®, reduce churn, increase repeat purchase."
      />

      {/* Hero using shared PageHeader shell + custom content */}
      <PageHeader
        iconLabel="NPS Me"
        tag="NPS Me / Home"
      >
        <div className="pt-4 grid md:grid-cols-12 gap-10">
          <div className="md:col-span-7 lg:col-span-6">
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-3xl sm:text-4xl md:text-5xl leading-tight text-balance break-words font-semibold tracking-tight text-white"
            >
              Customer Experience (CX) consulting to improve{" "}
              <span className="md:whitespace-nowrap">
                Net Promoter Score (NPS)®,
              </span>{" "}
              retention, and revenue.{" "}
              <span className="block sm:inline text-transparent bg-clip-text bg-gradient-to-r from-[#7C3AED] to-[#22C55E]">
                Turn feedback into growth.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.05 }}
              className="mt-5 text-slate-300 max-w-xl"
            >
                NPS Me helps teams run NPS and milestone feedback through their existing stack
                (Intercom, HubSpot, helpdesks, product tools, or CSV). We add the missing layer:
                survey governance, unbiased sampling, and decision-grade insight so feedback turns
                into measurable retention and revenue.
            </motion.p>

            <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Link
                to="/book"
                className="group inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold bg-[#22C55E] text-[#0B0F19] hover:bg-[#16A34A] transition"
              >
                Book a free discovery
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </Link>
              <a href="#method" className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white">
                See the 4-stage method
              </a>
              <a href="#demo" className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white">
                Try the NPS®-style demo
              </a>
            </div>

            <div className="mt-10 flex items-center gap-6 text-sm text-slate-400">
              <div className="flex items-center gap-2"><Star className="h-4 w-4" /> Review mining</div>
              <div className="flex items-center gap-2"><Wrench className="h-4 w-4" /> Hands-on enablement</div>
              <div className="flex items-center gap-2"><LineChart className="h-4 w-4" /> Measurable lift</div>
            </div>
            {/* Works with your tools */}
            <div className="mt-6 flex flex-wrap gap-2 text-xs">
              {["Intercom", "HubSpot", "Zendesk", "Product events", "CSV upload"].map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-300"
                >
                  {t}
                </span>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-slate-500 max-w-xl">
              Use NPS Me alongside your existing tools. We focus on governance, analysis and action,
              not replacing your CS platform.
            </p>
          </div>
        </div>
      </PageHeader>


      {/* 4-Stage Method */}
      <section id="method" className="mx-auto max-w-7xl px-6 py-20">
        <div className="max-w-2xl">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-white">
            A simple, repeatable CX method to lift NPS®
          </h2>
          <p className="mt-3 text-slate-300">
            Clear steps, fast wins, and compounding improvements. We meet you
            where you are and prioritise what moves the needle.
          </p>
        </div>
        <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: "1) Discovery", icon: Star, desc: "Audit reviews, surveys, and internal flows. Map friction. Establish baseline metrics." },
            { title: "2) Recommend", icon: LineChart, desc: "Prioritised playbook of fixes and experiments with owners, effort/impact scoring, and timelines." },
            { title: "3) Implement", icon: Wrench, desc: "Embed changes with teams: scripts, templates, automation, training. Hands-on support to unblock fast." },
            { title: "4) Monitor", icon: Gauge, desc: "Track NPS/CSAT/CES and review velocity. Iterate monthly. Celebrate wins and scale what works." },
          ].map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="rounded-2xl border border-white/10 bg-white/5 p-6"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#22C55E] flex items-center justify-center">
                  <card.icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-semibold text-white">{card.title}</h3>
              </div>
              <p className="mt-3 text-sm text-slate-300">{card.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Demo Widget → now a live summary + link to full demo */}
      <section id="demo" className="mx-auto max-w-7xl px-6 pb-20">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-xl md:text-2xl font-semibold text-white">
              Try the NPS®-style demo (close-the-loop ready)
            </h3>
            <p className="mt-2 text-slate-300 max-w-xl">
                The demo shows how invitations, survey responses, and NPS metrics link together.
                In real deployments, targeting and sending often stay in your CS platform and NPS Me
                ingests the responses to drive analysis and action.
                These numbers are live from the demo environment.
            </p>
            <div className="mt-4">
              <DemoSummaryStrip />
            </div>
          </div>

          <div className="mt-4 md:mt-0 flex flex-col items-start gap-3">
            <Link
              to="/demo-survey-page"
              className="inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold bg-[#7C3AED] hover:bg-[#6D28D9] text-white"
            >
              Run the live demo &amp; see full results
              <ArrowRight className="h-4 w-4" />
            </Link>
            <p className="text-xs text-slate-400 max-w-xs">
              Opens the dedicated demo page where you can send yourself an invitation,
              complete the survey, and explore NPS & milestone scores.
            </p>
          </div>
        </div>
      </section>
      <section id="platform" className="mx-auto max-w-7xl px-6 pb-20">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
          <h2 className="text-2xl md:text-3xl font-semibold text-white">
            Not another survey tool
          </h2>
          <p className="mt-3 text-slate-300 max-w-3xl">
            Most teams already have ways to send surveys. NPS Me helps you run a fair, consistent,
            decision-grade programme across whatever tools you use.
          </p>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {[
              {
                title: "Governance",
                desc: "Sampling, cadence, anti-gaming, and comparability over time so the score means something.",
              },
              {
                title: "Interpretation",
                desc: "Theme and driver analysis, confidence checks, and clear prioritisation so action is obvious.",
              },
              {
                title: "Close the loop",
                desc: "Follow-up workflows and outcome tracking so responses lead to measurable changes.",
              },
            ].map((card) => (
              <div key={card.title} className="rounded-2xl border border-white/10 bg-black/20 p-5">
                <div className="text-white font-semibold">{card.title}</div>
                <div className="mt-2 text-sm text-slate-300">{card.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <NpsExplainer />
      <MilestoneNpsSection />

      {/* About */}
      <section id="about" className="mx-auto max-w-7xl px-6 pb-20">
        <h2 className="text-2xl md:text-3xl font-semibold text-white">About us</h2>
        <p className="mt-3 text-slate-300 max-w-2xl">
          We are experienced NPS and CX consultants. We combine quantitative analysis with
          hands-on team enablement to remove friction, improve sentiment, and grow revenue.
          We reference Net Promoter Score (NPS)® descriptively as one of several customer metrics.
        </p>
        <ul className="mt-6 space-y-3 text-sm text-slate-300">
          {[
            "Deep-dive review mining across Trustpilot, Google, and in-product surveys",
            "Voice-of-Customer to Voice-of-Process mapping",
            "Prioritised roadmaps with effort/impact scoring and owners",
            "Enablement: playbooks, scripts, templates, and training",
            "Measurement: NPS/CSAT/CES instrumentation and review velocity",
          ].map((t) => (
            <li key={t} className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 text-[#22C55E]" />
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Contact CTA (no duplicated form - links to /book) */}
      <section id="contact" className="mx-auto max-w-7xl px-6 pb-24">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#141B2E] to-[#0F172A] p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-semibold text-white">
            Ready to turn feedback into growth?
          </h2>
          <p className="mt-3 text-slate-300 max-w-2xl mx-auto">
            Book a free 30-minute discovery session. We’ll review your current scores and identify quick wins.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:hello@npsme.com"
              className="group inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3 text-sm font-semibold bg-[#22C55E] text-[#0B0F19] hover:bg-[#16A34A] transition"
            >
              Email hello@npsme.com
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </a>
            <Link
              to="/book"
              className="group inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3 text-sm font-semibold bg-[#7C3AED] hover:bg-[#6D28D9] transition"
            >
              Request a discovery call
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
