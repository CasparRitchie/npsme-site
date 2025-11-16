// src/components/SocialTicker.jsx
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
    <section className="mt-16 rounded-3xl border border-white/10 bg-black/40 p-8 shadow-lg shadow-black/40">
      {/* Title + intro */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-[#7C3AED] to-[#22C55E] text-xs font-bold uppercase tracking-wide">
            CX
          </span>
          <span>Social Listening Snapshot</span>
        </h2>
        <p className="mt-3 text-sm md:text-base text-slate-400 max-w-2xl">
          Enter a company name to generate a quick, CX-focused view of what
          people are saying across public channels right now.
        </p>
      </div>

      {/* Form */}
      <form
        className="flex flex-col gap-3 md:flex-row md:items-center"
        onSubmit={handleSubmit}
      >
        <input
          type="text"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="Enter company name here"
          className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent"
        />
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#22C55E] px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition"
          disabled={loading || !company.trim()}
        >
          {loading ? "Analysing…" : "Analyse"}
        </button>
      </form>

      {/* Error */}
      {error && (
        <p className="mt-3 text-sm text-red-400">
          {error}
        </p>
      )}

      {/* Result */}
      {result && (
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5 space-y-3">
          <div className="flex flex-col gap-1 text-xs text-slate-400 md:flex-row md:items-center md:justify-between">
            <span>
              Company:{" "}
              <span className="font-medium text-slate-200">
                {result.company}
              </span>
            </span>
            <span className="opacity-80">
              Generated at:{" "}
              {new Date(result.generated_at).toLocaleString()}
            </span>
          </div>
          <p className="text-sm leading-relaxed text-slate-200">
            {result.summary}
          </p>
        </div>
      )}
    </section>
  );
}
