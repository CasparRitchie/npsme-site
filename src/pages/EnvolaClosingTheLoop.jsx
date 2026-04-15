// src/pages/EnvolaClosingTheLoop.jsx
import React, { useEffect } from "react";
import { useLanguage } from "../i18n/LanguageContext";
import { translations } from "../i18n/translations";
import { useLocation } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import EnvolaWorkspaceNav from "../components/EnvolaWorkspaceNav";

import {
  CASE_STAGE_ORDER,
  STATUS_TRANSITIONS,
  CASE_TIMELINE_FIELDS,
} from "../../shared/closingTheLoopConfig.js";

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
  if (bucket === "detractor") {
    return `${base} border-rose-400/30 bg-rose-500/10 text-rose-200`;
  }
  if (bucket === "passive") {
    return `${base} border-amber-400/30 bg-amber-500/10 text-amber-200`;
  }
  if (bucket === "promoter") {
    return `${base} border-emerald-400/30 bg-emerald-500/10 text-emerald-200`;
  }
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
        <span className="ml-2 text-slate-400 transition group-open:rotate-180">
          ▾
        </span>
      </summary>
      <div className="mt-4">{children}</div>
    </details>
  );
}

function AnswerTable({ rows, compact = false, tr }) {
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
            <th className="py-2 pr-4">
              {tr("envola.closingTheLoop.modal.question", "Question")}
            </th>
            <th className="py-2 pr-4">
              {tr("envola.closingTheLoop.modal.answer", "Answer")}
            </th>
            {!compact ? (
              <th className="py-2">
                {tr("envola.closingTheLoop.modal.answered", "Answered")}
              </th>
            ) : null}
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
                  <div className="leading-snug text-slate-200">{g.question_text}</div>
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
                <td className="whitespace-nowrap py-3 align-top text-xs text-slate-400">
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

function nextStatusOptions(currentStatus) {
  return STATUS_TRANSITIONS[currentStatus] || [];
}


function prettyStatus(status, tr) {
  return tr(
    `envola.closingTheLoop.stages.${status}`,
    String(status || "")
      .replaceAll("_", " ")
      .replace(/\b\w/g, (m) => m.toUpperCase())
  );
}

function getStageState(caseStatus, stage) {
  const currentIndex = CASE_STAGE_ORDER.indexOf(caseStatus);
  const stageIndex = CASE_STAGE_ORDER.indexOf(stage);

  if (currentIndex === -1 || stageIndex === -1) return "future";
  if (stageIndex < currentIndex) return "done";
  if (stageIndex === currentIndex) return "current";
  return "future";
}

function stageClassName({ state, clickable }) {
  const base =
    "inline-flex items-center rounded-xl px-3 py-1.5 text-xs font-medium border transition";

  if (clickable) {
    return `${base} border-[#22C55E] bg-[#22C55E]/15 text-[#DCFCE7] hover:border-[#4ADE80] hover:bg-[#22C55E] hover:text-[#0B0F19]`;
  }

  if (state === "current") {
    return `${base} border-slate-400/30 bg-slate-500/15 text-slate-200`;
  }

  if (state === "done") {
    return `${base} border-[#7C3AED] bg-[#7C3AED]/10 text-[#E9D5FF]`;
  }

  return `${base} border-white/10 bg-white/5 text-slate-400`;
}

export default function EnvolaClosingTheLoop() {
  const { lang } = useLanguage();
  const tr = (p, f) => translations(lang, p, f);
  const location = useLocation();

  const navAnchorRef = React.useRef(null);
  const [isNavPinned, setIsNavPinned] = React.useState(false);

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
  const [caseFilter, setCaseFilter] = React.useState("all");
  const caseRefs = React.useRef({});
  const [lastUpdatedCaseId, setLastUpdatedCaseId] = React.useState(null);

  const [caseActionLoadingId, setCaseActionLoadingId] = React.useState(null);
  const [queueActionLoadingId, setQueueActionLoadingId] = React.useState(null);

  const [queueCollapsed, setQueueCollapsed] = React.useState(false);

  const [openId, setOpenId] = React.useState(null);
  const [detailLoading, setDetailLoading] = React.useState(false);
  const [detailError, setDetailError] = React.useState("");
  const [detail, setDetail] = React.useState(null);
  const [rawView, setRawView] = React.useState("all");
  const [rawShowJson, setRawShowJson] = React.useState(false);

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
        include_closed: "1",
        limit: "500",
      });

      const r = await fetch(
        `/api/intercom/private/closing-the-loop/cases?${qs.toString()}`,
        {
          credentials: "include",
        }
      );

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
        const as =
          typeof a?.latest?.score_0_10 === "number" ? a.latest.score_0_10 : -1;
        const bs =
          typeof b?.latest?.score_0_10 === "number" ? b.latest.score_0_10 : -1;
        return bs - as;
      }
      const ar = typeof a?.risk_score === "number" ? a.risk_score : -1;
      const br = typeof b?.risk_score === "number" ? b.risk_score : -1;
      return br - ar;
    });
  }, [data, bucket, sortBy]);

  const filteredCases = React.useMemo(() => {
    if (caseFilter === "active") {
      return casesData.filter(
        (c) => c.status !== "closed" && c.status !== "cancelled"
      );
    }

    if (caseFilter === "completed") {
      return casesData.filter(
        (c) => c.status === "closed" || c.status === "cancelled"
      );
    }

    return casesData;
  }, [casesData, caseFilter]);

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

      setLastUpdatedCaseId(caseId);
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

  React.useEffect(() => {
    if (!lastUpdatedCaseId || casesLoading) return;

    const el = caseRefs.current[lastUpdatedCaseId];
    if (!el) return;

    window.requestAnimationFrame(() => {
      el.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    });
  }, [casesData, casesLoading, lastUpdatedCaseId]);

  const title = tr("envola.closingTheLoop.title", "Closing the loop");
  const subtitle = tr(
    "envola.closingTheLoop.subtitle",
    "Track follow-up, ownership, improvements and impact for Envola survey responses."
  );

  const labels = {
    refresh: tr("envola.closingTheLoop.controls.refresh", "Refresh"),
    refreshing: tr("envola.closingTheLoop.controls.refreshing", "Refreshing…"),
    refreshCases: tr("envola.closingTheLoop.controls.refreshCases", "Refresh cases"),
    refreshingCases: tr(
      "envola.closingTheLoop.controls.refreshingCases",
      "Refreshing cases…"
    ),
    contentId: tr("envola.closingTheLoop.controls.contentId", "content_id"),
    days: tr("envola.closingTheLoop.controls.days", "days"),
    limit: tr("envola.closingTheLoop.controls.limit", "limit"),
    bucket: tr("envola.closingTheLoop.controls.bucket", "bucket"),
    sort: tr("envola.closingTheLoop.controls.sort", "sort"),

    all: tr("envola.closingTheLoop.filters.all", "All"),
    detractors: tr("envola.closingTheLoop.filters.detractors", "Detractors"),
    passives: tr("envola.closingTheLoop.filters.passives", "Passives"),
    promoters: tr("envola.closingTheLoop.filters.promoters", "Promoters"),

    risk: tr("envola.closingTheLoop.sortOptions.risk", "Risk"),
    latestDate: tr("envola.closingTheLoop.sortOptions.date", "Latest date"),
    score: tr("envola.closingTheLoop.sortOptions.score", "Score"),

    loadingQueue: tr("envola.closingTheLoop.state.loadingQueue", "Loading queue…"),
    noResults: tr(
      "envola.closingTheLoop.state.noResults",
      "No results for this filter/window."
    ),
    errorTitle: tr("envola.closingTheLoop.state.errorTitle", "Error"),
    notAuthHint: tr(
      "envola.closingTheLoop.state.notAuthHint",
      'If you see “Not authorised”, log in again at /private/login.'
    ),

    showQueue: tr("envola.closingTheLoop.actions.showQueue", "Show queue"),
    hideQueue: tr("envola.closingTheLoop.actions.hideQueue", "Hide queue"),
    queueTitle: tr("envola.closingTheLoop.sections.queue", "Queue"),
    queueSubtitle: tr(
      "envola.closingTheLoop.sections.queueSubtitle",
      "Prioritised from recent survey responses"
    ),

    activeCasesTitle: tr("envola.closingTheLoop.sections.activeCases", "Active cases"),
    activeCasesSubtitle: tr(
      "envola.closingTheLoop.sections.activeCasesSubtitle",
      "Persisted close-the-loop workflow cases"
    ),

    showingItems: tr("envola.closingTheLoop.table.showingItems", "Showing"),
    items: tr("envola.closingTheLoop.table.items", "items"),

    currentStage: tr("envola.closingTheLoop.actions.currentStage", "Current stage"),
    completedStage: tr("envola.closingTheLoop.actions.completedStage", "Completed stage"),
    clickToMove: tr("envola.closingTheLoop.actions.clickToMove", "Click to move to this stage"),
    notAvailableYet: tr("envola.closingTheLoop.actions.notAvailableYet", "Not available yet"),

    caseFilterAll: tr("envola.closingTheLoop.filters.caseFilterAll", "All"),
    caseFilterActive: tr("envola.closingTheLoop.filters.caseFilterActive", "Active"),
    caseFilterCompleted: tr("envola.closingTheLoop.filters.caseFilterCompleted", "Completed"),

    casesError: tr("envola.closingTheLoop.state.casesError", "Cases error"),
    loadingActiveCases: tr(
      "envola.closingTheLoop.state.loadingCases",
      "Loading active cases…"
    ),
    noActiveCases: tr(
      "envola.closingTheLoop.state.noCases",
      "No active cases yet. Start a loop from the queue above."
    ),

    thRisk: tr("envola.closingTheLoop.table.risk", "Risk"),
    thLatest: tr("envola.closingTheLoop.table.latest", "Latest"),
    thScore: tr("envola.closingTheLoop.table.score", "Score"),
    thBucket: tr("envola.closingTheLoop.table.bucket", "Bucket"),
    thThemes: tr("envola.closingTheLoop.table.themes", "Themes"),
    thRecommendation: tr("envola.closingTheLoop.table.recommendation", "Recommendation"),
    thResponse: tr("envola.closingTheLoop.table.response", "Response"),
    thIntercom: tr("envola.closingTheLoop.table.intercom", "Intercom"),
    thLoop: tr("envola.closingTheLoop.table.loop", "Loop"),

    open: tr("envola.closingTheLoop.actions.open", "Open"),
    view: tr("envola.closingTheLoop.actions.view", "View"),
    startLoop: tr("envola.closingTheLoop.actions.startLoop", "Start loop"),
    starting: tr("envola.closingTheLoop.actions.starting", "Starting…"),
    loopActive: tr("envola.closingTheLoop.actions.loopActive", "Loop active"),
    loopCompleted: tr("envola.closingTheLoop.actions.loopCompleted", "Loop completed"),
    addNote: tr(
      "envola.closingTheLoop.actions.addNote",
      "Add note before moving to the next stage"
    ),
    addNotePlaceholder: tr(
      "envola.closingTheLoop.actions.addNotePlaceholder",
      "Add context, outcome, owner notes, customer update, etc."
    ),
    workflowStages: tr(
      "envola.closingTheLoop.actions.workflowStages",
      "Workflow stages"
    ),
    updating: tr("envola.closingTheLoop.actions.updating", "Updating…"),

    currentStatus: tr("envola.closingTheLoop.case.currentStatus", "Current status"),
    priority: tr("envola.closingTheLoop.case.priority", "Priority"),
    noCommentExcerpt: tr(
      "envola.closingTheLoop.case.noCommentExcerpt",
      "No comment excerpt"
    ),
    caseId: tr("envola.closingTheLoop.case.caseId", "Case ID"),
    surveyReceived: tr("envola.closingTheLoop.case.surveyReceived", "Survey received"),
    activeCloseDays: tr(
      "envola.closingTheLoop.case.activeCloseDays",
      "Active close days"
    ),
    pausedDays: tr("envola.closingTheLoop.case.pausedDays", "Paused days"),
    actionsCount: tr("envola.closingTheLoop.case.actions", "Actions"),
    contactsCount: tr("envola.closingTheLoop.case.contacts", "Contacts"),
    closedHint: tr(
      "envola.closingTheLoop.case.closedHint",
      "This loop has been closed. It will no longer appear as an active case in the queue."
    ),

    followupCompleted: tr(
      "envola.closingTheLoop.timeline.customerFollowupCompleted",
      "Customer follow-up completed"
    ),
    ownerAssigned: tr(
      "envola.closingTheLoop.timeline.ownerAssigned",
      "Owner assigned"
    ),
    improvementPlanned: tr(
      "envola.closingTheLoop.timeline.improvementPlanned",
      "Improvement planned"
    ),
    improvementScheduled: tr(
      "envola.closingTheLoop.timeline.improvementScheduled",
      "Improvement scheduled"
    ),
    improvementInProgress: tr(
      "envola.closingTheLoop.timeline.improvementInProgress",
      "Improvement in progress"
    ),
    impactCheckPending: tr(
      "envola.closingTheLoop.timeline.impactCheckPending",
      "Impact check pending"
    ),
    improvementCompleted: tr(
      "envola.closingTheLoop.timeline.improvementCompleted",
      "Improvement completed"
    ),
    customerInformed: tr(
      "envola.closingTheLoop.timeline.customerInformed",
      "Customer informed"
    ),
    impactChecked: tr(
      "envola.closingTheLoop.timeline.impactChecked",
      "Impact checked"
    ),
    closed: tr("envola.closingTheLoop.timeline.closed", "Closed"),

    modalTitle: tr("envola.closingTheLoop.modal.title", "Survey response"),
    modalClose: tr("envola.closingTheLoop.modal.close", "Close"),
    modalLoading: tr("envola.closingTheLoop.modal.loading", "Loading response…"),
    modalError: tr(
      "envola.closingTheLoop.modal.error",
      "Couldn’t load this response."
    ),
    modalScore: tr("envola.closingTheLoop.modal.score", "Score"),
    modalSubmitted: tr("envola.closingTheLoop.modal.submitted", "Submitted"),
    modalReceipt: tr("envola.closingTheLoop.modal.receipt", "Receipt"),
    modalOptions: tr(
      "envola.closingTheLoop.modal.selectedOptions",
      "Selected options"
    ),
    modalVerbatims: tr("envola.closingTheLoop.modal.verbatims", "Verbatims"),
    modalRaw: tr("envola.closingTheLoop.modal.rawAnswers", "Raw answers"),
    modalOpenIntercom: tr(
      "envola.closingTheLoop.modal.openIntercom",
      "Open contact in Intercom"
    ),
    modalRelevantOnly: tr(
      "envola.closingTheLoop.modal.relevantOnly",
      "Relevant only"
    ),
    modalAllQuestions: tr(
      "envola.closingTheLoop.modal.allQuestions",
      "All questions"
    ),
    modalShowJson: tr("envola.closingTheLoop.modal.showJson", "Show JSON"),
    modalNoAnswers: tr(
      "envola.closingTheLoop.modal.noAnswers",
      "No answers found."
    ),
    modalView: tr("envola.closingTheLoop.modal.view", "View:"),
    modalShown: tr("envola.closingTheLoop.modal.shownSuffix", "shown"),

    dash: tr("common.dash", "—"),
  };

  const timelineLabels = {
    customer_followup_completed: labels.followupCompleted,
    owner_assigned: labels.ownerAssigned,
    improvement_planned: labels.improvementPlanned,
    improvement_scheduled: labels.improvementScheduled,
    improvement_in_progress: labels.improvementInProgress,
    improvement_completed: labels.improvementCompleted,
    customer_informed: labels.customerInformed,
    impact_checked: labels.impactChecked,
    closed: labels.closed,
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B0F19] via-[#0C1224] to-[#0B0F19] text-slate-200">
      <PageHeader iconLabel="NPS Me" tag={tr("envola.tag", "Client workspace / Envola")}>
        <div className="pt-4">
          <h1 className="text-3xl font-semibold text-white md:text-4xl">
            {title}
          </h1>

          <p className="mt-3 max-w-3xl text-slate-300">{subtitle}</p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={fetchQueue}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/15"
              disabled={loading}
            >
              {loading ? labels.refreshing : labels.refresh}
            </button>

            <button
              type="button"
              onClick={fetchCases}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/15"
              disabled={casesLoading}
            >
              {casesLoading ? labels.refreshingCases : labels.refreshCases}
            </button>
          </div>
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
          <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
            <div className="md:col-span-4">
              <label className="text-xs text-slate-400">{labels.contentId}</label>
              <input
                value={contentId}
                onChange={(e) => setContentId(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-white/20"
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
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-white/20"
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
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-white/20"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs text-slate-400">{labels.bucket}</label>
              <select
                value={bucket}
                onChange={(e) => setBucket(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-white/20"
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
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-white/20"
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
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-10">
        <div className="mb-3 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setQueueCollapsed((v) => !v)}
            className="inline-flex items-center rounded-xl border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/15"
          >
            {queueCollapsed ? labels.showQueue : labels.hideQueue}
          </button>
          <h2 className="text-xl font-semibold text-white">{labels.queueTitle}</h2>
          <div className="text-xs text-slate-400">{labels.queueSubtitle}</div>
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
                      <th className="px-4 py-3 text-left font-medium">{labels.thRisk}</th>
                      <th className="px-4 py-3 text-left font-medium">{labels.thLatest}</th>
                      <th className="px-4 py-3 text-left font-medium">{labels.thScore}</th>
                      <th className="px-4 py-3 text-left font-medium">{labels.thBucket}</th>
                      <th className="px-4 py-3 text-left font-medium">{labels.thThemes}</th>
                      <th className="px-4 py-3 text-left font-medium">{labels.thRecommendation}</th>
                      <th className="px-4 py-3 text-left font-medium">{labels.thResponse}</th>
                      <th className="px-4 py-3 text-left font-medium">{labels.thIntercom}</th>
                      <th className="px-4 py-3 text-left font-medium">{labels.thLoop}</th>
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
                          <td className="px-4 py-3 font-semibold text-white">
                            {typeof it.risk_score === "number" ? it.risk_score : labels.dash}
                          </td>

                          <td className="px-4 py-3 text-slate-200">
                            <div className="text-white/90">{formatDate(latest.submitted_at)}</div>
                            <div className="mt-1 line-clamp-2 text-xs text-slate-400">
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
                                className="inline-flex items-center rounded-xl border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/15"
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
                                className="inline-flex items-center rounded-xl border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/15"
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
                                <span className="text-xs text-slate-400">
                                  {it.active_case.is_closed
                                    ? labels.loopCompleted
                                    : labels.loopActive}
                                </span>

                                <span
                                  className={
                                    it.active_case.is_closed
                                      ? "inline-flex items-center rounded-xl border border-emerald-500/25 bg-emerald-500/15 px-3 py-1.5 text-xs font-medium text-emerald-100"
                                      : "inline-flex items-center rounded-xl border border-indigo-500/25 bg-indigo-500/15 px-3 py-1.5 text-xs font-medium text-indigo-100"
                                  }
                                >
                                  {prettyStatus(it.active_case.status, tr)}
                                </span>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => createCaseFromQueue(it)}
                                disabled={queueActionLoadingId === String(it.contact_id)}
                                className="inline-flex items-center rounded-xl bg-[#22C55E] px-3 py-1.5 text-xs font-medium text-[#0B0F19] transition hover:bg-[#16A34A] disabled:opacity-60"
                              >
                                {queueActionLoadingId === String(it.contact_id)
                                  ? labels.starting
                                  : labels.startLoop}
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

            <div className="border-t border-white/10 px-4 py-3 text-xs text-slate-400">
              {labels.showingItems}{" "}
              <span className="text-slate-200">{queue.length}</span> {labels.items}
            </div>
          </div>
        )}
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-10">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-white">{labels.activeCasesTitle}</h2>
            <div className="text-xs text-slate-400">{labels.activeCasesSubtitle}</div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setCaseFilter("all")}
              className={
                caseFilter === "all"
                  ? "rounded-xl border border-indigo-500/25 bg-indigo-500/15 px-3 py-1.5 text-xs font-semibold text-indigo-100"
                  : "rounded-xl border border-white/10 bg-white/10 px-3 py-1.5 text-xs text-slate-200 hover:bg-white/15"
              }
            >
              {labels.caseFilterAll}
            </button>

            <button
              type="button"
              onClick={() => setCaseFilter("active")}
              className={
                caseFilter === "active"
                  ? "rounded-xl border border-amber-500/25 bg-amber-500/15 px-3 py-1.5 text-xs font-semibold text-amber-100"
                  : "rounded-xl border border-white/10 bg-white/10 px-3 py-1.5 text-xs text-slate-200 hover:bg-white/15"
              }
            >
              {labels.caseFilterActive}
            </button>

            <button
              type="button"
              onClick={() => setCaseFilter("completed")}
              className={
                caseFilter === "completed"
                  ? "rounded-xl border border-emerald-500/25 bg-emerald-500/15 px-3 py-1.5 text-xs font-semibold text-emerald-100"
                  : "rounded-xl border border-white/10 bg-white/10 px-3 py-1.5 text-xs text-slate-200 hover:bg-white/15"
              }
            >
              {labels.caseFilterCompleted}
            </button>
          </div>
        </div>

        {casesError && (
          <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 p-4 text-rose-100">
            <div className="font-medium">{labels.casesError}</div>
            <div className="mt-1 text-sm opacity-90">{casesError}</div>
          </div>
        )}

        {!casesError && casesLoading && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-slate-200">
            {labels.loadingActiveCases}
          </div>
        )}

        {!casesError && !casesLoading && filteredCases.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-slate-200">
            {labels.noActiveCases}
          </div>
        )}

        {!casesError && !casesLoading && filteredCases.length > 0 && (
          <div className="grid gap-4">
            {filteredCases.map((c) => {
              const nextStatuses = nextStatusOptions(c.status);
              const durations = c.durations || {};

              return (
                <div
                  key={c.case_id}
                  ref={(el) => {
                    if (el) {
                      caseRefs.current[c.case_id] = el;
                    }
                  }}
                  className="rounded-3xl border border-white/10 bg-white/5 p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs text-slate-400">{labels.currentStatus}</span>
                        <Chip tone="indigo">{prettyStatus(c.status, tr)}</Chip>
                        <Chip
                          tone={
                            c.priority === "high" || c.priority === "critical"
                              ? "red"
                              : "amber"
                          }
                        >
                          {labels.priority}: {c.priority || "—"}
                        </Chip>
                        <span
                          className={bucketPill(
                            c.latest_bucket || scoreBucket(c.latest_score_0_10)
                          )}
                        >
                          {c.latest_bucket || scoreBucket(c.latest_score_0_10)}
                        </span>
                      </div>

                      <div className="mt-3 font-semibold text-white">
                        {c.comment_excerpt || labels.noCommentExcerpt}
                      </div>

                      <div className="mt-2 text-sm text-slate-300">
                        {labels.caseId}: <span className="font-mono">{c.case_id}</span>
                      </div>

                      <div className="mt-2 flex flex-wrap gap-2">
                        {c.theme_primary ? <Chip>{c.theme_primary}</Chip> : null}
                        {(c.theme_secondary || []).map((t) => (
                          <Chip key={t}>{t}</Chip>
                        ))}
                      </div>

                      {(() => {
                        const auditByToValue = new Map(
                          (Array.isArray(c.audit_log) ? c.audit_log : [])
                            .filter((a) => a?.to_value)
                            .sort((a, b) =>
                              String(b?.created_at || "").localeCompare(
                                String(a?.created_at || "")
                              )
                            )
                            .map((a) => [a.to_value, a])
                        );

                        const renderStageRow = (label, dateValue, statusKey) => {
                          const audit = auditByToValue.get(statusKey);
                          const note = audit?.notes?.trim();

                          return (
                            <div className="flex flex-wrap gap-x-2 gap-y-1">
                              <span>{label}:</span>
                              <span className="text-white">{formatDate(dateValue)}</span>
                              {note ? (
                                <span className="italic text-slate-300">— {note}</span>
                              ) : null}
                            </div>
                          );
                        };

                        return (
                          <div className="mt-3 grid gap-1 text-xs text-slate-400">
                            {Object.entries(CASE_TIMELINE_FIELDS).map(([statusKey, fieldName]) =>
                              renderStageRow(
                                timelineLabels[statusKey] || prettyStatus(statusKey, tr),
                                c[fieldName],
                                statusKey
                              )
                            )}
                          </div>
                        );
                      })()}
                    </div>

                    <div className="min-w-[240px] space-y-1 text-sm text-slate-300">
                      <div>
                        {labels.surveyReceived}:{" "}
                        <span className="text-white">{formatDate(c.survey_received_at)}</span>
                      </div>
                      <div>
                        {labels.activeCloseDays}:{" "}
                        <span className="text-white">
                          {durations.active_close_days ?? "—"}
                        </span>
                      </div>
                      <div>
                        {labels.pausedDays}:{" "}
                        <span className="text-white">
                          {durations.paused_days_total ?? "—"}
                        </span>
                      </div>
                      <div>
                        {labels.actionsCount}:{" "}
                        <span className="text-white">{c.actions_count ?? 0}</span>
                      </div>
                      <div>
                        {labels.contactsCount}:{" "}
                        <span className="text-white">{c.contact_events_count ?? 0}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5">
                    <label className="mb-2 block text-xs text-slate-400">
                      {labels.addNote}
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
                      placeholder={labels.addNotePlaceholder}
                      className="w-full rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none focus:border-white/20"
                    />
                  </div>

                  <div className="mt-5">
                    <div className="mb-2 text-xs text-slate-400">{labels.workflowStages}</div>

                    <div className="flex flex-wrap gap-2">
                      {CASE_STAGE_ORDER.map((stage) => {
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
                                ? labels.currentStage
                                : state === "done"
                                ? labels.completedStage
                                : clickable
                                ? labels.clickToMove
                                : labels.notAvailableYet
                            }
                          >
                            {caseActionLoadingId === c.case_id && clickable
                              ? tr("envola.closingTheLoop.actions.updating", "Updating…")
                              : prettyStatus(stage, tr)}
                          </button>
                        );
                      })}
                    </div>

                    {c.status === "closed" && (
                      <div className="mt-3 text-xs text-emerald-300">
                        {labels.closedHint}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

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

          <div className="relative max-h-[85vh] w-full max-w-3xl overflow-hidden rounded-3xl border border-white/10 bg-[#0B0F19] shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-white/5 px-6 py-4">
              <div className="font-semibold text-white">{labels.modalTitle}</div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-xl border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/15"
              >
                {labels.modalClose}
              </button>
            </div>

            <div className="max-h-[calc(85vh-72px)] overflow-y-auto p-6">
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
                      <div className="mt-2 break-all font-mono text-xs text-white">
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
                        className="inline-flex items-center rounded-2xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/15"
                      >
                        {labels.modalOpenIntercom}
                      </a>
                    </div>
                  )}

                  <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                    <div className="font-semibold text-white">{labels.modalOptions}</div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {Array.isArray(detail.selected_options) &&
                      detail.selected_options.length ? (
                        detail.selected_options.map((o) => (
                          <span key={o} className={chipClass()}>
                            {o}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-slate-400">{labels.dash}</span>
                      )}
                    </div>
                  </div>

                  <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                    <div className="font-semibold text-white">{labels.modalVerbatims}</div>

                    <div className="mt-4 space-y-4">
                      {(() => {
                        const groups = groupVerbatims(detail.verbatims);
                        if (!groups.length) {
                          return <div className="text-sm text-slate-400">{labels.dash}</div>;
                        }

                        return groups.map(([q, texts]) => (
                          <div
                            key={q}
                            className="rounded-2xl border border-white/10 bg-black/20 p-4"
                          >
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
                        right={`${sortedAnswers.length} ${labels.modalShown}`}
                        defaultOpen={false}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs text-slate-400">{labels.modalView}</span>

                            <button
                              type="button"
                              onClick={() => setRawView("relevant")}
                              className={
                                rawView === "relevant"
                                  ? "rounded-xl border border-indigo-500/25 bg-indigo-500/15 px-3 py-2 text-xs font-semibold text-indigo-100"
                                  : "rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-slate-200 hover:bg-white/5"
                              }
                            >
                              {labels.modalRelevantOnly}
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
                              {labels.modalAllQuestions}
                            </button>

                            {relevantQids.length ? (
                              <div className="ml-2 flex flex-wrap gap-2">
                                {relevantQids.map((qid) => (
                                  <Chip
                                    key={qid}
                                    tone="indigo"
                                    title={tr(
                                      "envola.closingTheLoop.modal.inferredRelevantQuestionId",
                                      "Inferred relevant question id"
                                    )}
                                  >
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
                            {labels.modalShowJson}
                          </label>
                        </div>

                        <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
                          {sortedAnswers.length ? (
                            <AnswerTable rows={sortedAnswers} compact={false} tr={tr} />
                          ) : (
                            <div className="text-sm text-slate-300">
                              {labels.modalNoAnswers}
                            </div>
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
