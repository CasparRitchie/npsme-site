// src/pages/workspace/Login.jsx
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function WorkspaceLogin() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const searchParams = new URLSearchParams(location.search);
  const nextPath = searchParams.get("next");

  const redirectTo =
    nextPath && nextPath !== "/workspace/login"
      ? nextPath
      : location.state?.from?.pathname &&
          location.state.from.pathname !== "/workspace/login"
        ? location.state.from.pathname
        : "/workspace";

  const loginReason = searchParams.get("reason");

  async function handleSubmit(event) {
    event.preventDefault();

    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password) {
      setError("Please enter your email and password.");
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
        throw new Error("Login failed because the server returned an unexpected response.");
      }

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Login failed.");
      }

      navigate(redirectTo, { replace: true });
    } catch (err) {
      console.error("Workspace login failed:", err);
      setError(err.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="csv-nps-page">
      <section className="csv-nps-hero csv-nps-hero-compact">
        <p className="eyebrow">NPS Me Workspace</p>
        <h1>Workspace login</h1>
        <p>
          Sign in with your individual NPS Me workspace account to access saved
          datasets, AI insights, customer responses and close-the-loop actions.
        </p>
      </section>

      <section className="csv-nps-panel workspace-login-panel">
        <form className="workspace-login-form" onSubmit={handleSubmit}>
          <div>
            <h2>Sign in</h2>
            <p>
              This login is separate from the older shared private password used
              for legacy Envola/private pages.
            </p>
          </div>
          {loginReason && !error && (
            <div className="csv-nps-error csv-nps-error-compact">
              {loginReason}
            </div>
          )}

          {error && <div className="csv-nps-error">{error}</div>}

          <label className="csv-nps-filter-field">
            <span>Email</span>
            <input
              type="email"
              name="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              disabled={loading}
            />
          </label>

          <label className="csv-nps-filter-field">
            <span>Password</span>
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              disabled={loading}
            />
          </label>

          <div className="csv-nps-actions">
            <button
              type="submit"
              className="csv-nps-button"
              disabled={loading || !email.trim() || !password}
            >
              {loading ? "Signing in..." : "Sign in to workspace"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
