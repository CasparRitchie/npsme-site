// src/pages/CsvNpsPerformance.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import CsvNpsWorkspaceNav from "../components/CsvNpsWorkspaceNav";
import WorkspaceDatasetHeader from "../components/WorkspaceDatasetHeader";

const PAGE_COPY = {
  eyebrow: "NPS Me Workspace",
  title: "Performance",
  savedSubtitle:
    "Review NPS results, response mix, score distribution and timeline trends for this saved feedback dataset.",
  sessionSubtitle:
    "Review NPS results, response mix, score distribution and timeline trends for the latest browser-session dataset.",
};

export default function CsvNpsPerformance() {
  const { datasetId } = useParams();

  const [dataset, setDataset] = useState(null);
  const [loadingDataset, setLoadingDataset] = useState(Boolean(datasetId));
  const [datasetError, setDatasetError] = useState("");

  useEffect(() => {
    async function loadSavedDataset() {
      setLoadingDataset(true);
      setDatasetError("");

      try {
        const res = await fetch(`/api/nps-data/datasets/${datasetId}`, {
          credentials: "include",
        });
        const data = await res.json();

        if (!res.ok || !data.ok) {
          throw new Error(data.error || "Failed to load saved dataset");
        }

        setDataset(normaliseSavedDataset(data));
      } catch (err) {
        console.error("Failed to load saved NPS dataset:", err);
        setDatasetError(err.message || "Failed to load saved dataset");
      } finally {
        setLoadingDataset(false);
      }
    }

    function loadSessionDataset() {
      const saved = sessionStorage.getItem("csvNpsLatestDataset");

      if (!saved) {
        setDataset(null);
        return;
      }

      try {
        setDataset(JSON.parse(saved));
      } catch (err) {
        console.error("Failed to read CSV NPS dataset from sessionStorage", err);
        setDatasetError("Failed to read latest browser-session dataset");
      }
    }

    if (datasetId) {
      loadSavedDataset();
    } else {
      loadSessionDataset();
      setLoadingDataset(false);
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
    const rows = dataset?.rows || [];
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

    const maxCount = Math.max(...counts.map((item) => item.count), 1);

    return counts.map((item) => ({
      ...item,
      percentageOfMax: Math.round((item.count / maxCount) * 100),
    }));
  }, [dataset]);

  const timeline = useMemo(() => {
    const rows = dataset?.rows || [];
    const byDate = new Map();

    rows.forEach((row) => {
      if (!row.submitted_at) return;

      const dateKey = row.submitted_at.slice(0, 10);
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

    return Array.from(byDate.values()).sort((a, b) =>
      a.date > b.date ? 1 : -1
    );
  }, [dataset]);

  if (loadingDataset) {
    return (
      <main className="csv-nps-page">
        <section className="csv-nps-hero csv-nps-hero-compact">
          <p className="eyebrow">{PAGE_COPY.eyebrow}</p>
          <h1>{PAGE_COPY.title}</h1>
          <p>Loading saved dataset...</p>
        </section>

        <CsvNpsWorkspaceNav />

        <section className="csv-nps-panel">
          <p>Loading performance data from Supabase.</p>
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

  const { summary } = dataset;

  return (
    <main className="csv-nps-page">
      <section className="csv-nps-hero csv-nps-hero-compact">
        <p className="eyebrow">{PAGE_COPY.eyebrow}</p>
        <h1>{PAGE_COPY.title}</h1>
        <p>{datasetId ? PAGE_COPY.savedSubtitle : PAGE_COPY.sessionSubtitle}</p>
      </section>

      <CsvNpsWorkspaceNav />

      {datasetId && <WorkspaceDatasetHeader dataset={dataset} />}

      <section className="csv-nps-results">
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
        </div>

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
      </section>
    </main>
  );
}

function normaliseSavedDataset(apiResponse) {
  const savedDataset = apiResponse.dataset || {};
  const savedRows = apiResponse.rows || [];

  const rows = savedRows.map((row) => ({
    response_id: row.response_id || row.id,
    source: row.source,
    row_number: row.row_number,
    submitted_at: row.submitted_at,
    score: row.score,
    bucket: row.bucket,
    customer_name: row.customer_name,
    customer_email: row.customer_email,
    company: row.company,
    stage: row.stage,
    comment: row.comment,
    contact_id: row.contact_id,
    intercom_contact_url: row.intercom_contact_url,
    selected_options: row.selected_options_json || [],
    extra_scores: row.extra_scores_json || {},
    raw: row.raw_json || {},
  }));

  const summary = normaliseSummary(savedDataset.summary_json, rows);

  return {
    id: savedDataset.id,
    datasetName: savedDataset.dataset_name,
    sourceType: savedDataset.source_type,
    content_id: savedDataset.content_id,
    rawRowCount: savedDataset.raw_row_count,
    validRowCount: savedDataset.valid_row_count,
    skippedRowCount: savedDataset.skipped_row_count,
    detectedFields: savedDataset.detected_fields_json || {},
    warnings: savedDataset.warnings_json || [],
    skippedRows: savedDataset.skipped_rows_json || [],
    summary,
    rows,
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
