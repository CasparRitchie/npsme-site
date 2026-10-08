// src/pages/CsvNpsUpload.jsx
import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import CsvNpsWorkspaceNav from "../components/CsvNpsWorkspaceNav";
import { useLanguage } from "../i18n/LanguageContext";
import { localizePath } from "../i18n/pathHelpers";
import { workspaceFetch } from "../../utils/workspaceApi";

export default function CsvNpsUpload() {
  const { lang } = useLanguage();
  const tr = (en, fr) => (lang === "fr" ? fr : en);
  const lp = (path) => localizePath(path, lang);
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
      setError(err.message || tr("Something went wrong", "Une erreur s’est produite"));
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
      setSaveError(err.message || tr("Something went wrong while saving", "Une erreur s’est produite lors de l’enregistrement"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="csv-nps-page">
      <section className="csv-nps-hero">
        <p className="eyebrow">NPS Me Workspace</p>
        <h1>{tr("Import feedback data", "Importer des données de feedback")}</h1>
        <p>
          {tr(
            "Paste CSV data or JSON survey exports below. NPS Me will detect the score, date, customer, email and comment fields where possible, then turn them into a reusable NPS dataset.",
            "Collez ci-dessous des données CSV ou des exports JSON de questionnaire. NPS Me détectera si possible les champs de note, date, client, e-mail et commentaire, puis les transformera en un dataset NPS réutilisable."
          )}
        </p>
      </section>

      <CsvNpsWorkspaceNav />
      <section className="csv-nps-warning-panel">
        <h2>{tr("Data protection reminder", "Rappel sur la protection des données")}</h2>
        <p>
          {tr(
            "Only upload customer feedback data that you are authorised to process. Avoid importing unnecessary sensitive data. Names and email addresses are useful for follow-up, but anonymised IDs may be enough for some analysis.",
            "Importez uniquement des données de feedback client que vous êtes autorisé à traiter. Évitez les données sensibles inutiles. Les noms et adresses e-mail sont utiles pour le suivi, mais des identifiants anonymisés peuvent suffire pour certaines analyses."
          )}
        </p>

        <div className="csv-nps-next-actions">
          <a
            className="csv-nps-secondary-link"
            href="/samples/nps-feedback-template.csv"
            download
          >
            {tr("Download sample CSV template", "Télécharger le modèle CSV")}
          </a>
        </div>
      </section>

      <section className="csv-nps-panel">
        <label className="csv-nps-label" htmlFor="csv-nps-textarea">
          {tr("Paste survey data", "Coller les données du questionnaire")}
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
            {loading ? tr("Analysing...", "Analyse en cours...") : tr("Analyse feedback", "Analyser le feedback")}
          </button>
        </div>
      </section>

      {error && <div className="csv-nps-error">{error}</div>}

      {result?.warnings?.length > 0 && (
        <section className="csv-nps-warning-panel">
          <h2>{tr("Import warnings", "Avertissements d’import")}</h2>
          <p>{tr("NPS Me analysed the data, but there are a few things to check.", "NPS Me a analysé les données, mais certains éléments sont à vérifier.")}</p>

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
              <h2>{tr("Import summary", "Résumé de l’import")}</h2>
              <p>
                {tr("Detected", "Format détecté :")}{" "}
                <strong>{(result.inputType || "csv").toUpperCase()}</strong>{" "}
                {tr(
                  `input with ${result.validRowCount} valid NPS response${result.validRowCount === 1 ? "" : "s"}.`,
                  `avec ${result.validRowCount} réponse${result.validRowCount === 1 ? "" : "s"} NPS valide${result.validRowCount === 1 ? "" : "s"}.`
                )}
              </p>
            </div>
          </div>

          <div className="csv-nps-metric-grid">
            <MetricCard label={tr("Responses", "Réponses")} value={result.summary.total} />
            <MetricCard label="NPS" value={result.summary.nps} />
            <MetricCard label={tr("Promoters", "Promoteurs")} value={result.summary.promoters} />
            <MetricCard label={tr("Passives", "Passifs")} value={result.summary.passives} />
            <MetricCard label={tr("Detractors", "Détracteurs")} value={result.summary.detractors} />
            <MetricCard label={tr("Avg. score", "Note moyenne")} value={result.summary.averageScore} />
          </div>

          <section className="csv-nps-save-panel">
            <div>
              <h3>{tr("Save as dataset", "Enregistrer comme dataset")}</h3>
              <p>
                {tr(
                  "Save this import so it can be reopened later and used for performance dashboards, response analysis, and close-the-loop actions.",
                  "Enregistrez cet import pour pouvoir le rouvrir et l’utiliser dans les tableaux de bord, l’analyse des réponses et les actions de suivi."
                )}
              </p>
            </div>

            <label className="csv-nps-filter-field">
              <span>{tr("Dataset name", "Nom du dataset")}</span>
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
                {saving ? tr("Saving...", "Enregistrement...") : tr("Save dataset", "Enregistrer le dataset")}
              </button>
            </div>

            {saveError && <div className="csv-nps-error">{saveError}</div>}

            {savedDataset && (
              <div className="csv-nps-success csv-nps-save-success">
                <div>
                  <strong>{tr("Dataset saved.", "Dataset enregistré.")}</strong>
                  <span>
                    {" "}
                    ID: <code>{savedDataset.id}</code>
                  </span>
                </div>

                <div className="csv-nps-dataset-actions">
                  <Link
                    className="csv-nps-secondary-link"
                    to={lp(`/workspace/datasets/${savedDataset.id}/performance`)}
                  >
                    {tr("Open performance", "Ouvrir Performance")}
                  </Link>

                  <Link
                    className="csv-nps-secondary-link"
                    to={lp(`/workspace/datasets/${savedDataset.id}/responses`)}
                  >
                    {tr("View responses", "Voir les réponses")}
                  </Link>

                  <Link
                    className="csv-nps-secondary-link"
                    to={lp(`/workspace/datasets/${savedDataset.id}/closing-the-loop`)}
                  >
                    {tr("Open close-the-loop", "Ouvrir le suivi client")}
                  </Link>

                  <Link className="csv-nps-secondary-link" to={lp("/workspace/datasets")}>
                    {tr("View all datasets", "Voir tous les datasets")}
                  </Link>
                </div>
              </div>
            )}
          </section>

          <h3>{tr("Detected fields", "Champs détectés")}</h3>

          <pre className="csv-nps-code">
            {JSON.stringify(result.detectedFields, null, 2)}
          </pre>

          <h3>{tr("Normalised responses", "Réponses normalisées")}</h3>
          <div className="csv-nps-table-wrap">
            <table className="csv-nps-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>{tr("Customer", "Client")}</th>
                  <th>Email</th>
                  <th>{tr("Score", "Note")}</th>
                  <th>{tr("Bucket", "Segment")}</th>
                  <th>{tr("Comment", "Commentaire")}</th>
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
