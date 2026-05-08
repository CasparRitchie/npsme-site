// src/pages/NpsWorkspaceHome.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import CsvNpsWorkspaceNav from "../components/CsvNpsWorkspaceNav";

export default function NpsWorkspaceHome() {
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
        console.error("Failed to load NPS workspace home:", err);
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    loadWorkspaceHome();
  }, []);

  const latestDatasets = useMemo(() => datasets.slice(0, 3), [datasets]);

  const totals = useMemo(() => {
    return datasets.reduce(
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
  }, [datasets]);

  return (
    <main className="csv-nps-page">
      <section className="csv-nps-hero csv-nps-hero-compact">
        <p className="eyebrow">NPS Me Workspace</p>
        <h1>Feedback command centre</h1>
        <p>
          Import customer feedback, review NPS performance, inspect individual
          responses and manage close-the-loop follow-up from one private
          workspace.
        </p>
      </section>

      <CsvNpsWorkspaceNav />

      {error && <section className="csv-nps-error">{error}</section>}

      <section className="csv-nps-workspace-overview-grid">
        <WorkspaceActionCard
          title="Import feedback data"
          description="Paste CSV data or JSON survey exports and normalise them into a reusable NPS dataset."
          to="/workspace/import"
          cta="Import data"
        />

        <WorkspaceActionCard
          title="Saved datasets"
          description="Reopen previous imports, compare results and continue analysis from saved Supabase data."
          to="/workspace/datasets"
          cta="View datasets"
        />

        <WorkspaceActionCard
          title="Close the loop"
          description="Prioritise detractors, assign owners and record customer follow-up actions."
          to={
            latestDatasets[0]
              ? `/workspace/datasets/${latestDatasets[0].id}/closing-the-loop`
              : "/workspace/datasets"
          }
          cta="Open follow-up queue"
        />
      </section>

      <section className="csv-nps-results">
        <div className="csv-nps-responses-header">
          <div>
            <h2>Workspace snapshot</h2>
            <p>
              {loading
                ? "Loading your workspace activity..."
                : `${totals.datasets} saved dataset${
                    totals.datasets === 1 ? "" : "s"
                  } currently available.`}
            </p>
          </div>

          <Link className="csv-nps-button-link" to="/workspace/import">
            Import new data
          </Link>
        </div>

        <div className="csv-nps-metric-grid">
          <MetricCard label="Datasets" value={totals.datasets} />
          <MetricCard label="Responses" value={totals.responses} />
          <MetricCard label="Promoters" value={totals.promoters} />
          <MetricCard label="Passives" value={totals.passives} />
          <MetricCard label="Detractors" value={totals.detractors} />
        </div>

        <div className="csv-nps-workspace-home-grid">
          <section className="csv-nps-chart-card">
            <h3>Recent datasets</h3>
            <p>
              Jump back into the latest imported feedback datasets and continue
              analysis.
            </p>

            {loading ? (
              <div className="csv-nps-empty-state">Loading datasets...</div>
            ) : latestDatasets.length === 0 ? (
              <div className="csv-nps-empty-state">
                No datasets yet. Import feedback data to create your first
                workspace dataset.
              </div>
            ) : (
              <div className="csv-nps-workspace-recent-list">
                {latestDatasets.map((dataset) => (
                  <RecentDatasetCard key={dataset.id} dataset={dataset} />
                ))}
              </div>
            )}
          </section>

          <section className="csv-nps-chart-card">
            <h3>Current setup</h3>
            <p>
              This private alpha workspace is currently configured for
              CSV/JSON-style feedback imports and Supabase-backed persistence.
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
    <article className="csv-nps-workspace-recent-card">
      <div>
        <span className="csv-nps-source-badge">
          {(dataset.source_type || "unknown").toUpperCase()}
        </span>
        <h4>{dataset.dataset_name}</h4>
        <p>{createdAt}</p>
      </div>

      <div className="csv-nps-workspace-recent-metrics">
        <MiniMetric label="Responses" value={summary.total ?? dataset.valid_row_count} />
        <MiniMetric label="NPS" value={summary.nps} />
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
          Close the loop
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
