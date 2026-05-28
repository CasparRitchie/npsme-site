// src/components/landing/LandingNpsExplainer.jsx
import React from "react";
import { useLanguage } from "../../i18n/LanguageContext";
import { translations } from "../../i18n/translations";

export default function LandingNpsExplainer() {
  const { lang } = useLanguage();
  const tr = (p, f) => translations(lang, p, f);

  return (
    <section id="nps-explainer" className="mx-auto max-w-7xl px-6 pb-20">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
        <h3 className="text-xl font-semibold text-white md:text-2xl">
          {tr("landing.explainer.title")}
        </h3>

        <div className="mt-3 grid gap-6 md:grid-cols-2">
          <div className="text-sm leading-relaxed text-slate-300">
            <p>{tr("landing.explainer.intro")}</p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li><span className="font-medium text-white">{tr("landing.explainer.promoters")}</span>: 9–10</li>
              <li><span className="font-medium text-white">{tr("landing.explainer.passives")}</span>: 7–8</li>
              <li><span className="font-medium text-white">{tr("landing.explainer.detractors")}</span>: 0–6</li>
            </ul>
            <p className="mt-3">{tr("landing.explainer.formula")}</p>
          </div>

          <div className="text-sm leading-relaxed text-slate-300">
            <p className="font-medium text-white">
              {tr("landing.explainer.whereFits")}
            </p>
            <ul className="mt-2 list-disc space-y-2 pl-5">
              <li>{tr("landing.explainer.relationship")}</li>
              <li>{tr("landing.explainer.transactional")}</li>
              <li>{tr("landing.explainer.alongside")}</li>
            </ul>

            <p className="mt-3 font-medium text-white">
              {tr("landing.explainer.cautionsTitle")}
            </p>
            <ul className="mt-2 list-disc space-y-2 pl-5">
              {translations(lang, "landing.explainer.cautions", []).map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
