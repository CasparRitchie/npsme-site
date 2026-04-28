// src/pages/EnvolaInvitations.jsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import EnvolaWorkspaceNav from "../components/EnvolaWorkspaceNav";
import { useLanguage } from "../i18n/LanguageContext";
import { translations } from "../i18n/translations";

const DEFAULT_CONTENT_ID = "189616";

function prettyDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatCard({ label, value, sub }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/10 p-5">
      <div className="text-xs text-slate-400">{label}</div>
      <div className="mt-2 text-3xl font-semibold text-white">{value}</div>
      {sub ? <div className="mt-2 text-sm text-slate-300">{sub}</div> : null}
    </div>
  );
}

function statusPill(status, tr) {
  const base =
    "inline-flex items-center rounded-full border px-2 py-1 text-xs font-medium";

  if (status === "responded") {
    return (
      <span className={`${base} border-emerald-400/30 bg-emerald-500/10 text-emerald-200`}>
        {tr("envola.invitations.status.responded", "Responded")}
      </span>
    );
  }

  if (status === "delivered") {
    return (
      <span className={`${base} border-sky-400/30 bg-sky-500/10 text-sky-200`}>
        {tr("envola.invitations.status.delivered", "Delivered")}
      </span>
    );
  }

  if (status === "opened") {
    return (
      <span className={`${base} border-indigo-400/30 bg-indigo-500/10 text-indigo-200`}>
        {tr("envola.invitations.status.opened", "Opened")}
      </span>
    );
  }

  if (status === "bounced") {
    return (
      <span className={`${base} border-rose-400/30 bg-rose-500/10 text-rose-200`}>
        {tr("envola.invitations.status.bounced", "Bounced")}
      </span>
    );
  }

  if (status === "failed") {
    return (
      <span className={`${base} border-rose-400/30 bg-rose-500/10 text-rose-200`}>
        {tr("envola.invitations.status.failed", "Failed")}
      </span>
    );
  }

  if (status === "sent") {
    return (
      <span className={`${base} border-white/10 bg-white/5 text-slate-200`}>
        {tr("envola.invitations.status.sent", "Sent")}
      </span>
    );
  }

  return (
    <span className={`${base} border-white/10 bg-white/5 text-slate-200`}>
      {status || tr("common.unknown", "Unknown")}
    </span>
  );
}

function useInvitationFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo(() => {
    return {
      contentId: searchParams.get("content_id") || DEFAULT_CONTENT_ID,
      days: Number(searchParams.get("days") || 365),
      status: searchParams.get("status") || "all",
    };
  }, [searchParams]);

  function updateFilters(patch) {
    const next = new URLSearchParams(searchParams);

    Object.entries(patch).forEach(([key, value]) => {
      if (value === "" || value == null) {
        next.delete(key);
      } else {
        next.set(key, String(value));
      }
    });

    setSearchParams(next, { replace: true });
  }

  return { filters, updateFilters };
}

export default function EnvolaInvitations() {
  const location = useLocation();
  const { lang } = useLanguage();
  const tr = useCallback((p, f) => translations(lang, p, f), [lang]);
  const { filters, updateFilters } = useInvitationFilters();

  const navAnchorRef = useRef(null);
  const [isNavPinned, setIsNavPinned] = useState(false);

  const [invites, setInvites] = useState({
    loading: true,
    data: null,
    error: null,
  });

  useEffect(() => {
    function handleScroll() {
      if (!navAnchorRef.current) return;
      const rect = navAnchorRef.current.getBoundingClientRect();
      setIsNavPinned(rect.top <= 0);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    setInvites({ loading: true, data: null, error: null });

    (async () => {
      try {
        const qs = new URLSearchParams({
          content_id: String(filters.contentId || "").trim(),
          days: String(filters.days || 365),
          status: String(filters.status || "all"),
        });

        const r = await fetch(`/api/envola/invitations?${qs.toString()}`, {
          credentials: "include",
        });
        const j = await r.json().catch(() => null);

        if (!cancelled) {
          setInvites({
            loading: false,
            data: j,
            error: r.ok ? null : j?.error || tr("envola.common.error", "Error"),
          });
        }
      } catch (e) {
        if (!cancelled) {
          setInvites({
            loading: false,
            data: null,
            error: e.message,
          });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [filters.contentId, filters.days, filters.status, tr]);

  const summary = invites.data?.summary || {};
  const rows = Array.isArray(invites.data?.rows) ? invites.data.rows : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B0F19] via-[#0C1224] to-[#0B0F19] text-slate-200">
      <PageHeader iconLabel="NPS Me" tag={tr("envola.tag", "Client workspace / Envola")}>
        <div className="pt-4">
          <h1 className="text-3xl md:text-4xl font-semibold text-white">
            {tr("envola.invitations.title", "Envola — Invitations")}
          </h1>

          <p className="mt-3 max-w-3xl text-slate-300">
            {tr(
              "envola.invitations.subtitle",
              "Track invitations sent, delivery status, responses and response rate for the Envola programme."
            )}
          </p>
        </div>
      </PageHeader>

      <div ref={navAnchorRef} className="h-px w-full" />

      {isNavPinned && <div className="h-[66px]" />}

      <section
        className={`border-y border-white/10 bg-[#0B1220]/95 backdrop-blur-md ${
          isNavPinned ? "fixed inset-x-0 top-0 z-[80]" : "relative"
        }`}
      >
        <div className="mx-auto max-w-7xl px-6 py-3">
          <EnvolaWorkspaceNav lang={lang} currentPath={location.pathname} />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-6 pt-6">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 md:p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">
                {tr("envola.invitations.filters.title", "Global filters")}
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                {tr(
                  "envola.invitations.filters.subtitle",
                  "These filters apply to invitation KPIs and the recent invitations table."
                )}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3 xl:grid-cols-3">
            <div>
              <label className="text-xs text-slate-400">
                {tr("envola.invitations.filters.contentId", "content_id")}
              </label>
              <input
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white"
                value={filters.contentId}
                onChange={(e) => updateFilters({ content_id: e.target.value })}
              />
            </div>

            <div>
              <label className="text-xs text-slate-400">
                {tr("envola.invitations.filters.window", "Window")}
              </label>
              <select
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white"
                value={filters.days}
                onChange={(e) => updateFilters({ days: Number(e.target.value) })}
              >
                <option value={30}>30d</option>
                <option value={90}>90d</option>
                <option value={180}>180d</option>
                <option value={365}>365d</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-400">
                {tr("envola.invitations.filters.status", "Status")}
              </label>
              <select
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white"
                value={filters.status}
                onChange={(e) => updateFilters({ status: e.target.value })}
              >
                <option value="all">{tr("envola.invitations.filters.all", "All")}</option>
                <option value="sent">{tr("envola.invitations.status.sent", "Sent")}</option>
                <option value="delivered">{tr("envola.invitations.status.delivered", "Delivered")}</option>
                <option value="opened">{tr("envola.invitations.status.opened", "Opened")}</option>
                <option value="responded">{tr("envola.invitations.status.responded", "Responded")}</option>
                <option value="bounced">{tr("envola.invitations.status.bounced", "Bounced")}</option>
                <option value="failed">{tr("envola.invitations.status.failed", "Failed")}</option>
              </select>
            </div>
          </div>

          {invites.error && (
            <div className="mt-6 rounded-2xl border border-rose-400/20 bg-rose-500/10 p-4 text-rose-100">
              <div className="font-medium">
                {tr("envola.invitations.state.errorTitle", "Error")}
              </div>
              <div className="mt-1 text-sm opacity-90">{invites.error}</div>
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-8">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <StatCard
            label={tr("envola.invitations.kpis.sent", "Invitations sent")}
            value={invites.loading ? "…" : summary.sent ?? "—"}
            sub={`${filters.days}d`}
          />

          <StatCard
            label={tr("envola.invitations.kpis.delivered", "Delivered")}
            value={invites.loading ? "…" : summary.delivered ?? "—"}
          />

          <StatCard
            label={tr("envola.invitations.kpis.responded", "Responded")}
            value={invites.loading ? "…" : summary.responded ?? "—"}
          />

          <StatCard
            label={tr("envola.invitations.kpis.responseRate", "Response rate")}
            value={
              invites.loading
                ? "…"
                : summary.response_rate_pct == null
                ? "—"
                : `${summary.response_rate_pct}%`
            }
          />

          <StatCard
            label={tr("envola.invitations.kpis.lastSent", "Last invitation sent")}
            value={invites.loading ? "…" : prettyDate(summary.last_sent_at)}
          />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-xl md:text-2xl font-semibold text-white">
                {tr("envola.invitations.table.title", "Recent invitations")}
              </h2>
              <p className="mt-2 text-sm text-slate-300">
                {tr(
                  "envola.invitations.table.subtitle",
                  "Latest invitation activity for the current filter set."
                )}
              </p>
            </div>
          </div>

          {invites.loading && (
            <p className="mt-6 text-sm text-slate-300">
              {tr("envola.invitations.state.loading", "Loading invitations…")}
            </p>
          )}

          {!invites.loading && !invites.error && rows.length === 0 && (
            <div className="mt-6 rounded-2xl border border-white/10 bg-black/10 p-5 text-sm text-slate-300">
              {tr(
                "envola.invitations.state.empty",
                "No invitations found for this filter set."
              )}
            </div>
          )}

          {!invites.loading && !invites.error && rows.length > 0 && (
            <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
              <table className="w-full border-collapse">
                <thead className="bg-white/5">
                  <tr className="text-left text-xs text-slate-300">
                    <th className="px-4 py-3">
                      {tr("envola.invitations.table.sentAt", "Sent")}
                    </th>
                    <th className="px-4 py-3">
                      {tr("envola.invitations.table.contact", "Contact")}
                    </th>
                    <th className="px-4 py-3">
                      {tr("envola.invitations.table.email", "Email")}
                    </th>
                    <th className="px-4 py-3">
                      {tr("envola.invitations.table.status", "Status")}
                    </th>
                    <th className="px-4 py-3">
                      {tr("envola.invitations.table.score", "Score")}
                    </th>
                    <th className="px-4 py-3">
                      {tr("envola.invitations.table.responseId", "Response")}
                    </th>
                  </tr>
                </thead>

                <tbody className="text-sm">
                  {rows.map((row, idx) => (
                    <tr
                      key={row.invitation_id || `${row.email || "invite"}-${idx}`}
                      className="border-t border-white/10"
                    >
                      <td className="px-4 py-3 text-slate-200">
                        {prettyDate(row.sent_at)}
                      </td>

                      <td className="px-4 py-3 text-white">
                        <div>{row.name || "—"}</div>

                        <div className="mt-2">
                          {row.intercom_contact_url ? (
                            <a
                              href={row.intercom_contact_url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center rounded-xl border border-indigo-500/20 bg-indigo-500/10 px-2.5 py-1 text-[11px] font-medium text-indigo-200 hover:bg-indigo-500/20"
                            >
                              {tr("common.open", "Open")}
                            </a>
                          ) : (
                            <span className="text-slate-500">—</span>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3 text-slate-200">
                        {row.email || "—"}
                      </td>

                      <td className="px-4 py-3">
                        {statusPill(row.status, tr)}
                      </td>

                      <td className="px-4 py-3 text-slate-200">
                        {typeof row.score_0_10 === "number" ? row.score_0_10 : "—"}
                      </td>

                      <td className="px-4 py-3 text-slate-200">
                        {row.response_id || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
