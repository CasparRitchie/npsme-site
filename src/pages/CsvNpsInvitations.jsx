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
  if (status === "responded") return "Responded";
  if (status === "delivered") return "Delivered";
  if (status === "opened") return "Opened";
  if (status === "bounced") return "Bounced";
  if (status === "failed") return "Failed";
  if (status === "sent") return "Sent";
  return status || "Unknown";
}

function statusPillClass(status) {
  if (status === "responded") {
    return "border-emerald-400/30 bg-emerald-500/10 text-emerald-200";
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

  const subtitle = datasetId
    ? PAGE_COPY.savedSubtitle
    : mode === "intercom"
      ? PAGE_COPY.intercomSubtitle
      : PAGE_COPY.sessionSubtitle;

  const opportunitySummary = useMemo(() => {
    if (invites.loading) return "Loading invitation opportunity summary...";

    if (!summary.sent) {
      return "No invitations were found for the selected period.";
    }

    const notResponded = Math.max(
      0,
      Number(summary.sent || 0) - Number(summary.responded || 0)
    );

    if (notResponded === 0) {
      return "All detected invitations in this period have a matched response. This is a strong result; keep monitoring future invitation batches.";
    }

    return `${notResponded} invitation${notResponded === 1 ? "" : "s"} in this period ${
      notResponded === 1 ? "has" : "have"
    } not yet produced a response. These are useful quick-win follow-up opportunities, especially for contacts who have opened Intercom but not completed the survey.`;
  }, [invites.loading, summary.sent, summary.responded]);

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
              <option value="opened">Opened</option>
              <option value="responded">Responded</option>
              <option value="bounced">Bounced</option>
              <option value="failed">Failed</option>
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
            sub={`${days}d`}
          />

          <MetricCard
            label="Delivered"
            value={invites.loading ? "…" : summary.delivered ?? "—"}
          />

          <MetricCard
            label="Opened"
            value={invites.loading ? "…" : summary.opened ?? "—"}
          />

          <MetricCard
            label="Responded"
            value={invites.loading ? "…" : summary.responded ?? "—"}
          />

          <MetricCard
            label="Response rate"
            value={
              invites.loading
                ? "…"
                : summary.response_rate_pct == null
                  ? "—"
                  : `${summary.response_rate_pct}%`
            }
          />

          <MetricCard
            label="Last invitation"
            value={invites.loading ? "…" : prettyDate(summary.last_sent_at)}
          />
        </div>

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
                            Prompt in Intercom
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

function MetricCard({ label, value, sub }) {
  return (
    <div className="csv-nps-metric-card">
      <div className="csv-nps-metric-label">{label}</div>
      <div className="csv-nps-metric-value">{value ?? "—"}</div>
      {sub ? <div className="csv-nps-muted-cell">{sub}</div> : null}
    </div>
  );
}
