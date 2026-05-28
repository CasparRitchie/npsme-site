// src/components/landing/LandingMilestoneNpsSection.jsx
import React from "react";
import { useLanguage } from "../../i18n/LanguageContext";
import { translations } from "../../i18n/translations";

export default function LandingMilestoneNpsSection() {
  const { lang } = useLanguage();
  const tr = (p, f) => translations(lang, p, f);

  const examples = [
    tr("landing.milestone.examples.order"),
    tr("landing.milestone.examples.onboarding"),
    tr("landing.milestone.examples.firstUse"),
  ];

  return (
    <section id="milestone-nps" className="mx-auto max-w-7xl px-6 pb-20">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-white md:text-3xl">
          {tr("landing.milestone.title")}
        </h2>
        <p className="mt-3 max-w-3xl text-slate-300">
          {tr("landing.milestone.intro")}
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {examples.map((e) => (
            <div key={e.title} className="rounded-2xl border border-white/10 bg-black/20 p-5">
              <div className="font-semibold text-white">{e.title}</div>
              <div className="mt-2 text-sm text-slate-200">{e.question}</div>
              <div className="mt-2 text-xs text-slate-400">{e.why}</div>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
            <div className="font-semibold text-white">
              {tr("landing.milestone.stepsTitle")}
            </div>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-slate-300">
              {translations(lang, "landing.milestone.steps", []).map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
            <div className="font-semibold text-white">
              {tr("landing.milestone.trackTitle")}
            </div>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-300">
              {translations(lang, "landing.milestone.track", []).map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
