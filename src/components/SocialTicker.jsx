// src/components/SocialTicker.jsx
import { useState } from "react";

// Helper: clean markdown – remove links + bold markers
function cleanLLMText(text) {
  if (!text) return "";

  let cleaned = text;

  // Remove code fences if any remain
  cleaned = cleaned.replace(/```json|```/gi, "");

  // Turn escaped newlines into real spaces/newlines
  cleaned = cleaned.replace(/\\n/g, "\n");

  // [label](url) -> label
  cleaned = cleaned.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");

  // **bold** -> bold
  cleaned = cleaned.replace(/\*\*(.*?)\*\*/g, "$1");

  return cleaned.trim();
}

// Helper: pull out a high-level sentence + bullets for pros/cons
function parseSummary(raw) {
  const cleaned = cleanLLMText(raw);

  const delightersLabel = "CX Delighters:";
  const redFlagsLabel = "CX Red Flags:";

  const delightersIndex = cleaned.indexOf(delightersLabel);
  const redFlagsIndex = cleaned.indexOf(redFlagsLabel);

  const extractBullets = (block) => {
    const lines = block.split("\n").map((l) => l.trim());
    return lines
      .filter((l) => l.startsWith("- "))
      .map((l) => l.slice(2).trim())
      .filter((item) => /[\p{L}\p{N}]/u.test(item));
  };

  let positives = [];
  let negatives = [];

  if (delightersIndex !== -1) {
    const start = delightersIndex + delightersLabel.length;
    const end = redFlagsIndex !== -1 ? redFlagsIndex : undefined;
    positives = extractBullets(cleaned.slice(start, end));
  }

  if (redFlagsIndex !== -1) {
    const start = redFlagsIndex + redFlagsLabel.length;
    negatives = extractBullets(cleaned.slice(start));
  }

  // High-level: take everything before "CX Delighters:" if present, else first line.
  const pre = delightersIndex !== -1 ? cleaned.slice(0, delightersIndex) : cleaned;
  const firstLine = pre.split("\n").map(s => s.trim()).find(Boolean) || cleaned;
  const highLevel = firstLine.slice(0, 260).trim();

  return { highLevel, positives, negatives, raw: cleaned };
}

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

  const parsed = result ? parseSummary(result.summary) : null;

  return (
    <section className="mt-16 rounded-3xl border border-white/10 bg-black/40 p-8 shadow-lg shadow-black/40">
      {/* Title + intro */}
      <div className="mb-6">
        <h2 className="text-2xl font-semixbold text-white flex items-center gap-2">
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
      {result && parsed && (
        <div className="mt-8 space-y-6">
          {/* Meta */}
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

          {/* High-level summary */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h3 className="text-sm font-semibold text-white mb-2">
              High-level CX snapshot
            </h3>
            <p className="text-sm leading-relaxed text-slate-200">
              {parsed.highLevel}
            </p>
          </div>

          {/* Pros & cons */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5">
              <h4 className="text-sm font-semibold text-emerald-300 mb-3 flex items-center gap-2">
                <span className="text-lg">✅</span>
                CX strengths / delighters
              </h4>
              {parsed.positives.length > 0 ? (
                <ul className="space-y-1 text-sm text-slate-200">
                  {parsed.positives.map((item, idx) => (
                    <li key={idx} className="flex gap-2">
                      <span className="mt-[2px] text-emerald-300">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-400">
                  No clear delighters extracted from this quick snapshot.
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-5">
              <h4 className="text-sm font-semibold text-red-300 mb-3 flex items-center gap-2">
                <span className="text-lg">❌</span>
                CX friction / red flags
              </h4>
              {parsed.negatives.length > 0 ? (
                <ul className="space-y-1 text-sm text-slate-200">
                  {parsed.negatives.map((item, idx) => (
                    <li key={idx} className="flex gap-2">
                      <span className="mt-[2px] text-red-300">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-400">
                  No clear friction points extracted from this quick snapshot.
                </p>
              )}
            </div>
          </div>

          {/* Competitive context – uses real backend data if available */}
          <div className="rounded-2xl border border-white/10 bg-[#0C1224] p-5">
            <h3 className="text-sm font-semibold text-white mb-2">
              Competitive context
            </h3>
            <p className="text-sm text-slate-300">
              {result.competitor_summary
                ? result.competitor_summary
                : `This lightweight snapshot focuses on ${result.company} only. In a full NPSme engagement, we benchmark your sentiment, themes and CX risks against key competitors in your space so you can see exactly where you're ahead, and where you're lagging behind.`}
            </p>
          </div>

          {/* NPSme upsell note */}
          <p className="text-xs italic text-slate-500">
            If you were signed up with NPSme, this snapshot would be supported
            with detailed source breakdowns, channel-level views, and direct
            links to the underlying comments and posts so your teams can quickly
            dig deeper and act on what we surface here.
          </p>
        </div>
      )}
    </section>
  );
}
