// LiveInvitationSurvey.jsx
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import EnvolaLayout from "../components/EnvolaLayout";

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

  if (error) {
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

  if (!invitation) {
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
            <p>
              Une erreur inattendue s'est produite. Merci de réessayer plus tard.
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

    const displayName =
    invitation.customerName || invitation.email || "cher client";

  const handleStart = () => {
    navigate(
      `/live-survey-page?inv=${encodeURIComponent(invitation.invitationId)}`
    );
  };

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

        <p style={{ marginTop: "1rem" }}>
          Bonjour {displayName},
          <br />
          <br />
          Vous utilisez Envola depuis quelque temps maintenant, et votre retour
          compte énormément pour nous. Pourriez-vous prendre 2 à 3 minutes pour
          compléter notre enquête de satisfaction.
        </p>

        <p style={{ marginTop: "0.75rem" }}>Vos réponses nous permettront :</p>
        <ul style={{ marginTop: "0.5rem", paddingLeft: "1.25rem", lineHeight: 1.6 }}>
          <li>d’identifier ce qui fonctionne bien,</li>
          <li>de repérer ce qui peut encore être amélioré,</li>
          <li>et d’ajuster Envola au plus près de vos besoins.</li>
        </ul>

        {invitation.typeOfDevice && (
          <p style={{ marginTop: "0.9rem", fontSize: "0.9rem", opacity: 0.85 }}>
            Type d'appareil : <strong>{invitation.typeOfDevice}</strong>
          </p>
        )}

        {invitation.assistanteMaternelle && (
          <p style={{ marginTop: "0.25rem", fontSize: "0.9rem", opacity: 0.85 }}>
            Assistante maternelle : <strong>{invitation.assistanteMaternelle}</strong>
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
          👉 Accéder au questionnaire de satisfaction
        </button>

        <p
          style={{
            marginTop: "1rem",
            fontSize: "0.9rem",
            color: "#6b7280",
            lineHeight: 1.5,
          }}
        >
          Nous vous souhaitons une belle journée,
          <br />
          Nicholas &amp; Karin
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
