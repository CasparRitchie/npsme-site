import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useLanguage } from "../../i18n/LanguageContext";
import { localizePath } from "../../i18n/pathHelpers";

export default function RequireAuth({ children }) {
  const { lang } = useLanguage();
  const location = useLocation();

  const [state, setState] = useState({ loading: true, authed: false });

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const r = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include", // IMPORTANT for cookie auth
          headers: { "Accept": "application/json" },
        });
        const j = await r.json();
        if (!cancelled) {
          setState({ loading: false, authed: Boolean(j?.authed) });
        }
      } catch (e) {
        if (!cancelled) setState({ loading: false, authed: false });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (state.loading) return null; // or a spinner

  if (!state.authed) {
    const loginPath = localizePath("/private/login", lang);
    return <Navigate to={loginPath} replace state={{ from: location.pathname }} />;
  }

  return children;
}
