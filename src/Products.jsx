import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowRight, Briefcase, GraduationCap, Mic, LineChart } from "lucide-react";
import Seo from "./components/Seo";
import PageHeader from "./components/PageHeader";
import { useLanguage } from "./i18n/LanguageContext.jsx";
import { TRANSLATIONS, translations } from "./i18n/translations.js";
import { localizePath } from "./i18n/pathHelpers.js";

export default function Products() {
  const { lang } = useLanguage();
  const location = useLocation();
  const dict = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const cards = dict?.products?.cards || {};
  const detailSections = dict?.products?.detailSections || {};

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B0F19] via-[#0C1224] to-[#0B0F19] text-slate-200">
      <Seo
        path={location.pathname}
        lang={lang}
        title={translations(lang, "products.seoTitle", "NPS Me services")}
        description={translations(
          lang,
          "products.seoDescription",
          "Explore the ways to work with NPS Me."
        )}
      />

      <PageHeader
        iconLabel={translations(lang, "products.header.iconLabel", "NPS Me services")}
        tag={translations(lang, "products.header.tag", "NPS Me / Services")}
        accent={translations(lang, "products.header.accent", "Four ways to work with")}
        title={translations(lang, "products.header.title", "NPS Me")}
        subtitle={translations(
          lang,
          "products.header.subtitle",
          "Choose the format that fits your stage."
        )}
      />

      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
          <h2 className="text-xl md:text-2xl font-semibold text-white">
            {translations(lang, "products.intro.title", "How NPS Me works with teams")}
          </h2>
          <p className="mt-3 text-slate-300 max-w-3xl">
            {translations(lang, "products.intro.body")}
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <OfferCard
            icon={<Briefcase className="h-5 w-5 text-white" />}
            title={cards?.consulting?.title}
            price={cards?.consulting?.price}
            hint={cards?.consulting?.hint}
            bullets={cards?.consulting?.bullets || []}
            examplesTitle={cards?.consulting?.examplesTitle}
            examples={cards?.consulting?.examples || []}
            cta={{
              label: cards?.consulting?.cta,
              href: localizePath("/book", lang),
            }}
          />

          <OfferCard
            icon={<GraduationCap className="h-5 w-5 text-white" />}
            title={cards?.training?.title}
            price={cards?.training?.price}
            hint={cards?.training?.hint}
            bullets={cards?.training?.bullets || []}
            examplesTitle={cards?.training?.examplesTitle}
            examples={cards?.training?.examples || []}
            cta={{
              label: cards?.training?.cta,
              href: localizePath("/training", lang),
            }}
          />

          <OfferCard
            icon={<Mic className="h-5 w-5 text-white" />}
            title={cards?.speaking?.title}
            price={cards?.speaking?.price}
            hint={cards?.speaking?.hint}
            bullets={cards?.speaking?.bullets || []}
            examplesTitle={cards?.speaking?.examplesTitle}
            examples={cards?.speaking?.examples || []}
            cta={{
              label: cards?.speaking?.cta,
              href: localizePath("/speaking", lang),
            }}
          />

          <OfferCard
            featured
            icon={<LineChart className="h-5 w-5 text-white" />}
            title={cards?.insight?.title}
            price={cards?.insight?.price}
            hint={cards?.insight?.hint}
            bullets={cards?.insight?.bullets || []}
            examplesTitle={cards?.insight?.examplesTitle}
            examples={cards?.insight?.examples || []}
            cta={{
              label: cards?.insight?.cta,
              href: localizePath("/cx-pulse-sample", lang),
            }}
          />
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <DetailCard
            title={detailSections?.consulting?.title}
            body={detailSections?.consulting?.body}
          />
          <DetailCard
            title={detailSections?.training?.title}
            body={detailSections?.training?.body}
          />
          <DetailCard
            title={detailSections?.speaking?.title}
            body={detailSections?.speaking?.body}
          />
          <DetailCard
            title={detailSections?.insight?.title}
            body={detailSections?.insight?.body}
          />
        </div>

        <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
          <h2 className="text-xl md:text-2xl font-semibold text-white">
            {translations(lang, "products.comparison.title")}
          </h2>
          <p className="mt-3 text-slate-300 max-w-3xl">
            {translations(lang, "products.comparison.body")}
          </p>
        </div>

        <div className="mt-10 rounded-3xl border border-white/10 bg-gradient-to-br from-[#141B2E] to-[#0F172A] p-8 text-center">
          <h3 className="text-2xl font-semibold text-white">
            {translations(lang, "products.cta.title")}
          </h3>
          <p className="mt-3 text-slate-300 max-w-2xl mx-auto">
            {translations(lang, "products.cta.body")}
          </p>

          <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:hello@npsme.com"
              className="rounded-2xl px-6 py-3 text-sm font-semibold bg-[#22C55E] text-[#0B0F19] hover:bg-[#16A34A] transition inline-flex items-center justify-center gap-2"
            >
              {translations(lang, "products.cta.email")}
              <ArrowRight className="h-4 w-4" />
            </a>

            <Link
              to={`${localizePath("/book", lang)}?topic=consulting`}
              className="rounded-2xl px-6 py-3 text-sm font-semibold bg-[#7C3AED] hover:bg-[#6D28D9] transition inline-flex items-center justify-center gap-2"
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

function OfferCard({ icon, title, price, hint, bullets, examplesTitle, examples, cta, featured = false }) {
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
      {hint ? <div className="mt-1 text-xs text-slate-500">{hint}</div> : null}

      <ul className="mt-4 space-y-2 text-sm text-slate-300 list-disc pl-5">
        {(bullets || []).map((b) => (
          <li key={b}>{b}</li>
        ))}
      </ul>

      {examplesTitle ? (
        <div className="mt-5">
          <div className="text-xs uppercase tracking-widest text-slate-500">
            {examplesTitle}
          </div>
          <ul className="mt-2 space-y-2 text-sm text-slate-400 list-disc pl-5">
            {(examples || []).map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <CTA
        {...ctaProps}
        className="mt-6 inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold bg-[#22C55E] text-[#0B0F19] hover:bg-[#16A34A] transition"
      >
        {cta.label}
        <ArrowRight className="h-4 w-4" />
      </CTA>
    </div>
  );
}

function DetailCard({ title, body }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-6">
      <h3 className="text-white font-semibold">{title}</h3>
      <p className="mt-3 text-sm text-slate-300 leading-relaxed">{body}</p>
    </div>
  );
}
