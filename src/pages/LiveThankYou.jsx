// LiveThankYou.jsx
import React from "react";
import { useLocation } from "react-router-dom";

function useQuery() {
  const { search } = useLocation();
  return React.useMemo(() => new URLSearchParams(search), [search]);
}

export default function LiveThankYou() {
  const query = useQuery();
  const rawScore = query.get("score");
  const score = rawScore != null ? Number(rawScore) : null;

  let headline = "Merci pour votre réponse !";
  if (!Number.isNaN(score)) {
    if (score >= 9) {
      headline = "Un grand merci pour votre excellente note !";
    } else if (score <= 6) {
      headline = "Merci pour votre franchise, c'est très précieux.";
    }
  }

  return (
<div className="survey-page envola-theme">
        <div className="survey-card envola-card">
          <div className="envola-brand-bar">
            {/* replace this with a real logo img later if you like */}
            <span className="envola-logo-text">Envola</span>
            <span className="envola-badge">Questionnaire de satisfaction</span>
          </div>
        <h1>{headline}</h1>
        <p style={{ marginTop: "1rem" }}>
          Votre avis nous aide à comprendre ce qui fonctionne bien et ce que
          nous pouvons encore améliorer.
        </p>
        {!Number.isNaN(score) && rawScore != null && (
          <p style={{ marginTop: "0.75rem", fontSize: "0.95rem" }}>
            Note donnée : <strong>{score} / 10</strong>
          </p>
        )}
        <p
          style={{
            marginTop: "1.5rem",
            fontSize: "0.85rem",
            color: "#6b7280",
            lineHeight: 1.4,
          }}
        >
          Si vous avez d'autres remarques, n'hésitez pas à les partager avec
          votre interlocuteur habituel.
        </p>
        <p className="envola-powered">
          Propulsé par{" "}
          <a href="https://www.npsme.com" target="_blank" rel="noreferrer">
            NPS Me
          </a>
        </p>
      </div>
    </div>
  );
}
