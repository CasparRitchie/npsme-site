import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext";

export default function WorkspaceSurveySourceSelector({
  enabled = true,
  contentId = "",
}) {
  const { lang } = useLanguage();
  const tr = (en, fr) => (lang === "fr" ? fr : en);
  const [searchParams, setSearchParams] = useSearchParams();
  const sourceId = searchParams.get("source") || "";
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(enabled);

  useEffect(() => {
    if (!enabled) {
      setSources([]);
      setLoading(false);
      return undefined;
    }

    let cancelled = false;

    async function loadSources() {
      setLoading(true);

      try {
        const response = await fetch("/api/workspace-intercom/sources", {
          credentials: "include",
        });
        const data = await response.json();

        if (!response.ok || !data?.ok) {
          throw new Error(data?.error || "Failed to load survey sources");
        }

        if (!cancelled) setSources(data.sources || []);
      } catch (_error) {
        if (!cancelled) setSources([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadSources();

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  const availableSources = useMemo(() => {
    const byContentId = new Map();

    for (const source of sources) {
      if (!source?.is_active) continue;

      const surveyContentId = String(source.survey_content_id || "").trim();
      if (!surveyContentId) continue;

      // Duplicate legacy configuration rows represent the same Intercom survey.
      // Keep the newest entry returned by the API and show one user-facing option.
      byContentId.set(surveyContentId, source);
    }

    return Array.from(byContentId.values());
  }, [sources]);

  const selectedSourceId = useMemo(() => {
    if (sourceId && availableSources.some((source) => source.id === sourceId)) {
      return sourceId;
    }

    const currentContentId = String(contentId || "").trim();
    return (
      availableSources.find(
        (source) => String(source.survey_content_id || "") === currentContentId
      )?.id || ""
    );
  }, [availableSources, contentId, sourceId]);

  if (!enabled || (!loading && availableSources.length < 2)) return null;

  function handleChange(event) {
    const next = new URLSearchParams(searchParams);
    next.set("source", event.target.value);
    next.delete("response");
    setSearchParams(next, { replace: true });
  }

  return (
    <section className="workspace-survey-selector" aria-label={tr("Survey selection", "Sélection du questionnaire")}>
      <div>
        <span className="workspace-survey-selector-kicker">
          {tr("Survey", "Questionnaire")}
        </span>
        <strong>{tr("Choose the feedback journey to analyse", "Choisissez l’étape du parcours à analyser")}</strong>
        <p>
          {tr(
            "Performance, responses and invitations will use the same selected survey.",
            "Les performances, les réponses et les invitations utiliseront le même questionnaire sélectionné."
          )}
        </p>
      </div>

      <label className="csv-nps-filter-field workspace-survey-selector-field">
        <span>{tr("Survey source", "Source du questionnaire")}</span>
        <select
          value={selectedSourceId}
          onChange={handleChange}
          disabled={loading || availableSources.length === 0}
        >
          {loading && <option value="">{tr("Loading surveys…", "Chargement des questionnaires…")}</option>}
          {!loading && !selectedSourceId && (
            <option value="" disabled>
              {tr("Select a survey", "Sélectionnez un questionnaire")}
            </option>
          )}
          {availableSources.map((source) => (
            <option key={source.id} value={source.id}>
              {source.source_name || source.survey_content_title || source.survey_content_id}
            </option>
          ))}
        </select>
      </label>
    </section>
  );
}
