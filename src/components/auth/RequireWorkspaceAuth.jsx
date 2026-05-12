// src/components/auth/RequireWorkspaceAuth.jsx
import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";

/**
 * Protects the new NPS Me Workspace routes.
 *
 * Important:
 * - This uses /api/workspace-auth/me
 * - It is separate from the older shared/private auth system
 * - Do not use this for legacy Envola/private pages yet
 */
export default function RequireWorkspaceAuth({ children }) {
  const location = useLocation();

  const [state, setState] = useState({
    loading: true,
    authed: false,
    error: "",
  });

  useEffect(() => {
    let cancelled = false;

    async function checkWorkspaceAuth() {
      try {
        const res = await fetch("/api/workspace-auth/me", {
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
        });

        const contentType = res.headers.get("content-type") || "";

        if (!contentType.includes("application/json")) {
          const text = await res.text();
          console.error(
            "Expected JSON from workspace auth check:",
            text.slice(0, 500)
          );

          throw new Error("Unexpected response from workspace auth check.");
        }

        const data = await res.json();

        if (cancelled) return;

        setState({
          loading: false,
          authed: Boolean(res.ok && data.ok && data.authed),
          error: res.ok ? "" : data.error || "Workspace login required",
        });
      } catch (err) {
        console.error("Workspace auth check failed:", err);

        if (cancelled) return;

        setState({
          loading: false,
          authed: false,
          error: err.message || "Workspace login required",
        });
      }
    }

    checkWorkspaceAuth();

    return () => {
      cancelled = true;
    };
  }, [location.pathname]);

  if (state.loading) {
    return (
      <main className="csv-nps-page">
        <section className="csv-nps-hero csv-nps-hero-compact">
          <p className="eyebrow">NPS Me Workspace</p>
          <h1>Checking workspace access</h1>
          <p>Confirming your workspace session...</p>
        </section>

        <section className="csv-nps-panel">
          <p>Loading workspace access.</p>
        </section>
      </main>
    );
  }

  if (!state.authed) {
    return (
      <Navigate
        to="/workspace/login"
        replace
        state={{
          from: location,
          reason: state.error,
        }}
      />
    );
  }

  return children;
}
