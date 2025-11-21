// src/SocialListening.jsx
import React from "react";
import { motion } from "framer-motion";
import Seo from "./components/Seo"
import SocialTicker from "./components/SocialTicker";
import PageHeader from "../components/PageHeader";


export default function SocialListening() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B0F19] via-[#0C1224] to-[#0B0F19] text-slate-200">
      <Seo
        path="/social-listening"
        title="Social Listening for CX: Themes, Sentiment & Competitor Pulse | NPS Me"
        description="Weekly signal from public social channels and reviews-surface themes, track sentiment, and prioritise fixes that move NPS® and retention."
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
              Social listening & sentiment
            </p>
          </div>

          <h1 className="mt-3 text-3xl md:text-4xl font-semibold text-white">
            Social Listening &amp; Sentiment Insights
          </h1>
          <p className="mt-3 text-lg text-slate-400 max-w-3xl">
            We analyse what customers are <em>really saying</em> about your brand online —
            across platforms like X (Twitter), Reddit, and Trustpilot — to surface
            actionable insights that guide your CX and marketing decisions.
          </p>
        </motion.div>

      {/* Section: What we track */}
      <div className="mt-10 grid md:grid-cols-3 gap-8">
        {[
          {
            title: "Sentiment Analysis",
            text: "Understand the tone behind every mention - from praise to frustration - to prioritise improvements.",
          },
          {
            title: "Theme Detection",
            text: "Spot recurring themes across channels to reveal what matters most to your customers right now.",
          },
          {
            title: "Trend Monitoring",
            text: "Track sentiment over time and correlate changes with campaigns, launches, or service issues.",
          },
        ].map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition"
          >
            <h3 className="text-white text-xl font-medium mb-2">
              {item.title}
            </h3>
            <p className="text-slate-400 text-sm">{item.text}</p>
          </div>
        ))}
      </div>

      {/* Section: Example insight */}
      <div className="mt-16 rounded-3xl border border-white/10 bg-black/30 p-8">
        <h2 className="text-2xl font-semibold text-white mb-3">
          Example: CX Pulse Report snapshot
        </h2>
        <p className="text-slate-400 mb-5 max-w-3xl">
          In a recent anonymised study, we analysed 2,000+ social mentions for a
          healthcare brand. Our sentiment model revealed three key drivers of
          dissatisfaction - support delays, unclear pricing, and inconsistency
          in tone. By closing these loops, the brand saw a 14-point NPS lift in
          just one quarter.
        </p>

        <div className="grid md:grid-cols-2 gap-6 mt-6">
          <div className="rounded-2xl border border-white/10 bg-[#0C1224] p-6">
            <h4 className="text-lg text-white mb-2">Top Positive Themes</h4>
            <ul className="list-disc pl-5 space-y-1 text-slate-400 text-sm">
              <li>Engaged and friendly staff</li>
              <li>High health value</li>
              <li>Personalised communication</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#0C1224] p-6">
            <h4 className="text-lg text-white mb-2">Top Negative Themes</h4>
            <ul className="list-disc pl-5 space-y-1 text-slate-400 text-sm">
              <li>Support delays and response time</li>
              <li>Pricing transparency concerns</li>
              <li>Inconsistent communication tone</li>
            </ul>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-16 text-center">
        <h2 className="text-2xl font-semibold text-white mb-3">
          Want to understand your brand’s social sentiment?
        </h2>
        <p className="text-slate-400 mb-6">
          Get a tailored CX Pulse Report showing where your customers are
          delighted - and where they’re dropping off.
        </p>
        <a
          href="/cx-pulse-sample"
          className="inline-block rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#22C55E] px-6 py-3 font-medium text-white hover:opacity-90 transition"
        >
          View Sample Report →
        </a>
      </div>
      <SocialTicker />
    </section>
    </div>
  );
}
