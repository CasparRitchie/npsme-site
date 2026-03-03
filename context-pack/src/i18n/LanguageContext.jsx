import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

const LanguageContext = createContext({ lang: "en", setLang: () => {} });

const STORAGE_KEY = "npsme.lang";

export function LanguageProvider({ children }) {
  const location = useLocation();
  const [lang, setLangState] = useState("en");

  // keep lang in sync with URL prefix
  useEffect(() => {
    const isFr = location.pathname === "/fr" || location.pathname.startsWith("/fr/");
    const next = isFr ? "fr" : "en";
    setLangState(next);
    try { localStorage.setItem(STORAGE_KEY, next); } catch {}
  }, [location.pathname]);

  // setLang should navigate (not just flip state) in /fr mode
  const setLang = (next) => {
    const normalised = next === "fr" ? "fr" : "en";
    setLangState(normalised);
    try { localStorage.setItem(STORAGE_KEY, normalised); } catch {}
    // navigation handled in Navbar toggle (next step)
  };

  const value = useMemo(() => ({ lang, setLang }), [lang]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  return useContext(LanguageContext);
}
