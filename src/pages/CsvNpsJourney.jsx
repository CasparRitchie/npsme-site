import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import CsvNpsWorkspaceNav from "../components/CsvNpsWorkspaceNav";
import NpsTimeseriesChart from "../components/NpsTimeseriesChart";
import { useLanguage } from "../i18n/LanguageContext";
import { localizePath } from "../i18n/pathHelpers";

const THEME_LABELS = {
  onboarding: ["Onboarding", "Onboarding"],
  wifi: ["Connectivity", "Connectivité"],
  support: ["Support", "Support"],
  billing: ["Billing", "Facturation"],
  reliability: ["Reliability", "Fiabilité"],
  attendance_sheet: ["Attendance sheets", "Fiches de présence"],
  time_tracking: ["Time tracking", "Suivi des horaires"],
  lateness: ["Punctuality", "Ponctualité"],
  parents: ["Parents", "Parents"],
  setup: ["Setup", "Installation"],
  feature_requests: ["Feature requests", "Demandes d’amélioration"],
  support_speed: ["Support responsiveness", "Réactivité du support"],
};

export default function CsvNpsJourney() {
  const { lang } = useLanguage();
  const tr = (en, fr) => (lang === "fr" ? fr : en);
  const lp = (path) => localizePath(path, lang);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [direction, setDirection] = useState("all");
  const [selectedContact, setSelectedContact] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function loadJourney() {
      setLoading(true);
      setError("");
      try {
        const response = await fetch("/api/workspace-intercom/journey", {
          credentials: "include",
        });
        const payload = await response.json();
        if (!response.ok || !payload.ok) {
          throw new Error(payload.error || "Failed to load journey data");
        }
        if (!cancelled) setData(payload);
      } catch (err) {
        if (!cancelled) setError(err.message || "Failed to load journey data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadJourney();
    return () => {
      cancelled = true;
    };
  }, []);

  const contacts = useMemo(() => {
    const all = data?.contacts || [];
    return direction === "all"
      ? all
      : all.filter((contact) => contact.direction === direction);
  }, [data, direction]);

  const selected = (data?.contacts || []).find(
    (contact) => contact.contact_ref === selectedContact
  );
  const summary = data?.summary || {};

  return (
    <main className="csv-nps-page workspace-journey-page">
      <CsvNpsWorkspaceNav />

      <header className="csv-nps-hero workspace-journey-hero">
        <div>
          <p className="workspace-journey-eyebrow">NPS Me Workspace</p>
          <h1>{tr("Journey", "Parcours")}</h1>
          <p>
            {tr(
              "See how customer perception changes from one survey milestone to the next, then explore the responses behind each movement.",
              "Suivez l’évolution de la perception client d’une étape à l’autre, puis explorez les réponses qui expliquent chaque mouvement."
            )}
          </p>
        </div>
        <span className="workspace-journey-privacy">
          {tr("Privacy-safe contact view", "Vue contact respectueuse de la confidentialité")}
        </span>
      </header>

      {loading && <div className="csv-nps-panel">{tr("Loading journey…", "Chargement du parcours…")}</div>}
      {error && <div className="csv-nps-error">{error}</div>}

      {!loading && !error && data && (
        <>
          <section className="workspace-journey-metrics" aria-label={tr("Journey summary", "Synthèse du parcours")}>
            <JourneyMetric label={tr("Repeat respondents", "Répondants récurrents")} value={summary.repeat_contacts ?? 0} tone="purple" />
            <JourneyMetric label={tr("Improving", "En progression")} value={summary.improving ?? 0} note={tr(`${summary.ambassadors ?? 0} potential ambassadors`, `${summary.ambassadors ?? 0} ambassadeurs potentiels`)} tone="green" />
            <JourneyMetric label={tr("Stable", "Stables")} value={summary.stable ?? 0} tone="slate" />
            <JourneyMetric label={tr("Declining", "En baisse")} value={summary.declining ?? 0} note={tr("Review as churn risk", "À examiner comme risque de churn")} tone="red" />
            <JourneyMetric label={tr("Average movement", "Évolution moyenne")} value={formatDelta(summary.average_delta)} note={`${formatScore(summary.average_first_score)} → ${formatScore(summary.average_latest_score)}`} tone="purple" />
          </section>

          <section className="csv-nps-chart-card csv-nps-chart-card-wide workspace-journey-section">
            <SectionHeading
              title={tr("Global NPS over time", "NPS global dans le temps")}
              copy={tr(
                "Global survey results for customers who also responded at another milestone. Milestone scores remain separate below.",
                "Résultats du questionnaire global pour les clients ayant également répondu à une autre étape. Les scores des étapes restent séparés ci-dessous."
              )}
            />
            {(data.global_trend || []).length ? (
              <div className="csv-nps-chart-canvas">
                <NpsTimeseriesChart points={data.global_trend} granularity="month" />
              </div>
            ) : (
              <div className="csv-nps-empty-state">
                {tr("No repeat-respondent Global NPS history yet.", "Pas encore d’historique NPS global pour les répondants récurrents.")}
              </div>
            )}
          </section>

          <section className="workspace-journey-section">
            <SectionHeading
              title={tr("Milestone comparison", "Comparaison des étapes")}
              copy={tr(
                "Each score is calculated independently so the journey remains comparable without blending different survey purposes.",
                "Chaque score est calculé séparément afin de comparer le parcours sans mélanger des questionnaires aux objectifs différents."
              )}
            />
            <div className="workspace-journey-milestones">
              {(data.milestones || []).map((milestone, index) => (
                <React.Fragment key={milestone.id || milestone.content_id}>
                  {index > 0 && <span className="workspace-journey-connector" aria-hidden="true">→</span>}
                  <article className={`workspace-journey-milestone workspace-journey-milestone-${milestone.kind}`}>
                    <span>{index + 1}</span>
                    <h3>{milestone.name}</h3>
                    <strong>{milestone.repeat_cohort.nps ?? "—"}</strong>
                    <small>NPS · {milestone.repeat_cohort.validResponses} {tr("responses", "réponses")}</small>
                    <p>{tr("All respondents", "Tous les répondants")}: <b>{milestone.all_responses.nps ?? "—"}</b> NPS</p>
                  </article>
                </React.Fragment>
              ))}
            </div>
          </section>

          <section className="workspace-journey-section workspace-journey-themes-section">
            <SectionHeading
              title={tr("What may be driving the change", "Ce qui peut expliquer l’évolution")}
              copy={tr(
                "Themes detected from redacted comments and open-text answers in the repeat-response cohort.",
                "Thèmes détectés dans les commentaires et réponses ouvertes expurgés du groupe de répondants récurrents."
              )}
            />
            <div className="workspace-journey-theme-columns">
              <ThemeGroup title={tr("Declining journeys", "Parcours en baisse")} themes={data.themes?.declining} lang={lang} tone="red" empty={tr("No recurring themes yet.", "Aucun thème récurrent pour le moment.")} />
              <ThemeGroup title={tr("Improving journeys", "Parcours en progression")} themes={data.themes?.improving} lang={lang} tone="green" empty={tr("No recurring themes yet.", "Aucun thème récurrent pour le moment.")} />
            </div>
          </section>

          <section className="workspace-journey-section">
            <div className="workspace-journey-list-header">
              <SectionHeading
                title={tr("Customer journeys", "Parcours clients")}
                copy={tr(
                  "Select a masked contact to compare every available milestone and question response.",
                  "Sélectionnez un contact masqué pour comparer chaque étape et chaque réponse disponible."
                )}
              />
              <label>
                <span>{tr("Movement", "Évolution")}</span>
                <select value={direction} onChange={(event) => setDirection(event.target.value)}>
                  <option value="all">{tr("All", "Toutes")}</option>
                  <option value="declining">{tr("Declining", "En baisse")}</option>
                  <option value="improving">{tr("Improving", "En progression")}</option>
                  <option value="stable">{tr("Stable", "Stable")}</option>
                </select>
              </label>
            </div>

            {contacts.length === 0 ? (
              <div className="csv-nps-empty-state">
                {tr("No contacts match this movement filter.", "Aucun contact ne correspond à ce filtre d’évolution.")}
              </div>
            ) : (
              <div className="workspace-journey-contact-list">
                {contacts.map((contact) => (
                  <button
                    key={contact.contact_ref}
                    type="button"
                    className={`workspace-journey-contact ${selectedContact === contact.contact_ref ? "active" : ""}`}
                    onClick={() => setSelectedContact(contact.contact_ref)}
                  >
                    <span className={`workspace-journey-signal workspace-journey-signal-${contact.direction}`} />
                    <span><b>{contact.contact_ref}</b><small>{contact.survey_count} {tr("surveys", "questionnaires")} · {contact.response_count} {tr("responses", "réponses")}</small></span>
                    <span className="workspace-journey-score-move"><b>{contact.first_score}</b><i>→</i><b>{contact.latest_score}</b></span>
                    <strong className={`workspace-journey-delta workspace-journey-delta-${contact.direction}`}>{formatDelta(contact.delta)}</strong>
                  </button>
                ))}
              </div>
            )}
          </section>

          {selected && (
            <section className="workspace-journey-section workspace-journey-detail">
              <div className="workspace-journey-detail-header">
                <div>
                  <p>{tr("Selected journey", "Parcours sélectionné")}</p>
                  <h2>{selected.contact_ref}</h2>
                </div>
                <button type="button" onClick={() => setSelectedContact("")}>{tr("Close detail", "Fermer le détail")}</button>
              </div>
              <div className="workspace-journey-response-track">
                {selected.responses.map((response, index) => (
                  <article key={response.response_id || `${response.submitted_at}-${index}`}>
                    <header>
                      <span>{index + 1}</span>
                      <div><h3>{response.source.name}</h3><time>{formatDate(response.submitted_at, lang)}</time></div>
                      <strong>{response.score}<small>/10</small></strong>
                    </header>
                    <div className="workspace-journey-answer-list">
                      {response.answers.map((answer, answerIndex) => (
                        <div key={`${answer.question}-${answerIndex}`}>
                          <p>{answer.question}</p>
                          <b>{answer.score !== null ? `${answer.score}/10` : answer.answer || "—"}</b>
                        </div>
                      ))}
                    </div>
                    <footer>
                      {response.source.id && response.response_id && (
                        <Link to={`${lp("/workspace/responses")}?source=${encodeURIComponent(response.source.id)}&response=${encodeURIComponent(response.response_id)}`}>
                          {tr("View response", "Voir la réponse")}
                        </Link>
                      )}
                    </footer>
                  </article>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </main>
  );
}

function JourneyMetric({ label, value, note, tone }) {
  return <article className={`workspace-journey-metric workspace-journey-metric-${tone}`}><span>{label}</span><strong>{value ?? "—"}</strong>{note && <small>{note}</small>}</article>;
}

function SectionHeading({ title, copy }) {
  return <div className="workspace-journey-section-heading"><h2>{title}</h2><p>{copy}</p></div>;
}

function ThemeGroup({ title, themes = [], lang, tone, empty }) {
  return (
    <article className={`workspace-journey-theme-group workspace-journey-theme-${tone}`}>
      <h3>{title}</h3>
      {!themes.length ? <p>{empty}</p> : themes.slice(0, 6).map((theme) => (
        <div key={theme.key}>
          <header><b>{THEME_LABELS[theme.key]?.[lang === "fr" ? 1 : 0] || theme.key.replaceAll("_", " ")}</b><span>{theme.contact_count} {lang === "fr" ? "contacts" : "contacts"}</span></header>
          {theme.examples?.[0] && <blockquote>“{theme.examples[0]}”</blockquote>}
        </div>
      ))}
    </article>
  );
}

function formatScore(value) {
  return Number.isFinite(value) ? `${value}/10` : "—";
}

function formatDelta(value) {
  if (!Number.isFinite(value)) return "—";
  return `${value > 0 ? "+" : ""}${value}`;
}

function formatDate(value, lang) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value || "—";
  return new Intl.DateTimeFormat(lang === "fr" ? "fr-FR" : "en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}
