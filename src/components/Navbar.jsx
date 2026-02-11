// src/components/Navbar.jsx
import React from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { ROUTES } from "../routesRegistry";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { translations } from "../i18n/translations.js";
import { localizePath, stripLangPrefix } from "../i18n/pathHelpers.js";

export default function NavBar() {
  const [open, setOpen] = React.useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { lang, setLang } = useLanguage();

  // NEW: auth state for showing Admin link
  const [isAuthed, setIsAuthed] = React.useState(null); // null = unknown

  React.useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const r = await fetch("/api/auth/me", { credentials: "include" });
        const j = await r.json();
        if (!cancelled) setIsAuthed(Boolean(j?.authed));
      } catch (e) {
        if (!cancelled) setIsAuthed(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Still used for mobile (simple full list)
  const headerLinks = ROUTES.filter(
    (r) => r.enabled && r.inHeader && (r.lang ? r.lang === lang : true)
  );

  React.useEffect(() => setOpen(false), [location.pathname]);

  React.useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const toggleLang = () => {
    const next = lang === "en" ? "fr" : "en";
    setLang(next);

    const rawPath = stripLangPrefix(location.pathname) || "/";
    navigate(localizePath(rawPath, next) + location.search + location.hash);
  };

  return (
    <header className="sticky top-0 z-50 isolate backdrop-blur supports-[backdrop-filter]:bg-white/5 bg-black/10 border-b border-white/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Brand */}
        <Link to={localizePath("/", lang)} className="flex items-center gap-3 shrink-0">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#22C55E]" />
          <span className="text-lg tracking-tight font-semibold">
            NPS <span className="text-[#7C3AED]">Me</span>
          </span>
        </Link>

        {/* Desktop */}
        <nav className="hidden md:flex items-center gap-5 text-sm text-slate-300 min-w-0">
          <NavItem to={localizePath("/products", lang)}>
            {translations(lang, "routes.products", "Products")}
          </NavItem>

          <DesktopDropdown
            label={translations(lang, "navbar.group.method", "Method")}
            items={[
              {
                to: localizePath("/why-nps-me", lang),
                label: translations(lang, "routes.whyNpsMe", "Why NPS Me"),
              },
              {
                to: localizePath("/what-is-nps", lang),
                label: translations(lang, "routes.whatIsNps", "What is NPS"),
              },
              {
                to: localizePath("/milestone-nps", lang),
                label: translations(lang, "routes.milestoneNps", "Milestone NPS"),
              },
              {
                to: localizePath("/nps-survey-programme", lang),
                label: translations(lang, "routes.npsSurveyProgramme", "NPS Survey Programme"),
              },
              {
                to: localizePath("/nps-intelligence-layer", lang),
                label: translations(lang, "routes.npsIntelligenceLayer", "NPS Intelligence Layer"),
              },
            ]}
          />

          <DesktopDropdown
            label={translations(lang, "navbar.group.integrations", "Integrations")}
            items={[
              {
                to: localizePath("/intercom-nps-analytics", lang),
                label: translations(lang, "routes.intercomNpsAnalytics", "Intercom NPS Analytics"),
              },
              {
                to: localizePath("/social-listening", lang),
                label: translations(lang, "routes.socialListening", "Social Listening"),
              },
              {
                to: localizePath("/data-automation", lang),
                label: translations(lang, "routes.dataAutomation", "Data automation"),
              },
            ]}
          />

          <NavItem to={localizePath("/blog", lang)}>
            {translations(lang, "routes.blog", "Blog")}
          </NavItem>

          {/* NEW: Admin link only when authed */}
          {isAuthed === true && (
            <NavItem to={localizePath("/private/closing-the-loop", lang)}>
              {translations(lang, "navbar.admin", "Admin")}
            </NavItem>
          )}

          <button
            type="button"
            onClick={toggleLang}
            className="shrink-0 inline-flex items-center gap-1 rounded-2xl border border-white/15 px-3 py-1 text-xs font-medium text-slate-200 hover:bg-white/10 transition"
          >
            <span className={lang === "en" ? "font-semibold" : "opacity-60"}>
              {translations(lang, "navbar.languageEn", "EN")}
            </span>
            <span className="mx-1 text-slate-500">/</span>
            <span className={lang === "fr" ? "font-semibold" : "opacity-60"}>
              {translations(lang, "navbar.languageFr", "FR")}
            </span>
          </button>

          <Link
            to={localizePath("/book")}
            className="shrink-0 inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium
                      bg-[#7C3AED] hover:bg-[#6D28D9] text-white
                      transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#22C55E]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0F19]"
          >
            {translations(lang, "navbar.bookDiscovery", "Book discovery")}
          </Link>
        </nav>

        {/* Mobile burger */}
        <button
          className="md:hidden inline-flex items-center justify-center p-2 rounded-lg hover:bg-white/10 shrink-0"
          aria-label="Toggle menu"
          aria-expanded={open ? "true" : "false"}
          onClick={() => setOpen((s) => !s)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile panel */}
      {open && (
        <div className="md:hidden border-t border-white/10 bg-[#0B0F19]/95 backdrop-blur">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 flex flex-col gap-2">
            {headerLinks.map(({ path, label, labelKey }) => (
              <NavItem key={path} to={localizePath(path, lang)} mobile>
                {translations(lang, labelKey, label)}
              </NavItem>
            ))}

            {/* NEW: Admin link only when authed */}
            {isAuthed === true && (
              <NavItem to={localizePath("/private/closing-the-loop", lang)} mobile>
                {translations(lang, "navbar.admin", "Admin")}
              </NavItem>
            )}

            <button
              type="button"
              onClick={toggleLang}
              className="mt-1 inline-flex items-center justify-center gap-1 rounded-2xl border border-white/15 px-3 py-1 text-xs font-medium text-slate-200 hover:bg-white/10 transition self-start"
            >
              <span className={lang === "en" ? "font-semibold" : "opacity-60"}>
                {translations(lang, "navbar.languageEn", "EN")}
              </span>
              <span className="mx-1 text-slate-500">/</span>
              <span className={lang === "fr" ? "font-semibold" : "opacity-60"}>
                {translations(lang, "navbar.languageFr", "FR")}
              </span>
            </button>

            <Link
              to={localizePath("/book")}
              className="mt-2 inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-medium
                        bg-[#7C3AED] hover:bg-[#6D28D9] text-white
                        transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#22C55E]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0F19]"
            >
              {translations(lang, "navbar.bookDiscovery", "Book discovery")}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

function NavItem({ to, children, mobile = false }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          "shrink-0 px-2 py-1 rounded-lg transition whitespace-nowrap",
          mobile ? "text-base" : "text-sm",
          isActive ? "text-white" : "text-slate-300 hover:text-white",
        ].join(" ")
      }
    >
      {children}
    </NavLink>
  );
}

function DesktopDropdown({ label, items }) {
  return (
    <div className="relative group z-50">
      <button
        type="button"
        className="shrink-0 px-2 py-1 rounded-lg text-slate-300 hover:text-white transition inline-flex items-center gap-2 whitespace-nowrap"
      >
        {label}
        <span className="text-slate-500">▾</span>
      </button>

      <div className="absolute left-0 top-full pt-2 hidden group-hover:block z-50">
        <div className="w-72 rounded-2xl border border-white/10 bg-[#0B0F19]/95 backdrop-blur shadow-xl p-2 z-50">
          {items.map((it) => (
            <NavLink
              key={it.to}
              to={it.to}
              className={({ isActive }) =>
                [
                  "block px-3 py-2 rounded-xl transition",
                  isActive
                    ? "text-white bg-white/10"
                    : "text-slate-300 hover:text-white hover:bg-white/5",
                ].join(" ")
              }
            >
              {it.label}
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
}
