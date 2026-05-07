// src/pages/CsvNpsResponses.jsx
import React, { useEffect, useMemo, useState } from "react";

export default function CsvNpsResponses() {
  const [dataset, setDataset] = useState(null);
  const [bucketFilter, setBucketFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const saved = sessionStorage.getItem("csvNpsLatestDataset");

    if (!saved) return;

    try {
      setDataset(JSON.parse(saved));
    } catch (err) {
      console.error("Failed to read CSV NPS dataset from sessionStorage", err);
    }
  }, []);

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
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !searchTerm.trim() ||
        haystack.includes(searchTerm.trim().toLowerCase());

      return matchesBucket && matchesSearch;
    });
  }, [dataset, bucketFilter, searchTerm]);

  if (!dataset) {
    return (
      <main className="csv-nps-page">
        <section className="csv-nps-hero">
          <p className="eyebrow">CSV NPS workspace</p>
          <h1>CSV NPS Responses</h1>
          <p>No CSV dataset has been analysed yet.</p>
          <nav className="csv-nps-workspace-nav" aria-label="CSV NPS workspace navigation">
            <a href="/csv-nps/upload">Upload</a>
            <a href="/csv-nps/performance">Performance</a>
            <a href="/csv-nps/responses">Responses</a>
            <a href="/csv-nps/closing-the-loop">Closing the loop</a>
          </nav>
        </section>

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
        <h1>CSV NPS Responses</h1>
        <p>
          Review the normalised customer feedback imported from your latest CSV
          dataset.
        </p>
      </section>

      <section className="csv-nps-results">
        <div className="csv-nps-responses-header">
          <div>
            <h2>Responses</h2>
            <p>
              Showing {filteredRows.length} of {dataset.rows.length} responses.
            </p>
          </div>

          <div className="csv-nps-next-actions csv-nps-next-actions-tight">
            <a className="csv-nps-secondary-link" href="/csv-nps/upload">
              Upload
            </a>
            <a className="csv-nps-secondary-link" href="/csv-nps/performance">
              Performance
            </a>
            <a
              className="csv-nps-secondary-link"
              href="/csv-nps/closing-the-loop"
            >
              Closing the loop
            </a>
          </div>
        </div>

        <div className="csv-nps-filters">
          <label className="csv-nps-filter-field">
            <span>Search responses</span>
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search customer, email, comment..."
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
              </tr>
            </thead>

            <tbody>
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan="6">No responses match the current filters.</td>
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
