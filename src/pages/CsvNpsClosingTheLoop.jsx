// src/pages/CsvNpsClosingTheLoop.jsx
import React, { useEffect, useMemo, useState } from "react";
import CsvNpsWorkspaceNav from "../components/CsvNpsWorkspaceNav";

const ACTIONS_STORAGE_KEY = "csvNpsClosingLoopActions";

export default function CsvNpsClosingTheLoop() {
  const [dataset, setDataset] = useState(null);
  const [actions, setActions] = useState({});
  const [bucketFilter, setBucketFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const savedDataset = sessionStorage.getItem("csvNpsLatestDataset");

    if (savedDataset) {
      try {
        setDataset(JSON.parse(savedDataset));
      } catch (err) {
        console.error("Failed to read CSV NPS dataset from sessionStorage", err);
      }
    }

    const savedActions = sessionStorage.getItem(ACTIONS_STORAGE_KEY);

    if (savedActions) {
      try {
        setActions(JSON.parse(savedActions));
      } catch (err) {
        console.error("Failed to read CSV NPS actions from sessionStorage", err);
      }
    }
  }, []);

  function saveAction(responseId, patch) {
    setActions((current) => {
      const updated = {
        ...current,
        [responseId]: {
          status: "open",
          owner: "",
          actionTaken: "",
          updatedAt: null,
          ...(current[responseId] || {}),
          ...patch,
          updatedAt: new Date().toISOString(),
        },
      };

      sessionStorage.setItem(ACTIONS_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }

  const rows = useMemo(() => {
    const sourceRows = dataset?.rows || [];

    return sourceRows
      .map((row) => ({
        ...row,
        loopAction: actions[row.response_id] || {
          status: "open",
          owner: "",
          actionTaken: "",
          updatedAt: null,
        },
      }))
      .filter((row) => {
        const matchesBucket =
          bucketFilter === "all" || row.bucket === bucketFilter;

        const matchesStatus =
          statusFilter === "all" || row.loopAction.status === statusFilter;

        return matchesBucket && matchesStatus;
      })
      .sort((a, b) => {
        const bucketPriority = {
          detractor: 0,
          passive: 1,
          promoter: 2,
        };

        const aBucket = bucketPriority[a.bucket] ?? 99;
        const bBucket = bucketPriority[b.bucket] ?? 99;

        if (aBucket !== bBucket) return aBucket - bBucket;

        return Number(a.score) - Number(b.score);
      });
  }, [dataset, actions, bucketFilter, statusFilter]);

  const counts = useMemo(() => {
    const sourceRows = dataset?.rows || [];

    const total = sourceRows.length;
    const open = sourceRows.filter((row) => {
      const action = actions[row.response_id];
      return !action || action.status === "open";
    }).length;

    const inProgress = sourceRows.filter(
      (row) => actions[row.response_id]?.status === "in_progress"
    ).length;

    const closed = sourceRows.filter(
      (row) => actions[row.response_id]?.status === "closed"
    ).length;

    return { total, open, inProgress, closed };
  }, [dataset, actions]);

  if (!dataset) {
    return (
      <main className="csv-nps-page">
        <section className="csv-nps-hero">
          <p className="eyebrow">CSV NPS workspace</p>
          <h1>CSV NPS Closing the Loop</h1>
          <p>No CSV dataset has been analysed yet.</p>
        </section>

        <CsvNpsWorkspaceNav />

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

  return (
    <main className="csv-nps-page">
      <section className="csv-nps-hero">
        <p className="eyebrow">CSV NPS workspace</p>
        <h1>CSV NPS Closing the Loop</h1>
        <p>
          Track follow-up actions for customer feedback imported from your
          latest CSV dataset.
        </p>
      </section>

      <CsvNpsWorkspaceNav />

      <section className="csv-nps-results">
        <div className="csv-nps-responses-header">
          <div>
            <h2>Follow-up queue</h2>
            <p>
              Showing {rows.length} of {dataset.rows.length} responses.
            </p>
          </div>

          <div className="csv-nps-next-actions csv-nps-next-actions-tight">
            <a className="csv-nps-secondary-link" href="/csv-nps/upload">
              Upload
            </a>
            <a className="csv-nps-secondary-link" href="/csv-nps/performance">
              Performance
            </a>
            <a className="csv-nps-secondary-link" href="/csv-nps/responses">
              Responses
            </a>
          </div>
        </div>

        <div className="csv-nps-metric-grid">
          <MetricCard label="Total" value={counts.total} />
          <MetricCard label="Open" value={counts.open} />
          <MetricCard label="In progress" value={counts.inProgress} />
          <MetricCard label="Closed" value={counts.closed} />
        </div>

        <div className="csv-nps-filters">
          <label className="csv-nps-filter-field">
            <span>Bucket</span>
            <select
              value={bucketFilter}
              onChange={(e) => setBucketFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="detractor">Detractors</option>
              <option value="passive">Passives</option>
              <option value="promoter">Promoters</option>
            </select>
          </label>

          <label className="csv-nps-filter-field">
            <span>Status</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="open">Open</option>
              <option value="in_progress">In progress</option>
              <option value="closed">Closed</option>
            </select>
          </label>
        </div>

        <div className="csv-nps-loop-list">
          {rows.length === 0 ? (
            <div className="csv-nps-empty-state">
              No responses match the current filters.
            </div>
          ) : (
            rows.map((row) => (
              <ClosingLoopCard
                key={row.response_id}
                row={row}
                action={row.loopAction}
                onChange={(patch) => saveAction(row.response_id, patch)}
              />
            ))
          )}
        </div>
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

function ClosingLoopCard({ row, action, onChange }) {
  return (
    <article className={`csv-nps-loop-card csv-nps-loop-card-${row.bucket}`}>
      <div className="csv-nps-loop-card-main">
        <div className="csv-nps-loop-card-topline">
          <span className={`csv-nps-bucket csv-nps-bucket-${row.bucket}`}>
            {row.bucket}
          </span>

          <span className="csv-nps-loop-score">Score {row.score}</span>

          <span className={`csv-nps-loop-status csv-nps-loop-status-${action.status}`}>
            {formatStatus(action.status)}
          </span>
        </div>

        <h3>{row.customer_name || row.customer_email || "Unknown customer"}</h3>

        <p className="csv-nps-loop-meta">
          {row.customer_email || "No email"} ·{" "}
          {row.submitted_at?.slice(0, 10) || "No date"}
        </p>

        <blockquote>
          {row.comment || "No comment provided."}
        </blockquote>
      </div>

      <div className="csv-nps-loop-card-actions">
        <label className="csv-nps-filter-field">
          <span>Status</span>
          <select
            value={action.status || "open"}
            onChange={(e) => onChange({ status: e.target.value })}
          >
            <option value="open">Open</option>
            <option value="in_progress">In progress</option>
            <option value="closed">Closed</option>
          </select>
        </label>

        <label className="csv-nps-filter-field">
          <span>Owner</span>
          <input
            type="text"
            value={action.owner || ""}
            onChange={(e) => onChange({ owner: e.target.value })}
            placeholder="Who is following up?"
          />
        </label>

        <label className="csv-nps-filter-field csv-nps-loop-action-field">
          <span>Action taken / next step</span>
          <textarea
            value={action.actionTaken || ""}
            onChange={(e) => onChange({ actionTaken: e.target.value })}
            placeholder="Example: Called customer, apologised, offered fix, escalated issue..."
            rows={4}
          />
        </label>

        {action.updatedAt && (
          <p className="csv-nps-loop-updated">
            Updated {new Date(action.updatedAt).toLocaleString()}
          </p>
        )}
      </div>
    </article>
  );
}

function formatStatus(status) {
  if (status === "in_progress") return "In progress";
  if (status === "closed") return "Closed";
  return "Open";
}
