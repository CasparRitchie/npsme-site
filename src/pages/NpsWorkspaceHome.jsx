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
  const hasDatasets = datasets.length > 0;

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
          responses and manage close-the-loop follow-up from one private
          workspace.
        </p>
      </section>

      <CsvNpsWorkspaceNav />

      {error && <section className="csv-nps-error">{error}</section>}

      {!loading && !hasDatasets && (
        <section className="csv-nps-first-run-panel">
          <div>
            <span className="csv-nps-source-badge">New workspace</span>
            <h2>Start by importing your first feedback dataset</h2>
            <p>
              Your workspace is ready. Add a CSV or JSON export to create your
              first saved dataset, then NPS Me will unlock performance views,
              response search, AI insights and close-the-loop tracking.
            </p>
          </div>

          <div className="csv-nps-next-actions csv-nps-next-actions-tight">
            <Link className="csv-nps-button-link" to="/workspace/import">
              Import first dataset
            </Link>

            <Link className="csv-nps-secondary-link" to="/workspace/account">
              Check account setup
            </Link>
          </div>
        </section>
      )}

      <section className="csv-nps-workspace-overview-grid">
        <WorkspaceActionCard
          title="Import feedback data"
          description="Paste CSV data or JSON survey exports and normalise them into a reusable NPS dataset."
          to="/workspace/import"
          cta={hasDatasets ? "Import more data" : "Import first dataset"}
          badge={hasDatasets ? "Workspace" : "Start here"}
        />

        <WorkspaceActionCard
          title="Saved datasets"
          description="Reopen previous imports, compare results and continue analysis from saved Supabase data."
          to="/workspace/datasets"
          cta={hasDatasets ? "View datasets" : "No datasets yet"}
          badge={hasDatasets ? "Workspace" : "Waiting for data"}
          muted={!hasDatasets}
        />

        <WorkspaceActionCard
          title="Close the loop"
          description="Prioritise detractors, assign owners and record customer follow-up actions."
          to={
            latestDatasets[0]
              ? `/workspace/datasets/${latestDatasets[0].id}/closing-the-loop`
              : "/workspace/import"
          }
          cta={hasDatasets ? "Open follow-up queue" : "Import data first"}
          badge={hasDatasets ? "Workspace" : "Next step"}
          muted={!hasDatasets}
        />
      </section>

      <section className="csv-nps-results">
        <div className="csv-nps-responses-header">
          <div>
            <h2>Workspace snapshot</h2>
            <p>
              {loading
                ? "Loading your workspace activity..."
                : hasDatasets
                  ? `${totals.datasets} saved dataset${
                      totals.datasets === 1 ? "" : "s"
                    } currently available.`
                  : "Your workspace is active, but no feedback datasets have been imported yet."}
            </p>
          </div>

          <Link className="csv-nps-button-link" to="/workspace/import">
            {hasDatasets ? "Import new data" : "Import first dataset"}
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
            <h3>{hasDatasets ? "Recent datasets" : "What happens next?"}</h3>
            <p>
              {hasDatasets
                ? "Jump back into the latest imported feedback datasets and continue analysis."
                : "Once you import data, this area will show your latest datasets and shortcuts into performance, responses and close-the-loop activity."}
            </p>

            {loading ? (
              <div className="csv-nps-empty-state">Loading datasets...</div>
            ) : latestDatasets.length === 0 ? (
              <FirstRunChecklist />
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
              This workspace is configured for private customer feedback
              analysis, saved datasets and close-the-loop workflows.
            </p>

            <div className="csv-nps-workspace-status-list">
              <StatusRow
                label="Workspace"
                value={workspace?.workspace_name || "Workspace"}
                status="ready"
              />
              <StatusRow label="Individual login" value="Active" status="ready" />
              <StatusRow label="Data storage" value="Supabase" status="ready" />
              <StatusRow
                label="Datasets"
                value={hasDatasets ? `${totals.datasets} saved` : "None yet"}
                status={hasDatasets ? "ready" : "waiting"}
              />
              <StatusRow
                label="Close-the-loop queue"
                value={hasDatasets ? "Available" : "Waiting for data"}
                status={hasDatasets ? "ready" : "waiting"}
              />
              <StatusRow label="Product stage" value="Private workspace" status="ready" />
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

function WorkspaceActionCard({
  title,
  description,
  to,
  cta,
  badge = "Workspace",
  muted = false,
}) {
  return (
    <Link
      className={`csv-nps-workspace-action-card${
        muted ? " csv-nps-workspace-action-card-muted" : ""
      }`}
      to={to}
    >
      <span className="csv-nps-source-badge">{badge}</span>
      <h2>{title}</h2>
      <p>{description}</p>
      <strong>{cta}</strong>
    </Link>
  );
}

function FirstRunChecklist() {
  return (
    <div className="csv-nps-first-run-checklist">
      <FirstRunStep
        number="1"
        title="Import feedback"
        description="Paste or upload a CSV/JSON export containing customer names, scores, dates and comments."
        to="/workspace/import"
        cta="Go to import"
      />

      <FirstRunStep
        number="2"
        title="Review performance"
        description="Once saved, NPS Me creates performance, response and close-the-loop views for that dataset."
      />

      <FirstRunStep
        number="3"
        title="Act on feedback"
        description="Use the close-the-loop queue to assign follow-up, record actions and keep customer issues visible."
      />
    </div>
  );
}

function FirstRunStep({ number, title, description, to, cta }) {
  return (
    <article className="csv-nps-first-run-step">
      <span>{number}</span>
      <div>
        <h4>{title}</h4>
        <p>{description}</p>
        {to && cta && (
          <Link className="csv-nps-secondary-link" to={to}>
            {cta}
          </Link>
        )}
      </div>
    </article>
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
        <MiniMetric
          label="Responses"
          value={summary.total ?? dataset.valid_row_count}
        />
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

function StatusRow({ label, value, status = "ready" }) {
  return (
    <div className="csv-nps-workspace-status-row">
      <span>{label}</span>
      <strong>
        <span
          className={`csv-nps-workspace-status-dot csv-nps-workspace-status-dot-${status}`}
          aria-hidden="true"
        />
        {value}
      </strong>
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
