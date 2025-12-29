// src/i18n/pathHelpers.js

const OVERRIDES = {
  "/intercom-nps-analytics": {
    fr: "/fr/analyse-nps-intercom",
    en: "/intercom-nps-analytics",
  },
  "/analyse-nps-intercom": {
    fr: "/fr/analyse-nps-intercom",
    en: "/intercom-nps-analytics",
  },
};

export function stripLangPrefix(pathname = "") {
  if (pathname.startsWith("/fr/")) return pathname.slice(3);
  if (pathname === "/fr") return "/";
  return pathname;
}

export function localizePath(path = "/", lang = "en") {
  const clean = stripLangPrefix(path || "/");

  // ✅ Apply overrides first (for non 1:1 slugs like Intercom)
  if (OVERRIDES[clean] && OVERRIDES[clean][lang]) {
    return OVERRIDES[clean][lang];
  }

  // Fallback: standard /fr prefix logic
  if (lang === "fr") {
    return clean === "/" ? "/fr" : `/fr${clean}`;
  }

  return clean === "/fr" ? "/" : clean;
}
