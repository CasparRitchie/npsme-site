// src/i18n/pathHelpers.js

const OVERRIDES = {
  // clean path (NO /fr prefix) -> per-language localized path
  "/intercom-nps-analytics": {
    fr: "/fr/analyse-nps-intercom",
    en: "/intercom-nps-analytics",
  },

  // optional: support callers passing the FR slug without /fr
  "/analyse-nps-intercom": {
    fr: "/fr/analyse-nps-intercom",
    en: "/intercom-nps-analytics",
  },
};

export function stripLangPrefix(pathname = "") {
  if (pathname.startsWith("/fr/")) return pathname.slice(3); // "/fr/x" -> "/x"
  if (pathname === "/fr") return "/";                        // "/fr" -> "/"
  return pathname || "/";
}

export function localizePath(path = "/", lang = "en") {
  const clean = stripLangPrefix(path);

  // ✅ Apply overrides first (non 1:1 slugs)
  const overridden = OVERRIDES[clean]?.[lang];
  if (overridden) return overridden;

  // ✅ Default /fr prefix logic
  if (lang === "fr") return clean === "/" ? "/fr" : `/fr${clean}`;

  // EN default
  return clean;
}
