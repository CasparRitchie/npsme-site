// src/NpsMeLanding.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowRight, Star, LineChart, Wrench } from "lucide-react";
import Seo from "./components/Seo";
import { computeNpsStats } from "../utils/nps";
import PageHeader from "./components/PageHeader";
import { useLanguage } from "./i18n/LanguageContext";
import { translations } from "./i18n/translations";
import { localizePath } from "./i18n/pathHelpers";
import LandingScreenshotCard from "./components/landing/LandingScreenshotCard";

import LandingServicesSection from "./components/landing/LandingServicesSection";
import LandingMethodSection from "./components/landing/LandingMethodSection";
import LandingScreenshotWorkflowSection from "./components/landing/LandingScreenshotWorkflowSection";
import LandingEmbedCxSection from "./components/landing/LandingEmbedCxSection";
import LandingNpsExplainer from "./components/landing/LandingNpsExplainer";
import LandingMilestoneNpsSection from "./components/landing/LandingMilestoneNpsSection";
import LandingAboutSection from "./components/landing/LandingAboutSection";
import LandingContactSection from "./components/landing/LandingContactSection";

function ProofStrip() {
  const { lang } = useLanguage();
  const label = translations(lang, "landing.proofStrip.label", "");
  const items = translations(lang, "landing.proofStrip.items", []);

  if (!items.length) return null;

  return (
    <section className="mx-auto max-w-7xl px-6 pb-12">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
        <div className="text-xs uppercase tracking-widest text-slate-400">
          {label}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-medium text-white"
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DemoSummaryStrip() {
  const { lang } = useLanguage();
  const tr = (p, f) => translations(lang, p, f);

  const [stats, setStats] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [shouldLoad, setShouldLoad] = React.useState(false);
  const ref = React.useRef(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          obs.disconnect();
        }
      },
      { root: null, rootMargin: "300px", threshold: 0.01 }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  React.useEffect(() => {
    if (!shouldLoad) return;

    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError("");
        const res = await fetch("/api/demo-responses");
        if (!res.ok) throw new Error("Failed to load demo responses");
        const data = await res.json();
        if (!cancelled) setStats(computeNpsStats(data.rows || []));
      } catch (err) {
        console.error("Error loading demo summary", err);
        if (!cancelled) setError("err");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [shouldLoad]);

  return (
    <div ref={ref}>
      {!shouldLoad ? (
        <p className="text-sm text-slate-400">{tr("landing.demo.loading")}</p>
      ) : loading ? (
        <p className="text-sm text-slate-400">{tr("landing.demo.loading")}</p>
      ) : error ? (
        <p className="text-sm text-slate-400">{tr("landing.demo.error")}</p>
      ) : !stats ? (
        <p className="text-sm text-slate-400">{tr("landing.demo.empty")}</p>
      ) : (
        <div className="text-sm text-slate-300">
          <div className="text-xs uppercase tracking-widest text-slate-400">
            {tr("landing.demo.label")}
          </div>
          <div className="mt-1 text-2xl font-semibold text-white">
            {stats.nps ?? "-"}
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            {tr("landing.demo.basedOn").replace("{count}", String(stats.total))}
          </p>
        </div>
      )}
    </div>
  );
}

export default function NpsMeLanding() {
  const { lang } = useLanguage();
  const tr = (p, f) => translations(lang, p, f);
  const location = useLocation();

  const platformCards = translations(lang, "landing.platform.cards", []);
  const screenshotCards = translations(lang, "landing.screenshots.cards", []);
  const heroScreenshot = screenshotCards[0];
  const chips = translations(lang, "landing.hero.chips", {
    help: [],
    worksWith: [],
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B0F19] via-[#0C1224] to-[#0B0F19] text-slate-200">
      <Seo
        path={location.pathname}
        title={tr("landing.seo.title")}
        description={tr("landing.seo.description")}
      />

      <PageHeader iconLabel="NPS Me" tag="NPS Me / Home">
        <div className="grid gap-10 pt-4 md:grid-cols-12">
          <div className="md:col-span-7 lg:col-span-6">
            <h1 className="text-balance break-words text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl">
              {tr("landing.hero.h1.lead")}{" "}
              <span className="md:whitespace-nowrap">
                {tr("landing.hero.h1.nps")}
              </span>{" "}
              {tr("landing.hero.h1.tail")}{" "}
              <span className="block bg-gradient-to-r from-[#7C3AED] to-[#22C55E] bg-clip-text text-transparent sm:inline">
                {tr("landing.hero.h1.accent")}
              </span>
            </h1>

            <p className="mt-5 max-w-xl text-slate-300">
              {tr("landing.hero.body")}
            </p>

            <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <Link
                to={localizePath("/book", lang)}
                className="group inline-flex items-center gap-2 rounded-2xl bg-[#22C55E] px-5 py-3 text-sm font-semibold text-[#0B0F19] transition hover:bg-[#16A34A]"
              >
                {tr("landing.hero.ctaPrimary")}
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </Link>

              <a
                href="#method"
                className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white"
              >
                {tr("landing.hero.ctaMethod")}
              </a>

              <Link
                to={localizePath("/products", lang)}
                className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white"
              >
                {lang === "fr" ? "Voir les offres" : "See services"}
              </Link>
            </div>

            <div className="mt-10 flex items-center gap-6 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                {tr("landing.hero.proof.mining")}
              </div>
              <div className="flex items-center gap-2">
                <Wrench className="h-4 w-4" />
                {tr("landing.hero.proof.enablement")}
              </div>
              <div className="flex items-center gap-2">
                <LineChart className="h-4 w-4" />
                {tr("landing.hero.proof.lift")}
              </div>
            </div>

            <div className="mt-6 space-y-4 text-xs">
              <div>
                <div className="mb-2 text-[11px] uppercase tracking-widest text-slate-400">
                  {lang === "fr" ? "Comment j’aide" : "How I help"}
                </div>
                <div className="flex flex-wrap gap-2">
                  {chips.help?.map((chip) => (
                    <span
                      key={chip}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-300"
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-2 text-[11px] uppercase tracking-widest text-slate-400">
                  {lang === "fr" ? "Compatible avec" : "Works with"}
                </div>
                <div className="flex flex-wrap gap-2">
                  {chips.worksWith?.map((chip) => (
                    <span
                      key={chip}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-300"
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <p className="mt-3 max-w-xl text-[11px] text-slate-400">
              {tr("landing.hero.chipsNote")}
            </p>
          </div>

          <div className="md:col-span-5 lg:col-span-6">
            {heroScreenshot ? (
              <LandingScreenshotCard
                image={{
                  ...heroScreenshot,
                  src: "/images/npsme/nps-me-customer-feedback-dashboard-800.webp",
                  alt: tr("landing.hero.screenshotAlt", heroScreenshot.alt),
                }}
                className="md:mt-2"
                priority
              />
            ) : null}

            <div className="mt-4 rounded-2xl border border-[#22C55E]/20 bg-[#22C55E]/10 p-4">
              <div className="text-xs uppercase tracking-widest text-[#86EFAC]">
                {lang === "fr" ? "Ce que cela montre" : "What this shows"}
              </div>
              <p className="mt-2 text-sm text-slate-200">
                {lang === "fr"
                  ? "Un seul endroit pour voir les scores, les thèmes clients et les actions de suivi."
                  : "One place to see scores, customer themes and follow-up actions."}
              </p>
            </div>
          </div>
        </div>
      </PageHeader>

      <ProofStrip />

      <LandingServicesSection />

      <section id="platform" className="mx-auto max-w-7xl px-6 py-20">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-white md:text-3xl">
            {tr("landing.platform.title")}
          </h2>
          <p className="mt-3 max-w-3xl text-slate-300">
            {tr("landing.platform.body")}{" "}
            <Link
              to={localizePath("/intercom-nps-analytics", lang)}
              className="underline decoration-white/30 underline-offset-4 hover:text-white"
            >
              {tr("landing.platform.linkIntercomText")}
            </Link>
          </p>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {platformCards.map((card) => (
              <div key={card.title} className="rounded-2xl border border-white/10 bg-black/20 p-5">
                <div className="font-semibold text-white">{card.title}</div>
                <div className="mt-2 text-sm text-slate-300">{card.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <LandingMethodSection />

      <section id="demo" className="mx-auto max-w-7xl px-6 pb-20">
        <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 md:flex-row md:items-center md:justify-between md:p-8">
          <div>
            <h3 className="text-xl font-semibold text-white md:text-2xl">
              {tr("landing.demoBlock.title")}
            </h3>
            <p className="mt-2 max-w-xl text-slate-300">
              {tr("landing.demoBlock.body")}
            </p>
            <div className="mt-4">
              <DemoSummaryStrip />
            </div>
          </div>

          <div className="mt-4 flex flex-col items-start gap-3 md:mt-0">
            <Link
              to={localizePath("/demo-survey-page", lang)}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#7C3AED] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#6D28D9]"
            >
              {tr("landing.demoBlock.cta")}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <p className="max-w-xs text-xs text-slate-400">
              {tr("landing.demoBlock.note")}
            </p>
          </div>
        </div>
      </section>

      <LandingScreenshotWorkflowSection />
      <LandingEmbedCxSection />
      <LandingNpsExplainer />
      <LandingMilestoneNpsSection />
      <LandingAboutSection />
      <LandingContactSection />
    </div>
  );
}
