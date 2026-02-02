// src/Products.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowRight, LineChart, Search, Newspaper, Layers } from "lucide-react";
import Seo from "./components/Seo";
import PageHeader from "./components/PageHeader";
import { useLanguage } from "./i18n/LanguageContext.jsx";
import { TRANSLATIONS, translations } from "./i18n/translations.js";
import { localizePath } from "./i18n/pathHelpers.js";

export default function Products() {
  const { lang } = useLanguage();
  const location = useLocation();

  const dict = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const pulseLeft = dict?.products?.pulseExplainer?.left || [];
  const pulseRight = dict?.products?.pulseExplainer?.right || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B0F19] via-[#0C1224] to-[#0B0F19] text-slate-200">
      <Seo
        path={location.pathname}
        lang={lang}
        title={translations(lang, "products.seoTitle", "Products | NPS Me")}
        description={translations(
          lang,
          "products.seoDescription",
          "Pick a CX package to improve outcomes."
        )}
      />

      <PageHeader
        iconLabel={translations(lang, "products.header.iconLabel", "Productized CX services")}
        tag={translations(lang, "products.header.tag", "NPS Me / Services")}
        accent={translations(lang, "products.header.accent", "Productized services")}
        title={translations(lang, "products.header.title", "that turn feedback into growth")}
        subtitle={translations(lang, "products.header.subtitle", "Pick the package that fits your stage.")}
      />

      <section className="mx-auto max-w-7xl px-6 pb-20">
        {/* ✅ Updated grid for 4 cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* 1) Foundations */}
          <ProductCard
            icon={<Search className="h-5 w-5 text-white" />}
            title={translations(lang, "products.cards.foundations.title", "Feedback Foundations")}
            price={translations(lang, "products.cards.foundations.price", "from £450")}
            bullets={dict?.products?.cards?.foundations?.bullets || []}
            cta={{
              label: translations(lang, "products.cards.foundations.cta", "Request audit"),
              href: localizePath("/book", lang),
            }}
          />

          {/* 2) Pulse */}
          <ProductCard
            icon={<Newspaper className="h-5 w-5 text-white" />}
            title={translations(lang, "products.cards.pulse.title", "CX Pulse Report (weekly)")}
            price={translations(lang, "products.cards.pulse.price", "from £190/mo")}
            bullets={dict?.products?.cards?.pulse?.bullets || []}
            cta={{
              label: translations(lang, "products.cards.pulse.cta", "See sample report"),
              href: localizePath("/cx-pulse-sample", lang),
            }}
            footnote={translations(lang, "products.cards.pulse.footnote", "")}
          />

          {/* 3) Intercom Intelligence */}
          <ProductCard
            featured
            icon={<Layers className="h-5 w-5 text-white" />}
            title={translations(lang, "products.cards.intercom.title", "CX Intelligence Layer (Intercom NPS)")}
            price={translations(lang, "products.cards.intercom.price", "from £290/mo")}
            bullets={dict?.products?.cards?.intercom?.bullets || []}
            cta={{
              label: translations(lang, "products.cards.intercom.cta", "View Intercom example"),
              href: localizePath("/intercom-nps-analytics", lang), // adjust route if different
            }}
            footnote={translations(lang, "products.cards.intercom.footnote", "")}
          />

          {/* 4) Momentum */}
          <ProductCard
            icon={<LineChart className="h-5 w-5 text-white" />}
            title={translations(lang, "products.cards.momentum.title", "Momentum Program")}
            price={translations(lang, "products.cards.momentum.price", "from £850/mo")}
            bullets={dict?.products?.cards?.momentum?.bullets || []}
            cta={{
              label: translations(lang, "products.cards.momentum.cta", "Book discovery"),
              href: localizePath("/book", lang),
            }}
          />

        </div>


        <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl md:text-2xl font-semibold text-white">
            {translations(lang, "products.pulseExplainer.title", "What you get in the weekly CX Pulse")}
          </h2>

          <div className="mt-4 grid md:grid-cols-2 gap-6 text-sm text-slate-300">
            <ul className="space-y-2 list-disc pl-5">
              {pulseLeft.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <ul className="space-y-2 list-disc pl-5">
              {pulseRight.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 rounded-3xl border border-white/10 bg-gradient-to-br from-[#141B2E] to-[#0F172A] p-8 text-center">
          <h3 className="text-2xl font-semibold text-white">
            {translations(lang, "products.cta.title", "Ready for a sample?")}
          </h3>
          <p className="mt-3 text-slate-300 max-w-2xl mx-auto">
            {translations(
              lang,
              "products.cta.body",
              "I’ll run a one-off CX Pulse on your brand and send you the PDF within a few days."
            )}
          </p>

          <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:hello@npsme.com?subject=Sample%20CX%20Pulse%20request"
              className="rounded-2xl px-6 py-3 text-sm font-semibold bg-[#22C55E] text-[#0B0F19] hover:bg-[#16A34A] transition inline-flex items-center justify-center gap-2"
            >
              {translations(lang, "products.cta.email", "Email hello@npsme.com")}
              <ArrowRight className="h-4 w-4" />
            </a>

            <Link
              to={localizePath("/book", lang)}
              className="rounded-2xl px-6 py-3 text-sm font-semibold bg-[#7C3AED] hover:bg-[#6D28D9] transition inline-flex items-center justify-center gap-2"
            >
              {translations(lang, "products.cta.book", "Book discovery")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function ProductCard({ icon, title, price, bullets, cta, featured = false, footnote }) {
  const isInternal = cta?.href && cta.href.startsWith("/") && !cta.href.startsWith("//");
  const CTA = isInternal ? Link : "a";
  const ctaProps = isInternal
    ? { to: cta.href }
    : {
        href: cta.href,
        target: cta.href.startsWith("http") ? "_blank" : undefined,
        rel: "noreferrer",
      };

  return (
    <div
      className={
        "rounded-2xl border p-6 " +
        (featured
          ? "border-[#7C3AED]/40 bg-gradient-to-br from-[#141B2E] to-[#0F172A] shadow-[0_0_0_1px_rgba(124,58,237,0.25)]"
          : "border-white/10 bg-white/5")
      }
    >
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#22C55E] flex items-center justify-center">
          {icon}
        </div>
        <h3 className="font-semibold text-white">{title}</h3>
      </div>

      <div className="mt-2 text-sm text-slate-400">{price}</div>

      <ul className="mt-4 space-y-2 text-sm text-slate-300 list-disc pl-5">
        {(bullets || []).map((b) => (
          <li key={b}>{b}</li>
        ))}
      </ul>

      <CTA
        {...ctaProps}
        className="mt-6 inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold bg-[#22C55E] text-[#0B0F19] hover:bg-[#16A34A] transition"
      >
        {cta.label}
        <ArrowRight className="h-4 w-4" />
      </CTA>

      {footnote ? <p className="mt-3 text-[11px] text-slate-500">{footnote}</p> : null}
    </div>
  );
}
