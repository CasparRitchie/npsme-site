// src/pages/BlogSendingNpsBeforeChristmas.jsx
import React from "react";
import { Link } from "react-router-dom";
import Seo from "../components/Seo";

export default function BlogSendingNpsBeforeChristmas() {
  const title = "Sending an NPS survey before Christmas (without annoying your customers)";
  const description =
    "How to run a respectful, effective pre-Christmas NPS pulse — and what to do with the insights.";

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B0F19] via-[#0C1224] to-[#0B0F19] text-slate-100">
      <Seo
        path="/blog/sending-nps-before-christmas"
        title={`${title} | NPS Me`}
        description={description}
      />

      {/* Hero / header */}
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="pointer-events-none absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_15%_20%,#7C3AED_0%,transparent_40%),radial-gradient(circle_at_80%_20%,#22C55E_0%,transparent_30%)]" />
        <div className="relative mx-auto max-w-7xl px-6 py-10">
          <p className="text-xs uppercase tracking-[0.2em] text-[#22C55E]">
            Blog • NPS &amp; CX
          </p>
          <h1 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight text-white max-w-3xl">
            {title}
          </h1>
          <p className="mt-4 max-w-2xl text-sm md:text-base text-slate-300">
            {description}
          </p>
          <div className="mt-4 text-xs text-slate-400">
            <time dateTime="2025-12-01">Dec 2025</time> · ~7 min read
          </div>
        </div>
      </section>

      {/* Main content */}
      <main className="mx-auto max-w-5xl px-6 py-10">
        <article className="mx-auto max-w-3xl text-sm md:text-[15px] leading-relaxed md:leading-7 text-slate-100">
          {/* Accent rule instead of full-width hr */}
          <div className="w-16 border-t-2 border-[#22C55E] mb-8" />

          {/* Intro */}
          <section className="space-y-4">
            <p>
              A lot of teams want to “get an NPS out before Christmas”. It’s a natural
              point in the year to take stock, and customers are often reflecting on the
              relationship too.
            </p>
            <p>
              The risk is that you add one more generic survey into an already noisy inbox,
              right when people are trying to clear their decks before the break.
            </p>
            <p>
              This post covers a practical way to run a pre-Christmas NPS pulse that:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Respects people’s time and attention.</li>
              <li>Generates clear, directional insight for Q1 planning.</li>
              <li>Supports — rather than clashes with — your personal outreach.</li>
            </ul>
          </section>

          {/* Section 1 */}
          <section className="mt-10 space-y-4">
            <h2 className="text-lg md:text-xl font-semibold text-white">
              1. Be honest about the “job” of this survey
            </h2>
            <p>
              A December NPS pulse is rarely the moment to redesign your entire CX strategy.
              You’re looking for a clean, directional signal that answers questions like:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>“Are we ending the year on a net-positive relationship footing?”</li>
              <li>
                “Which themes are coming up most often in feedback — and should shape our Q1 roadmap?”
              </li>
              <li>
                “Are there any at-risk customers we should proactively speak to before or just after the holidays?”
              </li>
            </ul>
            <p>
              Keeping the “job” small helps you design a small survey — which is key in December.
            </p>
          </section>

          {/* Section 2 */}
          <section className="mt-10 space-y-4">
            <h2 className="text-lg md:text-xl font-semibold text-white">
              2. Keep the ask tiny — and explain why you’re asking
            </h2>
            <p>
              The invite should feel human, short, and purposeful. A good pattern for the email:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <span className="font-semibold">Context:</span> “We’re taking stock of how we’ve done
                this year and planning improvements for 2026.”
              </li>
              <li>
                <span className="font-semibold">The ask:</span> “Would you be happy to answer one quick
                question (and an optional comment)?”
              </li>
              <li>
                <span className="font-semibold">Reassurance:</span> “We’ll read every reply and won’t
                use this for sales follow-ups.”
              </li>
            </ul>
            <p>
              In NPS Me, we can brand the email with your colours, logo and tone of voice, and we can
              run the survey in French, English, or both — whatever fits your customers best.
            </p>
          </section>

          {/* Section 3 */}
          <section className="mt-10 space-y-4">
            <h2 className="text-lg md:text-xl font-semibold text-white">
              3. Make it work alongside founder calls, not instead of them
            </h2>
            <p>
              If you’re also calling customers personally (which is an excellent idea), you don’t want
              the survey to feel like a clumsy duplicate. Instead, you can:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                Use the survey to get a broad, directional signal from everyone — especially those
                you can’t reach by phone.
              </li>
              <li>
                Use founder calls to dive deeper into themes that keep appearing in the comments.
              </li>
              <li>
                Optionally log a short summary of each call, so they appear alongside survey feedback
                in the same dashboard.
              </li>
            </ul>
            <p>
              We can also copy you into the survey responses (or pipe them into your CRM / shared inbox)
              so you see comments in real time.
            </p>
          </section>

          {/* Section 4 */}
          <section className="mt-10 space-y-4">
            <h2 className="text-lg md:text-xl font-semibold text-white">
              4. What you’ll actually see in the NPS Me dashboard
            </h2>
            <p>
              Once we’ve sent the survey to your contact list (via CSV, Excel, or an integration),
              you’ll see:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <span className="font-semibold">Response rates:</span> how many people opened and answered.
              </li>
              <li>
                <span className="font-semibold">NPS score:</span> promoters, passives, detractors, and the
                overall NPS for the pulse.
              </li>
              <li>
                <span className="font-semibold">Comment themes:</span> grouped text analytics showing the main
                topics people mention (and whether they skew positive or negative).
              </li>
            </ul>
            <p>
              For a small base (e.g. ~150 childminder customers), this doesn’t need to be complicated.
              The aim is a clear, honest read on how people feel — plus a shortlist of themes to act on in Q1.
            </p>
          </section>

          {/* Section 5 */}
          <section className="mt-10 space-y-4">
            <h2 className="text-lg md:text-xl font-semibold text-white">
              5. A simple way to get started before Christmas
            </h2>
            <p>Practically, getting this live looks like:</p>
            <ol className="list-decimal pl-5 space-y-2">
              <li>
                You send us a secure file (Excel or CSV) with your customer contacts — or we connect to
                your existing email / CRM tool.
              </li>
              <li>
                We agree the wording of the email and survey (language, tone, branding) so it feels like
                it’s coming from you.
              </li>
              <li>
                We schedule the send, monitor responses, and keep an eye on any sensitive comments that
                need a personal follow-up.
              </li>
              <li>
                We prepare a short, practical read-out of the results and key themes you can use to plan Q1.
              </li>
            </ol>
            <p>
              If you’re already planning individual calls with customers, the survey becomes a light,
              scalable complement — not another demand on your time.
            </p>
          </section>

          {/* CTA / footer */}
          <section className="mt-12">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 md:p-6 text-sm text-slate-200">
              <h3 className="text-base md:text-lg font-semibold text-white">
                Want help sending a respectful pre-Christmas NPS pulse?
              </h3>
              <p className="mt-2">
                NPS Me can handle the send, branding, and analysis for you — including French-language
                surveys and reporting tailored to your context.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  to="/book"
                  className="inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-sm font-semibold bg-[#7C3AED] hover:bg-[#6D28D9] transition"
                >
                  Book a short discovery call
                </Link>
                <a
                  href="mailto:hello@npsme.com"
                  className="text-sm text-[#22C55E] hover:text-[#16A34A]"
                >
                  Or email hello@npsme.com
                </a>
              </div>
            </div>
          </section>
        </article>
      </main>
    </div>
  );
}
