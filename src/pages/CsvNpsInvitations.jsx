import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import CsvNpsWorkspaceNav from "../components/CsvNpsWorkspaceNav";
import WorkspaceDatasetHeader from "../components/WorkspaceDatasetHeader";

const PAGE_COPY = {
  eyebrow: "NPS Me Workspace",
  title: "Invitations",
  savedSubtitle:
    "Track survey invitations, delivery status, responses and response rate for this workspace dataset.",
  intercomSubtitle:
    "Track survey invitations, delivery status, responses and response rate for the active Intercom source in this workspace.",
  sessionSubtitle:
    "Track invitations for the latest browser-session dataset where invitation data is available.",
};

function prettyDate(iso) {
  if (!iso) return "—";

  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";

  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusLabel(status) {
  if (status === "responded") return "Valid response";
  if (status === "completed_without_score") return "Completed without score";
  if (status === "delivered") return "Delivered";
  if (status === "opened") return "Started / opened";
  if (status === "bounced") return "Bounced";
  if (status === "failed") return "Failed";
  if (status === "sent") return "Sent";
  return status || "Unknown";
}

function statusPillClass(status) {
  if (status === "responded") {
    return "border-emerald-400/30 bg-emerald-500/10 text-emerald-200";
  }

  if (status === "completed_without_score") {
    return "border-amber-400/30 bg-amber-500/10 text-amber-200";
  }

  if (status === "delivered") {
    return "border-sky-400/30 bg-sky-500/10 text-sky-200";
  }

  if (status === "opened") {
    return "border-indigo-400/30 bg-indigo-500/10 text-indigo-200";
  }

  if (status === "bounced" || status === "failed") {
    return "border-rose-400/30 bg-rose-500/10 text-rose-200";
  }

  return "border-white/10 bg-white/5 text-slate-200";
}

function StatusPill({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-1 text-xs font-medium ${statusPillClass(
        status
      )}`}
    >
      {statusLabel(status)}
    </span>
  );
}

export default function CsvNpsInvitations() {
  const { datasetId } = useParams();

  const [dataset, setDataset] = useState(null);
  const [loadingDataset, setLoadingDataset] = useState(Boolean(datasetId));
  const [datasetError, setDatasetError] = useState("");
  const [mode, setMode] = useState(datasetId ? "saved" : "intercom");

  const [days, setDays] = useState(365);
  const [statusFilter, setStatusFilter] = useState("all");

  const [invites, setInvites] = useState({
    loading: true,
    data: null,
    error: null,
  });

  useEffect(() => {
    async function loadDatasetMeta() {
      if (!datasetId) {
        setLoadingDataset(false);
        setDataset(null);
        setMode("intercom");
        return;
      }

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

        setDataset(normaliseDatasetMeta(data.dataset));
        setMode(
          data?.dataset?.source_type === "workspace_intercom"
            ? "intercom"
            : "saved"
        );
      } catch (err) {
        console.error("Failed to load invitations dataset metadata:", err);
        setDatasetError(err.message || "Failed to load dataset metadata");
      } finally {
        setLoadingDataset(false);
      }
    }

    loadDatasetMeta();
  }, [datasetId]);

  useEffect(() => {
    let cancelled = false;

    async function loadInvitations() {
      setInvites({ loading: true, data: null, error: null });

      try {
        const qs = new URLSearchParams({
          days: String(days || 365),
          status: String(statusFilter || "all"),
        });

        if (dataset?.content_id) {
          qs.set("content_id", dataset.content_id);
        }

        const res = await fetch(
          `/api/workspace-intercom/invitations?${qs.toString()}`,
          {
            credentials: "include",
          }
        );

        const data = await res.json().catch(() => null);

        if (cancelled) return;

        setInvites({
          loading: false,
          data,
          error: res.ok && data?.ok ? null : data?.error || "Failed to load invitations",
        });
      } catch (err) {
        if (!cancelled) {
          setInvites({
            loading: false,
            data: null,
            error: err.message || "Failed to load invitations",
          });
        }
      }
    }

    loadInvitations();

    return () => {
      cancelled = true;
    };
  }, [days, statusFilter, dataset?.content_id]);

  const summary = invites.data?.summary || {};
  const rows = Array.isArray(invites.data?.rows) ? invites.data.rows : [];
  const source = invites.data?.source || null;
  const refresh = invites.data?.refresh || null;
  const lifecycleMetrics = useMemo(() => {
    const sent = Number(summary.sent || 0);

    const validResponses = Number(
      summary.valid_nps_responses ?? summary.responded ?? 0
    );

    const explicitCompletions = Number(
      summary.intercom_completed ?? summary.completed ?? 0
    );

    const completedWithoutScore = Number(
      summary.completed_without_valid_score || 0
    );

    /*
    * Prefer the exact backend figure. The fallback reconciles the totals:
    *
    * valid responses without completion event
    * = valid responses
    * - all explicit completion events
    * + completion events that did not produce a valid score
    */
    const validWithoutCompletionEvent = Number(
      summary.valid_responses_without_completion_event ??
        Math.max(
          0,
          validResponses -
            explicitCompletions +
            completedWithoutScore
        )
    );

    return {
      sent,
      validResponses,
      explicitCompletions,
      completedWithoutScore,
      validWithoutCompletionEvent,
    };
  }, [
    summary.sent,
    summary.responded,
    summary.valid_nps_responses,
    summary.completed,
    summary.intercom_completed,
    summary.completed_without_valid_score,
    summary.valid_responses_without_completion_event,
  ]);

  const subtitle = datasetId
    ? PAGE_COPY.savedSubtitle
    : mode === "intercom"
      ? PAGE_COPY.intercomSubtitle
      : PAGE_COPY.sessionSubtitle;

  const opportunitySummary = useMemo(() => {
    if (invites.loading) {
      return "Loading invitation opportunity summary...";
    }

    const {
      sent,
      validResponses,
      explicitCompletions,
      completedWithoutScore,
      validWithoutCompletionEvent,
    } = lifecycleMetrics;

    if (!sent) {
      return "No invitations were found for the selected period.";
    }

    const startedButNotCompleted = Number(
      summary.started_but_not_completed || 0
    );

    const noActivity = Number(
      summary.no_response_activity || 0
    );

    const resultParts = [
      `${validResponses} of ${sent} invitations produced a valid scored NPS response`,
      `${explicitCompletions} have an explicit completion event in the Intercom invitation statistics`,
    ];

    if (validWithoutCompletionEvent > 0) {
      resultParts.push(
        `${validWithoutCompletionEvent} valid response${
          validWithoutCompletionEvent === 1 ? "" : "s"
        } ${
          validWithoutCompletionEvent === 1 ? "does" : "do"
        } not have a matching Intercom completion event`
      );
    }

    if (completedWithoutScore > 0) {
      resultParts.push(
        `${completedWithoutScore} explicit completion${
          completedWithoutScore === 1 ? "" : "s"
        } did not produce a valid NPS score`
      );
    }

    const followUpParts = [];

    if (startedButNotCompleted > 0) {
      followUpParts.push(
        `${startedButNotCompleted} started but not completed`
      );
    }

    if (noActivity > 0) {
      followUpParts.push(
        `${noActivity} with no detected response activity`
      );
    }

    const reconciliationText = `${resultParts.join(". ")}.`;

    if (followUpParts.length === 0) {
      return `${reconciliationText} There are no currently detected incomplete or untouched invitations requiring survey follow-up.`;
    }

    return `${reconciliationText} The clearest follow-up opportunities are ${followUpParts.join(
      " and "
    )}. Valid NPS responses remain the authoritative response measure; Intercom completion events are shown separately as a technical lifecycle measure.`;
  }, [
    invites.loading,
    lifecycleMetrics,
    summary.started_but_not_completed,
    summary.no_response_activity,
  ]);

  if (loadingDataset) {
    return (
      <main className="csv-nps-page">
        <section className="csv-nps-hero csv-nps-hero-compact">
          <p className="eyebrow">{PAGE_COPY.eyebrow}</p>
          <h1>{PAGE_COPY.title}</h1>
          <p>Loading invitation data...</p>
        </section>

        <CsvNpsWorkspaceNav />

        <section className="csv-nps-panel">
          <p>Loading invitation data from workspace.</p>
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
        <div className="csv-nps-filters csv-nps-filters-three">
          <label className="csv-nps-filter-field">
            <span>Window</span>
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
            >
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
              <option value={180}>Last 180 days</option>
              <option value={365}>Last 365 days</option>
            </select>
          </label>

          <label className="csv-nps-filter-field">
            <span>Status</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="sent">Sent</option>
              <option value="delivered">Delivered</option>
              <option value="opened">Started / opened</option>
              <option value="responded">Valid NPS response</option>
              <option value="bounced">Bounced</option>
              <option value="failed">Failed</option>
              <option value="completed_without_score">Completed without score</option>
            </select>
          </label>

          <div className="csv-nps-filter-field">
            <span>Source</span>
            <div className="text-sm text-slate-300">
              <div>
                {source?.source_name ||
                  dataset?.datasetName ||
                  "Active Intercom source"}
              </div>

              {refresh && (
                <div className="csv-nps-muted-cell">
                  {refresh.ran
                    ? "Invitation data refreshed just now"
                    : refresh.reason === "fresh"
                      ? "Invitation data recently refreshed"
                      : refresh.reason === "waited_for_existing_refresh"
                        ? "Invitation data refreshed by another request"
                        : refresh.error
                          ? `Refresh warning: ${refresh.error}`
                          : "Invitation data loaded"}
                </div>
              )}
            </div>
          </div>
        </div>

        {invites.error && (
          <section className="csv-nps-error">
            {invites.error}
          </section>
        )}

        <div className="csv-nps-responses-header">
          <div>
            <h2>Invitation performance</h2>
            <p>
              Track whether survey invitations are producing responses, and find
              quick-win follow-up opportunities.
            </p>
          </div>
        </div>

        <div className="csv-nps-metric-grid">
          <MetricCard
            label="Invitations sent"
            value={invites.loading ? "…" : summary.sent ?? "—"}
            sub={`${days}-day window`}
            description="All survey invitations detected in the selected period."
          />

          <MetricCard
            label="Opened or started"
            value={invites.loading ? "…" : summary.opened ?? "—"}
            description="Invitations with detected opening, answering or completion activity."
          />

          <MetricCard
            label="Valid NPS responses"
            value={
              invites.loading
                ? "…"
                : lifecycleMetrics.validResponses
            }
            description="Canonical responses containing a usable score from 0 to 10."
          />

          <MetricCard
            label="NPS response rate"
            value={
              invites.loading
                ? "…"
                : summary.response_rate_pct == null
                  ? "—"
                  : `${summary.response_rate_pct}%`
            }
            description="Valid scored NPS responses divided by invitations sent."
          />

          <MetricCard
            label="Recorded completion events"
            value={
              invites.loading
                ? "…"
                : lifecycleMetrics.explicitCompletions
            }
            description="Invitations for which Intercom exported an explicit completion timestamp."
          />

          <MetricCard
            label="Completion event rate"
            value={
              invites.loading
                ? "…"
                : summary.intercom_completion_rate_pct == null
                  ? "—"
                  : `${summary.intercom_completion_rate_pct}%`
            }
            description="Explicit Intercom completion events divided by invitations sent."
          />

          <MetricCard
            label="Valid responses without completion event"
            value={
              invites.loading
                ? "…"
                : lifecycleMetrics.validWithoutCompletionEvent
            }
            description="Usable NPS responses where the invitation statistics did not include a matching completion event."
          />

          <MetricCard
            label="Completed without valid score"
            value={
              invites.loading
                ? "…"
                : lifecycleMetrics.completedWithoutScore
            }
            description="Explicit Intercom completions that did not produce a usable 0–10 score."
          />

          <MetricCard
            label="Started but not completed"
            value={
              invites.loading
                ? "…"
                : summary.started_but_not_completed ?? "—"
            }
            description="Invitations with response activity but no completion or valid NPS response."
          />

          <MetricCard
            label="No response activity"
            value={
              invites.loading
                ? "…"
                : summary.no_response_activity ?? "—"
            }
            description="Invitations with no detected opening, answer, completion or response."
          />

          <MetricCard
            label="Last invitation"
            value={
              invites.loading
                ? "…"
                : prettyDate(summary.last_sent_at)
            }
            description="Most recent invitation detected in the selected period."
          />
        </div>

        <section className="csv-nps-chart-card csv-nps-chart-card-wide">
          <div className="csv-nps-responses-header">
            <div>
              <h3>How these figures reconcile</h3>
              <p>
                Valid NPS responses and Intercom completion events measure different
                parts of the survey lifecycle.
              </p>
            </div>
          </div>

          <div className="csv-nps-management-summary">
            <p>
              <strong>
                {lifecycleMetrics.validResponses} valid NPS responses
              </strong>{" "}
              were found in the canonical response data. Intercom separately recorded{" "}
              <strong>
                {lifecycleMetrics.explicitCompletions} explicit completion events
              </strong>
              .
            </p>

            <p>
              Of these results,{" "}
              <strong>
                {lifecycleMetrics.validWithoutCompletionEvent}
              </strong>{" "}
              valid response
              {lifecycleMetrics.validWithoutCompletionEvent === 1 ? "" : "s"}{" "}
              {lifecycleMetrics.validWithoutCompletionEvent === 1 ? "has" : "have"} no
              matching completion event, while{" "}
              <strong>
                {lifecycleMetrics.completedWithoutScore}
              </strong>{" "}
              recorded completion
              {lifecycleMetrics.completedWithoutScore === 1 ? "" : "s"} did not produce
              a valid score.
            </p>

            <p className="csv-nps-muted-cell">
              The valid NPS response total is used for NPS reporting. Completion events
              are retained as a separate Intercom delivery and lifecycle diagnostic.
            </p>
          </div>
        </section>

        <section className="csv-nps-chart-card csv-nps-chart-card-wide">
          <div className="csv-nps-responses-header">
            <div>
              <h3>Response opportunity</h3>
              <p>
                Use this to identify customers who may need a small prompt to
                complete the survey.
              </p>
            </div>
          </div>

          <div className="csv-nps-management-summary">
            <p>{opportunitySummary}</p>

            <div className="csv-nps-management-actions">
              <a className="csv-nps-button" href="/workspace/responses">
                Review responses
              </a>
              <a
                className="csv-nps-button csv-nps-button-secondary"
                href="/workspace/performance"
              >
                View performance
              </a>
            </div>
          </div>
        </section>

        <section className="csv-nps-chart-card csv-nps-chart-card-wide">
          <div className="csv-nps-responses-header">
            <div>
              <h3>Recent invitations</h3>
              <p>Latest invitation activity for the selected filter set.</p>
            </div>
          </div>

          {invites.loading && (
            <p className="mt-4 text-sm text-slate-300">
              Loading invitations...
            </p>
          )}

          {!invites.loading && !invites.error && rows.length === 0 && (
            <div className="csv-nps-empty-state">
              No invitations found for this filter set.
            </div>
          )}

          {!invites.loading && !invites.error && rows.length > 0 && (
            <div className="csv-nps-table-wrap">
              <table className="csv-nps-table">
                <thead>
                  <tr>
                    <th>Sent</th>
                    <th>Contact</th>
                    <th>Status</th>
                    <th>Score</th>
                    <th>Response</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {rows.map((row, idx) => (
                    <tr
                      key={row.invitation_id || `${row.customer_id || "invite"}-${idx}`}
                    >
                      <td>{prettyDate(row.sent_at)}</td>

                      <td>
                        <div>{row.contact_label || "—"}</div>
                        {row.intercom_contact_url && (
                          <div className="csv-nps-muted-cell">
                            <a
                              href={row.intercom_contact_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-link"
                            >
                              Open in Intercom
                            </a>
                          </div>
                        )}
                      </td>

                      <td>
                        <StatusPill status={row.status} />
                      </td>

                      <td>
                        {typeof row.score_0_10 === "number"
                          ? row.score_0_10
                          : "—"}
                      </td>

                      <td>{row.response_id || "—"}</td>

                      <td>
                        {row.response_id ? (
                          <a
                            className="text-link"
                            href={`/workspace/responses?q=${encodeURIComponent(
                              row.response_id
                            )}`}
                          >
                            View response
                          </a>
                        ) : row.intercom_contact_url ? (
                          <a
                            className="text-link"
                            href={row.intercom_contact_url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {row.status === "completed_without_score"
                            ? "Review in Intercom"
                            : row.status === "opened"
                              ? "Prompt in Intercom"
                              : "Open in Intercom"}
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

function normaliseDatasetMeta(dataset) {
  const safeDataset = dataset || {};

  return {
    id: safeDataset.id || null,
    datasetName: safeDataset.dataset_name || "Workspace dataset",
    sourceType: safeDataset.source_type || null,
    content_id: safeDataset.content_id || null,
    rawRowCount: safeDataset.raw_row_count || 0,
    validRowCount: safeDataset.valid_row_count || 0,
    skippedRowCount: safeDataset.skipped_row_count || 0,
    summary: safeDataset.summary_json || {},
  };
}

function MetricCard({ label, value, sub, description }) {
  return (
    <div className="csv-nps-metric-card">
      <div className="csv-nps-metric-label">{label}</div>

      <div className="csv-nps-metric-value">
        {value ?? "—"}
      </div>

      {sub ? (
        <div className="csv-nps-muted-cell">
          {sub}
        </div>
      ) : null}

      {description ? (
        <p className="mt-2 text-xs leading-relaxed text-slate-400">
          {description}
        </p>
      ) : null}
    </div>
  );
}
