// src/pages/CsvNpsUpload.jsx
import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import CsvNpsWorkspaceNav from "../components/CsvNpsWorkspaceNav";
import { workspaceFetch } from "../../utils/workspaceApi";

export default function CsvNpsUpload() {
  const [csvText, setCsvText] = useState(
    "name,email,score,comment,date\nAlice,alice@example.com,10,Great service,2026-05-01\nBob,bob@example.com,6,Too slow,2026-05-02\nClaire,claire@example.com,8,Pretty good,2026-05-03"
  );

  const [result, setResult] = useState(null);
  const [datasetName, setDatasetName] = useState("");
  const [savedDataset, setSavedDataset] = useState(null);

  const [error, setError] = useState("");
  const [saveError, setSaveError] = useState("");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const suggestedDatasetName = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);

    if (result?.content_id) {
      return `NPS import ${result.content_id} - ${today}`;
    }

    if (result?.inputType) {
      return `${result.inputType.toUpperCase()} NPS import - ${today}`;
    }

    return `NPS import - ${today}`;
  }, [result]);

  async function handleParseCsv() {
    setLoading(true);
    setError("");
    setSaveError("");
    setResult(null);
    setSavedDataset(null);
    try {
      const res = await fetch("/api/csv-nps/parse", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ csvText }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to parse data");
      }

      setResult(data);
      setDatasetName((current) => current || suggestedNameFromResult(data));

      // Keep current browser-session behaviour working for now.
      // We will move the other pages to datasetId-based loading next.
      sessionStorage.setItem("csvNpsLatestDataset", JSON.stringify(data));
    } catch (err) {
      console.error("CSV/JSON parse failed:", err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveDataset() {
    if (!result) return;

    const finalDatasetName = datasetName.trim() || suggestedDatasetName;

    setSaving(true);
    setSaveError("");
    setSavedDataset(null);

    try {
      const data = await workspaceFetch("/api/nps-data/datasets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          datasetName: finalDatasetName,
          parsedDataset: result,
        }),
      });

      setSavedDataset(data.dataset);

      // Helpful for the next phase: remember the last saved dataset ID.
      sessionStorage.setItem("csvNpsLatestSavedDatasetId", data.dataset.id);
    } catch (err) {
      console.error("Dataset save failed:", err);
      setSaveError(err.message || "Something went wrong while saving");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="csv-nps-page">
      <section className="csv-nps-hero">
        <p className="eyebrow">NPS Me Workspace</p>
        <h1>Import feedback data</h1>
        <p>
          Paste CSV data or JSON survey exports below. NPS Me will detect the
          score, date, customer, email and comment fields where possible, then
          turn them into a reusable NPS dataset.
        </p>
      </section>

      <CsvNpsWorkspaceNav />
      <section className="csv-nps-warning-panel">
        <h2>Data protection reminder</h2>
        <p>
          Only upload customer feedback data that you are authorised to process.
          Avoid importing unnecessary sensitive data. Names and email addresses are
          useful for follow-up, but anonymised IDs may be enough for some analysis.
        </p>
      </section>

      <section className="csv-nps-panel">
        <label className="csv-nps-label" htmlFor="csv-nps-textarea">
          Paste survey data
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
            {loading ? "Analysing..." : "Analyse feedback"}
          </button>
        </div>
      </section>

      {error && <div className="csv-nps-error">{error}</div>}

      {result?.warnings?.length > 0 && (
        <section className="csv-nps-warning-panel">
          <h2>Import warnings</h2>
          <p>NPS Me analysed the data, but there are a few things to check.</p>

          <ul>
            {result.warnings.map((warning, index) => (
              <li key={`${warning.type}-${index}`}>{warning.message}</li>
            ))}
          </ul>
        </section>
      )}

      {result && (
        <section className="csv-nps-results">
          <div className="csv-nps-responses-header">
            <div>
              <h2>Import summary</h2>
              <p>
                Detected{" "}
                <strong>{(result.inputType || "csv").toUpperCase()}</strong>{" "}
                input with {result.validRowCount} valid NPS response
                {result.validRowCount === 1 ? "" : "s"}.
              </p>
            </div>
          </div>

          <div className="csv-nps-metric-grid">
            <MetricCard label="Responses" value={result.summary.total} />
            <MetricCard label="NPS" value={result.summary.nps} />
            <MetricCard label="Promoters" value={result.summary.promoters} />
            <MetricCard label="Passives" value={result.summary.passives} />
            <MetricCard label="Detractors" value={result.summary.detractors} />
            <MetricCard label="Avg. score" value={result.summary.averageScore} />
          </div>

          <section className="csv-nps-save-panel">
            <div>
              <h3>Save as dataset</h3>
              <p>
                Save this import so it can be reopened later and used for
                performance dashboards, response analysis, and close-the-loop actions.
              </p>
            </div>

            <label className="csv-nps-filter-field">
              <span>Dataset name</span>
              <input
                type="text"
                value={datasetName}
                onChange={(e) => setDatasetName(e.target.value)}
                placeholder={suggestedDatasetName}
              />
            </label>

            <div className="csv-nps-actions">
              <button
                type="button"
                className="csv-nps-button"
                onClick={handleSaveDataset}
                disabled={saving || !result?.rows?.length}
              >
                {saving ? "Saving..." : "Save dataset"}
              </button>
            </div>

            {saveError && <div className="csv-nps-error">{saveError}</div>}

            {savedDataset && (
              <div className="csv-nps-success csv-nps-save-success">
                <div>
                  <strong>Dataset saved.</strong>
                  <span>
                    {" "}
                    ID: <code>{savedDataset.id}</code>
                  </span>
                </div>

                <div className="csv-nps-dataset-actions">
                  <Link
                    className="csv-nps-secondary-link"
                    to={`/workspace/datasets/${savedDataset.id}/performance`}
                  >
                    Open performance
                  </Link>

                  <Link
                    className="csv-nps-secondary-link"
                    to={`/workspace/datasets/${savedDataset.id}/responses`}
                  >
                    View responses
                  </Link>

                  <Link
                    className="csv-nps-secondary-link"
                    to={`/workspace/datasets/${savedDataset.id}/closing-the-loop`}
                  >
                    Open close-the-loop
                  </Link>

                  <Link className="csv-nps-secondary-link" to="/workspace/datasets">
                    View all datasets
                  </Link>
                </div>
              </div>
            )}
          </section>

          <h3>Detected fields</h3>

          <pre className="csv-nps-code">
            {JSON.stringify(result.detectedFields, null, 2)}
          </pre>

          <h3>Normalised responses</h3>
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

function suggestedNameFromResult(result) {
  const today = new Date().toISOString().slice(0, 10);

  if (result?.content_id) {
    return `NPS import ${result.content_id} - ${today}`;
  }

  if (result?.inputType) {
    return `${result.inputType.toUpperCase()} NPS import - ${today}`;
  }

  return `NPS import - ${today}`;
}
