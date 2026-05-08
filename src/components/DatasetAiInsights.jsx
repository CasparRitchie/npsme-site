// src/components/DatasetAiInsights.jsx
import React, { useState } from "react";

export default function DatasetAiInsights({ datasetId }) {
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

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to generate insights");
      }

      setInsights(data.insights);
      setGeneratedAt(data.generatedAt);
    } catch (err) {
      console.error("Failed to generate AI insights:", err);
      setError(err.message || "Failed to generate AI insights");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="csv-nps-ai-insights">
      <div className="csv-nps-responses-header">
        <div>
          <h2>AI insight summary</h2>
          <p>
            Generate a practical CX readout from this dataset, including themes,
            risks, recommended actions and close-the-loop templates.
          </p>
        </div>

        <button
          type="button"
          className="csv-nps-button"
          onClick={generateInsights}
          disabled={loading || !datasetId}
        >
          {loading ? "Generating..." : insights ? "Regenerate insights" : "Generate insights"}
        </button>
      </div>

      {error && <div className="csv-nps-error">{error}</div>}

      {!insights && !error && (
        <div className="csv-nps-empty-state">
          No AI insights generated yet. Click “Generate insights” to analyse the
          comments, scores and feedback patterns in this dataset.
        </div>
      )}

      {insights && (
        <div className="csv-nps-ai-insights-grid">
          <section className="csv-nps-chart-card csv-nps-chart-card-wide">
            <h3>Executive summary</h3>
            <p>{insights.executive_summary || "No summary returned."}</p>

            {generatedAt && (
              <p className="csv-nps-ai-generated">
                Generated {new Date(generatedAt).toLocaleString()}
              </p>
            )}
          </section>

          <section className="csv-nps-chart-card">
            <h3>NPS readout</h3>
            <p>
              <strong>Score:</strong>{" "}
              {insights.nps_readout?.score ?? "Not available"}
            </p>
            <p>{insights.nps_readout?.interpretation || "No interpretation returned."}</p>
          </section>

          <InsightList
            title="Key themes"
            items={insights.key_themes || []}
            renderItem={(item) => (
              <>
                <h4>{item.theme}</h4>
                <p>
                  <strong>Sentiment:</strong> {item.sentiment || "unknown"} ·{" "}
                  <strong>Evidence:</strong> {item.evidence_count ?? 0}
                </p>
                <QuoteList quotes={item.example_quotes} />
              </>
            )}
          />

          <InsightList
            title="CX risks"
            items={insights.cx_risks || []}
            renderItem={(item) => (
              <>
                <h4>{item.risk}</h4>
                <p>
                  <strong>Severity:</strong> {item.severity || "unknown"}
                </p>
                <p>{item.why_it_matters}</p>
                {item.who_to_review && (
                  <p>
                    <strong>Review:</strong> {item.who_to_review}
                  </p>
                )}
              </>
            )}
          />

          <InsightList
            title="Recommended actions"
            items={insights.recommended_actions || []}
            renderItem={(item) => (
              <>
                <h4>{item.action}</h4>
                <p>{item.why}</p>
                <p>
                  <strong>Impact:</strong> {item.impact || "unknown"} ·{" "}
                  <strong>Effort:</strong> {item.effort || "unknown"}
                </p>
              </>
            )}
          />

          <InsightList
            title="Close-the-loop templates"
            items={insights.close_the_loop_templates || []}
            renderItem={(item) => (
              <>
                <h4>{item.segment}</h4>
                <p>
                  <strong>Subject:</strong> {item.subject}
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
  return (
    <section className="csv-nps-chart-card">
      <h3>{title}</h3>

      {!items.length ? (
        <div className="csv-nps-empty-state">No items returned.</div>
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
