// src/pages/NpsDatasets.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext";
import { localizePath } from "../i18n/pathHelpers";
import CsvNpsWorkspaceNav from "../components/CsvNpsWorkspaceNav";
import { workspaceFetch } from "../../utils/workspaceApi";
import {
  canDeleteDatasets,
  formatWorkspaceRole,
} from "../../utils/workspaceRoles";

export default function NpsDatasets() {
  const { lang } = useLanguage();
  const tr = (en, fr) => (lang === "fr" ? fr : en);
  const lp = (path) => localizePath(path, lang);
  const [datasets, setDatasets] = useState([]);
  const [workspaceRole, setWorkspaceRole] = useState("");
  const [activeIntercomSource, setActiveIntercomSource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const userCanDeleteDatasets = canDeleteDatasets(workspaceRole);

  /*
   * workspace_intercom rows are persisted implementation records used by
   * response-level actions, close-the-loop state and reply drafts.
   *
   * They should not appear as separate user-facing saved datasets because
   * the active Intercom source already has its own Live source card above.
   */
  const visibleSavedDatasets = useMemo(() => {
    return (Array.isArray(datasets) ? datasets : []).filter(
      (dataset) => dataset.source_type !== "workspace_intercom"
    );
  }, [datasets]);

  const hiddenIntercomMirrorCount = useMemo(() => {
    return (Array.isArray(datasets) ? datasets : []).filter(
      (dataset) => dataset.source_type === "workspace_intercom"
    ).length;
  }, [datasets]);

  async function loadDatasets() {
    setLoading(true);
    setError("");

    try {
      const [meData, datasetsData, activeSourceData] = await Promise.all([
        workspaceFetch("/api/workspace-auth/me"),
        workspaceFetch("/api/nps-data/datasets"),
        workspaceFetch("/api/workspace-intercom/sources/active").catch((err) => {
          if (
            String(err?.message || "")
              .toLowerCase()
              .includes("no active intercom source")
          ) {
            return { ok: false, source: null };
          }

          throw err;
        }),
      ]);

      setWorkspaceRole(meData?.workspace?.role || "");
      setDatasets(datasetsData?.datasets || []);
      setActiveIntercomSource(
        activeSourceData?.ok && activeSourceData?.source
          ? activeSourceData.source
          : null
      );
    } catch (err) {
      console.error("Failed to load NPS datasets:", err);
      setError(err.message || tr("Something went wrong", "Une erreur s’est produite"));
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(datasetId) {
    if (!userCanDeleteDatasets) {
      setError(tr("You do not have permission to delete datasets.", "Vous n’avez pas l’autorisation de supprimer des datasets."));
      return;
    }

    const confirmed = window.confirm(
      tr("Delete this dataset? This will also delete its saved rows and close-the-loop actions. This cannot be undone.", "Supprimer ce dataset ? Ses lignes et actions de suivi seront également supprimées. Cette action est irréversible.")
    );

    if (!confirmed) return;

    try {
      const data = await workspaceFetch(`/api/nps-data/datasets/${datasetId}`, {
        method: "DELETE",
      });

      if (!data.ok) {
        throw new Error(data.error || "Failed to delete dataset");
      }

      setDatasets((current) =>
        current.filter((dataset) => dataset.id !== datasetId)
      );
    } catch (err) {
      console.error("Failed to delete dataset:", err);
      setError(err.message || "Failed to delete dataset");
    }
  }

  useEffect(() => {
    loadDatasets();
  }, []);

  return (
    <main className="csv-nps-page">
      <section className="csv-nps-hero">
        <p className="eyebrow">NPS Me Workspace</p>
        <h1>{tr("Datasets and sources", "Datasets et sources")}</h1>
        <p>
          {tr("Switch between live connected feedback sources and saved imported datasets. Open performance, responses, or close-the-loop views for the data context you want to work on.", "Passez des sources de feedback connectées aux datasets importés. Ouvrez les vues de performance, de réponses ou de suivi correspondant aux données à analyser.")}
        </p>
      </section>

      <CsvNpsWorkspaceNav />

      <section className="csv-nps-results">
        <div className="csv-nps-responses-header">
          <div>
            <h2>{tr("Feedback data contexts", "Sources de feedback")}</h2>
            <p>
              {loading
                ? tr("Loading saved datasets and connected sources...", "Chargement des datasets et sources connectées...")
                : `${visibleSavedDatasets.length} saved dataset${
                    visibleSavedDatasets.length === 1 ? "" : "s"
                  }${
                    activeIntercomSource ? " and 1 live Intercom source" : ""
                  } available.`}
            </p>

            {!loading && workspaceRole && (
              <p className="csv-nps-muted-note">
                Signed in as {formatWorkspaceRole(workspaceRole)}.
                {!userCanDeleteDatasets &&
                  " Dataset deletion is restricted to workspace owners and admins."}
              </p>
            )}

            {!loading && hiddenIntercomMirrorCount > 0 && (
              <p className="csv-nps-muted-note">
                {hiddenIntercomMirrorCount} Intercom backing dataset
                {hiddenIntercomMirrorCount === 1 ? " is" : "s are"} hidden
                from this list because the live Intercom source is shown above.
              </p>
            )}
          </div>

          <Link className="csv-nps-button-link" to={lp("/workspace/import")}>
            {tr("Import new data", "Importer des données")}
          </Link>
        </div>

        {error && <div className="csv-nps-error">{error}</div>}

        {!loading && activeIntercomSource && (
          <section className="csv-nps-datasets-section">
            <div className="csv-nps-section-heading">
              <h3>{tr("Live source", "Source en direct")}</h3>
              <p>
                {tr("Connected feedback that can be reopened directly without needing a saved dataset.", "Feedback connecté accessible directement, sans dataset enregistré.")}
              </p>
            </div>

            <div className="csv-nps-dataset-grid">
              <LiveSourceCard source={activeIntercomSource} lang={lang} tr={tr} lp={lp} />
            </div>
          </section>
        )}

        {!loading && !activeIntercomSource && (
          <section className="csv-nps-datasets-section">
            <div className="csv-nps-section-heading">
              <h3>{tr("Live source", "Source en direct")}</h3>
              <p>{tr("No active Intercom source is configured for this workspace yet.", "Aucune source Intercom active n’est encore configurée pour cet espace.")}</p>
            </div>
          </section>
        )}

        <section className="csv-nps-datasets-section">
          <div className="csv-nps-section-heading">
            <h3>{tr("Saved datasets", "Datasets enregistrés")}</h3>
            <p>
              {tr("Imported and saved datasets that can be reopened later for further review and follow-up.", "Datasets importés et enregistrés, à rouvrir pour l’analyse et le suivi.")}
            </p>
          </div>

          {!loading && visibleSavedDatasets.length === 0 && !error && (
            <div className="csv-nps-empty-state">
              {tr("No saved imported datasets yet. The live Intercom source is available above.", "Aucun dataset importé enregistré. La source Intercom en direct est disponible ci-dessus.")}
            </div>
          )}

          {visibleSavedDatasets.length > 0 && (
            <div className="csv-nps-dataset-grid">
              {visibleSavedDatasets.map((dataset) => (
                <DatasetCard
                  key={dataset.id}
                  dataset={dataset}
                  canDelete={userCanDeleteDatasets}
                  onDelete={() => handleDelete(dataset.id)}
                  lang={lang}
                  tr={tr}
                  lp={lp}
                />
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

function LiveSourceCard({ source, lang, tr, lp }) {
  const updatedAt = source?.updated_at
    ? new Date(source.updated_at).toLocaleString()
    : tr("Unknown date", "Date inconnue");

  return (
    <article className="csv-nps-dataset-card csv-nps-dataset-card-live">
      <div className="csv-nps-dataset-card-header">
        <div>
          <span className="csv-nps-source-badge csv-nps-source-badge-live">
            LIVE
          </span>
          <h3>{source.source_name || tr("Intercom source", "Source Intercom")}</h3>
          <p>{updatedAt}</p>
        </div>
      </div>

      <div className="csv-nps-dataset-meta">
        <span>{tr("Source slug", "Identifiant de source")}: {source.source_slug || "—"}</span>
        <span>{tr("Region", "Région")}: {(source.intercom_region || "us").toUpperCase()}</span>
        <span>{tr("Survey content ID", "Identifiant du questionnaire")}: {source.survey_content_id || "—"}</span>
      </div>

      {(source.survey_content_title || source.pii_mode) && (
        <div className="csv-nps-dataset-meta">
          {source.survey_content_title && (
            <span>{tr("Survey", "Questionnaire")}: {source.survey_content_title}</span>
          )}
          {source.pii_mode && <span>PII mode: {source.pii_mode}</span>}
        </div>
      )}

      <div className="csv-nps-dataset-actions">
        <Link className="csv-nps-secondary-link" to={lp("/workspace/performance")}>
          Performance
        </Link>

        <Link className="csv-nps-secondary-link" to={lp("/workspace/responses")}>
          {tr("Responses", "Réponses")}
        </Link>

        <Link className="csv-nps-secondary-link" to={lp("/workspace/closing-the-loop")}>
          {tr("Closing the loop", "Suivi client")}
        </Link>
      </div>
    </article>
  );
}

function DatasetCard({ dataset, canDelete, onDelete, lang, tr, lp }) {
  const summary = dataset.summary_json || {};
  const createdAt = dataset.created_at
    ? new Date(dataset.created_at).toLocaleString()
    : tr("Unknown date", "Date inconnue");

  return (
    <article className="csv-nps-dataset-card">
      <div className="csv-nps-dataset-card-header">
        <div>
          <span className="csv-nps-source-badge">
            {(dataset.source_type || "unknown").toUpperCase()}
          </span>
          <h3>{dataset.dataset_name}</h3>
          <p>{createdAt}</p>
        </div>

        {canDelete && (
          <button
            type="button"
            className="csv-nps-danger-button"
            onClick={onDelete}
          >
            {tr("Delete", "Supprimer")}
          </button>
        )}
      </div>

      {!canDelete && (
        <div className="csv-nps-empty-state csv-nps-empty-state-compact">
          {tr("Ask a workspace owner or admin if this dataset needs to be deleted.", "Demandez à un propriétaire ou administrateur de l’espace si ce dataset doit être supprimé.")}
        </div>
      )}

      <div className="csv-nps-dataset-metrics">
        <MiniMetric
          label={tr("Responses", "Réponses")}
          value={summary.total ?? dataset.valid_row_count}
        />
        <MiniMetric label="NPS" value={summary.nps} />
        <MiniMetric label={tr("Promoters", "Promoteurs")} value={summary.promoters} />
        <MiniMetric label={tr("Passives", "Passifs")} value={summary.passives} />
        <MiniMetric label={tr("Detractors", "Détracteurs")} value={summary.detractors} />
      </div>

      <div className="csv-nps-dataset-meta">
        <span>{tr("Raw rows", "Lignes brutes")}: {dataset.raw_row_count}</span>
        <span>{tr("Valid rows", "Lignes valides")}: {dataset.valid_row_count}</span>
        <span>{tr("Skipped", "Ignorées")}: {dataset.skipped_row_count}</span>
      </div>

      <div className="csv-nps-dataset-actions">
        <Link
          className="csv-nps-secondary-link"
          to={lp(`/workspace/datasets/${dataset.id}/performance`)}
        >
          Performance
        </Link>

        <Link
          className="csv-nps-secondary-link"
          to={lp(`/workspace/datasets/${dataset.id}/responses`)}
        >
          {tr("Responses", "Réponses")}
        </Link>

        <Link
          className="csv-nps-secondary-link"
          to={lp(`/workspace/datasets/${dataset.id}/closing-the-loop`)}
        >
          {tr("Closing the loop", "Suivi client")}
        </Link>
      </div>
    </article>
  );
}

function MiniMetric({ label, value }) {
  return (
    <div className="csv-nps-mini-metric">
      <span>{label}</span>
      <strong>{value ?? "—"}</strong>
    </div>
  );
}
