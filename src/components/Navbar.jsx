// src/components/Navbar.jsx
import React from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { ROUTES } from "../routesRegistry";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { translations } from "../i18n/translations.js";
import { localizePath, stripLangPrefix } from "../i18n/pathHelpers.js";

function normalizePath(pathname = "") {
  if (!pathname) return "/";
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

function matchRoutePath(routePath, pathname) {
  const route = normalizePath(routePath);
  const current = normalizePath(pathname);

  const routeParts = route.split("/").filter(Boolean);
  const currentParts = current.split("/").filter(Boolean);

  if (routeParts.length !== currentParts.length) return false;

  for (let i = 0; i < routeParts.length; i += 1) {
    const routePart = routeParts[i];
    const currentPart = currentParts[i];

    if (routePart.startsWith(":")) continue;
    if (routePart !== currentPart) return false;
  }

  return true;
}

function getCurrentRoute(pathname) {
  return ROUTES.find((route) => {
    if (!route?.path || route.isHash) return false;
    return matchRoutePath(route.path, pathname);
  }) || null;
}

export default function NavBar() {
  const [open, setOpen] = React.useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { lang, setLang } = useLanguage();

  const [authState, setAuthState] = React.useState({
    checked: false,
    authed: false,
    authMode: "none", // "none" | "private_cookie" | "workspace_cookie"
  });

  const t = React.useCallback(
    (key, fallback) => translations(lang, key, fallback),
    [lang]
  );

  const lp = React.useCallback(
    (path) => localizePath(path, lang),
    [lang]
  );

  const currentRoute = React.useMemo(
    () => getCurrentRoute(location.pathname),
    [location.pathname]
  );

  const currentAuthMode = currentRoute?.authMode || "none";

  const checkAuth = React.useCallback(async () => {
    if (currentAuthMode === "none") {
      setAuthState({
        checked: true,
        authed: false,
        authMode: "none",
      });
      return;
    }

    const endpoint =
      currentAuthMode === "workspace_cookie"
        ? "/api/workspace-auth/me"
        : "/api/auth/me";

    try {
      const r = await fetch(endpoint, {
        credentials: "include",
        cache: "no-store",
      });

      if (!r.ok) {
        setAuthState({
          checked: true,
          authed: false,
          authMode: currentAuthMode,
        });
        return;
      }

      const j = await r.json().catch(() => null);

      setAuthState({
        checked: true,
        authed: Boolean(j?.authed),
        authMode: currentAuthMode,
      });
    } catch (_e) {
      setAuthState({
        checked: true,
        authed: false,
        authMode: currentAuthMode,
      });
    }
  }, [currentAuthMode]);

  React.useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  React.useEffect(() => {
    const handleAuthChanged = () => {
      if (currentAuthMode !== "none") checkAuth();
    };

    const handleFocus = () => {
      if (authState.authed && currentAuthMode !== "none") {
        checkAuth();
      }
    };

    window.addEventListener("npsme-auth-changed", handleAuthChanged);
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("npsme-auth-changed", handleAuthChanged);
      window.removeEventListener("focus", handleFocus);
    };
  }, [checkAuth, authState.authed, currentAuthMode]);

  async function handleLogout() {
    const isWorkspace = authState.authMode === "workspace_cookie";

    try {
      await fetch(
        isWorkspace ? "/api/workspace-auth/logout" : "/api/auth/logout",
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        }
      );
    } catch (_e) {
      // Keep UX simple even if the request fails.
    } finally {
      setAuthState((prev) => ({
        ...prev,
        authed: false,
      }));
      setOpen(false);
      window.dispatchEvent(new Event("npsme-auth-changed"));
      navigate(isWorkspace ? lp("/workspace/login") : lp("/private/login"));
    }
  }

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

  const solutionItems = [
    {
      to: lp("/customer-feedback-workspace"),
      label: t("routes.customerFeedbackWorkspace", "Customer Feedback Workspace"),
      desc: "Import NPS data, analyse feedback and manage close-the-loop actions in a private workspace.",
    },
    {
      to: lp("/nps-intelligence-layer"),
      label: t("routes.npsIntelligenceLayer", "NPS Intelligence Layer"),
      desc: "Turn feedback into themes, priorities and decision-ready insight.",
    },
    {
      to: lp("/nps-survey-programme"),
      label: t("routes.npsSurveyProgramme", "NPS Survey Programme"),
      desc: "Design and run a structured NPS survey programme.",
    },
    {
      to: lp("/intercom-nps-analytics"),
      label: t("routes.intercomNpsAnalytics", "Intercom NPS Analytics"),
      desc: "Analyse Intercom NPS responses and close the loop faster.",
    },
    {
      to: lp("/data-automation"),
      label: t("routes.dataAutomation", "Data & Automation"),
      desc: "Connect data, automate reporting and reduce manual work.",
    },
    {
      to: lp("/social-listening"),
      label: t("routes.socialListening", "Social Listening"),
      desc: "Track public sentiment, themes and customer signals.",
    },
    {
      to: lp("/cx-cockpit"),
      label: t("routes.cxCockpit", "CX Cockpit"),
      desc: "Explore customer experience signals in one view.",
    },
  ];

  const resourceItems = [
    {
      to: lp("/what-is-nps"),
      label: t("routes.whatIsNps", "What is NPS?"),
      desc: "A simple guide to Net Promoter Score.",
    },
    {
      to: lp("/milestone-nps"),
      label: t("routes.milestoneNps", "Milestone NPS"),
      desc: "Measure customer sentiment at key journey moments.",
    },
    {
      to: lp("/blog"),
      label: t("routes.blog", "Blog"),
      desc: "Practical CX, NPS and customer feedback articles.",
    },
    {
      to: lp("/training"),
      label: t("routes.training", "Training"),
      desc: "Practical training for teams running NPS and CX programmes.",
    },
    {
      to: lp("/speaking"),
      label: t("routes.speaking", "Speaking"),
      desc: "Talks on practical customer experience and NPS improvement.",
    },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-[1000] isolate backdrop-blur supports-[backdrop-filter]:bg-white/5 bg-[#0B0F19]/90 border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <Link
            to={lp("/")}
            className="flex items-center gap-3 shrink-0"
            aria-label="NPS Me home"
          >
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#22C55E]" />
            <span className="text-lg tracking-tight font-semibold text-white">
              NPS <span className="text-[#22C55E]">Me</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-2 text-sm text-slate-300 min-w-0">
            <NavItem to={lp("/products")}>
              {t("routes.products", "Products")}
            </NavItem>

            <NavItem to={lp("/why-nps-me")}>
              {t("routes.whyNpsMe", "Why NPS Me")}
            </NavItem>

            <DesktopDropdown
              label={t("navbar.group.solutions", "Solutions")}
              items={solutionItems}
            />

            <DesktopDropdown
              label={t("navbar.group.resources", "Resources")}
              items={resourceItems}
            />

            <div className="ml-2 flex items-center gap-2">
              {authState.authed === true && authState.authMode === "workspace_cookie" && (
                <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-2 py-1">
                  <NavItem to={lp("/workspace")}>
                    {t("routes.workspace", "Workspace")}
                  </NavItem>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="shrink-0 inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-1 text-xs font-medium text-slate-200 hover:bg-white/10 transition"
                  >
                    {t("navbar.logout", "Log out")}
                  </button>
                </div>
              )}

              {authState.authed === true && authState.authMode === "private_cookie" && (
                <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-2 py-1">
                  <NavItem to={lp("/private/closing-the-loop")}>
                    {t("navbar.admin", "Admin")}
                  </NavItem>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="shrink-0 inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-1 text-xs font-medium text-slate-200 hover:bg-white/10 transition"
                  >
                    {t("navbar.logout", "Log out")}
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={toggleLang}
                className="shrink-0 inline-flex items-center gap-1 rounded-2xl border border-white/15 px-3 py-1 text-xs font-medium text-slate-200 hover:bg-white/10 transition"
                aria-label="Toggle language"
              >
                <span className={lang === "en" ? "font-semibold" : "opacity-60"}>
                  {t("navbar.languageEn", "EN")}
                </span>
                <span className="mx-1 text-slate-500">/</span>
                <span className={lang === "fr" ? "font-semibold" : "opacity-60"}>
                  {t("navbar.languageFr", "FR")}
                </span>
              </button>

              <Link
                to={lp("/book")}
                className="shrink-0 inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium
                          bg-[#7C3AED] hover:bg-[#6D28D9] text-white
                          transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#22C55E]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0F19]"
              >
                {t("navbar.bookDiscovery", "Book discovery")}
              </Link>
            </div>
          </nav>

          <button
            className="md:hidden inline-flex items-center justify-center p-2 rounded-lg hover:bg-white/10 shrink-0 text-white"
            aria-label="Toggle menu"
            aria-expanded={open ? "true" : "false"}
            onClick={() => setOpen((s) => !s)}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {open && (
          <div className="md:hidden border-t border-white/10 bg-[#0B0F19]/95 backdrop-blur">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 flex flex-col gap-2">
              {headerLinks.map(({ path, label, labelKey }) => (
                <NavItem key={path} to={lp(path)} mobile>
                  {t(labelKey, label)}
                </NavItem>
              ))}

              {authState.authed === true && authState.authMode === "workspace_cookie" && (
                <div className="mt-3 border-t border-white/10 pt-3 flex flex-col gap-2">
                  <p className="px-2 text-xs uppercase tracking-[0.18em] text-slate-500">
                    {t("routes.workspace", "Workspace")}
                  </p>

                  <NavItem to={lp("/workspace")} mobile>
                    {t("routes.workspace", "Workspace")}
                  </NavItem>

                  <NavItem to={lp("/workspace/import")} mobile>
                    {t("routes.workspaceImport", "Import feedback")}
                  </NavItem>

                  <NavItem to={lp("/workspace/datasets")} mobile>
                    {t("routes.workspaceDatasets", "Saved datasets")}
                  </NavItem>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="mt-1 inline-flex items-center justify-center rounded-2xl border border-white/15 px-3 py-2 text-sm text-slate-200 hover:bg-white/10 transition self-start"
                  >
                    {t("navbar.logout", "Log out")}
                  </button>
                </div>
              )}

              {authState.authed === true && authState.authMode === "private_cookie" && (
                <div className="mt-3 border-t border-white/10 pt-3 flex flex-col gap-2">
                  <p className="px-2 text-xs uppercase tracking-[0.18em] text-slate-500">
                    {t("navbar.admin", "Admin")}
                  </p>

                  <NavItem to={lp("/private/closing-the-loop")} mobile>
                    {t("navbar.admin", "Admin")}
                  </NavItem>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="mt-1 inline-flex items-center justify-center rounded-2xl border border-white/15 px-3 py-2 text-sm text-slate-200 hover:bg-white/10 transition self-start"
                  >
                    {t("navbar.logout", "Log out")}
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={toggleLang}
                className="mt-3 inline-flex items-center justify-center gap-1 rounded-2xl border border-white/15 px-3 py-1 text-xs font-medium text-slate-200 hover:bg-white/10 transition self-start"
                aria-label="Toggle language"
              >
                <span className={lang === "en" ? "font-semibold" : "opacity-60"}>
                  {t("navbar.languageEn", "EN")}
                </span>
                <span className="mx-1 text-slate-500">/</span>
                <span className={lang === "fr" ? "font-semibold" : "opacity-60"}>
                  {t("navbar.languageFr", "FR")}
                </span>
              </button>

              <Link
                to={lp("/book")}
                className="mt-2 inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-medium
                          bg-[#7C3AED] hover:bg-[#6D28D9] text-white
                          transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#22C55E]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0F19]"
              >
                {t("navbar.bookDiscovery", "Book discovery")}
              </Link>
            </div>
          </div>
        )}
      </header>

      <div className="h-[65px]" aria-hidden="true" />
    </>
  );
}

function NavItem({ to, children, mobile = false }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          "shrink-0 rounded-lg transition whitespace-nowrap",
          mobile ? "px-2 py-2 text-base" : "px-3 py-2 text-sm",
          isActive
            ? "text-white bg-white/[0.06]"
            : "text-slate-300 hover:text-white hover:bg-white/[0.04]",
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
        className="shrink-0 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.04] transition inline-flex items-center gap-2 whitespace-nowrap"
      >
        {label}
        <span className="text-slate-500 text-xs">▾</span>
      </button>

      <div className="absolute left-0 top-full pt-2 hidden group-hover:block z-50">
        <div className="w-80 rounded-2xl border border-white/10 bg-[#0B0F19]/95 backdrop-blur shadow-2xl p-2 z-50">
          {items.map((it) => (
            <NavLink
              key={it.to}
              to={it.to}
              className={({ isActive }) =>
                [
                  "block rounded-xl px-3 py-3 transition",
                  isActive
                    ? "text-white bg-white/10"
                    : "text-slate-300 hover:text-white hover:bg-white/5",
                ].join(" ")
              }
            >
              <span className="block text-sm font-medium">{it.label}</span>
              {it.desc && (
                <span className="mt-1 block text-xs leading-snug text-slate-500">
                  {it.desc}
                </span>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
}
