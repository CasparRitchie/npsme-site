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
        const res = await fetch(`/api/workspace/datasets/${datasetId}`, {
          credentials: "include",
        });
        const data = await res.json();

        if (!res.ok || !data.ok) {
          throw new Error(data.error || "Failed to load saved dataset");
        }

        setDataset(normaliseSavedDataset(data));
      } catch (err) {
        console.error("Failed to load saved workspace dataset:", err);
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
        setDataset(JSON.parse(saved));
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
        ...(row.selected_options || []),
        JSON.stringify(row.extra_scores || {}),
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !searchTerm.trim() ||
        haystack.includes(searchTerm.trim().toLowerCase());

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
          <p>Loading response data from workspace storage.</p>
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
              placeholder="Search comment, score, bucket or selected option..."
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
                <th>Contact</th>
                <th>Score</th>
                <th>Bucket</th>
                <th>Comment</th>
                <th>Selected options</th>
                <th>Intercom</th>
              </tr>
            </thead>

            <tbody>
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan="7">No responses match the current filters.</td>
                </tr>
              ) : (
                filteredRows.map((row) => (
                  <tr key={row.response_id || row.id}>
                    <td>{row.submitted_at?.slice(0, 10) || "—"}</td>
                    <td>{row.contact_label || "Contact"}</td>
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
                    <td>
                      {row.intercom_contact_url ? (
                        <a
                          href={row.intercom_contact_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-link"
                        >
                          Open
                        </a>
                      ) : (
                        "—"
                      )}
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

function normaliseSavedDataset(apiResponse) {
  const savedDataset = apiResponse.dataset || {};
  const savedRows = apiResponse.rows || [];

  const rows = savedRows.map((row) => ({
    id: row.id,
    response_id: row.response_id || row.id,
    source: row.source,
    row_number: row.row_number,
    submitted_at: row.submitted_at,
    score: row.score,
    bucket: row.bucket,
    company: row.company || null,
    stage: row.stage || null,
    comment: row.comment || "",
    contact_label: row.contact_label || "Contact",
    intercom_contact_url: row.intercom_contact_url || null,
    selected_options: row.selected_options_json || [],
    extra_scores: row.extra_scores_json || {},
    created_at: row.created_at || null,
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
    summary: normaliseSummary(savedDataset.summary_json, rows),
    rows,
  };
}

function normaliseSummary(summaryJson, rows) {
  const summary = summaryJson || {};

  return {
    total: summary.total ?? rows.length,
    promoters:
      summary.promoters ?? rows.filter((row) => row.bucket === "promoter").length,
    passives:
      summary.passives ?? rows.filter((row) => row.bucket === "passive").length,
    detractors:
      summary.detractors ??
      rows.filter((row) => row.bucket === "detractor").length,
    nps: summary.nps ?? calculateNps(rows),
    averageScore: summary.averageScore ?? calculateAverageScore(rows),
  };
}

function calculateNps(rows) {
  const total = rows.length;
  if (!total) return null;

  const promoters = rows.filter((row) => row.bucket === "promoter").length;
  const detractors = rows.filter((row) => row.bucket === "detractor").length;

  return Math.round(((promoters - detractors) / total) * 100);
}

function calculateAverageScore(rows) {
  const scores = rows
    .map((row) => Number(row.score))
    .filter((score) => Number.isFinite(score));

  if (!scores.length) return null;

  return Math.round(
    (scores.reduce((sum, score) => sum + score, 0) / scores.length) * 10
  ) / 10;
}
