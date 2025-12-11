// LiveInvitationSurvey.jsx
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

function useQuery() {
  const { search } = useLocation();
  return React.useMemo(() => new URLSearchParams(search), [search]);
}

export default function LiveInvitationSurvey() {
  const query = useQuery();
  const navigate = useNavigate();

  const [loading, setLoading] = React.useState(true);
  const [invitation, setInvitation] = React.useState(null);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const inv = query.get("inv");

    if (!inv) {
      setError("Lien d'invitation invalide.");
      setLoading(false);
      return;
    }

    const fetchInvitation = async () => {
      try {
        const res = await fetch(
          `/api/live-survey/lookup?inv=${encodeURIComponent(inv)}`
        );

        if (res.status === 404) {
          setError(
            "Cette invitation n'existe pas ou a expiré. Merci de contacter votre interlocuteur."
          );
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
            "Impossible de vérifier votre lien pour le moment. Merci de réessayer plus tard."
          );
          setLoading(false);
          return;
        }

        const data = await res.json();
        setInvitation(data.invitation);
        setLoading(false);
      } catch (err) {
        console.error("[LiveInvitationSurvey] lookup error", err);
        setError(
          "Une erreur réseau s'est produite. Merci de réessayer dans quelques instants."
        );
        setLoading(false);
      }
    };

    fetchInvitation();
  }, [query]);

  if (loading) {
    return (
      <div className="survey-page envola-theme">
        <div className="survey-card envola-card">
          <div className="envola-brand-bar">
            {/* replace this with a real logo img later if you like */}
            <span className="envola-logo-text">Envola</span>
            <span className="envola-badge">Questionnaire de satisfaction</span>
          </div>
          <p>Chargement du questionnaire…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="survey-page envola-theme">
        <div className="survey-card envola-card">
          <div className="envola-brand-bar">
            {/* replace this with a real logo img later if you like */}
            <span className="envola-logo-text">Envola</span>
            <span className="envola-badge">Questionnaire de satisfaction</span>
          </div>
          <h1>Oups…</h1>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!invitation) {
    return (
      <div className="survey-page envola-theme">
        <div className="survey-card envola-card">
          <div className="envola-brand-bar">
            {/* replace this with a real logo img later if you like */}
            <span className="envola-logo-text">Envola</span>
            <span className="envola-badge">Questionnaire de satisfaction</span>
          </div>
          <h1>Oups…</h1>
          <p>
            Une erreur inattendue s'est produite. Merci de réessayer plus tard.
          </p>
        </div>
      </div>
    );
  }

  const displayName =
    invitation.customerName || invitation.email || "cher client";

  const handleStart = () => {
    navigate(`/live-survey-page?inv=${encodeURIComponent(invitation.invitationId)}`);
  };

  return (
    <div className="survey-page envola-theme">
      <div className="survey-card envola-card">
        <div className="envola-brand-bar">
            {/* replace this with a real logo img later if you like */}
            <span className="envola-logo-text">Envola</span>
            <span className="envola-badge">Questionnaire de satisfaction</span>
          </div>
        <h1>Votre avis compte beaucoup pour nous</h1>
        <p style={{ marginTop: "1rem" }}>
          Bonjour {displayName},
          <br />
          <br />
          Ce court questionnaire (1–2 minutes) nous permet de mieux comprendre
          votre expérience et d'améliorer nos services.
        </p>

        {invitation.typeOfDevice && (
          <p style={{ marginTop: "0.75rem", fontSize: "0.9rem", opacity: 0.85 }}>
            Type d'appareil : <strong>{invitation.typeOfDevice}</strong>
          </p>
        )}

        {invitation.assistanceMaternelle && (
          <p style={{ marginTop: "0.25rem", fontSize: "0.9rem", opacity: 0.85 }}>
            Assistance maternelle :{" "}
            <strong>{invitation.assistanceMaternelle}</strong>
          </p>
        )}

        <button
          type="button"
          onClick={handleStart}
          style={{
            marginTop: "1.5rem",
            padding: "0.75rem 1.5rem",
            borderRadius: "999px",
            border: "none",
            background: "#22c55e",
            color: "#0f172a",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Commencer le questionnaire
        </button>

        <p
          style={{
            marginTop: "1rem",
            fontSize: "0.8rem",
            color: "#6b7280",
            lineHeight: 1.4,
          }}
        >
          Votre réponse est confidentielle et ne sera utilisée que pour améliorer
          l'expérience proposée.
        </p>
      </div>
    </div>
  );
}
