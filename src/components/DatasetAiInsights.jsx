// src/components/DatasetAiInsights.jsx
import React, { useState } from "react";
import { useLanguage } from "../i18n/LanguageContext";

export default function DatasetAiInsights({ datasetId }) {
  const { lang } = useLanguage();
  const tr = (en, fr) => (lang === "fr" ? fr : en);
  const [insights, setInsights] = useState(null);
  const [generatedAt, setGeneratedAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function generateInsights() {
    if (!datasetId) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/nps-data/datasets/${datasetId}/insights`, {
        method: "POST",
        credentials: "include",
      });

      const contentType = res.headers.get("content-type") || "";

      if (!contentType.includes("application/json")) {
        const text = await res.text();
        console.error("Expected JSON but received:", text.slice(0, 500));

        throw new Error(
          "The AI request did not return JSON. It may have timed out on the server."
        );
      }

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to generate insights");
      }

      setInsights(data.insights);
      setGeneratedAt(data.generatedAt);
    } catch (err) {
      console.error("Failed to generate AI insights:", err);
      setError(err.message || "The AI insight request did not complete. Try again, or reduce the dataset size.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="csv-nps-ai-insights">
      <div className="csv-nps-responses-header">
        <div>
          <h2>{tr("AI insight summary", "Synthèse IA")}</h2>
          <p>
            {tr("Generate a practical CX readout from this dataset, including themes, risks, recommended actions and close-the-loop templates.", "Générez une synthèse CX pratique de ce dataset : thèmes, risques, actions recommandées et modèles de suivi.")}
          </p>
        </div>

        <button
          type="button"
          className="csv-nps-button"
          onClick={generateInsights}
          disabled={loading || !datasetId}
        >
          {loading ? tr("Generating...", "Génération...") : insights ? tr("Regenerate insights", "Régénérer la synthèse") : tr("Generate insights", "Générer la synthèse")}
        </button>
      </div>

      {error && <div className="csv-nps-error">{error}</div>}

      {loading && (
        <div className="csv-nps-ai-loading">
          <div className="csv-nps-spinner" />
          <div>
            <strong>{tr("Generating AI insights...", "Génération de la synthèse IA...")}</strong>
            <p>
              {tr("Analysing scores, comments, themes, risks and recommended actions.", "Analyse des notes, commentaires, thèmes, risques et actions recommandées.")}
            </p>
          </div>
        </div>
      )}

      {!insights && !error && !loading && (
          <div className="csv-nps-empty-state">
          {tr("No AI insights generated yet. Click “Generate insights” to analyse the comments, scores and feedback patterns in this dataset.", "Aucune synthèse IA n’a encore été générée. Cliquez sur « Générer la synthèse » pour analyser les commentaires, les notes et les tendances de ce dataset.")}
        </div>
      )}

      {insights && (
        <div className="csv-nps-ai-insights-grid">
          <section className="csv-nps-chart-card csv-nps-chart-card-wide">
            <h3>{tr("Executive summary", "Synthèse générale")}</h3>
            <p>{insights.executive_summary || tr("No summary returned.", "Aucune synthèse disponible.")}</p>

            {generatedAt && (
              <p className="csv-nps-ai-generated">
                {tr("Generated", "Générée le")} {new Date(generatedAt).toLocaleString()}
              </p>
            )}
          </section>

          <section className="csv-nps-chart-card">
            <h3>{tr("NPS readout", "Lecture du NPS")}</h3>
            <p>
              <strong>{tr("Score", "Note")}:</strong>{" "}
              {insights.nps_readout?.score ?? tr("Not available", "Non disponible")}
            </p>
            <p>{insights.nps_readout?.interpretation || tr("No interpretation returned.", "Aucune interprétation disponible.")}</p>
          </section>

          <InsightList
            title={tr("Key themes", "Thèmes principaux")}
            items={insights.key_themes || []}
            renderItem={(item) => (
              <>
                <h4>{item.theme}</h4>
                <p>
                  <strong>{tr("Sentiment", "Sentiment")}:</strong> {item.sentiment || tr("unknown", "inconnu")} ·{" "}
                  <strong>{tr("Evidence", "Éléments") }:</strong> {item.evidence_count ?? 0}
                </p>
                <QuoteList quotes={item.example_quotes} />
              </>
            )}
          />

          <InsightList
            title={tr("CX risks", "Risques CX")}
            items={insights.cx_risks || []}
            renderItem={(item) => (
              <>
                <h4>{item.risk}</h4>
                <p>
                  <strong>{tr("Severity", "Gravité")}:</strong> {item.severity || tr("unknown", "inconnue")}
                </p>
                <p>{item.why_it_matters}</p>
                {item.who_to_review && (
                  <p>
                    <strong>{tr("Review", "À examiner")}:</strong> {item.who_to_review}
                  </p>
                )}
              </>
            )}
          />

          <InsightList
            title={tr("Recommended actions", "Actions recommandées")}
            items={insights.recommended_actions || []}
            renderItem={(item) => (
              <>
                <h4>{item.action}</h4>
                <p>{item.why}</p>
                <p>
                  <strong>{tr("Impact", "Impact")}:</strong> {item.impact || tr("unknown", "inconnu")} ·{" "}
                  <strong>{tr("Effort", "Effort")}:</strong> {item.effort || tr("unknown", "inconnu")}
                </p>
              </>
            )}
          />

          <InsightList
            title={tr("Close-the-loop templates", "Modèles de suivi")}
            items={insights.close_the_loop_templates || []}
            renderItem={(item) => (
              <>
                <h4>{item.segment}</h4>
                <p>
                  <strong>{tr("Subject", "Objet")}:</strong> {item.subject}
                </p>
                <div className="csv-nps-ai-template-body">{item.body}</div>
              </>
            )}
          />
        </div>
      )}
    </section>
  );
}

function InsightList({ title, items, renderItem }) {
  const { lang } = useLanguage();
  return (
    <section className="csv-nps-chart-card">
      <h3>{title}</h3>

      {!items.length ? (
        <div className="csv-nps-empty-state">{lang === "fr" ? "Aucun élément disponible." : "No items returned."}</div>
      ) : (
        <div className="csv-nps-ai-list">
          {items.map((item, index) => (
            <article className="csv-nps-ai-list-item" key={index}>
              {renderItem(item)}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function QuoteList({ quotes = [] }) {
  if (!Array.isArray(quotes) || quotes.length === 0) return null;

  return (
    <ul className="csv-nps-ai-quotes">
      {quotes.map((quote, index) => (
        <li key={index}>“{quote}”</li>
      ))}
    </ul>
  );
}
