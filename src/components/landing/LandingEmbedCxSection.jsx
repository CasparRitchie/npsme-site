// src/components/landing/LandingEmbedCxSection.jsx
import React from "react";
import { useLanguage } from "../../i18n/LanguageContext";
import { translations } from "../../i18n/translations";

export default function LandingEmbedCxSection() {
  const { lang } = useLanguage();
  const tr = (p, f) => translations(lang, p, f);
  const pillars = translations(lang, "landing.embedCx.pillars", []);
  const centerTitle = tr("landing.embedCx.centerTitle");
  const centerBody = tr("landing.embedCx.centerBody");

  const [topLeft, topRight, bottomLeft, bottomRight] = pillars;

  const panelBase =
    "min-h-[260px] rounded-[2rem] border border-[#7C3AED]/70 bg-[rgba(8,12,28,0.72)] p-8";
  const headingClass = "text-2xl font-semibold text-[#22C55E]";
  const bodyClass = "mt-4 max-w-[24rem] text-base leading-relaxed text-slate-200";

  return (
    <section id="embed-cx" className="mx-auto max-w-7xl px-6 pb-20">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
        <div className="max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-semibold text-white">
            {tr("landing.embedCx.title")}
          </h2>
          <p className="mt-3 text-slate-300">
            {tr("landing.embedCx.body")}
          </p>
        </div>

        <div className="mt-10">
          <div className="relative mx-auto max-w-6xl">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className={`${panelBase} text-left md:pr-24`}>
                <div className={headingClass}>{topLeft?.title}</div>
                <p className={bodyClass}>{topLeft?.desc}</p>
              </div>

              <div className={`${panelBase} text-right md:pl-24`}>
                <div className={`ml-auto max-w-[24rem] ${headingClass}`}>
                  {topRight?.title}
                </div>
                <p className="mt-4 ml-auto max-w-[24rem] text-base leading-relaxed text-slate-200">
                  {topRight?.desc}
                </p>
              </div>

              <div className={`${panelBase} text-left md:pr-24`}>
                <div className={headingClass}>{bottomLeft?.title}</div>
                <p className={bodyClass}>{bottomLeft?.desc}</p>
              </div>

              <div className={`${panelBase} text-right md:pl-24`}>
                <div className={`ml-auto max-w-[24rem] ${headingClass}`}>
                  {bottomRight?.title}
                </div>
                <p className="mt-4 ml-auto max-w-[24rem] text-base leading-relaxed text-slate-200">
                  {bottomRight?.desc}
                </p>
              </div>
            </div>

            <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 hidden h-[260px] w-[260px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#0B0F19] shadow-[0_0_0_14px_rgba(11,15,25,0.96)] md:flex">
              <div className="flex h-full w-full flex-col items-center justify-center rounded-full border border-[#7C3AED] bg-[radial-gradient(circle_at_top,_rgba(124,58,237,0.18),_rgba(11,15,25,0.96)_58%,_rgba(34,197,94,0.10)_100%)] px-7 text-center">
                <div className="max-w-[170px] text-[1.5rem] font-semibold leading-[1.05] text-white">
                  {centerTitle}
                </div>
                <p className="mt-3 max-w-[180px] text-[0.95rem] leading-[1.35] text-slate-300">
                  {centerBody}
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-[2rem] border border-[#7C3AED] bg-gradient-to-br from-[#7C3AED]/15 to-[#22C55E]/10 p-6 text-center md:hidden">
              <div className="text-xl font-semibold text-white">{centerTitle}</div>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">
                {centerBody}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
