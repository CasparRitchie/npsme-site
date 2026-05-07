// src/pages/CsvNpsPerformance.jsx
import React, { useEffect, useMemo, useState } from "react";
import CsvNpsWorkspaceNav from "../components/CsvNpsWorkspaceNav";

export default function CsvNpsPerformance() {
  const [dataset, setDataset] = useState(null);

  useEffect(() => {
    const saved = sessionStorage.getItem("csvNpsLatestDataset");

    if (!saved) return;

    try {
      setDataset(JSON.parse(saved));
    } catch (err) {
      console.error("Failed to read CSV NPS dataset from sessionStorage", err);
    }
  }, []);

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

  if (!dataset) {
    return (
      <main className="csv-nps-page">
        <section className="csv-nps-hero">
          <p className="eyebrow">CSV NPS workspace</p>
          <h1>CSV NPS Performance</h1>
          <p>No CSV dataset has been analysed yet.</p>
        </section>

        <section className="csv-nps-panel">
          <p>
            Go to{" "}
            <a className="text-link" href="/csv-nps/upload">
              CSV NPS Upload
            </a>{" "}
            and analyse a CSV file first.
          </p>
        </section>
      </main>
    );
  }

  const { summary } = dataset;

  return (
    <main className="csv-nps-page">
      <section className="csv-nps-hero">
        <p className="eyebrow">CSV NPS workspace</p>
        <h1>CSV NPS Performance</h1>
        <p>
          Performance view for the latest CSV dataset analysed in this browser
          session.
        </p>
      </section>

      <CsvNpsWorkspaceNav />

      <section className="csv-nps-results">
        <div className="csv-nps-responses-header">
          <div>
            <h2>Performance summary</h2>
            <p>
              Based on {summary.total} valid NPS responses from the latest CSV
              analysis.
            </p>
          </div>

          <div className="csv-nps-next-actions csv-nps-next-actions-tight">
            <a className="csv-nps-secondary-link" href="/csv-nps/upload">
              Upload
            </a>
            <a className="csv-nps-secondary-link" href="/csv-nps/responses">
              Responses
            </a>
            <a
              className="csv-nps-secondary-link"
              href="/csv-nps/closing-the-loop"
            >
              Closing the loop
            </a>
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
            Daily NPS and response volume, where a valid date column was
            detected.
          </p>

          {timeline.length === 0 ? (
            <div className="csv-nps-empty-state">
              No usable response dates were detected in this CSV dataset.
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
