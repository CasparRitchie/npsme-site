// src/About.jsx
import React from "react";
import { useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import Seo from "./components/Seo";
import PageHeader from "./components/PageHeader";
import { useLanguage } from "./i18n/LanguageContext.jsx";
import { TRANSLATIONS, translations } from "./i18n/translations.js";
import { localizePath } from "./i18n/pathHelpers.js";
import { ArrowRight, GraduationCap, Mic, Briefcase, CheckCircle2, LineChart } from "lucide-react";

export default function About() {
  const { lang } = useLanguage();
  const location = useLocation();
  const dict = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const bulletsWhy = dict?.about?.why?.bullets || [];
  const unfair = dict?.about?.unfair?.bullets || [];
  const proof = dict?.about?.proof?.bullets || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B0F19] via-[#0C1224] to-[#0B0F19] text-slate-200">
      <Seo
        path={location.pathname}
        lang={lang}
        title={translations(lang, "about.seoTitle", "About | NPS Me")}
        description={translations(
          lang,
          "about.seoDescription",
          "Meet Caspar Ritchie. CX & NPS specialist helping teams turn feedback into measurable growth."
        )}
      />

      <PageHeader
        iconLabel={translations(lang, "about.header.iconLabel", "About")}
        tag={translations(lang, "about.header.tag", "NPS Me / About")}
        accent={translations(lang, "about.header.accent", "About")}
        title={translations(lang, "about.header.title", "the person behind NPS Me")}
        subtitle={translations(
          lang,
          "about.header.subtitle",
          "Practical CX. Measurable outcomes. Less theatre, more progress."
        )}
      />

      <section className="mx-auto max-w-7xl px-6 pb-20">
        {/* HERO: photo + positioning */}
        <div className="grid gap-8 lg:grid-cols-12 items-start mt-10">
          <div className="lg:col-span-5">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              {/* Photo placeholder */}
              <div className="aspect-[4/5] rounded-2xl border border-white/10 bg-gradient-to-br from-[#141B2E] to-[#0F172A] flex items-center justify-center overflow-hidden">
                {/* Replace with your actual image */}
                {/* <img src="/caspar.jpg" alt="Caspar Ritchie" className="h-full w-full object-cover" /> */}
                <div className="text-center px-6">
                  <p className="text-sm text-slate-300">
                    {translations(lang, "about.hero.photoHint", "Add a friendly headshot here")}
                  </p>
                  <p className="text-xs text-slate-500 mt-2">
                    {translations(lang, "about.hero.photoSub", "People buy people. This matters.")}
                  </p>
                </div>
              </div>

              <div className="mt-5">
                <p className="text-xs uppercase tracking-widest text-[#22C55E]">
                  {translations(lang, "about.hero.kicker", "Caspar Ritchie")}
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  {translations(lang, "about.hero.headline", "Turn customer feedback into measurable growth")}
                </h2>
                <p className="mt-3 text-sm text-slate-300">
                  {translations(
                    lang,
                    "about.hero.body",
                    "I help teams implement NPS®, uncover what really frustrates customers, and ship improvements that increase retention, referrals, and revenue."
                  )}
                </p>
                <p className="mt-4 text-xs text-slate-500">
                  {lang === "fr"
                    ? "Faites défiler pour voir comment je peux vous aider →"
                    : "Scroll to see how we can work together →"}
                </p>
              </div>
            </div>
          </div>

          {/* Right column: Why me + Unfair advantage */}
          <div className="lg:col-span-7 space-y-6">
            <InfoCard
              title={translations(lang, "about.why.title", "Why work with me?")}
              subtitle={translations(lang, "about.why.subtitle", "Most consultants advise. I implement.")}
              bullets={bulletsWhy}
            />

            <InfoCard
              title={translations(lang, "about.unfair.title", "A rare mix of skills")}
              subtitle={translations(lang, "about.unfair.subtitle", "Strategy + data + delivery + technical execution.")}
              bullets={unfair}
            />

            <InfoCard
              title={translations(lang, "about.proof.title", "What teams bring me in for")}
              subtitle={translations(lang, "about.proof.subtitle", "Concrete problems → practical outcomes.")}
              bullets={proof}
            />
          </div>
        </div>

        {/* Ways to work together */}
        <div className="mt-12">
          <h3 className="text-xl md:text-2xl font-semibold text-white">
            {translations(lang, "about.work.title", "Four ways to work together")}
          </h3>

          <p className="mt-2 text-sm text-slate-300 max-w-3xl">
            {translations(
              lang,
              "about.work.subtitle",
              "Choose the format that fits your stage - hands-on delivery, enablement, inspiration, or ongoing insight."
            )}
          </p>

          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-4">

            {/* Consulting */}
            <OfferCard
              icon={<Briefcase className="h-5 w-5 text-white" />}
              title={translations(lang, "about.work.consulting.title", "Consulting")}
              body={translations(
                lang,
                "about.work.consulting.body",
                "Hands-on NPS & CX programme design + implementation. We diagnose friction, prioritise fixes, and ship improvements."
              )}
              ctaLabel={translations(lang, "about.work.consulting.cta", "Explore consulting")}
              ctaHref={localizePath("/products", lang)}
            />

            {/* Training */}
            <OfferCard
              icon={<GraduationCap className="h-5 w-5 text-white" />}
              title={translations(lang, "about.work.training.title", "Workshops & training")}
              body={translations(
                lang,
                "about.work.training.body",
                "Practical training to help teams run NPS well: survey design, sampling, analysis, close-the-loop, and action planning."
              )}
              ctaLabel={translations(lang, "about.work.training.cta", "View training")}
              ctaHref={localizePath("/training", lang)}
              featured
            />

            {/* Speaking */}
            <OfferCard
              icon={<Mic className="h-5 w-5 text-white" />}
              title={translations(lang, "about.work.speaking.title", "Speaking")}
              body={translations(
                lang,
                "about.work.speaking.body",
                "Keynotes and talks on practical customer experience: what actually moves NPS, and how to build momentum across teams."
              )}
              ctaLabel={translations(lang, "about.work.speaking.cta", "View speaking")}
              ctaHref={localizePath("/speaking", lang)}
            />

            {/* Ongoing Insight */}
            <OfferCard
              icon={<LineChart className="h-5 w-5 text-white" />}
              title={translations(lang, "about.work.insight.title", "Ongoing insight")}
              body={translations(
                lang,
                "about.work.insight.body",
                "A lightweight CX intelligence feed (Pulse / Intercom analytics) you can act on week by week - themes, risk flags, and clear next steps."
              )}
              ctaLabel={translations(lang, "about.work.insight.cta", "View insight products")}
              ctaHref={localizePath("/products", lang)}
            />

          </div>
        </div>

        {/* Human / personal */}
        <div className="mt-12 rounded-3xl border border-white/10 bg-white/5 p-8">
          <h3 className="text-xl md:text-2xl font-semibold text-white">
            {translations(lang, "about.human.title", "A bit about me")}
          </h3>

          <div className="mt-4 space-y-4 text-sm text-slate-300 leading-relaxed max-w-4xl">
            <p>{translations(lang, "about.human.p1", "I’ve always been obsessed with why customers behave the way they do - and what teams can realistically change to improve outcomes.")}</p>
            <p>{translations(lang, "about.human.p2", "Over the years I’ve worked across product, data, operations and engineering. That’s shaped my approach: measure experience properly, then fix the root causes, not the symptoms.")}</p>
            <p>{translations(lang, "about.human.p3", "I now help teams cut through dashboards and focus on the few actions that genuinely improve customers’ lives (and business results).")}</p>
          </div>
        </div>

        {/* Final CTA */}
        <div className="mt-12 rounded-3xl border border-white/10 bg-gradient-to-br from-[#141B2E] to-[#0F172A] p-8 text-center">
          <h3 className="text-2xl font-semibold text-white">
            {translations(lang, "about.cta.title", "Want to improve CX without the theatre?")}
          </h3>
          <p className="mt-3 text-slate-300 max-w-2xl mx-auto">
            {translations(
              lang,
              "about.cta.body",
              "If you want clearer insight, faster action, and measurable impact - let’s talk."
            )}
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to={localizePath("/book", lang)}
              className="rounded-2xl px-6 py-3 text-sm font-semibold bg-[#22C55E] text-[#0B0F19] hover:bg-[#16A34A] transition inline-flex items-center justify-center gap-2"
            >
              {translations(lang, "about.cta.primary", "Book a call")}
              <ArrowRight className="h-4 w-4" />
            </Link>

            <a
              href="mailto:hello@npsme.com?subject=Work%20with%20NPS%20Me"
              className="rounded-2xl px-6 py-3 text-sm font-semibold bg-[#7C3AED] hover:bg-[#6D28D9] transition inline-flex items-center justify-center gap-2"
            >
              {translations(lang, "about.cta.secondary", "Email hello@npsme.com")}
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

function InfoCard({ title, subtitle, bullets }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      {subtitle ? <p className="mt-1 text-sm text-slate-300">{subtitle}</p> : null}
      <ul className="mt-4 space-y-2 text-sm text-slate-300">
        {(bullets || []).map((b) => (
          <li key={b} className="flex gap-2">
            <CheckCircle2 className="h-4 w-4 text-[#22C55E] mt-0.5 shrink-0" />
            <span>{b}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function OfferCard({ icon, title, body, ctaLabel, ctaHref, featured = false }) {
  const Card = (
    <div
      className={
        "rounded-2xl border p-6 h-full " +
        (featured
          ? "border-[#7C3AED]/40 bg-gradient-to-br from-[#141B2E] to-[#0F172A] shadow-[0_0_0_1px_rgba(124,58,237,0.25)]"
          : "border-white/10 bg-white/5")
      }
    >
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#22C55E] flex items-center justify-center">
          {icon}
        </div>
        <h4 className="font-semibold text-white">{title}</h4>
      </div>

      <p className="mt-4 text-sm text-slate-300">{body}</p>

      <div className="mt-6">
        <Link
          to={ctaHref}
          className="inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold bg-[#22C55E] text-[#0B0F19] hover:bg-[#16A34A] transition"
        >
          {ctaLabel}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
      {Card}
    </motion.div>
  );
}
