// src/pages/EnvolaPerformance.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import Seo from "../components/Seo";
import PageHeader from "../components/PageHeader";
import NpsTimeseriesChart from "../components/NpsTimeseriesChart";
import NpsBucketStackedColumns from "../components/NpsBucketStackedColumns";
import WordCloud from "../components/WordCloud";
import { useLanguage } from "../i18n/LanguageContext";
import { translations } from "../i18n/translations";
import EnvolaWorkspaceNav from "../components/EnvolaWorkspaceNav";

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

function todayYmdLocal() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function daysAgoYmd(days) {
  const d = new Date();
  d.setDate(d.getDate() - Number(days || 90));
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function StatCard({ label, value, sub, compact = false }) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-black/10 ${
        compact ? "p-4" : "p-5"
      }`}
    >
      <div className={`${compact ? "text-[11px]" : "text-xs"} text-slate-400`}>
        {label}
      </div>
      <div
        className={`font-semibold text-white ${
          compact ? "mt-1 text-2xl leading-none" : "mt-2 text-3xl"
        }`}
      >
        {value}
      </div>
      {sub ? (
        <div className={`${compact ? "mt-2 text-xs" : "mt-2 text-sm"} text-slate-300`}>
          {sub}
        </div>
      ) : null}
    </div>
  );
}


function useEnvolaFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo(() => {
    const mode = searchParams.get("mode") || "rolling";
    const days = Number(searchParams.get("days") || 90);
    const from = searchParams.get("from") || daysAgoYmd(90);
    const to = searchParams.get("to") || todayYmdLocal();
    const granularity = searchParams.get("granularity") || "week";
    const bucket = searchParams.get("bucket") || "all";
    const contentId = searchParams.get("content_id") || DEFAULT_CONTENT_ID;

    return {
      mode,
      days,
      from,
      to,
      granularity,
      bucket,
      contentId,
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

function bucketLabel(bucket, tr) {
  if (bucket === "promoter") return tr("envola.filters.promoters", "Promoters");
  if (bucket === "passive") return tr("envola.filters.passives", "Passives");
  if (bucket === "detractor") return tr("envola.filters.detractors", "Detractors");
  return tr("envola.filters.all", "All");
}

function bucketPillClass(bucket) {
  if (bucket === "promoter") {
    return "border-emerald-400/30 bg-emerald-500/10 text-emerald-200";
  }
  if (bucket === "passive") {
    return "border-amber-400/30 bg-amber-500/10 text-amber-200";
  }
  if (bucket === "detractor") {
    return "border-rose-400/30 bg-rose-500/10 text-rose-200";
  }
  return "border-white/10 bg-white/5 text-slate-200";
}

function IntercomContactLink({ url, label }) {
  if (!url) return null;

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-200 hover:bg-white/10"
    >
      {label}
    </a>
  );
}

export default function EnvolaPerformance() {
  const location = useLocation();
  const { lang } = useLanguage();
  const tr = (p, f) => translations(lang, p, f);
  const { filters, updateFilters } = useEnvolaFilters();

  const [trend, setTrend] = useState({ loading: true, data: null, error: null });
  const [summary, setSummary] = useState({ loading: true, data: null, error: null });
  const [rate, setRate] = useState({ loading: true, data: null, error: null });
  const [themes, setThemes] = useState({ loading: true, data: null, error: null });
  const [comments, setComments] = useState({ loading: true, data: null, error: null });
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [bucketResponses, setBucketResponses] = useState({ loading: false, data: null, error: null });
  const [diagnostics, setDiagnostics] = useState({ loading: true, data: null, error: null });
  const [showAllResponsesModal, setShowAllResponsesModal] = useState(false);
  const navAnchorRef = useRef(null);
  const [isNavPinned, setIsNavPinned] = useState(false);

  const dateParams = useMemo(() => {
    if (filters.mode === "range") {
      return `from=${encodeURIComponent(filters.from)}&to=${encodeURIComponent(filters.to)}`;
    }
    return `days=${encodeURIComponent(filters.days)}`;
  }, [filters.mode, filters.from, filters.to, filters.days]);

  const bucketParams = useMemo(() => {
    if (!filters.bucket || filters.bucket === "all") return "";
    return `&bucket=${encodeURIComponent(filters.bucket)}`;
  }, [filters.bucket]);

  const trendUrl = useMemo(() => {
    return `/api/envola/timeseries?content_id=${encodeURIComponent(
      filters.contentId
    )}&granularity=${encodeURIComponent(filters.granularity)}&${dateParams}${bucketParams}`;
  }, [filters.contentId, filters.granularity, dateParams, bucketParams]);

  useEffect(() => {
    let cancelled = false;
    setTrend({ loading: true, data: null, error: null });
    (async () => {
      try {
        const r = await fetch(trendUrl);
        const j = await r.json();
        if (!cancelled) {
          setTrend({
            loading: false,
            data: j,
            error: r.ok ? null : j?.error || tr("envola.common.error", "Error"),
          });
        }
      } catch (e) {
        if (!cancelled) {
          setTrend({ loading: false, data: null, error: e.message });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [trendUrl]);

  useEffect(() => {
    let cancelled = false;

    setSummary({ loading: true, data: null, error: null });

    (async () => {
      try {
        const r = await fetch(
          `/api/envola/summary?content_id=${encodeURIComponent(
            filters.contentId
          )}&${dateParams}${bucketParams}`
        );
        const j = await r.json();
        if (!cancelled) {
          setSummary({
            loading: false,
            data: j,
            error: r.ok ? null : j?.error || tr("envola.common.error", "Error"),
          });
        }
      } catch (e) {
        if (!cancelled) {
          setSummary({ loading: false, data: null, error: e.message });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [filters.contentId, dateParams, bucketParams]);

  useEffect(() => {
    let cancelled = false;

    setRate({ loading: true, data: null, error: null });

    (async () => {
      try {
        const r = await fetch(
          `/api/envola/response-rate?content_id=${encodeURIComponent(
            filters.contentId
          )}&${dateParams}`
        );
        const j = await r.json();
        if (!cancelled) {
          setRate({
            loading: false,
            data: j,
            error: r.ok ? null : j?.error || tr("envola.common.error", "Error"),
          });
        }
      } catch (e) {
        if (!cancelled) {
          setRate({ loading: false, data: null, error: e.message });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [filters.contentId, dateParams]);

  useEffect(() => {
    let cancelled = false;

    setThemes({ loading: true, data: null, error: null });

    (async () => {
      try {
        const r = await fetch(
          `/api/envola/themes?content_id=${encodeURIComponent(
            filters.contentId
          )}&${dateParams}${bucketParams}`
        );
        const j = await r.json();
        if (!cancelled) {
          setThemes({
            loading: false,
            data: j,
            error: r.ok ? null : j?.error || tr("envola.common.error", "Error"),
          });
        }
      } catch (e) {
        if (!cancelled) {
          setThemes({ loading: false, data: null, error: e.message });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [filters.contentId, dateParams, bucketParams]);

  useEffect(() => {
    let cancelled = false;

    setComments({ loading: true, data: null, error: null });

    (async () => {
      try {
        const r = await fetch(
          `/api/envola/comments?content_id=${encodeURIComponent(
            filters.contentId
          )}&${dateParams}&limit=80${bucketParams}`
        );
        const j = await r.json();
        if (!cancelled) {
          setComments({
            loading: false,
            data: j,
            error: r.ok ? null : j?.error || tr("envola.common.error", "Error"),
          });
        }
      } catch (e) {
        if (!cancelled) {
          setComments({ loading: false, data: null, error: e.message });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [filters.contentId, dateParams, bucketParams]);

  useEffect(() => {
    let cancelled = false;

    setDiagnostics({ loading: true, data: null, error: null });

    (async () => {
      try {
        const r = await fetch(
          `/api/envola/diagnostics?content_id=${encodeURIComponent(filters.contentId)}`,
          { credentials: "include" }
        );
        const j = await r.json();

        if (!cancelled) {
          setDiagnostics({
            loading: false,
            data: j,
            error: r.ok ? null : j?.error || tr("envola.common.error", "Error"),
          });
        }
      } catch (e) {
        if (!cancelled) {
          setDiagnostics({
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
  }, [filters.contentId]);

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

  async function loadBucketResponses(point) {
    console.log("Clicked point:", point);
    setSelectedPoint(point);
    setBucketResponses({ loading: true, data: null, error: null });

    try {
      const r = await fetch(
        `/api/envola/responses-for-point?content_id=${encodeURIComponent(
          filters.contentId
        )}&granularity=${encodeURIComponent(filters.granularity)}&date=${encodeURIComponent(
          point.date
        )}&limit=200${bucketParams}`
      );
      const j = await r.json();

      console.log("responses-for-point status:", r.status);
      console.log("responses-for-point json:", j);

      setBucketResponses({
        loading: false,
        data: j,
        error: r.ok ? null : j?.error || tr("envola.common.error", "Error"),
      });
    } catch (e) {
      setBucketResponses({ loading: false, data: null, error: e.message });
    }
  }

  const trendPoints = useMemo(() => {
    return Array.isArray(trend.data?.points) ? trend.data.points : [];
  }, [trend.data]);

  const trendTotals = useMemo(() => {
    if (!trendPoints.length) return null;
    const totalResponses = trendPoints.reduce((acc, p) => acc + (p.responses || 0), 0);
    const last = trendPoints[trendPoints.length - 1];
    return {
      totalResponses,
      lastNps: last?.nps ?? null,
      lastDate: last?.date ?? null,
    };
  }, [trendPoints]);

  const wordCloudTexts = useMemo(() => {
    const arr = Array.isArray(comments.data?.comments) ? comments.data.comments : [];
    return arr.map((c) => c.comment).filter(Boolean);
  }, [comments.data]);

  const activeWindowLabel =
    filters.mode === "range"
      ? `${filters.from} → ${filters.to}`
      : `${filters.days}d`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B0F19] via-[#0C1224] to-[#0B0F19] text-slate-200">
      <Seo
        path={location.pathname}
        lang={lang}
        title={tr("envola.performance.seoTitle", "Envola — Performance | NPS Me")}
        description={tr(
          "envola.performance.seoDesc",
          "Private Envola performance dashboard with consistent global filters."
        )}
      />

      <PageHeader iconLabel="NPS Me" tag={tr("envola.tag", "Client workspace / Envola")}>
        <div className="pt-4">
          <h1 className="text-3xl md:text-4xl font-semibold text-white">
            {tr("envola.performance.title", "Envola — Performance")}
          </h1>

          <p className="mt-3 max-w-3xl text-slate-300">
            {tr(
              "envola.performance.subtitle",
              "Consolidated view of NPS programme performance, with global filters applied to all KPIs and charts."
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
                {tr("envola.filters.title", "Filtres globaux")}
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                {tr(
                  "envola.filters.subtitle",
                  "Ces filtres s’appliquent à toute la page : KPI, tendances, thèmes et commentaires."
                )}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-6">
            <div>
              <label className="text-xs text-slate-400">
                {tr("envola.filters.mode", "Mode")}
              </label>
              <select
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white"
                value={filters.mode}
                onChange={(e) => updateFilters({ mode: e.target.value })}
              >
                <option value="rolling">{tr("envola.filters.rolling", "Rolling")}</option>
                <option value="range">{tr("envola.filters.range", "Date range")}</option>
              </select>
            </div>

            {filters.mode === "rolling" ? (
              <div>
                <label className="text-xs text-slate-400">
                  {tr("common.window", "Window")}
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
            ) : (
              <>
                <div>
                  <label className="text-xs text-slate-400">
                    {tr("common.from", "From")}
                  </label>
                  <input
                    type="date"
                    className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white"
                    value={filters.from}
                    onChange={(e) => updateFilters({ from: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400">
                    {tr("common.to", "To")}
                  </label>
                  <input
                    type="date"
                    className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white"
                    value={filters.to}
                    onChange={(e) => updateFilters({ to: e.target.value })}
                  />
                </div>
              </>
            )}

            <div>
              <label className="text-xs text-slate-400">
                {tr("envola.trend.granularity", "Granularity")}
              </label>
              <select
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white"
                value={filters.granularity}
                onChange={(e) => updateFilters({ granularity: e.target.value })}
              >
                <option value="day">{tr("common.day", "Day")}</option>
                <option value="week">{tr("common.week", "Week")}</option>
                <option value="month">{tr("common.month", "Month")}</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-400">
                {tr("common.bucket", "Bucket")}
              </label>
              <select
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white"
                value={filters.bucket}
                onChange={(e) => updateFilters({ bucket: e.target.value })}
              >
                <option value="all">{tr("envola.filters.all", "All")}</option>
                <option value="promoter">{tr("envola.filters.promoters", "Promoters")}</option>
                <option value="passive">{tr("envola.filters.passives", "Passives")}</option>
                <option value="detractor">{tr("envola.filters.detractors", "Detractors")}</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-400">
                {tr("envola.common.contentId", "content_id")}
              </label>
              <input
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white"
                value={filters.contentId}
                onChange={(e) => updateFilters({ content_id: e.target.value })}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-8">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            compact
            label={tr("envola.performance.kpiNps", "NPS")}
            value={
              summary.loading
                ? "…"
                : summary.data?.nps == null
                ? "—"
                : summary.data.nps
            }
            sub={[
              `${tr("common.window", "Window")}: ${activeWindowLabel}`,
              filters.bucket !== "all"
                ? `${tr("common.bucket", "Bucket")}: ${bucketLabel(filters.bucket, tr)}`
                : null,
            ]
              .filter(Boolean)
              .join(" • ")}
          />

          <StatCard
            compact
            label={tr("envola.live.responses", "Responses")}
            value={
              diagnostics.loading
                ? "…"
                : diagnostics.data?.total_canonical_rows == null
                ? "—"
                : diagnostics.data.total_canonical_rows
            }
            sub={
              diagnostics.loading
                ? tr("common.loading", "Loading…")
                : diagnostics.data
                ? `${diagnostics.data.raw_events_matching_content ?? "—"} ${tr(
                    "envola.diagnostics.intercomCompletionEvents",
                    "Intercom completion events"
                  )} • ${diagnostics.data.dedupe_removed ?? "—"} ${tr(
                    "envola.common.duplicatesRemovedSuffix",
                    "duplicates removed"
                  )}`
                : tr("envola.live.responsesSub", "Survey completions")
            }
          />

          <StatCard
            compact
            label={tr("envola.metrics.responseRate", "Response rate")}
            value={
              rate.loading
                ? "…"
                : rate.data?.response_rate_pct == null
                ? "—"
                : `${rate.data.response_rate_pct}%`
            }
            sub={[
              tr("envola.metrics.responseRateSub", "Completed ÷ shown"),
              `${tr("common.window", "Window")}: ${activeWindowLabel}`,
            ].join(" • ")}
          />

          <StatCard
            compact
            label={tr("envola.metrics.medianCompletion", "Median completion")}
            value={
              rate.loading
                ? "…"
                : rate.data?.median_time_to_completion || "—"
            }
            sub={
              rate.data?.median_time_to_first_answer
                ? `${tr("envola.metrics.firstAnswer", "First answer")}: ${rate.data.median_time_to_first_answer}`
                : tr("envola.metrics.firstAnswerFallback", "First answer: —")
            }
          />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-8">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 md:p-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-xl md:text-2xl font-semibold text-white">
                {tr("envola.diagnostics.title", "Survey diagnostics")}
              </h2>
              <p className="mt-2 text-sm text-slate-300">
                {tr(
                  "envola.diagnostics.subtitle",
                  "Reconciliation between raw Intercom completion events and the deduplicated response dataset used by this page."
                )}
              </p>
            </div>
          </div>

          {diagnostics.loading && (
            <p className="mt-6 text-sm text-slate-300">{tr("common.loading", "Loading…")}</p>
          )}

          {!diagnostics.loading && diagnostics.error && (
            <p className="mt-6 text-sm text-red-300">
              {tr("envola.common.error", "Error")}: {diagnostics.error}
            </p>
          )}

          {!diagnostics.loading && !diagnostics.error && diagnostics.data && (
            <>
              <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                <StatCard
                  compact
                  label={tr("envola.diagnostics.rawCompletionEvents", "Raw completion events")}
                  value={diagnostics.data.raw_events_matching_content ?? "—"}
                />
                <StatCard
                  compact
                  label={tr("envola.diagnostics.uniqueResponses", "Unique responses")}
                  value={diagnostics.data.total_canonical_rows ?? "—"}
                />
                <StatCard
                  compact
                  label={tr("envola.diagnostics.duplicatesRemoved", "Duplicates removed")}
                  value={diagnostics.data.dedupe_removed ?? "—"}
                />
                <StatCard
                  compact
                  label={tr("envola.diagnostics.scoredResponses", "Scored responses")}
                  value={diagnostics.data.total_scored_rows ?? "—"}
                />
                <StatCard
                  compact
                  label={tr("envola.diagnostics.missingScores", "Missing scores")}
                  value={diagnostics.data.missing_score_total ?? "—"}
                />
              </div>

              <div className="mt-4 rounded-2xl border border-white/10 bg-black/10 px-4 py-3 text-sm text-slate-300">
                {tr("envola.diagnostics.latestResponse", "Latest response")}:{" "}
                <span className="font-medium text-white">
                  {prettyDate(diagnostics.data.latest_submitted_at)}
                </span>
              </div>
            </>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-10">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-xl md:text-2xl font-semibold text-white">
                {tr("envola.timeseries.title", "NPS over time")}
              </h2>
              <p className="mt-2 text-sm text-slate-300">
                {tr(
                  "envola.timeseries.subtitle",
                  "Tous les points ci-dessous utilisent les mêmes filtres globaux."
                )}
              </p>
            </div>
          </div>

          {trend.loading && (
            <p className="mt-6 text-sm text-slate-300">{tr("common.loading", "Loading…")}</p>
          )}
          {!trend.loading && trend.error && (
            <p className="mt-6 text-sm text-red-300">
              {tr("envola.common.error", "Error")}: {trend.error}
            </p>
          )}

          {!trend.loading && !trend.error && trendPoints.length > 0 && (
            <>
              <div className="mt-6 h-72 w-full min-w-0">
                <NpsTimeseriesChart
                  points={trendPoints}
                  granularity={filters.granularity}
                  onPointClick={loadBucketResponses}
                />
              </div>

              <div className="mt-6 grid gap-3 md:grid-cols-3">
                <StatCard
                  compact
                  label={tr("envola.trend.totalResponses", "Responses in period")}
                  value={trendTotals?.totalResponses ?? "—"}
                />
                <StatCard
                  compact
                  label={tr("envola.trend.latestNps", "Latest NPS point")}
                  value={trendTotals?.lastNps == null ? "—" : trendTotals.lastNps}
                  sub={
                    trendTotals?.lastDate
                      ? `${tr("envola.trend.asOf", "As of")} ${trendTotals.lastDate}`
                      : null
                  }
                />
                <StatCard
                  compact
                  label={tr("envola.trend.points", "Data points")}
                  value={trendPoints.length}
                />
              </div>
            </>
          )}
        </div>
      </section>

      {selectedPoint && (
        <section className="mx-auto max-w-7xl px-6 pb-20">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div className="text-sm text-slate-200">
                <span className="text-slate-400">{tr("common.selected", "Selected")}:</span>{" "}
                <span className="font-semibold text-white">{selectedPoint.date}</span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedPoint(null);
                  setBucketResponses({ loading: false, data: null, error: null });
                }}
                className="text-sm text-slate-300 hover:text-white"
              >
                {tr("common.close", "Close")}
              </button>
            </div>

            {bucketResponses.loading && (
              <p className="mt-4 text-sm text-slate-300">{tr("common.loading", "Loading…")}</p>
            )}
            {!bucketResponses.loading && bucketResponses.error && (
              <p className="mt-6 text-sm text-red-300">
                {tr("envola.common.error", "Error")}: {bucketResponses.error}
              </p>
            )}

            {!bucketResponses.loading && bucketResponses.data?.ok && (
              <>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <div className="text-sm text-slate-300">
                    {bucketResponses.data.returned ?? bucketResponses.data.rows?.length ?? 0}{" "}
                    {tr("envola.responsesPanel.count", "response(s)")}
                  </div>

                  {(bucketResponses.data.rows?.length || 0) > 3 ? (
                    <button
                      type="button"
                      onClick={() => setShowAllResponsesModal(true)}
                      className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 hover:bg-white/10"
                    >
                      {tr("envola.responsesPanel.viewAll", "View all")}
                    </button>
                  ) : null}
                </div>

                <div className="mt-4 max-h-[560px] space-y-3 overflow-y-auto pr-2">
                  {(bucketResponses.data.rows || []).map((r) => (
                    <div
                      key={r.response_id || `${r.submitted_at}-${r.contact_id}`}
                      className="rounded-2xl border border-white/10 bg-black/20 p-4"
                    >
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
                        <span
                          className={`inline-flex items-center rounded-full border px-2 py-1 ${bucketPillClass(
                            r.score_0_10 >= 9 ? "promoter" : r.score_0_10 >= 7 ? "passive" : "detractor"
                          )}`}
                        >
                          {bucketLabel(
                            r.score_0_10 >= 9 ? "promoter" : r.score_0_10 >= 7 ? "passive" : "detractor",
                            tr
                          )}{" "}
                          • {r.score_0_10}/10
                        </span>
                        <span className="text-slate-400">{prettyDate(r.submitted_at)}</span>

                        <IntercomContactLink
                          url={r.intercom_contact_url}
                          label={tr("envola.comments.openContact", "Open contact")}
                        />
                      </div>

                      {Array.isArray(r.verbatims) && r.verbatims.length > 0 ? (
                        <div className="mt-3 space-y-2">
                          {r.verbatims.slice(0, 6).map((v, idx) => (
                            <div key={idx}>
                              {v.question_text ? (
                                <div className="text-xs text-slate-400">{v.question_text}</div>
                              ) : null}
                              <div className="text-sm leading-relaxed text-slate-200">
                                “{v.text}”
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="mt-3 text-sm text-slate-400">
                          {tr("envola.responses.none", "No verbatims stored for this response.")}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-6 pb-10">
        <NpsBucketStackedColumns
          points={trendPoints}
          height={220}
          maxBars={36}
          title={tr("envola.top.splitTitle", "Score split over time")}
          subtitle={tr(
            "envola.top.splitSubtitle",
            "Répartition promoteurs / passifs / détracteurs avec les mêmes filtres globaux."
          )}
        />
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-10">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-xl md:text-2xl font-semibold text-white">
                {tr("envola.themes.title", "Themes in comments")}
              </h2>
              <p className="mt-2 text-sm text-slate-300">
                {tr(
                  "envola.themes.subtitle",
                  "Vue synthétique des thèmes détectés dans les commentaires."
                )}
              </p>
            </div>
          </div>

          {themes.loading && (
            <p className="mt-6 text-sm text-slate-300">{tr("common.loading", "Loading…")}</p>
          )}
          {!themes.loading && themes.error && (
            <p className="mt-6 text-sm text-red-300">
              {tr("envola.common.error", "Error")}: {themes.error}
            </p>
          )}

          {!themes.loading && !themes.error && (
            <>
              {!Array.isArray(themes.data?.themes) || themes.data.themes.length === 0 ? (
                <div className="mt-6 rounded-2xl border border-white/10 bg-black/10 p-5 text-sm text-slate-300">
                  {tr("envola.themes.noThemes", "No themes detected for this filter set.")}
                </div>
              ) : (
                <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
                  <table className="w-full border-collapse">
                    <thead className="bg-white/5">
                      <tr className="text-left text-xs text-slate-300">
                        <th className="px-4 py-3">{tr("common.theme", "Theme")}</th>
                        <th className="px-4 py-3">{tr("common.mentions", "Mentions")}</th>
                        <th className="px-4 py-3">{tr("common.avg", "Average")}</th>
                        <th className="px-4 py-3">{tr("envola.themes.detrShare", "Detractor share")}</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {themes.data.themes.map((t) => (
                        <tr key={t.theme} className="border-t border-white/10">
                          <td className="px-4 py-3 text-white">{t.theme}</td>
                          <td className="px-4 py-3 text-slate-200">{t.mentions}</td>
                          <td className="px-4 py-3 text-slate-200">{t.avg_score ?? "—"}</td>
                          <td className="px-4 py-3 text-slate-200">
                            {t.share_of_detractor_mentions == null
                              ? "—"
                              : `${t.share_of_detractor_mentions}%`}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-10">
        <WordCloud
          texts={wordCloudTexts}
          title={tr("envola.wordcloud.title", "Word cloud")}
          subtitle={tr(
            "envola.wordcloud.subtitle",
            "Nuage de mots filtré par la même période et le même bucket."
          )}
          minCount={2}
          maxWords={60}
        />
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-xl md:text-2xl font-semibold text-white">
                {tr("envola.comments.title", "Recent comments")}
              </h2>
              <p className="mt-2 text-sm text-slate-300">
                {tr(
                  "envola.comments.subtitle",
                  "Commentaires récents alignés avec les filtres globaux."
                )}
              </p>
            </div>
          </div>

          {comments.loading && (
            <p className="mt-6 text-sm text-slate-300">{tr("common.loading", "Loading…")}</p>
          )}
          {!comments.loading && comments.error && (
            <p className="mt-6 text-sm text-red-300">
              {tr("envola.common.error", "Error")}: {comments.error}
            </p>
          )}

          {!comments.loading && !comments.error && (
            <>
              {!Array.isArray(comments.data?.comments) || comments.data.comments.length === 0 ? (
                <div className="mt-6 rounded-2xl border border-white/10 bg-black/10 p-5 text-sm text-slate-300">
                  {tr("envola.comments.none", "No comments returned for this filter set.")}
                </div>
              ) : (
                <div className="mt-6 space-y-3">
                  {comments.data.comments.map((c, idx) => (
                    <div
                      key={`${c.submitted_at || "x"}-${idx}`}
                      className="rounded-2xl border border-white/10 bg-black/10 p-5"
                    >
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
                        <span
                          className={`inline-flex items-center rounded-full border px-2 py-1 ${bucketPillClass(
                            c.bucket
                          )}`}
                        >
                          {bucketLabel(c.bucket, tr)} • {c.score_0_10}/10
                        </span>
                        <span className="text-slate-400">{prettyDate(c.submitted_at)}</span>

                        <IntercomContactLink
                          url={c.intercom_contact_url}
                          label={tr("envola.comments.openContact", "Open contact")}
                        />
                      </div>

                      {c.question_text ? (
                        <div className="mt-3 text-xs text-slate-400">{c.question_text}</div>
                      ) : null}


                      <p className="mt-2 text-sm leading-relaxed text-slate-200">
                        “{c.comment}”
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {showAllResponsesModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4 py-6">
          <div className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#0F172A] shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {tr("envola.responsesPanel.allResponses", "All responses")}
                </h3>
                <p className="text-sm text-slate-400">
                  {selectedPoint?.date
                    ? `${tr("envola.responsesPanel.selectedPeriod", "Selected period")}: ${selectedPoint.date}`
                    : ""}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAllResponsesModal(false)}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 hover:bg-white/10"
              >
                {tr("common.close", "Close")}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              <div className="space-y-3">
                {(bucketResponses.data?.rows || []).map((r) => (
                  <div
                    key={`modal-${r.response_id || `${r.submitted_at}-${r.contact_id}`}`}
                    className="rounded-2xl border border-white/10 bg-black/20 p-4"
                  >
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
                      <span
                        className={`inline-flex items-center rounded-full border px-2 py-1 ${bucketPillClass(
                          r.score_0_10 >= 9 ? "promoter" : r.score_0_10 >= 7 ? "passive" : "detractor"
                        )}`}
                      >
                        {bucketLabel(
                          r.score_0_10 >= 9 ? "promoter" : r.score_0_10 >= 7 ? "passive" : "detractor",
                          tr
                        )}{" "}
                        • {r.score_0_10}/10
                      </span>
                      <span className="text-slate-400">{prettyDate(r.submitted_at)}</span>

                      <IntercomContactLink
                        url={r.intercom_contact_url}
                        label={tr("envola.comments.openContact", "Open contact")}
                      />
                    </div>

                    {Array.isArray(r.verbatims) && r.verbatims.length > 0 ? (
                      <div className="mt-3 space-y-2">
                        {r.verbatims.map((v, idx) => (
                          <div key={idx}>
                            {v.question_text ? (
                              <div className="text-xs text-slate-400">{v.question_text}</div>
                            ) : null}
                            <div className="text-sm leading-relaxed text-slate-200">
                              “{v.text}”
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="mt-3 text-sm text-slate-400">
                        {tr("envola.responses.none", "No verbatims stored for this response.")}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
