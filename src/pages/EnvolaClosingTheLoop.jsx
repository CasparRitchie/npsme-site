// src/pages/EnvolaClosingTheLoop.jsx
import React from "react";
import { useLanguage } from "../i18n/LanguageContext";
import { translations } from "../i18n/translations";

const DEFAULT_CONTENT_ID = "189616";

const SURVEY_ORDER_BY_CONTENT_ID = {
  "189616": [
    "612560",
    "612565",
    "612566",
    "612567",
    "612568",
    "612570",
    "612600",
    "612571",
    "612601",
    "612602",
    "612603",
  ],
};

function sortAnswersForSurvey({ contentId, answers }) {
  const order = SURVEY_ORDER_BY_CONTENT_ID[String(contentId)] || [];
  const idx = new Map(order.map((qid, i) => [String(qid), i]));

  return (Array.isArray(answers) ? answers : [])
    .map((a, originalIndex) => ({ a, originalIndex }))
    .sort((x, y) => {
      const ax = String(x.a?.question_id ?? "");
      const ay = String(y.a?.question_id ?? "");

      const ix = idx.has(ax) ? idx.get(ax) : 9999;
      const iy = idx.has(ay) ? idx.get(ay) : 9999;

      if (ix !== iy) return ix - iy;
      return x.originalIndex - y.originalIndex;
    })
    .map((x) => x.a);
}

function formatDate(iso) {
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

function bucketPill(bucket) {
  const base =
    "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border";
  if (bucket === "detractor")
    return `${base} border-rose-400/30 bg-rose-500/10 text-rose-200`;
  if (bucket === "passive")
    return `${base} border-amber-400/30 bg-amber-500/10 text-amber-200`;
  if (bucket === "promoter")
    return `${base} border-emerald-400/30 bg-emerald-500/10 text-emerald-200`;
  return `${base} border-white/10 bg-white/5 text-slate-200`;
}

function scoreBucket(score) {
  if (typeof score !== "number") return "unknown";
  if (score >= 9) return "promoter";
  if (score >= 7) return "passive";
  return "detractor";
}

function chipClass() {
  return "inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-200";
}

function Chip({ children, tone = "neutral", title }) {
  const tones = {
    neutral: "bg-white/10 text-slate-200 border-white/10",
    indigo: "bg-indigo-500/15 text-indigo-100 border-indigo-500/25",
    green: "bg-emerald-500/15 text-emerald-100 border-emerald-500/25",
    amber: "bg-amber-500/15 text-amber-100 border-amber-500/25",
    red: "bg-rose-500/15 text-rose-100 border-rose-500/25",
  };

  return (
    <span
      title={title}
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs ${
        tones[tone] || tones.neutral
      }`}
    >
      {children}
    </span>
  );
}

function Disclosure({ title, right, children, defaultOpen = false }) {
  return (
    <details
      className="group rounded-3xl border border-white/10 bg-white/5 p-5"
      defaultOpen={defaultOpen}
    >
      <summary className="cursor-pointer list-none select-none flex items-center justify-between gap-3">
        <div className="text-white font-semibold">{title}</div>
        {right ? <div className="text-xs text-slate-400">{right}</div> : null}
        <span className="ml-2 text-slate-400 group-open:rotate-180 transition">
          ▾
        </span>
      </summary>
      <div className="mt-4">{children}</div>
    </details>
  );
}

function AnswerTable({ rows, compact = false }) {
  const grouped = React.useMemo(() => {
    const by = new Map();

    for (const a of rows || []) {
      const qid = a?.question_id != null ? String(a.question_id) : "";
      const key = `${qid}::${a?.question_text || ""}`;

      const item = by.get(key) || {
        question_id: qid,
        question_text: a?.question_text || "—",
        answered_at: a?.answered_at || null,
        values: [],
      };

      const raw = a?.response;
      if (raw == null) continue;

      const txt = typeof raw === "string" ? raw.trim() : String(raw);
      if (!txt) continue;

      item.values.push(txt);
      by.set(key, item);
    }

    return Array.from(by.values())
      .map((g) => ({
        ...g,
        values: Array.from(new Set(g.values)),
        _order: rows.findIndex(
          (r) =>
            String(r?.question_id) === String(g.question_id) &&
            (r?.question_text || "") === (g.question_text || "")
        ),
      }))
      .sort((a, b) => a._order - b._order);
  }, [rows]);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead>
          <tr className="text-xs text-slate-400">
            <th className="py-2 pr-4">Question</th>
            <th className="py-2 pr-4">Answer</th>
            {!compact ? <th className="py-2">Answered</th> : null}
          </tr>
        </thead>

        <tbody className="divide-y divide-white/10">
          {grouped.map((g, idx) => (
            <tr key={`${g.question_id}-${idx}`}>
              <td className="py-3 pr-4 align-top">
                <div className="flex items-start gap-2">
                  {g.question_id ? (
                    <span className="mt-0.5 rounded-lg border border-white/10 bg-black/20 px-2 py-1 text-[11px] text-slate-300">
                      {g.question_id}
                    </span>
                  ) : null}
                  <div className="text-slate-200 leading-snug">{g.question_text}</div>
                </div>
              </td>

              <td className="py-3 pr-4 align-top">
                <div className="flex flex-wrap gap-2">
                  {g.values.map((v) => (
                    <span
                      key={v}
                      className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-slate-200"
                    >
                      {v}
                    </span>
                  ))}
                </div>
              </td>

              {!compact ? (
                <td className="py-3 align-top text-xs text-slate-400 whitespace-nowrap">
                  {formatDate(g.answered_at)}
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function inferRelevantQuestionIds(detail) {
  const answers = Array.isArray(detail?.answers) ? detail.answers : [];
  if (!answers.length) return [];

  const toNum0to10 = (v) => {
    const n = Number(v);
    if (!Number.isFinite(n)) return null;
    if (n < 0 || n > 10) return null;
    return n;
  };
  const isText = (v) => typeof v === "string" && v.trim().length >= 2;

  const firstScoredIdx = answers.findIndex((a) => toNum0to10(a?.response) != null);
  if (firstScoredIdx < 0) return [];

  const scoredQid =
    answers[firstScoredIdx]?.question_id != null
      ? String(answers[firstScoredIdx].question_id)
      : null;

  const followQids = [];
  for (let i = firstScoredIdx + 1; i < answers.length; i++) {
    const raw = answers[i]?.response;
    if (!isText(raw)) continue;
    if (toNum0to10(raw) != null) continue;
    const qid =
      answers[i]?.question_id != null ? String(answers[i].question_id) : null;
    if (qid && !followQids.includes(qid)) followQids.push(qid);
    if (followQids.length >= 2) break;
  }

  return [scoredQid, ...followQids].filter(Boolean);
}

function groupVerbatims(verbatims) {
  const out = new Map();
  for (const v of verbatims || []) {
    const q = (v?.question_text || "").trim() || "—";
    const t = (v?.text || "").trim();
    if (!t) continue;
    const cur = out.get(q) || [];
    cur.push(t);
    out.set(q, cur);
  }
  return Array.from(out.entries());
}

const CASE_STAGES = [
  "new",
  "triaged",
  "customer_followup_planned",
  "customer_followup_completed",
  "owner_assigned",
  "improvement_planned",
  "improvement_scheduled",
  "improvement_in_progress",
  "improvement_completed",
  "customer_informed",
  "impact_check_pending",
  "impact_checked",
  "closed",
];

function nextStatusOptions(currentStatus) {
  switch (currentStatus) {
    case "new":
      return ["triaged"];

    case "triaged":
      return ["customer_followup_planned"];

    case "customer_followup_planned":
      return ["customer_followup_completed"];

    case "customer_followup_completed":
      return ["owner_assigned"];

    case "owner_assigned":
      return ["improvement_planned"];

    case "improvement_planned":
      return ["improvement_scheduled", "improvement_in_progress"];

    case "improvement_scheduled":
      return ["improvement_in_progress"];

    case "improvement_in_progress":
      return ["improvement_completed"];

    case "improvement_completed":
      return ["customer_informed", "impact_check_pending"];

    case "customer_informed":
      return ["impact_check_pending", "impact_checked", "closed"];

    case "impact_check_pending":
      return ["impact_checked", "closed"];

    case "impact_checked":
      return ["closed"];

    default:
      return [];
  }
}

function prettyStatus(status) {
  const labels = {
    new: "New",
    triaged: "Triaged",
    customer_followup_planned: "Follow-up planned",
    customer_followup_completed: "Follow-up completed",
    owner_assigned: "Owner assigned",
    improvement_planned: "Improvement planned",
    improvement_scheduled: "Improvement scheduled",
    improvement_in_progress: "Improvement in progress",
    improvement_completed: "Improvement completed",
    customer_informed: "Customer informed",
    impact_check_pending: "Impact check pending",
    impact_checked: "Impact checked",
    closed: "Closed",
    paused: "Paused",
    cancelled: "Cancelled",
  };

  return labels[status] || String(status || "")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

function formatActionType(action) {
  if (!action) return "Update";

  if (action.event_type === "case_created") return "Case created";
  if (action.event_type === "case_closed") return "Case closed";
  if (action.event_type === "status_changed") {
    return action.to_value ? prettyStatus(action.to_value) : "Status changed";
  }

  return prettyStatus(action.event_type || "update");
}

function getStageState(caseStatus, stage) {
  const currentIndex = CASE_STAGES.indexOf(caseStatus);
  const stageIndex = CASE_STAGES.indexOf(stage);

  if (currentIndex === -1 || stageIndex === -1) return "future";
  if (stageIndex < currentIndex) return "done";
  if (stageIndex === currentIndex) return "current";
  return "future";
}

function stageClassName({ state, clickable }) {
  const base =
    "inline-flex items-center rounded-xl px-3 py-1.5 text-xs font-medium border transition";

  if (clickable) {
    return `${base} border-[#22C55E] bg-[#22C55E]/15 text-[#DCFCE7] hover:bg-[#22C55E] hover:text-[#0B0F19] hover:border-[#4ADE80]`;
  }

  if (state === "current") {
    return `${base} border-slate-400/30 bg-slate-500/15 text-slate-200`;
  }

  if (state === "done") {
    return `${base} border-[#7C3AED] bg-[#7C3AED]/10 text-[#E9D5FF]`;
  }

  return `${base} border-white/10 bg-white/5 text-slate-400`;
}

export default function ClosingTheLoop() {
  const { lang } = useLanguage();
  const tr = (p, f) => translations(lang, p, f);

  const [contentId, setContentId] = React.useState(DEFAULT_CONTENT_ID);
  const [days, setDays] = React.useState(30);
  const [limit, setLimit] = React.useState(50);

  const [bucket, setBucket] = React.useState("all");
  const [sortBy, setSortBy] = React.useState("risk");

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [data, setData] = React.useState(null);

  const [casesLoading, setCasesLoading] = React.useState(false);
  const [casesError, setCasesError] = React.useState("");
  const [casesData, setCasesData] = React.useState([]);
  const [caseComments, setCaseComments] = React.useState({});

  const [caseActionLoadingId, setCaseActionLoadingId] = React.useState(null);
  const [queueActionLoadingId, setQueueActionLoadingId] = React.useState(null);

  const [queueCollapsed, setQueueCollapsed] = React.useState(false);

  const [openId, setOpenId] = React.useState(null);
  const [detailLoading, setDetailLoading] = React.useState(false);
  const [detailError, setDetailError] = React.useState("");
  const [detail, setDetail] = React.useState(null);
  const [rawView, setRawView] = React.useState("all");
  const [rawShowJson, setRawShowJson] = React.useState(false);

  const closeModal = React.useCallback(() => {
    setOpenId(null);
    setDetail(null);
    setDetailError("");
    setDetailLoading(false);
  }, []);

  const fetchQueue = React.useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const qs = new URLSearchParams({
        content_id: String(contentId || "").trim(),
        days: String(days),
        limit: String(limit),
      });

      const url = `/api/intercom/private/closing-the-loop?${qs.toString()}`;
      const r = await fetch(url, { credentials: "include" });
      const contentType = (r.headers.get("content-type") || "").toLowerCase();
      const rawText = await r.text().catch(() => "");

      const looksLikeJson =
        rawText.trim().startsWith("{") || rawText.trim().startsWith("[");
      if (!contentType.includes("application/json") && !looksLikeJson) {
        const preview = rawText.slice(0, 220).replace(/\s+/g, " ").trim();
        throw new Error(
          `Expected JSON from ${url} but got "${
            contentType || "unknown content-type"
          }" (status ${r.status}). First chars: ${preview || "«empty body»"}`
        );
      }

      let j = null;
      try {
        j = rawText ? JSON.parse(rawText) : null;
      } catch {
        const preview = rawText.slice(0, 220).replace(/\s+/g, " ").trim();
        throw new Error(
          `JSON parse failed (status ${r.status}, content-type "${
            contentType || "unknown"
          }"). First chars: ${preview || "«empty body»"}`
        );
      }

      if (!r.ok || !j?.ok) {
        throw new Error(j?.error || `Request failed (${r.status})`);
      }

      setData(j);
    } catch (e) {
      setData(null);
      setError(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }, [contentId, days, limit]);

  const fetchCases = React.useCallback(async () => {
    setCasesLoading(true);
    setCasesError("");

    try {
      const qs = new URLSearchParams({
        content_id: String(contentId || "").trim(),
        include_closed: "0",
        limit: "500",
      });

      const r = await fetch(`/api/intercom/private/closing-the-loop/cases?${qs.toString()}`, {
        credentials: "include",
      });

      const j = await r.json().catch(() => null);
      if (!r.ok || !j?.ok) {
        throw new Error(j?.error || `Request failed (${r.status})`);
      }

      setCasesData(Array.isArray(j.cases) ? j.cases : []);
    } catch (e) {
      setCasesData([]);
      setCasesError(String(e?.message || e));
    } finally {
      setCasesLoading(false);
    }
  }, [contentId]);

  React.useEffect(() => {
    fetchQueue();
    fetchCases();
  }, [fetchQueue, fetchCases]);

  const queue = React.useMemo(() => {
    const raw = Array.isArray(data?.queue) ? data.queue : [];

    const filtered =
      bucket === "all"
        ? raw
        : raw.filter((x) => String(x?.latest?.bucket || "") === bucket);

    return [...filtered].sort((a, b) => {
      if (sortBy === "date") {
        const at = Date.parse(a?.latest?.submitted_at || "");
        const bt = Date.parse(b?.latest?.submitted_at || "");
        return (Number.isFinite(bt) ? bt : 0) - (Number.isFinite(at) ? at : 0);
      }
      if (sortBy === "score") {
        const as = typeof a?.latest?.score_0_10 === "number" ? a.latest.score_0_10 : -1;
        const bs = typeof b?.latest?.score_0_10 === "number" ? b.latest.score_0_10 : -1;
        return bs - as;
      }
      const ar = typeof a?.risk_score === "number" ? a.risk_score : -1;
      const br = typeof b?.risk_score === "number" ? b.risk_score : -1;
      return br - ar;
    });
  }, [data, bucket, sortBy]);

  const openResponse = React.useCallback(async (responseId) => {
    if (!responseId) return;
    setOpenId(responseId);
    setRawView("all");
    setRawShowJson(false);
    setDetail(null);
    setDetailError("");
    setDetailLoading(true);

    try {
      const qs = new URLSearchParams({ response_id: responseId });
      const r = await fetch(`/api/intercom/private/nps-response?${qs.toString()}`, {
        credentials: "include",
      });
      const j = await r.json().catch(() => null);

      if (!r.ok || !j?.ok) {
        throw new Error(j?.error || `Request failed (${r.status})`);
      }

      setDetail(j.response || null);
    } catch (e) {
      setDetailError(String(e?.message || e));
      setDetail(null);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const createCaseFromQueue = React.useCallback(
    async (queueItem) => {
      if (!queueItem?.contact_id) return;
      setQueueActionLoadingId(String(queueItem.contact_id));

      try {
        const r = await fetch(`/api/intercom/private/closing-the-loop/cases`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content_id: contentId,
            queue_item: queueItem,
            created_by: "envola_user",
          }),
        });

        const j = await r.json().catch(() => null);
        if (!r.ok || !j?.ok) {
          throw new Error(j?.error || `Request failed (${r.status})`);
        }
        await Promise.all([fetchCases(), fetchQueue()]);
      } catch (e) {
        alert(String(e?.message || e));
      } finally {
        setQueueActionLoadingId(null);
      }
    },
    [contentId, fetchCases, fetchQueue]
  );

  const updateCaseStatus = React.useCallback(
    async (caseId, status) => {
      if (!caseId || !status) return;
      setCaseActionLoadingId(caseId);

      try {
        const r = await fetch(
          `/api/intercom/private/closing-the-loop/cases/${encodeURIComponent(caseId)}/status`,
          {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              status,
              changed_by: "envola_user",
              notes: caseComments[caseId] || "",
            }),
          }
        );

        const j = await r.json().catch(() => null);
        console.log("status update response", j);

        if (!r.ok || !j?.ok) {
          throw new Error(j?.error || `Request failed (${r.status})`);
        }

        setCaseComments((prev) => ({
          ...prev,
          [caseId]: "",
        }));

        await Promise.all([fetchCases(), fetchQueue()]);
      } catch (e) {
        alert(String(e?.message || e));
      } finally {
        setCaseActionLoadingId(null);
      }
    },
    [caseComments, fetchCases, fetchQueue]
  );

  React.useEffect(() => {
    if (!openId) return;
    const onKey = (e) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openId, closeModal]);

  const title = tr("closingTheLoop.title", "Closing the loop");
  const subtitle = tr(
    "closingTheLoop.subtitle",
    "Track follow-up, ownership, improvements and impact for Envola survey responses."
  );

  const labels = {
    refresh: tr("closingTheLoop.controls.refresh", "Refresh"),
    refreshing: tr("closingTheLoop.controls.refreshing", "Refreshing…"),
    contentId: tr("closingTheLoop.controls.contentId", "content_id"),
    days: tr("closingTheLoop.controls.days", "days"),
    limit: tr("closingTheLoop.controls.limit", "limit"),
    bucket: tr("closingTheLoop.controls.bucket", "bucket"),
    sort: tr("closingTheLoop.controls.sort", "sort"),
    all: tr("closingTheLoop.filters.all", "All"),
    detractors: tr("closingTheLoop.filters.detractors", "Detractors"),
    passives: tr("closingTheLoop.filters.passives", "Passives"),
    promoters: tr("closingTheLoop.filters.promoters", "Promoters"),
    risk: tr("closingTheLoop.sort.risk", "Risk"),
    latestDate: tr("closingTheLoop.sort.date", "Latest date"),
    score: tr("closingTheLoop.sort.score", "Score"),
    loadingQueue: tr("closingTheLoop.state.loading", "Loading queue…"),
    noResults: tr("closingTheLoop.state.noResults", "No results for this filter/window."),
    errorTitle: tr("closingTheLoop.state.errorTitle", "Error"),
    notAuthHint: tr(
      "closingTheLoop.state.notAuthHint",
      'If you see “Not authorised”, log in again at /private/login.'
    ),

    thRisk: tr("closingTheLoop.table.risk", "Risk"),
    thLatest: tr("closingTheLoop.table.latest", "Latest"),
    thScore: tr("closingTheLoop.table.score", "Score"),
    thBucket: tr("closingTheLoop.table.bucket", "Bucket"),
    thThemes: tr("closingTheLoop.table.themes", "Themes"),
    thRecommendation: tr("closingTheLoop.table.recommendation", "Recommendation"),
    thResponse: tr("closingTheLoop.table.response", "Response"),
    thIntercom: tr("closingTheLoop.table.intercom", "Intercom"),
    thLoop: tr("closingTheLoop.table.loop", "Loop"),
    open: tr("closingTheLoop.actions.open", "Open"),
    view: tr("closingTheLoop.actions.view", "View"),
    dash: tr("common.dash", "—"),

    modalTitle: tr("closingTheLoop.modal.title", "Survey response"),
    modalClose: tr("closingTheLoop.modal.close", "Close"),
    modalLoading: tr("closingTheLoop.modal.loading", "Loading response…"),
    modalError: tr("closingTheLoop.modal.error", "Couldn’t load this response."),
    modalScore: tr("closingTheLoop.modal.score", "Score"),
    modalSubmitted: tr("closingTheLoop.modal.submitted", "Submitted"),
    modalReceipt: tr("closingTheLoop.modal.receipt", "Receipt"),
    modalOptions: tr("closingTheLoop.modal.selectedOptions", "Selected options"),
    modalVerbatims: tr("closingTheLoop.modal.verbatims", "Verbatims"),
    modalRaw: tr("closingTheLoop.modal.rawAnswers", "Raw answers"),
    modalOpenIntercom: tr("closingTheLoop.modal.openIntercom", "Open contact in Intercom"),
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="flex items-start justify-between gap-6 flex-wrap">
        <div>
          <h1 className="text-3xl font-semibold text-white">{title}</h1>
          <p className="mt-3 text-slate-300">{subtitle}</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchQueue}
            className="inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium bg-white/10 hover:bg-white/15 text-white border border-white/10 transition"
            disabled={loading}
          >
            {loading ? labels.refreshing : labels.refresh}
          </button>

          <button
            type="button"
            onClick={fetchCases}
            className="inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium bg-white/10 hover:bg-white/15 text-white border border-white/10 transition"
            disabled={casesLoading}
          >
            {casesLoading ? "Refreshing cases…" : "Refresh cases"}
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-12 gap-3">
        <div className="md:col-span-4">
          <label className="text-xs text-slate-400">{labels.contentId}</label>
          <input
            value={contentId}
            onChange={(e) => setContentId(e.target.value)}
            className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white outline-none focus:border-white/20"
            placeholder="e.g. 189616"
          />
        </div>

        <div className="md:col-span-2">
          <label className="text-xs text-slate-400">{labels.days}</label>
          <input
            type="number"
            min={1}
            max={3650}
            value={days}
            onChange={(e) => setDays(Number(e.target.value || 30))}
            className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white outline-none focus:border-white/20"
          />
        </div>

        <div className="md:col-span-2">
          <label className="text-xs text-slate-400">{labels.limit}</label>
          <input
            type="number"
            min={1}
            max={2000}
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value || 50))}
            className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white outline-none focus:border-white/20"
          />
        </div>

        <div className="md:col-span-2">
          <label className="text-xs text-slate-400">{labels.bucket}</label>
          <select
            value={bucket}
            onChange={(e) => setBucket(e.target.value)}
            className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white outline-none focus:border-white/20"
          >
            <option value="all">{labels.all}</option>
            <option value="detractor">{labels.detractors}</option>
            <option value="passive">{labels.passives}</option>
            <option value="promoter">{labels.promoters}</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="text-xs text-slate-400">{labels.sort}</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white outline-none focus:border-white/20"
          >
            <option value="risk">{labels.risk}</option>
            <option value="date">{labels.latestDate}</option>
            <option value="score">{labels.score}</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="mt-6 rounded-2xl border border-rose-400/20 bg-rose-500/10 p-4 text-rose-100">
          <div className="font-medium">{labels.errorTitle}</div>
          <div className="mt-1 text-sm opacity-90">{error}</div>
        </div>
      )}

      {/* Queue */}
      <section className="mt-8">
        <div className="flex items-center justify-between gap-3 mb-3">
          <button
            type="button"
            onClick={() => setQueueCollapsed((v) => !v)}
            className="inline-flex items-center rounded-xl px-3 py-1.5 text-xs font-medium bg-white/10 hover:bg-white/15 text-white border border-white/10 transition"
          >
            {queueCollapsed ? "Show queue" : "Hide queue"}
          </button>
          <h2 className="text-xl font-semibold text-white">Queue</h2>
          <div className="text-xs text-slate-400">
            Prioritised from recent survey responses
          </div>
        </div>

        {!error && loading && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-slate-200">
            {labels.loadingQueue}
          </div>
        )}

        {!error && !loading && data && queue.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-slate-200">
            {labels.noResults}
          </div>
        )}

        {!error && !loading && queue.length > 0 && (
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0B0F19]/40">
            <div className="overflow-x-auto">
              {!queueCollapsed && (
              <table className="min-w-full text-sm">
                <thead className="bg-white/5 text-slate-300">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium">{labels.thRisk}</th>
                    <th className="text-left px-4 py-3 font-medium">{labels.thLatest}</th>
                    <th className="text-left px-4 py-3 font-medium">{labels.thScore}</th>
                    <th className="text-left px-4 py-3 font-medium">{labels.thBucket}</th>
                    <th className="text-left px-4 py-3 font-medium">{labels.thThemes}</th>
                    <th className="text-left px-4 py-3 font-medium">{labels.thRecommendation}</th>
                    <th className="text-left px-4 py-3 font-medium">{labels.thResponse}</th>
                    <th className="text-left px-4 py-3 font-medium">{labels.thIntercom}</th>
                    <th className="text-left px-4 py-3 font-medium">{labels.thLoop}</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/10">
                  {queue.map((it) => {
                    const latest = it.latest || {};
                    const hasResponse = Boolean(it.response_id);
                    const themes =
                      Array.isArray(it.themes) && it.themes.length
                        ? it.themes.join(", ")
                        : labels.dash;

                    const score =
                      typeof latest.score_0_10 === "number" ? latest.score_0_10 : null;

                    const bucketKey =
                      latest.bucket || (score != null ? scoreBucket(score) : null);

                    return (
                      <tr key={it.contact_id} className="hover:bg-white/5">
                        <td className="px-4 py-3 text-white font-semibold">
                          {typeof it.risk_score === "number" ? it.risk_score : labels.dash}
                        </td>

                        <td className="px-4 py-3 text-slate-200">
                          <div className="text-white/90">{formatDate(latest.submitted_at)}</div>
                          <div className="text-xs text-slate-400 mt-1 line-clamp-2">
                            {latest.comment_excerpt || labels.dash}
                          </div>
                        </td>

                        <td className="px-4 py-3 text-slate-200">
                          {score != null ? score : labels.dash}
                        </td>

                        <td className="px-4 py-3">
                          <span className={bucketPill(bucketKey)}>{bucketKey || labels.dash}</span>
                        </td>

                        <td className="px-4 py-3 text-slate-200">{themes}</td>

                        <td className="px-4 py-3 text-slate-200">
                          {it.recommendation || labels.dash}
                        </td>

                        <td className="px-4 py-3">
                          {hasResponse ? (
                            <button
                              type="button"
                              onClick={() => openResponse(it.response_id)}
                              className="inline-flex items-center rounded-xl px-3 py-1.5 text-xs font-medium bg-white/10 hover:bg-white/15 text-white border border-white/10 transition"
                            >
                              {labels.view}
                            </button>
                          ) : (
                            <span className="text-slate-500">{labels.dash}</span>
                          )}
                        </td>

                        <td className="px-4 py-3">
                          {it.intercom_contact_url ? (
                            <a
                              href={it.intercom_contact_url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center rounded-xl px-3 py-1.5 text-xs font-medium bg-white/10 hover:bg-white/15 text-white border border-white/10 transition"
                            >
                              {labels.open}
                            </a>
                          ) : (
                            <span className="text-slate-500">{labels.dash}</span>
                          )}
                        </td>

                        <td className="px-4 py-3">
                          {it.active_case ? (
                            <div className="flex flex-col gap-1">
                              <span className="text-xs text-slate-400">Loop active</span>
                              <span className="inline-flex items-center rounded-xl px-3 py-1.5 text-xs font-medium bg-indigo-500/15 text-indigo-100 border border-indigo-500/25">
                                {prettyStatus(it.active_case.status)}
                              </span>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => createCaseFromQueue(it)}
                              disabled={queueActionLoadingId === String(it.contact_id)}
                              className="inline-flex items-center rounded-xl px-3 py-1.5 text-xs font-medium bg-[#22C55E] text-[#0B0F19] hover:bg-[#16A34A] transition disabled:opacity-60"
                            >
                              {queueActionLoadingId === String(it.contact_id)
                                ? "Starting…"
                                : "Start loop"}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              )}
            </div>

            <div className="px-4 py-3 text-xs text-slate-400 border-t border-white/10">
              Showing <span className="text-slate-200">{queue.length}</span> items
            </div>
          </div>
        )}
      </section>

      {/* Active cases */}
      <section className="mt-10">
        <div className="flex items-center justify-between gap-3 mb-3">
          <h2 className="text-xl font-semibold text-white">Active cases</h2>
          <div className="text-xs text-slate-400">
            Persisted close-the-loop workflow cases
          </div>
        </div>

        {casesError && (
          <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 p-4 text-rose-100">
            <div className="font-medium">Cases error</div>
            <div className="mt-1 text-sm opacity-90">{casesError}</div>
          </div>
        )}

        {!casesError && casesLoading && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-slate-200">
            Loading active cases…
          </div>
        )}

        {!casesError && !casesLoading && casesData.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-slate-200">
            No active cases yet. Start a loop from the queue above.
          </div>
        )}

        {!casesError && !casesLoading && casesData.length > 0 && (
          <div className="grid gap-4">
            {casesData.map((c) => {
              const bucket = c.latest_bucket || scoreBucket(c.latest_score_0_10);
              const nextStatuses = nextStatusOptions(c.status);
              const durations = c.durations || {};
              const currentStageIndex = CASE_STAGES.indexOf(c.status);

              return (
                <div
                  key={c.case_id}
                  className="rounded-3xl border border-white/10 bg-white/5 p-5"
                >
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs text-slate-400">Current status</span>
                        <Chip tone="indigo">{prettyStatus(c.status)}</Chip>
                        <Chip tone={c.priority === "high" || c.priority === "critical" ? "red" : "amber"}>
                          Priority: {c.priority || "—"}
                        </Chip>
                        <span className={bucketPill(c.latest_bucket || scoreBucket(c.latest_score_0_10))}>
                          {c.latest_bucket || scoreBucket(c.latest_score_0_10)}
                        </span>
                      </div>

                      <div className="mt-3 text-white font-semibold">
                        {c.comment_excerpt || "No comment excerpt"}
                      </div>

                      <div className="mt-2 text-sm text-slate-300">
                        Case ID: <span className="font-mono">{c.case_id}</span>
                      </div>

                      <div className="mt-2 flex flex-wrap gap-2">
                        {c.theme_primary ? <Chip>{c.theme_primary}</Chip> : null}
                        {(c.theme_secondary || []).map((t) => (
                          <Chip key={t}>{t}</Chip>
                        ))}
                      </div>

                      <div className="mt-3 grid gap-1 text-xs text-slate-400">
                        <div>
                          Customer follow-up completed:{" "}
                          <span className="text-white">{formatDate(c.customer_followup_completed_at)}</span>
                        </div>
                        <div>
                          Owner assigned:{" "}
                          <span className="text-white">{formatDate(c.owner_assigned_at)}</span>
                        </div>
                        <div>
                          Improvement planned:{" "}
                          <span className="text-white">{formatDate(c.improvement_planned_at)}</span>
                        </div>
                        <div>
                          Improvement completed:{" "}
                          <span className="text-white">{formatDate(c.improvement_completed_at)}</span>
                        </div>
                        <div>
                          Customer informed:{" "}
                          <span className="text-white">{formatDate(c.customer_informed_at)}</span>
                        </div>
                        <div>
                          Impact checked:{" "}
                          <span className="text-white">{formatDate(c.impact_checked_at)}</span>
                        </div>
                        <div>
                          Closed:{" "}
                          <span className="text-white">{formatDate(c.closed_at)}</span>
                        </div>
                      </div>

                      {Array.isArray(c.audit_log) && c.audit_log.some((a) => a?.notes) && (
                        <div className="mt-4">
                          <div className="text-xs text-slate-400 mb-2">Progress notes</div>
                          <div className="space-y-2">
                            {c.audit_log
                              .filter((a) => a?.notes)
                              .sort((a, b) =>
                                String(b?.created_at || "").localeCompare(String(a?.created_at || ""))
                              )
                              .map((a, idx) => (
                                <div
                                  key={`${a.case_id || c.case_id}-audit-${idx}`}
                                  className="rounded-2xl border border-white/10 bg-black/20 px-3 py-3"
                                >
                                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                                    <span className="text-slate-200">{formatActionType(a)}</span>
                                    <span>•</span>
                                    <span>{formatDate(a.created_at)}</span>
                                  </div>
                                  <div className="mt-2 text-sm text-slate-200 whitespace-pre-wrap">
                                    {a.notes}
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="text-sm text-slate-300 space-y-1 min-w-[240px]">
                      <div>
                        Survey received:{" "}
                        <span className="text-white">{formatDate(c.survey_received_at)}</span>
                      </div>
                      <div>
                        Active close days:{" "}
                        <span className="text-white">
                          {durations.active_close_days ?? "—"}
                        </span>
                      </div>
                      <div>
                        Paused days:{" "}
                        <span className="text-white">
                          {durations.paused_days_total ?? "—"}
                        </span>
                      </div>
                      <div>
                        Actions:{" "}
                        <span className="text-white">{c.actions_count ?? 0}</span>
                      </div>
                      <div>
                        Contacts:{" "}
                        <span className="text-white">{c.contact_events_count ?? 0}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5">
                    <label className="block text-xs text-slate-400 mb-2">
                      Add note before moving to the next stage
                    </label>
                    <textarea
                      value={caseComments[c.case_id] || ""}
                      onChange={(e) =>
                        setCaseComments((prev) => ({
                          ...prev,
                          [c.case_id]: e.target.value,
                        }))
                      }
                      rows={3}
                      placeholder="Add context, outcome, owner notes, customer update, etc."
                      className="w-full rounded-2xl bg-black/20 border border-white/10 px-3 py-2 text-sm text-white outline-none focus:border-white/20"
                    />
                  </div>

                  <div className="mt-5">
                    <div className="mb-2 text-xs text-slate-400">Workflow stages</div>

                    <div className="flex flex-wrap gap-2">
                      {CASE_STAGES.map((stage) => {
                        const state = getStageState(c.status, stage);
                        const isCurrent = stage === c.status;
                        const isNext = nextStatuses.includes(stage);
                        const isClosed = c.status === "closed";
                        const clickable = !isClosed && isNext;

                        return (
                          <button
                            key={stage}
                            type="button"
                            onClick={() => clickable && updateCaseStatus(c.case_id, stage)}
                            disabled={caseActionLoadingId === c.case_id || !clickable}
                            className={`${stageClassName({ state, clickable })} ${
                              clickable ? "cursor-pointer" : "cursor-default"
                            } disabled:opacity-60`}
                            title={
                              isCurrent
                                ? "Current stage"
                                : state === "done"
                                ? "Completed stage"
                                : clickable
                                ? "Click to move to this stage"
                                : "Not available yet"
                            }
                          >
                            {caseActionLoadingId === c.case_id && clickable
                              ? "Updating…"
                              : prettyStatus(stage)}
                          </button>
                        );
                      })}
                    </div>

                    {c.status === "closed" && (
                      <div className="mt-3 text-xs text-emerald-300">
                        This loop has been closed. It will no longer appear as an active case in the queue.
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Modal */}
      {openId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/70"
            onClick={closeModal}
            aria-label={labels.modalClose}
          />

          <div className="relative w-full max-w-3xl max-h-[85vh] overflow-hidden rounded-3xl border border-white/10 bg-[#0B0F19] shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5">
              <div className="font-semibold text-white">{labels.modalTitle}</div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-xl px-3 py-1.5 text-xs font-medium bg-white/10 hover:bg-white/15 text-white border border-white/10 transition"
              >
                {labels.modalClose}
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(85vh-72px)]">
              {detailLoading && (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-slate-200">
                  {labels.modalLoading}
                </div>
              )}

              {!detailLoading && detailError && (
                <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 p-4 text-rose-100">
                  <div className="font-medium">{labels.modalError}</div>
                  <div className="mt-1 text-sm opacity-90">{detailError}</div>
                </div>
              )}

              {!detailLoading && !detailError && detail && (
                <div className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="text-xs text-slate-400">{labels.modalScore}</div>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="text-2xl font-semibold text-white">
                          {typeof detail.score_0_10 === "number" ? detail.score_0_10 : "—"}
                        </div>
                        <span className={bucketPill(detail.bucket)}>
                          {detail.bucket || scoreBucket(detail.score_0_10)}
                        </span>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="text-xs text-slate-400">{labels.modalSubmitted}</div>
                      <div className="mt-2 text-white">{formatDate(detail.submitted_at)}</div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="text-xs text-slate-400">{labels.modalReceipt}</div>
                      <div className="mt-2 text-white font-mono text-xs break-all">
                        {(detail.content_id || "—") + ":" + (detail.receipt_id || "—")}
                      </div>
                    </div>
                  </div>

                  {detail.intercom_contact_url && (
                    <div>
                      <a
                        href={detail.intercom_contact_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center rounded-2xl px-4 py-2 text-sm font-medium bg-white/10 hover:bg-white/15 text-white border border-white/10 transition"
                      >
                        {labels.modalOpenIntercom}
                      </a>
                    </div>
                  )}

                  <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                    <div className="text-white font-semibold">{labels.modalOptions}</div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {Array.isArray(detail.selected_options) && detail.selected_options.length ? (
                        detail.selected_options.map((o) => (
                          <span key={o} className={chipClass()}>
                            {o}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-400 text-sm">{labels.dash}</span>
                      )}
                    </div>
                  </div>

                  <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                    <div className="text-white font-semibold">{labels.modalVerbatims}</div>

                    <div className="mt-4 space-y-4">
                      {(() => {
                        const groups = groupVerbatims(detail.verbatims);
                        if (!groups.length) {
                          return <div className="text-slate-400 text-sm">{labels.dash}</div>;
                        }

                        return groups.map(([q, texts]) => (
                          <div key={q} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                            <div className="text-xs text-slate-400">{q}</div>
                            <ul className="mt-2 space-y-2 text-sm text-slate-200">
                              {texts.map((t, idx) => (
                                <li key={`${q}-${idx}`} className="leading-relaxed">
                                  {t}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>

                  {(() => {
                    const allAnswers = Array.isArray(detail?.answers) ? detail.answers : [];
                    const relevantQids = inferRelevantQuestionIds(detail);

                    const relevantAnswers = allAnswers.filter((a) => {
                      const qid = a?.question_id != null ? String(a.question_id) : "";
                      return relevantQids.includes(qid);
                    });

                    const answersToShow = rawView === "all" ? allAnswers : relevantAnswers;
                    const sortedAnswers = sortAnswersForSurvey({
                      contentId: detail?.content_id || DEFAULT_CONTENT_ID,
                      answers: answersToShow,
                    });

                    return (
                      <Disclosure
                        title={labels.modalRaw}
                        right={`${sortedAnswers.length} shown`}
                        defaultOpen={false}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs text-slate-400">View:</span>

                            <button
                              type="button"
                              onClick={() => setRawView("relevant")}
                              className={
                                rawView === "relevant"
                                  ? "rounded-xl border border-indigo-500/25 bg-indigo-500/15 px-3 py-2 text-xs font-semibold text-indigo-100"
                                  : "rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-slate-200 hover:bg-white/5"
                              }
                            >
                              Relevant only
                            </button>

                            <button
                              type="button"
                              onClick={() => setRawView("all")}
                              className={
                                rawView === "all"
                                  ? "rounded-xl border border-emerald-500/25 bg-emerald-500/15 px-3 py-2 text-xs font-semibold text-emerald-100"
                                  : "rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-slate-200 hover:bg-white/5"
                              }
                            >
                              All questions
                            </button>

                            {relevantQids.length ? (
                              <div className="ml-2 flex flex-wrap gap-2">
                                {relevantQids.map((qid) => (
                                  <Chip key={qid} tone="indigo" title="Inferred relevant question id">
                                    QID {qid}
                                  </Chip>
                                ))}
                              </div>
                            ) : null}
                          </div>

                          <label className="inline-flex items-center gap-2 text-xs text-slate-300">
                            <input
                              type="checkbox"
                              className="accent-indigo-500"
                              checked={rawShowJson}
                              onChange={(e) => setRawShowJson(e.target.checked)}
                            />
                            Show JSON
                          </label>
                        </div>

                        <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
                          {sortedAnswers.length ? (
                            <AnswerTable rows={sortedAnswers} compact={false} />
                          ) : (
                            <div className="text-sm text-slate-300">No answers found.</div>
                          )}
                        </div>

                        {rawShowJson ? (
                          <pre className="mt-4 max-h-80 overflow-auto rounded-2xl border border-white/10 bg-black/30 p-4 text-xs text-slate-200">
                            {JSON.stringify(sortedAnswers, null, 2)}
                          </pre>
                        ) : null}
                      </Disclosure>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
