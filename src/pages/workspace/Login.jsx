// src/pages/workspace/Login.jsx
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "../../i18n/LanguageContext";
import { translations } from "../../i18n/translations";

export default function WorkspaceLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { lang } = useLanguage();
  const tr = (path, fallback = "") => translations(lang, path, fallback);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const searchParams = new URLSearchParams(location.search);
  const nextPath = searchParams.get("next");

  const loginPath = lang === "fr" ? "/fr/workspace/login" : "/workspace/login";
  const workspaceHomePath = lang === "fr" ? "/fr/workspace" : "/workspace";

  const redirectTo =
    nextPath && nextPath !== loginPath
      ? nextPath
      : location.state?.from?.pathname &&
          location.state.from.pathname !== loginPath
        ? location.state.from.pathname
        : workspaceHomePath;

  const loginReason = searchParams.get("reason");

  async function handleSubmit(event) {
    event.preventDefault();

    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password) {
      setError(
        tr(
          "workspaceLogin.errors.missingFields",
          "Please enter your email and password."
        )
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/workspace-auth/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: trimmedEmail,
          password,
        }),
      });

      const contentType = res.headers.get("content-type") || "";

      if (!contentType.includes("application/json")) {
        const text = await res.text();
        console.error("Expected JSON from workspace login:", text.slice(0, 500));
        throw new Error(
          tr(
            "workspaceLogin.errors.unexpectedResponse",
            "Login failed because the server returned an unexpected response."
          )
        );
      }

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(
          data.error ||
            tr("workspaceLogin.errors.loginFailed", "Login failed.")
        );
      }

      navigate(redirectTo, { replace: true });
    } catch (err) {
      console.error("Workspace login failed:", err);
      setError(
        err.message ||
          tr("workspaceLogin.errors.loginFailed", "Login failed.")
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="csv-nps-page">
      <section className="csv-nps-hero csv-nps-hero-compact">
        <p className="eyebrow">
          {tr("workspaceLogin.hero.eyebrow", "NPS Me Workspace")}
        </p>
        <h1>{tr("workspaceLogin.hero.title", "Workspace login")}</h1>
        <p>
          {tr(
            "workspaceLogin.hero.body",
            "Sign in with your individual NPS Me workspace account to access saved datasets, AI insights, customer responses and close-the-loop actions."
          )}
        </p>
      </section>

      <section className="csv-nps-panel workspace-login-panel">
        <form className="workspace-login-form" onSubmit={handleSubmit}>
          <div>
            <h2>{tr("workspaceLogin.form.title", "Sign in")}</h2>
            <p>
              {tr(
                "workspaceLogin.form.intro",
                "Use your workspace account details to access your secure NPS Me workspace."
              )}
            </p>
          </div>

          {loginReason && !error && (
            <div className="csv-nps-error csv-nps-error-compact">
              {loginReason}
            </div>
          )}

          {error && <div className="csv-nps-error">{error}</div>}

          <label className="csv-nps-filter-field">
            <span>{tr("workspaceLogin.form.emailLabel", "Email")}</span>
            <input
              type="email"
              name="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={tr(
                "workspaceLogin.form.emailPlaceholder",
                "you@example.com"
              )}
              disabled={loading}
            />
          </label>

          <label className="csv-nps-filter-field">
            <span>{tr("workspaceLogin.form.passwordLabel", "Password")}</span>
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={tr(
                "workspaceLogin.form.passwordPlaceholder",
                "Enter your password"
              )}
              disabled={loading}
            />
          </label>

          <div className="csv-nps-actions">
            <button
              type="submit"
              className="csv-nps-button"
              disabled={loading || !email.trim() || !password}
            >
              {loading
                ? tr("workspaceLogin.form.submitting", "Signing in...")
                : tr("workspaceLogin.form.submit", "Sign in to workspace")}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
