// src/pages/WhyNpsMe.jsx
import React from "react";
import { Link } from "react-router-dom";
import Seo from "../components/Seo";
import { CheckCircle2, ArrowRight, LineChart, Users, Wrench } from "lucide-react";
import PageHeader from "../components/PageHeader";
import { useLanguage } from "../i18n/LanguageContext";
import { translations } from "../i18n/translations";

export default function WhyNpsMe() {
  const { lang } = useLanguage();
  const tr = (p, f) => translations(lang, p, f);

  const valueCards = [
    {
      icon: LineChart,
      title: tr("whyNpsMe.whatYouGet.cards.pnl.title"),
      points: translations(lang, "whyNpsMe.whatYouGet.cards.pnl.points", []),
    },
    {
      icon: Users,
      title: tr("whyNpsMe.whatYouGet.cards.teams.title"),
      points: translations(lang, "whyNpsMe.whatYouGet.cards.teams.points", []),
    },
    {
      icon: Wrench,
      title: tr("whyNpsMe.whatYouGet.cards.systems.title"),
      points: translations(lang, "whyNpsMe.whatYouGet.cards.systems.points", []),
    },
  ];

  const reassuranceItems = translations(lang, "whyNpsMe.reassurance.items", []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B0F19] via-[#0C1224] to-[#0B0F19] text-slate-200">
      <Seo
        path="/why-nps-me"
        title={tr("whyNpsMe.seoTitle")}
        description={tr("whyNpsMe.seoDescription")}
      />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/10">
        <PageHeader iconLabel={tr("whyNpsMe.header.iconLabel")} tag={tr("whyNpsMe.header.tag")}>
          <>
            <h1 className="mt-2 text-3xl md:text-4xl font-semibold tracking-tight text-white">
              {tr("whyNpsMe.header.title")}
            </h1>

            <p className="mt-4 max-w-2xl text-slate-300">
              {tr("whyNpsMe.header.intro")}
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Link
                to="/book"
                className="inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-semibold bg-[#22C55E] text-[#0B0F19] hover:bg-[#16A34A] transition"
              >
                {tr("whyNpsMe.header.ctaBook")}
                <ArrowRight className="h-4 w-4" />
              </Link>

              {/* keep anchors stable as agreed */}
              <a
                href="/#demo"
                className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white"
              >
                {tr("whyNpsMe.header.ctaDemo")}
              </a>
            </div>
          </>
        </PageHeader>
      </section>

      {/* What we actually do */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <h2 className="text-2xl md:text-3xl font-semibold text-white">
          {tr("whyNpsMe.whatYouGet.title")}
        </h2>
        <p className="mt-3 max-w-3xl text-slate-300">
          {tr("whyNpsMe.whatYouGet.body")}
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {valueCards.map((card) => (
            <ValueCard key={card.title} icon={card.icon} title={card.title} points={card.points} />
          ))}
        </div>
      </section>

      {/* NPS Me vs big consultancy */}
      <section className="mx-auto max-w-7xl px-6 pb-12">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-white">
            {tr("whyNpsMe.vs.title")}
          </h2>
          <p className="mt-3 text-slate-300 max-w-3xl">
            {tr("whyNpsMe.vs.body")}
          </p>

          <div className="mt-6 grid gap-6 md:grid-cols-2 text-sm">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
              <h3 className="text-sm font-semibold text-slate-200 mb-2">
                {tr("whyNpsMe.vs.leftTitle")}
              </h3>
              <ul className="space-y-2 text-slate-300">
                {translations(lang, "whyNpsMe.vs.leftPoints", []).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-[#22C55E]/40 bg-gradient-to-br from-[#141B2E] to-[#0F172A] p-5">
              <h3 className="text-sm font-semibold text-slate-50 mb-2">
                {tr("whyNpsMe.vs.rightTitle")}
              </h3>
              <ul className="space-y-2 text-slate-200">
                {translations(lang, "whyNpsMe.vs.rightPoints", []).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          <p className="mt-6 text-xs text-slate-400">
            {tr("whyNpsMe.vs.footnote")}
          </p>
        </div>
      </section>

      {/* Proof points / reassurance */}
      <section className="mx-auto max-w-7xl px-6 pb-16">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-white">
            {tr("whyNpsMe.reassurance.title")}
          </h2>

          <div className="mt-5 grid gap-6 md:grid-cols-3 text-sm">
            {reassuranceItems.map((item) => (
              <div key={item} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-[#22C55E]" />
                <span className="text-slate-300">{item}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/products"
              className="rounded-2xl px-6 py-3 text-sm font-semibold bg-[#7C3AED] hover:bg-[#6D28D9] transition inline-flex items-center justify-center gap-2"
            >
              {tr("whyNpsMe.reassurance.ctaProducts")}
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              to="/book"
              className="rounded-2xl px-6 py-3 text-sm font-semibold bg-[#22C55E] text-[#0B0F19] hover:bg-[#16A34A] transition inline-flex items-center justify-center gap-2"
            >
              {tr("whyNpsMe.reassurance.ctaBook")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function ValueCard({ icon: Icon, title, points }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#22C55E] flex items-center justify-center">
          <Icon className="h-5 w-5 text-white" />
        </div>
        <h3 className="font-semibold text-white">{title}</h3>
      </div>

      <ul className="mt-3 space-y-2 text-sm text-slate-300 list-disc pl-5">
        {(points || []).map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>
    </div>
  );
}
