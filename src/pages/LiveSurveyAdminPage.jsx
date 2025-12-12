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

// ✅ Keep ONE computeNps
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

// ✅ Fix “Resends”: treat your stored count as “number of sends” (initial send counts as 1)
function computeResendsFromRow(row) {
  // If you later add a true "resends" field, we’ll honour it first:
  const explicitResends = row?.resends ?? row?.resendCount;
  if (Number.isFinite(Number(explicitResends))) return Math.max(0, toInt(explicitResends));

  // Otherwise (current behaviour you described): "resentCount" is actually "sendCount"
  const sends = toInt(row?.sendCount ?? row?.sentCount ?? row?.resentCount ?? row?.sendsCount, 0);
  return Math.max(0, sends - 1);
}

function formatMaybeIso(s) {
  if (!s) return "-";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return String(s);
  return d.toISOString();
}

function ResponseDial({ value, label, valueLabel }) {
  const pct = Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0));
  const style = {
    background: `conic-gradient(#34d399 ${pct}%, rgba(148,163,184,0.15) 0)`,
  };
  return (
    <div className="flex items-center gap-3">
      <div
        className="h-12 w-12 rounded-full p-[3px]"
        style={style}
        aria-label={`${label} ${pct}%`}
      >
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

// ✅ Little NPS dial (-100..+100)
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
  const tr = (key, fallback) => t(lang, key, fallback);

  const [invites, setInvites] = React.useState([]);
  const [responses, setResponses] = React.useState([]);
  const [selectedIds, setSelectedIds] = React.useState(new Set());
  const [loading, setLoading] = React.useState(false);
  const [sending, setSending] = React.useState(false);
  const [error, setError] = React.useState("");
  const [statusMsg, setStatusMsg] = React.useState("");
  const [resendingId, setResendingId] = React.useState("");

  const title = tr("liveAdmin.seoTitle", "Live Survey Admin | NPS Me");
  const description = tr(
    "liveAdmin.seoDescription",
    "Review and send live NPS invitations from your Envola customer list."
  );

  async function loadAll() {
    setLoading(true);
    setError("");
    try {
      const [invRes, respRes] = await Promise.all([
        fetch("/api/live-invitations?all=1"),
        fetch("/api/live-responses"),
      ]);

      const invData = await invRes.json();
      const respData = await respRes.json();

      if (!invRes.ok) throw new Error(invData.error || tr("liveAdmin.errors.loadInvites", "Failed to load invitations"));
      if (!respRes.ok) throw new Error(respData.error || tr("liveAdmin.errors.loadResponses", "Failed to load responses"));

      setInvites(invData.rows || []);
      setResponses(respData.rows || []);
      setSelectedIds(new Set());
    } catch (e) {
      console.error("loadAll error", e);
      setError(e.message || tr("liveAdmin.errors.unableLoad", "Unable to load data."));
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

  // Map latest response by invitationId (if duplicates exist, keep last by createdAt)
  const responseByInvitationId = React.useMemo(() => {
    const map = new Map();
    for (const r of responses || []) {
      const id = (r.invitationId || "").trim();
      if (!id) continue;

      const createdAt = r.createdAt ? new Date(r.createdAt).getTime() : 0;
      const prev = map.get(id);
      const prevTime = prev?.createdAt ? new Date(prev.createdAt).getTime() : 0;

      if (!prev || createdAt >= prevTime) {
        map.set(id, r);
      }
    }
    return map;
  }, [responses]);

  // Buckets
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
      if (!res.ok || !data.ok) throw new Error(data.error || tr("liveAdmin.errors.batchSendFailed", "Batch send failed"));

      const successes = (data.results || []).filter((r) => r.ok).length;
      const failures = (data.results || []).filter((r) => !r.ok).length;

      setStatusMsg(
        tr("liveAdmin.messages.sentPrefix", "Sent") +
          ` ${successes} ` +
          tr("liveAdmin.messages.invitationWord", successes === 1 ? "invitation" : "invitations") +
          (failures ? `, ${failures} ${tr("liveAdmin.messages.failed", "failed")}.` : ".")
      );

      await loadAll();
    } catch (e) {
      console.error("send batch error", e);
      setError(e.message || tr("liveAdmin.errors.couldNotSend", "We couldn’t send those invitations."));
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
      if (!res.ok || !data.ok) throw new Error(data.error || tr("liveAdmin.errors.resendFailed", "Resend failed"));

      setStatusMsg(tr("liveAdmin.messages.resent", "Resent invitation") + ` ${invitationId}.`);
      await loadAll();
    } catch (e) {
      console.error("resend error", e);
      setError(e.message || tr("liveAdmin.errors.couldNotResend", "We couldn’t resend that invitation."));
    } finally {
      setResendingId("");
    }
  }

  // KPIs
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
    return tr(`liveAdmin.status.${s}`, s);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100">
      {/* Use the actual current pathname so EN/FR get correct canonical */}
      <Seo path={location.pathname} title={title} description={description} />

      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-12 space-y-6">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs tracking-widest text-slate-400 uppercase">
              {tr("liveAdmin.kicker", "Live programme · Envola")}
            </p>
            <h1 className="text-2xl sm:text-3xl font-semibold text-slate-50">
              {tr("liveAdmin.pageTitle", "Live survey admin")}
            </h1>
            <p className="mt-1 text-sm text-slate-400 max-w-2xl">
              {tr(
                "liveAdmin.pageSubtitle",
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

        {/* KPIs */}
        <section className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <KpiCard label={tr("liveAdmin.kpis.total", "Total")} value={total} sub={tr("liveAdmin.kpis.totalSub", "All invitations in file")} />
          <KpiCard label={tr("liveAdmin.kpis.pending", "Pending")} value={pending.length} sub={tr("liveAdmin.kpis.pendingSub", "Not yet sent")} />
          <KpiCard label={tr("liveAdmin.kpis.sent", "Sent")} value={sent.length} sub={tr("liveAdmin.kpis.sentSub", "Delivered or queued")} />
          <KpiCard label={tr("liveAdmin.kpis.started", "Started")} value={started.length} sub={tr("liveAdmin.kpis.startedSub", "Opened survey link")} />
          <KpiCard
            label={tr("liveAdmin.kpis.completed", "Completed")}
            value={completed.length}
            sub={nps === null ? tr("liveAdmin.kpis.npsNa", "NPS: n/a") : `${tr("liveAdmin.kpis.nps", "NPS")}: ${nps}`}
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
                {allSelected ? tr("liveAdmin.deselectAll", "Deselect all") : tr("liveAdmin.selectAll", "Select all")}
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
                {sending ? tr("liveAdmin.sending", "Sending…") : tr("liveAdmin.sendSelected", "Send selected")}
              </button>
            </div>
          </div>

          {loading ? (
            <p className="text-sm text-slate-400">{tr("liveAdmin.loading", "Loading…")}</p>
          ) : pending.length === 0 ? (
            <p className="text-sm text-slate-400">{tr("liveAdmin.empty.pending", "No pending invitations.")}</p>
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
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => toggleOne(row.invitationId)}
                          />
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
            <p className="text-sm text-slate-400">{tr("liveAdmin.empty.sent", "No sent invitations.")}</p>
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
                              ? tr("liveAdmin.resending", "Resending…")
                              : tr("liveAdmin.resend", "Resend")}
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
            <p className="text-sm text-slate-400">{tr("liveAdmin.empty.started", "No started invitations.")}</p>
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
            <p className="text-xs text-slate-400">
              {tr("liveAdmin.sections.completedHelp", "Scores are shown when a response exists in /npsme/live/responses.csv.")}
            </p>
          </div>

          {completed.length === 0 ? (
            <p className="text-sm text-slate-400">{tr("liveAdmin.empty.completed", "No completed invitations.")}</p>
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
      </main>
    </div>
  );
}
