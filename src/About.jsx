// src/About.jsx
import React from "react";
import { useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import Seo from "./components/Seo";
import PageHeader from "./components/PageHeader";
import { useLanguage } from "./i18n/LanguageContext.jsx";
import { translations } from "./i18n/translations.js";
import { localizePath } from "./i18n/pathHelpers.js";
import {
  ArrowRight,
  GraduationCap,
  Mic,
  Briefcase,
  CheckCircle2,
  LineChart,
} from "lucide-react";

export default function About() {
  const { lang } = useLanguage();
  const location = useLocation();
  const tr = (p, f) => translations(lang, p, f);

  const bulletsWhy = tr("about.why.bullets", []);
  const unfair = tr("about.unfair.bullets", []);
  const proof = tr("about.proof.bullets", []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B0F19] via-[#0C1224] to-[#0B0F19] text-slate-200">
      <Seo
        path={location.pathname}
        lang={lang}
        title={tr("about.seoTitle", "About | NPS Me")}
        description={tr(
          "about.seoDescription",
          "Meet Caspar Ritchie. Practical CX and customer feedback specialist helping teams turn feedback into measurable improvement."
        )}
      />

      <PageHeader
        iconLabel={tr("about.header.iconLabel", "About")}
        tag={tr("about.header.tag", "NPS Me / About")}
        accent={tr("about.header.accent", "About")}
        title={tr("about.header.title", "the person behind NPS Me")}
        subtitle={tr(
          "about.header.subtitle",
          "Practical CX. Measurable outcomes. Less theatre, more progress."
        )}
      />

      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="grid gap-8 lg:grid-cols-12 items-start mt-10">
          <div className="lg:col-span-5">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <div className="aspect-[4/5] rounded-2xl border border-white/10 bg-gradient-to-br from-[#141B2E] to-[#0F172A] overflow-hidden">
                <img
                  src="/about1.png?v=2"
                  alt="Caspar Ritchie, founder of NPS Me"
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="mt-5">
                <p className="text-xs uppercase tracking-widest text-[#22C55E]">
                  {tr("about.hero.kicker", "Caspar Ritchie")}
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  {tr(
                    "about.hero.headline",
                    "Turn customer feedback into measurable improvement"
                  )}
                </h2>
                <p className="mt-3 text-sm text-slate-300">
                  {tr(
                    "about.hero.body",
                    "I help startups and SMEs turn surveys, customer comments and operational feedback into clearer priorities, practical workflows and measurable progress."
                  )}
                </p>
                <p className="mt-4 text-xs text-slate-500">
                  {tr(
                    "about.hero.scrollNote",
                    "Scroll to see how NPS Me can help →"
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <InfoCard
              title={tr("about.why.title", "Why work with me?")}
              subtitle={tr(
                "about.why.subtitle",
                "Most consultants advise. I help put the system in place."
              )}
              bullets={bulletsWhy}
            />

            <InfoCard
              title={tr("about.unfair.title", "A rare mix of skills")}
              subtitle={tr(
                "about.unfair.subtitle",
                "Strategy + data + delivery + technical execution."
              )}
              bullets={unfair}
            />

            <InfoCard
              title={tr("about.proof.title", "What teams bring me in for")}
              subtitle={tr(
                "about.proof.subtitle",
                "Concrete problems → practical outcomes."
              )}
              bullets={proof}
            />
          </div>
        </div>

        <div className="mt-12">
          <h3 className="text-xl md:text-2xl font-semibold text-white">
            {tr("about.work.title", "Four ways to work together")}
          </h3>

          <p className="mt-2 text-sm text-slate-300 max-w-3xl">
            {tr(
              "about.work.subtitle",
              "Choose the format that fits your stage - hands-on delivery, enablement, inspiration, or ongoing insight."
            )}
          </p>

          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <OfferCard
              icon={<Briefcase className="h-5 w-5 text-white" />}
              title={tr("about.work.consulting.title", "Consulting")}
              body={tr(
                "about.work.consulting.body",
                "Hands-on CX and customer feedback setup. We diagnose friction, prioritise what matters and help put the right workflow in place."
              )}
              ctaLabel={tr("about.work.consulting.cta", "Explore consulting")}
              ctaHref={localizePath("/products", lang)}
            />

            <OfferCard
              icon={<GraduationCap className="h-5 w-5 text-white" />}
              title={tr("about.work.training.title", "Workshops & training")}
              body={tr(
                "about.work.training.body",
                "Practical training to help teams run surveys properly, interpret feedback well and turn customer insight into action."
              )}
              ctaLabel={tr("about.work.training.cta", "View training")}
              ctaHref={localizePath("/training", lang)}
              featured
            />

            <OfferCard
              icon={<Mic className="h-5 w-5 text-white" />}
              title={tr("about.work.speaking.title", "Speaking")}
              body={tr(
                "about.work.speaking.body",
                "Talks and sessions on practical customer experience, customer feedback and what really helps teams make better decisions."
              )}
              ctaLabel={tr("about.work.speaking.cta", "View speaking")}
              ctaHref={localizePath("/speaking", lang)}
            />

            <OfferCard
              icon={<LineChart className="h-5 w-5 text-white" />}
              title={tr("about.work.insight.title", "Ongoing insight")}
              body={tr(
                "about.work.insight.body",
                "A lightweight CX intelligence layer you can act on week by week - themes, risk signals, reporting and next steps."
              )}
              ctaLabel={tr("about.work.insight.cta", "View insight products")}
              ctaHref={localizePath("/products", lang)}
            />
          </div>
        </div>

        <div className="mt-12 rounded-3xl border border-white/10 bg-white/5 p-8">
          <h3 className="text-xl md:text-2xl font-semibold text-white">
            {tr("about.human.title", "A bit about me")}
          </h3>

          <div className="mt-4 space-y-4 text-sm text-slate-300 leading-relaxed max-w-4xl">
            <p>
              {tr(
                "about.human.p1",
                "I’ve always been interested in why customers behave the way they do - and what teams can realistically change to improve outcomes."
              )}
            </p>
            <p>
              {tr(
                "about.human.p2",
                "Over the years I’ve worked across product, data, operations and engineering. That has shaped how I work now: measure experience properly, understand the real causes behind customer friction, then focus on improvements teams can actually deliver."
              )}
            </p>
            <p>
              {tr(
                "about.human.p3",
                "Today, through NPS Me, I help startups and SMEs move beyond dashboards and vague CX ambition toward something more useful: a practical customer feedback process, clearer insight and better follow-through."
              )}
            </p>
          </div>
        </div>

        <div className="mt-12 rounded-3xl border border-white/10 bg-gradient-to-br from-[#141B2E] to-[#0F172A] p-8 text-center">
          <h3 className="text-2xl font-semibold text-white">
            {tr("about.cta.title", "Want to improve CX without the theatre?")}
          </h3>
          <p className="mt-3 text-slate-300 max-w-2xl mx-auto">
            {tr(
              "about.cta.body",
              "If you want clearer insight, a more practical setup and better customer follow-through, let’s talk."
            )}
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to={`${localizePath("/book", lang)}?topic=discovery`}
              className="rounded-2xl px-6 py-3 text-sm font-semibold bg-[#22C55E] text-[#0B0F19] hover:bg-[#16A34A] transition inline-flex items-center justify-center gap-2"
            >
              {tr("about.cta.primary", "Book a call")}
              <ArrowRight className="h-4 w-4" />
            </Link>

            <a
              href="mailto:hello@npsme.com?subject=Work%20with%20NPS%20Me"
              className="rounded-2xl px-6 py-3 text-sm font-semibold bg-[#7C3AED] hover:bg-[#6D28D9] transition inline-flex items-center justify-center gap-2"
            >
              {tr("about.cta.secondary", "Email hello@npsme.com")}
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
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      {Card}
    </motion.div>
  );
}
