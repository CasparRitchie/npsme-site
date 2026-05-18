import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowRight, Briefcase, Layers, CheckCircle2 } from "lucide-react";
import Seo from "./components/Seo";
import PageHeader from "./components/PageHeader";
import { useLanguage } from "./i18n/LanguageContext.jsx";
import { translations } from "./i18n/translations.js";
import { localizePath } from "./i18n/pathHelpers.js";

export default function Products() {
  const { lang } = useLanguage();
  const location = useLocation();

  const comparison = translations(lang, "products.comparison.rows", []);
  const offers = translations(lang, "products.offers", []);
  const setupSteps = translations(lang, "products.setupSteps.items", []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B0F19] via-[#0C1224] to-[#0B0F19] text-slate-200">
      <Seo
        path={location.pathname}
        lang={lang}
        title={translations(lang, "products.seoTitle", "NPS Me offers")}
        description={translations(
          lang,
          "products.seoDescription",
          "Explore the main ways to work with NPS Me."
        )}
      />

      <PageHeader
        iconLabel={translations(lang, "products.header.iconLabel", "NPS Me offers")}
        tag={translations(lang, "products.header.tag", "NPS Me / Offers")}
        accent={translations(lang, "products.header.accent", "Ways to work with")}
        title={translations(lang, "products.header.title", "NPS Me")}
        subtitle={translations(
          lang,
          "products.header.subtitle",
          "Consultancy-backed CX implementation and insight support to help you embed customer experience into the way your business works."
        )}
      />

      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
          <h2 className="text-xl font-semibold text-white md:text-2xl">
            {translations(lang, "products.intro.title")}
          </h2>
          <p className="mt-3 max-w-3xl text-slate-300">
            {translations(lang, "products.intro.body")}
          </p>
        </div>

        {setupSteps.length ? (
          <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
            <div className="max-w-3xl">
              <h2 className="text-xl font-semibold text-white md:text-2xl">
                {translations(lang, "products.setupSteps.title")}
              </h2>
              <p className="mt-3 text-slate-300">
                {translations(lang, "products.setupSteps.body")}
              </p>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {setupSteps.map((step, i) => (
                <div
                  key={step.title}
                  className="rounded-2xl border border-white/10 bg-black/20 p-5"
                >
                  <div className="text-xs uppercase tracking-widest text-[#86EFAC]">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <h3 className="mt-3 font-semibold text-white">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-300">
                    {step.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {offers.map((offer, i) => (
            <OfferCard
              key={offer.title}
              featured={i === 0}
              icon={
                i === 0 ? (
                  <Briefcase className="h-5 w-5 text-white" />
                ) : (
                  <Layers className="h-5 w-5 text-white" />
                )
              }
              title={offer.title}
              badge={offer.badge}
              price={offer.price}
              hint={offer.hint}
              intro={offer.intro}
              bullets={offer.bullets || []}
              includesTitle={offer.includesTitle}
              includes={offer.includes || []}
              outcomeLabel={translations(lang, "products.offer.outcomeLabel")}
              outcome={offer.outcome}
              cta={{
                label: offer.cta,
                href: `${localizePath("/book", lang)}?topic=${offer.topic || "discovery"}`,
              }}
            />
          ))}
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <InfoCard
            title={translations(lang, "products.support.title")}
            body={translations(lang, "products.support.body")}
          />
          <InfoCard
            title={translations(lang, "products.fit.title")}
            body={translations(lang, "products.fit.body")}
          />
        </div>

        <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
          <h2 className="text-xl font-semibold text-white md:text-2xl">
            {translations(lang, "products.comparison.title")}
          </h2>
          <p className="mt-3 max-w-3xl text-slate-300">
            {translations(lang, "products.comparison.body")}
          </p>

          <div className="mt-8 overflow-hidden rounded-2xl border border-white/10">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-white/5">
                <tr className="text-left text-slate-300">
                  <th className="px-4 py-3">
                    {translations(lang, "products.comparison.columns.topic")}
                  </th>
                  <th className="px-4 py-3">
                    {translations(lang, "products.comparison.columns.foundations")}
                  </th>
                  <th className="px-4 py-3">
                    {translations(lang, "products.comparison.columns.embedded")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row) => (
                  <tr key={row.topic} className="border-t border-white/10">
                    <td className="px-4 py-3 font-medium text-white">{row.topic}</td>
                    <td className="px-4 py-3 text-slate-300">{row.foundations}</td>
                    <td className="px-4 py-3 text-slate-300">{row.embedded}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-10 rounded-3xl border border-white/10 bg-gradient-to-br from-[#141B2E] to-[#0F172A] p-8 text-center">
          <h3 className="text-2xl font-semibold text-white">
            {translations(lang, "products.cta.title")}
          </h3>
          <p className="mx-auto mt-3 max-w-2xl text-slate-300">
            {translations(lang, "products.cta.body")}
          </p>

          <div className="mt-6 flex flex-col justify-center gap-4 sm:flex-row">
            <a
              href="mailto:hello@npsme.com"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#22C55E] px-6 py-3 text-sm font-semibold text-[#0B0F19] transition hover:bg-[#16A34A]"
            >
              {translations(lang, "products.cta.email")}
              <ArrowRight className="h-4 w-4" />
            </a>

            <Link
              to={`${localizePath("/book", lang)}?topic=discovery`}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#7C3AED] px-6 py-3 text-sm font-semibold transition hover:bg-[#6D28D9]"
            >
              {translations(lang, "products.cta.book")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function OfferCard({
  icon,
  title,
  badge,
  price,
  hint,
  intro,
  bullets,
  includesTitle,
  includes,
  outcomeLabel,
  outcome,
  cta,
  featured = false,
}) {
  return (
    <div
      className={
        "rounded-2xl border p-6 " +
        (featured
          ? "border-[#7C3AED]/50 bg-gradient-to-br from-[#141B2E] to-[#0F172A] shadow-[0_0_0_1px_rgba(124,58,237,0.25)]"
          : "border-white/10 bg-white/5")
      }
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#22C55E]">
            {icon}
          </div>
          <h3 className="text-xl font-semibold text-white">{title}</h3>
        </div>

        {badge ? (
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-wide text-slate-300">
            {badge}
          </span>
        ) : null}
      </div>

      <div className="mt-3 text-sm text-slate-400">{price}</div>
      {hint ? <div className="mt-1 text-xs text-slate-500">{hint}</div> : null}
      {intro ? <p className="mt-4 text-sm leading-relaxed text-slate-300">{intro}</p> : null}

      <ul className="mt-5 space-y-2 text-sm text-slate-300">
        {bullets.map((b) => (
          <li key={b} className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 text-[#22C55E]" />
            <span>{b}</span>
          </li>
        ))}
      </ul>

      {includesTitle ? (
        <div className="mt-6">
          <div className="text-xs uppercase tracking-widest text-slate-500">
            {includesTitle}
          </div>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-400">
            {includes.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {outcome ? (
        <div className="mt-6 rounded-2xl border border-[#22C55E]/20 bg-[#22C55E]/10 p-4">
          <div className="text-[11px] uppercase tracking-wide text-[#86EFAC]">
            {outcomeLabel}
          </div>
          <div className="mt-1 text-sm text-white">{outcome}</div>
        </div>
      ) : null}

      <Link
        to={cta.href}
        className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-[#22C55E] px-4 py-2 text-sm font-semibold text-[#0B0F19] transition hover:bg-[#16A34A]"
      >
        {cta.label}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

function InfoCard({ title, body }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-6">
      <h3 className="font-semibold text-white">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-slate-300">{body}</p>
    </div>
  );
}
