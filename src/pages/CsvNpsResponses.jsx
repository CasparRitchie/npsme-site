// src/pages/CsvNpsResponses.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import CsvNpsWorkspaceNav from "../components/CsvNpsWorkspaceNav";
import WorkspaceDatasetHeader from "../components/WorkspaceDatasetHeader";

const PAGE_COPY = {
  eyebrow: "NPS Me Workspace",
  title: "Responses",
  savedSubtitle:
    "Review, search and filter the customer responses in this saved feedback dataset.",
  sessionSubtitle:
    "Review, search and filter the customer responses in the latest browser-session dataset.",
};

export default function CsvNpsResponses() {
  const { datasetId } = useParams();

  const [dataset, setDataset] = useState(null);
  const [loadingDataset, setLoadingDataset] = useState(Boolean(datasetId));
  const [datasetError, setDatasetError] = useState("");

  const [bucketFilter, setBucketFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function loadSavedDataset() {
      setLoadingDataset(true);
      setDatasetError("");

      try {
        const params = new URLSearchParams();
        params.set("limit", "500");

        const res = await fetch(
          `/api/workspace/datasets/${datasetId}/responses?${params.toString()}`,
          {
            credentials: "include",
          }
        );

        const data = await res.json();

        if (!res.ok || !data.ok) {
          throw new Error(data.error || "Failed to load saved dataset");
        }

        setDataset(normaliseWorkspaceResponsesDataset(data));
      } catch (err) {
        console.error("Failed to load saved workspace responses dataset:", err);
        setDatasetError(err.message || "Failed to load saved dataset");
      } finally {
        setLoadingDataset(false);
      }
    }

    function loadSessionDataset() {
      const saved = sessionStorage.getItem("csvNpsLatestDataset");

      if (!saved) {
        setDataset(null);
        return;
      }

      try {
        const parsed = JSON.parse(saved);
        setDataset(normaliseSessionDataset(parsed));
      } catch (err) {
        console.error("Failed to read CSV NPS dataset from sessionStorage", err);
        setDatasetError("Failed to read latest browser-session dataset");
      }
    }

    if (datasetId) {
      loadSavedDataset();
    } else {
      loadSessionDataset();
      setLoadingDataset(false);
    }
  }, [datasetId]);

  const filteredRows = useMemo(() => {
    const rows = dataset?.rows || [];
    const q = searchTerm.trim().toLowerCase();

    return rows.filter((row) => {
      const matchesBucket =
        bucketFilter === "all" || row.bucket === bucketFilter;

      const haystack = [
        row.contact_label,
        row.company,
        row.stage,
        row.comment,
        row.score,
        row.bucket,
        row.response_id,
        ...(row.selected_options || []),
        JSON.stringify(row.extra_scores || {}),
      ]
        .map((x) => String(x || "").toLowerCase())
        .join(" ");

      const matchesSearch = !q || haystack.includes(q);

      return matchesBucket && matchesSearch;
    });
  }, [dataset, bucketFilter, searchTerm]);

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
          <p>Loading response data from workspace.</p>
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
            <h2>Responses</h2>
            <p>
              Showing {filteredRows.length} of {dataset.rows.length} response
              {dataset.rows.length === 1 ? "" : "s"}.
            </p>
          </div>
        </div>

        <div className="csv-nps-filters">
          <label className="csv-nps-filter-field">
            <span>Search responses</span>
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search reference, company, stage, comment, benefit..."
            />
          </label>

          <label className="csv-nps-filter-field">
            <span>Bucket</span>
            <select
              value={bucketFilter}
              onChange={(e) => setBucketFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="promoter">Promoters</option>
              <option value="passive">Passives</option>
              <option value="detractor">Detractors</option>
            </select>
          </label>
        </div>

        <div className="csv-nps-table-wrap">
          <table className="csv-nps-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Reference</th>
                <th>Score</th>
                <th>Bucket</th>
                <th>Comment</th>
                <th>Selected options</th>
              </tr>
            </thead>

            <tbody>
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan="6">No responses match the current filters.</td>
                </tr>
              ) : (
                filteredRows.map((row) => (
                  <tr key={row.response_id || row.id}>
                    <td>{row.submitted_at?.slice(0, 10) || "—"}</td>

                    <td>
                      <div>{row.contact_label || "—"}</div>

                      {(row.company || row.stage) && (
                        <div className="csv-nps-muted-cell">
                          {[row.company, row.stage].filter(Boolean).join(" · ")}
                        </div>
                      )}
                    </td>

                    <td>{row.score ?? "—"}</td>

                    <td>
                      <span
                        className={`csv-nps-bucket csv-nps-bucket-${row.bucket}`}
                      >
                        {row.bucket}
                      </span>
                    </td>

                    <td>{row.comment || "—"}</td>

                    <td>
                      {row.selected_options?.length
                        ? row.selected_options.join(", ")
                        : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

function normaliseWorkspaceResponsesDataset(apiResponse) {
  const savedDataset = apiResponse.dataset || {};
  const savedRows = Array.isArray(apiResponse.rows) ? apiResponse.rows : [];

  return {
    id: savedDataset.id,
    datasetName: savedDataset.dataset_name,
    sourceType: savedDataset.source_type,
    content_id: savedDataset.content_id,
    rawRowCount: savedDataset.raw_row_count,
    validRowCount: savedDataset.valid_row_count,
    skippedRowCount: savedDataset.skipped_row_count,
    summary: savedDataset.summary_json || {},
    rows: savedRows.map((row) => ({
      id: row.id,
      response_id: row.response_id || row.id,
      source: row.source,
      row_number: row.row_number,
      submitted_at: row.submitted_at,
      score: row.score,
      bucket: row.bucket,
      company: row.company,
      stage: row.stage,
      comment: row.comment,
      contact_label: row.contact_label || "Contact",
      intercom_contact_url: row.intercom_contact_url,
      selected_options: row.selected_options_json || [],
      extra_scores: row.extra_scores_json || {},
      closeLoopActions: row.close_loop_actions || [],
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
      id: row.id || row.response_id,
      response_id: row.response_id || row.id,
      source: row.source,
      row_number: row.row_number,
      submitted_at: row.submitted_at,
      score: row.score,
      bucket: row.bucket,
      company: row.company || null,
      stage: row.stage || null,
      comment: row.comment,
      contact_label:
        row.contact_label ||
        row.company ||
        row.stage ||
        row.response_id ||
        "Contact",
      intercom_contact_url: row.intercom_contact_url || null,
      selected_options: row.selected_options || [],
      extra_scores: row.extra_scores || {},
      closeLoopActions: row.loopActions || [],
    })),
  };
}
