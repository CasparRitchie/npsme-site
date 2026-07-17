import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import CsvNpsWorkspaceNav from "../components/CsvNpsWorkspaceNav";
import WorkspaceDatasetHeader from "../components/WorkspaceDatasetHeader";

const ACTIONS_STORAGE_KEY = "csvNpsClosingLoopActions";
const CANONICAL_PAGE_LIMIT = 200;

const EMPTY_CANONICAL_SUMMARY = {
  totalMatchingResponses: 0,
  noCase: 0,
  open: 0,
  inProgress: 0,
  closed: 0,
  openDetractors: 0,
  highPriorityActive: 0,
  unassignedActive: 0,
};

const PAGE_COPY = {
  eyebrow: "NPS Me Workspace",
  title: "Closing the loop",
  savedSubtitle:
    "Prioritise customer follow-up, assign owners and track actions for this saved feedback dataset.",
  sessionSubtitle:
    "Prioritise customer follow-up, assign owners and track actions for the latest browser-session dataset.",
  intercomSubtitle:
    "Prioritise customer follow-up, assign owners and track actions for the active Intercom source in this workspace.",
};

export default function CsvNpsClosingTheLoop() {
  const { datasetId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedResponseRef = searchParams.get("response");
  const isWorkspaceRoute = /^\/(?:fr\/)?workspace(?:\/|$)/.test(
    window.location.pathname
  );

  const [dataset, setDataset] = useState(null);
  const [actions, setActions] = useState({});
  const [loadingDataset, setLoadingDataset] = useState(Boolean(datasetId));
  const [datasetError, setDatasetError] = useState("");
  const [mode, setMode] = useState(datasetId ? "saved" : "unknown");
  const [actionScope, setActionScope] = useState(datasetId || "session");
  const [permissions, setPermissions] = useState({
    canRead: false,
    canMutate: false,
    role: null,
  });
  const [assignableOwners, setAssignableOwners] = useState([]);
  const [canonicalSummary, setCanonicalSummary] = useState(
    EMPTY_CANONICAL_SUMMARY
  );
  const [canonicalPagination, setCanonicalPagination] = useState(null);

  const [bucketFilter, setBucketFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [periodFilter, setPeriodFilter] = useState("all");

  const [replyDraft, setReplyDraft] = useState(null);
  const [replyDraftLoading, setReplyDraftLoading] = useState(false);
  const [replyDraftError, setReplyDraftError] = useState("");
  const [replyDraftCopied, setReplyDraftCopied] = useState(false);

  const selectedResponsePanelRef = useRef(null);


  useEffect(() => {
    async function loadCanonicalWorkspaceQueue() {
      setLoadingDataset(true);
      setDatasetError("");

      try {
        const params = new URLSearchParams();
        params.set("limit", String(CANONICAL_PAGE_LIMIT));
        if (datasetId) params.set("datasetId", datasetId);

        const response = await fetch(
          `/api/workspace/closing-loop?${params.toString()}`,
          { credentials: "include" }
        );
        const data = await response.json();

        if (!response.ok || !data.ok) {
          if (response.status === 401) {
            throw new Error("Your Workspace session has expired. Please sign in again.");
          }

          if (response.status === 403) {
            throw new Error("Your Workspace access is no longer active.");
          }

          throw new Error(
            data?.error?.message || "Failed to load the Closing the Loop queue"
          );
        }

        const owners = Array.isArray(data.assignableOwners)
          ? data.assignableOwners
          : [];

        setDataset(normaliseCanonicalClosingLoop(data, datasetId));
        setPermissions({
          canRead: data.permissions?.canRead === true,
          canMutate: data.permissions?.canMutate === true,
          role: data.permissions?.role || null,
        });
        setAssignableOwners(owners);
        setCanonicalSummary({
          ...EMPTY_CANONICAL_SUMMARY,
          ...(data.summary || {}),
        });
        setCanonicalPagination(data.pagination || null);
        setActions({});
        setMode("canonical");
      } catch (err) {
        console.error("Failed to load canonical Closing the Loop queue:", err);
        setDatasetError(
          err.message || "Failed to load the Closing the Loop queue"
        );
      } finally {
        setLoadingDataset(false);
      }
    }

    async function loadSavedDataset() {
      setLoadingDataset(true);
      setDatasetError("");

      try {
        const datasetMetaRes = await fetch(`/api/workspace/datasets/${datasetId}`, {
          credentials: "include",
        });

        const datasetMeta = await datasetMetaRes.json();

        if (!datasetMetaRes.ok || !datasetMeta.ok) {
          throw new Error(datasetMeta.error || "Failed to load saved dataset");
        }

        const sourceType = String(datasetMeta?.dataset?.source_type || "").trim();

        if (sourceType === "workspace_intercom") {
          const params = new URLSearchParams();
          params.set("limit", "500");

          const intercomRes = await fetch(
            `/api/workspace-intercom/responses?${params.toString()}`,
            {
              credentials: "include",
            }
          );

          const intercomData = await intercomRes.json();

          if (!intercomRes.ok || !intercomData.ok) {
            throw new Error(
              intercomData.error || "Failed to load workspace Intercom responses"
            );
          }

          const scope = `intercom:${intercomData?.source?.id || "active"}`;

          setDataset(
            normaliseWorkspaceIntercomDataset({
              dataset: intercomData.dataset || datasetMeta.dataset,
              source: intercomData.source,
              summary: intercomData.summary,
              rows: intercomData.rows,
            })
          );
          setActions(readLocalActions(scope));
          setActionScope(scope);
          setMode("intercom");
          return;
        }

        const normalised = normaliseSavedDataset(datasetMeta);
        setDataset(normalised);
        setActions(readLocalActions(datasetId));
        setActionScope(datasetId);
        setMode("saved");
      } catch (err) {
        console.error("Failed to load saved workspace dataset:", err);
        setDatasetError(err.message || "Failed to load saved dataset");
      } finally {
        setLoadingDataset(false);
      }
    }

    async function loadActiveIntercomDataset() {
      try {
        const params = new URLSearchParams();
        params.set("limit", "500");

        const intercomRes = await fetch(
          `/api/workspace-intercom/responses?${params.toString()}`,
          {
            credentials: "include",
          }
        );

        const intercomData = await intercomRes.json();

        if (!intercomRes.ok || !intercomData.ok) {
          throw new Error(
            intercomData.error || "Failed to load workspace Intercom responses"
          );
        }

        const scope = `intercom:${intercomData?.source?.id || "active"}`;

        setDataset(
          normaliseWorkspaceIntercomDataset({
            dataset: intercomData.dataset || {
              id: null,
              dataset_name: intercomData?.source?.source_name || "Active Intercom source",
              source_type: "workspace_intercom",
              content_id: intercomData?.content_id || intercomData?.source?.survey_content_id || null,
              raw_row_count: intercomData?.summary?.total || intercomData?.rows?.length || 0,
              valid_row_count: intercomData?.summary?.total || intercomData?.rows?.length || 0,
              skipped_row_count: 0,
              summary_json: intercomData?.summary || {},
            },
            source: intercomData.source,
            summary: intercomData.summary,
            rows: intercomData.rows,
          })
        );
        setActions(readLocalActions(scope));
        setActionScope(scope);
        setMode("intercom");
        return true;
      } catch (_err) {
        return false;
      }
    }

    function loadSessionDataset() {
      const savedDataset = sessionStorage.getItem("csvNpsLatestDataset");

      if (savedDataset) {
        try {
          const parsed = JSON.parse(savedDataset);
          setDataset(normaliseSessionDataset(parsed));
          setActions(readLocalActions("session"));
          setActionScope("session");
          setMode("session");
          return true;
        } catch (err) {
          console.error("Failed to read CSV NPS dataset from sessionStorage", err);
          setDatasetError("Failed to read latest browser-session dataset");
        }
      }

      return false;
    }

    async function loadWithoutDatasetId() {
      setLoadingDataset(true);
      setDatasetError("");

      try {
        const loadedIntercom = await loadActiveIntercomDataset();

        if (!loadedIntercom) {
          loadSessionDataset();
        }
      } finally {
        setLoadingDataset(false);
      }
    }

    if (isWorkspaceRoute) {
      loadCanonicalWorkspaceQueue();
    } else if (datasetId) {
      loadSavedDataset();
    } else {
      loadWithoutDatasetId();
    }
  }, [datasetId, isWorkspaceRoute]);

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

      writeLocalActions(actionScope, updated);
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

    if (mode !== "session") {
      setActions((current) => ({
        ...current,
        [actionKey]: {
          ...(current[actionKey] || action),
          isSaving: false,
          saveError: "Case updates are read-only in this release.",
        },
      }));
      return;
    }

    const localSavedAction = {
      id: `local-${Date.now()}`,
      status: action.status || "open",
      owner: action.owner || "",
      actionTaken: action.actionTaken || "",
      updatedAt: new Date().toISOString(),
      isDirty: false,
      isSaving: false,
      saveError: "",
    };

    setDataset((currentDataset) => {
      if (!currentDataset) return currentDataset;

      return {
        ...currentDataset,
        rows: currentDataset.rows.map((datasetRow) =>
          getActionKey(datasetRow) === actionKey
            ? {
                ...datasetRow,
                loopActions: [...(datasetRow.loopActions || []), localSavedAction],
              }
            : datasetRow
        ),
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

      writeLocalActions(actionScope, updated);
      return updated;
    });
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

  const enrichedRows = useMemo(() => {
    const sourceRows = dataset?.rows || [];

    return sourceRows.map((row) => {
      if (mode === "canonical") {
        return {
          ...row,
          draftAction: {
            status: row.case?.status || "no_case",
            owner: row.caseOwnerLabel || "",
            actionTaken: "",
            updatedAt: null,
            isDirty: false,
            isSaving: false,
            saveError: "",
          },
          loopActions: row.loopActions || [],
          latestSavedAction: row.latestLegacyAction || null,
          currentStatus: row.case?.status || "no_case",
        };
      }

      const actionKey = getActionKey(row);
      const draftAction = actions[actionKey] || {
        status: "open",
        owner: "",
        actionTaken: "",
        updatedAt: null,
        isDirty: false,
        isSaving: false,
        saveError: "",
      };

      const latestSavedAction = getLatestAction(row.loopActions || []);

      const currentStatus = draftAction?.isDirty
        ? draftAction.status || "open"
        : latestSavedAction?.status || draftAction?.status || "open";

      return {
        ...row,
        draftAction,
        loopActions: row.loopActions || [],
        latestSavedAction,
        currentStatus,
      };
    });
  }, [dataset, actions, mode]);

  const periodRows = useMemo(() => {
    if (mode === "canonical") return enrichedRows;

    return enrichedRows.filter((row) =>
      matchesPeriod(row.submitted_at, periodFilter)
    );
  }, [enrichedRows, mode, periodFilter]);

  const rows = useMemo(() => {
    if (mode === "canonical") {
      return [...periodRows].sort(sortClosingLoopRows);
    }

    return periodRows
      .filter((row) => {
        const matchesBucket =
          bucketFilter === "all" || row.bucket === bucketFilter;

        const matchesStatus =
          statusFilter === "all" || row.currentStatus === statusFilter;

        return matchesBucket && matchesStatus;
      })
      .sort(sortClosingLoopRows);
  }, [periodRows, bucketFilter, statusFilter, mode]);

  const selectedRow = useMemo(() => {
    if (!selectedResponseRef) return null;

    return enrichedRows.find((row) => {
      const refs = [
        row.db_row_id,
        row.dataset_row_id,
        row.response_id,
        getActionKey(row),
      ]
        .filter(Boolean)
        .map((value) => String(value));

      return refs.includes(String(selectedResponseRef));
    });
  }, [enrichedRows, selectedResponseRef]);

  function scrollToSelectedResponsePanel() {
    window.setTimeout(() => {
      selectedResponsePanelRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 80);
  }

  useEffect(() => {
    if (!selectedRow) return;

    scrollToSelectedResponsePanel();
  }, [selectedRow]);

  useEffect(() => {
    setReplyDraft(null);
    setReplyDraftError("");
    setReplyDraftCopied(false);
  }, [selectedResponseRef]);

  const counts = useMemo(() => {
    if (mode === "canonical") {
      return {
        total: canonicalSummary.totalMatchingResponses,
        noCase: canonicalSummary.noCase,
        open: canonicalSummary.open,
        inProgress: canonicalSummary.inProgress,
        closed: canonicalSummary.closed,
        openDetractors: canonicalSummary.openDetractors,
        highPriorityActive: canonicalSummary.highPriorityActive,
        unassignedActive: canonicalSummary.unassignedActive,
      };
    }

    const total = periodRows.length;
    const open = periodRows.filter((row) => row.currentStatus === "open").length;
    const inProgress = periodRows.filter(
      (row) => row.currentStatus === "in_progress"
    ).length;
    const closed = periodRows.filter((row) => row.currentStatus === "closed").length;

    const detractors = periodRows.filter((row) => row.bucket === "detractor").length;
    const openDetractors = periodRows.filter(
      (row) => row.bucket === "detractor" && row.currentStatus !== "closed"
    ).length;

    return {
      total,
      noCase: 0,
      open,
      inProgress,
      closed,
      detractors,
      openDetractors,
      highPriorityActive: 0,
      unassignedActive: 0,
    };
  }, [canonicalSummary, mode, periodRows]);

  const urgentDetractors = useMemo(() => {
    return periodRows
      .filter(
        (row) => row.bucket === "detractor" && row.currentStatus === "open"
      )
      .sort((a, b) => {
        const scoreDiff = Number(a.score ?? 999) - Number(b.score ?? 999);
        if (scoreDiff !== 0) return scoreDiff;

        return String(b?.submitted_at || "").localeCompare(
          String(a?.submitted_at || "")
        );
      })
      .slice(0, 5);
  }, [periodRows]);

  const subtitle = mode === "canonical"
    ? PAGE_COPY.savedSubtitle
    : datasetId
    ? PAGE_COPY.savedSubtitle
    : mode === "intercom"
      ? PAGE_COPY.intercomSubtitle
      : PAGE_COPY.sessionSubtitle;
  async function generateReplyDraft(row) {
  const datasetRowId = row.db_row_id || row.dataset_row_id;

  if (!datasetRowId) {
    setReplyDraft(null);
    setReplyDraftError(
      "This response does not have a saved workspace row ID yet, so a reply draft cannot be generated."
    );
    return;
  }

  setReplyDraft(null);
  setReplyDraftError("");
  setReplyDraftCopied(false);
  setReplyDraftLoading(true);

  try {
    const res = await fetch(`/api/nps-data/rows/${datasetRowId}/reply-draft`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        language: "fr",
        tone: "warm_professional",
        channel: "intercom",
      }),
    });

    const data = await res.json();

    if (!res.ok || !data.ok) {
      throw new Error(data.error || "Failed to generate reply draft");
    }

    setReplyDraft(data.draft || null);
  } catch (err) {
    console.error("Failed to generate reply draft:", err);
    setReplyDraftError(err.message || "Failed to generate reply draft");
  } finally {
    setReplyDraftLoading(false);
  }
}

async function copyReplyDraft() {
  const body = replyDraft?.body || "";

  if (!body) return;

  try {
    await navigator.clipboard.writeText(body);
    setReplyDraftCopied(true);

    window.setTimeout(() => {
      setReplyDraftCopied(false);
    }, 1800);
  } catch (err) {
    console.error("Failed to copy reply draft:", err);
    setReplyDraftError("Could not copy the draft automatically. Please copy it manually.");
  }
}

function selectRow(row) {
  const responseRef =
    row.db_row_id ||
    row.dataset_row_id ||
    row.response_id ||
    getActionKey(row);

  if (!responseRef) return;

  setSearchParams({
    response: String(responseRef),
  });

  scrollToSelectedResponsePanel();
}

  if (loadingDataset) {
    return (
      <main className="csv-nps-page">
        <section className="csv-nps-hero csv-nps-hero-compact">
          <p className="eyebrow">{PAGE_COPY.eyebrow}</p>
          <h1>{PAGE_COPY.title}</h1>
          <p>Loading follow-up queue...</p>
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
        <p>{subtitle}</p>
      </section>

      <CsvNpsWorkspaceNav />

      {datasetId && <WorkspaceDatasetHeader dataset={dataset} />}

      <section className="csv-nps-results">
        <div className="csv-nps-responses-header">
          <div>
            <h2>Follow-up queue</h2>
            <p>
              Showing {rows.length} of{" "}
              {mode === "canonical"
                ? canonicalPagination?.totalMatching ?? counts.total
                : dataset.rows.length}{" "}
              response
              {(mode === "canonical"
                ? canonicalPagination?.totalMatching ?? counts.total
                : dataset.rows.length) === 1
                ? ""
                : "s"}.
            </p>
          </div>
        </div>

        {mode === "canonical" && (
          <div className="csv-nps-panel">
            <strong>
              {permissions.role === "viewer"
                ? "Read-only Workspace access"
                : "Case workflow is temporarily read-only"}
            </strong>
            <p>
              {permissions.role === "viewer"
                ? "Your current Workspace role can review cases and history but cannot change them."
                : "Canonical cases and history are now shown here. Case updates will be connected in the next workflow release."}
            </p>
            <p className="csv-nps-muted-cell">
              Effective role: {permissions.role || "unknown"} · Assignable owners: {assignableOwners.length}
            </p>
          </div>
        )}

        <div className="csv-nps-metric-grid">
          <MetricCard label="Total" value={counts.total} />
          {mode === "canonical" && (
            <MetricCard label="No case" value={counts.noCase} />
          )}
          <MetricCard label="Open" value={counts.open} />
          <MetricCard label="In progress" value={counts.inProgress} />
          <MetricCard label="Closed" value={counts.closed} />
          <MetricCard label="Open detractors" value={counts.openDetractors} />
          {mode === "canonical" && (
            <>
              <MetricCard
                label="High-priority active"
                value={counts.highPriorityActive}
              />
              <MetricCard
                label="Unassigned active"
                value={counts.unassignedActive}
              />
            </>
          )}
        </div>
        <CloseLoopStatusChart counts={counts} showNoCase={mode === "canonical"} />

        {selectedRow && (
          <div ref={selectedResponsePanelRef} id="selected-response-detail">
            <SelectedResponsePanel
              row={selectedRow}
              replyDraft={replyDraft}
              replyDraftLoading={replyDraftLoading}
              replyDraftError={replyDraftError}
              replyDraftCopied={replyDraftCopied}
              onGenerateDraft={() => generateReplyDraft(selectedRow)}
              onCopyDraft={copyReplyDraft}
              onDraftChange={(body) =>
                setReplyDraft((current) => ({
                  ...(current || {}),
                  body,
                }))
              }
              action={selectedRow.draftAction}
              savedActions={selectedRow.loopActions || []}
              currentStatus={selectedRow.currentStatus}
              onActionChange={(patch) =>
                saveAction(getActionKey(selectedRow), patch)
              }
              onSaveAction={() => persistAction(selectedRow)}
              readOnly={mode === "canonical"}
            />
          </div>
        )}

        <UrgentDetractorsPanel rows={urgentDetractors} />

        {mode === "canonical" ? (
          <p className="csv-nps-muted-cell">
            Workspace-wide filters and load-more controls will be connected to
            the server-side read contract in a later frontend update.
          </p>
        ) : (
        <div className="csv-nps-filters csv-nps-filters-three">
          <label className="csv-nps-filter-field">
            <span>Period</span>
            <select
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value)}
            >
              <option value="all">All time</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="this_month">This month</option>
            </select>
          </label>

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
        )}

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
                currentStatus={row.currentStatus}
                isSelected={
                  selectedRow && getActionKey(selectedRow) === getActionKey(row)
                }
                onSelect={() => selectRow(row)}
                onChange={(patch) => saveAction(getActionKey(row), patch)}
                onSave={() => persistAction(row)}
                readOnly={mode === "canonical"}
              />
            ))
          )}
        </div>
      </section>
    </main>
  );
}

function normaliseCanonicalClosingLoop(apiResponse, requestedDatasetId) {
  const apiRows = Array.isArray(apiResponse.rows) ? apiResponse.rows : [];
  const ownersByMembershipId = new Map(
    (apiResponse.assignableOwners || []).map((owner) => [
      owner.membershipId,
      owner,
    ])
  );
  const firstDataset = apiRows[0]?.datasets || {};

  const rows = apiRows.map((row) => {
    const closingCase = row.case || null;
    const caseOwner = closingCase?.owner_membership_id
      ? ownersByMembershipId.get(closingCase.owner_membership_id)
      : null;
    const latestLegacyAction = row.latest_legacy_action
      ? {
          ...normaliseSavedAction(row.latest_legacy_action),
          isLegacy: true,
        }
      : null;

    return {
      ...row,
      db_row_id: row.id,
      dataset_row_id: row.id,
      response_id: row.response_id || row.id,
      submitted_at: row.submitted_at || null,
      score: row.score ?? null,
      bucket: row.bucket || null,
      comment: row.comment || "",
      company: row.company || null,
      stage: row.stage || null,
      contact_label:
        row.company || row.stage || row.response_id || "Contact",
      intercom_contact_url: row.intercom_contact_url || null,
      selected_options: Array.isArray(row.selected_options_json)
        ? row.selected_options_json
        : [],
      datasetContext: row.datasets || null,
      case: closingCase,
      caseOwnerLabel: caseOwner?.fullName || caseOwner?.email || "",
      latestLegacyAction,
      latestLegacyStatus: row.latest_legacy_status || null,
      loopActions: latestLegacyAction ? [latestLegacyAction] : [],
      currentStatus: closingCase?.status || "no_case",
    };
  });

  return {
    id: firstDataset.id || requestedDatasetId || null,
    datasetName:
      firstDataset.dataset_name ||
      (requestedDatasetId ? "Workspace dataset" : "Workspace feedback"),
    sourceType: firstDataset.source_type || "workspace",
    content_id: null,
    rawRowCount: apiResponse.summary?.totalMatchingResponses ?? rows.length,
    validRowCount: apiResponse.summary?.totalMatchingResponses ?? rows.length,
    skippedRowCount: 0,
    summary: apiResponse.summary || EMPTY_CANONICAL_SUMMARY,
    rows,
  };
}

function normaliseSavedDataset(apiResponse) {
  const savedDataset = apiResponse.dataset || {};
  const savedRows = Array.isArray(apiResponse.rows) ? apiResponse.rows : [];

  const rows = savedRows.map((row) => {
    const loopActions = normaliseSavedActions(row.close_loop_actions);

    return {
      db_row_id: row.id,
      response_id: row.response_id || row.id,
      source: row.source,
      row_number: row.row_number,
      submitted_at: row.submitted_at,
      score: row.score,
      bucket: row.bucket,
      comment: row.comment,
      contact_label: row.contact_label || "Contact",
      intercom_contact_url: row.intercom_contact_url,
      company: row.company || null,
      stage: row.stage || null,
      selected_options: row.selected_options_json || [],
      loopActions,
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
    summary: savedDataset.summary_json || {},
    rows,
  };
}

function normaliseWorkspaceIntercomDataset(apiResponse) {
  const savedDataset = apiResponse.dataset || {};
  const savedRows = Array.isArray(apiResponse.rows) ? apiResponse.rows : [];
  const source = apiResponse.source || {};

  return {
    id: savedDataset.id,
    datasetName:
      savedDataset.dataset_name ||
      source.source_name ||
      "Workspace Intercom dataset",
    sourceType: savedDataset.source_type || "workspace_intercom",
    content_id: savedDataset.content_id || source.survey_content_id || null,
    rawRowCount: savedRows.length,
    validRowCount: apiResponse.summary?.total ?? savedRows.length,
    skippedRowCount: 0,
    summary: apiResponse.summary || {},
    rows: savedRows.map((row) => ({
      db_row_id: row.db_row_id || row.dataset_row_id || null,
      dataset_row_id: row.dataset_row_id || row.db_row_id || null,
      response_id: row.response_id || row.id,
      source: row.source || "workspace_intercom",
      row_number: row.row_number || null,
      submitted_at: row.submitted_at,
      score: row.score,
      bucket: row.bucket,
      comment: row.comment || "",
      contact_label: row.contact_label || "Contact",
      contact_name: row.contact_name || row.contact_label || "Contact",
      intercom_contact_url: row.intercom_contact_url || null,
      company: row.company || null,
      stage: row.stage || null,
      selected_options: row.selected_options_json || [],
      loopActions: normaliseSavedActions(row.close_loop_actions || []),

      pioupiou: row.pioupiou || "-",
      reader_serial: row.reader_serial || "-",
      q_recommend_score: row.q_recommend_score ?? null,
      q_recommend_comment: row.q_recommend_comment ?? null,
      q_install_score: row.q_install_score ?? null,
      q_install_comment: row.q_install_comment ?? null,
      q_daily_use_score: row.q_daily_use_score ?? null,
      q_benefits: row.q_benefits ?? null,
      q_parent_relation_score: row.q_parent_relation_score ?? null,
      q_parent_relation_comment: row.q_parent_relation_comment ?? null,
      q_support_score: row.q_support_score ?? null,
      q_support_comment: row.q_support_comment ?? null,
      q_final_comment: row.q_final_comment ?? null,
      previous_response_dates: Array.isArray(row.previous_response_dates)
        ? row.previous_response_dates
        : [],
      previous_response_links: Array.isArray(row.previous_response_links)
        ? row.previous_response_links
        : [],
    })),
  };
}

function normaliseSessionDataset(sessionDataset) {
  const rows = Array.isArray(sessionDataset?.rows) ? sessionDataset.rows : [];

  return {
    id: sessionDataset?.id || null,
    datasetName: sessionDataset?.datasetName || "Latest session dataset",
    sourceType: sessionDataset?.sourceType || "session",
    content_id: sessionDataset?.content_id || null,
    rawRowCount: sessionDataset?.rawRowCount || rows.length,
    validRowCount: sessionDataset?.validRowCount || rows.length,
    skippedRowCount: sessionDataset?.skippedRowCount || 0,
    summary: sessionDataset?.summary || {},
    rows: rows.map((row) => ({
      db_row_id: row.db_row_id || row.id || null,
      response_id: row.response_id || row.id || null,
      source: row.source || "session",
      row_number: row.row_number ?? null,
      submitted_at: row.submitted_at || null,
      score: row.score ?? null,
      bucket: row.bucket || null,
      comment: row.comment || "",
      contact_label:
        row.contact_label ||
        row.company ||
        row.stage ||
        row.customer_name ||
        row.customer_email ||
        row.response_id ||
        "Contact",
      intercom_contact_url: row.intercom_contact_url || null,
      company: row.company || null,
      stage: row.stage || null,
      selected_options:
        row.selected_options ||
        row.selected_options_json ||
        [],
      loopActions: Array.isArray(row.loopActions)
        ? row.loopActions
        : Array.isArray(row.close_loop_actions)
          ? normaliseSavedActions(row.close_loop_actions)
          : [],
    })),
  };
}

function normaliseSavedActions(actions = []) {
  if (!Array.isArray(actions) || actions.length === 0) {
    return [];
  }

  return [...actions]
    .sort((a, b) => {
      const aDate = new Date(
        a.updated_at || a.created_at || a.updatedAt || 0
      ).getTime();
      const bDate = new Date(
        b.updated_at || b.created_at || b.updatedAt || 0
      ).getTime();

      return aDate - bDate;
    })
    .map(normaliseSavedAction);
}

function normaliseSavedAction(action) {
  return {
    id: action.id,
    status: action.status || "open",
    owner: action.owner || "",
    actionTaken: action.action_taken || action.actionTaken || "",
    updatedAt: action.updated_at || action.created_at || action.updatedAt || null,
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
      `${row?.contact_label || "unknown"}-${row?.submitted_at || "no-date"}-${row?.score || "no-score"}`
  );
}

function CloseLoopStatusChart({ counts, showNoCase = false }) {
  const max = Math.max(counts.open, counts.inProgress, counts.closed, 1);

  const items = [
    { key: "open", label: "Open", value: counts.open },
    { key: "in_progress", label: "In progress", value: counts.inProgress },
    { key: "closed", label: "Closed", value: counts.closed },
  ];

  return (
    <div className="csv-nps-loop-management-grid">
      <section className="csv-nps-loop-management-card">
        <div className="csv-nps-loop-management-header">
          <div>
            <h3>Follow-up status</h3>
            <p>Shared close-the-loop progress for the selected period.</p>
          </div>
        </div>

        <div className="csv-nps-loop-status-chart">
          {items.map((item) => {
            const height = Math.max(8, Math.round((item.value / max) * 100));

            return (
              <div className="csv-nps-loop-status-column" key={item.key}>
                <div className="csv-nps-loop-status-column-plot">
                  <div
                    className={`csv-nps-loop-status-column-fill csv-nps-loop-status-column-fill-${item.key}`}
                    style={{ height: `${height}%` }}
                  />
                </div>

                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </div>
            );
          })}
        </div>

        {showNoCase && (
          <p className="csv-nps-muted-cell">
            No case: <strong>{counts.noCase}</strong>. These responses are kept
            separate from open cases.
          </p>
        )}
      </section>
    </div>
  );
}

function UrgentDetractorsPanel({ rows }) {
  return (
    <section className="csv-nps-loop-urgent-panel">
      <div className="csv-nps-loop-management-header">
        <div>
          <h3>Needs attention first</h3>
          <p>
            Lowest-scoring open detractors, prioritised for same-day follow-up
            where possible.
          </p>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="csv-nps-empty-state csv-nps-empty-state-compact">
          No open detractors in the selected period.
        </div>
      ) : (
        <div className="csv-nps-loop-urgent-list">
          {rows.map((row) => (
            <article
              className="csv-nps-loop-urgent-item"
              key={getActionKey(row)}
            >
              <div>
                <div className="csv-nps-loop-urgent-topline">
                  <span className="csv-nps-bucket csv-nps-bucket-detractor">
                    Detractor
                  </span>
                  <span className="csv-nps-loop-score">
                    Score {row.score ?? "—"}
                  </span>
                  <span
                    className={`csv-nps-loop-status csv-nps-loop-status-${row.currentStatus}`}
                  >
                    {formatStatus(row.currentStatus)}
                  </span>
                </div>

                <h4>{row.contact_label || "Contact"}</h4>

                <p>
                  {truncateText(
                    row.comment || "No comment provided.",
                    180
                  )}
                </p>
              </div>

              {row.intercom_contact_url && (
                <a
                  href={row.intercom_contact_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-link"
                >
                  Open in Intercom
                </a>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function sortClosingLoopRows(a, b) {
  const statusPriority = {
    no_case: 0,
    open: 1,
    in_progress: 2,
    closed: 3,
  };

  const bucketPriority = {
    detractor: 0,
    passive: 1,
    promoter: 2,
  };

  const aStatus = statusPriority[a.currentStatus] ?? 99;
  const bStatus = statusPriority[b.currentStatus] ?? 99;

  if (aStatus !== bStatus) return aStatus - bStatus;

  const aBucket = bucketPriority[a.bucket] ?? 99;
  const bBucket = bucketPriority[b.bucket] ?? 99;

  if (aBucket !== bBucket) return aBucket - bBucket;

  const scoreDiff = Number(a.score ?? 999) - Number(b.score ?? 999);
  if (scoreDiff !== 0) return scoreDiff;

  return String(b?.submitted_at || "").localeCompare(
    String(a?.submitted_at || "")
  );
}

function matchesPeriod(isoDate, period) {
  if (!period || period === "all") return true;

  const submittedAt = new Date(isoDate || "");
  if (Number.isNaN(submittedAt.getTime())) return false;

  const now = new Date();

  if (period === "7d") {
    const threshold = new Date(now);
    threshold.setDate(threshold.getDate() - 7);
    return submittedAt >= threshold;
  }

  if (period === "30d") {
    const threshold = new Date(now);
    threshold.setDate(threshold.getDate() - 30);
    return submittedAt >= threshold;
  }

  if (period === "this_month") {
    return (
      submittedAt.getFullYear() === now.getFullYear() &&
      submittedAt.getMonth() === now.getMonth()
    );
  }

  return true;
}

function truncateText(text, maxLength = 180) {
  const value = String(text || "").trim();

  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 1).trimEnd()}…`;
}

function MetricCard({ label, value }) {
  return (
    <div className="csv-nps-metric-card">
      <div className="csv-nps-metric-label">{label}</div>
      <div className="csv-nps-metric-value">{value ?? "—"}</div>
    </div>
  );
}

function ClosingLoopCard({
  row,
  action,
  savedActions = [],
  currentStatus = "open",
  isSelected = false,
  onSelect,
  onChange,
  onSave,
  readOnly = false,
}) {
  const hasSavedActions = savedActions.length > 0;

  const buttonLabel = action.isSaving
    ? "Saving..."
    : action.isDirty
      ? "Save follow-up"
      : hasSavedActions
        ? "Add another follow-up"
        : "Save follow-up";

  return (
    <article
      className={`csv-nps-loop-card csv-nps-loop-card-${row.bucket} ${
        isSelected ? "csv-nps-loop-card-selected" : ""
      }`}
    >
      <div className="csv-nps-loop-card-main">
        <div className="csv-nps-loop-card-topline">
          <span className={`csv-nps-bucket csv-nps-bucket-${row.bucket}`}>
            {row.bucket}
          </span>

          <span className="csv-nps-loop-score">Score {row.score}</span>

          <span
            className={`csv-nps-loop-status csv-nps-loop-status-${currentStatus}`}
          >
            {formatStatus(currentStatus)}
          </span>
        </div>

        <h3>{row.contact_label || "Contact"}</h3>

        <p className="csv-nps-loop-meta">
          {[row.company, row.stage].filter(Boolean).join(" · ") || "No business context"}{" "}
          · {row.submitted_at?.slice(0, 10) || "No date"}
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
              {savedActions.some((savedAction) => savedAction.isLegacy)
                ? "Earlier legacy follow-up"
                : "Follow-up log"}
            </span>

            {savedActions.map((savedAction) => (
              <div
                key={savedAction.id || savedAction.updatedAt}
                className="csv-nps-loop-saved-action"
              >
                <div className="csv-nps-loop-saved-action-meta">
                  <strong>{formatStatus(savedAction.status)}</strong>

                  {savedAction.owner && (
                    <span>
                      {savedAction.isLegacy ? "Legacy owner: " : ""}
                      {savedAction.owner}
                    </span>
                  )}

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
          <button
            type="button"
            className="csv-nps-button csv-nps-button-secondary"
            onClick={onSelect}
          >
            View details
          </button>
          <span>Status</span>
          <select
            value={action.status || "open"}
            onChange={(e) => onChange({ status: e.target.value })}
            disabled={readOnly}
          >
            <option value="no_case">No case</option>
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
            disabled={readOnly}
          />
        </label>

        <label className="csv-nps-filter-field csv-nps-loop-action-field">
          <span>Action taken or next step</span>
          <textarea
            value={action.actionTaken || ""}
            onChange={(e) => onChange({ actionTaken: e.target.value })}
            placeholder="Example: Called customer, apologised, offered a fix, or escalated the issue..."
            rows={4}
            disabled={readOnly}
          />
        </label>

        <button
          type="button"
          className="csv-nps-button"
          onClick={onSave}
          disabled={readOnly || action.isSaving}
        >
          {readOnly ? "Updates coming next" : buttonLabel}
        </button>

        {readOnly && (
          <p className="csv-nps-muted-cell">
            Priority: {row.case?.priority || "Not set"}. Owner: {row.caseOwnerLabel || "Unassigned"}.
          </p>
        )}

        {action.saveError && (
          <div className="csv-nps-error csv-nps-error-compact">
            {action.saveError}
          </div>
        )}
      </div>
    </article>
  );
}

function SelectedResponsePanel({
  row,
  replyDraft,
  replyDraftLoading,
  replyDraftError,
  replyDraftCopied,
  onGenerateDraft,
  onCopyDraft,
  onDraftChange,
  action,
  savedActions = [],
  currentStatus,
  onActionChange,
  onSaveAction,
  readOnly = false,
}) {
  const buttonLabel = action?.isSaving
    ? "Saving..."
    : action?.isDirty
      ? "Save follow-up"
      : savedActions.length
        ? "Add another follow-up"
        : "Save follow-up";

  return (
    <section className="csv-nps-panel csv-nps-selected-response-panel">
      <div className="csv-nps-responses-header">
        <div>
          <p className="eyebrow">Selected response</p>
          <h2>{row.contact_label || "Contact"}</h2>
          <p>
            Score {row.score ?? "—"} · {row.bucket || "unknown"} ·{" "}
            {row.submitted_at?.slice(0, 10) || "No date"} ·{" "}
            {formatStatus(currentStatus)}
          </p>
        </div>

        {row.intercom_contact_url && (
          <a
            href={row.intercom_contact_url}
            target="_blank"
            rel="noreferrer"
            className="text-link"
          >
            Open in Intercom
          </a>
        )}
      </div>

      <div
        className="csv-nps-selected-response-grid"
        style={{ gridTemplateColumns: "minmax(0, 1fr)" }}
      >
        <div className="csv-nps-selected-response-card">
          <h3>Full survey response</h3>
          <p className="csv-nps-muted-cell">
            Question-level scores and comments from the survey, combined into one view.
          </p>

          <SurveyQuestionScoreTable row={row} />
        </div>

        <div className="csv-nps-selected-response-card">
          <div className="csv-nps-selected-response-card-header">
            <div>
              <h3>Suggested reply draft</h3>
              <p>Generate a French Intercom draft and review it before sending.</p>
            </div>

            <button
              type="button"
              className="csv-nps-button"
              onClick={onGenerateDraft}
              disabled={replyDraftLoading}
            >
              {replyDraftLoading ? "Generating..." : "Generate draft"}
            </button>
          </div>

          {replyDraftError && (
            <div className="csv-nps-error csv-nps-error-compact">
              {replyDraftError}
            </div>
          )}

          {replyDraft?.body ? (
            <>
              <textarea
                value={replyDraft.body}
                onChange={(e) => onDraftChange(e.target.value)}
                rows={7}
                className="csv-nps-reply-draft-textarea"
              />

              <button
                type="button"
                className="csv-nps-button csv-nps-button-secondary"
                onClick={onCopyDraft}
              >
                {replyDraftCopied ? "Copied" : "Copy draft"}
              </button>
            </>
          ) : (
            !replyDraftLoading &&
            !replyDraftError && (
              <p className="csv-nps-muted-cell">
                No draft generated yet.
              </p>
            )
          )}

          <p className="csv-nps-muted-cell">
            Human-in-the-loop: this is a suggested draft only.
          </p>
        </div>

        <div className="csv-nps-selected-response-card">
          <h3>Manage follow-up</h3>

          <label className="csv-nps-filter-field">
            <span>Status</span>
            <select
              value={action?.status || "open"}
              onChange={(e) => onActionChange({ status: e.target.value })}
              disabled={readOnly}
            >
              <option value="no_case">No case</option>
              <option value="open">Open</option>
              <option value="in_progress">In progress</option>
              <option value="closed">Closed</option>
            </select>
          </label>

          <label className="csv-nps-filter-field">
            <span>Owner</span>
            <input
              type="text"
              value={action?.owner || ""}
              onChange={(e) => onActionChange({ owner: e.target.value })}
              placeholder="Who is following up?"
              disabled={readOnly}
            />
          </label>

          <label className="csv-nps-filter-field csv-nps-loop-action-field">
            <span>Action taken or next step</span>
            <textarea
              value={action?.actionTaken || ""}
              onChange={(e) => onActionChange({ actionTaken: e.target.value })}
              placeholder="Example: Called customer, apologised, offered a fix, or escalated the issue..."
              rows={4}
              disabled={readOnly}
            />
          </label>

          <button
            type="button"
            className="csv-nps-button"
            onClick={onSaveAction}
            disabled={readOnly || action?.isSaving}
          >
            {readOnly ? "Updates coming next" : buttonLabel}
          </button>

          {readOnly && (
            <p className="csv-nps-muted-cell">
              Priority: {row.case?.priority || "Not set"}. Owner: {row.caseOwnerLabel || "Unassigned"}.
            </p>
          )}

          {action?.saveError && (
            <div className="csv-nps-error csv-nps-error-compact">
              {action.saveError}
            </div>
          )}

          {savedActions.length > 0 && (
            <div className="csv-nps-loop-saved-actions">
              <span className="csv-nps-loop-saved-actions-title">
                {savedActions.some((savedAction) => savedAction.isLegacy)
                  ? "Earlier legacy follow-up"
                  : "Follow-up log"}
              </span>

              {savedActions.map((savedAction) => (
                <div
                  key={savedAction.id || savedAction.updatedAt}
                  className="csv-nps-loop-saved-action"
                >
                  <div className="csv-nps-loop-saved-action-meta">
                    <strong>{formatStatus(savedAction.status)}</strong>

                    {savedAction.owner && (
                      <span>
                        {savedAction.isLegacy ? "Legacy owner: " : ""}
                        {savedAction.owner}
                      </span>
                    )}

                    {savedAction.updatedAt && (
                      <span>{new Date(savedAction.updatedAt).toLocaleString()}</span>
                    )}
                  </div>

                  {savedAction.actionTaken && <p>{savedAction.actionTaken}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function SurveyQuestionScoreTable({ row }) {
  const selectedBenefits = uniqueStrings([
    row.q_benefits,
    ...(Array.isArray(row.selected_options) ? row.selected_options : []),
    ...(Array.isArray(row.selected_options_json) ? row.selected_options_json : []),
  ]).join(", ");

  const existingComments = [
    row.q_recommend_comment,
    row.q_install_comment,
    row.q_parent_relation_comment,
    row.q_support_comment,
    row.q_final_comment,
    selectedBenefits,
  ]
    .filter(Boolean)
    .map((value) => String(value).trim());

  const mainComment = String(row.comment || "").trim();
  const shouldShowMainComment =
    mainComment && !existingComments.includes(mainComment);

  const questions = [
    {
      label: "Recommendation",
      helper: "NPS question",
      score: row.q_recommend_score ?? row.score,
      comment: row.q_recommend_comment,
    },
    {
      label: "Installation and getting started",
      score: row.q_install_score,
      comment: row.q_install_comment,
    },
    {
      label: "Daily use",
      score: row.q_daily_use_score,
      comment: null,
    },
    {
      label: "Benefits selected",
      score: null,
      comment: selectedBenefits,
    },
    {
      label: "Parent relationship impact",
      score: row.q_parent_relation_score,
      comment: row.q_parent_relation_comment,
    },
    {
      label: "Envola support",
      score: row.q_support_score,
      comment: row.q_support_comment,
    },
    {
      label: "Final comment",
      score: null,
      comment: row.q_final_comment,
    },
    ...(shouldShowMainComment
      ? [
          {
            label: "Additional comment",
            score: null,
            comment: mainComment,
          },
        ]
      : []),
  ].filter((item) => {
    const hasScore =
      item.score !== null &&
      item.score !== undefined &&
      item.score !== "";

    const hasComment = Boolean(String(item.comment || "").trim());

    return hasScore || hasComment;
  });

  if (questions.length === 0) {
    return (
      <p className="csv-nps-muted-cell">
        No question-level scores or comments were found for this response.
      </p>
    );
  }

  return (
    <div className="csv-nps-table-wrap">
      <table className="csv-nps-table csv-nps-survey-response-table">
        <thead>
          <tr>
            <th>Question</th>
            <th>Score</th>
            <th>Comment</th>
          </tr>
        </thead>

        <tbody>
          {questions.map((item) => (
            <tr key={item.label}>
              <td>
                <strong>{item.label}</strong>
                {item.helper && (
                  <div className="csv-nps-muted-cell">{item.helper}</div>
                )}
              </td>
              <td>
                {item.score !== null &&
                item.score !== undefined &&
                item.score !== "" ? (
                  <strong>{item.score}/10</strong>
                ) : (
                  <span className="csv-nps-muted-cell">—</span>
                )}
              </td>
              <td>{item.comment || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


function uniqueStrings(values) {
  return Array.from(
    new Set(
      (values || [])
        .flatMap((value) => (Array.isArray(value) ? value : [value]))
        .map((value) => String(value || "").trim())
        .filter(Boolean)
    )
  );
}

function ResponseDetail({ label, value }) {
  if (!value) return null;

  return (
    <div className="csv-nps-response-detail">
      <span>{label}</span>
      <p>{String(value)}</p>
    </div>
  );
}

function formatStatus(status) {
  if (status === "no_case") return "No case";
  if (status === "in_progress") return "In progress";
  if (status === "closed") return "Closed";
  return "Open";
}
