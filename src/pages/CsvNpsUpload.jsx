// src/pages/CsvNpsUpload.jsx
import React, { useState } from "react";

export default function CsvNpsUpload() {
  const [csvText, setCsvText] = useState(
    "name,email,score,comment,date\nAlice,alice@example.com,10,Great service,2026-05-01\nBob,bob@example.com,6,Too slow,2026-05-02\nClaire,claire@example.com,8,Pretty good,2026-05-03"
  );

  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleParseCsv() {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/csv-nps/parse", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ csvText }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to parse CSV");
      }

      setResult(data);
      sessionStorage.setItem("csvNpsLatestDataset", JSON.stringify(data));
    } catch (err) {
      console.error("CSV parse failed:", err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="csv-nps-page">
      <section className="csv-nps-hero">
        <p className="eyebrow">CSV NPS workspace</p>
        <h1>CSV NPS Upload</h1>
        <p>
          Paste survey response data below. NPS Me will detect the score, date,
          customer, email and comment columns where possible.
        </p>
        <nav className="csv-nps-workspace-nav" aria-label="CSV NPS workspace navigation">
          <a href="/csv-nps/upload">Upload</a>
          <a href="/csv-nps/performance">Performance</a>
          <a href="/csv-nps/responses">Responses</a>
          <a href="/csv-nps/closing-the-loop">Closing the loop</a>
        </nav>
      </section>

      <section className="csv-nps-panel">
        <label className="csv-nps-label" htmlFor="csv-nps-textarea">
          Paste CSV data
        </label>

        <textarea
          id="csv-nps-textarea"
          className="csv-nps-textarea"
          value={csvText}
          onChange={(e) => setCsvText(e.target.value)}
          rows={12}
        />

        <div className="csv-nps-actions">
          <button
            type="button"
            className="csv-nps-button"
            onClick={handleParseCsv}
            disabled={loading || !csvText.trim()}
          >
            {loading ? "Analysing..." : "Analyse CSV"}
          </button>
        </div>
      </section>

      {error && <div className="csv-nps-error">{error}</div>}
      {result?.warnings?.length > 0 && (
        <section className="csv-nps-warning-panel">
          <h2>CSV import warnings</h2>
          <p>
            NPS Me analysed the CSV, but there are a few things to check.
          </p>

          <ul>
            {result.warnings.map((warning) => (
              <li key={warning.type}>{warning.message}</li>
            ))}
          </ul>
        </section>
      )}

      {result && (
        <section className="csv-nps-results">
          <h2>Parsed summary</h2>

          <div className="csv-nps-metric-grid">
            <MetricCard label="Responses" value={result.summary.total} />
            <MetricCard label="NPS" value={result.summary.nps} />
            <MetricCard label="Promoters" value={result.summary.promoters} />
            <MetricCard label="Passives" value={result.summary.passives} />
            <MetricCard label="Detractors" value={result.summary.detractors} />
            <MetricCard label="Avg. score" value={result.summary.averageScore} />
          </div>

          <h3>Detected fields</h3>

          <pre className="csv-nps-code">
            {JSON.stringify(result.detectedFields, null, 2)}
          </pre>

          <h3>Normalised rows</h3>

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
                {result.rows.map((row) => (
                  <tr key={row.response_id}>
                    <td>{row.submitted_at?.slice(0, 10) || ""}</td>
                    <td>{row.customer_name}</td>
                    <td>{row.customer_email}</td>
                    <td>{row.score}</td>
                    <td>
                      <span className={`csv-nps-bucket csv-nps-bucket-${row.bucket}`}>
                        {row.bucket}
                      </span>
                    </td>
                    <td>{row.comment}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </main>
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
