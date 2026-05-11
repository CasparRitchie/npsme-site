import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext";
import { translations } from "../i18n/translations";
import { localizePath } from "../i18n/pathHelpers";

export default function PrivateLogin() {
  const { lang } = useLanguage();
  const tr = (p, f) => translations(lang, p, f);

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || localizePath("/private/closing-the-loop", lang);

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      const r = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "include", // IMPORTANT for cookie set
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const j = await r.json().catch(() => ({}));

      if (!r.ok || !j?.ok) {
        setErr(j?.error || tr("auth.invalidPassword", "Incorrect password."));
        setLoading(false);
        return;
      }
      window.dispatchEvent(new Event("npsme-auth-changed"));

      navigate(from, { replace: true });
    } catch (e2) {
      setErr(tr("common.errorGeneric", "Something went wrong."));
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg px-6 py-16">
      <h1 className="text-2xl font-semibold text-white">
        {tr("auth.privateAccess", "Private access")}
      </h1>

      <p className="mt-2 text-sm text-slate-300">
        {tr("auth.enterPassword", "Enter the shared password to continue.")}
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-3">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-slate-200"
          placeholder={tr("auth.password", "Password")}
          autoComplete="current-password"
        />

        {err ? <div className="text-sm text-red-300">{err}</div> : null}

        <button
          type="submit"
          disabled={loading || !password}
          className="w-full rounded-xl bg-white text-black px-4 py-3 text-sm font-semibold disabled:opacity-60"
        >
          {loading ? tr("common.loading", "Loading…") : tr("auth.unlock", "Unlock")}
        </button>
      </form>
    </div>
  );
}
