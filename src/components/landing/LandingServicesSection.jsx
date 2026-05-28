// src/components/landing/LandingServicesSection.jsx
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "../../i18n/LanguageContext";
import { translations } from "../../i18n/translations";
import { localizePath } from "../../i18n/pathHelpers";

export default function LandingServicesSection() {
  const { lang } = useLanguage();
  const tr = (p, f) => translations(lang, p, f);
  const offers = translations(lang, "landing.services.offers", []);
  const ctas = translations(lang, "landing.services.ctas", {
    products: lang === "fr" ? "Voir les offres" : "See offers",
    about: lang === "fr" ? "Pourquoi moi" : "Why me",
  });

  return (
    <section id="services" className="mx-auto max-w-7xl px-6 pb-20">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
        <div className="max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-semibold text-white">
            {tr("landing.services.title")}
          </h2>
          <p className="mt-3 text-slate-300">
            {tr("landing.services.body")}
          </p>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {offers.map((offer, i) => (
            <motion.div
              key={offer.title}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.45, delay: i * 0.05 }}
              className="rounded-2xl border border-white/10 bg-black/20 p-6"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-white text-xl font-semibold">{offer.title}</div>
                  <div className="mt-2 text-sm text-slate-300">{offer.desc}</div>
                </div>
                {offer.badge ? (
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-wide text-slate-300">
                    {offer.badge}
                  </span>
                ) : null}
              </div>

              {offer.bullets?.length ? (
                <ul className="mt-5 space-y-2 list-disc pl-5 text-sm text-slate-300">
                  {offer.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              ) : null}

              {offer.outcome ? (
                <div className="mt-5 rounded-2xl border border-[#22C55E]/20 bg-[#22C55E]/10 p-4">
                  <div className="text-[11px] uppercase tracking-wide text-[#86EFAC]">
                    {tr("landing.services.outcomeLabel")}
                  </div>
                  <div className="mt-1 text-sm text-white">{offer.outcome}</div>
                </div>
              ) : null}
            </motion.div>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            to={localizePath("/products", lang)}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#22C55E] px-4 py-2.5 text-sm font-semibold text-[#0B0F19] transition hover:bg-[#16A34A]"
          >
            {ctas.products}
            <ArrowRight className="h-4 w-4" />
          </Link>

          <Link
            to={localizePath("/about", lang)}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#7C3AED] px-4 py-2.5 text-sm font-semibold transition hover:bg-[#6D28D9]"
          >
            {ctas.about}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
