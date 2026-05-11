// src/components/SiteFooter.jsx
import React from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { translations } from "../i18n/translations.js";
import { localizePath } from "../i18n/pathHelpers.js";

function FooterLink({ to, children }) {
  return (
    <Link
      to={to}
      className="text-sm text-slate-400 hover:text-white transition"
    >
      {children}
    </Link>
  );
}

function FooterGroup({ title, links }) {
  return (
    <div>
      <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        {title}
      </h2>

      <ul className="mt-4 space-y-3">
        {links.map((link) => (
          <li key={link.path}>
            <FooterLink to={link.path}>{link.label}</FooterLink>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function SiteFooter() {
  const { lang } = useLanguage();

  const t = (key, fallback) => translations(lang, key, fallback);
  const lp = (path) => localizePath(path, lang);

  const groups = [
    {
      title: "NPS Me",
      links: [
        {
          path: lp("/products"),
          label: t("routes.products", "Products"),
        },
        {
          path: lp("/why-nps-me"),
          label: t("routes.whyNpsMe", "Why NPS Me"),
        },
        {
          path: lp("/about"),
          label: t("routes.about", "About"),
        },
        {
          path: lp("/impact"),
          label: t("routes.impact", "Impact"),
        },
        {
          path: lp("/book"),
          label: t("navbar.bookDiscovery", "Book discovery"),
        },
      ],
    },
    {
      title: "Solutions",
      links: [
        {
          path: lp("/nps-intelligence-layer"),
          label: t("routes.npsIntelligenceLayer", "NPS Intelligence Layer"),
        },
        {
          path: lp("/nps-survey-programme"),
          label: t("routes.npsSurveyProgramme", "NPS Survey Programme"),
        },
        {
          path: lp("/intercom-nps-analytics"),
          label: t("routes.intercomNpsAnalytics", "Intercom NPS Analytics"),
        },
        {
          path: lp("/data-automation"),
          label: t("routes.dataAutomation", "Data & Automation"),
        },
        {
          path: lp("/social-listening"),
          label: t("routes.socialListening", "Social Listening"),
        },
        {
          path: lp("/cx-cockpit"),
          label: t("routes.cxCockpit", "CX Cockpit"),
        },
      ],
    },
    {
      title: "Workspace",
      links: [
        {
          path: lp("/workspace"),
          label: t("routes.workspace", "Workspace"),
        },
        {
          path: lp("/workspace/import"),
          label: t("routes.workspaceImport", "Import feedback"),
        },
        {
          path: lp("/workspace/datasets"),
          label: t("routes.workspaceDatasets", "Saved datasets"),
        },
        {
          path: lp("/private/closing-the-loop"),
          label: t("routes.closingTheLoop", "Closing the loop"),
        },
        {
          path: lp("/private/nps-responses-explorer"),
          label: t("routes.npsExplorer", "NPS Explorer"),
        },
      ],
    },
    {
      title: "Learn",
      links: [
        {
          path: lp("/what-is-nps"),
          label: t("routes.whatIsNps", "What is NPS?"),
        },
        {
          path: lp("/milestone-nps"),
          label: t("routes.milestoneNps", "Milestone NPS"),
        },
        {
          path: lp("/blog"),
          label: t("routes.blog", "Blog"),
        },
        {
          path: lp("/blog/what-to-do-with-nps-scores"),
          label: t(
            "routes.blogWhatToDoWithNpsScores",
            "What to do with NPS scores"
          ),
        },
        {
          path: lp("/blog/closing-the-loop"),
          label: t("routes.blogClosingTheLoop", "Closing the loop"),
        },
        {
          path: lp("/blog/ethical-surveys"),
          label: t("routes.blogEthicalSurveys", "Ethical surveys"),
        },
        {
          path: lp("/blog/ethics-of-contact-selection"),
          label: t(
            "routes.blogEthicsOfContactSelection",
            "Ethics of contact selection"
          ),
        },
        {
          path: lp("/blog/data-visualisation-cx-insights"),
          label: t(
            "routes.blogDataVisualisation",
            "Data visualisation & CX insights"
          ),
        },
      ],
    },
    {
      title: "More",
      links: [
        {
          path: lp("/training"),
          label: t("routes.training", "Training"),
        },
        {
          path: lp("/speaking"),
          label: t("routes.speaking", "Speaking"),
        },
        {
          path: lp("/privacy"),
          label: t("routes.privacy", "Privacy"),
        },
        {
          path: lp("/terms"),
          label: t("routes.terms", "Terms"),
        },
      ],
    },
  ];

  return (
    <footer className="border-t border-white/10 bg-[#080B12]">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_2.4fr]">
          <div>
            <Link
              to={lp("/")}
              className="inline-flex items-center gap-3"
              aria-label="NPS Me home"
            >
              <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#22C55E]" />
              <span className="text-lg tracking-tight font-semibold text-white">
                NPS <span className="text-[#7C3AED]">Me</span>
              </span>
            </Link>

            <p className="mt-4 max-w-sm text-sm leading-6 text-slate-400">
              Practical NPS consulting, customer feedback systems and CX insight
              for startups, SMEs and growing businesses.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                to={lp("/book")}
                className="inline-flex items-center rounded-2xl bg-[#7C3AED] px-4 py-2 text-sm font-medium text-white hover:bg-[#6D28D9] transition"
              >
                {t("navbar.bookDiscovery", "Book discovery")}
              </Link>

              <Link
                to={lp("/workspace")}
                className="inline-flex items-center rounded-2xl border border-white/15 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-white/10 transition"
              >
                {t("routes.workspace", "Workspace")}
              </Link>
            </div>
          </div>

          <nav
            className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5"
            aria-label="Footer navigation"
          >
            {groups.map((group) => (
              <FooterGroup
                key={group.title}
                title={group.title}
                links={group.links}
              />
            ))}
          </nav>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} NPS Me. All rights reserved.
          </p>

          <p className="max-w-3xl text-[11px] leading-snug text-slate-500">
            NPS® and Net Promoter Score® are registered service marks of Bain
            &amp; Company, Inc., Fred Reichheld, and Satmetrix Systems, Inc.
            References are descriptive only. NPS Me is independent and is not
            affiliated with, sponsored, or endorsed by those parties.
          </p>
        </div>
      </div>
    </footer>
  );
}
