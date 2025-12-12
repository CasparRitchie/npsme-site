import React from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { ROUTES } from "../routesRegistry";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { t } from "../i18n/translations.js";
import { localizePath, stripLangPrefix } from "../i18n/pathHelpers.js";

export default function NavBar() {
  const [open, setOpen] = React.useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const { lang, setLang } = useLanguage();
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

    // keep same page, switch prefix
    const rawPath = stripLangPrefix(location.pathname) || "/";
    navigate(localizePath(rawPath, next) + location.search + location.hash);
  };

  return (
    <header className="sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-white/5 bg-black/10 border-b border-white/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 flex items-center justify-between">
        {/* Brand */}
        <Link to={localizePath("/", lang)} className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#22C55E]" />
          <span className="text-lg tracking-tight font-semibold">
            NPS <span className="text-[#7C3AED]">Me</span>
          </span>
        </Link>

        {/* Desktop */}
        <nav className="hidden md:flex items-center gap-6 text-sm text-slate-300">
          {headerLinks.map(({ path, label, labelKey }) => (
            <NavItem key={path} to={localizePath(path, lang)}>
              {t(lang, labelKey, label)}
            </NavItem>
          ))}

          <button
            type="button"
            onClick={toggleLang}
            className="inline-flex items-center gap-1 rounded-2xl border border-white/15 px-3 py-1 text-xs font-medium text-slate-200 hover:bg-white/10 transition"
          >
            <span className={lang === "en" ? "font-semibold" : "opacity-60"}>
              {t(lang, "navbar.languageEn", "EN")}
            </span>
            <span className="mx-1 text-slate-500">/</span>
            <span className={lang === "fr" ? "font-semibold" : "opacity-60"}>
              {t(lang, "navbar.languageFr", "FR")}
            </span>
          </button>

          <Link
            to={localizePath("/book", lang)}
            className="inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium bg-[#7C3AED] hover:bg-[#6D28D9] transition shadow-[0_0_0_0_rgba(124,58,237,0.5)] hover:shadow-[0_0_0_6px_rgba(124,58,237,0.15)]"
          >
            {t(lang, "navbar.bookDiscovery", "Book discovery")}
          </Link>
        </nav>

        {/* Mobile burger */}
        <button
          className="md:hidden inline-flex items-center justify-center p-2 rounded-lg hover:bg-white/10"
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
                {t(lang, labelKey, label)}
              </NavItem>
            ))}

            <button
              type="button"
              onClick={toggleLang}
              className="mt-1 inline-flex items-center justify-center gap-1 rounded-2xl border border-white/15 px-3 py-1 text-xs font-medium text-slate-200 hover:bg-white/10 transition self-start"
            >
              <span className={lang === "en" ? "font-semibold" : "opacity-60"}>
                {t(lang, "navbar.languageEn", "EN")}
              </span>
              <span className="mx-1 text-slate-500">/</span>
              <span className={lang === "fr" ? "font-semibold" : "opacity-60"}>
                {t(lang, "navbar.languageFr", "FR")}
              </span>
            </button>

            <Link
              to={localizePath("/book", lang)}
              className="mt-2 inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-medium bg-[#7C3AED] hover:bg-[#6D28D9] transition"
            >
              {t(lang, "navbar.bookDiscovery", "Book discovery")}
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
          "px-2 py-1 rounded-lg transition",
          mobile ? "text-base" : "text-sm",
          isActive ? "text-white" : "text-slate-300 hover:text-white",
        ].join(" ")
      }
    >
      {children}
    </NavLink>
  );
}
