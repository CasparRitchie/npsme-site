// src/NpsMeLanding.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Star, LineChart, Wrench, Gauge, CheckCircle2 } from "lucide-react";
import Seo from "./components/Seo";
import { computeNpsStats } from "../utils/nps";
import PageHeader from "./components/PageHeader";
import { useLanguage } from "./i18n/LanguageContext";
import { translations } from "./i18n/translations";


// --- NPS explainer ---
function NpsExplainer() {
  const { lang } = useLanguage();
  const tr = (p, f) => translations(lang, p, f);

  return (
    <section id="nps-explainer" className="mx-auto max-w-7xl px-6 pb-20">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
        <h3 className="text-xl md:text-2xl font-semibold text-white">
          {tr("landing.explainer.title")}
        </h3>

        <div className="mt-3 grid gap-6 md:grid-cols-2">
          <div className="text-slate-300 text-sm leading-relaxed">
            <p>{tr("landing.explainer.intro")}</p>
            <ul className="mt-3 space-y-2 list-disc pl-5">
              <li><span className="text-white font-medium">{tr("landing.explainer.promoters")}</span>: 9–10</li>
              <li><span className="text-white font-medium">{tr("landing.explainer.passives")}</span>: 7–8</li>
              <li><span className="text-white font-medium">{tr("landing.explainer.detractors")}</span>: 0–6</li>
            </ul>
            <p className="mt-3">{tr("landing.explainer.formula")}</p>
          </div>

          <div className="text-slate-300 text-sm leading-relaxed">
            <p className="text-white font-medium">{tr("landing.explainer.whereFits")}</p>
            <ul className="mt-2 space-y-2 list-disc pl-5">
              <li>{tr("landing.explainer.relationship")}</li>
              <li>{tr("landing.explainer.transactional")}</li>
              <li>{tr("landing.explainer.alongside")}</li>
            </ul>

            <p className="mt-3 text-white font-medium">
              {tr("landing.explainer.cautionsTitle")}
            </p>
            <ul className="mt-2 space-y-2 list-disc pl-5">
              {translations(lang, "landing.explainer.cautions", []).map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

// --- Milestone NPS explainer ---
function MilestoneNpsSection() {
  const { lang } = useLanguage();
  const tr = (p, f) => translations(lang, p, f);

  const examples = [
    tr("landing.milestone.examples.order"),
    tr("landing.milestone.examples.onboarding"),
    tr("landing.milestone.examples.firstUse"),
  ];

  return (
    <section id="milestone-nps" className="mx-auto max-w-7xl px-6 pb-20">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
        <h2 className="text-2xl md:text-3xl font-semibold text-white">
          {tr("landing.milestone.title")}
        </h2>
        <p className="mt-3 text-slate-300 max-w-3xl">
          {tr("landing.milestone.intro")}
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {examples.map((e) => (
            <div key={e.title} className="rounded-2xl border border-white/10 bg-black/20 p-5">
              <div className="text-white font-semibold">{e.title}</div>
              <div className="mt-2 text-sm text-slate-200">{e.question}</div>
              <div className="mt-2 text-xs text-slate-400">{e.why}</div>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
            <div className="text-white font-semibold">
              {tr("landing.milestone.stepsTitle")}
            </div>
            <ol className="mt-3 space-y-2 list-decimal pl-5 text-sm text-slate-300">
              {translations(lang, "landing.milestone.steps", []).map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
            <div className="text-white font-semibold">
              {tr("landing.milestone.trackTitle")}
            </div>
            <ul className="mt-3 space-y-2 list-disc pl-5 text-sm text-slate-300">
              {translations(lang, "landing.milestone.track", []).map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

// --- Demo summary strip ---
function DemoSummaryStrip() {
  const { lang } = useLanguage();
  const tr = (p, f) => translations(lang, p, f);

  const [stats, setStats] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [shouldLoad, setShouldLoad] = React.useState(false);
  const ref = React.useRef(null);

  // 1) Only trigger once the component is near the viewport
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
      { root: null, rootMargin: "300px", threshold: 0.01 } // start loading a bit before it appears
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // 2) Fetch only after it becomes visible-ish
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
          <p className="mt-1 text-[11px] text-slate-500">
            {tr("landing.demo.basedOn").replace("{count}", String(stats.total))}
          </p>
        </div>
      )}
    </div>
  );
}

// --- Main landing page ---
export default function NpsMeLanding() {
  const { lang } = useLanguage();
  const tr = (p, f) => translations(lang, p, f);
  const location = useLocation();

  const methodCards = translations(lang, "landing.method.cards", []);
  const platformCards = translations(lang, "landing.platform.cards", []);
  const aboutBullets = translations(lang, "landing.about.bullets", []);
  const chips = translations(lang, "landing.hero.chips", []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B0F19] via-[#0C1224] to-[#0B0F19] text-slate-200">
      <Seo
        path={location.pathname}
        title={tr("landing.seo.title")}
        description={tr("landing.seo.description")}
      />

      <PageHeader iconLabel="NPS Me" tag="NPS Me / Home">
        <div className="pt-4 grid md:grid-cols-12 gap-10">
          <div className="md:col-span-7 lg:col-span-6">
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-3xl sm:text-4xl md:text-5xl leading-tight text-balance break-words font-semibold tracking-tight text-white"
            >
              {tr("landing.hero.h1.lead")}{" "}
              <span className="md:whitespace-nowrap">
                {tr("landing.hero.h1.nps")}
              </span>{" "}
              {tr("landing.hero.h1.tail")}{" "}
              <span className="block sm:inline text-transparent bg-clip-text bg-gradient-to-r from-[#7C3AED] to-[#22C55E]">
                {tr("landing.hero.h1.accent")}
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.05 }}
              className="mt-5 text-slate-300 max-w-xl"
            >
              {tr("landing.hero.body")}
            </motion.p>

            <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Link
                to="/book"
                className="group inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold bg-[#22C55E] text-[#0B0F19] hover:bg-[#16A34A] transition"
              >
                {tr("landing.hero.ctaPrimary")}
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </Link>

              <a href="#method" className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white">
                {tr("landing.hero.ctaMethod")}
              </a>

              <a href="#demo" className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white">
                {tr("landing.hero.ctaDemo")}
              </a>
            </div>

            <div className="mt-10 flex items-center gap-6 text-sm text-slate-400">
              <div className="flex items-center gap-2"><Star className="h-4 w-4" /> {tr("landing.hero.proof.mining")}</div>
              <div className="flex items-center gap-2"><Wrench className="h-4 w-4" /> {tr("landing.hero.proof.enablement")}</div>
              <div className="flex items-center gap-2"><LineChart className="h-4 w-4" /> {tr("landing.hero.proof.lift")}</div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2 text-xs">
              {chips.map((chip) => (
                <span
                  key={chip}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-300"
                >
                  {chip}
                </span>
              ))}
            </div>

            <p className="mt-2 text-[11px] text-slate-500 max-w-xl">
              {tr("landing.hero.chipsNote")}
            </p>
          </div>
        </div>
      </PageHeader>

      {/* Method */}
      <section id="method" className="mx-auto max-w-7xl px-6 py-20">
        <div className="max-w-2xl">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-white">
            {tr("landing.method.title")}
          </h2>
          <p className="mt-3 text-slate-300">
            {tr("landing.method.body")}
          </p>
        </div>

        <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {methodCards.map((card, i) => {
            const Icon = [Star, LineChart, Wrench, Gauge][i] || Star;
            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className="rounded-2xl border border-white/10 bg-white/5 p-6"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#22C55E] flex items-center justify-center">
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-white">{card.title}</h3>
                </div>
                <p className="mt-3 text-sm text-slate-300">{card.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Demo */}
      <section id="demo" className="mx-auto max-w-7xl px-6 pb-20">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-xl md:text-2xl font-semibold text-white">
              {tr("landing.demoBlock.title")}
            </h3>
            <p className="mt-2 text-slate-300 max-w-xl">
              {tr("landing.demoBlock.body")}
            </p>
            <div className="mt-4">
              <DemoSummaryStrip />
            </div>
          </div>

          <div className="mt-4 md:mt-0 flex flex-col items-start gap-3">
            <Link
              to="/demo-survey-page"
              className="inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold bg-[#7C3AED] hover:bg-[#6D28D9] text-white"
            >
              {tr("landing.demoBlock.cta")}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <p className="text-xs text-slate-400 max-w-xs">
              {tr("landing.demoBlock.note")}
            </p>
          </div>
        </div>
      </section>

      {/* Platform */}
      <section id="platform" className="mx-auto max-w-7xl px-6 pb-20">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
          <h2 className="text-2xl md:text-3xl font-semibold text-white">
            {tr("landing.platform.title")}
          </h2>
          <p className="mt-3 text-slate-300 max-w-3xl">
            {tr("landing.platform.body")}{" "}
            <Link
              to={lang === "fr" ? "/fr/analyse-nps-intercom" : "/intercom-nps-analytics"}
              className="underline decoration-white/30 underline-offset-4 hover:text-white"
            >
              {tr("landing.platform.linkIntercomText")}
            </Link>
          </p>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {platformCards.map((card) => (
              <div key={card.title} className="rounded-2xl border border-white/10 bg-black/20 p-5">
                <div className="text-white font-semibold">{card.title}</div>
                <div className="mt-2 text-sm text-slate-300">{card.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <NpsExplainer />
      <MilestoneNpsSection />

      {/* About */}
      <section id="about" className="mx-auto max-w-7xl px-6 pb-20">
        <h2 className="text-2xl md:text-3xl font-semibold text-white">
          {tr("landing.about.title")}
        </h2>
        <p className="mt-3 text-slate-300 max-w-2xl">
          {tr("landing.about.body")}
        </p>

        <ul className="mt-6 space-y-3 text-sm text-slate-300">
          {aboutBullets.map((t) => (
            <li key={t} className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 text-[#22C55E]" />
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Contact */}
      <section id="contact" className="mx-auto max-w-7xl px-6 pb-24">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#141B2E] to-[#0F172A] p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-semibold text-white">
            {tr("landing.contact.title")}
          </h2>
          <p className="mt-3 text-slate-300 max-w-2xl mx-auto">
            {tr("landing.contact.body")}
          </p>

          <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:hello@npsme.com"
              className="group inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3 text-sm font-semibold bg-[#22C55E] text-[#0B0F19] hover:bg-[#16A34A] transition"
            >
              {tr("landing.contact.emailCta")}
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </a>

            <Link
              to="/book"
              className="group inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3 text-sm font-semibold bg-[#7C3AED] hover:bg-[#6D28D9] transition"
            >
              {tr("landing.contact.bookCta")}
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
