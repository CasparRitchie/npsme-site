// src/i18n/LanguageContext.jsx
import React, { createContext, useContext, useEffect, useState, useMemo } from "react";

const LanguageContext = createContext({
  lang: "en",
  setLang: () => {},
});

const SUPPORTED_LANGS = ["en", "fr"];
const STORAGE_KEY = "npsme.lang";

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState("en");

  // Initialise from localStorage or browser language
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && SUPPORTED_LANGS.includes(stored)) {
        setLangState(stored);
        return;
      }
    } catch {
      // ignore
    }

    const browserLang =
      (navigator.language || navigator.userLanguage || "en")
        .slice(0, 2)
        .toLowerCase();

    setLangState(SUPPORTED_LANGS.includes(browserLang) ? browserLang : "en");
  }, []);

  const setLang = (next) => {
    const normalised = SUPPORTED_LANGS.includes(next) ? next : "en";
    setLangState(normalised);
    try {
      localStorage.setItem(STORAGE_KEY, normalised);
    } catch {
      // ignore
    }
  };

  const value = useMemo(
    () => ({ lang, setLang }),
    [lang]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
