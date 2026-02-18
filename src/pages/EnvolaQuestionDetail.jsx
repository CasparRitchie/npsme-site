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

  // Fetch evidence for this question
  useEffect(() => {
    let cancelled = false;

    (async () => {
      setState((s) => ({ ...s, loading: true, error: null }));

      try {
        // 1) Get recent response_ids (same basis as your QA calculation)
        const listQs = new URLSearchParams({
          content_id: String(CONTENT_ID),
          days: String(days),
          limit: String(limit),
        });

        const listUrl = `/api/intercom/private/closing-the-loop?${listQs.toString()}`;
        const { r: listR, j: listJ } = await fetchJson(listUrl);

        if (!listR.ok || !listJ?.ok) {
          throw new Error(listJ?.error || `closing-the-loop failed (${listR.status})`);
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
            });
          }
          return;
        }

        // 2) Fetch each response (concurrency limited)
        const items = await mapPool(responseIds, 6, async (responseId) => {
          const detailUrl = `/api/intercom/private/nps-response?response_id=${encodeURIComponent(
            responseId
          )}`;

          try {
            const { r: respR, j: respJ } = await fetchJson(detailUrl);
            if (!respR.ok || !respJ?.ok) return null;

            const resp = respJ?.response || {};
            const answers = Array.isArray(resp?.answers) ? resp.answers : [];

            // Match by question_id primarily, fallback to question_text match
            const matched = answers.filter((a) => {
              const qid = a?.question_id != null ? String(a.question_id) : null;
              if (qid && qid === String(questionId)) return true;

              // Optional fallback: if your route ever uses encoded question text
              const qt = (a?.question_text || "").trim();
              if (qt && decodeURIComponent(String(questionId)) === qt) return true;

              return false;
            });

            if (!matched.length) return null;

            // Collect evidence from ALL matched answers in this response
            const nums = [];
            const verbatims = [];
            const options = [];

            matched.forEach((a) => {
              const n = toNum0to10(a?.response);
              if (n != null) nums.push(n);

              // Some answers may carry free-text (depending on your payload shape)
              const txt = a?.text || a?.verbatim || a?.comment || null;
              if (txt && String(txt).trim()) verbatims.push(String(txt).trim());

              // Some answers may carry selected options
              if (Array.isArray(a?.selected_options)) {
                options.push(...a.selected_options.filter(Boolean));
              }
            });

            // Best-guess metadata (defensive)
            const questionLabel =
              matched.find((a) => a?.question_text)?.question_text || null;

            return {
              response_id: responseId,
              questionLabel,
              submitted_at:
                resp?.submitted_at ||
                resp?.created_at ||
                resp?.updated_at ||
                null,
              contact_id: resp?.contact_id || resp?.contact?.id || null,
              intercom_contact_url:
                resp?.intercom_contact_url ||
                resp?.contact?.intercom_contact_url ||
                null,
              bucket: resp?.bucket || null,
              score_0_10:
                resp?.score_0_10 ??
                resp?.nps_score ??
                resp?.score ??
                null,
              numericAnswers: nums,
              verbatims,
              selected_options: options,
            };
          } catch {
            return null;
          }
        });

        const rows = items.filter(Boolean);

        // Choose best label we saw
        const bestLabel =
          rows.find((r) => r.questionLabel)?.questionLabel || null;

        if (!cancelled) {
          setState({
            loading: false,
            error: null,
            questionLabel: bestLabel,
            rows,
          });
        }
      } catch (e) {
        if (!cancelled) {
          setState({
            loading: false,
            error: String(e?.message || e),
            questionLabel: null,
            rows: [],
          });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [questionId, days, limit]);

  // Derived stats
  const stats = useMemo(() => {
    const allNums = state.rows.flatMap((r) => r.numericAnswers || []);
    const n = allNums.length;
    const sum = allNums.reduce((a, b) => a + b, 0);
    const avg = n ? Number((sum / n).toFixed(2)) : null;

    const dist = Array.from({ length: 11 }, (_, i) => ({
      score: i,
      count: 0,
    }));
    allNums.forEach((v) => {
      if (v >= 0 && v <= 10) dist[v].count += 1;
    });

    const max = dist.reduce((m, d) => Math.max(m, d.count), 0);

    return { n, avg, dist, max };
  }, [state.rows]);

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

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              to={localizePath("/envola", lang)}
              className="inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold bg-white/10 hover:bg-white/15 transition"
            >
              ← {tr("common.back", "Back")}
            </Link>

            <div className="ml-auto flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-400">{tr("common.window", "Window")}:</span>
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

              <span className="text-xs text-slate-400">{tr("common.sample", "Sample")}:</span>
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
              {stats.n === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-black/10 p-5 text-sm text-slate-300">
                  {tr(
                    "envola.qd.noData",
                    "No numeric answers found for this question in the selected window."
                  )}
                </div>
              ) : (
                <>
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

                  {/* Simple distribution chart */}
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

                  {/* Verbatims */}
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
                        {tr(
                          "envola.qd.noVerbatims",
                          "No free-text verbatims found for this question in the selected window."
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
