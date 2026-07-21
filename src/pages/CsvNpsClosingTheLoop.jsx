import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import CsvNpsWorkspaceNav from "../components/CsvNpsWorkspaceNav";
import WorkspaceDatasetHeader from "../components/WorkspaceDatasetHeader";
import { useLanguage } from "../i18n/LanguageContext";
import { translations } from "../i18n/translations";

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
  const { lang } = useLanguage();
  const copy = translations(
    lang || "en",
    "workspaceClosingLoop",
    translations("en", "workspaceClosingLoop", {})
  );
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
  const [canonicalCaseState, setCanonicalCaseState] = useState("all");
  const [canonicalBucket, setCanonicalBucket] = useState("all");
  const [canonicalOwner, setCanonicalOwner] = useState("all");
  const [queueSort, setQueueSort] = useState({ key: "progress", direction: "asc" });

  const [bucketFilter, setBucketFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [periodFilter, setPeriodFilter] = useState("all");

  const [replyDraft, setReplyDraft] = useState(null);
  const [replyDraftLoading, setReplyDraftLoading] = useState(false);
  const [replyDraftError, setReplyDraftError] = useState("");
  const [replyDraftCopied, setReplyDraftCopied] = useState(false);
  const [managementOverviewOpen, setManagementOverviewOpen] = useState(true);
  const [selectedResponseDetail, setSelectedResponseDetail] = useState(null);
  const [selectedResponseDetailLoading, setSelectedResponseDetailLoading] = useState(false);
  const [selectedResponseDetailError, setSelectedResponseDetailError] = useState("");
  const [caseEvents, setCaseEvents] = useState([]);
  const [caseEventsLoading, setCaseEventsLoading] = useState(false);
  const [caseEventsError, setCaseEventsError] = useState("");
  const [caseMutation, setCaseMutation] = useState({ loading: false, error: "" });
  const [noteDraft, setNoteDraft] = useState("");
  const [eventsVersion, setEventsVersion] = useState(0);

  const selectedResponsePanelRef = useRef(null);


  useEffect(() => {
    async function loadCanonicalWorkspaceQueue() {
      setLoadingDataset(true);
      setDatasetError("");

      try {
        const params = new URLSearchParams();
        params.set("limit", String(CANONICAL_PAGE_LIMIT));
        if (datasetId) params.set("datasetId", datasetId);
        if (canonicalCaseState !== "all") params.set("caseState", canonicalCaseState);
        if (canonicalBucket !== "all") params.set("bucket", canonicalBucket);
        if (canonicalOwner !== "all") params.set("owner", canonicalOwner);

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
  }, [datasetId, isWorkspaceRoute, canonicalCaseState, canonicalBucket, canonicalOwner]);

  useEffect(() => {
    const selectedRow = dataset?.rows?.find(
      (row) => String(getActionKey(row)) === String(selectedResponseRef)
    );

    setSelectedResponseDetail(null);
    setSelectedResponseDetailError("");

    if (
      mode !== "canonical" ||
      !selectedRow?.dataset_row_id ||
      !selectedRow?.dataset_id ||
      !selectedRow?.response_id
    ) {
      setSelectedResponseDetailLoading(false);
      return undefined;
    }

    const controller = new AbortController();

    async function loadSelectedResponseDetail() {
      setSelectedResponseDetailLoading(true);

      try {
        const response = await fetch(
          `/api/workspace/datasets/${encodeURIComponent(selectedRow.dataset_id)}/responses/${encodeURIComponent(selectedRow.response_id)}`,
          { credentials: "include", signal: controller.signal }
        );
        const data = await response.json();

        if (!response.ok || !data.ok) {
          throw new Error(data.error || "Failed to load the complete survey response");
        }

        setSelectedResponseDetail(normaliseSelectedResponseDetail(selectedRow, data.response));
      } catch (err) {
        if (err.name !== "AbortError") {
          setSelectedResponseDetailError(
            err.message || "Failed to load the complete survey response"
          );
        }
      } finally {
        if (!controller.signal.aborted) setSelectedResponseDetailLoading(false);
      }
    }

    loadSelectedResponseDetail();
    return () => controller.abort();
  }, [dataset, mode, selectedResponseRef]);

  useEffect(() => {
    const caseId = selectedRow?.case?.id;
    setCaseEvents([]);
    setCaseEventsError("");
    setNoteDraft("");
    if (mode !== "canonical" || !caseId) return undefined;

    const controller = new AbortController();
    setCaseEventsLoading(true);
    fetch(`/api/workspace/closing-loop/cases/${encodeURIComponent(caseId)}/events`, {
      credentials: "include",
      signal: controller.signal,
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok || !data.ok) throw new Error(data?.error?.message || copy.errors.events);
        setCaseEvents(Array.isArray(data.events) ? data.events : []);
      })
      .catch((error) => {
        if (error.name !== "AbortError") setCaseEventsError(error.message || copy.errors.events);
      })
      .finally(() => {
        if (!controller.signal.aborted) setCaseEventsLoading(false);
      });

    return () => controller.abort();
  }, [selectedResponseRef, dataset, mode, eventsVersion, copy.errors.events]);

  function applyCanonicalCase(datasetRowId, closingCase) {
    const nextCase = Array.isArray(closingCase) ? closingCase[0] : closingCase;
    const previousStatus = dataset?.rows.find(
      (row) => row.dataset_row_id === datasetRowId
    )?.currentStatus || "no_case";
    if (nextCase && previousStatus !== nextCase.status) {
      const summaryKeys = { no_case: "noCase", open: "open", in_progress: "inProgress", closed: "closed" };
      setCanonicalSummary((summary) => ({
        ...summary,
        [summaryKeys[previousStatus]]: Math.max(0, (summary[summaryKeys[previousStatus]] || 0) - 1),
        [summaryKeys[nextCase.status]]: (summary[summaryKeys[nextCase.status]] || 0) + 1,
      }));
    }
    setDataset((current) => {
      if (!current || !nextCase) return current;
      return {
      ...current,
      rows: current.rows.map((row) => row.dataset_row_id === datasetRowId ? {
        ...row,
        case: nextCase,
        currentStatus: nextCase.status || "no_case",
        caseOwnerLabel: assignableOwners.find(
          (owner) => owner.membershipId === nextCase.owner_membership_id
        )?.fullName || assignableOwners.find(
          (owner) => owner.membershipId === nextCase.owner_membership_id
        )?.email || "",
      } : row),
      };
    });
    setEventsVersion((value) => value + 1);
  }

  async function runCaseMutation(request, fallbackMessage, onSuccess) {
    setCaseMutation({ loading: true, error: "" });
    try {
      const response = await fetch(request.url, {
        method: request.method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request.body),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data?.error?.message || data?.error || fallbackMessage);
      onSuccess(data);
    } catch (error) {
      setCaseMutation({ loading: false, error: error.message || fallbackMessage });
      return;
    }
    setCaseMutation({ loading: false, error: "" });
  }

  function startFollowUp(row) {
    runCaseMutation({
      url: "/api/workspace/closing-loop/cases",
      method: "POST",
      body: { datasetRowId: row.dataset_row_id, ownerMembershipId: null },
    }, copy.errors.create, (data) => applyCanonicalCase(row.dataset_row_id, data.case));
  }

  function updateFollowUp(row, patch) {
    if (patch.status === "closed" && !String(patch.note || "").trim()) {
      setCaseMutation({ loading: false, error: copy.errors.closureNoteRequired });
      window.requestAnimationFrame(() => {
        document.getElementById("closing-loop-note")?.focus();
      });
      return;
    }
    runCaseMutation({
      url: `/api/workspace/closing-loop/cases/${encodeURIComponent(row.case.id)}`,
      method: "PATCH",
      body: patch,
    }, copy.errors.update, (data) => {
      applyCanonicalCase(row.dataset_row_id, data.case);
      if (patch.note) setNoteDraft("");
    });
  }

  function addFollowUpNote(row) {
    const note = noteDraft.trim();
    if (!note) {
      setCaseMutation({ loading: false, error: copy.errors.noteRequired });
      return;
    }
    runCaseMutation({
      url: `/api/workspace/closing-loop/cases/${encodeURIComponent(row.case.id)}/notes`,
      method: "POST",
      body: { note },
    }, copy.errors.note, () => {
      setNoteDraft("");
      setEventsVersion((value) => value + 1);
    });
  }

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
      return [...periodRows].sort((left, right) =>
        sortCanonicalQueueRows(left, right, queueSort)
      );
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
  }, [periodRows, bucketFilter, statusFilter, mode, queueSort]);

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

  useEffect(() => {
    if (
      mode === "canonical" &&
      !loadingDataset &&
      dataset &&
      selectedResponseRef &&
      !selectedRow
    ) {
      setSearchParams({}, { replace: true });
    }
  }, [dataset, loadingDataset, mode, selectedResponseRef, selectedRow, setSearchParams]);

  function clearCanonicalFilters() {
    setCanonicalCaseState("all");
    setCanonicalBucket("all");
    setCanonicalOwner("all");
    setSearchParams({}, { replace: true });
  }

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
      .filter((row) => row.currentStatus !== "closed")
      .sort((a, b) => {
        const riskDiff = getClosingLoopRiskScore(b) - getClosingLoopRiskScore(a);
        if (riskDiff !== 0) return riskDiff;

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
          <p className="eyebrow">{copy.eyebrow}</p>
          <h1>{copy.title}</h1>
          <p>{copy.loading}</p>
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
    <main className="csv-nps-page csv-nps-closing-loop-page">
      <section className="csv-nps-hero csv-nps-hero-compact">
        <p className="eyebrow">{copy.eyebrow}</p>
        <h1>{copy.title}</h1>
        <p>{mode === "canonical" ? copy.subtitle : subtitle}</p>
      </section>

      <CsvNpsWorkspaceNav />

      {datasetId && <WorkspaceDatasetHeader dataset={dataset} />}

      <section className="csv-nps-results">
        <div className="csv-nps-metric-grid csv-nps-loop-summary-strip">
          <MetricCard label={copy.summary.total} value={counts.total} />
          {mode === "canonical" && (
            <MetricCard label={copy.summary.noCase} value={counts.noCase} />
          )}
          <MetricCard label={copy.summary.open} value={counts.open} />
          <MetricCard label={copy.summary.inProgress} value={counts.inProgress} />
          <MetricCard label={copy.summary.closed} value={counts.closed} />
          <MetricCard label={copy.summary.openDetractors} value={counts.openDetractors} />
          {mode === "canonical" && (
            <>
              <MetricCard
                label={copy.summary.highPriority}
                value={counts.highPriorityActive}
              />
              <MetricCard
                label={copy.summary.unassigned}
                value={counts.unassignedActive}
              />
            </>
          )}
        </div>

        <section className="csv-nps-loop-overview">
          <div className="csv-nps-loop-overview-toggle-row">
            <div>
              <h2>{copy.overview.title}</h2>
              <p>{copy.overview.subtitle}</p>
            </div>
            <button
              type="button"
              className="csv-nps-button csv-nps-button-secondary csv-nps-button-compact"
              aria-expanded={managementOverviewOpen}
              aria-controls="closing-loop-management-overview"
              onClick={() => setManagementOverviewOpen((current) => !current)}
            >
              {managementOverviewOpen ? copy.overview.hide : copy.overview.show}
            </button>
          </div>

          {managementOverviewOpen && (
            <div
              id="closing-loop-management-overview"
              className="csv-nps-loop-management-grid"
            >
              <CloseLoopStatusChart
                counts={counts}
                showNoCase={mode === "canonical"}
                copy={copy}
              />
              <UrgentDetractorsPanel
                rows={urgentDetractors}
                onSelect={selectRow}
                copy={copy}
              />
            </div>
          )}
        </section>

        {selectedRow && (
          <div ref={selectedResponsePanelRef} id="selected-response-detail">
            <SelectedResponsePanel
              row={selectedResponseDetail || selectedRow}
              detailLoading={selectedResponseDetailLoading}
              detailError={selectedResponseDetailError}
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
              readOnly={mode === "canonical" && !permissions.canMutate}
              copy={copy}
              assignableOwners={assignableOwners}
              caseEvents={caseEvents}
              caseEventsLoading={caseEventsLoading}
              caseEventsError={caseEventsError}
              caseMutation={caseMutation}
              noteDraft={noteDraft}
              onNoteChange={setNoteDraft}
              onStartFollowUp={() => startFollowUp(selectedRow)}
              onUpdateFollowUp={(patch) => updateFollowUp(selectedRow, patch)}
              onAddNote={() => addFollowUpNote(selectedRow)}
            />
          </div>
        )}

        <div className="csv-nps-loop-queue-header">
          <div>
            <p className="eyebrow">{copy.queue.eyebrow}</p>
            <h2>{copy.queue.title}</h2>
            <p>
              {copy.queue.showing} {rows.length} {copy.queue.of}{" "}
              {mode === "canonical"
                ? canonicalPagination?.totalMatching ?? counts.total
                : dataset.rows.length}{" "}
              {" "}{(mode === "canonical" ? canonicalPagination?.totalMatching ?? counts.total : dataset.rows.length) === 1 ? copy.queue.response : copy.queue.responses}
              .
            </p>
          </div>
        </div>

        {mode === "canonical" ? (
        <></>
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

        <div className={mode === "canonical" ? "csv-nps-loop-queue" : "csv-nps-loop-list"}>
          {mode === "canonical" ? (
            <ClosingLoopQueue
              rows={rows}
              selectedRow={selectedRow}
              onSelect={selectRow}
              onStartFollowUp={startFollowUp}
              canMutate={permissions.canMutate}
              copy={copy}
              sort={queueSort}
              onSort={setQueueSort}
              caseStateFilter={canonicalCaseState}
              onCaseStateFilter={setCanonicalCaseState}
              bucketFilter={canonicalBucket}
              onBucketFilter={setCanonicalBucket}
              ownerFilter={canonicalOwner}
              onOwnerFilter={setCanonicalOwner}
              assignableOwners={assignableOwners}
              onClearFilters={clearCanonicalFilters}
            />
          ) : rows.length === 0 ? (
            <div className="csv-nps-empty-state">
              {copy.queue.empty}
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
                  readOnly={false}
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

function normaliseSelectedResponseDetail(baseRow, detail = {}) {
  return {
    ...baseRow,
    ...detail,
    db_row_id: baseRow.db_row_id,
    dataset_row_id: baseRow.dataset_row_id,
    response_id: baseRow.response_id,
    selected_options: Array.isArray(detail.selected_options_json)
      ? detail.selected_options_json
      : baseRow.selected_options,
    extra_scores: detail.extra_scores_json || {},
    case: baseRow.case,
    caseOwnerLabel: baseRow.caseOwnerLabel,
    loopActions: baseRow.loopActions,
    currentStatus: baseRow.currentStatus,
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

function CloseLoopStatusChart({ counts, showNoCase = false, copy }) {
  const max = Math.max(counts.open, counts.inProgress, counts.closed, 1);

  const items = [
    { key: "open", label: copy.statuses.open, value: counts.open },
    { key: "in_progress", label: copy.statuses.in_progress, value: counts.inProgress },
    { key: "closed", label: copy.statuses.closed, value: counts.closed },
  ];

  return (
    <section className="csv-nps-loop-management-card">
      <div className="csv-nps-loop-management-header">
        <div>
          <h3>{copy.overview.statusTitle}</h3>
          <p>{copy.overview.statusSubtitle}</p>
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
          <strong>{counts.noCase}</strong> {copy.overview.noCaseHint}
        </p>
      )}
    </section>
  );
}

function UrgentDetractorsPanel({ rows, onSelect, copy }) {
  return (
    <section className="csv-nps-loop-urgent-panel">
      <div className="csv-nps-loop-management-header">
        <div>
          <h3>{copy.overview.urgentTitle}</h3>
          <p>{copy.overview.urgentSubtitle}</p>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="csv-nps-empty-state csv-nps-empty-state-compact">
          {copy.overview.noneUrgent}
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
                  <span className={`csv-nps-loop-risk ${getRiskBand(getClosingLoopRiskScore(row))}`}>
                    {getClosingLoopRiskScore(row)} / 100
                  </span>
                  <span className="csv-nps-loop-score">
                    {copy.detail.score} {row.score ?? "—"}
                  </span>
                  <span
                    className={`csv-nps-loop-status csv-nps-loop-status-${row.currentStatus}`}
                  >
                    {formatStatus(row.currentStatus, copy)}
                  </span>
                </div>

                <h4>{row.contact_label || copy.queue.customerResponse}</h4>

                <p>
                  {truncateText(
                    row.comment || copy.queue.noComment,
                    180
                  )}
                </p>
                <strong className="csv-nps-loop-urgent-recommendation">
                  {getClosingLoopRecommendation(row, copy)}
                </strong>
              </div>

              <div className="csv-nps-loop-urgent-actions">
                <button
                  type="button"
                  className="csv-nps-button csv-nps-button-secondary csv-nps-button-compact"
                  onClick={() => onSelect(row)}
                >
                  {copy.overview.view}
                </button>
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

function sortCanonicalQueueRows(left, right, sort) {
  const direction = sort.direction === "desc" ? -1 : 1;
  const statusOrder = { in_progress: 0, open: 1, no_case: 2, closed: 3 };
  const activity = (row) =>
    row.case?.updated_at || row.latestLegacyAction?.updatedAt || row.created_at || row.submitted_at || "";
  let comparison = 0;

  if (sort.key === "priority") {
    comparison = getClosingLoopRiskScore(left) - getClosingLoopRiskScore(right);
  } else if (sort.key === "score") {
    comparison = Number(left.score ?? 999) - Number(right.score ?? 999);
  } else if (sort.key === "response") {
    comparison = String(left.comment || left.contact_label || "").localeCompare(
      String(right.comment || right.contact_label || ""),
      undefined,
      { sensitivity: "base" }
    );
  } else if (sort.key === "context") {
    comparison = String(left.company || left.stage || "").localeCompare(
      String(right.company || right.stage || ""),
      undefined,
      { sensitivity: "base" }
    );
  } else if (sort.key === "owner") {
    comparison = String(left.caseOwnerLabel || "").localeCompare(
      String(right.caseOwnerLabel || ""),
      undefined,
      { sensitivity: "base" }
    );
  } else if (sort.key === "activity") {
    comparison = String(activity(left)).localeCompare(String(activity(right)));
  } else {
    comparison =
      (statusOrder[left.currentStatus] ?? 99) -
      (statusOrder[right.currentStatus] ?? 99);

    // The default operational order is Following up first, then highest risk.
    if (comparison === 0) {
      comparison = getClosingLoopRiskScore(right) - getClosingLoopRiskScore(left);
    }
  }

  if (comparison !== 0) return comparison * direction;
  return String(left.dataset_row_id || left.id || "").localeCompare(
    String(right.dataset_row_id || right.id || "")
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

function ClosingLoopQueue({
  rows,
  selectedRow,
  onSelect,
  onStartFollowUp,
  canMutate,
  copy,
  sort,
  onSort,
  caseStateFilter,
  onCaseStateFilter,
  bucketFilter,
  onBucketFilter,
  ownerFilter,
  onOwnerFilter,
  assignableOwners,
  onClearFilters,
}) {
  return (
    <div className="csv-nps-loop-queue-table" role="table" aria-label={copy.queue.title}>
      <div className="csv-nps-loop-queue-columns" role="row">
        <QueueSortHeader label={copy.queue.priority} sortKey="priority" sort={sort} onSort={onSort} copy={copy} />
        <QueueSortHeader label={copy.queue.score} sortKey="score" sort={sort} onSort={onSort} copy={copy}>
          <QueueHeaderFilter value={bucketFilter} onChange={onBucketFilter} label={copy.queue.bucketFilter}>
            <option value="all">{copy.queue.all}</option>
            <option value="detractor">{copy.buckets.detractor}</option>
            <option value="passive">{copy.buckets.passive}</option>
            <option value="promoter">{copy.buckets.promoter}</option>
          </QueueHeaderFilter>
        </QueueSortHeader>
        <QueueSortHeader label={copy.queue.customerResponse} sortKey="response" sort={sort} onSort={onSort} copy={copy} />
        <span role="columnheader">{copy.queue.theme}</span>
        <span role="columnheader">{copy.queue.recommendation}</span>
        <QueueSortHeader label={copy.queue.context} sortKey="context" sort={sort} onSort={onSort} copy={copy} />
        <QueueSortHeader label={copy.queue.owner} sortKey="owner" sort={sort} onSort={onSort} copy={copy}>
          <QueueHeaderFilter value={ownerFilter} onChange={onOwnerFilter} label={copy.queue.ownerFilter}>
            <option value="all">{copy.queue.all}</option>
            <option value="unassigned">{copy.queue.unassigned}</option>
            {assignableOwners.map((owner) => (
              <option key={owner.membershipId} value={owner.membershipId}>
                {owner.fullName || owner.email}
              </option>
            ))}
          </QueueHeaderFilter>
        </QueueSortHeader>
        <QueueSortHeader label={copy.queue.progress} sortKey="progress" sort={sort} onSort={onSort} copy={copy}>
          <QueueHeaderFilter value={caseStateFilter} onChange={onCaseStateFilter} label={copy.queue.statusFilter}>
            <option value="all">{copy.queue.all}</option>
            <option value="no_case">{copy.statuses.no_case}</option>
            <option value="open">{copy.statuses.open}</option>
            <option value="in_progress">{copy.statuses.in_progress}</option>
            <option value="closed">{copy.statuses.closed}</option>
          </QueueHeaderFilter>
        </QueueSortHeader>
        <QueueSortHeader label={copy.queue.activity} sortKey="activity" sort={sort} onSort={onSort} copy={copy} />
        <span role="columnheader">{copy.queue.actions}</span>
      </div>

      <div role="rowgroup">
        {rows.length === 0 ? (
          <div className="csv-nps-loop-queue-empty" role="row">
            <div role="cell">
              <strong>{copy.queue.empty}</strong>
              <button
                type="button"
                className="csv-nps-button csv-nps-button-secondary csv-nps-button-compact"
                onClick={onClearFilters}
              >
                {copy.queue.clearFilters}
              </button>
            </div>
          </div>
        ) : rows.map((row) => (
          <ClosingLoopQueueRow
            key={getActionKey(row)}
            row={row}
            isSelected={
              Boolean(selectedRow) &&
              getActionKey(selectedRow) === getActionKey(row)
            }
            onSelect={() => onSelect(row)}
            onStartFollowUp={() => {
              onSelect(row);
              onStartFollowUp(row);
            }}
            canMutate={canMutate}
            copy={copy}
          />
        ))}
      </div>
    </div>
  );
}

function QueueSortHeader({ label, sortKey, sort, onSort, copy, children }) {
  const isActive = sort.key === sortKey;
  const nextDirection = isActive
    ? sort.direction === "asc" ? "desc" : "asc"
    : sortKey === "priority" ? "desc" : "asc";
  const directionLabel = nextDirection === "asc" ? copy.queue.sortAscending : copy.queue.sortDescending;

  return (
    <span
      className="csv-nps-loop-queue-column-control"
      role="columnheader"
      aria-sort={isActive ? (sort.direction === "asc" ? "ascending" : "descending") : "none"}
    >
      <button
        type="button"
        className={`csv-nps-loop-queue-sort ${isActive ? "is-active" : ""}`}
        onClick={() => onSort({ key: sortKey, direction: nextDirection })}
        aria-label={`${label}: ${directionLabel}`}
      >
        <span>{label}</span>
        <span aria-hidden="true">{isActive ? (sort.direction === "asc" ? "▲" : "▼") : "↕"}</span>
      </button>
      {children}
    </span>
  );
}

function QueueHeaderFilter({ value, onChange, label, children }) {
  return (
    <select
      className="csv-nps-loop-queue-header-filter"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      aria-label={label}
    >
      {children}
    </select>
  );
}

function ClosingLoopQueueRow({ row, isSelected, onSelect, onStartFollowUp, canMutate, copy }) {
  const riskScore = getClosingLoopRiskScore(row);
  const lastActivity =
    row.case?.updated_at ||
    row.latestLegacyAction?.updatedAt ||
    row.created_at ||
    row.submitted_at;
  const workflowLabel = row.case ? copy.queue.continue : copy.queue.start;

  function handleRowClick(event) {
    if (event.target.closest("button, a")) return;
    onSelect();
  }

  return (
    <article
      className={`csv-nps-loop-queue-row csv-nps-loop-queue-row-${row.bucket} ${
        isSelected ? "csv-nps-loop-queue-row-selected" : ""
      }`}
      role="row"
      aria-current={isSelected ? "true" : undefined}
      onClick={handleRowClick}
    >
      <div className="csv-nps-loop-queue-cell csv-nps-loop-queue-priority" role="cell" data-label={copy.queue.priority}>
        <span className={`csv-nps-loop-risk ${getRiskBand(riskScore)}`}>
          {riskScore} / 100
        </span>
      </div>

      <div className="csv-nps-loop-queue-cell csv-nps-loop-queue-score" role="cell" data-label={copy.queue.score}>
        <strong>{row.score ?? "—"}</strong>
        <span className={`csv-nps-bucket csv-nps-bucket-${row.bucket}`}>
          {copy.buckets[row.bucket] || copy.buckets.unknown}
        </span>
      </div>

      <div className="csv-nps-loop-queue-cell csv-nps-loop-queue-response" role="cell" data-label={copy.queue.customerResponse}>
        <button type="button" className="csv-nps-loop-response-button" onClick={onSelect}>
          <strong>{row.contact_label || copy.queue.customerResponse}</strong>
          <span>{truncateText(row.comment || copy.queue.noComment, 160)}</span>
        </button>
        {row.latestLegacyAction && (
          <span className="csv-nps-loop-legacy-indicator">{copy.queue.earlierHistory}</span>
        )}
      </div>

      <div className="csv-nps-loop-queue-cell" role="cell" data-label={copy.queue.theme}>
        <strong>{formatTheme(getClosingLoopThemes(row)[0], copy) || copy.queue.noTheme}</strong>
      </div>

      <div className="csv-nps-loop-queue-cell csv-nps-loop-queue-recommendation" role="cell" data-label={copy.queue.recommendation}>
        <strong>{getClosingLoopRecommendation(row, copy)}</strong>
      </div>

      <div className="csv-nps-loop-queue-cell csv-nps-loop-queue-context" role="cell" data-label={copy.queue.context}>
        <strong>{row.company || row.stage || "—"}</strong>
        {row.company && row.stage && <span>{row.stage}</span>}
        <span>{formatCompactDate(row.submitted_at)}</span>
      </div>

      <div className="csv-nps-loop-queue-cell" role="cell" data-label={copy.queue.owner}>
        <strong>{row.caseOwnerLabel || copy.queue.unassigned}</strong>
      </div>

      <div className="csv-nps-loop-queue-cell" role="cell" data-label={copy.queue.progress}>
        <span className={`csv-nps-loop-status csv-nps-loop-status-${row.currentStatus}`}>
          {formatStatus(row.currentStatus, copy)}
        </span>
      </div>

      <div className="csv-nps-loop-queue-cell" role="cell" data-label={copy.queue.activity}>
        <span>{formatCompactDate(lastActivity)}</span>
      </div>

      <div className="csv-nps-loop-queue-cell csv-nps-loop-queue-actions" role="cell" data-label={copy.queue.actions}>
        <div className="csv-nps-loop-queue-action-links">
          <button
            type="button"
            className="csv-nps-button csv-nps-button-compact"
            onClick={row.case ? onSelect : onStartFollowUp}
            disabled={!row.case && !canMutate}
          >
            {copy.queue.view}
          </button>
          {row.intercom_contact_url && (
            <a
              href={row.intercom_contact_url}
              target="_blank"
              rel="noreferrer"
              className="csv-nps-button csv-nps-button-secondary csv-nps-button-compact"
            >
              {copy.queue.intercom}
            </a>
          )}
        </div>
        <div className="csv-nps-loop-queue-workflow-action">
          <button
            type="button"
            className="csv-nps-button csv-nps-button-secondary csv-nps-button-compact"
            onClick={onSelect}
          >
            {workflowLabel}
          </button>
        </div>
      </div>
    </article>
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
  detailLoading,
  detailError,
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
  copy,
  assignableOwners = [],
  caseEvents = [],
  caseEventsLoading,
  caseEventsError,
  caseMutation,
  noteDraft,
  onNoteChange,
  onStartFollowUp,
  onUpdateFollowUp,
  onAddNote,
}) {
  const hasCase = Boolean(row.case);
  const status = row.case?.status || "no_case";
  const nextStatusAction = status === "open"
    ? { label: copy.detail.moveFollowing, status: "in_progress" }
    : status === "in_progress"
      ? { label: copy.detail.resolve, status: "closed" }
      : status === "closed"
        ? { label: copy.detail.reopen, status: "in_progress" }
        : null;

  return (
    <section className="csv-nps-panel csv-nps-selected-response-panel">
      <div className="csv-nps-responses-header">
        <div>
          <p className="eyebrow">{copy.detail.eyebrow}</p>
          <h2>{row.contact_label || "Contact"}</h2>
          <p>
            {copy.detail.score} {row.score ?? "—"} · {copy.buckets[row.bucket] || copy.buckets.unknown} ·{" "}
            {row.submitted_at?.slice(0, 10) || copy.detail.noDate} ·{" "}
            {formatStatus(currentStatus, copy)}
          </p>
          {(row.company || row.stage) && (
            <p>
              {[row.company, row.stage].filter(Boolean).join(" · ")}
            </p>
          )}
        </div>

        {row.intercom_contact_url && (
          <a
            href={row.intercom_contact_url}
            target="_blank"
            rel="noreferrer"
            className="text-link"
          >
            {copy.detail.intercom}
          </a>
        )}
      </div>

      <div className="csv-nps-customer-workspace-grid">
        <div className="csv-nps-selected-response-card csv-nps-customer-feedback-card">
          <h3>{copy.detail.feedback}</h3>
          <p className="csv-nps-muted-cell">{copy.detail.feedbackHelp}</p>

          {detailLoading && (
            <p className="csv-nps-muted-cell">{copy.detail.loading}</p>
          )}
          {detailError && (
            <div className="csv-nps-error csv-nps-error-compact">{detailError}</div>
          )}
          <SurveyQuestionScoreTable row={row} copy={copy} />
          <div className="csv-nps-response-themes">
            <h4>{copy.themeSection.title}</h4>
            {getClosingLoopThemes(row, true).length > 0 ? (
              <div className="csv-nps-loop-theme-list">
                {getClosingLoopThemes(row, true).map((theme) => (
                  <span key={theme} className="csv-nps-loop-theme-chip">
                    {formatTheme(theme, copy)}
                  </span>
                ))}
              </div>
            ) : (
              <p className="csv-nps-muted-cell">
                {copy.themeSection.empty}
              </p>
            )}
          </div>
        </div>

        <div className="csv-nps-selected-response-card csv-nps-next-action-card">
          <h3>{copy.detail.nextAction}</h3>
          {!hasCase ? (
            <div className="csv-nps-no-follow-up-state">
              <strong>{copy.detail.noFollowUp}</strong>
              <p>{copy.detail.noFollowUpHelp}</p>
              <button type="button" className="csv-nps-button" onClick={onStartFollowUp} disabled={readOnly || caseMutation.loading}>
                {caseMutation.loading ? copy.detail.saving : copy.detail.start}
              </button>
            </div>
          ) : (
            <>
              {row.intercom_contact_url && (
                <a href={row.intercom_contact_url} target="_blank" rel="noreferrer" className="csv-nps-button csv-nps-button-secondary">
                  {copy.detail.contact}
                </a>
              )}
              {nextStatusAction && (
                <button type="button" className="csv-nps-button" onClick={() => onUpdateFollowUp({ status: nextStatusAction.status, ...(nextStatusAction.status === "closed" ? { note: noteDraft.trim() } : {}) })} disabled={readOnly || caseMutation.loading}>
                  {nextStatusAction.label}
                </button>
              )}
              <label className="csv-nps-filter-field">
                <span>{copy.detail.owner}</span>
                <select value={row.case.owner_membership_id || ""} onChange={(event) => onUpdateFollowUp({ ownerMembershipId: event.target.value || null })} disabled={readOnly || caseMutation.loading}>
                  <option value="">{copy.queue.unassigned}</option>
                  {assignableOwners.map((owner) => <option key={owner.membershipId} value={owner.membershipId}>{owner.fullName || owner.email}</option>)}
                </select>
              </label>
              <div className="csv-nps-filter-field">
                <span>{copy.detail.priority}</span>
                <span className={`csv-nps-loop-risk ${getRiskBand(getClosingLoopRiskScore(row))}`}>
                  {getClosingLoopRiskScore(row)} / 100
                </span>
                <small className="csv-nps-muted-cell">
                  {getClosingLoopRecommendation(row, copy)}
                </small>
              </div>
            </>
          )}
          {caseMutation.error && <div className="csv-nps-error csv-nps-error-compact">{caseMutation.error}</div>}

          <div className="csv-nps-next-action-notes csv-nps-loop-action-field">
            <h4>{copy.detail.notes}</h4>
            <textarea
              id="closing-loop-note"
              aria-label={copy.detail.notes}
              value={noteDraft}
              onChange={(event) => onNoteChange(event.target.value)}
              placeholder={copy.detail.notePlaceholder}
              rows={4}
              disabled={!hasCase || readOnly || caseMutation.loading}
            />
            <button
              type="button"
              className="csv-nps-button"
              onClick={onAddNote}
              disabled={!hasCase || readOnly || caseMutation.loading}
            >
              {caseMutation.loading ? copy.detail.saving : copy.detail.saveNote}
            </button>
          </div>
        </div>

        <div className="csv-nps-selected-response-card csv-nps-timeline-card">
          <h3>{copy.detail.timeline}</h3>
          <p className="csv-nps-muted-cell">{copy.detail.timelineHelp}</p>
          {caseEventsLoading && <p className="csv-nps-muted-cell">{copy.detail.loading}</p>}
          {caseEventsError && <div className="csv-nps-error csv-nps-error-compact">{caseEventsError}</div>}
          {!caseEventsLoading && caseEvents.length === 0 ? <p className="csv-nps-muted-cell">{copy.detail.timelineEmpty}</p> : (
            <div className="csv-nps-case-timeline">{caseEvents.map((event) => <CaseTimelineEvent key={event.id} event={event} copy={copy} />)}</div>
          )}
        </div>

        <details className="csv-nps-selected-response-card csv-nps-collapsible-card">
          <summary><span>{copy.detail.legacy}</span><small>{copy.detail.legacyHelp}</small></summary>
          {savedActions.length ? savedActions.map((savedAction) => <div key={savedAction.id || savedAction.updatedAt} className="csv-nps-loop-saved-action"><div className="csv-nps-loop-saved-action-meta"><strong>{formatStatus(savedAction.status, copy)}</strong>{savedAction.updatedAt && <span>{new Date(savedAction.updatedAt).toLocaleString()}</span>}</div>{savedAction.actionTaken && <p>{savedAction.actionTaken}</p>}</div>) : <p className="csv-nps-muted-cell">{copy.detail.noLegacy}</p>}
        </details>

        <details className="csv-nps-selected-response-card csv-nps-collapsible-card">
          <summary><span>{copy.detail.replyTools}</span><small>{copy.detail.replyHelp}</small></summary>
          <button type="button" className="csv-nps-button" onClick={onGenerateDraft} disabled={replyDraftLoading}>{replyDraftLoading ? copy.detail.generating : copy.detail.generate}</button>
          {replyDraftError && <div className="csv-nps-error csv-nps-error-compact">{replyDraftError}</div>}
          {replyDraft?.body ? <><textarea value={replyDraft.body} onChange={(event) => onDraftChange(event.target.value)} rows={7} className="csv-nps-reply-draft-textarea" /><button type="button" className="csv-nps-button csv-nps-button-secondary" onClick={onCopyDraft}>{replyDraftCopied ? copy.detail.copied : copy.detail.copy}</button></> : !replyDraftLoading && !replyDraftError && <p className="csv-nps-muted-cell">{copy.detail.noDraft}</p>}
          <p className="csv-nps-muted-cell">{copy.detail.draftNotice}</p>
        </details>
      </div>
    </section>
  );
}

function CaseTimelineEvent({ event, copy }) {
  const labels = {
    case_created: copy.detail.caseOpened,
    note_added: copy.detail.noteAdded,
    status_changed: copy.detail.statusChanged,
    owner_changed: copy.detail.ownerChanged,
    priority_changed: copy.detail.priorityChanged,
  };
  const detail = event.event_type === "status_changed"
    ? formatStatus(event.new_status, copy)
    : event.event_type === "priority_changed"
      ? copy.priorities[event.new_priority]
      : event.note || "";

  return (
    <article className="csv-nps-case-timeline-event">
      <span className="csv-nps-case-timeline-marker" aria-hidden="true" />
      <div>
        <strong>{labels[event.event_type] || copy.detail.event}</strong>
        {detail && <p>{detail}</p>}
        <time dateTime={event.created_at}>{formatCompactDateTime(event.created_at)}</time>
      </div>
    </article>
  );
}

function SurveyQuestionScoreTable({ row, copy }) {
  const selectedBenefits = uniqueStrings([
    row.q_benefits,
    ...(Array.isArray(row.selected_options) ? row.selected_options : []),
    ...(Array.isArray(row.selected_options_json) ? row.selected_options_json : []),
  ]).join(", ");

  const extraQuestions = buildExtraSurveyQuestionRows(row.extra_scores || row.extra_scores_json);
  const existingComments = [
    row.q_recommend_comment,
    row.q_install_comment,
    row.q_parent_relation_comment,
    row.q_support_comment,
    row.q_final_comment,
    selectedBenefits,
    ...extraQuestions.map((item) => item.comment),
  ]
    .filter(Boolean)
    .map((value) => String(value).trim());

  const mainComment = String(row.comment || "").trim();
  const shouldShowMainComment =
    mainComment && !existingComments.includes(mainComment);

  const questions = [
    {
      label: copy.detail.recommendation,
      score: row.q_recommend_score,
      comment: row.q_recommend_comment,
    },
    {
      label: copy.detail.installation,
      score: row.q_install_score,
      comment: row.q_install_comment,
    },
    {
      label: copy.detail.dailyUse,
      score: row.q_daily_use_score,
      comment: row.q_daily_use_comment,
    },
    {
      label: copy.detail.benefits,
      score: null,
      comment: selectedBenefits,
    },
    {
      label: copy.detail.parentRelation,
      score: row.q_parent_relation_score,
      comment: row.q_parent_relation_comment,
    },
    {
      label: copy.detail.support,
      score: row.q_support_score,
      comment: row.q_support_comment,
    },
    {
      label: copy.detail.finalComment,
      score: null,
      comment: row.q_final_comment,
    },
    ...extraQuestions,
    {
      label: copy.detail.overallNps,
      helper: copy.detail.headlineScore,
      score: row.score,
      comment: mainComment,
    },
    ...(shouldShowMainComment && row.score == null
      ? [
          {
            label: copy.detail.additionalComment,
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
        {copy.detail.noQuestions}
      </p>
    );
  }

  return (
    <div className="csv-nps-table-wrap">
      <table className="csv-nps-table csv-nps-survey-response-table">
        <thead>
          <tr>
            <th>{copy.detail.question}</th>
            <th>{copy.detail.score}</th>
            <th>{copy.detail.comment}</th>
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

function buildExtraSurveyQuestionRows(extraScores) {
  if (!extraScores || Array.isArray(extraScores) || typeof extraScores !== "object") {
    return [];
  }

  const knownKeys = new Set([
    "q_recommend_score", "qRecommendScore", "q_recommend_comment", "qRecommendComment",
    "q_install_score", "qInstallScore", "q_install_comment", "qInstallComment",
    "q_daily_use_score", "qDailyUseScore", "q_daily_use_comment", "qDailyUseComment",
    "q_parent_relation_score", "qParentRelationScore", "q_parent_relation_comment", "qParentRelationComment",
    "q_support_score", "qSupportScore", "q_support_comment", "qSupportComment",
    "q_final_comment", "qFinalComment",
    "comment", "response_comment", "nps_comment", "feedback", "feedback_text",
    "customer_comment",
  ]);
  const entries = Object.entries(extraScores).filter(
    ([key, value]) => !knownKeys.has(key) && hasSurveyValue(value)
  );
  const handled = new Set();

  return entries.flatMap(([key, value]) => {
    if (handled.has(key)) return [];

    const scoreMatch = key.match(/^(.*?)(?:_score|Score)$/);
    if (scoreMatch) {
      const base = scoreMatch[1];
      const commentEntry = entries.find(([candidate]) =>
        candidate === `${base}_comment` || candidate === `${base}Comment`
      );
      if (commentEntry) handled.add(commentEntry[0]);
      handled.add(key);
      return [{
        label: formatSurveyFieldLabel(base),
        score: normaliseSurveyScore(value),
        comment: formatSurveyAnswer(commentEntry?.[1]),
      }];
    }

    if (key.match(/(?:_comment|Comment)$/)) {
      handled.add(key);
      return [{
        label: formatSurveyFieldLabel(key.replace(/(?:_comment|Comment)$/, "")),
        score: null,
        comment: formatSurveyAnswer(value),
      }];
    }

    handled.add(key);
    const numericScore = normaliseSurveyScore(value);
    return [{
      label: formatSurveyFieldLabel(key),
      score: numericScore,
      comment: numericScore == null ? formatSurveyAnswer(value) : "",
    }];
  }).filter((item) => item.score != null || item.comment);
}

function hasSurveyValue(value) {
  return value !== null && value !== undefined && String(value).trim() !== "";
}

function normaliseSurveyScore(value) {
  const score = Number(value);
  return Number.isFinite(score) && score >= 0 && score <= 10 ? score : null;
}

function formatSurveyAnswer(value) {
  if (Array.isArray(value)) return uniqueStrings(value).join(", ");
  if (value && typeof value === "object") return "";
  return String(value ?? "").trim();
}

function formatSurveyFieldLabel(value) {
  return String(value || "Question")
    .replace(/^q[_-]?/i, "")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
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

function formatStatus(status, copy) {
  if (copy?.statuses?.[status]) return copy.statuses[status];
  if (status === "no_case") return "No case";
  if (status === "in_progress") return "In progress";
  if (status === "closed") return "Closed";
  return "Open";
}

function formatPriority(priority, copy) {
  if (copy?.priorities?.[priority]) return copy.priorities[priority];
  if (priority === "high") return "High";
  if (priority === "low") return "Low";
  if (priority === "normal") return "Normal";
  return "Not set";
}

function getRecommendedPriority(score) {
  const numericScore = Number(score);

  if (!Number.isFinite(numericScore) || numericScore < 0 || numericScore > 10) {
    return "normal";
  }

  if (numericScore <= 6) return "high";
  if (numericScore <= 8) return "normal";
  return "low";
}

const CLOSING_LOOP_THEME_RULES = [
  { key: "onboarding", patterns: [/onboard/i, /mise en (route|place)/i, /d[eé]marr/i, /installation/i] },
  { key: "wifi", patterns: [/wifi/i, /connexion/i, /internet/i, /r[eé]seau/i] },
  { key: "support", patterns: [/support/i, /réponse/i, /lenteur/i, /ticket/i] },
  { key: "billing", patterns: [/factur/i, /paiement/i, /prix/i, /tarif/i] },
  { key: "reliability", patterns: [/bug/i, /plante/i, /crash/i, /marche pas/i, /fiab/i] },
  { key: "attendance_sheet", patterns: [/fiche de pr[eé]sence/i, /feuilles? de pr[eé]sence/i] },
  { key: "time_tracking", patterns: [/horaires?/i, /heures?/i, /pointage/i, /\bpointer\b/i, /heures suppl[eé]mentaires/i] },
  { key: "lateness", patterns: [/retards?/i, /[aà]\s*l['’]?heure/i, /ponctual/i] },
  { key: "parents", patterns: [/parents?/i, /employeurs?/i, /rapport(s)? avec les parents/i] },
  { key: "setup", patterns: [/installation/i, /prise en main/i, /d[eé]marr/i, /onboard/i] },
  { key: "reliability", patterns: [/ne fonctionne pas/i, /fonctionne pas/i, /marche pas/i, /bug/i, /fait parfois des siennes/i] },
  { key: "feature_requests", patterns: [/ajouter/i, /ce serait bien/i, /am[eé]lior/i, /repas/i, /sieste/i, /changes?/i, /carnet de liaison/i, /brochures?/i] },
  { key: "support_speed", patterns: [/r[eé]actif/i, /support/i, /disponibil/i, /[eé]coute/i] },
];

function getClosingLoopThemes(row, includeDetail = false) {
  const values = [row?.comment];
  if (includeDetail) {
    values.push(
      row?.q_recommend_comment,
      row?.q_install_comment,
      row?.q_daily_use_comment,
      row?.q_parent_relation_comment,
      row?.q_support_comment,
      row?.q_final_comment
    );
  }
  const text = values.filter(Boolean).join(" ");
  return Array.from(new Set(
    CLOSING_LOOP_THEME_RULES
      .filter((rule) => rule.patterns.some((pattern) => pattern.test(text)))
      .map((rule) => rule.key)
  ));
}

function formatTheme(theme, copy) {
  return theme ? copy.themes?.[theme] || theme.replaceAll("_", " ") : "";
}

function getClosingLoopRiskScore(row) {
  const hasScore = row?.score !== null && row?.score !== undefined && row?.score !== "";
  const score = hasScore ? Number(row.score) : NaN;
  const bucket = row?.bucket;
  const comment = String(row?.comment || "").trim();
  let risk = bucket === "detractor" ? 60 : bucket === "passive" ? 25 : bucket === "promoter" ? 5 : 0;

  if (Number.isFinite(score)) {
    risk += Math.max(0, 10 - score) * 2;
  }

  const themeCount = getClosingLoopThemes({ comment }).length;
  risk += Math.min(20, themeCount * 4);

  if (comment.split(/\s+/).filter(Boolean).length >= 8) risk += 8;

  return Math.max(0, Math.min(100, Math.round(risk)));
}

function getRiskBand(riskScore) {
  if (riskScore >= 80) return "is-critical";
  if (riskScore >= 50) return "is-high";
  if (riskScore >= 25) return "is-medium";
  return "is-low";
}

function getClosingLoopRecommendation(row, copy) {
  if (row?.bucket === "detractor") {
    return getClosingLoopRiskScore(row) >= 80
      ? copy.recommendations.callToday
      : copy.recommendations.messageToday;
  }
  if (row?.bucket === "passive") return copy.recommendations.followUp;
  if (row?.bucket === "promoter") return copy.recommendations.thank;
  return copy.recommendations.review;
}

function formatCompactDateTime(value) {
  const date = new Date(value || "");
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function formatCompactDate(value) {
  const date = new Date(value || "");
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}
