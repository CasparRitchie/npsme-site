// src/components/landing/LandingScreenshotWorkflowSection.jsx
import React from "react";
import { motion } from "framer-motion";
import { useLanguage } from "../../i18n/LanguageContext";
import { translations } from "../../i18n/translations";
import LandingScreenshotCard from "./LandingScreenshotCard";

export default function LandingScreenshotWorkflowSection() {
  const { lang } = useLanguage();
  const tr = (p, f) => translations(lang, p, f);
  const cards = translations(lang, "landing.screenshots.cards", []);

  if (!cards.length) return null;

  return (
    <section id="screenshots" className="mx-auto max-w-7xl px-6 pb-20">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
        <div className="max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-semibold text-white">
            {tr("landing.screenshots.title")}
          </h2>
          <p className="mt-3 text-slate-300">
            {tr("landing.screenshots.body")}
          </p>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {cards.map((card) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.45 }}
              className="rounded-3xl border border-white/10 bg-black/20 p-4"
            >
              <LandingScreenshotCard image={card} />
              <div className="mt-5">
                <h3 className="font-semibold text-white">{card.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">
                  {card.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
