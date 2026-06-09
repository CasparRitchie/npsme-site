import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import CsvNpsWorkspaceNav from "../components/CsvNpsWorkspaceNav";
import WorkspaceDatasetHeader from "../components/WorkspaceDatasetHeader";
import DatasetAiInsights from "../components/DatasetAiInsights";

const PAGE_COPY = {
  eyebrow: "NPS Me Workspace",
  title: "Performance",
  savedSubtitle:
    "Review NPS results, response mix, score distribution and timeline trends for this saved feedback dataset.",
  sessionSubtitle:
    "Review NPS results, response mix, score distribution and timeline trends for the latest browser-session dataset.",
  intercomSubtitle:
    "Review NPS results, response mix, score distribution and timeline trends for the active Intercom source in this workspace.",
};

export default function CsvNpsPerformance() {
  const { datasetId } = useParams();

  const [dataset, setDataset] = useState(null);
  const [loadingDataset, setLoadingDataset] = useState(Boolean(datasetId));
  const [datasetError, setDatasetError] = useState("");
  const [mode, setMode] = useState(datasetId ? "saved" : "unknown");

  const [periodFilter, setPeriodFilter] = useState("all");
  const [bucketFilter, setBucketFilter] = useState("all");

  useEffect(() => {
    async function loadSavedDataset() {
      setLoadingDataset(true);
      setDatasetError("");

      try {
        const datasetMetaRes = await fetch(`/api/workspace/datasets/${datasetId}`, {
          credentials: "include",
        });

        const datasetMeta = await datasetMetaRes.json();

        if (!datasetMetaRes.ok || !datasetMeta.ok) {
          throw new Error(datasetMeta.error || "Failed to load saved dataset");
        }

        const sourceType = String(datasetMeta?.dataset?.source_type || "").trim();

        if (sourceType === "workspace_intercom") {
          const intercomRes = await fetch(`/api/workspace-intercom/responses`, {
            credentials: "include",
          });

          const intercomData = await intercomRes.json();

          if (!intercomRes.ok || !intercomData.ok) {
            throw new Error(
              intercomData.error || "Failed to load workspace Intercom responses"
            );
          }

          setDataset(
            normaliseWorkspaceIntercomPerformanceDataset({
              dataset: datasetMeta.dataset,
              source: intercomData.source,
              summary: intercomData.summary,
              rows: intercomData.rows,
            })
          );
          setMode("intercom");
          return;
        }

        const res = await fetch(
          `/api/workspace/datasets/${datasetId}/performance`,
          {
            credentials: "include",
          }
        );

        const data = await res.json();

        if (!res.ok || !data.ok) {
          throw new Error(data.error || "Failed to load saved dataset");
        }

        setDataset(normaliseWorkspacePerformanceDataset(data));
        setMode("saved");
      } catch (err) {
        console.error("Failed to load saved workspace dataset:", err);
        setDatasetError(err.message || "Failed to load saved dataset");
      } finally {
        setLoadingDataset(false);
      }
    }

    async function loadActiveIntercomDataset() {
      try {
        const res = await fetch(`/api/workspace-intercom/responses`, {
          credentials: "include",
        });

        const data = await res.json();

        if (!res.ok || !data.ok) {
          throw new Error(data.error || "Failed to load active Intercom responses");
        }

        setDataset(
          normaliseWorkspaceIntercomPerformanceDataset({
            dataset: data.dataset || {
              id: null,
              dataset_name: data?.source?.source_name || "Active Intercom source",
              source_type: "workspace_intercom",
              content_id: data?.content_id || data?.source?.survey_content_id || null,
              raw_row_count: data?.summary?.total || data?.rows?.length || 0,
              valid_row_count: data?.summary?.total || data?.rows?.length || 0,
              skipped_row_count: 0,
              rows,
              summary_json: data?.summary || {},
            },
            source: data.source,
            summary: data.summary,
            rows: data.rows,
          })
        );
        setMode("intercom");
        return true;
      } catch (_err) {
        return false;
      }
    }

    function loadSessionDataset() {
      const saved = sessionStorage.getItem("csvNpsLatestDataset");

      if (!saved) {
        setDataset(null);
        return false;
      }

      try {
        const parsed = JSON.parse(saved);
        setDataset(normaliseSessionDataset(parsed));
        setMode("session");
        return true;
      } catch (err) {
        console.error("Failed to read CSV NPS dataset from sessionStorage", err);
        setDatasetError("Failed to read latest browser-session dataset");
        return false;
      }
    }

    async function loadWithoutDatasetId() {
      setLoadingDataset(true);
      setDatasetError("");

      try {
        const loadedIntercom = await loadActiveIntercomDataset();

        if (!loadedIntercom) {
          loadSessionDataset();
        }
      } finally {
        setLoadingDataset(false);
      }
    }

    if (datasetId) {
      loadSavedDataset();
    } else {
      loadWithoutDatasetId();
    }
  }, [datasetId]);

  const bucketPercentages = useMemo(() => {
    if (!dataset?.summary?.total) {
      return {
        promoters: 0,
        passives: 0,
        detractors: 0,
      };
    }

    const total = dataset.summary.total;

    return {
      promoters: Math.round((dataset.summary.promoters / total) * 100),
      passives: Math.round((dataset.summary.passives / total) * 100),
      detractors: Math.round((dataset.summary.detractors / total) * 100),
    };
  }, [dataset]);

  const scoreDistribution = useMemo(() => {
    const counts = Array.isArray(dataset?.scoreDistribution)
      ? dataset.scoreDistribution
      : Array.from({ length: 11 }, (_, score) => ({
          score,
          count: 0,
        }));

    const maxCount = Math.max(...counts.map((item) => item.count || 0), 1);

    return counts.map((item) => ({
      ...item,
      percentageOfMax: Math.round(((item.count || 0) / maxCount) * 100),
    }));
  }, [dataset]);

  const timeline = useMemo(() => {
    return Array.isArray(dataset?.timeline) ? dataset.timeline : [];
  }, [dataset]);

  const performanceRows = useMemo(() => {
    const sourceRows = Array.isArray(dataset?.rows) ? dataset.rows : [];

    return sourceRows.filter((row) => {
      const matchesBucket =
        bucketFilter === "all" || row.bucket === bucketFilter;

      const matchesPeriod = rowMatchesPeriod(row.submitted_at, periodFilter);

      return matchesBucket && matchesPeriod;
    });
  }, [dataset, bucketFilter, periodFilter]);

  const filteredSummary = useMemo(() => {
    if (!performanceRows.length) {
      return dataset?.summary || {
        total: 0,
        promoters: 0,
        passives: 0,
        detractors: 0,
        nps: null,
        averageScore: null,
      };
    }

    return summariseRows(performanceRows);
  }, [performanceRows, dataset]);

  const closeLoopSummary = useMemo(() => {
    return summariseCloseLoop(performanceRows);
  }, [performanceRows]);

  const managementSummary = useMemo(() => {
    return buildManagementSummary({
      summary: filteredSummary,
      closeLoopSummary,
      periodFilter,
      bucketFilter,
    });
  }, [filteredSummary, closeLoopSummary, periodFilter, bucketFilter]);

  const subtitle = datasetId
    ? PAGE_COPY.savedSubtitle
    : mode === "intercom"
      ? PAGE_COPY.intercomSubtitle
      : PAGE_COPY.sessionSubtitle;

  if (loadingDataset) {
    return (
      <main className="csv-nps-page">
        <section className="csv-nps-hero csv-nps-hero-compact">
          <p className="eyebrow">{PAGE_COPY.eyebrow}</p>
          <h1>{PAGE_COPY.title}</h1>
          <p>Loading performance data...</p>
        </section>

        <CsvNpsWorkspaceNav />

        <section className="csv-nps-panel">
          <p>Loading performance data from workspace.</p>
        </section>
      </main>
    );
  }

  if (datasetError) {
    return (
      <main className="csv-nps-page">
        <section className="csv-nps-hero csv-nps-hero-compact">
          <p className="eyebrow">{PAGE_COPY.eyebrow}</p>
          <h1>{PAGE_COPY.title}</h1>
          <p>There was a problem loading this dataset.</p>
        </section>

        <CsvNpsWorkspaceNav />

        <section className="csv-nps-error">{datasetError}</section>
      </main>
    );
  }

  if (!dataset) {
    return (
      <main className="csv-nps-page">
        <section className="csv-nps-hero csv-nps-hero-compact">
          <p className="eyebrow">{PAGE_COPY.eyebrow}</p>
          <h1>{PAGE_COPY.title}</h1>
          <p>No feedback dataset has been loaded yet.</p>
        </section>

        <CsvNpsWorkspaceNav />

        <section className="csv-nps-panel">
          <p>
            Go to{" "}
            <a className="text-link" href="/workspace/import">
              Import feedback data
            </a>{" "}
            and analyse or save a dataset first.
          </p>
        </section>
      </main>
    );
  }

  const summary = filteredSummary || dataset.summary;

  return (
    <main className="csv-nps-page">
      <section className="csv-nps-hero csv-nps-hero-compact">
        <p className="eyebrow">{PAGE_COPY.eyebrow}</p>
        <h1>{PAGE_COPY.title}</h1>
        <p>{subtitle}</p>
      </section>

      <CsvNpsWorkspaceNav />

      {datasetId && <WorkspaceDatasetHeader dataset={dataset} />}

      <section className="csv-nps-results">
        <div className="csv-nps-filters csv-nps-filters-three">
          <label className="csv-nps-filter-field">
            <span>Period</span>
            <select
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value)}
            >
              <option value="all">All time</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="this_month">This month</option>
            </select>
          </label>

          <label className="csv-nps-filter-field">
            <span>Bucket</span>
            <select
              value={bucketFilter}
              onChange={(e) => setBucketFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="promoter">Promoters</option>
              <option value="passive">Passives</option>
              <option value="detractor">Detractors</option>
            </select>
          </label>

          <div className="csv-nps-filter-field">
            <span>Workspace actions</span>
            <div className="flex flex-wrap gap-2">
              <a className="text-link" href="/workspace/responses">
                Review responses
              </a>
              <span className="text-slate-500">·</span>
              <a className="text-link" href="/workspace/closing-the-loop">
                Manage follow-up
              </a>
            </div>
          </div>
        </div>

        <div className="csv-nps-responses-header">
          <div>
            <h2>Summary</h2>
            <p>
              Based on {summary.total} valid NPS response
              {summary.total === 1 ? "" : "s"}.
            </p>
          </div>
        </div>

        <div className="csv-nps-metric-grid">
          <MetricCard label="Responses" value={summary.total} />
          <MetricCard label="NPS" value={summary.nps} />
          <MetricCard label="Promoters" value={summary.promoters} />
          <MetricCard label="Passives" value={summary.passives} />
          <MetricCard label="Detractors" value={summary.detractors} />
          <MetricCard label="Avg. score" value={summary.averageScore} />
          <MetricCard label="Active follow-ups" value={closeLoopSummary.active} />
          <MetricCard label="Active detractors" value={closeLoopSummary.activeDetractors} />
        </div>

        <section className="csv-nps-chart-card csv-nps-chart-card-wide">
          <div className="csv-nps-responses-header">
            <div>
              <h3>Management summary</h3>
              <p>
                Founder-level readout combining NPS performance and close-loop progress.
              </p>
            </div>
          </div>

          <div className="csv-nps-management-summary">
            <p>{managementSummary}</p>

            <div className="csv-nps-management-actions">
              <a className="csv-nps-button" href="/workspace/closing-the-loop">
                View open follow-ups
              </a>
              <a className="csv-nps-button csv-nps-button-secondary" href="/workspace/responses">
                Review responses
              </a>
            </div>
          </div>
        </section>

        <div className="csv-nps-performance-grid">
          <section className="csv-nps-chart-card">
            <h3>Response mix</h3>
            <p>
              Split of responses across promoters, passives and detractors.
            </p>

            <div className="csv-nps-bucket-bars">
              <BucketBar
                label="Promoters"
                count={summary.promoters}
                percentage={bucketPercentages.promoters}
                bucket="promoter"
              />
              <BucketBar
                label="Passives"
                count={summary.passives}
                percentage={bucketPercentages.passives}
                bucket="passive"
              />
              <BucketBar
                label="Detractors"
                count={summary.detractors}
                percentage={bucketPercentages.detractors}
                bucket="detractor"
              />
            </div>
          </section>

          <section className="csv-nps-chart-card">
            <h3>Score distribution</h3>
            <p>Number of responses received for each score from 0 to 10.</p>

            <div className="csv-nps-score-chart">
              {scoreDistribution.map((item) => (
                <div className="csv-nps-score-row" key={item.score}>
                  <span className="csv-nps-score-label">{item.score}</span>
                  <div className="csv-nps-score-track">
                    <div
                      className={`csv-nps-score-fill ${getScoreClass(
                        item.score
                      )}`}
                      style={{ width: `${item.percentageOfMax}%` }}
                    />
                  </div>
                  <span className="csv-nps-score-count">{item.count}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="csv-nps-chart-card csv-nps-chart-card-wide">
          <h3>Timeline</h3>
          <p>
            Daily NPS and response volume, where response dates were detected.
          </p>

          {timeline.length === 0 ? (
            <div className="csv-nps-empty-state">
              No usable response dates were detected in this dataset.
            </div>
          ) : (
            <div className="csv-nps-table-wrap">
              <table className="csv-nps-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Responses</th>
                    <th>NPS</th>
                    <th>Promoters</th>
                    <th>Passives</th>
                    <th>Detractors</th>
                  </tr>
                </thead>
                <tbody>
                  {timeline.map((day) => (
                    <tr key={day.date}>
                      <td>{day.date}</td>
                      <td>{day.total}</td>
                      <td>{day.nps}</td>
                      <td>{day.promoters}</td>
                      <td>{day.passives}</td>
                      <td>{day.detractors}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {datasetId && mode === "saved" && <DatasetAiInsights datasetId={datasetId} />}
      </section>
    </main>
  );
}

function normaliseWorkspacePerformanceDataset(apiResponse) {
  const dataset = apiResponse.dataset || {};
  const summary = apiResponse.summary || {};
  const timeline = Array.isArray(apiResponse.timeline) ? apiResponse.timeline : [];
  const scoreDistribution = Array.isArray(apiResponse.score_distribution)
    ? apiResponse.score_distribution
    : [];

  return {
    id: dataset.id,
    datasetName: dataset.dataset_name,
    sourceType: dataset.source_type,
    content_id: dataset.content_id,
    rawRowCount: dataset.raw_row_count,
    validRowCount: dataset.valid_row_count,
    skippedRowCount: dataset.skipped_row_count,
    summary: {
      total: summary.total ?? 0,
      promoters: summary.promoters ?? 0,
      passives: summary.passives ?? 0,
      detractors: summary.detractors ?? 0,
      nps: summary.nps ?? null,
      averageScore: summary.averageScore ?? null,
    },
    timeline,
    scoreDistribution,
    rows: [],
  };
}

function normaliseWorkspaceIntercomPerformanceDataset(apiResponse) {
  const dataset = apiResponse.dataset || {};
  const rows = Array.isArray(apiResponse.rows)
    ? apiResponse.rows.map((row) => ({
        ...row,
        closeLoopActions: row.closeLoopActions || row.close_loop_actions || [],
      }))
    : [];
  const summary = apiResponse.summary || {};
  const source = apiResponse.source || {};

  const byDate = new Map();

  rows.forEach((row) => {
    if (!row.submitted_at) return;

    const dateKey = String(row.submitted_at).slice(0, 10);
    if (!dateKey) return;

    if (!byDate.has(dateKey)) {
      byDate.set(dateKey, {
        date: dateKey,
        total: 0,
        promoters: 0,
        passives: 0,
        detractors: 0,
        nps: null,
      });
    }

    const bucket = byDate.get(dateKey);
    bucket.total += 1;

    if (row.bucket === "promoter") bucket.promoters += 1;
    if (row.bucket === "passive") bucket.passives += 1;
    if (row.bucket === "detractor") bucket.detractors += 1;

    bucket.nps = Math.round(
      ((bucket.promoters - bucket.detractors) / bucket.total) * 100
    );
  });

  const counts = Array.from({ length: 11 }, (_, score) => ({
    score,
    count: 0,
  }));

  rows.forEach((row) => {
    const score = Number(row.score);
    if (Number.isInteger(score) && score >= 0 && score <= 10) {
      counts[score].count += 1;
    }
  });

  return {
    id: dataset.id,
    datasetName:
      dataset.dataset_name ||
      source.source_name ||
      "Workspace Intercom dataset",
    sourceType: dataset.source_type || "workspace_intercom",
    content_id: dataset.content_id || source.survey_content_id || null,
    rawRowCount: rows.length,
    validRowCount: summary.total ?? rows.length,
    skippedRowCount: 0,
    summary: {
      total: summary.total ?? rows.length,
      promoters: summary.promoters ?? rows.filter((row) => row.bucket === "promoter").length,
      passives: summary.passives ?? rows.filter((row) => row.bucket === "passive").length,
      detractors: summary.detractors ?? rows.filter((row) => row.bucket === "detractor").length,
      nps: summary.nps ?? calculateNps(rows),
      averageScore: summary.averageScore ?? calculateAverageScore(rows),
    },
    timeline: Array.from(byDate.values()).sort((a, b) =>
      a.date > b.date ? 1 : -1
    ),
    scoreDistribution: counts,
  };
}

function normaliseSessionDataset(sessionDataset) {
  const rows = Array.isArray(sessionDataset?.rows) ? sessionDataset.rows : [];
  const summary = normaliseSummary(sessionDataset?.summary, rows);

  const byDate = new Map();

  rows.forEach((row) => {
    if (!row.submitted_at) return;

    const dateKey = String(row.submitted_at).slice(0, 10);
    if (!dateKey) return;

    if (!byDate.has(dateKey)) {
      byDate.set(dateKey, {
        date: dateKey,
        total: 0,
        promoters: 0,
        passives: 0,
        detractors: 0,
        nps: null,
        rows,
      });
    }

    const bucket = byDate.get(dateKey);
    bucket.total += 1;

    if (row.bucket === "promoter") bucket.promoters += 1;
    if (row.bucket === "passive") bucket.passives += 1;
    if (row.bucket === "detractor") bucket.detractors += 1;

    bucket.nps = Math.round(
      ((bucket.promoters - bucket.detractors) / bucket.total) * 100
    );
  });

  const scoreDistribution = Array.from({ length: 11 }, (_, score) => ({
    score,
    count: 0,
  }));

  rows.forEach((row) => {
    const score = Number(row.score);
    if (Number.isInteger(score) && score >= 0 && score <= 10) {
      scoreDistribution[score].count += 1;
    }
  });

  return {
    id: sessionDataset?.id || null,
    datasetName: sessionDataset?.datasetName || "Session dataset",
    sourceType: sessionDataset?.sourceType || "session",
    content_id: sessionDataset?.content_id || null,
    rawRowCount: sessionDataset?.rawRowCount || rows.length,
    validRowCount: sessionDataset?.validRowCount || rows.length,
    skippedRowCount: sessionDataset?.skippedRowCount || 0,
    summary,
    timeline: Array.from(byDate.values()).sort((a, b) =>
      a.date > b.date ? 1 : -1
    ),
    scoreDistribution,
  };
}

function normaliseSummary(summaryJson, rows) {
  const summary = summaryJson || {};

  return {
    total: summary.total ?? rows.length,
    promoters:
      summary.promoters ?? rows.filter((row) => row.bucket === "promoter").length,
    passives:
      summary.passives ?? rows.filter((row) => row.bucket === "passive").length,
    detractors:
      summary.detractors ??
      rows.filter((row) => row.bucket === "detractor").length,
    nps: summary.nps ?? calculateNps(rows),
    averageScore: summary.averageScore ?? calculateAverageScore(rows),
  };
}

function calculateNps(rows) {
  const total = rows.length;
  if (!total) return null;

  const promoters = rows.filter((row) => row.bucket === "promoter").length;
  const detractors = rows.filter((row) => row.bucket === "detractor").length;

  return Math.round(((promoters - detractors) / total) * 100);
}

function calculateAverageScore(rows) {
  const scores = rows
    .map((row) => Number(row.score))
    .filter((score) => Number.isFinite(score));

  if (!scores.length) return null;

  return Math.round(
    (scores.reduce((sum, score) => sum + score, 0) / scores.length) * 10
  ) / 10;
}

function MetricCard({ label, value }) {
  return (
    <div className="csv-nps-metric-card">
      <div className="csv-nps-metric-label">{label}</div>
      <div className="csv-nps-metric-value">{value ?? "—"}</div>
    </div>
  );
}

function BucketBar({ label, count, percentage, bucket }) {
  return (
    <div className="csv-nps-bucket-bar-row">
      <div className="csv-nps-bucket-bar-topline">
        <span>{label}</span>
        <span>
          {count} responses · {percentage}%
        </span>
      </div>

      <div className="csv-nps-bucket-bar-track">
        <div
          className={`csv-nps-bucket-bar-fill csv-nps-bucket-bar-fill-${bucket}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function getScoreClass(score) {
  if (score >= 9) return "csv-nps-score-fill-promoter";
  if (score >= 7) return "csv-nps-score-fill-passive";
  return "csv-nps-score-fill-detractor";
}

function rowMatchesPeriod(isoDate, period) {
  if (!period || period === "all") return true;

  const submittedAt = new Date(isoDate || "");
  if (Number.isNaN(submittedAt.getTime())) return false;

  const now = new Date();

  if (period === "7d") {
    const threshold = new Date(now);
    threshold.setDate(threshold.getDate() - 7);
    return submittedAt >= threshold;
  }

  if (period === "30d") {
    const threshold = new Date(now);
    threshold.setDate(threshold.getDate() - 30);
    return submittedAt >= threshold;
  }

  if (period === "90d") {
    const threshold = new Date(now);
    threshold.setDate(threshold.getDate() - 90);
    return submittedAt >= threshold;
  }

  if (period === "this_month") {
    return (
      submittedAt.getFullYear() === now.getFullYear() &&
      submittedAt.getMonth() === now.getMonth()
    );
  }

  return true;
}

function summariseRows(rows) {
  const safeRows = Array.isArray(rows) ? rows : [];
  const total = safeRows.length;

  const promoters = safeRows.filter((row) => row.bucket === "promoter").length;
  const passives = safeRows.filter((row) => row.bucket === "passive").length;
  const detractors = safeRows.filter((row) => row.bucket === "detractor").length;

  const scores = safeRows
    .map((row) => Number(row.score))
    .filter((score) => Number.isFinite(score));

  const averageScore = scores.length
    ? Math.round(
        (scores.reduce((sum, score) => sum + score, 0) / scores.length) * 10
      ) / 10
    : null;

  const nps =
    total > 0 ? Math.round(((promoters - detractors) / total) * 100) : null;

  return {
    total,
    promoters,
    passives,
    detractors,
    nps,
    averageScore,
  };
}

function summariseCloseLoop(rows) {
  const safeRows = Array.isArray(rows) ? rows : [];

  const withStatus = safeRows.map((row) => {
    const latestAction = getLatestCloseLoopAction(
      row.close_loop_actions || row.closeLoopActions || row.loopActions
    );

    return {
      ...row,
      currentStatus: latestAction?.status || "open",
    };
  });

  const open = withStatus.filter((row) => row.currentStatus === "open").length;

  const inProgress = withStatus.filter(
    (row) => row.currentStatus === "in_progress"
  ).length;

  const closed = withStatus.filter((row) => row.currentStatus === "closed").length;

  const active = withStatus.filter(
    (row) => row.currentStatus !== "closed"
  ).length;

  const activeDetractors = withStatus.filter(
    (row) => row.bucket === "detractor" && row.currentStatus !== "closed"
  ).length;

  return {
    open,
    inProgress,
    closed,
    active,
    activeDetractors,

    // keep these aliases temporarily so existing code does not break
    openDetractors: activeDetractors,
  };
}

function getLatestCloseLoopAction(actions = []) {
  if (!Array.isArray(actions) || actions.length === 0) {
    return null;
  }

  return [...actions].sort((a, b) => {
    const aDate = new Date(
      a.updated_at || a.created_at || a.updatedAt || 0
    ).getTime();

    const bDate = new Date(
      b.updated_at || b.created_at || b.updatedAt || 0
    ).getTime();

    return bDate - aDate;
  })[0];
}

function buildManagementSummary({
  summary,
  closeLoopSummary,
  periodFilter,
  bucketFilter,
}) {
  const windowLabel = formatPeriodLabel(periodFilter);
  const bucketLabel = bucketFilter === "all" ? "all responses" : bucketFilter;

  if (!summary?.total) {
    return `No usable responses are available for ${bucketLabel} in ${windowLabel}.`;
  }

  const detractorPart =
    summary.detractors > 0
      ? `${summary.detractors} detractor${summary.detractors === 1 ? "" : "s"}`
      : "no detractors";

  const activeFollowUpPart =
    closeLoopSummary.activeDetractors > 0
      ? `${closeLoopSummary.activeDetractors} active detractor follow-up${closeLoopSummary.activeDetractors === 1 ? "" : "s"}`
      : "no active detractor follow-ups";

  return `For ${bucketLabel} in ${windowLabel}, NPS is ${summary.nps ?? "—"} from ${summary.total} response${summary.total === 1 ? "" : "s"}, with ${summary.promoters} promoter${summary.promoters === 1 ? "" : "s"}, ${summary.passives} passive${summary.passives === 1 ? "" : "s"} and ${detractorPart}. There are ${activeFollowUpPart}. The immediate management priority is to close open detractor cases and look for repeated issues in the latest comments.`;
}

function formatPeriodLabel(period) {
  if (period === "7d") return "the last 7 days";
  if (period === "30d") return "the last 30 days";
  if (period === "90d") return "the last 90 days";
  if (period === "this_month") return "this month";
  return "all time";
}
