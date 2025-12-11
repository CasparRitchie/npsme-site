// src/i18n/translations.js

export const TRANSLATIONS = {
  en: {
    navbar: {
      bookDiscovery: "Book discovery",
      languageEn: "EN",
      languageFr: "FR",
    },
  },
  fr: {
    navbar: {
      bookDiscovery: "Prendre rendez-vous",
      languageEn: "EN",
      languageFr: "FR",
    },
  },
};

/**
 * Very small translation helper.
 * Example: t(lang, "navbar.bookDiscovery", "Book discovery")
 */
export function t(lang, path, fallback) {
  const parts = path.split(".");
  let current = TRANSLATIONS[lang] || TRANSLATIONS.en;

  for (const p of parts) {
    if (current && Object.prototype.hasOwnProperty.call(current, p)) {
      current = current[p];
    } else {
      current = undefined;
      break;
    }
  }

  if (typeof current === "string") return current;
  return fallback !== undefined ? fallback : path;
}
