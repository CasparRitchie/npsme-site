// LiveSurveyPage.jsx
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import EnvolaLayout from "../components/EnvolaLayout";

function useQuery() {
  const { search } = useLocation();
  return React.useMemo(() => new URLSearchParams(search), [search]);
}

export default function LiveSurveyPage() {
  const query = useQuery();
  const navigate = useNavigate();

  const [loading, setLoading] = React.useState(true);
  const [invitation, setInvitation] = React.useState(null);
  const [score, setScore] = React.useState(null);
  const [comment, setComment] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState(null);

  const invitationId = query.get("inv") || "";

  // Optional: re-validate invitation so a direct /live-survey?inv=… works
  React.useEffect(() => {
    if (!invitationId) {
      setError("Lien d'invitation invalide.");
      setLoading(false);
      return;
    }

    const fetchInvitation = async () => {
      try {
        const res = await fetch(
          `/api/live-survey/lookup?inv=${encodeURIComponent(invitationId)}`
        );

        if (res.status === 404) {
          setError("Invitation introuvable ou expirée.");
          setLoading(false);
          return;
        }

        if (res.status === 409) {
          setError(
            "Vous avez déjà répondu à ce questionnaire. Merci beaucoup pour votre retour !"
          );
          setLoading(false);
          return;
        }

        if (!res.ok) {
          setError(
            "Impossible de charger le questionnaire pour le moment. Merci de réessayer plus tard."
          );
          setLoading(false);
          return;
        }

        const data = await res.json();
        setInvitation(data.invitation);
        setLoading(false);
      } catch (err) {
        console.error("[LiveSurveyPage] lookup error", err);
        setError(
          "Une erreur réseau s'est produite. Merci de réessayer dans quelques instants."
        );
        setLoading(false);
      }
    };

    fetchInvitation();
  }, [invitationId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (score === null) {
      setError("Merci de sélectionner une note entre 0 et 10.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/live-survey/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          invitationId,
          score,
          comment: comment.trim(),
        }),
      });

      if (res.status === 409) {
        setError(
          "Vous avez déjà répondu à ce questionnaire. Merci beaucoup pour votre retour !"
        );
        setSubmitting(false);
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Impossible d'enregistrer votre réponse.");
        setSubmitting(false);
        return;
      }

      // Success: navigate to thank-you page, passing the score in the URL
    navigate(`/live-survey/thanks?score=${encodeURIComponent(score)}`);
    } catch (err) {
      console.error("[LiveSurveyPage] submit error", err);
      setError(
        "Une erreur réseau s'est produite au moment de l'envoi. Merci de réessayer."
      );
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <EnvolaLayout>
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
            <p>Chargement du questionnaire…</p>
          </div>
        </div>
      </EnvolaLayout>
    );
  }

  if (error && !invitation) {
    return (
      <EnvolaLayout>
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
            <h1>Oups…</h1>
            <p>{error}</p>
            <p className="envola-powered">
              Propulsé par{" "}
              <a href="https://www.npsme.com" target="_blank" rel="noreferrer">
                NPS Me
              </a>
            </p>
          </div>
        </div>
      </EnvolaLayout>
    );
  }

  const businessName = invitation?.businessName || "notre service";

  return (
    <EnvolaLayout>
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
          <h1>Merci de nous donner votre avis</h1>
          <p style={{ marginTop: "1rem" }}>
            Sur une échelle de 0 à 10, quelle est la probabilité que vous
            recommandiez <strong>{businessName}</strong> à un ami ou un collègue ?
          </p>

          <form onSubmit={handleSubmit} style={{ marginTop: "1.5rem" }}>
            <div
              className="score-grid"
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "0.5rem",
                marginBottom: "1.25rem",
              }}
            >
              {Array.from({ length: 11 }, (_, i) => i).map((value) => {
                const isSelected = score === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setScore(value)}
                    style={{
                      width: "2.5rem",
                      height: "2.5rem",
                      borderRadius: "999px",
                      border: isSelected ? "2px solid #22c55e" : "1px solid #cbd5f5",
                      background: isSelected ? "#dcfce7" : "#ffffff",
                      cursor: "pointer",
                      fontWeight: isSelected ? 700 : 500,
                    }}
                  >
                    {value}
                  </button>
                );
              })}
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "0.8rem",
                color: "#6b7280",
                marginBottom: "1.25rem",
              }}
            >
              <span>0 = Très peu probable</span>
              <span>10 = Extrêmement probable</span>
            </div>

            <label
              htmlFor="comment"
              style={{ display: "block", fontSize: "0.9rem", marginBottom: "0.25rem" }}
            >
              Si vous le souhaitez, dites-nous en plus sur votre expérience :
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={1000}
              rows={4}
              style={{
                width: "100%",
                resize: "vertical",
                padding: "0.75rem",
                borderRadius: "0.75rem",
                border: "1px solid #cbd5f5",
                fontFamily: "inherit",
                fontSize: "0.9rem",
              }}
              placeholder="Qu'est-ce qui a bien fonctionné ? Que pourrions-nous améliorer ?"
            />

            {error && invitation && (
              <p
                style={{
                  marginTop: "0.75rem",
                  fontSize: "0.85rem",
                  color: "#b91c1c",
                }}
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              style={{
                marginTop: "1.25rem",
                padding: "0.75rem 1.5rem",
                borderRadius: "999px",
                border: "none",
                background: submitting ? "#a7f3d0" : "#22c55e",
                color: "#0f172a",
                fontWeight: 600,
                cursor: submitting ? "default" : "pointer",
              }}
            >
              {submitting ? "Envoi en cours…" : "Envoyer ma réponse"}
            </button>
          </form>

          <p
            style={{
              marginTop: "1rem",
              fontSize: "0.8rem",
              color: "#6b7280",
              lineHeight: 1.4,
            }}
          >
            Ce questionnaire est géré par NPS Me. Votre réponse sera utilisée pour
            améliorer l'expérience proposée.
          </p>
          <p className="envola-powered">
            Propulsé par{" "}
            <a href="https://www.npsme.com" target="_blank" rel="noreferrer">
              NPS Me
            </a>
          </p>
        </div>
      </div>
    </EnvolaLayout>
  );
}
