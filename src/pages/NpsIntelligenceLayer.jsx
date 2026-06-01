// src/pages/NpsIntelligenceLayer.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowRight, CheckCircle2 } from "lucide-react";

import Seo from "../components/Seo";
import PageHeader from "../components/PageHeader";
import { useLanguage } from "../i18n/LanguageContext";
import { translations } from "../i18n/translations.js";
import { localizePath } from "../i18n/pathHelpers.js";

export default function NpsIntelligenceLayer() {
  const location = useLocation();
  const { lang } = useLanguage();
  const tr = (path, fallback = "") => translations(lang, path, fallback);

  const painBullets = tr("npsIntelligenceLayer.sections.pain.bullets", []);
  const layerBullets = tr("npsIntelligenceLayer.sections.layer.bullets", []);
  const deliverBullets = tr("npsIntelligenceLayer.sections.deliver.bullets", []);
  const fitBullets = tr("npsIntelligenceLayer.sections.fit.bullets", []);
  const intercomLeft = tr("npsIntelligenceLayer.sections.intercom.left", []);
  const intercomRight = tr("npsIntelligenceLayer.sections.intercom.right", []);
  const deliverItems = tr("npsIntelligenceLayer.sections.deliver.items", []);
  const comparisonRows = tr("npsIntelligenceLayer.sections.comparison.rows", []);
  const faqItems = tr("npsIntelligenceLayer.sections.faq.items", []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B0F19] via-[#0C1224] to-[#0B0F19] text-slate-200">
      <Seo
        path={location.pathname}
        lang={lang}
        title={tr(
          "npsIntelligenceLayer.seoTitle",
          "CX Intelligence Layer for Intercom, CSV and Existing Feedback Tools | NPS Me"
        )}
        description={tr(
          "npsIntelligenceLayer.seoDescription",
          "NPS Me adds a practical CX intelligence layer on top of Intercom, CSV exports and existing feedback tools to turn customer feedback into clearer priorities, reporting and action."
        )}
      />

      <PageHeader
        iconLabel={tr(
          "npsIntelligenceLayer.header.iconLabel",
          "NPS Me / CX Intelligence"
        )}
        tag={tr("npsIntelligenceLayer.header.tag", "NPS Me / Strategy")}
        accent={tr("npsIntelligenceLayer.header.accent", "Intelligence layer")}
        title={tr(
          "npsIntelligenceLayer.header.title",
          "on top of the tools you already use"
        )}
        subtitle={tr(
          "npsIntelligenceLayer.header.subtitle",
          "Your tools collect feedback. NPS Me helps turn it into clearer priorities, reporting and action."
        )}
      />

      <section className="mx-auto max-w-6xl px-6 pb-20">
        {/* Hero */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
          <h2 className="text-2xl md:text-3xl font-semibold text-white">
            {tr(
              "npsIntelligenceLayer.hero.title",
              "A practical CX intelligence layer for teams that already collect feedback"
            )}
          </h2>

          <p className="mt-4 text-slate-300 leading-relaxed max-w-3xl">
            {tr(
              "npsIntelligenceLayer.hero.body1",
              "If you already collect NPS or customer feedback in Intercom, CSV exports or another survey tool, the problem is usually not collection. It is turning responses into something the team can actually use."
            )}
          </p>

          <p className="mt-3 text-slate-300 leading-relaxed max-w-3xl">
            {tr(
              "npsIntelligenceLayer.hero.body2",
              "NPS Me sits on top of your existing setup to help you review feedback more clearly, understand recurring themes, produce better reporting and keep close-the-loop action moving."
            )}
          </p>

          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <Link
              to={localizePath("/book?topic=ongoing-cx-support", lang)}
              className="inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3 text-sm font-semibold bg-[#22C55E] text-[#0B0F19] hover:bg-[#16A34A] transition"
            >
              {tr(
                "npsIntelligenceLayer.hero.ctaPrimary",
                "Book a CX intelligence discussion"
              )}
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              to={localizePath("/cx-pulse-sample", lang)}
              className="inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3 text-sm font-semibold bg-[#7C3AED] hover:bg-[#6D28D9] transition"
            >
              {tr(
                "npsIntelligenceLayer.hero.ctaSecondary",
                "See a sample CX Pulse"
              )}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Pain */}
        <div className="mt-10 rounded-3xl border border-white/10 bg-gradient-to-br from-[#141B2E] to-[#0F172A] p-6 md:p-8">
          <h3 className="text-xl md:text-2xl font-semibold text-white">
            {tr(
              "npsIntelligenceLayer.sections.pain.title",
              "Why feedback programmes still feel unclear"
            )}
          </h3>

          <p className="mt-3 text-slate-300 leading-relaxed max-w-3xl">
            {tr(
              "npsIntelligenceLayer.sections.pain.body",
              "Many teams already have survey responses, comments and dashboards. What they often lack is a practical layer that helps them interpret the signal, explain what matters and decide what to do next."
            )}
          </p>

          <ul className="mt-5 space-y-2 text-sm text-slate-300">
            {painBullets.map((item) => (
              <li key={item} className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 mt-0.5 text-white/70 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <p className="mt-5 text-slate-300 leading-relaxed">
            {tr(
              "npsIntelligenceLayer.sections.pain.footer",
              "The result is usually too much reporting, not enough clarity, and inconsistent follow-through."
            )}
          </p>
        </div>

        {/* Layer */}
        <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
          <h3 className="text-xl md:text-2xl font-semibold text-white">
            {tr(
              "npsIntelligenceLayer.sections.layer.title",
              "What the NPS Me intelligence layer actually does"
            )}
          </h3>

          <p className="mt-3 text-slate-300 leading-relaxed max-w-3xl">
            {tr(
              "npsIntelligenceLayer.sections.layer.body",
              "NPS Me does not try to replace your survey tool, CRM or support platform. It adds a lighter operational layer around them so feedback becomes easier to read, easier to report and easier to act on."
            )}
          </p>

          <ul className="mt-5 grid gap-3 md:grid-cols-2 text-sm text-slate-300">
            {layerBullets.map((item) => (
              <li
                key={item}
                className="flex gap-2 rounded-2xl border border-white/10 bg-white/5 p-4"
              >
                <CheckCircle2 className="h-4 w-4 mt-0.5 text-white/70 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Comparison */}
        <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
          <h3 className="text-xl md:text-2xl font-semibold text-white">
            {tr(
              "npsIntelligenceLayer.sections.comparison.title",
              "How this differs from just using the native dashboard"
            )}
          </h3>

          <p className="mt-3 max-w-3xl text-slate-300">
            {tr(
              "npsIntelligenceLayer.sections.comparison.body",
              "Most tools are good at collecting responses. The missing layer is usually interpretation, prioritisation and workflow."
            )}
          </p>

          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-0 overflow-hidden rounded-2xl border border-white/10 text-sm">
              <thead>
                <tr className="bg-black/30">
                  <th className="border-b border-white/10 px-4 py-3 text-left text-slate-200">
                    {tr("npsIntelligenceLayer.sections.comparison.columns.area", "Area")}
                  </th>
                  <th className="border-b border-white/10 px-4 py-3 text-left text-slate-200">
                    {tr(
                      "npsIntelligenceLayer.sections.comparison.columns.native",
                      "Typical tool / native dashboard"
                    )}
                  </th>
                  <th className="border-b border-white/10 px-4 py-3 text-left text-slate-200">
                    {tr(
                      "npsIntelligenceLayer.sections.comparison.columns.npsme",
                      "NPS Me intelligence layer"
                    )}
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, idx) => (
                  <tr key={row.area || idx} className="bg-white/[0.02]">
                    <td className="border-b border-white/10 px-4 py-3 text-white">
                      {row.area}
                    </td>
                    <td className="border-b border-white/10 px-4 py-3 text-slate-300">
                      {row.native}
                    </td>
                    <td className="border-b border-white/10 px-4 py-3 text-slate-300">
                      {row.npsme}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Intercom example */}
        <div className="mt-10 rounded-3xl border border-white/10 bg-gradient-to-br from-[#141B2E] to-[#0F172A] p-6 md:p-8">
          <h3 className="text-xl md:text-2xl font-semibold text-white">
            {tr("npsIntelligenceLayer.sections.intercom.title", "Example: Intercom + NPS Me")}
          </h3>

          <p className="mt-3 text-slate-300 leading-relaxed max-w-3xl">
            {tr(
              "npsIntelligenceLayer.sections.intercom.body",
              "Intercom can already collect the score and the comment. NPS Me adds a clearer way to interpret responses, surface themes and keep action moving."
            )}
          </p>

          <figure className="mt-6 rounded-3xl border border-white/10 bg-black/20 p-4 md:p-6">
            <img
              src="/npsme_intercom_diagram.png"
              alt="Intercom + NPS Me intelligence loop: feedback is collected in Intercom, analysed in NPS Me, then turned into decisions and actions."
              title="Intercom + NPS Me intelligence layer loop"
              loading="lazy"
              decoding="async"
              width={1200}
              height={900}
              className="w-full h-auto rounded-2xl"
            />
            <figcaption className="mt-3 text-xs text-slate-400">
              {tr(
                "npsIntelligenceLayer.sections.intercom.diagramCaption",
                "Example loop: Intercom captures feedback → NPS Me adds interpretation and workflow → actions feed back into the business."
              )}
            </figcaption>
          </figure>

          <div className="mt-5 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="text-sm font-semibold text-white">
                {tr(
                  "npsIntelligenceLayer.sections.intercom.boxLeftTitle",
                  "Intercom gives you"
                )}
              </div>
              <ul className="mt-3 space-y-2 text-sm text-slate-300 list-disc pl-5">
                {intercomLeft.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="text-sm font-semibold text-white">
                {tr(
                  "npsIntelligenceLayer.sections.intercom.boxRightTitle",
                  "NPS Me adds"
                )}
              </div>
              <ul className="mt-3 space-y-2 text-sm text-slate-300 list-disc pl-5">
                {intercomRight.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </div>
          </div>

          <p className="mt-5 text-slate-300 leading-relaxed">
            {tr(
              "npsIntelligenceLayer.sections.intercom.footer",
              "The goal is not another dashboard. It is a clearer way for the team to understand what customers are saying and what should happen next."
            )}
          </p>
        </div>

        {/* Deliver */}
        <div className="mt-10 rounded-3xl border border-white/10 bg-gradient-to-br from-[#141B2E] to-[#0F172A] p-6 md:p-8">
          <h3 className="text-xl md:text-2xl font-semibold text-white">
            {tr(
              "npsIntelligenceLayer.sections.deliver.title",
              "What you typically get"
            )}
          </h3>

          <ul className="mt-5 space-y-2 text-sm text-slate-300">
            {deliverBullets.map((item) => (
              <li key={item} className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 mt-0.5 text-white/70 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {deliverItems.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-white/10 bg-black/20 p-5"
              >
                <h4 className="font-semibold text-white">{item.title}</h4>
                <p className="mt-2 text-sm text-slate-300">{item.text}</p>
              </div>
            ))}
          </div>

          <p className="mt-5 text-slate-300 leading-relaxed">
            {tr(
              "npsIntelligenceLayer.sections.deliver.footer",
              "It stays grounded in your actual feedback data and focused on helping the team make better decisions."
            )}
          </p>
        </div>

        {/* Medallia */}
        <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
          <h3 className="text-xl md:text-2xl font-semibold text-white">
            {tr(
              "npsIntelligenceLayer.sections.medallia.title",
              "Where enterprise tools still need interpretation"
            )}
          </h3>

          <p className="mt-3 text-slate-300 leading-relaxed">
            {tr(
              "npsIntelligenceLayer.sections.medallia.body1",
              "Enterprise CX platforms can be powerful, but they can also become heavy, complex and difficult to translate into everyday decisions."
            )}
          </p>

          <p className="mt-3 text-slate-300 leading-relaxed">
            {tr(
              "npsIntelligenceLayer.sections.medallia.body2",
              "NPS Me is designed to help teams focus on the practical layer around the data: what matters, what to prioritise and how to keep action moving."
            )}
          </p>
        </div>

        {/* Fit */}
        <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
          <h3 className="text-xl md:text-2xl font-semibold text-white">
            {tr("npsIntelligenceLayer.sections.fit.title", "Who this is for")}
          </h3>

          <ul className="mt-5 space-y-2 text-sm text-slate-300">
            {fitBullets.map((item) => (
              <li key={item} className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 mt-0.5 text-white/70 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* FAQ */}
        <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
          <h3 className="text-xl md:text-2xl font-semibold text-white">
            {tr(
              "npsIntelligenceLayer.sections.faq.title",
              "Common questions"
            )}
          </h3>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {faqItems.map((item, idx) => (
              <div
                key={item.q || idx}
                className="rounded-2xl border border-white/10 bg-black/20 p-5"
              >
                <h4 className="font-semibold text-white">{item.q}</h4>
                <p className="mt-2 text-sm leading-6 text-slate-300">{item.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Related */}
        <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
          <h3 className="text-sm font-semibold text-slate-300">
            {tr("npsIntelligenceLayer.related.title", "Related insights")}
          </h3>

          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link
                to={localizePath("/intercom-nps-analytics", lang)}
                className="text-slate-200 hover:text-white hover:underline"
              >
                {tr(
                  "npsIntelligenceLayer.related.links.intercom",
                  "Intercom NPS: what it shows, what it misses, and how to act"
                )}
              </Link>
            </li>

            <li>
              <Link
                to={localizePath("/milestone-nps", lang)}
                className="text-slate-200 hover:text-white hover:underline"
              >
                {tr(
                  "npsIntelligenceLayer.related.links.milestone",
                  "Milestone NPS: measure friction across the journey"
                )}
              </Link>
            </li>

            <li>
              <Link
                to={localizePath("/customer-feedback-workspace", lang)}
                className="text-slate-200 hover:text-white hover:underline"
              >
                {tr(
                  "npsIntelligenceLayer.related.links.workspace",
                  "Customer Feedback Workspace"
                )}
              </Link>
            </li>

            <li>
              <Link
                to={localizePath("/cx-pulse-sample", lang)}
                className="text-slate-200 hover:text-white hover:underline"
              >
                {tr(
                  "npsIntelligenceLayer.related.links.pulse",
                  "See a sample CX Pulse"
                )}
              </Link>
            </li>
          </ul>
        </div>

        {/* Continue exploring */}
        <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
          <h3 className="text-xl font-semibold text-white">
            {tr("npsIntelligenceLayer.continueExploring.title")}
          </h3>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Link
              to={localizePath("/intercom-nps-analytics", lang)}
              className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-200 hover:bg-white/10 transition"
            >
              {tr("npsIntelligenceLayer.continueExploring.intercom")}
            </Link>

            <Link
              to={localizePath("/milestone-nps", lang)}
              className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-200 hover:bg-white/10 transition"
            >
              {tr("npsIntelligenceLayer.continueExploring.milestone")}
            </Link>

            <Link
              to={localizePath("/what-is-nps", lang)}
              className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-200 hover:bg-white/10 transition"
            >
              {tr("npsIntelligenceLayer.continueExploring.whatIsNps")}
            </Link>

            <Link
              to={localizePath("/nps-survey-programme", lang)}
              className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-200 hover:bg-white/10 transition"
            >
              {tr("npsIntelligenceLayer.continueExploring.surveyProgramme")}
            </Link>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-10 rounded-3xl border border-white/10 bg-gradient-to-br from-[#141B2E] to-[#0F172A] p-8 text-center">
          <h3 className="text-2xl font-semibold text-white">
            {tr(
              "npsIntelligenceLayer.cta.title",
              "Want a clearer way to turn feedback into action?"
            )}
          </h3>

          <p className="mt-3 text-slate-300 max-w-2xl mx-auto">
            {tr(
              "npsIntelligenceLayer.cta.body",
              "We can look at your current tools, where your feedback sits, and whether a lighter intelligence layer would help your team review, report and act more effectively."
            )}
          </p>

          <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to={localizePath("/book?topic=ongoing-cx-support", lang)}
              className="rounded-2xl px-6 py-3 text-sm font-semibold bg-[#22C55E] text-[#0B0F19] hover:bg-[#16A34A] transition inline-flex items-center justify-center gap-2"
            >
              {tr(
                "npsIntelligenceLayer.cta.primary",
                "Book a CX intelligence discussion"
              )}
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              to={localizePath("/cx-pulse-sample", lang)}
              className="rounded-2xl px-6 py-3 text-sm font-semibold bg-[#7C3AED] hover:bg-[#6D28D9] transition inline-flex items-center justify-center gap-2"
            >
              {tr("npsIntelligenceLayer.cta.secondary", "See a sample CX Pulse")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <p className="mt-4 text-xs text-slate-400">
            {tr(
              "npsIntelligenceLayer.cta.note",
              "No platform rip-out required. No survey rebuild required."
            )}
          </p>
        </div>
      </section>
    </div>
  );
}
