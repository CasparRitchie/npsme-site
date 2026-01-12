// src/pages/LiveSurveyAdminPage.jsx
import React from "react";
import { useLocation } from "react-router-dom";
import Seo from "../components/Seo";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { translations } from "../i18n/translations.js";

function normaliseStatus(s) {
  const v = (s || "").toLowerCase().trim();
  return v || "pending";
}

function computeNps(scores) {
  const clean = (scores || []).filter((n) => Number.isFinite(n));
  if (!clean.length) return null;
  const promoters = clean.filter((s) => s >= 9).length;
  const detractors = clean.filter((s) => s <= 6).length;
  return Math.round(((promoters - detractors) / clean.length) * 100);
}

function toInt(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
}

function computeResendsFromRow(row) {
  const explicitResends = row?.resends ?? row?.resendCount;
  if (Number.isFinite(Number(explicitResends))) return Math.max(0, toInt(explicitResends));

  const sends = toInt(row?.sendCount ?? row?.sentCount ?? row?.resentCount ?? row?.sendsCount, 0);
  return Math.max(0, sends - 1);
}

function formatMaybeIso(s) {
  if (!s) return "-";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return String(s);
  return d.toISOString();
}

function interpolate(template, vars = {}) {
  return String(template || "").replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? ""));
}

function ResponseDial({ value, label, valueLabel }) {
  const pct = Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0));
  const style = {
    background: `conic-gradient(#34d399 ${pct}%, rgba(148,163,184,0.15) 0)`,
  };
  return (
    <div className="flex items-center gap-3">
      <div className="h-12 w-12 rounded-full p-[3px]" style={style} aria-label={`${label} ${pct}%`}>
        <div className="h-full w-full rounded-full bg-slate-950/80 flex items-center justify-center">
          <span className="text-[11px] font-semibold text-slate-100">{pct}%</span>
        </div>
      </div>
      <div className="leading-tight">
        <div className="text-xs text-slate-400">{label}</div>
        <div className="text-sm font-semibold text-slate-100">{valueLabel ?? `${pct}%`}</div>
      </div>
    </div>
  );
}

function NpsDial({ value, label }) {
  const size = 48;
  const stroke = 6;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;

  const isNull = value === null || value === undefined;
  const v = isNull ? 0 : Math.max(-100, Math.min(100, Number(value) || 0));
  const pct = (v + 100) / 2; // -100..+100 => 0..100
  const offset = c - (pct / 100) * c;

  return (
    <div className="flex items-center gap-3">
      <svg width={size} height={size} className="shrink-0" aria-label={label}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={stroke}
          fill="none"
          className="stroke-slate-800"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={stroke}
          fill="none"
          className={isNull ? "stroke-slate-600" : v >= 0 ? "stroke-emerald-400" : "stroke-rose-400"}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="leading-tight">
        <div className="text-xs text-slate-400">{label}</div>
        <div className="text-sm font-semibold text-slate-100">{isNull ? "—" : v}</div>
      </div>
    </div>
  );
}

function KpiCard({ label, value, sub }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 shadow-xl shadow-black/30">
      <div className="text-[11px] uppercase tracking-widest text-slate-400">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-slate-50">{value}</div>
      {sub ? <div className="mt-1 text-xs text-slate-400">{sub}</div> : null}
    </div>
  );
}

function StatusPill({ status, label }) {
  const s = normaliseStatus(status);
  const base = "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] border";
  const map = {
    pending: "border-slate-700 text-slate-200",
    sent: "border-sky-400/40 text-sky-200",
    started: "border-amber-400/40 text-amber-200",
    responded: "border-emerald-400/40 text-emerald-200",
  };
  return <span className={`${base} ${map[s] || map.pending}`}>{label}</span>;
}

export default function LiveSurveyAdminPage() {
  const { lang } = useLanguage();
  const location = useLocation();

  // explicit helper (uses your new translations() function)
  const tr = (key, fallback) => translations(lang, key, fallback);

  const [invites, setInvites] = React.useState([]);
  const [responses, setResponses] = React.useState([]);
  const [selectedIds, setSelectedIds] = React.useState(new Set());
  const [loading, setLoading] = React.useState(false);
  const [sending, setSending] = React.useState(false);
  const [error, setError] = React.useState("");
  const [statusMsg, setStatusMsg] = React.useState("");
  const [resendingId, setResendingId] = React.useState("");
  const [insights, setInsights] = React.useState(null);
  const [insightsLoading, setInsightsLoading] = React.useState(false);
  const [insightsError, setInsightsError] = React.useState("");

  const title = tr("liveAdmin.seoTitle", "Live Survey Admin | NPS Me");
  const description = tr(
    "liveAdmin.seoDescription",
    "Review and send live NPS invitations from your Envola customer list."
  );

  async function loadAll() {
    setLoading(true);
    setError("");
    try {
      const mergedRes = await fetch("/api/live-merged");
      const mergedData = await mergedRes.json();
      if (!mergedRes.ok || !mergedData.ok) throw new Error(mergedData.error || "Failed to load merged data");

      // invites drive the funnel/status buckets
      setInvites(mergedData.rows || []);

      // optional: if you still want responseByInvitationId to work unchanged,
      // you can also derive responses from merged rows:
      setResponses(
        (mergedData.rows || [])
          .filter(r => r.response)
          .map(r => r.response)
      );
      setSelectedIds(new Set());

      const invData = await invRes.json();
      const respData = await respRes.json();

      if (!invRes.ok) throw new Error(invData.error || tr("liveAdmin.errors.loadInvFail", "Failed to load invitations"));
      if (!respRes.ok) throw new Error(respData.error || tr("liveAdmin.errors.loadRespFail", "Failed to load responses"));

      setInvites(invData.rows || []);
      setResponses(respData.rows || []);
      setSelectedIds(new Set());
    } catch (e) {
      console.error("loadAll error", e);
      setError(e.message || tr("liveAdmin.errors.loadUnable", "Unable to load data."));
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleOne = (invitationId) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(invitationId)) next.delete(invitationId);
      else next.add(invitationId);
      return next;
    });
  };

  const responseByInvitationId = React.useMemo(() => {
    const map = new Map();
    for (const r of responses || []) {
      const id = (r.invitationId || "").trim();
      if (!id) continue;

      const createdAt = r.createdAt ? new Date(r.createdAt).getTime() : 0;
      const prev = map.get(id);
      const prevTime = prev?.createdAt ? new Date(prev.createdAt).getTime() : 0;

      if (!prev || createdAt >= prevTime) map.set(id, r);
    }
    return map;
  }, [responses]);

  const pending = [];
  const sent = [];
  const started = [];
  const completed = [];

  for (const inv of invites) {
    const s = normaliseStatus(inv.status);
    if (s === "responded") completed.push(inv);
    else if (s === "started") started.push(inv);
    else if (s === "sent") sent.push(inv);
    else pending.push(inv);
  }

  const pendingIds = pending.map((r) => r.invitationId);
  const allSelected = pending.length > 0 && pending.every((r) => selectedIds.has(r.invitationId));
  const anySelected = selectedIds.size > 0;

  const toggleAllPending = () => {
    if (allSelected) setSelectedIds(new Set());
    else setSelectedIds(new Set(pendingIds));
  };

  async function handleSendSelectedPending() {
    setError("");
    setStatusMsg("");

    if (!anySelected) {
      setError(tr("liveAdmin.errors.selectAtLeastOne", "Please select at least one invitation to send."));
      return;
    }

    try {
      setSending(true);
      const res = await fetch("/api/live-invitations/send-batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invitationIds: Array.from(selectedIds) }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || tr("liveAdmin.errors.sendFail", "Batch send failed"));

      const successes = (data.results || []).filter((r) => r.ok).length;
      const failures = (data.results || []).filter((r) => !r.ok).length;

      const plural = successes === 1 ? "" : "s";
      const failSuffix = failures
        ? interpolate(tr("liveAdmin.statusMsg.failSuffix", ", {failures} failed."), { failures })
        : "";

      const template = tr("liveAdmin.statusMsg.sent", "Sent {successes} invitation{plural}{failSuffix}");
      setStatusMsg(interpolate(template, { successes, plural, failSuffix }));

      await loadAll();
    } catch (e) {
      console.error("send batch error", e);
      setError(e.message || tr("liveAdmin.errors.sendUnable", "We couldn’t send those invitations."));
    } finally {
      setSending(false);
    }
  }

  async function handleResend(invitationId) {
    setError("");
    setStatusMsg("");
    setResendingId(invitationId);

    try {
      const res = await fetch("/api/live-invitations/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invitationId }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || tr("liveAdmin.errors.resendFail", "Resend failed"));

      const template = tr("liveAdmin.statusMsg.resent", "Resent invitation {invitationId}.");
      setStatusMsg(interpolate(template, { invitationId }));

      await loadAll();
    } catch (e) {
      console.error("resend error", e);
      setError(e.message || tr("liveAdmin.errors.resendUnable", "We couldn’t resend that invitation."));
    } finally {
      setResendingId("");
    }
  }

  async function loadInsights(params = {}) {
    setInsightsLoading(true);
    setInsightsError("");
    try {
      const qs = new URLSearchParams();
      if (params.stage) qs.set("stage", params.stage);
      if (params.device) qs.set("device", params.device);
      qs.set("limit", String(params.limit ?? 200));

      const res = await fetch(`/api/live-insights?${qs.toString()}`);
      const data = await res.json();

      if (!res.ok || !data.ok) throw new Error(data.error || "Failed to load insights");
      setInsights(data);
    } catch (e) {
      console.error("loadInsights error", e);
      setInsightsError(e.message || "Failed to load insights");
      setInsights(null);
    } finally {
      setInsightsLoading(false);
    }
  }

  const total = invites.length;
  const sentOrMore = sent.length + started.length + completed.length;
  const responseRate = sentOrMore ? Math.round((completed.length / sentOrMore) * 100) : 0;

  const completedScores = completed
    .map((inv) => responseByInvitationId.get((inv.invitationId || "").trim()))
    .map((r) => (r && r.score !== undefined ? Number(r.score) : NaN))
    .filter((n) => Number.isFinite(n));

  const nps = computeNps(completedScores);

  const statusLabel = (rawStatus) => {
    const s = normaliseStatus(rawStatus);
    // Optional: add liveAdmin.status.pending/sent/... later in TRANSLATIONS
    return tr(`liveAdmin.status.${s}`, s);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100">
      <Seo path={location.pathname} title={title} description={description} noindex/>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-12 space-y-6">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs tracking-widest text-slate-400 uppercase">
              {tr("liveAdmin.eyebrow", "Live programme · Envola")}
            </p>
            <h1 className="text-2xl sm:text-3xl font-semibold text-slate-50">
              {tr("liveAdmin.title", "Live survey admin")}
            </h1>
            <p className="mt-1 text-sm text-slate-400 max-w-2xl">
              {tr(
                "liveAdmin.intro",
                "Track invitations through the full lifecycle, resend when needed, and review completed scores."
              )}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <ResponseDial
              value={responseRate}
              label={tr("liveAdmin.responseRate", "Response rate")}
              valueLabel={`${responseRate}%`}
            />
            <NpsDial value={nps} label={tr("liveAdmin.nps", "NPS")} />
            <button
              type="button"
              onClick={loadAll}
              disabled={loading}
              className="text-xs rounded-full border border-slate-700 px-3 py-1 hover:bg-slate-800 disabled:opacity-50"
            >
              {loading ? tr("liveAdmin.refreshing", "Refreshing…") : tr("liveAdmin.refresh", "Refresh")}
            </button>
          </div>
        </header>

        {error && (
          <div className="rounded-2xl border border-rose-500/70 bg-rose-950/50 px-3 py-2 text-xs text-rose-100">
            {error}
          </div>
        )}

        {statusMsg && (
          <div className="rounded-2xl border border-emerald-500/70 bg-emerald-950/40 px-3 py-2 text-xs text-emerald-100">
            {statusMsg}
          </div>
        )}

        <section className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <KpiCard label={tr("liveAdmin.kpi.total", "Total")} value={total} sub={tr("liveAdmin.kpi.totalSub", "All invitations in file")} />
          <KpiCard label={tr("liveAdmin.kpi.pending", "Pending")} value={pending.length} sub={tr("liveAdmin.kpi.pendingSub", "Not yet sent")} />
          <KpiCard label={tr("liveAdmin.kpi.sent", "Sent")} value={sent.length} sub={tr("liveAdmin.kpi.sentSub", "Delivered or queued")} />
          <KpiCard label={tr("liveAdmin.kpi.started", "Started")} value={started.length} sub={tr("liveAdmin.kpi.startedSub", "Opened survey link")} />
          <KpiCard
            label={tr("liveAdmin.kpi.completed", "Completed")}
            value={completed.length}
            sub={nps === null ? tr("liveAdmin.kpi.npsNA", "NPS: n/a") : `${tr("liveAdmin.nps", "NPS")}: ${nps}`}
          />
        </section>

        {/* Pending */}
        <section className="rounded-3xl border border-slate-800 bg-slate-950/60 p-5 sm:p-6 shadow-xl shadow-black/40">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-50">{tr("liveAdmin.sections.pending", "Pending")}</h2>
              <p className="text-xs text-slate-400">{tr("liveAdmin.sections.pendingHelp", "Select and send invitations.")}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleAllPending}
                disabled={loading || pending.length === 0}
                className="text-xs rounded-full border border-slate-700 px-3 py-1 hover:bg-slate-800 disabled:opacity-50"
              >
                {allSelected ? tr("liveAdmin.actions.deselectAll", "Deselect all") : tr("liveAdmin.actions.selectAll", "Select all")}
              </button>

              <button
                type="button"
                onClick={handleSendSelectedPending}
                disabled={loading || pending.length === 0 || !anySelected || sending}
                className={`text-xs rounded-full px-4 py-1.5 font-semibold shadow-lg shadow-emerald-500/30 ${
                  sending || !anySelected
                    ? "bg-emerald-500/50 cursor-not-allowed"
                    : "bg-emerald-400 text-slate-950 hover:bg-emerald-300"
                }`}
              >
                {sending ? tr("liveAdmin.actions.sending", "Sending…") : tr("liveAdmin.actions.sendSelected", "Send selected")}
              </button>
            </div>
          </div>

          {loading ? (
            <p className="text-sm text-slate-400">{tr("liveAdmin.empty.loading", "Loading…")}</p>
          ) : pending.length === 0 ? (
            <p className="text-sm text-slate-400">{tr("liveAdmin.empty.noPending", "No pending invitations.")}</p>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/60">
              <table className="min-w-full text-xs">
                <thead className="bg-slate-900/70">
                  <tr>
                    <th className="px-3 py-2 text-left">
                      <input type="checkbox" checked={allSelected} onChange={toggleAllPending} />
                    </th>
                    <th className="px-3 py-2 text-left text-slate-300">{tr("liveAdmin.table.invitationId", "Invitation ID")}</th>
                    <th className="px-3 py-2 text-left text-slate-300">{tr("liveAdmin.table.name", "Name")}</th>
                    <th className="px-3 py-2 text-left text-slate-300">{tr("liveAdmin.table.email", "Email")}</th>
                    <th className="px-3 py-2 text-left text-slate-300">{tr("liveAdmin.table.device", "Device")}</th>
                    <th className="px-3 py-2 text-left text-slate-300">{tr("liveAdmin.table.am", "AM")}</th>
                    <th className="px-3 py-2 text-left text-slate-300">{tr("liveAdmin.table.status", "Status")}</th>
                  </tr>
                </thead>
                <tbody>
                  {pending.map((row, idx) => {
                    const selected = selectedIds.has(row.invitationId);
                    const stripe = idx % 2 === 0 ? "bg-slate-950/40" : "bg-slate-950/10";
                    return (
                      <tr key={row.invitationId} className={stripe}>
                        <td className="px-3 py-2">
                          <input type="checkbox" checked={selected} onChange={() => toggleOne(row.invitationId)} />
                        </td>
                        <td className="px-3 py-2 font-mono text-[11px] text-slate-300">{row.invitationId}</td>
                        <td className="px-3 py-2">{row.customerName}</td>
                        <td className="px-3 py-2 text-slate-300">{row.email}</td>
                        <td className="px-3 py-2">{row.typeOfDevice || <span className="text-slate-500">-</span>}</td>
                        <td className="px-3 py-2">{row.assistanteMaternelle || <span className="text-slate-500">-</span>}</td>
                        <td className="px-3 py-2">
                          <StatusPill status={row.status} label={statusLabel(row.status)} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Sent */}
        <section className="rounded-3xl border border-slate-800 bg-slate-950/60 p-5 sm:p-6 shadow-xl shadow-black/40">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-slate-50">{tr("liveAdmin.sections.sent", "Sent")}</h2>
            <p className="text-xs text-slate-400">{tr("liveAdmin.sections.sentHelp", "Resend if someone cannot find the email.")}</p>
          </div>

          {sent.length === 0 ? (
            <p className="text-sm text-slate-400">{tr("liveAdmin.empty.noSent", "No sent invitations.")}</p>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/60">
              <table className="min-w-full text-xs">
                <thead className="bg-slate-900/70">
                  <tr>
                    <th className="px-3 py-2 text-left text-slate-300">{tr("liveAdmin.table.invitationId", "Invitation ID")}</th>
                    <th className="px-3 py-2 text-left text-slate-300">{tr("liveAdmin.table.name", "Name")}</th>
                    <th className="px-3 py-2 text-left text-slate-300">{tr("liveAdmin.table.email", "Email")}</th>
                    <th className="px-3 py-2 text-left text-slate-300">{tr("liveAdmin.table.lastSent", "Last sent")}</th>
                    <th className="px-3 py-2 text-left text-slate-300">{tr("liveAdmin.table.resends", "Resends")}</th>
                    <th className="px-3 py-2 text-left text-slate-300">{tr("liveAdmin.table.action", "Action")}</th>
                  </tr>
                </thead>
                <tbody>
                  {sent.map((row, idx) => {
                    const stripe = idx % 2 === 0 ? "bg-slate-950/40" : "bg-slate-950/10";
                    const lastSent = row.lastSentAt || row.sentAt || row.lastSent || row.last_sent_at;
                    const resends = computeResendsFromRow(row);

                    return (
                      <tr key={row.invitationId} className={stripe}>
                        <td className="px-3 py-2 font-mono text-[11px] text-slate-300">{row.invitationId}</td>
                        <td className="px-3 py-2">{row.customerName}</td>
                        <td className="px-3 py-2 text-slate-300">{row.email}</td>
                        <td className="px-3 py-2 text-slate-300">{formatMaybeIso(lastSent)}</td>
                        <td className="px-3 py-2 text-slate-300">{resends}</td>
                        <td className="px-3 py-2">
                          <button
                            type="button"
                            onClick={() => handleResend(row.invitationId)}
                            disabled={resendingId === row.invitationId}
                            className={`text-xs rounded-full px-3 py-1 border ${
                              resendingId === row.invitationId
                                ? "border-slate-700 text-slate-400 cursor-not-allowed"
                                : "border-sky-400/40 text-sky-200 hover:bg-slate-900/60"
                            }`}
                          >
                            {resendingId === row.invitationId
                              ? tr("liveAdmin.actions.resending", "Resending…")
                              : tr("liveAdmin.actions.resend", "Resend")}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Started */}
        <section className="rounded-3xl border border-slate-800 bg-slate-950/60 p-5 sm:p-6 shadow-xl shadow-black/40">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-slate-50">{tr("liveAdmin.sections.started", "Started")}</h2>
            <p className="text-xs text-slate-400">{tr("liveAdmin.sections.startedHelp", "These recipients opened the survey link.")}</p>
          </div>

          {started.length === 0 ? (
            <p className="text-sm text-slate-400">{tr("liveAdmin.empty.noStarted", "No started invitations.")}</p>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/60">
              <table className="min-w-full text-xs">
                <thead className="bg-slate-900/70">
                  <tr>
                    <th className="px-3 py-2 text-left text-slate-300">{tr("liveAdmin.table.invitationId", "Invitation ID")}</th>
                    <th className="px-3 py-2 text-left text-slate-300">{tr("liveAdmin.table.name", "Name")}</th>
                    <th className="px-3 py-2 text-left text-slate-300">{tr("liveAdmin.table.email", "Email")}</th>
                    <th className="px-3 py-2 text-left text-slate-300">{tr("liveAdmin.table.status", "Status")}</th>
                  </tr>
                </thead>
                <tbody>
                  {started.map((row, idx) => {
                    const stripe = idx % 2 === 0 ? "bg-slate-950/40" : "bg-slate-950/10";
                    return (
                      <tr key={row.invitationId} className={stripe}>
                        <td className="px-3 py-2 font-mono text-[11px] text-slate-300">{row.invitationId}</td>
                        <td className="px-3 py-2">{row.customerName}</td>
                        <td className="px-3 py-2 text-slate-300">{row.email}</td>
                        <td className="px-3 py-2">
                          <StatusPill status={row.status} label={statusLabel(row.status)} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Completed */}
        <section className="rounded-3xl border border-slate-800 bg-slate-950/60 p-5 sm:p-6 shadow-xl shadow-black/40">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-slate-50">{tr("liveAdmin.sections.completed", "Completed")}</h2>
            <p className="text-xs text-slate-400">{tr("liveAdmin.sections.completedHelp", "Scores are shown when a response exists in /npsme/live/responses.csv.")}</p>
          </div>

          {completed.length === 0 ? (
            <p className="text-sm text-slate-400">{tr("liveAdmin.empty.noCompleted", "No completed invitations.")}</p>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/60">
              <table className="min-w-full text-xs">
                <thead className="bg-slate-900/70">
                  <tr>
                    <th className="px-3 py-2 text-left text-slate-300">{tr("liveAdmin.table.invitationId", "Invitation ID")}</th>
                    <th className="px-3 py-2 text-left text-slate-300">{tr("liveAdmin.table.name", "Name")}</th>
                    <th className="px-3 py-2 text-left text-slate-300">{tr("liveAdmin.table.email", "Email")}</th>
                    <th className="px-3 py-2 text-left text-slate-300">{tr("liveAdmin.table.score", "Score")}</th>
                    <th className="px-3 py-2 text-left text-slate-300">{tr("liveAdmin.table.comment", "Comment")}</th>
                    <th className="px-3 py-2 text-left text-slate-300">{tr("liveAdmin.table.created", "Created")}</th>
                  </tr>
                </thead>
                <tbody>
                  {completed.map((row, idx) => {
                    const stripe = idx % 2 === 0 ? "bg-slate-950/40" : "bg-slate-950/10";
                    const resp = responseByInvitationId.get((row.invitationId || "").trim());
                    const score = resp?.score != null ? Number(resp.score) : null;

                    return (
                      <tr key={row.invitationId} className={stripe}>
                        <td className="px-3 py-2 font-mono text-[11px] text-slate-300">{row.invitationId}</td>
                        <td className="px-3 py-2">{row.customerName}</td>
                        <td className="px-3 py-2 text-slate-300">{row.email}</td>
                        <td className="px-3 py-2">
                          {Number.isFinite(score) ? (
                            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] border border-emerald-400/40 text-emerald-200">
                              {score}/10
                            </span>
                          ) : (
                            <span className="text-slate-500">-</span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-slate-300">
                          {resp?.comment ? String(resp.comment).slice(0, 140) : <span className="text-slate-500">-</span>}
                        </td>
                        <td className="px-3 py-2 text-slate-300">
                          {resp?.createdAt ? resp.createdAt : <span className="text-slate-500">-</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
        {/* Insights (AI) */}
        <section className="rounded-3xl border border-slate-800 bg-slate-950/60 p-5 sm:p-6 shadow-xl shadow-black/40">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-50">
                {tr("liveAdmin.sections.insights", "Insights (CX Intelligence Layer)")}
              </h2>
              <p className="text-xs text-slate-400">
                {tr(
                  "liveAdmin.sections.insightsHelp",
                  "AI summary of completed responses. Filterable by stage or device."
                )}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => loadInsights({ limit: 200 })}
                disabled={insightsLoading}
                className="text-xs rounded-full px-4 py-1.5 font-semibold bg-indigo-400 text-slate-950 hover:bg-indigo-300 disabled:opacity-50"
              >
                {insightsLoading ? tr("liveAdmin.actions.loading", "Loading…") : tr("liveAdmin.actions.refreshInsights", "Refresh insights")}
              </button>

              <button
                type="button"
                onClick={() => loadInsights({ stage: "Overall", limit: 200 })}
                disabled={insightsLoading}
                className="text-xs rounded-full border border-slate-700 px-3 py-1 hover:bg-slate-800 disabled:opacity-50"
              >
                {tr("liveAdmin.actions.filterOverall", "Overall")}
              </button>

              <button
                type="button"
                onClick={() => loadInsights({ device: "Piou Piou v1", limit: 200 })}
                disabled={insightsLoading}
                className="text-xs rounded-full border border-slate-700 px-3 py-1 hover:bg-slate-800 disabled:opacity-50"
              >
                {tr("liveAdmin.actions.filterDeviceV1", "Piou Piou v1")}
              </button>
            </div>
          </div>

          {insightsError ? (
            <div className="rounded-2xl border border-rose-500/70 bg-rose-950/50 px-3 py-2 text-xs text-rose-100">
              {insightsError}
            </div>
          ) : null}

          {!insights ? (
            <div className="text-sm text-slate-400">
              {tr("liveAdmin.insights.empty", "Click “Refresh insights” to generate an intelligence summary from completed responses.")}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <KpiCard label={tr("liveAdmin.insights.kpi.n", "Responses analysed")} value={insights?.insights?.n ?? 0} />
                <KpiCard label={tr("liveAdmin.insights.kpi.nps", "NPS")} value={insights?.insights?.nps ?? "—"} />
                <KpiCard label={tr("liveAdmin.insights.kpi.stage", "Stage")} value={insights?.stage ?? "All"} />
                <KpiCard label={tr("liveAdmin.insights.kpi.generated", "Generated")} value={insights?.generated_at ? new Date(insights.generated_at).toISOString() : "—"} />
              </div>

              {/* Top actions */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
                <div className="text-xs tracking-widest text-slate-400 uppercase mb-2">
                  {tr("liveAdmin.insights.topActions", "Top actions")}
                </div>

                {(insights?.insights?.top_actions || []).length === 0 ? (
                  <div className="text-sm text-slate-400">—</div>
                ) : (
                  <ul className="space-y-2">
                    {insights.insights.top_actions.map((a, i) => (
                      <li key={i} className="text-sm text-slate-200">
                        <div className="font-semibold text-slate-50">{a.action}</div>
                        <div className="text-xs text-slate-400">{a.why}</div>
                        <div className="mt-1 text-[11px] text-slate-400">
                          Impact: <span className="text-slate-200">{a.impact}</span> · Effort:{" "}
                          <span className="text-slate-200">{a.effort}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Themes */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
                  <div className="text-xs tracking-widest text-slate-400 uppercase mb-2">
                    {tr("liveAdmin.insights.painThemes", "Pain themes")}
                  </div>
                  <ul className="space-y-2">
                    {(insights?.insights?.response_themes || []).map((t, i) => (
                      <li key={i} className="text-sm text-slate-200">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-50">{t.theme}</span>
                          <span className="text-[11px] text-slate-400">{t.evidence_count}</span>
                        </div>
                        {(t.example_quotes || []).slice(0, 2).map((q, j) => (
                          <div key={j} className="text-xs text-slate-400">“{q}”</div>
                        ))}
                      </li>
                    ))}
                    {(insights?.insights?.response_themes || []).length === 0 ? (
                      <li className="text-sm text-slate-400">—</li>
                    ) : null}
                  </ul>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
                  <div className="text-xs tracking-widest text-slate-400 uppercase mb-2">
                    {tr("liveAdmin.insights.delighters", "Delighters")}
                  </div>
                  <ul className="space-y-2">
                    {(insights?.insights?.delighters || []).map((t, i) => (
                      <li key={i} className="text-sm text-slate-200">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-50">{t.theme}</span>
                          <span className="text-[11px] text-slate-400">{t.evidence_count}</span>
                        </div>
                        {(t.example_quotes || []).slice(0, 2).map((q, j) => (
                          <div key={j} className="text-xs text-slate-400">“{q}”</div>
                        ))}
                      </li>
                    ))}
                    {(insights?.insights?.delighters || []).length === 0 ? (
                      <li className="text-sm text-slate-400">—</li>
                    ) : null}
                  </ul>
                </div>
              </div>

              {/* Close the loop templates */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
                <div className="text-xs tracking-widest text-slate-400 uppercase mb-2">
                  {tr("liveAdmin.insights.closeLoop", "Close the loop templates")}
                </div>

                <div className="space-y-3">
                  {(insights?.insights?.close_the_loop_templates || []).map((tpl, i) => (
                    <div key={i} className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
                      <div className="text-xs text-slate-400">{tpl.segment}</div>
                      <div className="text-sm font-semibold text-slate-50">{tpl.subject}</div>
                      <div className="mt-1 text-xs text-slate-300 whitespace-pre-wrap">
                        {tpl.body}
                      </div>
                    </div>
                  ))}

                  {(insights?.insights?.close_the_loop_templates || []).length === 0 ? (
                    <div className="text-sm text-slate-400">—</div>
                  ) : null}
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
