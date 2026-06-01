// src/DataAutomationPage.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Database,
  Link2,
  Workflow,
  BarChart3,
  Clock,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import Seo from "../components/Seo";
import PageHeader from "../components/PageHeader";
import { useLanguage } from "../i18n/LanguageContext";
import { translations } from "../i18n/translations";
import { localizePath } from "../i18n/pathHelpers";

export default function DataAutomationPage() {
  const location = useLocation();
  const { lang } = useLanguage();
  const tr = (p, f) => translations(lang, p, f);

  const problemBullets = tr("dataAutomation.problem.bullets", []);
  const outcomesBullets = tr("dataAutomation.outcomes.bullets", []);
  const outcomesRightBullets = tr("dataAutomation.outcomes.rightBullets", []);
  const useCases = tr("dataAutomation.useCases.items", []);
  const faqItems = tr("dataAutomation.faq.items", []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B0F19] via-[#0C1224] to-[#0B0F19] text-slate-200">
      <Seo
        path={location.pathname}
        title={tr("dataAutomation.seoTitle")}
        description={tr("dataAutomation.seoDescription")}
      />

      <PageHeader
        iconLabel={tr("dataAutomation.header.iconLabel")}
        tag={tr("dataAutomation.header.tag")}
      >
        <>
          <h1 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight text-white max-w-3xl">
            {tr("dataAutomation.header.title")}
          </h1>

          <p className="mt-4 max-w-2xl text-slate-300 text-sm md:text-base">
            {tr("dataAutomation.header.subtitle")}
          </p>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Link
              to={localizePath("/book", lang)}
              className="inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold bg-[#22C55E] text-[#0B0F19] hover:bg-[#16A34A] transition"
            >
              {tr("dataAutomation.header.ctaBook")}
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              to={localizePath("/impact", lang)}
              className="inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold bg-[#7C3AED] hover:bg-[#6D28D9] transition"
            >
              {tr("dataAutomation.header.ctaImpact")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <p className="mt-4 text-xs text-slate-400 max-w-xl">
            {tr("dataAutomation.header.footnote")}
          </p>
        </>
      </PageHeader>

      {/* The problem */}
      <section className="mx-auto max-w-7xl px-6 py-12 grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="text-2xl font-semibold text-white">
            {tr("dataAutomation.problem.title")}
          </h2>
          <p className="mt-3 text-sm md:text-base text-slate-300">
            {tr("dataAutomation.problem.intro")}
          </p>

          <ul className="mt-4 space-y-3 text-sm text-slate-300">
            <li className="flex gap-2">
              <AlertCircle className="mt-0.5 h-4 w-4 text-amber-400" />
              <span>{problemBullets[0]}</span>
            </li>
            <li className="flex gap-2">
              <Clock className="mt-0.5 h-4 w-4 text-slate-400" />
              <span>{problemBullets[1]}</span>
            </li>
            <li className="flex gap-2">
              <BarChart3 className="mt-0.5 h-4 w-4 text-slate-400" />
              <span>{problemBullets[2]}</span>
            </li>
            <li className="flex gap-2">
              <Database className="mt-0.5 h-4 w-4 text-slate-400" />
              <span>{problemBullets[3]}</span>
            </li>
          </ul>

          <p className="mt-4 text-sm text-slate-300">
            {tr("dataAutomation.problem.outro")}
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <h3 className="text-sm font-semibold text-white">
            {tr("dataAutomation.leaders.title")}
          </h3>
          <p className="mt-3 text-sm text-slate-300 italic">
            {tr("dataAutomation.leaders.quote1")}
          </p>
          <p className="mt-3 text-sm text-slate-300 italic">
            {tr("dataAutomation.leaders.quote2")}
          </p>
          <p className="mt-4 text-xs text-slate-400">
            {tr("dataAutomation.leaders.note")}
          </p>
        </div>
      </section>

      {/* What we actually do */}
      <section className="mx-auto max-w-7xl px-6 pb-12">
        <h2 className="text-2xl font-semibold text-white">
          {tr("dataAutomation.help.title")}
        </h2>
        <p className="mt-3 max-w-3xl text-sm md:text-base text-slate-300">
          {tr("dataAutomation.help.intro")}
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#22C55E] flex items-center justify-center">
                <Link2 className="h-4 w-4 text-white" />
              </div>
              <h3 className="text-sm font-semibold text-white">
                {tr("dataAutomation.help.cards.unify.title")}
              </h3>
            </div>
            <p className="mt-3 text-sm text-slate-300">
              {tr("dataAutomation.help.cards.unify.text")}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#22C55E] flex items-center justify-center">
                <Workflow className="h-4 w-4 text-white" />
              </div>
              <h3 className="text-sm font-semibold text-white">
                {tr("dataAutomation.help.cards.automate.title")}
              </h3>
            </div>
            <p className="mt-3 text-sm text-slate-300">
              {tr("dataAutomation.help.cards.automate.text")}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#22C55E] flex items-center justify-center">
                <BarChart3 className="h-4 w-4 text-white" />
              </div>
              <h3 className="text-sm font-semibold text-white">
                {tr("dataAutomation.help.cards.insight.title")}
              </h3>
            </div>
            <p className="mt-3 text-sm text-slate-300">
              {tr("dataAutomation.help.cards.insight.text")}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#22C55E] flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4 text-white" />
              </div>
              <h3 className="text-sm font-semibold text-white">
                {tr("dataAutomation.help.cards.upskill.title")}
              </h3>
            </div>
            <p className="mt-3 text-sm text-slate-300">
              {tr("dataAutomation.help.cards.upskill.text")}
            </p>
          </div>
        </div>

        <div className="mt-8 text-sm text-slate-300 max-w-3xl">
          <p>{tr("dataAutomation.help.outro")}</p>
        </div>
      </section>

      {/* What this looks like in practice */}
      <section className="mx-auto max-w-7xl px-6 pb-12">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#141B2E] to-[#0F172A] p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-white">
            {tr("dataAutomation.useCases.title")}
          </h2>
          <p className="mt-3 max-w-3xl text-sm md:text-base text-slate-300">
            {tr("dataAutomation.useCases.intro")}
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {useCases.map((item, idx) => (
              <div
                key={item.title || idx}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-5"
              >
                <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-300">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Outcomes */}
      <section className="mx-auto max-w-7xl px-6 pb-12">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8 grid gap-8 md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-semibold text-white">
              {tr("dataAutomation.outcomes.title")}
            </h2>
            <p className="mt-3 text-sm md:text-base text-slate-300">
              {tr("dataAutomation.outcomes.intro")}
            </p>

            <ul className="mt-4 space-y-2 text-sm text-slate-300">
              {outcomesBullets.map((b) => (
                <li key={b} className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-[#22C55E]" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4 text-sm text-slate-300">
            <p>{tr("dataAutomation.outcomes.rightIntro")}</p>
            <ul className="list-disc pl-5 space-y-1">
              {outcomesRightBullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
            <p className="text-xs text-slate-400">
              {tr("dataAutomation.outcomes.note")}
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-7xl px-6 pb-12">
        <div className="rounded-3xl border border-white/10 bg-black/20 p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-white">
            {tr("dataAutomation.faq.title")}
          </h2>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {faqItems.map((item, idx) => (
              <div
                key={item.q || idx}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-5"
              >
                <h3 className="font-semibold text-white">{item.q}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 pb-16">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#141B2E] to-[#0F172A] p-8 md:p-10 text-center">
          <h2 className="text-2xl md:text-3xl font-semibold text-white">
            {tr("dataAutomation.cta.title")}
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-sm md:text-base text-slate-300">
            {tr("dataAutomation.cta.body")}
          </p>

          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to={localizePath("/book", lang)}
              className="inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3 text-sm font-semibold bg-[#22C55E] text-[#0B0F19] hover:bg-[#16A34A] transition"
            >
              {tr("dataAutomation.cta.ctaBook")}
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              to={localizePath("/products", lang)}
              className="inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3 text-sm font-semibold bg-[#7C3AED] hover:bg-[#6D28D9] transition"
            >
              {tr("dataAutomation.cta.ctaProducts")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <p className="mt-4 text-xs text-slate-400">
            {tr("dataAutomation.cta.footnote")}
          </p>
        </div>
      </section>
    </div>
  );
}
