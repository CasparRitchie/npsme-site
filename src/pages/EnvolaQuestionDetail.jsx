import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import Seo from "../components/Seo";
import PageHeader from "../components/PageHeader";
import { useLanguage } from "../i18n/LanguageContext";
import { translations } from "../i18n/translations";
import { localizePath } from "../i18n/pathHelpers";

function prettyDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function IntercomContactPill({ id, url }) {
  if (!id) return null;

  if (url) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-900"
        title="Open contact in Intercom"
      >
        Intercom contact: {id}
      </a>
    );
  }

  return (
    <span
      className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs text-slate-200"
      title="Contact id (no Intercom URL provided by API)"
    >
      Intercom contact: {id}
    </span>
  );
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

/**
 * Concurrency-limited pool runner to avoid hammering your private endpoint.
 */
async function mapPool(items, concurrency, mapper) {
  const results = new Array(items.length);
  let idx = 0;

  async function worker() {
    while (idx < items.length) {
      const i = idx++;
      results[i] = await mapper(items[i], i);
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrency, items.length) },
    () => worker()
  );
  await Promise.all(workers);
  return results;
}

export default function EnvolaQuestionDetail() {
  const { questionId } = useParams();
  const location = useLocation();
  const { lang } = useLanguage();
  const tr = (p, f) => translations(lang, p, f);

  const CONTENT_ID = "189616";

  // Controls
  const [days, setDays] = useState(90);
  const [limit, setLimit] = useState(120);

  // Data state
  const [state, setState] = useState({
    loading: true,
    error: null,
    questionLabel: null,
    rows: [],
    followupsMap: {}, // inferred mapping: scoredQid -> [followupQid...]
  });

  // --- Helpers to safely parse JSON from private endpoints
  const fetchJson = async (url) => {
    const r = await fetch(url, { credentials: "include" });
    const t = await r.text();
    let j;
    try {
      j = JSON.parse(t);
    } catch {
      throw new Error(
        `Expected JSON from ${url} but got non-JSON (status ${r.status}). First chars: ${t
          .slice(0, 160)
          .replace(/\s+/g, " ")
          .trim()}`
      );
    }
    return { r, j };
  };

  const toNum0to10 = (v) => {
    const n = Number(v);
    if (!Number.isFinite(n)) return null;
    if (n < 0 || n > 10) return null;
    return n;
  };

  const isNonEmptyText = (v) => typeof v === "string" && v.trim().length >= 2;

  const answerQid = (a) =>
    a?.question_id != null ? String(a.question_id) : null;

  /**
   * Detect if an answer looks like a multi-select "option" rather than a free-text verbatim.
   *
   * Heuristic:
   * - If this question_id appears multiple times in the same response.answers, it’s almost certainly multi-select.
   * - If the raw text matches an item in resp.selected_options, treat it as an option.
   */
  const looksLikeOptionAnswer = ({
    qid,
    raw,
    qidCountInThisResponse,
    respSelectedOptions,
  }) => {
    if (!qid) return false;

    if (qidCountInThisResponse > 1) return true;

    const txt = typeof raw === "string" ? raw.trim() : "";
    if (
      txt &&
      Array.isArray(respSelectedOptions) &&
      respSelectedOptions.includes(txt)
    ) {
      return true;
    }

    return false;
  };

  /**
   * Infer "follow-up question" links from many responses.
   *
   * We infer links of the form:
   *   scored (0–10) question -> next question that is free-text (not numeric, not option)
   *
   * Output:
   *   { "612560": ["612565"], "612601": ["612602"], ... }
   */
  const inferFollowupsMap = (fullResponses) => {
    const pairCounts = new Map(); // key: `${prevQid}->${nextQid}` -> count
    const prevCounts = new Map(); // prevQid -> number of times it appeared with a next answer

    const bump = (m, k, by = 1) => m.set(k, (m.get(k) || 0) + by);

    for (const resp of fullResponses) {
      const answers = Array.isArray(resp?.answers) ? resp.answers : [];
      if (answers.length < 2) continue;

      // count occurrences of each qid within this response (helps detect multi-select)
      const qidCounts = {};
      for (const a of answers) {
        const qid = answerQid(a);
        if (!qid) continue;
        qidCounts[qid] = (qidCounts[qid] || 0) + 1;
      }

      const respSelectedOptions = Array.isArray(resp?.selected_options)
        ? resp.selected_options
        : [];

      for (let i = 0; i < answers.length - 1; i++) {
        const prev = answers[i];
        const next = answers[i + 1];

        const prevQid = answerQid(prev);
        const nextQid = answerQid(next);
        if (!prevQid || !nextQid) continue;

        const prevNum = toNum0to10(prev?.response);
        if (prevNum == null) continue; // prev must be scored 0–10

        const nextRaw = next?.response;

        // next must be free-text (not numeric)
        if (!isNonEmptyText(nextRaw)) continue;
        if (toNum0to10(nextRaw) != null) continue;

        // exclude option-y answers
        const nextLooksOption = looksLikeOptionAnswer({
          qid: nextQid,
          raw: nextRaw,
          qidCountInThisResponse: qidCounts[nextQid] || 0,
          respSelectedOptions,
        });
        if (nextLooksOption) continue;

        bump(prevCounts, prevQid, 1);
        bump(pairCounts, `${prevQid}->${nextQid}`, 1);
      }
    }

    const map = {};

    // thresholds: tuneable
    const MIN_SUPPORT = 3; // needs to appear at least 3 times
    const MIN_RATIO = 0.45; // and be >=45% of the time after that scored question

    const byPrev = new Map(); // prevQid -> [{nextQid, count, ratio}]
    for (const [k, count] of pairCounts.entries()) {
      const [prevQid, nextQid] = k.split("->");
      const denom = prevCounts.get(prevQid) || 0;
      const ratio = denom ? count / denom : 0;
      if (!byPrev.has(prevQid)) byPrev.set(prevQid, []);
      byPrev.get(prevQid).push({ nextQid, count, ratio });
    }

    for (const [prevQid, candidates] of byPrev.entries()) {
      const strong = candidates
        .filter((c) => c.count >= MIN_SUPPORT && c.ratio >= MIN_RATIO)
        .sort((a, b) => b.ratio - a.ratio || b.count - a.count);

      if (strong.length) {
        map[prevQid] = strong.slice(0, 2).map((c) => c.nextQid);
      }
    }

    return map;
  };

  /**
   * Extract per-question evidence from a single response, using inferred followups.
   */
  const extractRowForQuestion = (resp, targetQid, followupsMap) => {
    const answers = Array.isArray(resp?.answers) ? resp.answers : [];
    if (!answers.length) return null;

    // count qid occurrences within this response (for option detection)
    const qidCounts = {};
    for (const a of answers) {
      const qid = answerQid(a);
      if (!qid) continue;
      qidCounts[qid] = (qidCounts[qid] || 0) + 1;
    }

    const respSelectedOptions = Array.isArray(resp?.selected_options)
      ? resp.selected_options
      : [];

    const targetAnswers = answers.filter((a) => answerQid(a) === targetQid);
    if (!targetAnswers.length) return null;

    const questionLabel =
      targetAnswers.find((a) => a?.question_text)?.question_text || null;

    const isScoredQuestion = targetAnswers.some(
      (a) => toNum0to10(a?.response) != null
    );

    // Multi-select detection (strong signal): same qid appears multiple times in this response
    const isMultiSelectInThisResponse = (qidCounts[targetQid] || 0) > 1;

    const nums = [];
    const verbatims = [];
    const options = [];
    const optionAnswers = [];

    // Extract from target answers
    for (const a of targetAnswers) {
      const raw = a?.response;

      // Multi-select: treat string responses as options, not verbatims
      if (isMultiSelectInThisResponse && typeof raw === "string" && raw.trim()) {
        optionAnswers.push(raw.trim());
        continue;
      }

      const n = toNum0to10(raw);
      if (n != null) {
        nums.push(n);
        continue;
      }

      // selected_options (rarely on answer; keep defensively)
      if (Array.isArray(a?.selected_options)) {
        options.push(...a.selected_options.filter(Boolean));
      }

      // Direct free-text question (non-scored)
      if (!isScoredQuestion && isNonEmptyText(raw)) {
        const txt = String(raw).trim();
        const looksOption = looksLikeOptionAnswer({
          qid: targetQid,
          raw: txt,
          qidCountInThisResponse: qidCounts[targetQid] || 0,
          respSelectedOptions,
        });
        if (!looksOption) verbatims.push(txt);
      }
    }

    // If scored, verbatims come from inferred follow-up question ids
    if (isScoredQuestion) {
      const followIds = Array.isArray(followupsMap?.[targetQid])
        ? followupsMap[targetQid]
        : [];

      for (const fid of followIds) {
        const followAnswers = answers.filter((a) => answerQid(a) === String(fid));
        for (const fa of followAnswers) {
          const raw = fa?.response;
          if (!isNonEmptyText(raw)) continue;
          if (toNum0to10(raw) != null) continue;

          const txt = String(raw).trim();

          const looksOption = looksLikeOptionAnswer({
            qid: String(fid),
            raw: txt,
            qidCountInThisResponse: qidCounts[String(fid)] || 0,
            respSelectedOptions,
          });
          if (!looksOption) verbatims.push(txt);
        }
      }
    } else if (!isMultiSelectInThisResponse) {
      // If not scored and not multi-select, verbatims are direct text answers for target qid
      for (const a of targetAnswers) {
        const raw = a?.response;
        if (!isNonEmptyText(raw)) continue;
        if (toNum0to10(raw) != null) continue;

        const txt = String(raw).trim();

        const looksOption = looksLikeOptionAnswer({
          qid: targetQid,
          raw: txt,
          qidCountInThisResponse: qidCounts[targetQid] || 0,
          respSelectedOptions,
        });
        if (!looksOption) verbatims.push(txt);
      }
    }

    const uniqVerbatims = Array.from(new Set(verbatims)).filter(Boolean);

    return {
      response_id: resp?.response_id || null,
      questionLabel,
      submitted_at: resp?.submitted_at || resp?.created_at || resp?.updated_at || null,
      contact_id: resp?.contact_id || resp?.contact?.id || null,
      intercom_contact_url:
        resp?.intercom_contact_url || resp?.contact?.intercom_contact_url || null,
      bucket: resp?.bucket || null,
      score_0_10: resp?.score_0_10 ?? resp?.nps_score ?? resp?.score ?? null,
      numericAnswers: nums,
      verbatims: uniqVerbatims,
      selected_options: options,
      optionAnswers: Array.from(new Set(optionAnswers)).filter(Boolean),
      isScoredQuestion,
    };
  };

  // Fetch evidence for this question
  useEffect(() => {
    let cancelled = false;

    (async () => {
      setState((s) => ({ ...s, loading: true, error: null }));

      try {
        // 1) Get recent response_ids
        const listQs = new URLSearchParams({
          content_id: String(CONTENT_ID),
          days: String(days),
          limit: String(limit),
        });

        const listUrl = `/api/intercom/private/closing-the-loop?${listQs.toString()}`;
        const { r: listR, j: listJ } = await fetchJson(listUrl);

        if (!listR.ok || !listJ?.ok) {
          throw new Error(
            listJ?.error || `closing-the-loop failed (${listR.status})`
          );
        }

        const queue = Array.isArray(listJ.queue) ? listJ.queue : [];
        const responseIds = queue
          .map((x) => x?.response_id)
          .filter(Boolean)
          .slice(0, limit);

        if (!responseIds.length) {
          if (!cancelled) {
            setState({
              loading: false,
              error: null,
              questionLabel: null,
              rows: [],
              followupsMap: {},
            });
          }
          return;
        }

        // 2) Fetch each response (concurrency limited) -> keep FULL response payload
        const fullResponses = (
          await mapPool(responseIds, 6, async (responseId) => {
            const detailUrl = `/api/intercom/private/nps-response?response_id=${encodeURIComponent(
              responseId
            )}`;

            try {
              const { r: respR, j: respJ } = await fetchJson(detailUrl);
              if (!respR.ok || !respJ?.ok) return null;
              return respJ?.response || null;
            } catch {
              return null;
            }
          })
        ).filter(Boolean);

        // 3) Infer follow-ups once from this sample
        const followupsMap = inferFollowupsMap(fullResponses);

        // 4) Extract rows for the currently selected question
        const targetQid = String(questionId);
        const rows = fullResponses
          .map((resp) => extractRowForQuestion(resp, targetQid, followupsMap))
          .filter(Boolean);

        const bestLabel = rows.find((r) => r.questionLabel)?.questionLabel || null;

        if (!cancelled) {
          setState({
            loading: false,
            error: null,
            questionLabel: bestLabel,
            rows,
            followupsMap,
          });
        }
      } catch (e) {
        if (!cancelled) {
          setState({
            loading: false,
            error: String(e?.message || e),
            questionLabel: null,
            rows: [],
            followupsMap: {},
          });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [questionId, days, limit]);

  // Derived stats (scored)
  const stats = useMemo(() => {
    const allNums = state.rows.flatMap((r) => r.numericAnswers || []);
    const n = allNums.length;
    const sum = allNums.reduce((a, b) => a + b, 0);
    const avg = n ? Number((sum / n).toFixed(2)) : null;

    const dist = Array.from({ length: 11 }, (_, i) => ({ score: i, count: 0 }));
    allNums.forEach((v) => {
      if (v >= 0 && v <= 10) dist[v].count += 1;
    });

    const max = dist.reduce((m, d) => Math.max(m, d.count), 0);

    return { n, avg, dist, max };
  }, [state.rows]);

  // Derived stats (multi-select)
  const optionStats = useMemo(() => {
    const rowsWithOptions = state.rows.filter(
      (r) => (r.optionAnswers || []).length > 0
    );

    const respondentCount = rowsWithOptions.length;

    const counts = new Map(); // optionText -> count (respondents who selected it)
    for (const r of rowsWithOptions) {
      const uniq = new Set((r.optionAnswers || []).filter(Boolean));
      for (const opt of uniq) counts.set(opt, (counts.get(opt) || 0) + 1);
    }

    const items = Array.from(counts.entries())
      .map(([text, count]) => ({
        text,
        count,
        pct: respondentCount ? (count / respondentCount) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count);

    const max = items.reduce((m, x) => Math.max(m, x.count), 0);
    const totalSelections = rowsWithOptions.reduce(
      (s, r) => s + (r.optionAnswers?.length || 0),
      0
    );

    const avgSelections = respondentCount
      ? Number((totalSelections / respondentCount).toFixed(2))
      : null;

    return { respondentCount, totalSelections, avgSelections, items, max };
  }, [state.rows]);

  const mode = useMemo(() => {
    if (stats.n > 0) return "scored";
    if (optionStats.respondentCount > 0) return "multi";
    return "text";
  }, [stats.n, optionStats.respondentCount]);

  const followupIds = useMemo(() => {
    const qid = String(questionId);
    return Array.isArray(state.followupsMap?.[qid]) ? state.followupsMap[qid] : [];
  }, [state.followupsMap, questionId]);

  const sampleVerbatims = useMemo(() => {
    const out = [];
    for (const r of state.rows) {
      for (const v of r.verbatims || []) {
        out.push({
          text: v,
          submitted_at: r.submitted_at,
          contact_id: r.contact_id,
          intercom_contact_url: r.intercom_contact_url,
          score_0_10: r.score_0_10,
        });
      }
      if (out.length >= 30) break;
    }
    return out.slice(0, 30);
  }, [state.rows]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B0F19] via-[#0C1224] to-[#0B0F19] text-slate-200">
      <Seo
        path={location.pathname}
        lang={lang}
        title={tr("envola.qd.seoTitle", "Envola — Question detail | NPSme")}
        description={tr("envola.qd.seoDesc", "Question-level evidence and verbatims.")}
        altPaths={{ en: "/envola", fr: "/fr/exemple-envola" }}
      />

      <PageHeader iconLabel="NPS Me" tag={tr("envola.tag", "Client example / Envola")}>
        <div className="pt-4">
          <h1 className="text-3xl md:text-4xl font-semibold text-white">
            {tr("envola.qd.title", "Question detail")}
          </h1>

          <p className="mt-3 text-slate-300">
            {tr("envola.qd.questionId", "Question ID")}:{" "}
            <span className="text-white font-semibold">{questionId}</span>
          </p>

          {state.questionLabel ? (
            <p className="mt-2 text-slate-300">
              {tr("common.question", "Question")}:{" "}
              <span className="text-white font-semibold">{state.questionLabel}</span>
            </p>
          ) : null}

          {mode === "scored" && followupIds.length ? (
            <p className="mt-2 text-xs text-slate-400">
              Inferred follow-up question(s):{" "}
              <span className="text-slate-200">{followupIds.join(", ")}</span>
            </p>
          ) : null}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              to={localizePath("/envola", lang)}
              className="inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold bg-white/10 hover:bg-white/15 transition"
            >
              ← {tr("common.back", "Back")}
            </Link>

            <div className="ml-auto flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-400">
                {tr("common.window", "Window")}:
              </span>
              <select
                className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm"
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
              >
                <option value={30}>30d</option>
                <option value={90}>90d</option>
                <option value={180}>180d</option>
                <option value={365}>365d</option>
              </select>

              <span className="text-xs text-slate-400">
                {tr("common.sample", "Sample")}:
              </span>
              <select
                className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm"
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
              >
                <option value={60}>60</option>
                <option value={120}>120</option>
                <option value={160}>160</option>
                <option value={240}>240</option>
              </select>
            </div>
          </div>
        </div>
      </PageHeader>

      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
          {state.loading && (
            <p className="text-sm text-slate-300">{tr("common.loading", "Loading…")}</p>
          )}

          {!state.loading && state.error && (
            <p className="text-sm text-red-300">
              {tr("common.error", "Error")}: {state.error}
            </p>
          )}

          {!state.loading && !state.error && (
            <>
              {/* Empty state */}
              {state.rows.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-black/10 p-5 text-sm text-slate-300">
                  {tr(
                    "envola.qd.noRows",
                    "No answers found for this question in the selected window."
                  )}
                </div>
              ) : (
                <>
                  {/* Top stats */}
                  {mode === "scored" ? (
                    <div className="grid gap-4 md:grid-cols-3">
                      <StatCard
                        label={tr("common.count", "Count")}
                        value={stats.n}
                        sub={tr("envola.qd.countSub", "Numeric answers (0–10)")}
                      />
                      <StatCard
                        label={tr("common.avg", "Average")}
                        value={stats.avg == null ? "—" : stats.avg}
                        sub={tr("envola.qd.avgSub", "Mean score for this question")}
                      />
                      <StatCard
                        label={tr("envola.qd.sample", "Sample")}
                        value={`${days}d / ${limit}`}
                        sub={tr("envola.qd.sampleSub", "Window / response cap")}
                      />
                    </div>
                  ) : mode === "multi" ? (
                    <div className="grid gap-4 md:grid-cols-3">
                      <StatCard
                        label={tr("common.respondents", "Respondents")}
                        value={optionStats.respondentCount}
                        sub={tr(
                          "envola.qd.respondentsSub",
                          "Responses that selected at least one option"
                        )}
                      />
                      <StatCard
                        label={tr("envola.qd.avgSelections", "Avg selections")}
                        value={optionStats.avgSelections == null ? "—" : optionStats.avgSelections}
                        sub={tr(
                          "envola.qd.avgSelectionsSub",
                          "Average number of options selected per respondent"
                        )}
                      />
                      <StatCard
                        label={tr("envola.qd.sample", "Sample")}
                        value={`${days}d / ${limit}`}
                        sub={tr("envola.qd.sampleSub", "Window / response cap")}
                      />
                    </div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-3">
                      <StatCard
                        label={tr("common.count", "Count")}
                        value={state.rows.length}
                        sub={tr("envola.qd.textCountSub", "Responses with this question answered")}
                      />
                      <StatCard
                        label={tr("common.returned", "Returned")}
                        value={sampleVerbatims.length}
                        sub={tr("envola.qd.textReturnedSub", "Free-text answers shown below")}
                      />
                      <StatCard
                        label={tr("envola.qd.sample", "Sample")}
                        value={`${days}d / ${limit}`}
                        sub={tr("envola.qd.sampleSub", "Window / response cap")}
                      />
                    </div>
                  )}

                  {/* Multi-select options */}
                  {mode === "multi" ? (
                    <div className="mt-6 rounded-2xl border border-white/10 bg-black/10 p-5">
                      <div className="flex items-center justify-between gap-4">
                        <div className="text-sm font-semibold text-white">
                          {tr("envola.qd.options", "Selected options")}
                        </div>
                        <div className="text-xs text-slate-400">
                          {tr("common.respondents", "Respondents")}:{" "}
                          {optionStats.respondentCount} ·{" "}
                          {tr("common.selections", "Selections")}:{" "}
                          {optionStats.totalSelections}
                        </div>
                      </div>

                      {optionStats.items.length ? (
                        <div className="mt-4 grid gap-2">
                          {optionStats.items.map((d) => {
                            const pctWidth = optionStats.max
                              ? (d.count / optionStats.max) * 100
                              : 0;
                            return (
                              <div key={d.text} className="flex items-center gap-3">
                                <div
                                  className="w-64 text-xs text-slate-200 truncate"
                                  title={d.text}
                                >
                                  {d.text}
                                </div>
                                <div className="flex-1">
                                  <div className="h-3 rounded-full bg-white/10 overflow-hidden">
                                    <div
                                      className="h-3 bg-white/60"
                                      style={{ width: `${pctWidth}%` }}
                                    />
                                  </div>
                                </div>
                                <div className="w-20 text-right text-xs text-slate-300">
                                  {d.count}{" "}
                                  <span className="text-slate-500">
                                    ({d.pct.toFixed(0)}%)
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="mt-4 text-sm text-slate-300">
                          {tr(
                            "envola.qd.noOptions",
                            "No options found for this question in the selected window."
                          )}
                        </div>
                      )}
                    </div>
                  ) : null}

                  {/* Score distribution */}
                  {mode === "scored" ? (
                    <div className="mt-6 rounded-2xl border border-white/10 bg-black/10 p-5">
                      <div className="text-sm font-semibold text-white">
                        {tr("envola.qd.distribution", "Score distribution")}
                      </div>

                      <div className="mt-4 grid gap-2">
                        {stats.dist.map((d) => {
                          const pct = stats.max ? (d.count / stats.max) * 100 : 0;
                          return (
                            <div key={d.score} className="flex items-center gap-3">
                              <div className="w-8 text-xs text-slate-300">{d.score}</div>
                              <div className="flex-1">
                                <div className="h-3 rounded-full bg-white/10 overflow-hidden">
                                  <div
                                    className="h-3 bg-white/60"
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                              </div>
                              <div className="w-10 text-right text-xs text-slate-300">
                                {d.count}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}

                  {/* Verbatims (scored follow-ups or direct text questions) */}
                  <div className="mt-6 rounded-2xl border border-white/10 bg-black/10 p-5">
                    <div className="flex items-center justify-between gap-4">
                      <div className="text-sm font-semibold text-white">
                        {tr("envola.qd.verbatims", "Verbatims")}
                      </div>
                      <div className="text-xs text-slate-400">
                        {tr("common.returned", "Returned")}: {sampleVerbatims.length}
                      </div>
                    </div>

                    {sampleVerbatims.length ? (
                      <div className="mt-4 space-y-3">
                        {sampleVerbatims.map((v, idx) => (
                          <div
                            key={`${v.submitted_at || "x"}-${idx}`}
                            className="rounded-2xl border border-white/10 bg-black/20 p-4"
                          >
                            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
                              {v.score_0_10 != null ? (
                                <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1">
                                  Score: {v.score_0_10}/10
                                </span>
                              ) : null}
                              <span className="text-slate-400">{prettyDate(v.submitted_at)}</span>

                              {v.contact_id ? (
                                <IntercomContactPill
                                  id={v.contact_id}
                                  url={v.intercom_contact_url}
                                />
                              ) : null}
                            </div>

                            <p className="mt-3 text-sm text-slate-200 leading-relaxed">
                              “{v.text}”
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="mt-4 text-sm text-slate-300">
                        {mode === "scored"
                          ? tr(
                              "envola.qd.noVerbatimsScored",
                              "This is a scored (0–10) question. Free-text comments usually appear in follow-up questions (e.g. “Pourquoi ?”). None were found in this window."
                            )
                          : mode === "multi"
                          ? tr(
                              "envola.qd.noVerbatimsMulti",
                              "This is a multi-select question. Any free-text comments typically appear in separate follow-up questions. None were found in this window."
                            )
                          : tr(
                              "envola.qd.noVerbatims",
                              "No free-text answers found for this question in the selected window."
                            )}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 text-xs text-slate-400">
                    {tr(
                      "envola.qd.note",
                      "This view is built from raw Intercom survey answers (private endpoints, login required)."
                    )}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
