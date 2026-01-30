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

function scoreToSegment(score) {
  if (!Number.isFinite(score)) return null;
  if (score <= 6) return "detractor";
  if (score <= 8) return "passive";
  return "promoter";
}

function MultiSelect({ label, options, values, onChange, disabled }) {
  return (
    <label className="text-xs text-slate-300 flex flex-col gap-1">
      <span className="text-[11px] text-slate-400">{label}</span>
      <select
        multiple
        value={values}
        disabled={disabled}
        onChange={(e) => {
          const next = Array.from(e.target.selectedOptions).map(o => o.value);
          onChange(next);
        }}
        className="min-w-[170px] rounded-xl border border-slate-700 bg-slate-950/40 px-3 py-2 text-slate-200"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </label>
  );
}

function matchesMulti(value, selected) {
  // selected = [] => no filter
  if (!selected || selected.length === 0) return true;

  const v = String(value ?? "").trim();
  if (!v) return false;

  return selected.includes(v);
}

function matchesScore(scoreRaw, selectedScores) {
  if (!selectedScores || selectedScores.length === 0) return true;

  const n = Number(scoreRaw);
  if (!Number.isFinite(n)) return false;

  return selectedScores.includes(String(n)); // we’ll store scores as strings "0".."10"
}

function matchesSegment(scoreRaw, selectedSegs) {
  if (!selectedSegs || selectedSegs.length === 0) return true;

  const n = Number(scoreRaw);
  if (!Number.isFinite(n)) return false;

  const seg = scoreToSegment(n);
  return seg ? selectedSegs.includes(seg) : false;
}

function toInt(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
}

function computeResendsFromRow(row) {
  // LIVE: server uses "resentCount" = number of resends
  const raw = row?.resentCount ?? row?.resendCount ?? row?.resends;

  const n = Number(raw);
  if (Number.isFinite(n)) return Math.max(0, Math.trunc(n));
  return 0;
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
    cancelled: "border-rose-400/40 text-rose-200",
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
  const [filters, setFilters] = React.useState({
    stage: [],               // multi
    device: [],              // multi
    am: [],                  // multi
    status: [],              // multi
    businessName: [],        // multi (optional)
    customerName: [],        // multi (optional)
    score: [],               // multi (0..10)
    segment: [],             // multi ("detractor"|"passive"|"promoter")
    q: "",                   // text search
  });
  const [openSections, setOpenSections] = React.useState({
  pending: true,
  sent: true,
  started: true,
  completed: true,
  cancelled: true,
  insights: true,
});

  const toggleSection = (key) =>
    setOpenSections((p) => ({ ...p, [key]: !p[key] }));

  function uniqSorted(values) {
    return Array.from(
      new Set(values.map(v => String(v ?? "").trim()).filter(Boolean))
    ).sort((a, b) => a.localeCompare(b));
  }

  const stageOptions = React.useMemo(() => uniqSorted(invites.map(r => r.stage)), [invites]);
  const deviceOptions = React.useMemo(() => uniqSorted(invites.map(r => r.typeOfDevice)), [invites]);
  const amOptions = React.useMemo(() => uniqSorted(invites.map(r => r.assistanteMaternelle)), [invites]);
  const statusOptions = React.useMemo(() => uniqSorted(invites.map(r => normaliseStatus(r.status))), [invites]);

  // Optional (these are powerful)
  const businessOptions = React.useMemo(() => uniqSorted(invites.map(r => r.businessName)), [invites]);
  const customerOptions = React.useMemo(() => uniqSorted(invites.map(r => r.customerName)), [invites]);

  // Score options (fixed list is safest)
  const scoreOptions = React.useMemo(() => Array.from({ length: 11 }, (_, i) => String(i)), []);
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
    if (!mergedRes.ok || !mergedData.ok) {
      throw new Error(mergedData.error || "Failed to load merged data");
    }

    setInvites(mergedData.rows || []);
    setResponses((mergedData.rows || []).filter((r) => r.response).map((r) => r.response));
    setSelectedIds(new Set());
  } catch (e) {
    console.error("loadAll error", e);
    setError(e?.message || tr("liveAdmin.errors.loadUnable", "Unable to load data."));
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
  const filteredRows = React.useMemo(() => {
  const q = (filters.q || "").trim().toLowerCase();

  return (invites || []).filter((r) => {
    // invitations fields
    if (!matchesMulti(String(r.stage ?? "").trim(), filters.stage)) return false;
    if (!matchesMulti(String(r.typeOfDevice ?? "").trim(), filters.device)) return false;
    if (!matchesMulti(String(r.assistanteMaternelle ?? "").trim(), filters.am)) return false;
    if (!matchesMulti(normaliseStatus(r.status), filters.status)) return false;

    // optional
    if (!matchesMulti(String(r.businessName ?? "").trim(), filters.businessName)) return false;
    if (!matchesMulti(String(r.customerName ?? "").trim(), filters.customerName)) return false;

    // response fields (merged)
    if (!matchesScore(r.score, filters.score)) return false;
    if (!matchesSegment(r.score, filters.segment)) return false;

    // free text search across invitation + response columns
    if (q) {
      const hay = [
        r.invitationId,
        r.customerId,
        r.customerName,
        r.businessName,
        r.email,
        r.stage,
        r.typeOfDevice,
        r.assistanteMaternelle,
        r.status,
        r.score,
        r.comment,
      ]
        .map(x => String(x ?? "").toLowerCase())
        .join(" | ");

      if (!hay.includes(q)) return false;
    }

    return true;
  });
}, [invites, filters]);
  const pending = [];
  const sent = [];
  const started = [];
  const completed = [];
  const cancelled = [];

  for (const inv of filteredRows) {
    const s = normaliseStatus(inv.status);
    if (s === "responded") completed.push(inv);
    else if (s === "started") started.push(inv);
    else if (s === "sent") sent.push(inv);
    else if (s === "cancelled") cancelled.push(inv);
    else pending.push(inv);
  }
  const cancelledCount = cancelled.length;
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

  async function handleCancel(invitationId) {
    setError("");
    setStatusMsg("");

    try {
      const res = await fetch("/api/live-invitations/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invitationId }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Cancel failed");

      setStatusMsg(`Cancelled invitation ${invitationId}.`);
      await loadAll();
    } catch (e) {
      console.error("cancel error", e);
      setError(e.message || "We couldn’t cancel that invitation.");
    }
  }

  async function loadInsights(params = {}) {
  setInsightsLoading(true);
  setInsightsError("");

  try {
    const limit = params.limit ?? 200;

    // Only include rows that actually have a response score
    // Use merged flattened score first (server normalised), fallback to response map
    const ids = completed
      .map((row) => {
        const resp = responseByInvitationId.get(String(row.invitationId || "").trim());
        const scoreRaw = row?.score ?? resp?.score;
        const score = Number.isFinite(Number(scoreRaw)) ? Number(scoreRaw) : null;
        return score == null ? null : String(row.invitationId || "").trim();
      })
      .filter(Boolean)
      .slice(0, 500);

    const res = await fetch("/api/live-insights", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ invitationIds: ids, limit }),
    });

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
  const canRunInsights = completed.length > 0;
  const disabledReason = !canRunInsights ? "No completed responses yet" : undefined;

const sectionLabel = (key, fallback) => tr(`liveAdmin.sections.${key}`, fallback);
const withCount = (label, n) => `${label} (${n})`;

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

        <section className="grid grid-cols-2 lg:grid-cols-6 gap-3">
          <KpiCard label={tr("liveAdmin.kpi.total", "Total")} value={total} sub={tr("liveAdmin.kpi.totalSub", "All invitations in file")} />
          <KpiCard label={tr("liveAdmin.kpi.pending", "Pending")} value={pending.length} sub={tr("liveAdmin.kpi.pendingSub", "Not yet sent")} />
          <KpiCard label={tr("liveAdmin.kpi.sent", "Sent")} value={sent.length} sub={tr("liveAdmin.kpi.sentSub", "Delivered or queued")} />
          <KpiCard label={tr("liveAdmin.kpi.started", "Started")} value={started.length} sub={tr("liveAdmin.kpi.startedSub", "Opened survey link")} />
          <KpiCard label={tr("liveAdmin.kpi.completed", "Completed")} value={completed.length} sub={nps === null ? tr("liveAdmin.kpi.npsNA", "NPS: n/a") : `${tr("liveAdmin.nps", "NPS")}: ${nps}`}/>
          <KpiCard label={tr("liveAdmin.kpi.cancelled", "Cancelled")} value={cancelledCount} sub={tr("liveAdmin.kpi.cancelledSub", "Will not be sent")} />
        </section>
        {/* Pending */}
        <section className="rounded-3xl border border-slate-800 bg-slate-950/60 p-5 sm:p-6 shadow-xl shadow-black/40">
          <div className="mb-4 flex items-start justify-between gap-3">
            <button
              type="button"
              onClick={() => toggleSection("pending")}
              className="text-left"
            >
              <h2 className="text-lg font-semibold text-slate-50">
                {withCount(sectionLabel("pending", "Pending"), pending.length)}
                <span className="ml-2 text-xs text-slate-400">{openSections.pending ? "▲" : "▼"}</span>
              </h2>
              <p className="text-xs text-slate-400">
                {tr("liveAdmin.sections.pendingHelp", "Select and send invitations.")}
              </p>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleAllPending}
                disabled={loading || pending.length === 0}
                className="text-xs rounded-full border border-slate-700 px-3 py-1 hover:bg-slate-800 disabled:opacity-50"
              >
                {allSelected
                  ? tr("liveAdmin.actions.deselectAll", "Deselect all")
                  : tr("liveAdmin.actions.selectAll", "Select all")}
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
                {sending
                  ? tr("liveAdmin.actions.sending", "Sending…")
                  : tr("liveAdmin.actions.sendSelected", "Send selected")}
              </button>
            </div>
          </div>

          {openSections.pending ? (
            loading ? (
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
                      <th className="px-3 py-2 text-left text-slate-300">
                        {tr("liveAdmin.table.invitationId", "Invitation ID")}
                      </th>
                      <th className="px-3 py-2 text-left text-slate-300">
                        {tr("liveAdmin.table.name", "Name")}
                      </th>
                      <th className="px-3 py-2 text-left text-slate-300">
                        {tr("liveAdmin.table.email", "Email")}
                      </th>
                      <th className="px-3 py-2 text-left text-slate-300">
                        {tr("liveAdmin.table.device", "Device")}
                      </th>
                      <th className="px-3 py-2 text-left text-slate-300">
                        {tr("liveAdmin.table.am", "AM")}
                      </th>
                      <th className="px-3 py-2 text-left text-slate-300">
                        {tr("liveAdmin.table.status", "Status")}
                      </th>
                      <th className="px-3 py-2 text-left text-slate-300">
                        {tr("liveAdmin.table.action", "Action")}
                      </th>
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
                          <td className="px-3 py-2 font-mono text-[11px] text-slate-300">
                            {row.invitationId}
                          </td>
                          <td className="px-3 py-2">{row.customerName}</td>
                          <td className="px-3 py-2 text-slate-300">{row.email}</td>
                          <td className="px-3 py-2">
                            {row.typeOfDevice || <span className="text-slate-500">-</span>}
                          </td>
                          <td className="px-3 py-2">
                            {row.assistanteMaternelle || <span className="text-slate-500">-</span>}
                          </td>
                          <td className="px-3 py-2">
                            <StatusPill status={row.status} label={statusLabel(row.status)} />
                          </td>
                          <td className="px-3 py-2">
                            <button
                              type="button"
                              onClick={() => handleCancel(row.invitationId)}
                              className="text-xs rounded-full px-3 py-1 border border-rose-400/40 text-rose-200 hover:bg-rose-950/40"
                            >
                              {tr("liveAdmin.actions.cancel", "Cancel")}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )
          ) : null}
        </section>
        {/* Sent */}
        <section className="rounded-3xl border border-slate-800 bg-slate-950/60 p-5 sm:p-6 shadow-xl shadow-black/40">
          <div className="mb-4 flex items-start justify-between gap-3">
            <button
              type="button"
              onClick={() => toggleSection("sent")}
              className="text-left"
            >
              <h2 className="text-lg font-semibold text-slate-50">
                {withCount(sectionLabel("sent", "Sent"), sent.length)}
                <span className="ml-2 text-xs text-slate-400">{openSections.sent ? "▲" : "▼"}</span>
              </h2>
              <p className="text-xs text-slate-400">
                {tr("liveAdmin.sections.sentHelp", "Resend if someone cannot find the email.")}
              </p>
            </button>
          </div>

          {openSections.sent ? (
            sent.length === 0 ? (
              <p className="text-sm text-slate-400">
                {tr("liveAdmin.empty.noSent", "No sent invitations.")}
              </p>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/60">
                <table className="min-w-full text-xs">
                  <thead className="bg-slate-900/70">
                    <tr>
                      <th className="px-3 py-2 text-left text-slate-300">
                        {tr("liveAdmin.table.invitationId", "Invitation ID")}
                      </th>
                      <th className="px-3 py-2 text-left text-slate-300">
                        {tr("liveAdmin.table.name", "Name")}
                      </th>
                      <th className="px-3 py-2 text-left text-slate-300">
                        {tr("liveAdmin.table.email", "Email")}
                      </th>
                      <th className="px-3 py-2 text-left text-slate-300">
                        {tr("liveAdmin.table.lastSent", "Last sent")}
                      </th>
                      <th className="px-3 py-2 text-left text-slate-300">
                        {tr("liveAdmin.table.resends", "Resends")}
                      </th>
                      <th className="px-3 py-2 text-left text-slate-300">
                        {tr("liveAdmin.table.action", "Action")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sent.map((row, idx) => {
                      const stripe = idx % 2 === 0 ? "bg-slate-950/40" : "bg-slate-950/10";
                      const lastSent = row.lastSentAt || row.sentAt || row.lastSent || row.last_sent_at;
                      const resends = computeResendsFromRow(row);

                      return (
                        <tr key={row.invitationId} className={stripe}>
                          <td className="px-3 py-2 font-mono text-[11px] text-slate-300">
                            {row.invitationId}
                          </td>
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
            )
          ) : null}
        </section>
        {/* Started */}
        <section className="rounded-3xl border border-slate-800 bg-slate-950/60 p-5 sm:p-6 shadow-xl shadow-black/40">
          <div className="mb-4 flex items-start justify-between gap-3">
            <button
              type="button"
              onClick={() => toggleSection("started")}
              className="text-left"
            >
              <h2 className="text-lg font-semibold text-slate-50">
                {withCount(sectionLabel("started", "Started"), started.length)}
                <span className="ml-2 text-xs text-slate-400">{openSections.started ? "▲" : "▼"}</span>
              </h2>
              <p className="text-xs text-slate-400">
                {tr("liveAdmin.sections.startedHelp", "These recipients opened the survey link.")}
              </p>
            </button>
          </div>

          {openSections.started ? (
            started.length === 0 ? (
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
            )
          ) : null}
        </section>
        {/* Completed */}
        <section className="rounded-3xl border border-slate-800 bg-slate-950/60 p-5 sm:p-6 shadow-xl shadow-black/40">
          <div className="mb-4 flex items-start justify-between gap-3">
            <button
              type="button"
              onClick={() => toggleSection("completed")}
              className="text-left"
            >
              <h2 className="text-lg font-semibold text-slate-50">
                {withCount(sectionLabel("completed", "Completed"), completed.length)}
                <span className="ml-2 text-xs text-slate-400">{openSections.completed ? "▲" : "▼"}</span>
              </h2>
              <p className="text-xs text-slate-400">
                {tr("liveAdmin.sections.completedHelp", "Scores are shown when a response exists in /npsme/live/responses.csv.")}
              </p>
            </button>
          </div>

          {openSections.completed ? (
            completed.length === 0 ? (
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

                      const scoreRaw = row?.score ?? resp?.score;
                      const score = Number.isFinite(Number(scoreRaw)) ? Number(scoreRaw) : null;

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
            )
          ) : null}
        </section>
        {/* Cancelled */}
        <section className="rounded-3xl border border-slate-800 bg-slate-950/60 p-5 sm:p-6 shadow-xl shadow-black/40">
          <div className="mb-4 flex items-start justify-between gap-3">
            <button
              type="button"
              onClick={() => toggleSection("cancelled")}
              className="text-left"
            >
              <h2 className="text-lg font-semibold text-slate-50">
                {withCount(sectionLabel("cancelled", "Cancelled"), cancelled.length)}
                <span className="ml-2 text-xs text-slate-400">{openSections.cancelled ? "▲" : "▼"}</span>
              </h2>
              <p className="text-xs text-slate-400">
                {tr("liveAdmin.sections.cancelledHelp", "These invitations will not be sent.")}
              </p>
            </button>
          </div>

          {openSections.cancelled ? (
            cancelled.length === 0 ? (
              <p className="text-sm text-slate-400">
                {tr("liveAdmin.empty.noCancelled", "No cancelled invitations.")}
              </p>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/60">
                <table className="min-w-full text-xs">
                  <thead className="bg-slate-900/70">
                    <tr>
                      <th className="px-3 py-2 text-left text-slate-300">
                        {tr("liveAdmin.table.invitationId", "Invitation ID")}
                      </th>
                      <th className="px-3 py-2 text-left text-slate-300">
                        {tr("liveAdmin.table.name", "Name")}
                      </th>
                      <th className="px-3 py-2 text-left text-slate-300">
                        {tr("liveAdmin.table.email", "Email")}
                      </th>
                      <th className="px-3 py-2 text-left text-slate-300">
                        {tr("liveAdmin.table.status", "Status")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {cancelled.map((row, idx) => {
                      const stripe = idx % 2 === 0 ? "bg-slate-950/40" : "bg-slate-950/10";
                      return (
                        <tr key={row.invitationId} className={stripe}>
                          <td className="px-3 py-2 font-mono text-[11px] text-slate-300">
                            {row.invitationId}
                          </td>
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
            )
          ) : null}
        </section>
        {/* Insights (AI) */}
        <section className="rounded-3xl border border-slate-800 bg-slate-950/60 p-5 sm:p-6 shadow-xl shadow-black/40">
          <div className="mb-4 flex items-start justify-between gap-3">
            <button
              type="button"
              onClick={() => toggleSection("insights")}
              className="text-left"
            >
              <h2 className="text-lg font-semibold text-slate-50">
                {withCount(
                  sectionLabel("insights", "Insights (CX Intelligence Layer)"),
                  insights?.insights?.n ?? 0
                )}
                <span className="ml-2 text-xs text-slate-400">{openSections.insights ? "▲" : "▼"}</span>
              </h2>
              <p className="text-xs text-slate-400">
                {tr("liveAdmin.sections.insightsHelp", "AI summary of completed responses. Filterable by stage or device.")}
              </p>
            </button>

            <button
              title={disabledReason}
              type="button"
              onClick={() => loadInsights({ limit: 200 })}
              disabled={insightsLoading || !canRunInsights}
              className="text-xs rounded-full px-4 py-1.5 font-semibold bg-indigo-400 text-slate-950 hover:bg-indigo-300 disabled:opacity-50"
            >
              {insightsLoading
                ? tr("liveAdmin.actions.loading", "Loading…")
                : tr("liveAdmin.actions.refreshInsights", "Refresh insights")}
            </button>
          </div>

          {openSections.insights ? (
            <>
              {/* Filters row */}
              <div className="flex flex-wrap items-end gap-3 mb-4">
                <MultiSelect
                  label={tr("liveAdmin.filters.stage", "Stage")}
                  options={stageOptions}
                  values={filters.stage}
                  disabled={loading}
                  onChange={(next) => setFilters((p) => ({ ...p, stage: next }))}
                />

                <MultiSelect
                  label={tr("liveAdmin.filters.device", "Device")}
                  options={deviceOptions}
                  values={filters.device}
                  disabled={loading}
                  onChange={(next) => setFilters((p) => ({ ...p, device: next }))}
                />

                <MultiSelect
                  label={tr("liveAdmin.filters.am", "AM")}
                  options={amOptions}
                  values={filters.am}
                  disabled={loading}
                  onChange={(next) => setFilters((p) => ({ ...p, am: next }))}
                />

                <MultiSelect
                  label={tr("liveAdmin.filters.score", "Score")}
                  options={scoreOptions}
                  values={filters.score}
                  disabled={loading}
                  onChange={(next) => setFilters((p) => ({ ...p, score: next }))}
                />

                <MultiSelect
                  label={tr("liveAdmin.filters.segment", "Segment")}
                  options={["detractor", "passive", "promoter"]}
                  values={filters.segment}
                  disabled={loading}
                  onChange={(next) => setFilters((p) => ({ ...p, segment: next }))}
                />

                <label className="text-xs text-slate-300 flex flex-col gap-1">
                  <span className="text-[11px] text-slate-400">{tr("liveAdmin.filters.search", "Search")}</span>
                  <input
                    value={filters.q}
                    onChange={(e) => setFilters((p) => ({ ...p, q: e.target.value }))}
                    placeholder={tr("liveAdmin.filters.searchPlaceholder", "Search…")}
                    className="min-w-[170px] rounded-xl border border-slate-700 bg-slate-950/40 px-3 py-2 text-slate-200 placeholder:text-slate-500"
                  />
                </label>

                <button
                  type="button"
                  onClick={() =>
                    setFilters({
                      stage: [],
                      device: [],
                      am: [],
                      status: [],
                      businessName: [],
                      customerName: [],
                      score: [],
                      segment: [],
                      q: "",
                    })
                  }
                  className="text-xs rounded-full border border-slate-700 px-4 py-2 hover:bg-slate-800"
                >
                  {tr("liveAdmin.actions.clearFilters", "Clear filters")}
                </button>
              </div>

              {insightsError ? (
                <div className="rounded-2xl border border-rose-500/70 bg-rose-950/50 px-3 py-2 text-xs text-rose-100 mb-3">
                  {insightsError}
                </div>
              ) : null}

              {!insights ? (
                <div className="text-sm text-slate-400">
                  {tr("liveAdmin.insights.empty", 'Click “Refresh insights” to generate an intelligence summary from completed responses.')}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <KpiCard label={tr("liveAdmin.insights.kpi.n", "Responses analysed")} value={insights?.insights?.n ?? 0} />
                    <KpiCard label={tr("liveAdmin.insights.kpi.nps", "NPS")} value={insights?.insights?.nps ?? "—"} />
                    <KpiCard label={tr("liveAdmin.insights.kpi.stage", "Stage")} value={insights?.stage ?? "All"} />
                    <KpiCard
                      label={tr("liveAdmin.insights.kpi.generated", "Generated")}
                      value={insights?.generated_at ? new Date(insights.generated_at).toISOString() : "—"}
                    />
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
            </>
          ) : null}
        </section>
      </main>
    </div>
  );
}
