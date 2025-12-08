// src/components/DemoResultsPanel.jsx
import React from "react";

const STAGES = [
  "Overall NPS",
  "Discovery",
  "Ordering",
  "Delivery",
  "Installation & setup",
  "After-sales service",
  "Cease / leaving",
];

const STOP_WORDS = new Set([
  "the","and","for","with","this","that","you","your","our","are","was","were",
  "is","it","to","of","in","on","at","a","an","i","we","they","but","so","very",
  "really","just","too","be","have","had","has","as","if","or"
]);

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

// Helpers to group by period
function getMonthKey(date) {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "Unknown";
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  return `${y}-${String(m).padStart(2, "0")}`;
}

function getQuarterKey(date) {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "Unknown";
  const y = d.getFullYear();
  const q = Math.floor(d.getMonth() / 3) + 1;
  return `${y} Q${q}`;
}

function computeNpsStats(responses) {
  if (!responses.length) {
    return { nps: null, total: 0, promoters: 0, passives: 0, detractors: 0 };
  }

  let promoters = 0;
  let passives = 0;
  let detractors = 0;

  for (const r of responses) {
    if (typeof r.score !== "number" || Number.isNaN(r.score)) continue;
    if (r.score >= 9) promoters++;
    else if (r.score >= 7) passives++;
    else detractors++;
  }

  const total = promoters + passives + detractors;
  if (!total) {
    return { nps: null, total, promoters, passives, detractors };
  }

  const nps = Math.round(((promoters - detractors) / total) * 100);
  return { nps, total, promoters, passives, detractors };
}

function buildWordCloudData(responses, maxWords = 30) {
  const counts = new Map();

  for (const r of responses) {
    const text = (r.comment || r.verbatim || "").toLowerCase();
    if (!text) continue;

    const words = text.replace(/[^a-z0-9\s]/gi, " ").split(/\s+/);
    for (const wRaw of words) {
      const w = wRaw.trim();
      if (!w || STOP_WORDS.has(w) || w.length <= 2) continue;
      counts.set(w, (counts.get(w) || 0) + 1);
    }
  }

  const items = Array.from(counts.entries())
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, maxWords);

  if (!items.length) return [];

  const maxCount = items[0].count;
  const minCount = items[items.length - 1].count;

  return items.map(({ word, count }) => {
    const ratio =
      maxCount === minCount ? 1 : (count - minCount) / (maxCount - minCount);
    const fontSize = 0.8 + ratio * 1.0; // 0.8–1.8rem
    return { word, count, fontSize };
  });
}

export default function DemoResultsPanel() {
  const [responses, setResponses] = React.useState([]);
  const [loadingResults, setLoadingResults] = React.useState(false);
  const [resultsError, setResultsError] = React.useState("");
  const [customerFilter, setCustomerFilter] = React.useState("ALL");
  const [companyFilter, setCompanyFilter] = React.useState("ALL");
  const [period, setPeriod] = React.useState("monthly"); // 'monthly' | 'quarterly' | 'rolling12'
  const [resultType, setResultType] = React.useState("ALL"); // ALL | OVERALL | MILESTONE

  // Load results from backend
  async function loadResults() {
    try {
      setLoadingResults(true);
      setResultsError("");

      const res = await fetch("/api/demo-responses");
      if (!res.ok) {
        throw new Error("Server returned an error");
      }

      const data = await res.json();
      setResponses(data.rows || []);
    } catch (err) {
      console.error("Error loading demo responses", err);
      setResultsError("We couldn’t load demo results. Please try again in a moment.");
    } finally {
      setLoadingResults(false);
    }
  }

  React.useEffect(() => {
    loadResults();
  }, []);

  // Unique customers / companies for filters
  const uniqueCustomers = React.useMemo(() => {
    const names = new Set();
    for (const r of responses) {
      if (r.customerName && r.customerName.trim()) {
        names.add(r.customerName.trim());
      }
    }
    return Array.from(names).sort();
  }, [responses]);

  const uniqueCompanies = React.useMemo(() => {
    const names = new Set();
    for (const r of responses) {
      const name = (r.businessName || r.companyName || "").trim();
      if (name) {
        names.add(name);
      }
    }
    return Array.from(names).sort();
  }, [responses]);

  // Apply filters: customer + company + result type
  const filteredResponses = React.useMemo(() => {
    let rows = responses;

    if (customerFilter !== "ALL") {
      rows = rows.filter((r) => (r.customerName || "").trim() === customerFilter);
    }

    if (companyFilter !== "ALL") {
      rows = rows.filter((r) => {
        const name = (r.businessName || r.companyName || "").trim();
        return name === companyFilter;
      });
    }

    if (resultType === "OVERALL") {
      rows = rows.filter((r) => (r.stage || "").trim() === "Overall NPS");
    } else if (resultType === "MILESTONE") {
      rows = rows.filter(
        (r) =>
          r.stage &&
          r.stage.trim() !== "" &&
          r.stage.trim() !== "Overall NPS"
      );
    }

    return rows;
  }, [responses, customerFilter, companyFilter, resultType]);

  // Group by period
  const grouped = React.useMemo(() => {
    if (!filteredResponses.length) return [];

    const now = new Date();
    const groupsMap = new Map();

    for (const r of filteredResponses) {
      if (!r.createdAt) continue;
      const d = new Date(r.createdAt);
      if (Number.isNaN(d.getTime())) continue;

      let key;
      let label;

      if (period === "monthly") {
        key = getMonthKey(d);
        label = key;
      } else if (period === "quarterly") {
        key = getQuarterKey(d);
        label = key;
      } else {
        // rolling12 → put everything from last 12 months into a single bucket
        const twelveMonthsAgo = new Date(
          now.getFullYear(),
          now.getMonth() - 11,
          1
        );
        if (d < twelveMonthsAgo) continue;
        key = "last-12";
        label = "Last 12 months";
      }

      if (!groupsMap.has(key)) {
        groupsMap.set(key, []);
        groupsMap.get(key).label = label;
      }
      groupsMap.get(key).push(r);
    }

    const result = [];
    for (const [key, arr] of groupsMap.entries()) {
      const stats = computeNpsStats(arr);
      result.push({
        key,
        label: groupsMap.get(key).label || key,
        stats,
      });
    }

    result.sort((a, b) => (a.key > b.key ? 1 : -1));
    return result;
  }, [filteredResponses, period]);

  const overallStats = React.useMemo(
    () => computeNpsStats(filteredResponses),
    [filteredResponses]
  );

  const milestoneStats = React.useMemo(() => {
    const map = {};

    const base = filteredResponses.filter(
      (r) =>
        r.stage &&
        r.stage.trim() !== "" &&
        r.stage.trim() !== "Overall NPS"
    );

    STAGES.filter((s) => s !== "Overall NPS").forEach((stage) => {
      const rowsForStage = base.filter(
        (r) => (r.stage || "").trim() === stage
      );
      map[stage] = computeNpsStats(rowsForStage);
    });

    return map;
  }, [filteredResponses]);

  const wordCloudData = React.useMemo(
    () => buildWordCloudData(filteredResponses),
    [filteredResponses]
  );

  return (
    <div>
            {/* Filters + Refresh */}
      <div className="flex flex-wrap gap-3 items-center mb-4">
        {/* Contact filter */}
        <div className="flex items-center gap-2">
          <label
            htmlFor="drp-customer-filter"
            className="text-[11px] text-slate-400"
          >
            View for:
          </label>
          <select
            id="drp-customer-filter"
            name="customerFilter"
            value={customerFilter}
            onChange={(e) => setCustomerFilter(e.target.value)}
            className="rounded-2xl border border-slate-800 bg-slate-950/80 px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-400"
          >
            <option value="ALL">All demo responses</option>
            {uniqueCustomers.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>

        {/* Company filter */}
        <div className="flex items-center gap-2">
          <label
            htmlFor="drp-company-filter"
            className="text-[11px] text-slate-400"
          >
            Company:
          </label>
          <select
            id="drp-company-filter"
            name="companyFilter"
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
            className="rounded-2xl border border-slate-800 bg-slate-950/80 px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-400"
          >
            <option value="ALL">All companies</option>
            {uniqueCompanies.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>

        {/* Period filter */}
        <div className="flex items-center gap-2">
          <label
            htmlFor="drp-period-filter"
            className="text-[11px] text-slate-400"
          >
            Period:
          </label>
          <select
            id="drp-period-filter"
            name="period"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="rounded-2xl border border-slate-800 bg-slate-950/80 px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-400"
          >
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="rolling12">Last 12 months</option>
          </select>
        </div>

        {/* Result type */}
        <div className="flex items-center gap-2">
          <label
            htmlFor="drp-result-type-filter"
            className="text-[11px] text-slate-400"
          >
            Result type:
          </label>
          <select
            id="drp-result-type-filter"
            name="resultType"
            value={resultType}
            onChange={(e) => setResultType(e.target.value)}
            className="rounded-2xl border border-slate-800 bg-slate-950/80 px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-400"
          >
            <option value="ALL">All</option>
            <option value="OVERALL">Overall NPS only</option>
            <option value="MILESTONE">Milestone NPS only</option>
          </select>
        </div>

        <div className="flex-1" />

        <button
          type="button"
          onClick={loadResults}
          disabled={loadingResults}
          className={classNames(
            "inline-flex items-center justify-center rounded-full px-3 py-1.5 text-xs font-semibold border",
            loadingResults
              ? "border-slate-700 text-slate-400 cursor-not-allowed"
              : "border-slate-600 text-slate-100 hover:border-emerald-400"
          )}
        >
          {loadingResults ? "Refreshing…" : "Refresh results"}
        </button>
      </div>

      {/* Results area */}
      {resultsError && (
        <div className="rounded-2xl border border-rose-500/60 bg-rose-950/40 px-3 py-2 text-xs text-rose-100 mb-3">
          {resultsError}
        </div>
      )}

      {!resultsError && !filteredResponses.length && !loadingResults && (
        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-6 text-sm text-slate-300">
          No demo responses yet.
          <br />
          <span className="text-xs text-slate-500">
            Run the demo, complete the survey from your inbox, then refresh this section.
          </span>
        </div>
      )}

      {loadingResults && !resultsError && (
        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-4 text-sm text-slate-300">
          Loading demo results…
        </div>
      )}

      {filteredResponses.length > 0 && (
        <div className="space-y-6">
          {/* Overall NPS */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-4 flex flex-wrap gap-4 items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">
                {resultType === "MILESTONE"
                  ? "Overall Milestone NPS"
                  : "Overall NPS"}
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-semibold text-slate-50">
                  {overallStats.nps === null ? "–" : overallStats.nps}
                </span>
                {overallStats.nps !== null && (
                  <span className="text-sm text-slate-400">NPS</span>
                )}
              </div>
              <p className="mt-1 text-[11px] text-slate-500">
                Based on {overallStats.total} responses in this demo.
              </p>
            </div>

            <div className="flex flex-col gap-1 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-rose-500" />
                <span>
                  Detractors:{" "}
                  <span className="font-semibold">{overallStats.detractors}</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-amber-400" />
                <span>
                  Passives:{" "}
                  <span className="font-semibold">{overallStats.passives}</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
                <span>
                  Promoters:{" "}
                  <span className="font-semibold">{overallStats.promoters}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Period bar “chart” */}
          <div className="space-y-3">
            <p className="text-xs text-slate-400">
              NPS by{" "}
              {period === "monthly"
                ? "month"
                : period === "quarterly"
                ? "quarter"
                : "last 12 months"}
            </p>

            <div className="space-y-3">
              {grouped.map(({ key, label, stats }) => {
                const total = stats.total || 1;
                const detPct = (stats.detractors / total) * 100;
                const pasPct = (stats.passives / total) * 100;
                const proPct = (stats.promoters / total) * 100;

                return (
                  <div
                    key={key}
                    className="rounded-2xl border border-slate-800 bg-slate-950/80 px-3 py-3"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs text-slate-300">
                        <span className="font-medium">{label}</span>{" "}
                        <span className="text-slate-500">
                          • NPS {stats.nps === null ? "–" : stats.nps}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {stats.total} response{stats.total === 1 ? "" : "s"}
                      </div>
                    </div>

                    <div className="h-3 w-full rounded-full bg-slate-900 overflow-hidden flex">
                      {detPct > 0 && (
                        <div
                          style={{ width: `${detPct}%` }}
                          className="bg-rose-500"
                        />
                      )}
                      {pasPct > 0 && (
                        <div
                          style={{ width: `${pasPct}%` }}
                          className="bg-amber-400"
                        />
                      )}
                      {proPct > 0 && (
                        <div
                          style={{ width: `${proPct}%` }}
                          className="bg-emerald-400"
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Milestone NPS section */}
          <div className="space-y-4 rounded-3xl border border-slate-800 bg-slate-950/80 px-4 py-4">
            <p className="text-xs text-slate-400 uppercase tracking-widest mb-2">
              Milestone NPS
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {STAGES.filter((s) => s !== "Overall NPS").map((stage) => {
                const stats = milestoneStats[stage] || {
                  nps: null,
                  total: 0,
                };

                let tone = "bg-slate-950/60 border-slate-800";
                if (stats.total > 0 && stats.nps !== null) {
                  if (stats.nps > 20) {
                    tone = "bg-emerald-900/40 border-emerald-500/40";
                  } else if (stats.nps < -20) {
                    tone = "bg-rose-900/40 border-rose-500/40";
                  } else {
                    // -20 to +20 band
                    tone = "bg-amber-900/40 border-amber-500/40";
                  }
                }

                return (
                  <div
                    key={stage}
                    className={`rounded-2xl border ${tone} p-3 flex flex-col items-center text-center`}
                  >
                    <p className="text-xs text-slate-400 mb-1">{stage}</p>

                    <div className="text-2xl font-semibold text-slate-50 mb-1">
                      {stats.nps === null ? "–" : stats.nps}
                    </div>

                    <p className="text-[11px] text-slate-500">
                      {stats.total} response{stats.total === 1 ? "" : "s"}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Verbatim tag cloud */}
          <div className="rounded-3xl border border-slate-800 bg-slate-950/80 px-4 py-4">
            <p className="text-xs text-slate-400 uppercase tracking-widest mb-2">
              Verbatim themes (from comments)
            </p>
            <p className="text-sm text-slate-300 mb-4">
              This tag cloud scales each word by how often it appears in the comments for the
              current filters (contact, company, period, and result type). In a live programme
              you&apos;d use this as a starting point for theme coding.
            </p>

            {wordCloudData.length === 0 ? (
              <p className="text-xs text-slate-500">
                Once a few demo comments have been submitted, key words will start to appear
                here, with more frequent words shown slightly larger.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {wordCloudData.map((item) => (
                  <span
                    key={item.word}
                    className="rounded-full bg-slate-900/80 border border-slate-700 px-2 py-1 text-slate-100"
                    style={{ fontSize: `${item.fontSize}rem` }}
                    title={`${item.count} occurrence${item.count > 1 ? "s" : ""}`}
                  >
                    {item.word}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
