// src/pages/CsvNpsResponses.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import CsvNpsWorkspaceNav from "../components/CsvNpsWorkspaceNav";

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
        const res = await fetch(`/api/nps-data/datasets/${datasetId}`);
        const data = await res.json();

        if (!res.ok || !data.ok) {
          throw new Error(data.error || "Failed to load saved dataset");
        }

        setDataset(normaliseSavedDataset(data));
      } catch (err) {
        console.error("Failed to load saved NPS dataset:", err);
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
        row.customer_name,
        row.customer_email,
        row.company,
        row.stage,
        row.comment,
        row.score,
        row.bucket,
        row.contact_id,
        row.intercom_contact_url,
        ...(row.selected_options || []),
        JSON.stringify(row.extra_scores || {}),
        JSON.stringify(row.raw || {}),
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
        <section className="csv-nps-hero">
          <p className="eyebrow">NPS data workspace</p>
          <h1>NPS Responses</h1>
          <p>Loading saved dataset...</p>
        </section>

        <CsvNpsWorkspaceNav />

        <section className="csv-nps-panel">
          <p>Loading response data from Supabase.</p>
        </section>
      </main>
    );
  }

  if (datasetError) {
    return (
      <main className="csv-nps-page">
        <section className="csv-nps-hero">
          <p className="eyebrow">NPS data workspace</p>
          <h1>NPS Responses</h1>
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
        <section className="csv-nps-hero">
          <p className="eyebrow">NPS data workspace</p>
          <h1>NPS Responses</h1>
          <p>No NPS dataset has been loaded yet.</p>
        </section>

        <CsvNpsWorkspaceNav />

        <section className="csv-nps-panel">
          <p>
            Go to{" "}
            <a className="text-link" href="/csv-nps/upload">
              NPS Data Import
            </a>{" "}
            and analyse or save a dataset first.
          </p>
        </section>
      </main>
    );
  }

  const datasetName = dataset.datasetName || "Latest browser-session dataset";

  return (
    <main className="csv-nps-page">
      <section className="csv-nps-hero">
        <p className="eyebrow">NPS data workspace</p>
        <h1>NPS Responses</h1>
        <p>
          Review the normalised customer feedback for{" "}
          <strong>{datasetName}</strong>
          {datasetId
            ? ", loaded from Supabase."
            : ", analysed in this browser session."}
        </p>
      </section>

      <CsvNpsWorkspaceNav />

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
              placeholder="Search customer, email, comment, benefit..."
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
                <th>Customer</th>
                <th>Email</th>
                <th>Score</th>
                <th>Bucket</th>
                <th>Comment</th>
                <th>Selected options</th>
              </tr>
            </thead>

            <tbody>
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan="7">No responses match the current filters.</td>
                </tr>
              ) : (
                filteredRows.map((row) => (
                  <tr key={row.response_id}>
                    <td>{row.submitted_at?.slice(0, 10) || "—"}</td>
                    <td>{row.customer_name || "—"}</td>
                    <td>{row.customer_email || "—"}</td>
                    <td>{row.score}</td>
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

function normaliseSavedDataset(apiResponse) {
  const savedDataset = apiResponse.dataset || {};
  const savedRows = apiResponse.rows || [];

  const rows = savedRows.map((row) => ({
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
