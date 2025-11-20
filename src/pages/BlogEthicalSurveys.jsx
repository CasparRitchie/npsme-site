// src/pages/BlogEthicalSurveys.jsx
import React from "react";
import Seo from "../components/Seo";
import { Link } from "react-router-dom";

export default function BlogEthicalSurveys() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B0F19] via-[#0C1224] to-[#0B0F19] text-slate-200">
      <Seo
        path="/blog/ethical-surveys"
        title="When Feedback Fatigue Sets In: The Ethics of Customer Contact Selection | NPS Me"
        description="A reflection by a former Telco Head of Customer Experience (Europe) on survey ethics, contact selection, and how to build genuinely trustworthy feedback systems."
      />

      <main className="mx-auto max-w-3xl px-6 py-12">

        {/* Meta header */}
        <header>
          <p className="text-[11px] uppercase tracking-[0.25em] text-[#22C55E] mb-2">
            Blog • Customer Experience
          </p>

          <h1 className="text-3xl md:text-4xl font-semibold text-white leading-tight">
            When Feedback Fatigue Sets In: The Ethics of Customer Contact Selection
          </h1>

          <p className="mt-3 text-xs md:text-sm text-slate-400">
            By a former Head of Customer Experience (Europe) for a large telco
          </p>

          <div className="mt-6 h-px w-24 bg-gradient-to-r from-[#22C55E] via-[#7C3AED] to-transparent" />
        </header>

        {/* Intro */}
        <section className="mt-8 rounded-2xl border border-white/10 bg-black/30 p-5 md:p-6">
          <p className="text-sm md:text-base text-slate-200 leading-relaxed">
            Every company wants to be customer-centric, but few stop to ask whether
            their feedback processes are <em>ethically customer-centric</em>.
            It’s one thing to measure Net Promoter Score (NPS) — it’s another to ensure
            that the way you collect that feedback actually reflects reality.
          </p>
        </section>

        {/* 1 – Contact selection */}
        <section className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5 md:p-6">
          <h2 className="flex items-center gap-3 text-lg md:text-xl font-semibold text-white">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#7C3AED] to-[#22C55E] text-[11px] font-bold">
              1
            </span>
            <span>Contact selection: the invisible bias</span>
          </h2>

          <div className="mt-3 space-y-3 text-sm md:text-base text-slate-200 leading-relaxed">
            <p>
              At my former company, we used Salesforce to manage “contact selection”
              for our B2B NPS programme. Each Account Manager could flag a contact as
              <strong> “Available for Survey”</strong> or
              <strong> “Not Suitable for Survey.”</strong>
            </p>
            <p>
              On paper, it looked fair. In practice, unhappy contacts could be quietly
              excluded — or whole accounts marked as DNS (Do Not Survey) with no oversight.
            </p>
            <p>
              We later introduced VP-level approval for DNS flags, but the problem remained:
              when the people being measured can choose who speaks, NPS stops measuring
              customer advocacy — and starts measuring survey ethics.
            </p>
          </div>
        </section>

        {/* 2 – Response rates vs authenticity */}
        <section className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5 md:p-6">
          <h2 className="flex items-center gap-3 text-lg md:text-xl font-semibold text-white">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#22C55E] to-[#7C3AED] text-[11px] font-bold">
              2
            </span>
            <span>Response rates vs authenticity</span>
          </h2>

          <div className="mt-3 space-y-3 text-sm md:text-base text-slate-200 leading-relaxed">
            <p>
              Once the survey window opened, Account Managers were encouraged to
              “nudge” customers — often too hard.
            </p>

            <blockquote className="border-l-4 border-[#22C55E] pl-4 italic text-slate-400">
              “Please give us a 9 or 10, otherwise it’s seen as bad.”
              <br />A real poster once found in a Mercure hotel lift.
            </blockquote>

            <p>
              Coaching or pressuring customers damages data integrity.
              The programme becomes performance theatre — chasing numbers instead of truth.
            </p>
          </div>
        </section>

        {/* 3 – How to rebuild trust */}
        <section className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5 md:p-6">
          <h2 className="flex items-center gap-3 text-lg md:text-xl font-semibold text-white">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#7C3AED] to-[#22C55E] text-[11px] font-bold">
              3
            </span>
            <span>How to rebuild trust in feedback</span>
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-sm md:text-base text-slate-200">
            <li>
              <strong>Decouple incentives from scores.</strong>
              Reward behaviours that improve outcomes, not manipulated metrics.
            </li>
            <li>
              <strong>Audit "Do Not Survey" logic.</strong>
              DNS flags should require justification and VP oversight.
            </li>
            <li>
              <strong>Control pre-survey communication.</strong>
              Messaging should come from the company, not individual AMs.
            </li>
            <li>
              <strong>Rotate samples.</strong>
              Re-surveying the same contacts creates fatigue and bias.
            </li>
            <li>
              <strong>Close the loop transparently.</strong>
              Share themes and improvements with customers to rebuild trust.
            </li>
          </ul>
        </section>

        {/* 4 – Final thoughts */}
        <section className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5 md:p-6">
          <h2 className="flex items-center gap-3 text-lg md:text-xl font-semibold text-white">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#22C55E] to-[#7C3AED] text-[11px] font-bold">
              4
            </span>
            <span>Final thoughts</span>
          </h2>

          <div className="mt-3 space-y-3 text-sm md:text-base text-slate-200 leading-relaxed">
            <p>
              Ethical feedback systems aren’t about dodging criticism — they’re about
              earning credibility. A healthy CX programme measures itself not just by the
              height of the NPS bar, but by the integrity behind it.
            </p>
            <p>
              True improvement comes from facing uncomfortable truths…
              and creating a space where customers feel safe enough to voice them.
            </p>
          </div>
        </section>

        {/* CTA footer */}
        <footer className="mt-12">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#141B2E] via-[#0B1120] to-[#0B0F19] p-6 md:p-8 text-center">
            <p className="text-sm md:text-base text-slate-200">
              Want help building an ethical, trustworthy NPS programme?
            </p>
            <p className="mt-2 text-xs md:text-sm text-slate-400 max-w-2xl mx-auto">
              NPS Me helps you design fair sampling, remove bias, and create feedback loops
              customers can believe in.
            </p>

            <div className="mt-5 flex flex-col sm:flex-row justify-center gap-3">
              <Link
                to="/products"
                className="rounded-2xl px-6 py-2.5 text-sm font-semibold bg-[#7C3AED] hover:bg-[#6D28D9] transition"
              >
                Explore NPS Me services
              </Link>

              <Link
                to="/book"
                className="rounded-2xl px-6 py-2.5 text-sm font-semibold bg-[#22C55E] text-[#020617] hover:bg-[#16A34A] transition"
              >
                Book a discovery call
              </Link>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
