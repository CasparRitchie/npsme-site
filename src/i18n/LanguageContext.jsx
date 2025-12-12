// src/i18n/LanguageContext.jsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

const LanguageContext = createContext({
  lang: "en",
  setLang: () => {},
});

const SUPPORTED_LANGS = ["en", "fr"];
const STORAGE_KEY = "npsme.lang";

export function LanguageProvider({ children }) {
  const location = useLocation();
  const [lang, setLangState] = useState("en");

  // 1️⃣ Detect language from URL prefix (/fr/...)
  useEffect(() => {
    const match = location.pathname.match(/^\/(fr)(\/|$)/);
    if (match) {
      setLangState("fr");
      document.documentElement.lang = "fr";
      return;
    }

    // Default to English
    setLangState("en");
    document.documentElement.lang = "en";
  }, [location.pathname]);

  // 2️⃣ Allow manual override (navbar toggle)
  const setLang = (next) => {
    const normalised = SUPPORTED_LANGS.includes(next) ? next : "en";
    setLangState(normalised);
    document.documentElement.lang = normalised;
    try {
      localStorage.setItem(STORAGE_KEY, normalised);
    } catch {
      // ignore
    }
  };

  const value = useMemo(() => ({ lang, setLang }), [lang]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
