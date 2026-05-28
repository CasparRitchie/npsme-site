// src/components/landing/LandingMethodSection.jsx
import React from "react";
import { motion } from "framer-motion";
import { Star, LineChart, Wrench, Gauge } from "lucide-react";
import { useLanguage } from "../../i18n/LanguageContext";
import { translations } from "../../i18n/translations";

export default function LandingMethodSection() {
  const { lang } = useLanguage();
  const tr = (p, f) => translations(lang, p, f);
  const methodCards = translations(lang, "landing.method.cards", []);

  return (
    <section id="method" className="mx-auto max-w-7xl px-6 pb-20">
      <div className="max-w-3xl">
        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-white">
          {tr("landing.method.title")}
        </h2>
        <p className="mt-3 text-slate-300">
          {tr("landing.method.body")}
        </p>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {methodCards.map((card, i) => {
          const Icon = [Star, LineChart, Wrench, Gauge][i] || Star;

          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="rounded-2xl border border-white/10 bg-white/5 p-6"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#22C55E]">
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-semibold text-white">{card.title}</h3>
              </div>
              <p className="mt-3 text-sm text-slate-300">{card.desc}</p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
