// src/components/SiteFooter.jsx
import React from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "../routesRegistry";
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
  if (!links.length) return null;

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

  const currentLangRoutes = React.useMemo(() => {
    return ROUTES.filter((route) => {
      if (!route.enabled) return false;
      if (route.lang !== lang) return false;
      if (route.path.includes(":")) return false;
      return true;
    });
  }, [lang]);

  const findRoute = React.useCallback(
    (canonicalPath) => {
      const localizedPath = localizePath(canonicalPath, lang);

      const match =
        currentLangRoutes.find((route) => route.path === localizedPath) ||
        currentLangRoutes.find((route) => route.path === canonicalPath);

      if (!match) {
        return {
          path: localizedPath,
          label: canonicalPath,
        };
      }

      return {
        path: match.path,
        label: t(match.labelKey, match.label),
      };
    },
    [currentLangRoutes, lang]
  );

  const makeLinks = React.useCallback(
    (paths) => paths.map((path) => findRoute(path)),
    [findRoute]
  );

  const groups = [
    {
      title: "NPS Me",
      links: makeLinks([
        "/products",
        "/why-nps-me",
        "/about",
        "/impact",
        "/book",
      ]),
    },
    {
      title: "Solutions",
      links: makeLinks([
        "/nps-intelligence-layer",
        "/nps-survey-programme",
        "/intercom-nps-analytics",
        "/data-automation",
        "/social-listening",
        "/social-listening-index",
        "/cx-cockpit",
        "/cx-pulse-sample",
      ]),
    },
    {
      title: "Workspace",
      links: makeLinks([
        "/workspace",
        "/workspace/import",
        "/workspace/datasets",
        "/private/nps-responses-explorer",
      ]),
    },
    {
      title: "Learn",
      links: makeLinks([
        "/what-is-nps",
        "/milestone-nps",
        "/blog",
        "/blog/what-to-do-with-nps-scores",
        "/blog/closing-the-loop",
        "/blog/intercom-nps-beyond-the-score",
        "/blog/ethical-surveys",
        "/blog/ethics-of-contact-selection",
        "/blog/why-nps-isnt-improving",
        "/blog/data-visualisation-cx-insights",
      ]),
    },
    {
      title: "More",
      links: makeLinks([
        "/training",
        "/speaking",
        "/envola",
        "/envola/performance",
        "/privacy",
        "/terms",
        "/#contact",
      ]),
    },
  ];

  return (
    <footer className="border-t border-white/10 bg-[#080B12]">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_2.4fr]">
          <div>
            <Link
              to={localizePath("/", lang)}
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
                to={findRoute("/book").path}
                className="inline-flex items-center rounded-2xl bg-[#7C3AED] px-4 py-2 text-sm font-medium text-white hover:bg-[#6D28D9] transition"
              >
                {t("navbar.bookDiscovery", "Book discovery")}
              </Link>

              <Link
                to={findRoute("/workspace").path}
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
