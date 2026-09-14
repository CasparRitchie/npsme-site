// src/pages/WorkspaceHome.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CsvNpsWorkspaceNav from "../components/CsvNpsWorkspaceNav";
import { workspaceFetch } from "../../utils/workspaceApi";
import { useLanguage } from "../i18n/LanguageContext";
import { localizePath } from "../i18n/pathHelpers";



export default function WorkspaceHome() {
  const { lang } = useLanguage();
  const copy = WORKSPACE_HOME_COPY[lang] || WORKSPACE_HOME_COPY.en;
  const lp = (path) => localizePath(path, lang);
  const [datasets, setDatasets] = useState([]);
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadWorkspaceHome() {
      setLoading(true);
      setError("");

      try {
        const [workspaceData, datasetsData] = await Promise.all([
          workspaceFetch("/api/nps-data/workspace"),
          workspaceFetch("/api/nps-data/datasets"),
        ]);

        setWorkspace(workspaceData.workspace || null);
        setDatasets(datasetsData.datasets || []);
      } catch (err) {
        console.error("Failed to load workspace home:", err);
        setError(err.message || (lang === "fr" ? "Impossible de charger l’espace de travail" : "Failed to load workspace"));
      } finally {
        setLoading(false);
      }
    }

    loadWorkspaceHome();
  }, []);

  const latestDatasets = datasets.slice(0, 3);
  const hasDatasets = datasets.length > 0;

  const totals = datasets.reduce(
    (acc, dataset) => {
      const summary = dataset.summary_json || {};

      acc.datasets += 1;
      acc.responses += Number(summary.total ?? dataset.valid_row_count ?? 0);
      acc.promoters += Number(summary.promoters ?? 0);
      acc.passives += Number(summary.passives ?? 0);
      acc.detractors += Number(summary.detractors ?? 0);

      return acc;
    },
    {
      datasets: 0,
      responses: 0,
      promoters: 0,
      passives: 0,
      detractors: 0,
    }
  );

  const overallNps =
    totals.responses > 0
      ? Math.round(
          ((totals.promoters - totals.detractors) / totals.responses) * 100
        )
      : null;

  return (
    <main className="csv-nps-page">
      <section className="csv-nps-hero csv-nps-hero-compact">
        <p className="eyebrow">{copy.eyebrow}</p>
        <h1>{copy.title}</h1>
        <p>{copy.intro}</p>
      </section>

      <CsvNpsWorkspaceNav />

      {error && <section className="csv-nps-error">{error}</section>}
      {!loading && !hasDatasets && (
        <section className="csv-nps-first-run-panel">
          <div>
            <span className="csv-nps-source-badge">{copy.newWorkspace}</span>
            <h2>{copy.firstTitle}</h2>
            <p>{copy.firstBody}</p>
          </div>

          <div className="csv-nps-next-actions csv-nps-next-actions-tight">
            <Link className="csv-nps-button-link" to={lp("/workspace/import")}>
              {copy.importFirst}
            </Link>

            <Link className="csv-nps-secondary-link" to={lp("/workspace/account")}>
              {copy.checkAccount}
            </Link>
          </div>
        </section>
      )}

      <section className="csv-nps-workspace-overview-grid">
        <WorkspaceActionCard
          title={copy.actions.importTitle}
          description={copy.actions.importBody}
          to={lp("/workspace/import")}
          cta={hasDatasets ? copy.actions.importMore : copy.importFirst}
          badge={hasDatasets ? copy.workspace : copy.actions.startHere}
        />

        <WorkspaceActionCard
          title={copy.actions.reviewTitle}
          description={copy.actions.reviewBody}
          to={lp("/workspace/datasets")}
          cta={hasDatasets ? copy.actions.viewDatasets : copy.actions.noDatasets}
          badge={hasDatasets ? copy.workspace : copy.actions.waiting}
          muted={!hasDatasets}
        />

        <WorkspaceActionCard
          title={copy.actions.closeTitle}
          description={copy.actions.closeBody}
          to={
            latestDatasets[0]
              ? lp(`/workspace/datasets/${latestDatasets[0].id}/closing-the-loop`)
              : lp("/workspace/import")
          }
          cta={hasDatasets ? copy.actions.openQueue : copy.actions.importFirst}
          badge={hasDatasets ? copy.workspace : copy.actions.nextStep}
          muted={!hasDatasets}
        />
      </section>

      <section className="csv-nps-results">
        <div className="csv-nps-responses-header">
          <div>
            <h2>
              {workspace?.workspace_name
                ? workspace.workspace_name
                : copy.overviewTitle}
            </h2>
            <p>
              {loading
                ? copy.loading
                : copy.overviewBody}
            </p>
          </div>

          <Link className="csv-nps-button-link" to={lp("/workspace/import")}>
            {copy.importData}
          </Link>
        </div>

        <div className="csv-nps-metric-grid">
          <MetricCard label={copy.metrics.datasets} value={totals.datasets} />
          <MetricCard label={copy.metrics.responses} value={totals.responses} />
          <MetricCard label={copy.metrics.nps} value={overallNps} />
          <MetricCard label={copy.metrics.promoters} value={totals.promoters} />
          <MetricCard label={copy.metrics.passives} value={totals.passives} />
          <MetricCard label={copy.metrics.detractors} value={totals.detractors} />
        </div>

        <div className="csv-nps-workspace-home-grid">
          <section className="csv-nps-chart-card">
            <h3>{copy.recentTitle}</h3>
            <p>{copy.recentBody}</p>

            {loading ? (
              <div className="csv-nps-empty-state">
                {copy.loadingRecent}
              </div>
            ) : latestDatasets.length === 0 ? (
              <FirstRunChecklist copy={copy} lp={lp} />
            ) : (
              <div className="csv-nps-dataset-grid">
                {latestDatasets.map((dataset) => (
                  <RecentDatasetCard key={dataset.id} dataset={dataset} copy={copy} lp={lp} />
                ))}
              </div>
            )}

            <div className="csv-nps-next-actions">
              <Link className="csv-nps-secondary-link" to={lp("/workspace/datasets")}>
                {copy.viewAll}
              </Link>
            </div>
          </section>

          <section className="csv-nps-chart-card">
            <h3>{copy.setupTitle}</h3>
            <p>{copy.setupBody}</p>

            <div className="csv-nps-workspace-status-list">
              <StatusRow
                label={copy.workspace}
                value={workspace?.workspace_name || "NPS Me Internal"}
              />
              <StatusRow label={copy.dataSource} value="CSV / JSON" />
              <StatusRow label={copy.storage} value="Supabase" />
              <StatusRow label={copy.access} value={copy.individualLogin} />
              <StatusRow label={copy.productStage} value={copy.privateWorkspace} />
            </div>

            <div className="csv-nps-next-actions">
              <Link className="csv-nps-secondary-link" to={lp("/workspace/import")}>
                {copy.importNew}
              </Link>

              <Link className="csv-nps-secondary-link" to={lp("/workspace/datasets")}>
                {copy.manageDatasets}
              </Link>
            </div>
          </section>

          <section className="csv-nps-chart-card csv-nps-chart-card-wide">
            <h3>{copy.privacyTitle}</h3>
            <p>{copy.privacyBody}</p>

            <div className="csv-nps-next-actions">
              <Link className="csv-nps-secondary-link" to={lp("/privacy")}>
                {copy.readPrivacy}
              </Link>

              <Link className="csv-nps-secondary-link" to={lp("/workspace/account")}>
                {copy.reviewAccount}
              </Link>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

function WorkspaceActionCard({
  title,
  description,
  to,
  cta,
  badge = "Workspace",
  muted = false,
}) {
  return (
    <Link
      className={`csv-nps-workspace-action-card${
        muted ? " csv-nps-workspace-action-card-muted" : ""
      }`}
      to={to}
    >
      <span className="csv-nps-source-badge">{badge}</span>
      <h2>{title}</h2>
      <p>{description}</p>
      <strong>{cta}</strong>
    </Link>
  );
}

function FirstRunChecklist({ copy, lp }) {
  return (
    <div className="csv-nps-first-run-checklist">
      <FirstRunStep
        number="1"
        title={copy.checklist.importTitle}
        description={copy.checklist.importBody}
        to={lp("/workspace/import")}
        cta={copy.checklist.importCta}
      />

      <FirstRunStep
        number="2"
        title={copy.checklist.reviewTitle}
        description={copy.checklist.reviewBody}
      />

      <FirstRunStep
        number="3"
        title={copy.checklist.actTitle}
        description={copy.checklist.actBody}
      />
    </div>
  );
}

function FirstRunStep({ number, title, description, to, cta }) {
  return (
    <article className="csv-nps-first-run-step">
      <span>{number}</span>
      <div>
        <h4>{title}</h4>
        <p>{description}</p>
        {to && cta && (
          <Link className="csv-nps-secondary-link" to={to}>
            {cta}
          </Link>
        )}
      </div>
    </article>
  );
}

function RecentDatasetCard({ dataset, copy, lp }) {
  const summary = dataset.summary_json || {};
  const createdAt = dataset.created_at
    ? new Date(dataset.created_at).toLocaleString()
    : copy.unknownDate;

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
      </div>

      <div className="csv-nps-dataset-metrics">
        <MiniMetric
          label={copy.metrics.responses}
          value={summary.total ?? dataset.valid_row_count}
        />
        <MiniMetric label="NPS" value={summary.nps} />
        <MiniMetric label={copy.metrics.promoters} value={summary.promoters} />
      </div>

      <div className="csv-nps-dataset-actions">
        <Link
          className="csv-nps-secondary-link"
          to={lp(`/workspace/datasets/${dataset.id}/performance`)}
        >
          {copy.metrics.performance}
        </Link>

        <Link
          className="csv-nps-secondary-link"
          to={lp(`/workspace/datasets/${dataset.id}/responses`)}
        >
          {copy.metrics.responses}
        </Link>

        <Link
          className="csv-nps-secondary-link"
          to={lp(`/workspace/datasets/${dataset.id}/closing-the-loop`)}
        >
          {copy.actions.closeTitle}
        </Link>
      </div>
    </article>
  );
}

function StatusRow({ label, value }) {
  return (
    <div className="csv-nps-workspace-status-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

const WORKSPACE_HOME_COPY = {
  en: {
    eyebrow: "NPS Me Workspace", title: "Feedback command centre", intro: "Import customer feedback, review NPS performance, inspect individual responses, and manage close-the-loop follow-up from one protected workspace.",
    workspace: "Workspace", newWorkspace: "New workspace", firstTitle: "Start by importing your first feedback dataset", firstBody: "Your workspace is ready. Add a CSV or JSON export to create your first saved dataset, then NPS Me will unlock performance views, response search, AI insights and close-the-loop tracking.", importFirst: "Import first dataset", checkAccount: "Check account setup", overviewTitle: "Workspace overview", loading: "Loading workspace...", overviewBody: "A quick view of your saved datasets and NPS activity.", importData: "Import data", recentTitle: "Recent datasets", recentBody: "Reopen performance, responses, or close-the-loop views from your latest saved imports.", loadingRecent: "Loading recent datasets...", viewAll: "View all datasets", setupTitle: "Current setup", setupBody: "This private workspace is configured for imported feedback datasets, Supabase storage, and persistent follow-up actions.", dataSource: "Data source", storage: "Storage", access: "Access", individualLogin: "Individual workspace login", productStage: "Product stage", privateWorkspace: "Private workspace", importNew: "Import new data", manageDatasets: "Manage datasets", privacyTitle: "Data protection reminder", privacyBody: "This workspace may contain customer names, email addresses, survey comments, NPS scores and follow-up notes. Only upload feedback data that you are authorised to process, and avoid importing unnecessary sensitive data.", readPrivacy: "Read privacy policy", reviewAccount: "Review account access", unknownDate: "Unknown date",
    metrics: { datasets: "Datasets", responses: "Responses", nps: "Overall NPS", promoters: "Promoters", passives: "Passives", detractors: "Detractors", performance: "Performance" },
    actions: { importTitle: "Import feedback data", importBody: "Paste CSV data or JSON survey exports and turn them into a reusable NPS dataset.", importMore: "Import more data", startHere: "Start here", reviewTitle: "Review saved datasets", reviewBody: "Reopen previous imports, review NPS performance, and inspect customer responses.", viewDatasets: "View datasets", noDatasets: "No datasets yet", waiting: "Waiting for data", closeTitle: "Close the loop", closeBody: "Prioritise detractors, assign owners, track next steps, and keep follow-up visible.", openQueue: "Open action queue", importFirst: "Import data first", nextStep: "Next step" },
    checklist: { importTitle: "Import feedback", importBody: "Paste or upload a CSV/JSON export containing customer names, scores, dates and comments.", importCta: "Go to import", reviewTitle: "Review performance", reviewBody: "Once saved, NPS Me creates performance, response and close-the-loop views for that dataset.", actTitle: "Act on feedback", actBody: "Use the close-the-loop queue to assign follow-up, record actions and keep customer issues visible." },
  },
  fr: {
    eyebrow: "Espace de travail NPS Me", title: "Centre de pilotage du feedback", intro: "Importez les retours clients, analysez la performance NPS, consultez les réponses et gérez les suivis depuis un espace sécurisé.",
    workspace: "Espace de travail", newWorkspace: "Nouvel espace", firstTitle: "Commencez par importer votre premier dataset", firstBody: "Votre espace est prêt. Ajoutez un export CSV ou JSON pour créer votre premier dataset, puis accéder aux vues de performance, à la recherche de réponses, aux analyses IA et au suivi client.", importFirst: "Importer le premier dataset", checkAccount: "Vérifier le compte", overviewTitle: "Vue d’ensemble", loading: "Chargement de l’espace...", overviewBody: "Un aperçu de vos datasets enregistrés et de votre activité NPS.", importData: "Importer des données", recentTitle: "Datasets récents", recentBody: "Rouvrez les vues de performance, de réponses ou de suivi depuis vos derniers imports.", loadingRecent: "Chargement des datasets récents...", viewAll: "Voir tous les datasets", setupTitle: "Configuration actuelle", setupBody: "Cet espace privé utilise des datasets de feedback importés, le stockage Supabase et des actions de suivi persistantes.", dataSource: "Source de données", storage: "Stockage", access: "Accès", individualLogin: "Connexion individuelle", productStage: "Environnement", privateWorkspace: "Espace privé", importNew: "Importer de nouvelles données", manageDatasets: "Gérer les datasets", privacyTitle: "Rappel sur la protection des données", privacyBody: "Cet espace peut contenir des noms et adresses email de clients, des commentaires, des notes NPS et des notes de suivi. Importez uniquement les données que vous êtes autorisé à traiter et évitez les données sensibles inutiles.", readPrivacy: "Lire la politique de confidentialité", reviewAccount: "Vérifier les accès", unknownDate: "Date inconnue",
    metrics: { datasets: "Datasets", responses: "Réponses", nps: "NPS global", promoters: "Promoteurs", passives: "Passifs", detractors: "Détracteurs", performance: "Performance" },
    actions: { importTitle: "Importer du feedback", importBody: "Collez des données CSV ou des exports JSON pour créer un dataset NPS réutilisable.", importMore: "Importer d’autres données", startHere: "Commencer ici", reviewTitle: "Consulter les datasets", reviewBody: "Rouvrez les imports précédents, analysez la performance NPS et consultez les réponses clients.", viewDatasets: "Voir les datasets", noDatasets: "Aucun dataset", waiting: "En attente de données", closeTitle: "Suivi client", closeBody: "Priorisez les détracteurs, attribuez les responsables et gardez les prochaines étapes visibles.", openQueue: "Ouvrir la file de suivi", importFirst: "Importer d’abord des données", nextStep: "Étape suivante" },
    checklist: { importTitle: "Importer du feedback", importBody: "Collez ou importez un export CSV/JSON contenant les noms, notes, dates et commentaires clients.", importCta: "Accéder à l’import", reviewTitle: "Analyser la performance", reviewBody: "Une fois enregistré, NPS Me crée les vues de performance, de réponses et de suivi du dataset.", actTitle: "Agir sur le feedback", actBody: "Utilisez la file de suivi pour attribuer les relances, consigner les actions et garder les problèmes visibles." },
  },
};

function MetricCard({ label, value }) {
  return (
    <div className="csv-nps-metric-card">
      <div className="csv-nps-metric-label">{label}</div>
      <div className="csv-nps-metric-value">{value ?? "—"}</div>
    </div>
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
