// LiveResultsPanel.jsx
import React from "react";

function computeNps(scores) {
  if (!scores.length) return null;
  const promoters = scores.filter((s) => s >= 9).length;
  const detractors = scores.filter((s) => s <= 6).length;
  const total = scores.length;
  return Math.round(((promoters - detractors) / total) * 100);
}

function groupByKey(rows, key) {
  const map = new Map();
  for (const row of rows) {
    const value = (row[key] || "Non renseigné").trim() || "Non renseigné";
    if (!map.has(value)) {
      map.set(value, []);
    }
    map.get(value).push(row);
  }
  return Array.from(map.entries()).map(([value, items]) => ({
    value,
    items,
  }));
}

export default function LiveResultsPanel() {
  const [loading, setLoading] = React.useState(true);
  const [rows, setRows] = React.useState([]);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/live-responses");
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(
            data.error || "Impossible de charger les réponses live."
          );
        }
        const data = await res.json();
        const cleaned =
          (data.rows || []).map((r) => ({
            ...r,
            score:
              r.score !== undefined && r.score !== null
                ? Number(r.score)
                : null,
          })) || [];
        setRows(cleaned.filter((r) => !Number.isNaN(r.score)));
        setLoading(false);
      } catch (err) {
        console.error("[LiveResultsPanel] load error", err);
        setError(err.message || "Erreur lors du chargement des données.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="results-panel">
        <p>Chargement des réponses live…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="results-panel">
        <h2>Résultats live</h2>
        <p style={{ color: "#b91c1c" }}>{error}</p>
      </div>
    );
  }

  if (!rows.length) {
    return (
      <div className="results-panel">
        <h2>Résultats live</h2>
        <p>Aucune réponse live pour le moment.</p>
      </div>
    );
  }

  const scores = rows.map((r) => r.score);
  const overallNps = computeNps(scores);

  const byDevice = groupByKey(rows, "typeOfDevice");
  const byAssist = groupByKey(rows, "assistanteMaternelle");

  return (
    <div className="results-panel">
      <h2>Résultats live</h2>

      <section
        style={{
          marginTop: "1rem",
          padding: "1rem",
          borderRadius: "0.75rem",
          border: "1px solid #e5e7eb",
        }}
      >
        <h3 style={{ marginBottom: "0.25rem" }}>Vue d'ensemble</h3>
        <p style={{ marginBottom: "0.5rem" }}>
          Réponses totales : <strong>{rows.length}</strong>
        </p>
        <p>
          NPS global :{" "}
          {overallNps === null ? (
            <span>n/a</span>
          ) : (
            <strong>{overallNps}</strong>
          )}
        </p>
      </section>

      <section style={{ marginTop: "1.5rem" }}>
        <h3>Par type d'appareil</h3>
        {byDevice.map(({ value, items }) => {
          const nps = computeNps(items.map((r) => r.score));
          return (
            <div
              key={value}
              style={{
                marginTop: "0.75rem",
                padding: "0.75rem",
                borderRadius: "0.75rem",
                border: "1px solid #e5e7eb",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "0.95rem",
                }}
              >
                <span>
                  {value} — {items.length} réponse
                  {items.length > 1 ? "s" : ""}
                </span>
                <span>
                  NPS :{" "}
                  {nps === null ? <span>n/a</span> : <strong>{nps}</strong>}
                </span>
              </div>
            </div>
          );
        })}
      </section>

      <section style={{ marginTop: "1.5rem" }}>
        <h3>Par assistance maternelle</h3>
        {byAssist.map(({ value, items }) => {
          const nps = computeNps(items.map((r) => r.score));
          return (
            <div
              key={value}
              style={{
                marginTop: "0.75rem",
                padding: "0.75rem",
                borderRadius: "0.75rem",
                border: "1px solid #e5e7eb",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "0.95rem",
                }}
              >
                <span>
                  {value} — {items.length} réponse
                  {items.length > 1 ? "s" : ""}
                </span>
                <span>
                  NPS :{" "}
                  {nps === null ? <span>n/a</span> : <strong>{nps}</strong>}
                </span>
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
