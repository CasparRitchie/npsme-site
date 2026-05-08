// src/pages/NpsDatasets.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CsvNpsWorkspaceNav from "../components/CsvNpsWorkspaceNav";

export default function NpsDatasets() {
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDatasets() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/nps-data/datasets");
      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to load datasets");
      }

      setDatasets(data.datasets || []);
    } catch (err) {
      console.error("Failed to load NPS datasets:", err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(datasetId) {
    const confirmed = window.confirm(
      "Delete this dataset? This will also delete its saved rows and close-the-loop actions."
    );

    if (!confirmed) return;

    try {
      const res = await fetch(`/api/nps-data/datasets/${datasetId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to delete dataset");
      }

      setDatasets((current) =>
        current.filter((dataset) => dataset.id !== datasetId)
      );
    } catch (err) {
      console.error("Failed to delete dataset:", err);
      setError(err.message || "Failed to delete dataset");
    }
  }

  useEffect(() => {
    loadDatasets();
  }, []);

  return (
    <main className="csv-nps-page">
      <section className="csv-nps-hero">
        <p className="eyebrow">NPS data workspace</p>
        <h1>Saved NPS Datasets</h1>
        <p>
          Reopen previously imported CSV or JSON datasets, review their NPS
          performance, inspect responses, and continue close-the-loop actions.
        </p>
      </section>

      <CsvNpsWorkspaceNav />

      <section className="csv-nps-results">
        <div className="csv-nps-responses-header">
          <div>
            <h2>Your datasets</h2>
            <p>
              {loading
                ? "Loading saved datasets..."
                : `${datasets.length} saved dataset${
                    datasets.length === 1 ? "" : "s"
                  } found.`}
            </p>
          </div>

          <Link className="csv-nps-button-link" to="/csv-nps/upload">
            Import new data
          </Link>
        </div>

        {error && <div className="csv-nps-error">{error}</div>}

        {!loading && datasets.length === 0 && !error && (
          <div className="csv-nps-empty-state">
            No saved datasets yet. Import CSV or JSON data first, then save it
            here.
          </div>
        )}

        {datasets.length > 0 && (
          <div className="csv-nps-dataset-grid">
            {datasets.map((dataset) => (
              <DatasetCard
                key={dataset.id}
                dataset={dataset}
                onDelete={() => handleDelete(dataset.id)}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function DatasetCard({ dataset, onDelete }) {
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

        <button
          type="button"
          className="csv-nps-danger-button"
          onClick={onDelete}
        >
          Delete
        </button>
      </div>

      <div className="csv-nps-dataset-metrics">
        <MiniMetric label="Responses" value={summary.total ?? dataset.valid_row_count} />
        <MiniMetric label="NPS" value={summary.nps} />
        <MiniMetric label="Promoters" value={summary.promoters} />
        <MiniMetric label="Passives" value={summary.passives} />
        <MiniMetric label="Detractors" value={summary.detractors} />
      </div>

      <div className="csv-nps-dataset-meta">
        <span>Raw rows: {dataset.raw_row_count}</span>
        <span>Valid rows: {dataset.valid_row_count}</span>
        <span>Skipped: {dataset.skipped_row_count}</span>
      </div>

      <div className="csv-nps-dataset-actions">
        <Link
          className="csv-nps-secondary-link"
          to={`/csv-nps/datasets/${dataset.id}/performance`}
        >
          Performance
        </Link>

        <Link
          className="csv-nps-secondary-link"
          to={`/csv-nps/datasets/${dataset.id}/responses`}
        >
          Responses
        </Link>

        <Link
          className="csv-nps-secondary-link"
          to={`/csv-nps/datasets/${dataset.id}/closing-the-loop`}
        >
          Closing the loop
        </Link>
      </div>
    </article>
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
