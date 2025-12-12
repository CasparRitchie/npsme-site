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
            <div className="envola-logo-wrap">
              <img
                src="https://envola.fr/wp-content/uploads/2025/02/logo-envola.png"
                alt="Envola"
                className="envola-logo-img"
              />
            </div>
            <span className="envola-badge">Questionnaire de satisfaction</span>
          </div>
                <h1>{headline}</h1>

        <p style={{ marginTop: "1rem" }}>
          Merci beaucoup pour votre participation!
          <br />
          Connaître votre niveau de satisfaction va nous permettre de continuer
          à faire évoluer Envola, de nous améliorer en restant toujours au plus
          proche de votre réalité de terrain.
          <br />
          <br />
          Nicholas &amp; Karin
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
