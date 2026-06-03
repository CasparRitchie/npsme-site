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
        const res = await fetch(`/api/workspace/datasets/${datasetId}`, {
          credentials: "include",
        });
        const data = await res.json();

        if (!res.ok || !data.ok) {
          throw new Error(data.error || "Failed to load saved dataset");
        }

        const normalised = normaliseSavedDataset(data);
        setDataset(normalised);

        const draftActions = readLocalActions(datasetId);
        setActions(draftActions);
      } catch (err) {
        console.error("Failed to load saved workspace dataset:", err);
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
          isSaving: false,
          saveError: "",
          ...(current[actionKey] || {}),
          ...patch,
          isDirty: true,
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

    const hasFollowUpText = String(action.actionTaken || "").trim();

    if (!hasFollowUpText) {
      setActions((current) => ({
        ...current,
        [actionKey]: {
          ...(current[actionKey] || action),
          saveError: "Please write a follow-up note before saving.",
        },
      }));

      return;
    }

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
      const res = await fetch(`/api/nps-data/rows/${row.db_row_id}/actions`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: action.status || "open",
          owner: action.owner || "",
          actionTaken: action.actionTaken || "",
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to save follow-up action");
      }

      const savedAction = normaliseSavedAction(data.action);

      setDataset((currentDataset) => {
        if (!currentDataset) return currentDataset;

        return {
          ...currentDataset,
          rows: currentDataset.rows.map((datasetRow) => {
            if (getActionKey(datasetRow) !== actionKey) {
              return datasetRow;
            }

            return {
              ...datasetRow,
              loopActions: [...(datasetRow.loopActions || []), savedAction],
            };
          }),
        };
      });

      setActions((current) => {
        const updated = {
          ...current,
          [actionKey]: {
            status: action.status || "open",
            owner: action.owner || "",
            actionTaken: "",
            updatedAt: null,
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

  function getLatestAction(savedActions = [], draftAction = null) {
    const allActions = [
      ...(Array.isArray(savedActions) ? savedActions : []),
      ...(draftAction && draftAction.updatedAt ? [draftAction] : []),
    ];

    if (!allActions.length) return null;

    return [...allActions].sort((a, b) => {
      const aDate = new Date(a.updatedAt || 0).getTime();
      const bDate = new Date(b.updatedAt || 0).getTime();
      return bDate - aDate;
    })[0];
  }

  const rows = useMemo(() => {
    const sourceRows = dataset?.rows || [];

    return sourceRows
      .map((row) => ({
        ...row,
        draftAction: actions[getActionKey(row)] || {
          status: "open",
          owner: "",
          actionTaken: "",
          updatedAt: null,
          isDirty: false,
          isSaving: false,
          saveError: "",
        },
        loopActions: row.loopActions || [],
      }))
      .filter((row) => {
        const matchesBucket =
          bucketFilter === "all" || row.bucket === bucketFilter;

        const latestSavedAction = getLatestAction(row.loopActions);
        const currentStatus = row.draftAction?.isDirty
          ? row.draftAction.status
          : latestSavedAction?.status || row.draftAction?.status || "open";

        const matchesStatus =
          statusFilter === "all" || currentStatus === statusFilter;

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

    const getCurrentRowStatus = (row) => {
      const actionKey = getActionKey(row);
      const draftAction = actions[actionKey];

      if (draftAction?.isDirty) {
        return draftAction.status || "open";
      }

      const latestSavedAction = getLatestAction(row.loopActions || []);
      return latestSavedAction?.status || draftAction?.status || "open";
    };

    const total = sourceRows.length;

    const open = sourceRows.filter(
      (row) => getCurrentRowStatus(row) === "open"
    ).length;

    const inProgress = sourceRows.filter(
      (row) => getCurrentRowStatus(row) === "in_progress"
    ).length;

    const closed = sourceRows.filter(
      (row) => getCurrentRowStatus(row) === "closed"
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
          <p>Loading close-the-loop data from workspace.</p>
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
                action={row.draftAction}
                savedActions={row.loopActions || []}
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

  const rows = savedRows.map((row) => ({
    db_row_id: row.id,
    response_id: row.response_id || row.id,
    source: row.source,
    row_number: row.row_number,
    submitted_at: row.submitted_at,
    score: row.score,
    bucket: row.bucket,
    customer_name: row.customer_name || null,
    customer_email: row.customer_email || null,
    contact_label: row.contact_label || "Contact",
    company: row.company || null,
    stage: row.stage || null,
    comment: row.comment || "",
    contact_id: row.contact_id || null,
    intercom_contact_url: row.intercom_contact_url || null,
    selected_options: row.selected_options_json || [],
    extra_scores: row.extra_scores_json || {},
    raw: row.raw_json || {},
    loopActions: normaliseSavedActions(row.close_loop_actions),
  }));

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

function normaliseSavedActions(actions = []) {
  if (!Array.isArray(actions) || actions.length === 0) {
    return [];
  }

  return [...actions]
    .sort((a, b) => {
      const aDate = new Date(a.updated_at || a.created_at || 0).getTime();
      const bDate = new Date(b.updated_at || b.created_at || 0).getTime();

      return aDate - bDate;
    })
    .map(normaliseSavedAction);
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
      `${row?.customer_email || row?.contact_label || "unknown"}-${row?.submitted_at || "no-date"}-${row?.score || "no-score"}`
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

function ClosingLoopCard({ row, action, savedActions = [], onChange, onSave }) {
  const hasSavedActions = savedActions.length > 0;

  const buttonLabel = action.isSaving
    ? "Saving..."
    : action.isDirty
      ? "Save follow-up"
      : hasSavedActions
        ? "Add another follow-up"
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

        <h3>{row.contact_label || row.customer_name || "Contact"}</h3>

        <p className="csv-nps-loop-meta">
          {row.submitted_at?.slice(0, 10) || "No date"}
        </p>

        <blockquote>{row.comment || "No comment provided."}</blockquote>

        {row.intercom_contact_url && (
          <p className="csv-nps-loop-meta">
            <a
              href={row.intercom_contact_url}
              target="_blank"
              rel="noreferrer"
              className="text-link"
            >
              Open in Intercom
            </a>
          </p>
        )}

        {savedActions.length > 0 && (
          <div className="csv-nps-loop-saved-actions">
            <span className="csv-nps-loop-saved-actions-title">
              Follow-up log
            </span>

            {savedActions.map((savedAction) => (
              <div
                key={savedAction.id || savedAction.updatedAt}
                className="csv-nps-loop-saved-action"
              >
                <div className="csv-nps-loop-saved-action-meta">
                  <strong>{formatStatus(savedAction.status)}</strong>

                  {savedAction.owner && <span>{savedAction.owner}</span>}

                  {savedAction.updatedAt && (
                    <span>
                      {new Date(savedAction.updatedAt).toLocaleString()}
                    </span>
                  )}
                </div>

                {savedAction.actionTaken && <p>{savedAction.actionTaken}</p>}
              </div>
            ))}
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
      </div>
    </article>
  );
}

function formatStatus(status) {
  if (status === "in_progress") return "In progress";
  if (status === "closed") return "Closed";
  return "Open";
}
