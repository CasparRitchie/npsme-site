import React, { useEffect, useMemo, useState } from "react";
import Seo from "../components/Seo";
import PageHeader from "../components/PageHeader";
import { useLocation, Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";
import { translations } from "../i18n/translations";
import { localizePath } from "../i18n/pathHelpers";
import NpsTimeseriesChart from "../components/NpsTimeseriesChart";
import WordCloud from "../components/WordCloud";
import NpsBucketStackedColumns from "../components/NpsBucketStackedColumns";


function StatCard({ label, value, sub }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/10 p-5">
      <div className="text-xs text-slate-400">{label}</div>
      <div className="mt-2 text-3xl font-semibold text-white">{value}</div>
      {sub ? <div className="mt-2 text-sm text-slate-300">{sub}</div> : null}
    </div>
  );
}

function Pill({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-200">
      {children}
    </span>
  );
}

function TogglePill({ active, onClick, color, children }) {
  const base =
    "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition select-none";
  const inactive = "border-white/10 bg-white/5 text-slate-200 hover:bg-white/10";
  const activeMap = {
    green: "bg-green-400 text-black border-green-400",
    amber: "bg-amber-400 text-black border-amber-400",
    red: "bg-red-400 text-black border-red-400",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${base} ${active ? activeMap[color] : inactive}`}
      aria-pressed={active}
    >
      {children}
    </button>
  );
}

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

function todayYmdLocal() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function EnvolaExample() {
  const CONTENT_ID = "189616";
  const { lang } = useLanguage();
  const tr = (p, f) => translations(lang, p, f);
  const location = useLocation();

  const [live, setLive] = useState({ loading: true, data: null, error: null });
  const [rate, setRate] = useState({ loading: true, data: null, error: null });
  const [themes, setThemes] = useState({ loading: true, data: null, error: null });
  const [comments, setComments] = useState({ loading: true, data: null, error: null });

  // NEW: NPS over time
  const [trend, setTrend] = useState({ loading: true, data: null, error: null });
  const [trendGranularity, setTrendGranularity] = useState("week"); // day|week|month
  const [trendMode, setTrendMode] = useState("rolling"); // rolling|range
  const [trendDays, setTrendDays] = useState(90);
  const [trendFrom, setTrendFrom] = useState(() => {
    // default: 90 days ago (approx) -> keep simple (user can edit)
    const d = new Date();
    d.setDate(d.getDate() - 90);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  });
  const [trendTo, setTrendTo] = useState(() => todayYmdLocal());

  const [bucketFilter, setBucketFilter] = useState({
    promoters: true,
    passives: true,
    detractors: true,
  });

  const isAllOff =
    !bucketFilter.promoters && !bucketFilter.passives && !bucketFilter.detractors;

  function bucketAllowed(bucket) {
    if (isAllOff) return true;
    if (bucket === "promoter") return bucketFilter.promoters;
    if (bucket === "passive") return bucketFilter.passives;
    if (bucket === "detractor") return bucketFilter.detractors;
    return true;
  }

  function labelBucket(bucket) {
    if (bucket === "promoter") return tr("envola.filters.promoters", "Promoters");
    if (bucket === "passive") return tr("envola.filters.passives", "Passives");
    if (bucket === "detractor") return tr("envola.filters.detractors", "Detractors");
    return bucket || tr("common.unknown", "Unknown");
  }

  function labelTheme(themeKey) {
    return tr(`envola.themeLabels.${themeKey}`, themeKey);
  }

  const trendUrl = useMemo(() => {
    const base = `/api/intercom/public/nps-timeseries?content_id=${encodeURIComponent(
      CONTENT_ID
    )}&granularity=${encodeURIComponent(trendGranularity)}`;

    if (trendMode === "range") {
      const from = (trendFrom || "").trim();
      const to = (trendTo || "").trim();
      // If user leaves blanks, fall back to rolling
      if (from && to) return `${base}&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
      return `${base}&days=${encodeURIComponent(trendDays)}`;
    }

    return `${base}&days=${encodeURIComponent(trendDays)}`;
  }, [trendGranularity, trendMode, trendDays, trendFrom, trendTo]);

  const [ts, setTs] = useState({ loading: true, data: null, error: null });
  const [granularity, setGranularity] = useState("week"); // day | week | month
  const [days, setDays] = useState(90);

  const [selectedPoint, setSelectedPoint] = useState(null);
  const [bucketResponses, setBucketResponses] = useState({ loading: false, data: null, error: null });
  // NEW: Theme drilldown
  const [selectedTheme, setSelectedTheme] = useState(null); // theme key string
  const [themeComments, setThemeComments] = useState({ loading: false, data: null, error: null });

  function selectedBucketsParam() {
    const selected = [];
    if (bucketFilter.promoters) selected.push("promoter");
    if (bucketFilter.passives) selected.push("passive");
    if (bucketFilter.detractors) selected.push("detractor");
    return selected.length === 0 ? "" : `&buckets=${encodeURIComponent(selected.join(","))}`;
  }

  async function openTheme(themeKey) {
    setSelectedTheme(themeKey);
    setThemeComments({ loading: true, data: null, error: null });

    try {
      const r = await fetch(
        `/api/intercom/public/nps-theme-comments?content_id=${encodeURIComponent(
          CONTENT_ID
        )}&theme=${encodeURIComponent(themeKey)}&days=30&limit=80${selectedBucketsParam()}`
      );
      const j = await r.json();
      setThemeComments({
        loading: false,
        data: j,
        error: r.ok ? null : j?.error || "Error",
      });
    } catch (e) {
      setThemeComments({ loading: false, data: null, error: e.message });
    }
  }

  function closeTheme() {
    setSelectedTheme(null);
    setThemeComments({ loading: false, data: null, error: null });
  }
  async function loadBucketResponses(point) {
    setSelectedPoint(point);
    setBucketResponses({ loading: true, data: null, error: null });



    try {
      const r = await fetch(
        `/api/intercom/public/nps-responses?content_id=${encodeURIComponent(
          CONTENT_ID
        )}&granularity=${encodeURIComponent(granularity)}&date=${encodeURIComponent(
          point.date
        )}&limit=200`
      );
      const j = await r.json();
      setBucketResponses({
        loading: false,
        data: j,
        error: r.ok ? null : j?.error || "Error",
      });
    } catch (e) {
      setBucketResponses({ loading: false, data: null, error: e.message });
    }
  }

  useEffect(() => {
    let cancelled = false;

    setTs((s) => ({ ...s, loading: true }));

    (async () => {
      try {
        const r = await fetch(
          `/api/intercom/public/nps-timeseries?content_id=${encodeURIComponent(CONTENT_ID)}&granularity=${encodeURIComponent(
            granularity
          )}&days=${encodeURIComponent(days)}`
        );
        const j = await r.json();
        if (!cancelled) {
          setTs({ loading: false, data: j, error: r.ok ? null : j?.error || "Error" });
        }
      } catch (e) {
        if (!cancelled) setTs({ loading: false, data: null, error: e.message });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [granularity, days]);

  // LIVE
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch(`/api/intercom/public/nps-summary?content_id=${CONTENT_ID}&days=30`);
        const j = await r.json();
        if (!cancelled) {
          setLive({ loading: false, data: j, error: r.ok ? null : (j?.error || "Error") });
        }
      } catch (e) {
        if (!cancelled) setLive({ loading: false, data: null, error: e.message });
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // RATE
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch(`/api/intercom/public/nps-response-rate?content_id=${CONTENT_ID}&days=30`);
        const j = await r.json();
        if (!cancelled) {
          setRate({ loading: false, data: j, error: r.ok ? null : (j?.error || "Error") });
        }
      } catch (e) {
        if (!cancelled) setRate({ loading: false, data: null, error: e.message });
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // NEW: TREND (refetch when filters change)
  useEffect(() => {
    let cancelled = false;

    setTrend((s) => ({ ...s, loading: true, error: null }));

    (async () => {
      try {
        const r = await fetch(trendUrl);
        const j = await r.json();
        if (!cancelled) {
          setTrend({ loading: false, data: j, error: r.ok ? null : (j?.error || "Error") });
        }
      } catch (e) {
        if (!cancelled) setTrend({ loading: false, data: null, error: e.message });
      }
    })();

    return () => { cancelled = true; };
  }, [trendUrl]);

  // THEMES (refetches when toggles change)
  useEffect(() => {
    let cancelled = false;
    setThemes((s) => ({ ...s, loading: true }));

    (async () => {
      try {
        const selected = [];
        if (bucketFilter.promoters) selected.push("promoter");
        if (bucketFilter.passives) selected.push("passive");
        if (bucketFilter.detractors) selected.push("detractor");

        const bucketsParam =
          selected.length === 0 ? "" : `&buckets=${encodeURIComponent(selected.join(","))}`;

        const r = await fetch(
          `/api/intercom/public/nps-themes?content_id=${CONTENT_ID}&days=30${bucketsParam}`
        );
        const j = await r.json();

        if (!cancelled) {
          setThemes({ loading: false, data: j, error: r.ok ? null : (j?.error || "Error") });
        }
      } catch (e) {
        if (!cancelled) setThemes({ loading: false, data: null, error: e.message });
      }
    })();

    return () => { cancelled = true; };
  }, [bucketFilter.promoters, bucketFilter.passives, bucketFilter.detractors]);

  // COMMENTS (fetch once; filter client-side)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch(
          `/api/intercom/public/nps-comments?content_id=${CONTENT_ID}&days=30&limit=50`
        );
        const j = await r.json();
        if (!cancelled) {
          setComments({ loading: false, data: j, error: r.ok ? null : (j?.error || "Error") });
        }
      } catch (e) {
        if (!cancelled) setComments({ loading: false, data: null, error: e.message });
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    // If filters change, close the open theme drilldown to avoid stale interpretation
    if (selectedTheme) closeTheme();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bucketFilter.promoters, bucketFilter.passives, bucketFilter.detractors]);

  // Add near your other state/hooks
  const [chartMountReady, setChartMountReady] = useState(false);
    useEffect(() => {
      let raf1 = 0;
      let raf2 = 0;

      raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => setChartMountReady(true));
      });

      return () => {
        if (raf1) cancelAnimationFrame(raf1);
        if (raf2) cancelAnimationFrame(raf2);
      };
    }, []);

  // Simple derived helpers for the trend table
  const trendPoints = useMemo(() => {
    const pts = trend.data?.points || [];
    return Array.isArray(pts) ? pts : [];
  }, [trend.data]);

  const trendTotals = useMemo(() => {
    if (!trendPoints.length) return null;
    const total = trendPoints.reduce((acc, p) => acc + (p.responses || 0), 0);
    const last = trendPoints[trendPoints.length - 1];
    return { totalResponses: total, lastNps: last?.nps ?? null, lastDate: last?.date ?? null };
  }, [trendPoints]);

  const wordCloudTexts = useMemo(() => {
    const all = comments.data?.comments || [];
    const filtered = all.filter((c) => bucketAllowed(c.bucket));
    return filtered.map((c) => c.comment).filter(Boolean);
  }, [comments.data, bucketFilter.promoters, bucketFilter.passives, bucketFilter.detractors]); // bucketAllowed depends on these

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B0F19] via-[#0C1224] to-[#0B0F19] text-slate-200">
      <Seo
        path={location.pathname}
        lang={lang}
        title={tr("envola.seo.title", "Envola — Intercom NPS Analytics (Live Example) | NPSme")}
        description={tr(
          "envola.seo.description",
          "A live, anonymised example showing how NPSme layers analytics on top of Intercom NPS."
        )}
        altPaths={{ en: "/envola", fr: "/fr/exemple-envola" }}
      />

      <PageHeader iconLabel="NPS Me" tag={tr("envola.tag", "Client example / Envola")}>
        <div className="pt-4 grid md:grid-cols-12 gap-10">
          <div className="md:col-span-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl leading-tight font-semibold tracking-tight text-white">
              {tr("envola.h1", "Envola — Intercom NPS Analytics")}
            </h1>

            <p className="mt-5 text-slate-300 max-w-2xl">
              {tr(
                "envola.intro",
                "This is a live, anonymised example. It shows what NPSme can surface once an NPS survey is running in Intercom — starting with score + distribution, and soon drivers, themes, and recommendations."
              )}
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Link
                to={localizePath("/intercom-nps-analytics", lang)}
                className="group inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold bg-[#22C55E] text-[#0B0F19] hover:bg-[#16A34A] transition"
              >
                {tr("envola.ctaPrimary", "See how it works")}
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </Link>

              <Link
                to={localizePath("/book", lang)}
                className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white"
              >
                {tr("envola.ctaSecondary", "Book a CX review")}
              </Link>
            </div>
          </div>
        </div>
      </PageHeader>

      {/* NEW: NPS chart */}

      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-xl md:text-2xl font-semibold text-white">
                {tr("envola.timeseries.title", "NPS over time")}
              </h2>
              <p className="mt-2 text-sm text-slate-300 max-w-3xl">
                {tr("envola.timeseries.subtitle", "Track NPS trends by day, week, or month.")}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm"
                value={granularity}
                onChange={(e) => setGranularity(e.target.value)}
              >
                <option value="day">{tr("common.day", "Day")}</option>
                <option value="week">{tr("common.week", "Week")}</option>
                <option value="month">{tr("common.month", "Month")}</option>
              </select>

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
            </div>
          </div>

          {ts.loading && <p className="mt-6 text-sm text-slate-300">{tr("common.loading", "Loading…")}</p>}
          {!ts.loading && ts.error && <p className="mt-6 text-sm text-red-300">Error: {ts.error}</p>}

          {!ts.loading && ts.data?.ok && (
            <div className="mt-6">
              <div className="mt-6 h-72 w-full min-w-0">
              {chartMountReady ? (
                <NpsTimeseriesChart
                  points={ts.data.points || []}
                  granularity={granularity}
                  onPointClick={loadBucketResponses}
                />
              ) : (
                <div className="w-full" style={{ aspectRatio: "2.6 / 1" }} />
              )}
            </div>
              {!ts.loading && ts.data?.ok && (ts.data.points || []).length > 0 && (
              <button
                type="button"
                className="mt-4 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm"
                onClick={() => loadBucketResponses(ts.data.points[ts.data.points.length - 1])}
              >
                Test drilldown (latest point)
              </button>
            )}
              <div className="mt-3 text-xs text-slate-400">
                {tr("common.window", "Window")} : {ts.data.from} → {ts.data.to} • {tr("common.points", "Points")} : {(ts.data.points || []).length}
              </div>
            </div>
          )}
        {selectedPoint && (
        <div className="mt-6 rounded-2xl border border-white/10 bg-black/10 p-5">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="text-sm text-slate-200">
              <span className="text-slate-400">Selected:</span>{" "}
              <span className="text-white font-semibold">{selectedPoint.date}</span>{" "}
              <span className="text-slate-400">• NPS:</span>{" "}
              <span className="text-white font-semibold">{selectedPoint.nps ?? "—"}</span>{" "}
              <span className="text-slate-400">• Responses:</span>{" "}
              <span className="text-white font-semibold">{selectedPoint.responses ?? "—"}</span>
            </div>

            <button
              type="button"
              onClick={() => {
                setSelectedPoint(null);
                setBucketResponses({ loading: false, data: null, error: null });
              }}
              className="text-sm text-slate-300 hover:text-white"
            >
              Close
            </button>
          </div>

          {bucketResponses.loading && (
            <p className="mt-4 text-sm text-slate-300">{tr("common.loading", "Loading…")}</p>
          )}
          {!bucketResponses.loading && bucketResponses.error && (
            <p className="mt-4 text-sm text-red-300">Error: {bucketResponses.error}</p>
          )}

          {!bucketResponses.loading && bucketResponses.data?.ok && (
            <>
              <div className="mt-3 text-xs text-slate-400">
                Window: {bucketResponses.data.bucket_start} → {bucketResponses.data.bucket_end} •
                {` `}Promoters {bucketResponses.data.promoters}, Passives {bucketResponses.data.passives}, Detractors {bucketResponses.data.detractors}
              </div>

              <div className="mt-4 space-y-3">
                {(bucketResponses.data.items || []).map((r) => (
                  <div key={r.response_id || `${r.submitted_at}-${r.contact_id}`} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
                      <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1">
                        {labelBucket(r.bucket)} • {r.score_0_10}/10
                      </span>
                      <span className="text-slate-400">{prettyDate(r.submitted_at)}</span>
                      {r.contact_id ? (
                        <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1">
                          Intercom contact: {r.contact_id}
                        </span>
                      ) : null}
                    </div>

                    {/* Optional: show the multi-select benefits */}
                    {Array.isArray(r.selected_options) && r.selected_options.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {r.selected_options.slice(0, 12).map((opt) => (
                          <span key={opt} className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-xs text-slate-200">
                            {opt}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Show verbatims */}
                    {Array.isArray(r.verbatims) && r.verbatims.length > 0 ? (
                      <div className="mt-3 space-y-2">
                        {r.verbatims.slice(0, 6).map((v, idx) => (
                          <div key={idx} className="text-sm text-slate-200">
                            {v.question_text ? (
                              <div className="text-xs text-slate-400">{v.question_text}</div>
                            ) : null}
                            <div className="leading-relaxed">“{v.text}”</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="mt-3 text-sm text-slate-400">No verbatims stored for this response.</div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
      </div>
      </section>

      {/* Top: overall NPS card + split chart */}
      <section className="mx-auto max-w-7xl px-6 pt-10 pb-10">
        <div className="grid gap-4 md:grid-cols-12 items-stretch">
          <div className="md:col-span-4">
            <StatCard
              label={tr("envola.top.npsOverall", "NPS (selected period)")}
              value={trendTotals?.lastNps == null ? "—" : trendTotals.lastNps}
              sub={
                trend.data?.from && trend.data?.to
                  ? `${tr("common.window", "Window")}: ${trend.data.from} → ${trend.data.to}`
                  : null
              }
            />
          </div>

          <div className="md:col-span-8">
            {/* <NpsBucketStackedColumns
              points={trendPoints}
              height={170}
              maxBars={36}
              title={tr("envola.top.splitTitle", "Score split over time")}
              subtitle={tr(
                "envola.top.splitSubtitle",
                "Stacked distribution per time bucket (hover bars for totals)."
              )}
            /> */}
          </div>
        </div>
      </section>

      {/* NEW: NPS over time */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-xl md:text-2xl font-semibold text-white">
                {tr("envola.trend.title", "NPS over time")}
              </h2>
              <p className="mt-2 text-sm text-slate-300 max-w-3xl">
                {tr(
                  "envola.trend.subtitle",
                  "Trend view to show how sentiment is moving. Use the filters to zoom in."
                )}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Pill>{tr("envola.meta.publicSafe", "Public-safe (aggregated)")}</Pill>
              <Pill>
                {trend.data?.from && trend.data?.to
                  ? `${tr("envola.trend.range", "Range")}: ${trend.data.from} → ${trend.data.to}`
                  : tr("envola.meta.window", "Window")}
              </Pill>
            </div>
          </div>

          {/* Controls */}
          <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-400">{tr("envola.trend.granularity", "Granularity:")}</span>
              {["day", "week", "month"].map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setTrendGranularity(g)}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                    trendGranularity === g
                      ? "bg-white text-black border-white"
                      : "border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
                  }`}
                >
                  {g === "day" ? tr("common.day", "Day") : g === "week" ? tr("common.week", "Week") : tr("common.month", "Month")}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-400">{tr("envola.trend.mode", "View:")}</span>

              <button
                type="button"
                onClick={() => setTrendMode("rolling")}
                className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                  trendMode === "rolling"
                    ? "bg-white text-black border-white"
                    : "border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
                }`}
              >
                {tr("envola.trend.rolling", "Rolling")}
              </button>

              <button
                type="button"
                onClick={() => setTrendMode("range")}
                className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                  trendMode === "range"
                    ? "bg-white text-black border-white"
                    : "border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
                }`}
              >
                {tr("envola.trend.rangeBtn", "Date range")}
              </button>

              {trendMode === "rolling" ? (
                <div className="ml-2 flex items-center gap-2">
                  <span className="text-xs text-slate-400">{tr("envola.trend.last", "Last")}</span>
                  <input
                    type="number"
                    min={1}
                    max={3650}
                    value={trendDays}
                    onChange={(e) => setTrendDays(Number(e.target.value || 30))}
                    className="w-24 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-slate-200"
                  />
                  <span className="text-xs text-slate-400">{tr("common.days", "days")}</span>
                </div>
              ) : (
                <div className="ml-2 flex flex-wrap items-center gap-2">
                  <span className="text-xs text-slate-400">{tr("common.from", "From")}</span>
                  <input
                    type="date"
                    value={trendFrom}
                    onChange={(e) => setTrendFrom(e.target.value)}
                    className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-slate-200"
                  />
                  <span className="text-xs text-slate-400">{tr("common.to", "To")}</span>
                  <input
                    type="date"
                    value={trendTo}
                    onChange={(e) => setTrendTo(e.target.value)}
                    className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-slate-200"
                  />
                </div>
              )}
            </div>
          </div>

          {trend.loading && <p className="mt-6 text-sm text-slate-300">{tr("common.loading", "Loading…")}</p>}
          {!trend.loading && trend.error && <p className="mt-6 text-sm text-red-300">Error: {trend.error}</p>}

          {!trend.loading && trend.data?.ok && (
            <>
              {!trendPoints.length ? (
                <div className="mt-6 rounded-2xl border border-white/10 bg-black/10 p-5 text-sm text-slate-300">
                  {tr("envola.trend.noData", "No trend data for this period yet.")}
                </div>
              ) : (
                <>
                  <div className="mt-6 grid gap-4 md:grid-cols-3">
                    <StatCard
                      label={tr("envola.trend.totalResponses", "Responses in period")}
                      value={trendTotals?.totalResponses ?? "—"}
                    />
                    <StatCard
                      label={tr("envola.trend.latestNps", "Latest NPS point")}
                      value={trendTotals?.lastNps == null ? "—" : trendTotals.lastNps}
                      sub={trendTotals?.lastDate ? `${tr("envola.trend.asOf", "As of")} ${trendTotals.lastDate}` : null}
                    />
                    <StatCard
                      label={tr("envola.trend.points", "Data points")}
                      value={trendPoints.length}
                      sub={tr("envola.trend.pointsSub", "One row per time bucket")}
                    />
                  </div>

                  <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
                    <table className="w-full border-collapse">
                      <thead className="bg-white/5">
                        <tr className="text-left text-xs text-slate-300">
                          <th className="px-4 py-3">{tr("envola.trend.cols.period", "Period")}</th>
                          <th className="px-4 py-3">{tr("envola.trend.cols.nps", "NPS")}</th>
                          <th className="px-4 py-3">{tr("envola.trend.cols.responses", "Responses")}</th>
                          <th className="px-4 py-3">{tr("envola.trend.cols.promoters", "Promoters")}</th>
                          <th className="px-4 py-3">{tr("envola.trend.cols.passives", "Passives")}</th>
                          <th className="px-4 py-3">{tr("envola.trend.cols.detractors", "Detractors")}</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        {trendPoints.slice(-36).map((p) => (
                          <tr key={p.date} className="border-t border-white/10">
                            <td className="px-4 py-3 text-white">{p.date}</td>
                            <td className="px-4 py-3 text-slate-200">{p.nps == null ? "—" : p.nps}</td>
                            <td className="px-4 py-3 text-slate-200">{p.responses ?? "—"}</td>
                            <td className="px-4 py-3 text-slate-200">{p.promoters ?? "—"}</td>
                            <td className="px-4 py-3 text-slate-200">{p.passives ?? "—"}</td>
                            <td className="px-4 py-3 text-slate-200">{p.detractors ?? "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-3 text-xs text-slate-400">
                    {tr("envola.trend.note", "Showing the most recent 36 time buckets to keep the page fast.")}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </section>

      {/* Live snapshot */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
          <h2 className="text-2xl md:text-3xl font-semibold text-white">
            {tr("envola.live.title", "Live snapshot (last 30 days)")}
          </h2>
          <p className="mt-3 text-slate-300 max-w-3xl">
            {tr(
              "envola.live.subtitle",
              "Aggregated only - no personal data. Data source: Intercom survey completions → NPSme clean store."
            )}
          </p>

          {live.loading && (
            <p className="mt-6 text-sm text-slate-300">{tr("common.loading", "Loading…")}</p>
          )}
          {!live.loading && live.error && (
            <p className="mt-6 text-sm text-red-300">Error: {live.error}</p>
          )}

          {!live.loading && live.data?.ok && (
            <>
              {live.data.responses === 0 ? (
                <div className="mt-6 rounded-2xl border border-white/10 bg-black/10 p-5 text-sm text-slate-300">
                  {tr(
                    "envola.live.noData",
                    `No completions yet in the last ${live.data.window_days} days. Once responses arrive, this panel updates automatically.`
                  )}
                </div>
              ) : (
                <div className="mt-6 grid gap-4 md:grid-cols-4">
                  <StatCard
                    label={tr("envola.live.kpiNps", `NPS (last ${live.data.window_days} days)`)}
                    value={live.data.nps === null ? "-" : live.data.nps}
                    sub={tr(
                      "envola.live.kpiSub",
                      `${live.data.responses} responses • confidence: ${live.data.confidence}`
                    )}
                  />
                  <StatCard
                    label={tr("envola.live.promoters", "Promoters")}
                    value={live.data.promoters}
                    sub={tr("envola.live.promotersSub", "Scores 9–10")}
                  />
                  <StatCard
                    label={tr("envola.live.passives", "Passives")}
                    value={live.data.passives}
                    sub={tr("envola.live.passivesSub", "Scores 7–8")}
                  />
                  <StatCard
                    label={tr("envola.live.detractors", "Detractors")}
                    value={live.data.detractors}
                    sub={tr("envola.live.detractorsSub", "Scores 0–6")}
                  />
                </div>
              )}

              <div className="mt-6 text-xs text-slate-400">
                {tr("envola.live.meta", "Survey ID: 189616")} •{" "}
                {tr("envola.live.lastResponse", "Last response")}{" "}
                {prettyDate(live.data.newest_response_at)}
              </div>

              {live.data.responses < 10 && (
                <div className="mt-4 text-xs text-slate-400">
                  {tr(
                    "envola.live.earlyNote",
                    "Note: early sample. NPS will stabilise as response volume increases."
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Response rate + completion time */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-xl md:text-2xl font-semibold text-white">
                {tr("envola.metrics.title", "Response funnel & timing")}
              </h2>
              <p className="mt-2 text-sm text-slate-300 max-w-3xl">
                {tr(
                  "envola.metrics.subtitle",
                  "Pulled from Intercom content stats export (shown → completed) and summarised for fast reporting."
                )}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Pill>{tr("envola.meta.publicSafe", "Public-safe (aggregated)")}</Pill>
              <Pill>{tr("envola.meta.window", "Window: 30 days")}</Pill>
            </div>
          </div>

          {rate.loading && (
            <p className="mt-6 text-sm text-slate-300">{tr("common.loading", "Loading…")}</p>
          )}
          {!rate.loading && rate.error && (
            <p className="mt-6 text-sm text-red-300">Error: {rate.error}</p>
          )}

          {!rate.loading && rate.data?.ok && (
            <div className="mt-6 grid gap-4 md:grid-cols-4">
              <StatCard
                label={tr("envola.metrics.shown", "Shown")}
                value={rate.data.shown ?? "-"}
                sub={tr("envola.metrics.shownSub", "Survey displayed to users")}
              />
              <StatCard
                label={tr("envola.metrics.completed", "Completed")}
                value={rate.data.completed ?? "-"}
                sub={tr("envola.metrics.completedSub", "Survey fully completed")}
              />
              <StatCard
                label={tr("envola.metrics.responseRate", "Response rate")}
                value={
                  rate.data.response_rate_pct == null ? "-" : `${rate.data.response_rate_pct}%`
                }
                sub={tr("envola.metrics.responseRateSub", "Completed ÷ shown")}
              />
              <StatCard
                label={tr("envola.metrics.medianCompletion", "Median completion time")}
                value={rate.data.median_time_to_completion || "-"}
                sub={
                  rate.data.median_time_to_first_answer
                    ? tr(
                        "envola.metrics.medianAnswerSub",
                        `Median time to first answer: ${rate.data.median_time_to_first_answer}`
                      )
                    : tr(
                        "envola.metrics.medianAnswerSubFallback",
                        "Median time to first answer: -"
                      )
                }
              />
            </div>
          )}

          <div className="mt-6 text-xs text-slate-400">
            {tr(
              "envola.metrics.note",
              "Tip: run the export-stats ingest periodically to keep response-rate and timing up to date."
            )}
          </div>
        </div>
      </section>

      {/* Themes */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-xl md:text-2xl font-semibold text-white">
                {tr("envola.themes.title", "Themes in comments (early view)")}
              </h2>
              <p className="mt-2 text-sm text-slate-300 max-w-3xl">
                {tr(
                  "envola.themes.subtitle",
                  "Simple theme detection for now. This will evolve into driver analysis and richer NLP over time."
                )}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Pill>{tr("envola.meta.publicSafe", "Public-safe (aggregated)")}</Pill>
              <Pill>{tr("envola.meta.window", "Window: 30 days")}</Pill>
            </div>
          </div>

          {/* Filter toggles */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400">
              {tr("envola.filters.label", "Filter:")}
            </span>

            <TogglePill
              color="green"
              active={bucketFilter.promoters}
              onClick={() => setBucketFilter((s) => ({ ...s, promoters: !s.promoters }))}
            >
              {tr("envola.filters.promoters", "Promoters")}
            </TogglePill>

            <TogglePill
              color="amber"
              active={bucketFilter.passives}
              onClick={() => setBucketFilter((s) => ({ ...s, passives: !s.passives }))}
            >
              {tr("envola.filters.passives", "Passives")}
            </TogglePill>

            <TogglePill
              color="red"
              active={bucketFilter.detractors}
              onClick={() => setBucketFilter((s) => ({ ...s, detractors: !s.detractors }))}
            >
              {tr("envola.filters.detractors", "Detractors")}
            </TogglePill>

            {isAllOff && (
              <span className="text-xs text-slate-400">
                {tr("envola.filters.noneSelected", "No filter selected - showing all")}
              </span>
            )}
          </div>

          {themes.loading && (
            <p className="mt-6 text-sm text-slate-300">{tr("common.loading", "Loading…")}</p>
          )}
          {!themes.loading && themes.error && (
            <p className="mt-6 text-sm text-red-300">Error: {themes.error}</p>
          )}

          {!themes.loading && themes.data?.ok && (
            <>
              {!themes.data.themes || themes.data.themes.length === 0 ? (
                <div className="mt-6 rounded-2xl border border-white/10 bg-black/10 p-5 text-sm text-slate-300">
                  {tr(
                    "envola.themes.noThemes",
                    "No themes detected yet (this is normal with a small sample). As comments grow, this table will populate."
                  )}
                </div>
              ) : (
                <>
                  <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
                    <table className="w-full border-collapse">
                      <thead className="bg-white/5">
                        <tr className="text-left text-xs text-slate-300">
                          <th className="px-4 py-3">{tr("envola.themes.cols.theme", "Theme")}</th>
                          <th className="px-4 py-3">{tr("envola.themes.cols.mentions", "Mentions")}</th>
                          <th className="px-4 py-3">{tr("envola.themes.cols.avgScore", "Avg score")}</th>
                          <th className="px-4 py-3">{tr("envola.themes.cols.detrShare", "Detractor share")}</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        {themes.data.themes.slice(0, 8).map((t) => (
                          <tr
                            key={t.theme}
                            role="button"
                            tabIndex={0}
                            onClick={() => openTheme(t.theme)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") openTheme(t.theme);
                            }}
                            className="border-t border-white/10 cursor-pointer hover:bg-white/5 focus:outline-none focus:bg-white/5"
                          >
                            <td className="px-4 py-3 text-white">
                              <span className="inline-flex items-center gap-2">
                                {labelTheme(t.theme)}
                                <span className="text-xs text-slate-400">↗</span>
                              </span>
                            </td>
                            <td className="px-4 py-3 text-slate-200">{t.mentions}</td>
                            <td className="px-4 py-3 text-slate-200">{t.avg_score ?? "-"}</td>
                            <td className="px-4 py-3 text-slate-200">
                              {t.share_of_detractor_mentions == null
                                ? "-"
                                : `${t.share_of_detractor_mentions}%`}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {selectedTheme && (
                    <div className="mt-4 rounded-2xl border border-white/10 bg-black/10 p-5">
                      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div className="text-sm text-slate-200">
                          <span className="text-slate-400">{tr("common.theme", "Theme")}:</span>{" "}
                          <span className="text-white font-semibold">
                            {labelTheme(selectedTheme)}
                          </span>
                          <span className="text-slate-400"> • {tr("common.window", "Window")}:</span>{" "}
                          <span className="text-slate-200">30d</span>
                        </div>

                        <button
                          type="button"
                          onClick={closeTheme}
                          className="text-sm text-slate-300 hover:text-white"
                        >
                          {tr("common.close", "Close")}
                        </button>
                      </div>

                      {themeComments.loading && (
                        <p className="mt-4 text-sm text-slate-300">
                          {tr("common.loading", "Loading…")}
                        </p>
                      )}
                      {!themeComments.loading && themeComments.error && (
                        <p className="mt-4 text-sm text-red-300">Error: {themeComments.error}</p>
                      )}

                      {!themeComments.loading && themeComments.data?.ok && (
                        <>
                          <div className="mt-3 text-xs text-slate-400">
                            {tr("common.returned", "Returned")}: {themeComments.data.returned} •{" "}
                            {tr("common.substantive", "Substantive")}: {themeComments.data.substantive}
                            {themeComments.data.matched != null
                              ? ` • Matched: ${themeComments.data.matched}`
                              : ""}
                          </div>

                          {(themeComments.data.comments || []).length ? (
                            <div className="mt-4 space-y-3">
                              {(themeComments.data.comments || []).map((c, idx) => (
                                <div
                                  key={`${c.submitted_at || "x"}-${idx}`}
                                  className="rounded-2xl border border-white/10 bg-black/20 p-4"
                                >
                                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
                                    <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1">
                                      {labelBucket(c.bucket)} • {c.score_0_10}/10
                                    </span>
                                    <span className="text-slate-400">{prettyDate(c.submitted_at)}</span>
                                  {c.contact_id ? (
                                    <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1">
                                      Intercom contact: {c.contact_id}
                                    </span>
                                  ) : null}
                                    {c.is_substantive && (
                                      <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1">
                                        {tr("envola.comments.tookTime", "Took time to write")}
                                      </span>
                                    )}
                                  </div>

                                  {c.question_text ? (
                                    <div className="mt-3 text-xs text-slate-400">{c.question_text}</div>
                                  ) : null}

                                  <p className="mt-2 text-sm text-slate-200 leading-relaxed">
                                    “{c.comment}”
                                  </p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="mt-4 text-sm text-slate-300">
                              {tr("envola.comments.none", "No comments returned for this filter yet.")}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </>
              )}

              <div className="mt-6 text-xs text-slate-400">
                {tr(
                  "envola.themes.note",
                  "Next: upgrade this into “drivers” (what correlates with detractors), and generate AI-assisted recommendations based on evidence."
                )}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Word cloud */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <WordCloud
          texts={wordCloudTexts}
          title={tr("envola.wordcloud.title", "Word cloud")}
          subtitle={tr(
            "envola.wordcloud.subtitle",
            "Most common words in redacted comments (respects the bucket filters)."
          )}
          minCount={2}
          maxWords={60}
        />
      </section>

      {/* Comments */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
          <h2 className="text-xl md:text-2xl font-semibold text-white">
            {tr("envola.comments.title", "What customers are saying")}
          </h2>
          <p className="mt-2 text-sm text-slate-300 max-w-3xl">
            {tr("envola.comments.subtitle", "Real comments from the last 30 days (redacted for privacy).")}
          </p>

          {/* Filter toggles */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400">
              {tr("envola.filters.label", "Filter:")}
            </span>

            <TogglePill
              color="green"
              active={bucketFilter.promoters}
              onClick={() => setBucketFilter((s) => ({ ...s, promoters: !s.promoters }))}
            >
              {tr("envola.filters.promoters", "Promoters")}
            </TogglePill>

            <TogglePill
              color="amber"
              active={bucketFilter.passives}
              onClick={() => setBucketFilter((s) => ({ ...s, passives: !s.passives }))}
            >
              {tr("envola.filters.passives", "Passives")}
            </TogglePill>

            <TogglePill
              color="red"
              active={bucketFilter.detractors}
              onClick={() => setBucketFilter((s) => ({ ...s, detractors: !s.detractors }))}
            >
              {tr("envola.filters.detractors", "Detractors")}
            </TogglePill>

            {isAllOff && (
              <span className="text-xs text-slate-400">
                {tr("envola.filters.noneSelected", "No filter selected - showing all")}
              </span>
            )}
          </div>

          {comments.loading && (
            <p className="mt-6 text-sm text-slate-300">{tr("common.loading", "Loading…")}</p>
          )}
          {!comments.loading && comments.error && (
            <p className="mt-6 text-sm text-red-300">Error: {comments.error}</p>
          )}

          {!comments.loading && comments.data?.ok && (
            <>
              <div className="mt-4 text-xs text-slate-400">
                {(() => {
                  const filtered = (comments.data.comments || []).filter((c) =>
                    bucketAllowed(c.bucket)
                  );
                  const substantive = filtered.filter((c) => c.is_substantive).length;
                  return (
                    <>
                      {substantive} of {filtered.length}{" "}
                      {tr(
                        "envola.comments.substantiveLabel",
                        "comments are “substantive” (8+ words)."
                      )}
                    </>
                  );
                })()}
              </div>

              {(comments.data.comments || []).filter((c) => bucketAllowed(c.bucket)).length ? (
                <div className="mt-6 space-y-3">
                  {comments.data.comments
                    .filter((c) => bucketAllowed(c.bucket))
                    .map((c, idx) => (
                      <div
                        key={`${c.submitted_at}-${idx}`}
                        className="rounded-2xl border border-white/10 bg-black/10 p-5"
                      >
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
                          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1">
                            {labelBucket(c.bucket)} • {c.score_0_10}/10
                          </span>
                          <span className="text-slate-400">{prettyDate(c.submitted_at)}</span>
                          {c.contact_id ? (
                            <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1">
                              Intercom contact: {c.contact_id}
                            </span>
                          ) : null}
                          {c.is_substantive && (
                            <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1">
                              {tr("envola.comments.tookTime", "Took time to write")}
                            </span>
                          )}
                        </div>

                        <p className="mt-3 text-sm text-slate-200 leading-relaxed">
                          “{c.comment}”
                        </p>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="mt-6 rounded-2xl border border-white/10 bg-black/10 p-5 text-sm text-slate-300">
                  {tr("envola.comments.none", "No comments returned for this filter yet.")}
                </div>
              )}
            </>
          )}

          <div className="mt-6 text-xs text-slate-400">
            {tr(
              "envola.comments.redactionNote",
              "Comments are redacted automatically (emails, phone numbers, links, IDs)."
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
