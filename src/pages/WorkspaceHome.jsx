// src/pages/WorkspaceHome.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CsvNpsWorkspaceNav from "../components/CsvNpsWorkspaceNav";
import { workspaceFetch } from "../utils/workspaceApi";

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
        const [workspaceData, datasetsData] = await Promise.all([
          workspaceFetch("/api/nps-data/workspace"),
          workspaceFetch("/api/nps-data/datasets"),
        ]);

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
      <section className="csv-nps-hero csv-nps-hero-compact">
        <p className="eyebrow">NPS Me Workspace</p>
        <h1>Feedback command centre</h1>
        <p>
          Import customer feedback, review NPS performance, inspect individual
          responses, and manage close-the-loop follow-up from one protected
          workspace.
        </p>
      </section>

      <CsvNpsWorkspaceNav />

      {error && <section className="csv-nps-error">{error}</section>}

      <section className="csv-nps-workspace-overview-grid">
        <WorkspaceActionCard
          title="Import feedback data"
          description="Paste CSV data or JSON survey exports and turn them into a reusable NPS dataset."
          to="/workspace/import"
          cta="Import data"
        />

        <WorkspaceActionCard
          title="Review saved datasets"
          description="Reopen previous imports, review NPS performance, and inspect customer responses."
          to="/workspace/datasets"
          cta="View datasets"
        />

        <WorkspaceActionCard
          title="Close the loop"
          description="Prioritise detractors, assign owners, track next steps, and keep follow-up visible."
          to={
            latestDatasets[0]
              ? `/workspace/datasets/${latestDatasets[0].id}/closing-the-loop`
              : "/workspace/datasets"
          }
          cta="Open action queue"
        />
      </section>

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

        <div className="csv-nps-workspace-home-grid">
          <section className="csv-nps-chart-card">
            <h3>Recent datasets</h3>
            <p>
              Reopen performance, responses, or close-the-loop views from your
              latest saved imports.
            </p>

            {loading ? (
              <div className="csv-nps-empty-state">
                Loading recent datasets...
              </div>
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

            <div className="csv-nps-next-actions">
              <Link className="csv-nps-secondary-link" to="/workspace/datasets">
                View all datasets
              </Link>
            </div>
          </section>

          <section className="csv-nps-chart-card">
            <h3>Current setup</h3>
            <p>
              This private alpha workspace is currently configured for imported
              feedback datasets, Supabase storage, and persistent follow-up
              actions.
            </p>

            <div className="csv-nps-workspace-status-list">
              <StatusRow
                label="Workspace"
                value={workspace?.workspace_name || "NPS Me Internal"}
              />
              <StatusRow label="Data source" value="CSV / JSON import" />
              <StatusRow label="Storage" value="Supabase" />
              <StatusRow label="Access" value="Private password-protected" />
              <StatusRow label="Product stage" value="Internal alpha" />
            </div>

            <div className="csv-nps-next-actions">
              <Link className="csv-nps-secondary-link" to="/workspace/import">
                Import new data
              </Link>

              <Link className="csv-nps-secondary-link" to="/workspace/datasets">
                Manage datasets
              </Link>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

function WorkspaceActionCard({ title, description, to, cta }) {
  return (
    <Link className="csv-nps-workspace-action-card" to={to}>
      <span className="csv-nps-source-badge">Workspace</span>
      <h2>{title}</h2>
      <p>{description}</p>
      <strong>{cta}</strong>
    </Link>
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

function StatusRow({ label, value }) {
  return (
    <div className="csv-nps-workspace-status-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
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
