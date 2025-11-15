import { useState } from "react";

export default function SocialTicker() {
  const [company, setCompany] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = company.trim();
    if (!trimmed) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch(
        `/api/social-summary?company=${encodeURIComponent(trimmed)}`
      );
      if (!res.ok) {
        let message = `Request failed with status ${res.status}`;
        try {
          const text = await res.text();
          if (text) message = text;
        } catch (_) {}
        throw new Error(message);
      }
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error("Social ticker error:", err);
      setError("Sorry, something went wrong while fetching the summary.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="social-ticker">
      <h2 className="social-ticker__title">Social Listening Snapshot</h2>
      <p className="social-ticker__subtitle">
        Enter a company name to generate a quick CX-focused summary of what
        people are saying.
      </p>

      <form className="social-ticker__form" onSubmit={handleSubmit}>
        <input
          type="text"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="e.g. Tiney, Monzo, Pret a Manger"
          className="social-ticker__input"
        />
        <button
          type="submit"
          className="social-ticker__button"
          disabled={loading || !company.trim()}
        >
          {loading ? "Analysing…" : "Analyse"}
        </button>
      </form>

      {error && <p className="social-ticker__error">{error}</p>}

      {result && (
        <div className="social-ticker__result">
          <div className="social-ticker__meta">
            <span className="social-ticker__company">
              Company: <strong>{result.company}</strong>
            </span>
            <span className="social-ticker__timestamp">
              Generated at:{" "}
              {new Date(result.generated_at).toLocaleString()}
            </span>
          </div>
          <p className="social-ticker__summary">{result.summary}</p>
        </div>
      )}
    </section>
  );
}
