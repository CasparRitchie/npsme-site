// src/i18n/pathHelpers.js

export function stripLangPrefix(pathname = "") {
  if (pathname.startsWith("/fr/")) return pathname.slice(3);
  if (pathname === "/fr") return "/";
  return pathname;
}

export function localizePath(path = "/", lang = "en") {
  const clean = stripLangPrefix(path || "/");

  if (lang === "fr") {
    const base = clean.startsWith("/") ? clean : `/${clean}`;
    return base === "/" ? "/fr" : `/fr${base}`;
  }

  return clean.startsWith("/") ? clean : `/${clean}`;
}
