// src/SocialListening.jsx
import React from "react";
import { motion } from "framer-motion";
import Seo from "./components/Seo";
import SocialTicker from "./components/SocialTicker";
import PageHeader from "./components/PageHeader";
import { translations as t } from "./i18n/translations";
import { useLanguage } from "./i18n/LanguageContext"; // adjust import to match your project

export default function SocialListening() {
  const { lang } = useLanguage();

  const cards = t(lang, "socialListening.track.cards", []);
  const positive = t(lang, "socialListening.example.positive", []);
  const negative = t(lang, "socialListening.example.negative", []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B0F19] via-[#0C1224] to-[#0B0F19] text-slate-200">
      <Seo
        path="/social-listening"
        title={t(lang, "socialListening.seoTitle")}
        description={t(lang, "socialListening.seoDescription")}
      />

      <PageHeader
        iconLabel={t(lang, "socialListening.header.iconLabel")}
        tag={t(lang, "socialListening.header.tag")}
        title={t(lang, "socialListening.header.title")}
        subtitle={t(lang, "socialListening.header.subtitle")}
      />

      <section className="mx-auto max-w-6xl px-6 py-20">
        {/* Section: What we track */}
        <div className="mt-10 grid md:grid-cols-3 gap-8">
          {cards.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition"
            >
              <h3 className="text-white text-xl font-medium mb-2">{item.title}</h3>
              <p className="text-slate-400 text-sm">{item.text}</p>
            </div>
          ))}
        </div>

        {/* Section: Example insight */}
        <div className="mt-16 rounded-3xl border border-white/10 bg-black/30 p-8">
          <h2 className="text-2xl font-semibold text-white mb-3">
            {t(lang, "socialListening.example.title")}
          </h2>
          <p className="text-slate-400 mb-5 max-w-3xl">
            {t(lang, "socialListening.example.body")}
          </p>

          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <div className="rounded-2xl border border-white/10 bg-[#0C1224] p-6">
              <h4 className="text-lg text-white mb-2">
                {t(lang, "socialListening.example.positiveTitle")}
              </h4>
              <ul className="list-disc pl-5 space-y-1 text-slate-400 text-sm">
                {positive.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#0C1224] p-6">
              <h4 className="text-lg text-white mb-2">
                {t(lang, "socialListening.example.negativeTitle")}
              </h4>
              <ul className="list-disc pl-5 space-y-1 text-slate-400 text-sm">
                {negative.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-semibold text-white mb-3">
            {t(lang, "socialListening.cta.title")}
          </h2>
          <p className="text-slate-400 mb-6">
            {t(lang, "socialListening.cta.body")}
          </p>
          <a
            href="/cx-pulse-sample"
            className="inline-block rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#22C55E] px-6 py-3 font-medium text-white hover:opacity-90 transition"
          >
            {t(lang, "socialListening.cta.button")}
          </a>
        </div>

        <SocialTicker />
      </section>
    </div>
  );
}
