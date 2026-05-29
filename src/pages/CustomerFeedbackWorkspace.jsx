// src/pages/CustomerFeedbackWorkspace.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import Seo from "../components/Seo";
import PageHeader from "../components/PageHeader";
import { useLanguage } from "../i18n/LanguageContext";
import { translations } from "../i18n/translations";
import { localizePath } from "../i18n/pathHelpers";

export default function CustomerFeedbackWorkspace() {
  const { lang } = useLanguage();
  const location = useLocation();
  const tr = (path, fallback = "") => translations(lang, path, fallback);

  const featureCards = tr("customerFeedbackWorkspace.featureCards", []);
  const checklistItems = tr("customerFeedbackWorkspace.checklist.items", []);
  const whoItsForItems = tr("customerFeedbackWorkspace.whoItsFor.items", []);
  const whatItsNotItems = tr("customerFeedbackWorkspace.whatItsNot.items", []);
  const pricingLines = tr("customerFeedbackWorkspace.commercialSimple.pricing", []);
  const setupSteps = tr("customerFeedbackWorkspace.setupSteps.items", []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B0F19] via-[#0C1224] to-[#0B0F19] text-slate-200">
      <Seo
        path={location.pathname}
        title={tr(
          "customerFeedbackWorkspace.seo.title",
          "Customer Feedback Workspace for Startups & SMEs | NPS Me"
        )}
        description={tr(
          "customerFeedbackWorkspace.seo.description",
          "A private customer feedback workspace for importing NPS data, analysing responses, generating AI-assisted insights, and managing close-the-loop actions."
        )}
      />

      <PageHeader
        iconLabel={tr("customerFeedbackWorkspace.header.iconLabel", "Workspace")}
        tag={tr(
          "customerFeedbackWorkspace.header.tag",
          "NPS Me / Customer Feedback Workspace"
        )}
        accent={tr(
          "customerFeedbackWorkspace.header.accent",
          "Private feedback workspace"
        )}
        title={tr(
          "customerFeedbackWorkspace.header.title",
          "Turn customer feedback into clear actions"
        )}
        subtitle={tr(
          "customerFeedbackWorkspace.header.subtitle",
          "A practical, private workspace for startups and SMEs who want to import NPS data, understand what customers are saying, and manage close-the-loop follow-up without buying an enterprise CX platform."
        )}
      />

      <main className="mx-auto max-w-6xl px-6 pb-20">
        <section className="grid gap-6 md:grid-cols-[1.3fr_0.7fr]">
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/30">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#22C55E]">
              {tr(
                "customerFeedbackWorkspace.hero.kicker",
                "Productised setup + workspace"
              )}
            </p>

            <h2 className="mt-4 text-3xl font-bold text-white md:text-4xl">
              {tr(
                "customerFeedbackWorkspace.hero.title",
                "A working feedback system, not another vague dashboard."
              )}
            </h2>

            <p className="mt-4 leading-7 text-slate-300">
              {tr(
                "customerFeedbackWorkspace.hero.body",
                "NPS Me helps you move from scattered survey exports, NPS scores and customer comments to a private workspace where feedback can be imported, analysed and turned into visible follow-up actions."
              )}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to={localizePath("/book?topic=nps-programme-setup", lang)}
                className="rounded-full bg-[#22C55E] px-5 py-3 text-sm font-bold text-[#06110B] shadow-lg shadow-[#22C55E]/20 transition hover:-translate-y-0.5 hover:bg-[#86EFAC]"
              >
                {tr(
                  "customerFeedbackWorkspace.hero.ctaPrimary",
                  "Book a setup discussion"
                )}
              </Link>

              <Link
                to={localizePath("/workspace/login", lang)}
                className="rounded-full border border-white/15 px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:border-[#22C55E]/60"
              >
                {tr(
                  "customerFeedbackWorkspace.hero.ctaSecondary",
                  "Workspace login"
                )}
              </Link>
            </div>
          </div>

          <aside className="rounded-3xl border border-[#22C55E]/20 bg-[#22C55E]/[0.06] p-6">
            <h3 className="text-xl font-bold text-white">
              {tr(
                "customerFeedbackWorkspace.sidebar.title",
                "Typical starting point"
              )}
            </h3>

            <ul className="mt-4 space-y-3 text-sm text-slate-300">
              {tr("customerFeedbackWorkspace.sidebar.items", []).map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>

            <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-sm text-slate-400">
                {tr("customerFeedbackWorkspace.sidebar.priceLabel", "Setup from")}
              </p>
              <p className="mt-1 text-3xl font-black text-white">
                {tr("customerFeedbackWorkspace.sidebar.priceValue", "£2,500")}
              </p>
              <p className="mt-2 text-sm text-slate-300">
                {tr(
                  "customerFeedbackWorkspace.sidebar.priceNote",
                  "Optional monthly support from £350/month."
                )}
              </p>
            </div>
          </aside>
        </section>

        <section className="mt-10 grid gap-6 md:grid-cols-3">
          {featureCards.map((card) => (
            <FeatureCard key={card.title} title={card.title} text={card.text} />
          ))}
        </section>

        <section className="mt-12 rounded-3xl border border-white/10 bg-white/[0.04] p-6 md:p-8">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#22C55E]">
              {tr("customerFeedbackWorkspace.checklist.kicker", "What you get")}
            </p>
            <h2 className="mt-3 text-3xl font-bold text-white">
              {tr(
                "customerFeedbackWorkspace.checklist.title",
                "A practical customer feedback operating layer"
              )}
            </h2>
            <p className="mt-4 leading-7 text-slate-300">
              {tr(
                "customerFeedbackWorkspace.checklist.body",
                "The workspace is designed to sit on top of tools you already use. It does not replace Intercom, HubSpot, Zendesk or spreadsheets. It gives founders, CX leads and operations teams a clearer way to turn feedback into decisions and action."
              )}
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {checklistItems.map((item) => (
              <ChecklistItem
                key={item.title}
                title={item.title}
                text={item.text}
              />
            ))}
          </div>
        </section>

        <section className="mt-12 grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <h2 className="text-2xl font-bold text-white">
              {tr("customerFeedbackWorkspace.whoItsFor.title", "Who this is for")}
            </h2>
            <ul className="mt-5 space-y-3 text-slate-300">
              {whoItsForItems.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <h2 className="text-2xl font-bold text-white">
              {tr("customerFeedbackWorkspace.whatItsNot.title", "What this is not")}
            </h2>
            <ul className="mt-5 space-y-3 text-slate-300">
              {whatItsNotItems.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mt-12 rounded-3xl border border-[#22C55E]/20 bg-[#22C55E]/[0.06] p-6 md:p-8">
          <div className="grid gap-6 md:grid-cols-[1fr_0.8fr] md:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#22C55E]">
                {tr(
                  "customerFeedbackWorkspace.commercialSimple.kicker",
                  "Commercially simple"
                )}
              </p>
              <h2 className="mt-3 text-3xl font-bold text-white">
                {tr(
                  "customerFeedbackWorkspace.commercialSimple.title",
                  "Start with a setup. Add support if it proves useful."
                )}
              </h2>
              <p className="mt-4 leading-7 text-slate-300">
                {tr(
                  "customerFeedbackWorkspace.commercialSimple.body",
                  "The first version is intentionally practical: set up the workspace, import the first dataset, review the findings, and agree how your team will close the loop. If the rhythm works, you can add monthly support, regular reporting or deeper integrations."
                )}
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-black/20 p-6">
              {pricingLines.map((line) => (
                <PricingLine
                  key={line.label}
                  label={line.label}
                  value={line.value}
                />
              ))}

              <Link
                to={localizePath("/book?topic=nps-programme-setup", lang)}
                className="mt-6 inline-flex w-full justify-center rounded-full bg-[#22C55E] px-5 py-3 text-sm font-bold text-[#06110B] transition hover:bg-[#86EFAC]"
              >
                {tr(
                  "customerFeedbackWorkspace.commercialSimple.cta",
                  "Book a setup discussion"
                )}
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-12 rounded-3xl border border-white/10 bg-white/[0.04] p-6 md:p-8">
          <h2 className="text-3xl font-bold text-white">
            {tr("customerFeedbackWorkspace.setupSteps.title", "How setup works")}
          </h2>

          <div className="mt-8 grid gap-5 md:grid-cols-4">
            {setupSteps.map((step) => (
              <StepCard
                key={step.number}
                number={step.number}
                title={step.title}
                text={step.text}
              />
            ))}
          </div>
        </section>

        <section className="mt-12 text-center">
          <h2 className="text-3xl font-bold text-white">
            {tr(
              "customerFeedbackWorkspace.finalCta.title",
              "Want to see if this fits your team?"
            )}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-300">
            {tr(
              "customerFeedbackWorkspace.finalCta.body",
              "Book a short setup discussion. Bring a sample export or describe your current feedback process, and NPS Me will suggest the simplest route to a working feedback workflow."
            )}
          </p>

          <div className="mt-6 flex justify-center">
            <Link
              to={localizePath("/book?topic=nps-programme-setup", lang)}
              className="rounded-full bg-[#22C55E] px-6 py-3 text-sm font-bold text-[#06110B] shadow-lg shadow-[#22C55E]/20 transition hover:-translate-y-0.5 hover:bg-[#86EFAC]"
            >
              {tr(
                "customerFeedbackWorkspace.finalCta.cta",
                "Book a setup discussion"
              )}
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

function FeatureCard({ title, text }) {
  return (
    <article className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
      <h3 className="text-xl font-bold text-white">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-300">{text}</p>
    </article>
  );
}

function ChecklistItem({ title, text }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <h3 className="font-bold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-300">{text}</p>
    </article>
  );
}

function PricingLine({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/10 py-3 last:border-b-0">
      <span className="text-sm text-slate-300">{label}</span>
      <strong className="text-right text-white">{value}</strong>
    </div>
  );
}

function StepCard({ number, title, text }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-black/20 p-5">
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#22C55E]/15 text-sm font-black text-[#86EFAC]">
        {number}
      </span>
      <h3 className="mt-4 font-bold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-300">{text}</p>
    </article>
  );
}
