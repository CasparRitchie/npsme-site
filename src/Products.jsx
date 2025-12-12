import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, LineChart, Search, Newspaper } from "lucide-react";
import Seo from "./components/Seo";
import PageHeader from "./components/PageHeader";
import { useLanguage } from "./i18n/LanguageContext.jsx";
import { t, TRANSLATIONS } from "./i18n/translations.js";

export default function Products() {
  const { lang } = useLanguage();

  // Convenience accessor (so we can pull arrays like bullets cleanly)
  const tr = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const seoTitle = t(lang, "products.seoTitle", "Products | NPS Me");
  const seoDescription = t(
    lang,
    "products.seoDescription",
    "Pick a CX package to improve outcomes."
  );

  const pulseLeft = tr?.products?.pulseExplainer?.left || [];
  const pulseRight = tr?.products?.pulseExplainer?.right || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B0F19] via-[#0C1224] to-[#0B0F19] text-slate-200">
    const { lang } = useLanguage();

    <Seo
      path="/products"
      lang={lang}
      title={t(lang, "products.seoTitle")}
      description={t(lang, "products.seoDescription")}
      alternates={[
        { hrefLang: "en", href: "https://www.npsme.com/products" },
        { hrefLang: "fr", href: "https://www.npsme.com/products" }, // NOTE: this is only “real” when FR has its own URL
      ]}
    />

      <PageHeader
        iconLabel={t(lang, "products.header.iconLabel", "Productized CX services")}
        tag={t(lang, "products.header.tag", "NPS Me / Services")}
        accent={t(lang, "products.header.accent", "Productized services")}
        title={t(lang, "products.header.title", "that turn feedback into growth")}
        subtitle={t(
          lang,
          "products.header.subtitle",
          "Pick the package that fits your stage."
        )}
      />

      {/* Product cards */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="grid gap-6 md:grid-cols-3">
          <ProductCard
            icon={<Search className="h-5 w-5 text-white" />}
            title={t(lang, "products.cards.foundations.title", "Feedback Foundations")}
            price={t(lang, "products.cards.foundations.price", "from £450")}
            bullets={tr?.products?.cards?.foundations?.bullets || []}
            cta={{
              label: t(lang, "products.cards.foundations.cta", "Request audit"),
              href: "/book",
            }}
          />

          <ProductCard
            icon={<LineChart className="h-5 w-5 text-white" />}
            title={t(lang, "products.cards.momentum.title", "Momentum Program")}
            price={t(lang, "products.cards.momentum.price", "from £850/mo")}
            bullets={tr?.products?.cards?.momentum?.bullets || []}
            cta={{
              label: t(lang, "products.cards.momentum.cta", "Book discovery"),
              href: "/book",
            }}
          />

          <ProductCard
            featured
            icon={<Newspaper className="h-5 w-5 text-white" />}
            title={t(lang, "products.cards.pulse.title", "CX Pulse Report (weekly)")}
            price={t(lang, "products.cards.pulse.price", "from £190/mo")}
            bullets={tr?.products?.cards?.pulse?.bullets || []}
            cta={{
              label: t(lang, "products.cards.pulse.cta", "See sample report"),
              href: "/cx-pulse-sample",
            }}
            footnote={t(lang, "products.cards.pulse.footnote", "")}
          />
        </div>

        {/* Explainer for CX Pulse */}
        <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl md:text-2xl font-semibold text-white">
            {t(lang, "products.pulseExplainer.title", "What you get in the weekly CX Pulse")}
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

        {/* CTA */}
        <div className="mt-10 rounded-3xl border border-white/10 bg-gradient-to-br from-[#141B2E] to-[#0F172A] p-8 text-center">
          <h3 className="text-2xl font-semibold text-white">
            {t(lang, "products.cta.title", "Ready for a sample?")}
          </h3>
          <p className="mt-3 text-slate-300 max-w-2xl mx-auto">
            {t(
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
              {t(lang, "products.cta.email", "Email hello@npsme.com")}
              <ArrowRight className="h-4 w-4" />
            </a>

            <Link
              to="/book"
              className="rounded-2xl px-6 py-3 text-sm font-semibold bg-[#7C3AED] hover:bg-[#6D28D9] transition inline-flex items-center justify-center gap-2"
            >
              {t(lang, "products.cta.book", "Book discovery")}
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
    : { href: cta.href, target: cta.href.startsWith("http") ? "_blank" : undefined, rel: "noreferrer" };

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
