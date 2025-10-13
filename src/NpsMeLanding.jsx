import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Star, LineChart, Wrench, Gauge, CheckCircle2 } from "lucide-react";

// NPS Me landing (uses global Navbar from App.jsx)

function ContactForm() {
  const [status, setStatus] = React.useState("idle"); // idle | sending | success | error
  const [form, setForm] = React.useState({ name: "", email: "", message: "", company: "" });
  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const disabled = status === "success";

  const onSubmit = async (e) => {
    e.preventDefault();
    if (form.company) return; // honeypot
    setStatus("sending");
    try {
      const res = await fetch("https://formspree.io/f/mwprrzro", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          message: form.message,
          _subject: "New message from npsme.com",
          _source: "contact-section",
        }),
      });
      setStatus(res.ok ? "success" : "error");
    } catch {
      setStatus("error");
    }
  };

  return (
    <>
      <form
        onSubmit={onSubmit}
        className={`mt-8 grid gap-4 max-w-xl mx-auto text-left transition ${disabled ? "opacity-60 pointer-events-none" : ""}`}
        aria-disabled={disabled}
      >
        {/* Honeypot (hidden) */}
        <input
          tabIndex="-1"
          autoComplete="off"
          value={form.company}
          onChange={(e) => update("company", e.target.value)}
          className="hidden"
          placeholder="Company"
        />

        <div className="grid md:grid-cols-2 gap-4">
          <input
            required
            placeholder="Your name"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            className="rounded-2xl bg-black/30 border border-white/10 p-3 text-sm text-slate-100 placeholder-slate-400"
            disabled={disabled}
          />
          <input
            required
            type="email"
            placeholder="Your email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            className="rounded-2xl bg-black/30 border border-white/10 p-3 text-sm text-slate-100 placeholder-slate-400"
            disabled={disabled}
          />
        </div>

        <textarea
          required
          rows={5}
          placeholder="How can I help? (A couple of lines is perfect.)"
          value={form.message}
          onChange={(e) => update("message", e.target.value)}
          className="rounded-2xl bg-black/30 border border-white/10 p-3 text-sm text-slate-100 placeholder-slate-400"
          disabled={disabled}
        />

        <button
          disabled={status === "sending" || disabled}
          className="rounded-2xl px-5 py-3 text-sm font-semibold bg-[#22C55E] text-[#0B0F19] hover:bg-[#16A34A] transition disabled:opacity-60"
        >
          {status === "sending" ? "Sending…" : "Send message"}
        </button>
      </form>

      {status === "success" && (
        <p className="mt-3 text-sm text-[#22C55E]">Thanks! I’ll get back to you shortly.</p>
      )}
      {status === "error" && (
        <p className="mt-3 text-sm text-red-400">Sorry—something went wrong. Please email hello@npsme.com.</p>
      )}
    </>
  );
}

function NpsExplainer() {
  return (
    <section id="nps-explainer" className="mx-auto max-w-7xl px-6 pb-20">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
        <h3 className="text-xl md:text-2xl font-semibold text-white">
          What is Net Promoter Score (NPS)®?
        </h3>

        <div className="mt-3 grid gap-6 md:grid-cols-2">
          <div className="text-slate-300 text-sm leading-relaxed">
            <p>
              Net Promoter Score (NPS)® is a customer sentiment metric that groups
              respondents by their likelihood to recommend a company on a 0–10 scale:
            </p>
            <ul className="mt-3 space-y-2 list-disc pl-5">
              <li><span className="text-white font-medium">Promoters</span>: 9–10</li>
              <li><span className="text-white font-medium">Passives</span>: 7–8</li>
              <li><span className="text-white font-medium">Detractors</span>: 0–6</li>
            </ul>
            <p className="mt-3">
              The score is calculated as <span className="text-white font-medium">% Promoters − % Detractors</span>.
            </p>
          </div>

          <div className="text-slate-300 text-sm leading-relaxed">
            <p className="text-white font-medium">Where it fits</p>
            <ul className="mt-2 space-y-2 list-disc pl-5">
              <li><span className="text-white">Relationship NPS</span>: periodic, brand-level sentiment.</li>
              <li><span className="text-white">Transactional / stage-based</span>: sent after key milestones (e.g., order placed, onboarding, delivery).</li>
              <li>Best used alongside CSAT, CES, retention and review velocity.</li>
            </ul>
            <p className="mt-3 text-white font-medium">Good practice & cautions</p>
            <ul className="mt-2 space-y-2 list-disc pl-5">
              <li>Use representative sampling and avoid “gaming”.</li>
              <li>Close the loop with respondents and track root causes.</li>
              <li>NPS is directional—not a single source of truth.</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4 text-[11px] leading-relaxed text-slate-400">
          <p>
            Terminology & attribution: NPS® and Net Promoter Score® are registered service marks of
            Bain &amp; Company, Inc., Fred Reichheld, and Satmetrix Systems, Inc. References here are descriptive only.
            NPS Me is independent and not affiliated with or endorsed by those parties.
          </p>
        </div>
      </div>
    </section>
  );
}

function MilestoneNpsSection() {
  return (
    <section id="milestone-nps" className="mx-auto max-w-7xl px-6 pb-20">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
        <h2 className="text-2xl md:text-3xl font-semibold text-white">
          Milestone (Transactional) NPS & Survey Signals
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
              q: "Based on your ordering experience, how likely are you to recommend us (0–10)?",
              why: "Test checkout clarity, pricing transparency, and payment reliability.",
            },
            {
              title: "Onboarding finished",
              q: "After onboarding, how likely are you to recommend us (0–10)?",
              why: "Gauge setup friction, documentation gaps, enablement quality.",
            },
            {
              title: "First delivery/use",
              q: "After your first delivery/use, how likely are you to recommend us (0–10)?",
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
              <li>Ask 0–10 + one open text; keep it short.</li>
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

        {/* Compliance-safe note */}
        <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4 text-[11px] leading-relaxed text-slate-400">
          <p>
            We reference the 0–10 “likelihood to recommend” question and terminology descriptively.
            NPS® and Net Promoter Score® are registered service marks of Bain &amp; Company, Inc., Fred Reichheld,
            and Satmetrix Systems, Inc. We are independent and not affiliated with those parties.
          </p>
        </div>
      </div>
    </section>
  );
}

export default function NpsMeLanding() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B0F19] via-[#0C1224] to-[#0B0F19] text-slate-200">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_20%_20%,#7C3AED_0%,transparent_35%),radial-gradient(circle_at_80%_30%,#22C55E_0%,transparent_25%)]" />
        <div className="mx-auto max-w-7xl px-6 pt-20 pb-24 grid md:grid-cols-12 gap-10">
          <div className="md:col-span-7 lg:col-span-6">
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-3xl sm:text-4xl md:text-5xl leading-tight text-balance break-words font-semibold tracking-tight text-white"
            >
              We help you improve your{" "}
              <span className="md:whitespace-nowrap">Net Promoter Score (NPS)®</span> and customer experience.{' '}
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
              NPS Me is an independent consultancy. We use NPS descriptively—as one of several metrics—to prioritise the work that actually moves the needle across your customer journey.
            </motion.p>
            <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <a
                href="#contact"
                className="group inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold bg-[#22C55E] text-[#0B0F19] hover:bg-[#16A34A] transition"
              >
                Book a free discovery
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </a>
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
          </div>
        </div>
      </section>

      {/* 4-Stage Method */}
      <section id="method" className="mx-auto max-w-7xl px-6 py-20">
        <div className="max-w-2xl">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-white">
            A simple, repeatable 4-stage method
          </h2>
          <p className="mt-3 text-slate-300">
            Clear steps, fast wins, and compounding improvements. I meet you
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

      {/* Demo Widget */}
      <section id="demo" className="mx-auto max-w-7xl px-6 pb-20">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <h3 className="text-xl md:text-2xl font-semibold text-white">Try the NPS®-style demo</h3>
          <p className="mt-2 text-slate-300">Rate us 0–10 and leave an optional comment. We’ll show a rolling demo metric on this page.</p>
          <DemoWidget />
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

      {/* Contact CTA + Contact Form */}
      <section id="contact" className="mx-auto max-w-7xl px-6 pb-24">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#141B2E] to-[#0F172A] p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-semibold text-white">Ready to turn feedback into growth?</h2>
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
            <a
              href="#"
              className="group inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3 text-sm font-semibold bg-[#7C3AED] hover:bg-[#6D28D9] transition"
            >
              Schedule with Calendly
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </a>
          </div>

          <ContactForm />
        </div>
      </section>

      {/* Footer + attribution */}
      <footer className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-8 text-sm text-slate-400 flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
          <div>© {new Date().getFullYear()} NPS Me. All rights reserved.</div>
          <div className="flex gap-6">
            <a href="/privacy" className="hover:text-slate-200">Privacy</a>
            <a href="/terms" className="hover:text-slate-200">Terms</a>
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-6 pb-8 text-[11px] leading-snug text-slate-500">
          NPS® and Net Promoter Score® are registered service marks of Bain &amp; Company, Inc., Fred Reichheld, and
          Satmetrix Systems, Inc. NPS Me is independent and is not affiliated with, sponsored, or endorsed by Bain &amp; Company.
        </div>
      </footer>
    </div>
  );
}

/* --- Embedded demo widget --- */
function DemoWidget() {
  const [score, setScore] = React.useState(null);
  const [comment, setComment] = React.useState("");
  const [sent, setSent] = React.useState(false);
  const [rolling, setRolling] = React.useState(null);

  React.useEffect(() => {
    fetch("/api/demo/metrics")
      .then((r) => r.json())
      .then((d) => setRolling(d?.nps ?? null))
      .catch(() => {});
  }, []);

  const submit = async () => {
    if (score === null) return;
    await fetch("/api/demo/response", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ score, comment }),
    });
    setSent(true);
    const d = await fetch("/api/demo/metrics").then((r) => r.json());
    setRolling(d?.nps ?? null);
  };

  return (
    <div className="mt-5 grid gap-4 md:grid-cols-[1fr_auto] items-start">
      <div>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 11 }, (_, i) => (
            <button
              key={i}
              onClick={() => setScore(i)}
              className={`px-3 py-2 rounded-xl border border-white/10 ${
                score === i ? "bg-[#7C3AED] text-white" : "bg-white/5 text-slate-200 hover:bg-white/10"
              }`}
            >
              {i}
            </button>
          ))}
        </div>
        <textarea
          placeholder="Optional comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="mt-3 w-full rounded-2xl bg-black/30 border border-white/10 p-3 text-sm"
          rows={3}
        />
      </div>
      <div className="flex flex-col items-start gap-3">
        <button
          onClick={submit}
          className="rounded-2xl px-4 py-2 text-sm font-semibold bg-[#22C55E] text-[#0B0F19] hover:bg-[#16A34A] transition"
        >
          Submit
        </button>
        {sent && <div className="text-sm text-slate-300">Thanks! Response recorded.</div>}
        <div className="text-sm text-slate-400">
          Rolling demo NPS: <span className="text-white font-semibold">{rolling ?? "—"}</span>
        </div>
      </div>
    </div>
  );
}
