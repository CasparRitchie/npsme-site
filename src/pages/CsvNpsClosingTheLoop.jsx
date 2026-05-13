// src/pages/CsvNpsClosingTheLoop.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import CsvNpsWorkspaceNav from "../components/CsvNpsWorkspaceNav";
import WorkspaceDatasetHeader from "../components/WorkspaceDatasetHeader";

const ACTIONS_STORAGE_KEY = "csvNpsClosingLoopActions";

const PAGE_COPY = {
  eyebrow: "NPS Me Workspace",
  title: "Closing the loop",
  savedSubtitle:
    "Prioritise customer follow-up, assign owners and track actions for this saved feedback dataset.",
  sessionSubtitle:
    "Prioritise customer follow-up, assign owners and track actions for the latest browser-session dataset.",
};

export default function CsvNpsClosingTheLoop() {
  const { datasetId } = useParams();

  const [dataset, setDataset] = useState(null);
  const [actions, setActions] = useState({});
  const [loadingDataset, setLoadingDataset] = useState(Boolean(datasetId));
  const [datasetError, setDatasetError] = useState("");

  const [bucketFilter, setBucketFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

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

        const normalised = normaliseSavedDataset(data);
        setDataset(normalised);

        const savedActionsByActionKey = {};

        normalised.rows.forEach((row) => {
          if (row.loopAction) {
            savedActionsByActionKey[getActionKey(row)] = row.loopAction;
          }
        });

        const localActions = readLocalActions(datasetId);

        setActions({
          ...savedActionsByActionKey,
          ...localActions,
        });
      } catch (err) {
        console.error("Failed to load saved NPS dataset:", err);
        setDatasetError(err.message || "Failed to load saved dataset");
      } finally {
        setLoadingDataset(false);
      }
    }

    function loadSessionDataset() {
      const savedDataset = sessionStorage.getItem("csvNpsLatestDataset");

      if (savedDataset) {
        try {
          setDataset(JSON.parse(savedDataset));
        } catch (err) {
          console.error("Failed to read CSV NPS dataset from sessionStorage", err);
          setDatasetError("Failed to read latest browser-session dataset");
        }
      }

      setActions(readLocalActions("session"));
    }

    if (datasetId) {
      loadSavedDataset();
    } else {
      loadSessionDataset();
      setLoadingDataset(false);
    }
  }, [datasetId]);

  function saveAction(actionKey, patch) {
    setActions((current) => {
      const updated = {
        ...current,
        [actionKey]: {
          status: "open",
          owner: "",
          actionTaken: "",
          updatedAt: null,
          isDirty: true,
          isSaving: false,
          saveError: "",
          ...(current[actionKey] || {}),
          ...patch,
        },
      };

      writeLocalActions(datasetId || "session", updated);
      return updated;
    });
  }

  async function persistAction(row) {
    const actionKey = getActionKey(row);
    const action = actions[actionKey] || {
      status: "open",
      owner: "",
      actionTaken: "",
    };

    if (!datasetId || !row.db_row_id) {
      const updatedAction = {
        ...action,
        updatedAt: new Date().toISOString(),
        isDirty: false,
        isSaving: false,
        saveError: "",
      };

      setActions((current) => {
        const updated = {
          ...current,
          [actionKey]: updatedAction,
        };

        writeLocalActions(datasetId || "session", updated);
        return updated;
      });

      return;
    }

    setActions((current) => ({
      ...current,
      [actionKey]: {
        ...(current[actionKey] || action),
        isSaving: true,
        saveError: "",
      },
    }));

    try {
      const hasExistingAction = Boolean(action.id);

      const res = await fetch(
        hasExistingAction
          ? `/api/nps-data/actions/${action.id}`
          : `/api/nps-data/rows/${row.db_row_id}/actions`,
        {
          method: hasExistingAction ? "PATCH" : "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: action.status || "open",
            owner: action.owner || "",
            actionTaken: action.actionTaken || "",
          }),
        }
      );

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to save follow-up action");
      }

      const savedAction = normaliseSavedAction(data.action);

      setActions((current) => {
        const updated = {
          ...current,
          [actionKey]: {
            ...savedAction,
            isDirty: false,
            isSaving: false,
            saveError: "",
          },
        };

        writeLocalActions(datasetId || "session", updated);
        return updated;
      });
    } catch (err) {
      console.error("Failed to persist close-loop action:", err);

      setActions((current) => ({
        ...current,
        [actionKey]: {
          ...(current[actionKey] || action),
          isSaving: false,
          saveError: err.message || "Failed to save follow-up action",
        },
      }));
    }
  }

  const rows = useMemo(() => {
    const sourceRows = dataset?.rows || [];

    return sourceRows
      .map((row) => ({
        ...row,
        loopAction: actions[getActionKey(row)] || {
          status: "open",
          owner: "",
          actionTaken: "",
          updatedAt: null,
          isDirty: false,
          isSaving: false,
          saveError: "",
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
      const action = actions[getActionKey(row)];
      return !action || action.status === "open";
    }).length;

    const inProgress = sourceRows.filter(
      (row) => actions[getActionKey(row)]?.status === "in_progress"
    ).length;

    const closed = sourceRows.filter(
      (row) => actions[getActionKey(row)]?.status === "closed"
    ).length;

    return { total, open, inProgress, closed };
  }, [dataset, actions]);

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
          <p>Loading close-the-loop data from Supabase.</p>
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
            <h2>Follow-up queue</h2>
            <p>
              Showing {rows.length} of {dataset.rows.length} response
              {dataset.rows.length === 1 ? "" : "s"}.
            </p>
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
                key={getActionKey(row)}
                row={row}
                action={row.loopAction}
                onChange={(patch) => saveAction(getActionKey(row), patch)}
                onSave={() => persistAction(row)}
              />
            ))
          )}
        </div>
      </section>
    </main>
  );
}

function normaliseSavedDataset(apiResponse) {
  const savedDataset = apiResponse.dataset || {};
  const savedRows = apiResponse.rows || [];

  const rows = savedRows.map((row) => {
    const latestAction = getLatestCloseLoopAction(row.close_loop_actions);

    return {
      db_row_id: row.id,
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
      loopAction: latestAction,
    };
  });

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
    summary: savedDataset.summary_json || {},
    rows,
  };
}

function getLatestCloseLoopAction(actions = []) {
  if (!Array.isArray(actions) || actions.length === 0) {
    return null;
  }

  const sorted = [...actions].sort((a, b) => {
    const aDate = new Date(a.updated_at || a.created_at || 0).getTime();
    const bDate = new Date(b.updated_at || b.created_at || 0).getTime();

    return bDate - aDate;
  });

  const latest = sorted[0];

  return {
    id: latest.id,
    status: latest.status || "open",
    owner: latest.owner || "",
    actionTaken: latest.action_taken || "",
    updatedAt: latest.updated_at || latest.created_at || null,
    isDirty: false,
    isSaving: false,
    saveError: "",
  };
}

function normaliseSavedAction(action) {
  return {
    id: action.id,
    status: action.status || "open",
    owner: action.owner || "",
    actionTaken: action.action_taken || "",
    updatedAt: action.updated_at || action.created_at || null,
    isDirty: false,
    isSaving: false,
    saveError: "",
  };
}

function readLocalActions(scope) {
  const storageKey = getActionsStorageKey(scope);
  const savedActions = sessionStorage.getItem(storageKey);

  if (!savedActions) return {};

  try {
    return JSON.parse(savedActions);
  } catch (err) {
    console.error("Failed to read CSV NPS actions from sessionStorage", err);
    return {};
  }
}

function writeLocalActions(scope, actions) {
  const storageKey = getActionsStorageKey(scope);
  sessionStorage.setItem(storageKey, JSON.stringify(actions));
}

function getActionsStorageKey(scope) {
  return `${ACTIONS_STORAGE_KEY}:${scope || "session"}`;
}

function getActionKey(row) {
  return String(
    row?.db_row_id ||
      row?.response_id ||
      row?.row_number ||
      `${row?.customer_email || "unknown"}-${row?.submitted_at || "no-date"}-${row?.score || "no-score"}`
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

function ClosingLoopCard({ row, action, onChange, onSave }) {
  const hasSavedAction = Boolean(action.id || action.updatedAt);

  const buttonLabel = action.isSaving
    ? "Saving..."
    : action.isDirty
      ? "Save follow-up"
      : hasSavedAction
        ? "Saved"
        : "Save follow-up";

  return (
    <article className={`csv-nps-loop-card csv-nps-loop-card-${row.bucket}`}>
      <div className="csv-nps-loop-card-main">
        <div className="csv-nps-loop-card-topline">
          <span className={`csv-nps-bucket csv-nps-bucket-${row.bucket}`}>
            {row.bucket}
          </span>

          <span className="csv-nps-loop-score">Score {row.score}</span>

          <span
            className={`csv-nps-loop-status csv-nps-loop-status-${
              action.status || "open"
            }`}
          >
            {formatStatus(action.status)}
          </span>
        </div>

        <h3>{row.customer_name || row.customer_email || "Unknown customer"}</h3>

        <p className="csv-nps-loop-meta">
          {row.customer_email || "No email"} ·{" "}
          {row.submitted_at?.slice(0, 10) || "No date"}
        </p>

        <blockquote>{row.comment || "No comment provided."}</blockquote>

        {hasSavedAction && action.actionTaken && !action.isDirty && (
          <div className="csv-nps-loop-saved-action">
            <span>Saved follow-up action</span>
            <p>{action.actionTaken}</p>
          </div>
        )}

        {row.selected_options?.length > 0 && (
          <div className="csv-nps-loop-options">
            {row.selected_options.map((option) => (
              <span key={option}>{option}</span>
            ))}
          </div>
        )}
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
          <span>Action taken or next step</span>
          <textarea
            value={action.actionTaken || ""}
            onChange={(e) => onChange({ actionTaken: e.target.value })}
            placeholder="Example: Called customer, apologised, offered a fix, or escalated the issue..."
            rows={4}
          />
        </label>

        <button
          type="button"
          className="csv-nps-button"
          onClick={onSave}
          disabled={action.isSaving}
        >
          {buttonLabel}
        </button>

        {action.saveError && (
          <div className="csv-nps-error csv-nps-error-compact">
            {action.saveError}
          </div>
        )}

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
