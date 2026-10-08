import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import CsvNpsWorkspaceNav from "../components/CsvNpsWorkspaceNav";
import WorkspaceDatasetHeader from "../components/WorkspaceDatasetHeader";
import WorkspaceDateRangePicker from "../components/WorkspaceDateRangePicker";
import { useLanguage } from "../i18n/LanguageContext";
import { getDateRangeError } from "../utils/workspaceDateFilters";

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

function statusLabel(status, lang) {
  const labels = lang === "fr"
    ? { responded: "Réponse valide", completed_without_score: "Terminée sans note", delivered: "Livrée", opened: "Commencée / ouverte", bounced: "Rejetée", failed: "Échec", sent: "Envoyée" }
    : { responded: "Valid response", completed_without_score: "Completed without score", delivered: "Delivered", opened: "Started / opened", bounced: "Bounced", failed: "Failed", sent: "Sent" };
  return labels[status] || status || (lang === "fr" ? "Inconnu" : "Unknown");
}

function statusPillClass(status) {
  if (status === "responded") {
    return "border-emerald-400/30 bg-emerald-500/10 text-emerald-200";
  }

  if (status === "completed_without_score") {
    return "border-amber-400/30 bg-amber-500/10 text-amber-200";
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

function StatusPill({ status, lang }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-1 text-xs font-medium ${statusPillClass(
        status
      )}`}
    >
      {statusLabel(status, lang)}
    </span>
  );
}

export default function CsvNpsInvitations() {
  const { lang } = useLanguage();
  const tr = (en, fr) => (lang === "fr" ? fr : en);
  const { datasetId } = useParams();

  const [dataset, setDataset] = useState(null);
  const [loadingDataset, setLoadingDataset] = useState(Boolean(datasetId));
  const [datasetError, setDatasetError] = useState("");
  const [mode, setMode] = useState(datasetId ? "saved" : "intercom");

  const [periodFilter, setPeriodFilter] = useState("365d");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
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

      const rangeError = getDateRangeError({
        period: periodFilter,
        from: dateFrom,
        to: dateTo,
      });

      if (rangeError) {
        setInvites({ loading: false, data: null, error: null });
        return;
      }

      try {
        const qs = new URLSearchParams({ status: String(statusFilter || "all") });

        if (periodFilter === "custom") {
          qs.set("from", dateFrom);
          qs.set("to", dateTo);
        } else {
          qs.set("days", String(Number.parseInt(periodFilter, 10) || 365));
        }

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
  }, [periodFilter, dateFrom, dateTo, statusFilter, dataset?.content_id]);

  const dateRangeError = getDateRangeError({
    period: periodFilter,
    from: dateFrom,
    to: dateTo,
  });

  const summary = invites.data?.summary || {};
  const rows = Array.isArray(invites.data?.rows) ? invites.data.rows : [];
  const source = invites.data?.source || null;
  const refresh = invites.data?.refresh || null;
  const lifecycleMetrics = useMemo(() => {
    const sent = Number(summary.sent || 0);

    const validResponses = Number(
      summary.valid_nps_responses ?? summary.responded ?? 0
    );

    const explicitCompletions = Number(
      summary.intercom_completed ?? summary.completed ?? 0
    );

    const completedWithoutScore = Number(
      summary.completed_without_valid_score || 0
    );

    /*
    * Prefer the exact backend figure. The fallback reconciles the totals:
    *
    * valid responses without completion event
    * = valid responses
    * - all explicit completion events
    * + completion events that did not produce a valid score
    */
    const validWithoutCompletionEvent = Number(
      summary.valid_responses_without_completion_event ??
        Math.max(
          0,
          validResponses -
            explicitCompletions +
            completedWithoutScore
        )
    );

    return {
      sent,
      validResponses,
      explicitCompletions,
      completedWithoutScore,
      validWithoutCompletionEvent,
    };
  }, [
    summary.sent,
    summary.responded,
    summary.valid_nps_responses,
    summary.completed,
    summary.intercom_completed,
    summary.completed_without_valid_score,
    summary.valid_responses_without_completion_event,
  ]);

  const subtitle = datasetId
    ? PAGE_COPY.savedSubtitle
    : mode === "intercom"
      ? PAGE_COPY.intercomSubtitle
      : PAGE_COPY.sessionSubtitle;

  const opportunitySummary = useMemo(() => {
    if (invites.loading) {
      return tr("Loading invitation opportunity summary...", "Chargement du résumé des opportunités de réponse...");
    }

    const {
      sent,
      validResponses,
      explicitCompletions,
      completedWithoutScore,
      validWithoutCompletionEvent,
    } = lifecycleMetrics;

    if (!sent) {
      return tr("No invitations were found for the selected period.", "Aucune invitation n’a été trouvée pour la période sélectionnée.");
    }

    const startedButNotCompleted = Number(
      summary.started_but_not_completed || 0
    );

    const noActivity = Number(
      summary.no_response_activity || 0
    );

    if (lang === "fr") {
      const followUp = [];
      if (startedButNotCompleted > 0) followUp.push(`${startedButNotCompleted} commencée${startedButNotCompleted === 1 ? "" : "s"} mais non terminée${startedButNotCompleted === 1 ? "" : "s"}`);
      if (noActivity > 0) followUp.push(`${noActivity} sans activité de réponse détectée`);
      const base = `${validResponses} invitation${validResponses === 1 ? "" : "s"} sur ${sent} ont produit une réponse NPS valide. Intercom a enregistré ${explicitCompletions} événement${explicitCompletions === 1 ? "" : "s"} explicite${explicitCompletions === 1 ? "" : "s"} de fin de questionnaire.`;
      return followUp.length
        ? `${base} Les principales opportunités de relance sont : ${followUp.join(" et ")}. Les réponses NPS valides restent la mesure de référence.`
        : `${base} Aucune invitation incomplète ou sans interaction ne nécessite actuellement de relance.`;
    }

    const resultParts = [
      `${validResponses} of ${sent} invitations produced a valid scored NPS response`,
      `${explicitCompletions} have an explicit completion event in the Intercom invitation statistics`,
    ];

    if (validWithoutCompletionEvent > 0) {
      resultParts.push(
        `${validWithoutCompletionEvent} valid response${
          validWithoutCompletionEvent === 1 ? "" : "s"
        } ${
          validWithoutCompletionEvent === 1 ? "does" : "do"
        } not have a matching Intercom completion event`
      );
    }

    if (completedWithoutScore > 0) {
      resultParts.push(
        `${completedWithoutScore} explicit completion${
          completedWithoutScore === 1 ? "" : "s"
        } did not produce a valid NPS score`
      );
    }

    const followUpParts = [];

    if (startedButNotCompleted > 0) {
      followUpParts.push(
        `${startedButNotCompleted} started but not completed`
      );
    }

    if (noActivity > 0) {
      followUpParts.push(
        `${noActivity} with no detected response activity`
      );
    }

    const reconciliationText = `${resultParts.join(". ")}.`;

    if (followUpParts.length === 0) {
      return `${reconciliationText} There are no currently detected incomplete or untouched invitations requiring survey follow-up.`;
    }

    return `${reconciliationText} The clearest follow-up opportunities are ${followUpParts.join(
      " and "
    )}. Valid NPS responses remain the authoritative response measure; Intercom completion events are shown separately as a technical lifecycle measure.`;
  }, [
    invites.loading,
    lifecycleMetrics,
    summary.started_but_not_completed,
    summary.no_response_activity,
    lang,
  ]);

  if (loadingDataset) {
    return (
      <main className="csv-nps-page">
        <section className="csv-nps-hero csv-nps-hero-compact">
          <p className="eyebrow">{PAGE_COPY.eyebrow}</p>
          <h1>{tr(PAGE_COPY.title, "Invitations")}</h1>
          <p>{tr("Loading invitation data...", "Chargement des invitations...")}</p>
        </section>

        <CsvNpsWorkspaceNav />

        <section className="csv-nps-panel">
          <p>{tr("Loading invitation data from workspace.", "Chargement des invitations depuis l’espace de travail.")}</p>
        </section>
      </main>
    );
  }

  if (datasetError) {
    return (
      <main className="csv-nps-page">
        <section className="csv-nps-hero csv-nps-hero-compact">
          <p className="eyebrow">{PAGE_COPY.eyebrow}</p>
          <h1>{tr(PAGE_COPY.title, "Invitations")}</h1>
          <p>{tr("There was a problem loading this dataset.", "Un problème est survenu lors du chargement de ce dataset.")}</p>
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
        <h1>{tr(PAGE_COPY.title, "Invitations")}</h1>
        <p>{lang === "fr" ? "Suivez les invitations, leur statut de livraison, les réponses et le taux de réponse." : subtitle}</p>
      </section>

      <CsvNpsWorkspaceNav />

      {datasetId && <WorkspaceDatasetHeader dataset={dataset} />}

      <section className="csv-nps-results">
        <div className="csv-nps-filters csv-nps-filters-three">
          <label className="csv-nps-filter-field">
            <span>{tr("Window", "Période")}</span>
            <select
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value)}
            >
              <option value="30d">{tr("Last 30 days", "30 derniers jours")}</option>
              <option value="90d">{tr("Last 90 days", "90 derniers jours")}</option>
              <option value="180d">{tr("Last 180 days", "180 derniers jours")}</option>
              <option value="365d">{tr("Last 365 days", "365 derniers jours")}</option>
              <option value="custom">{tr("Custom dates", "Dates personnalisées")}</option>
            </select>
          </label>

          {periodFilter === "custom" && (
            <div className="csv-nps-filter-field csv-nps-date-range-field">
              <span>{tr("Date range", "Plage de dates")}</span>
              <WorkspaceDateRangePicker
                from={dateFrom}
                to={dateTo}
                lang={lang}
                onChange={(range) => {
                  setDateFrom(range.from);
                  setDateTo(range.to);
                }}
              />
            </div>
          )}

          <label className="csv-nps-filter-field">
            <span>{tr("Status", "Statut")}</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">{tr("All", "Tous")}</option>
              <option value="sent">{tr("Sent", "Envoyée")}</option>
              <option value="delivered">{tr("Delivered", "Livrée")}</option>
              <option value="opened">{tr("Started / opened", "Commencée / ouverte")}</option>
              <option value="responded">{tr("Valid NPS response", "Réponse NPS valide")}</option>
              <option value="bounced">{tr("Bounced", "Rejetée")}</option>
              <option value="failed">{tr("Failed", "Échec")}</option>
              <option value="completed_without_score">{tr("Completed without score", "Terminée sans note")}</option>
            </select>
          </label>

          <div className="csv-nps-filter-field">
            <span>{tr("Source", "Source")}</span>
            <div className="text-sm text-slate-300">
              <div>
                {source?.source_name ||
                  dataset?.datasetName ||
                  tr("Active Intercom source", "Source Intercom active")}
              </div>

              {refresh && (
                <div className="csv-nps-muted-cell">
                  {refresh.ran
                    ? tr("Invitation data refreshed just now", "Données d’invitation actualisées à l’instant")
                    : refresh.reason === "fresh"
                      ? tr("Invitation data recently refreshed", "Données d’invitation récemment actualisées")
                      : refresh.reason === "waited_for_existing_refresh"
                        ? tr("Invitation data refreshed by another request", "Données d’invitation actualisées par une autre requête")
                        : refresh.error
                          ? `${tr("Refresh warning", "Avertissement d’actualisation")} : ${refresh.error}`
                          : tr("Invitation data loaded", "Données d’invitation chargées")}
                </div>
              )}
            </div>
          </div>
        </div>

        {dateRangeError && (
          <div className="csv-nps-error csv-nps-error-compact">
            {dateRangeError === "reversed"
              ? tr("The start date must be on or before the end date.", "La date de début doit être antérieure ou égale à la date de fin.")
              : tr("Choose both a start date and an end date.", "Choisissez une date de début et une date de fin.")}
          </div>
        )}

        {invites.error && (
          <section className="csv-nps-error">
            {invites.error}
          </section>
        )}

        <div className="csv-nps-responses-header">
          <div>
            <h2>{tr("Invitation performance", "Performance des invitations")}</h2>
            <p>
              {tr("Track whether survey invitations are producing responses, and find quick-win follow-up opportunities.", "Vérifiez si les invitations génèrent des réponses et identifiez rapidement les opportunités de relance.")}
            </p>
          </div>
        </div>

        <div className="csv-nps-metric-grid">
          <MetricCard
            label={tr("Invitations sent", "Invitations envoyées")}
            value={invites.loading ? "…" : summary.sent ?? "—"}
            sub={periodFilter === "custom"
              ? tr(`${dateFrom} to ${dateTo}`, `Du ${dateFrom} au ${dateTo}`)
              : tr(`${Number.parseInt(periodFilter, 10)}-day window`, `Période de ${Number.parseInt(periodFilter, 10)} jours`)}
            description={tr("All survey invitations detected in the selected period.", "Toutes les invitations détectées pendant la période sélectionnée.")}
          />

          <MetricCard
            label={tr("Opened or started", "Ouvertes ou commencées")}
            value={invites.loading ? "…" : summary.opened ?? "—"}
            description={tr("Invitations with detected opening, answering or completion activity.", "Invitations pour lesquelles une ouverture, une réponse ou une fin de questionnaire a été détectée.")}
          />

          <MetricCard
            label={tr("Valid NPS responses", "Réponses NPS valides")}
            value={
              invites.loading
                ? "…"
                : lifecycleMetrics.validResponses
            }
            description={tr("Canonical responses containing a usable score from 0 to 10.", "Réponses de référence contenant une note exploitable de 0 à 10.")}
          />

          <MetricCard
            label={tr("NPS response rate", "Taux de réponse NPS")}
            value={
              invites.loading
                ? "…"
                : summary.response_rate_pct == null
                  ? "—"
                  : `${summary.response_rate_pct}%`
            }
            description={tr("Valid scored NPS responses divided by invitations sent.", "Réponses NPS valides divisées par le nombre d’invitations envoyées.")}
          />

          <MetricCard
            label={tr("Recorded completion events", "Fins de questionnaire enregistrées")}
            value={
              invites.loading
                ? "…"
                : lifecycleMetrics.explicitCompletions
            }
            description={tr("Invitations for which Intercom exported an explicit completion timestamp.", "Invitations pour lesquelles Intercom a exporté une date explicite de fin de questionnaire.")}
          />

          <MetricCard
            label={tr("Completion event rate", "Taux de fin de questionnaire")}
            value={
              invites.loading
                ? "…"
                : summary.intercom_completion_rate_pct == null
                  ? "—"
                  : `${summary.intercom_completion_rate_pct}%`
            }
            description={tr("Explicit Intercom completion events divided by invitations sent.", "Fins de questionnaire explicites dans Intercom divisées par les invitations envoyées.")}
          />

          <MetricCard
            label={tr("Valid responses without completion event", "Réponses valides sans événement de fin")}
            value={
              invites.loading
                ? "…"
                : lifecycleMetrics.validWithoutCompletionEvent
            }
            description={tr("Usable NPS responses where the invitation statistics did not include a matching completion event.", "Réponses NPS exploitables sans événement de fin correspondant dans les statistiques d’invitation.")}
          />

          <MetricCard
            label={tr("Completed without valid score", "Terminées sans note valide")}
            value={
              invites.loading
                ? "…"
                : lifecycleMetrics.completedWithoutScore
            }
            description={tr("Explicit Intercom completions that did not produce a usable 0–10 score.", "Fins de questionnaire Intercom n’ayant pas produit de note exploitable de 0 à 10.")}
          />

          <MetricCard
            label={tr("Started but not completed", "Commencées mais non terminées")}
            value={
              invites.loading
                ? "…"
                : summary.started_but_not_completed ?? "—"
            }
            description={tr("Invitations with response activity but no completion or valid NPS response.", "Invitations avec une activité de réponse, mais sans fin de questionnaire ni réponse NPS valide.")}
          />

          <MetricCard
            label={tr("No response activity", "Aucune activité de réponse")}
            value={
              invites.loading
                ? "…"
                : summary.no_response_activity ?? "—"
            }
            description={tr("Invitations with no detected opening, answer, completion or response.", "Invitations sans ouverture, réponse ou fin de questionnaire détectée.")}
          />

          <MetricCard
            label={tr("Last invitation", "Dernière invitation")}
            value={
              invites.loading
                ? "…"
                : prettyDate(summary.last_sent_at)
            }
            description={tr("Most recent invitation detected in the selected period.", "Invitation la plus récente détectée pendant la période sélectionnée.")}
          />
        </div>

        <section className="csv-nps-chart-card csv-nps-chart-card-wide">
          <div className="csv-nps-responses-header">
            <div>
              <h3>{tr("How these figures reconcile", "Comment rapprocher ces chiffres")}</h3>
              <p>
                {tr("Valid NPS responses and Intercom completion events measure different parts of the survey lifecycle.", "Les réponses NPS valides et les événements de fin Intercom mesurent des étapes différentes du cycle du questionnaire.")}
              </p>
            </div>
          </div>

          <div className="csv-nps-management-summary">
            <p>
              {tr(
                `${lifecycleMetrics.validResponses} valid NPS responses were found in the canonical response data. Intercom separately recorded ${lifecycleMetrics.explicitCompletions} explicit completion events.`,
                `${lifecycleMetrics.validResponses} réponses NPS valides ont été trouvées dans les données de référence. Intercom a enregistré séparément ${lifecycleMetrics.explicitCompletions} événements explicites de fin de questionnaire.`
              )}
            </p>

            <p>
              {tr(
                `${lifecycleMetrics.validWithoutCompletionEvent} valid response${lifecycleMetrics.validWithoutCompletionEvent === 1 ? " has" : "s have"} no matching completion event, while ${lifecycleMetrics.completedWithoutScore} recorded completion${lifecycleMetrics.completedWithoutScore === 1 ? "" : "s"} did not produce a valid score.`,
                `${lifecycleMetrics.validWithoutCompletionEvent} réponse${lifecycleMetrics.validWithoutCompletionEvent === 1 ? " valide ne possède" : "s valides ne possèdent"} pas d’événement de fin correspondant, tandis que ${lifecycleMetrics.completedWithoutScore} fin${lifecycleMetrics.completedWithoutScore === 1 ? "" : "s"} de questionnaire enregistrée${lifecycleMetrics.completedWithoutScore === 1 ? " n’a" : "s n’ont"} pas produit de note valide.`
              )}
            </p>

            <p className="csv-nps-muted-cell">
              {tr("The valid NPS response total is used for NPS reporting. Completion events are retained as a separate Intercom delivery and lifecycle diagnostic.", "Le total des réponses NPS valides est utilisé pour le reporting NPS. Les événements de fin restent un indicateur Intercom distinct de diffusion et de cycle de vie.")}
            </p>
          </div>
        </section>

        <section className="csv-nps-chart-card csv-nps-chart-card-wide">
          <div className="csv-nps-responses-header">
            <div>
              <h3>{tr("Response opportunity", "Opportunités de réponse")}</h3>
              <p>
                {tr("Use this to identify customers who may need a small prompt to complete the survey.", "Utilisez cette vue pour identifier les clients qui pourraient avoir besoin d’une courte relance pour terminer le questionnaire.")}
              </p>
            </div>
          </div>

          <div className="csv-nps-management-summary">
            <p>{opportunitySummary}</p>

            <div className="csv-nps-management-actions">
              <a className="csv-nps-button" href={lang === "fr" ? "/fr/workspace/responses" : "/workspace/responses"}>
                {tr("Review responses", "Consulter les réponses")}
              </a>
              <a
                className="csv-nps-button csv-nps-button-secondary"
                href={lang === "fr" ? "/fr/workspace/performance" : "/workspace/performance"}
              >
                {tr("View performance", "Voir la performance")}
              </a>
            </div>
          </div>
        </section>

        <section className="csv-nps-chart-card csv-nps-chart-card-wide">
          <div className="csv-nps-responses-header">
            <div>
              <h3>{tr("Recent invitations", "Invitations récentes")}</h3>
              <p>{tr("Latest invitation activity for the selected filter set.", "Dernière activité d’invitation pour les filtres sélectionnés.")}</p>
            </div>
          </div>

          {invites.loading && (
            <p className="mt-4 text-sm text-slate-300">
              {tr("Loading invitations...", "Chargement des invitations...")}
            </p>
          )}

          {!invites.loading && !invites.error && rows.length === 0 && (
            <div className="csv-nps-empty-state">
              {tr("No invitations found for this filter set.", "Aucune invitation ne correspond à ces filtres.")}
            </div>
          )}

          {!invites.loading && !invites.error && rows.length > 0 && (
            <div className="csv-nps-table-wrap">
              <table className="csv-nps-table">
                <thead>
                  <tr>
                    <th>{tr("Sent", "Envoyée")}</th>
                    <th>{tr("Contact", "Contact")}</th>
                    <th>{tr("Status", "Statut")}</th>
                    <th>{tr("Score", "Note")}</th>
                    <th>{tr("Response", "Réponse")}</th>
                    <th>{tr("Action", "Action")}</th>
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
                              {tr("Open in Intercom", "Ouvrir dans Intercom")}
                            </a>
                          </div>
                        )}
                      </td>

                      <td>
                        <StatusPill status={row.status} lang={lang} />
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
                            href={`${lang === "fr" ? "/fr" : ""}/workspace/responses?q=${encodeURIComponent(
                              row.response_id
                            )}`}
                          >
                            {tr("View response", "Voir la réponse")}
                          </a>
                        ) : row.intercom_contact_url ? (
                          <a
                            className="text-link"
                            href={row.intercom_contact_url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {row.status === "completed_without_score"
                            ? tr("Review in Intercom", "Examiner dans Intercom")
                            : row.status === "opened"
                              ? tr("Prompt in Intercom", "Relancer dans Intercom")
                              : tr("Open in Intercom", "Ouvrir dans Intercom")}
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

function MetricCard({ label, value, sub, description }) {
  return (
    <div className="csv-nps-metric-card">
      <div className="csv-nps-metric-label">{label}</div>

      <div className="csv-nps-metric-value">
        {value ?? "—"}
      </div>

      {sub ? (
        <div className="csv-nps-muted-cell">
          {sub}
        </div>
      ) : null}

      {description ? (
        <p className="mt-2 text-xs leading-relaxed text-slate-400">
          {description}
        </p>
      ) : null}
    </div>
  );
}
