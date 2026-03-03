// src/pages/ClosingTheLoop.jsx
import React from "react";
import { useLanguage } from "../i18n/LanguageContext";
import { translations } from "../i18n/translations";

const DEFAULT_CONTENT_ID = "189616";

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
  // Group answers by (qid + question_text) so multi-select becomes one row with multiple values.
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
      .map((g) => ({ ...g, values: Array.from(new Set(g.values)) }))
      .sort((a, b) => {
        const ta = a.answered_at ? new Date(a.answered_at).getTime() : 0;
        const tb = b.answered_at ? new Date(b.answered_at).getTime() : 0;
        if (ta !== tb) return ta - tb;
        return (a.question_text || "").localeCompare(b.question_text || "");
      });
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

// Heuristic: guess which answer rows are “follow-ups”
// (keeps your modal readable without hardcoding qids)
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

  // Find the “main” scored question (first 0–10 score in answers)
  const firstScoredIdx = answers.findIndex((a) => toNum0to10(a?.response) != null);
  if (firstScoredIdx < 0) return [];

  const scoredQid = answers[firstScoredIdx]?.question_id != null ? String(answers[firstScoredIdx].question_id) : null;

  // Include the next 1–2 free-text answers as follow-ups (often “Pourquoi ?”, etc.)
  const followQids = [];
  for (let i = firstScoredIdx + 1; i < answers.length; i++) {
    const raw = answers[i]?.response;
    if (!isText(raw)) continue;
    if (toNum0to10(raw) != null) continue;
    const qid = answers[i]?.question_id != null ? String(answers[i].question_id) : null;
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
  return Array.from(out.entries()); // [ [question, [texts...]], ...]
}

export default function ClosingTheLoop() {
  const { lang } = useLanguage();
  const tr = (p, f) => translations(lang, p, f);

  const [contentId, setContentId] = React.useState(DEFAULT_CONTENT_ID);
  const [days, setDays] = React.useState(30);
  const [limit, setLimit] = React.useState(50);

  const [bucket, setBucket] = React.useState("all"); // all|detractor|passive|promoter
  const [sortBy, setSortBy] = React.useState("risk"); // risk|date|score

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [data, setData] = React.useState(null);

  // Modal state
  const [openId, setOpenId] = React.useState(null); // response_id
  const [detailLoading, setDetailLoading] = React.useState(false);
  const [detailError, setDetailError] = React.useState("");
  const [detail, setDetail] = React.useState(null);
  // Raw answers view (modal)
  const [rawView, setRawView] = React.useState("all"); // relevant | all
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

      // If the server returns 304, fetch will usually give you the cached body,
      // but some setups/proxies can behave oddly. We'll still handle it safely.
      const contentType = (r.headers.get("content-type") || "").toLowerCase();

      // Read body ONCE (then parse from the text)
      const rawText = await r.text().catch(() => "");

      // If it isn't JSON, give a helpful error (often login HTML)
      const looksLikeJson = rawText.trim().startsWith("{") || rawText.trim().startsWith("[");
      if (!contentType.includes("application/json") && !looksLikeJson) {
        const preview = rawText.slice(0, 220).replace(/\s+/g, " ").trim();
        throw new Error(
          `Expected JSON from ${url} but got "${contentType || "unknown content-type"}" (status ${r.status}). ` +
          `First chars: ${preview || "«empty body»"}`
        );
      }

      // Now parse JSON safely
      let j = null;
      try {
        j = rawText ? JSON.parse(rawText) : null;
      } catch (parseErr) {
        const preview = rawText.slice(0, 220).replace(/\s+/g, " ").trim();
        throw new Error(
          `JSON parse failed (status ${r.status}, content-type "${contentType || "unknown"}"). ` +
          `First chars: ${preview || "«empty body»"}`
        );
      }

      if (!r.ok || !j?.ok) {
        const msg = j?.error || `Request failed (${r.status})`;
        throw new Error(msg);
      }

      setData(j);
    } catch (e) {
      setData(null);
      setError(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }, [contentId, days, limit]);

  React.useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  const queue = React.useMemo(() => {
    const raw = Array.isArray(data?.queue) ? data.queue : [];

    const filtered =
      bucket === "all"
        ? raw
        : raw.filter((x) => String(x?.latest?.bucket || "") === bucket);

    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === "date") {
        const at = Date.parse(a?.latest?.submitted_at || "");
        const bt = Date.parse(b?.latest?.submitted_at || "");
        return (Number.isFinite(bt) ? bt : 0) - (Number.isFinite(at) ? at : 0);
      }
      if (sortBy === "score") {
        const as = typeof a?.latest?.score_0_10 === "number" ? a.latest.score_0_10 : -1;
        const bs = typeof b?.latest?.score_0_10 === "number" ? b.latest.score_0_10 : -1;
        return bs - as; // higher first
      }
      // risk (default)
      const ar = typeof a?.risk_score === "number" ? a.risk_score : -1;
      const br = typeof b?.risk_score === "number" ? b.risk_score : -1;
      return br - ar;
    });

    return sorted;
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
        const msg = j?.error || `Request failed (${r.status})`;
        throw new Error(msg);
      }

      setDetail(j.response || null);
    } catch (e) {
      setDetailError(String(e?.message || e));
      setDetail(null);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  // Escape closes modal
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
    "Action queue from recent NPS responses, prioritised by risk."
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

        <button
          type="button"
          onClick={fetchQueue}
          className="inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium
                     bg-white/10 hover:bg-white/15 text-white border border-white/10
                     transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#22C55E]/60"
          disabled={loading}
          title={labels.refresh}
        >
          {loading ? labels.refreshing : labels.refresh}
        </button>
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

      {/* Status */}
      {error && (
        <div className="mt-6 rounded-2xl border border-rose-400/20 bg-rose-500/10 p-4 text-rose-100">
          <div className="font-medium">{labels.errorTitle}</div>
          <div className="mt-1 text-sm opacity-90">{error}</div>
          <div className="mt-3 text-xs text-rose-100/80">
            {labels.notAuthHint.split("/private/login")[0]}
            <span className="font-mono">/private/login</span>.
          </div>
        </div>
      )}

      {!error && loading && (
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-slate-200">
          {labels.loadingQueue}
        </div>
      )}

      {!error && !loading && data && queue.length === 0 && (
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-slate-200">
          {labels.noResults}
        </div>
      )}

      {/* Table */}
      {!error && !loading && queue.length > 0 && (
        <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-[#0B0F19]/40">
          <div className="overflow-x-auto">
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
                </tr>
              </thead>

              <tbody className="divide-y divide-white/10">
                {queue.map((it) => {
                  const latest = it.latest || {};
                  const hasResponse = Boolean(it.response_id);
                  const themes =
                    Array.isArray(it.themes) && it.themes.length ? it.themes.join(", ") : labels.dash;

                  const score =
                    typeof latest.score_0_10 === "number" ? latest.score_0_10 : null;

                  const bucketKey = latest.bucket || (score != null ? scoreBucket(score) : null);

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
                            className="inline-flex items-center rounded-xl px-3 py-1.5 text-xs font-medium
                                       bg-white/10 hover:bg-white/15 text-white border border-white/10 transition"
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
                            className="inline-flex items-center rounded-xl px-3 py-1.5 text-xs font-medium
                                       bg-white/10 hover:bg-white/15 text-white border border-white/10 transition"
                          >
                            {labels.open}
                          </a>
                        ) : (
                          <span className="text-slate-500">{labels.dash}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="px-4 py-3 text-xs text-slate-400 border-t border-white/10">
            {tr("closingTheLoop.footer.showing", "Showing")}{" "}
            <span className="text-slate-200">{queue.length}</span>{" "}
            {tr("closingTheLoop.footer.items", "items")} ({labels.contentId}{" "}
            <span className="text-slate-200">{data?.content_id}</span>,{" "}
            <span className="text-slate-200">{data?.days}</span>{" "}
            {tr("closingTheLoop.footer.days", "days")})
          </div>
        </div>
      )}

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
              <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5">              <div className="font-semibold text-white">{labels.modalTitle}</div>
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
                  {/* Top summary */}
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

                  {/* Intercom link (if present) */}
                  {detail.intercom_contact_url && (
                    <div>
                      <a
                        href={detail.intercom_contact_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center rounded-2xl px-4 py-2 text-sm font-medium
                                   bg-white/10 hover:bg-white/15 text-white border border-white/10 transition"
                      >
                        {labels.modalOpenIntercom}
                      </a>
                    </div>
                  )}

                  {/* Selected options */}
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

                  {/* Verbatims */}
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

                  {/* Raw answers (readable) */}
                  {(() => {
                    const allAnswers = Array.isArray(detail?.answers) ? detail.answers : [];
                    const relevantQids = inferRelevantQuestionIds(detail);

                    const relevantAnswers = allAnswers.filter((a) => {
                      const qid = a?.question_id != null ? String(a.question_id) : "";
                      return relevantQids.includes(qid);
                    });

                    const answersToShow = rawView === "all" ? allAnswers : relevantAnswers;

                    return (
                      <Disclosure
                        title={labels.modalRaw}
                        right={`${answersToShow.length} shown`}
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
                                ? "rounded-xl border border-emerald-500/25 bg-emerald-500/15 px-3 py-2 text-xs font-semibold text-emerald-100"                                  : "rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-slate-200 hover:bg-white/5"
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
                          {answersToShow.length ? (
                            <AnswerTable rows={answersToShow} compact={false} />
                          ) : (
                            <div className="text-sm text-slate-300">No answers found.</div>
                          )}
                        </div>

                        {rawShowJson ? (
                          <pre className="mt-4 max-h-80 overflow-auto rounded-2xl border border-white/10 bg-black/30 p-4 text-xs text-slate-200">
                            {JSON.stringify(detail.answers || [], null, 2)}
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
