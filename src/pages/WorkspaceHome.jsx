// src/pages/WorkspaceHome.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CsvNpsWorkspaceNav from "../components/CsvNpsWorkspaceNav";

export default function WorkspaceHome() {
  const [datasets, setDatasets] = useState([]);
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadWorkspaceHome() {
      setLoading(true);
      setError("");

      try {
        const [workspaceRes, datasetsRes] = await Promise.all([
          fetch("/api/nps-data/workspace", {
            credentials: "include",
          }),
          fetch("/api/nps-data/datasets", {
            credentials: "include",
          }),
        ]);

        const workspaceData = await workspaceRes.json();
        const datasetsData = await datasetsRes.json();

        if (!workspaceRes.ok || !workspaceData.ok) {
          throw new Error(workspaceData.error || "Failed to load workspace");
        }

        if (!datasetsRes.ok || !datasetsData.ok) {
          throw new Error(datasetsData.error || "Failed to load datasets");
        }

        setWorkspace(workspaceData.workspace || null);
        setDatasets(datasetsData.datasets || []);
      } catch (err) {
        console.error("Failed to load workspace home:", err);
        setError(err.message || "Failed to load workspace");
      } finally {
        setLoading(false);
      }
    }

    loadWorkspaceHome();
  }, []);

  const latestDatasets = datasets.slice(0, 3);

  const totals = datasets.reduce(
    (acc, dataset) => {
      const summary = dataset.summary_json || {};

      acc.datasets += 1;
      acc.responses += Number(summary.total ?? dataset.valid_row_count ?? 0);
      acc.promoters += Number(summary.promoters ?? 0);
      acc.passives += Number(summary.passives ?? 0);
      acc.detractors += Number(summary.detractors ?? 0);

      return acc;
    },
    {
      datasets: 0,
      responses: 0,
      promoters: 0,
      passives: 0,
      detractors: 0,
    }
  );

  const overallNps =
    totals.responses > 0
      ? Math.round(
          ((totals.promoters - totals.detractors) / totals.responses) * 100
        )
      : null;

  return (
    <main className="csv-nps-page">
      <section className="csv-nps-hero">
        <p className="eyebrow">NPS Me Workspace</p>
        <h1>Your customer feedback command centre</h1>
        <p>
          Import NPS data, review performance, inspect customer responses, and
          manage close-the-loop follow-up actions from one protected workspace.
        </p>
      </section>

      <CsvNpsWorkspaceNav />

      {error && <section className="csv-nps-error">{error}</section>}

      <section className="csv-nps-results">
        <div className="csv-nps-responses-header">
          <div>
            <h2>
              {workspace?.workspace_name
                ? workspace.workspace_name
                : "Workspace overview"}
            </h2>
            <p>
              {loading
                ? "Loading workspace..."
                : "A quick view of your saved datasets and NPS activity."}
            </p>
          </div>

          <Link className="csv-nps-button-link" to="/workspace/import">
            Import data
          </Link>
        </div>

        <div className="csv-nps-metric-grid">
          <MetricCard label="Datasets" value={totals.datasets} />
          <MetricCard label="Responses" value={totals.responses} />
          <MetricCard label="Overall NPS" value={overallNps} />
          <MetricCard label="Promoters" value={totals.promoters} />
          <MetricCard label="Passives" value={totals.passives} />
          <MetricCard label="Detractors" value={totals.detractors} />
        </div>

        <div className="csv-nps-performance-grid">
          <section className="csv-nps-chart-card">
            <h3>Start here</h3>
            <p>
              Bring in CSV or JSON survey data, then save it as a reusable NPS
              dataset.
            </p>

            <div className="csv-nps-dataset-actions">
              <Link className="csv-nps-secondary-link" to="/workspace/import">
                Import new data
              </Link>

              <Link className="csv-nps-secondary-link" to="/workspace/datasets">
                View saved datasets
              </Link>
            </div>
          </section>

          <section className="csv-nps-chart-card">
            <h3>Close the loop</h3>
            <p>
              Prioritise detractors, assign owners, track action taken, and keep
              follow-up visible.
            </p>

            {latestDatasets[0] ? (
              <div className="csv-nps-dataset-actions">
                <Link
                  className="csv-nps-secondary-link"
                  to={`/workspace/datasets/${latestDatasets[0].id}/closing-the-loop`}
                >
                  Open latest action queue
                </Link>
              </div>
            ) : (
              <div className="csv-nps-empty-state">
                Save a dataset first to create a follow-up queue.
              </div>
            )}
          </section>
        </div>

        <section className="csv-nps-chart-card csv-nps-chart-card-wide">
          <div className="csv-nps-responses-header">
            <div>
              <h3>Recent datasets</h3>
              <p>
                Reopen performance, responses, or close-the-loop views from your
                latest saved imports.
              </p>
            </div>

            <Link className="csv-nps-secondary-link" to="/workspace/datasets">
              View all datasets
            </Link>
          </div>

          {loading ? (
            <div className="csv-nps-empty-state">Loading recent datasets...</div>
          ) : latestDatasets.length === 0 ? (
            <div className="csv-nps-empty-state">
              No saved datasets yet. Import your first CSV or JSON file to get
              started.
            </div>
          ) : (
            <div className="csv-nps-dataset-grid">
              {latestDatasets.map((dataset) => (
                <RecentDatasetCard key={dataset.id} dataset={dataset} />
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

function RecentDatasetCard({ dataset }) {
  const summary = dataset.summary_json || {};
  const createdAt = dataset.created_at
    ? new Date(dataset.created_at).toLocaleString()
    : "Unknown date";

  return (
    <article className="csv-nps-dataset-card">
      <div className="csv-nps-dataset-card-header">
        <div>
          <span className="csv-nps-source-badge">
            {(dataset.source_type || "unknown").toUpperCase()}
          </span>
          <h3>{dataset.dataset_name}</h3>
          <p>{createdAt}</p>
        </div>
      </div>

      <div className="csv-nps-dataset-metrics">
        <MiniMetric
          label="Responses"
          value={summary.total ?? dataset.valid_row_count}
        />
        <MiniMetric label="NPS" value={summary.nps} />
        <MiniMetric label="Promoters" value={summary.promoters} />
      </div>

      <div className="csv-nps-dataset-actions">
        <Link
          className="csv-nps-secondary-link"
          to={`/workspace/datasets/${dataset.id}/performance`}
        >
          Performance
        </Link>

        <Link
          className="csv-nps-secondary-link"
          to={`/workspace/datasets/${dataset.id}/responses`}
        >
          Responses
        </Link>

        <Link
          className="csv-nps-secondary-link"
          to={`/workspace/datasets/${dataset.id}/closing-the-loop`}
        >
          Closing the loop
        </Link>
      </div>
    </article>
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

function MiniMetric({ label, value }) {
  return (
    <div className="csv-nps-mini-metric">
      <span>{label}</span>
      <strong>{value ?? "—"}</strong>
    </div>
  );
}
