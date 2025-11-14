// src/pages/DemoSurvey.jsx
import React from "react";
import { useSearchParams } from "react-router-dom";
import Seo from "../components/Seo";

export default function DemoSurvey() {
  const [searchParams] = useSearchParams();
  const invitationId = searchParams.get("inv") || "";

  const [score, setScore] = React.useState(null);
  const [hoverScore, setHoverScore] = React.useState(null);
  const [comment, setComment] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [error, setError] = React.useState("");

  const displayScore = hoverScore != null ? hoverScore : score;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (score == null) {
      setError("Please select a score from 0 to 10.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/demo/response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          score: Number(score),
          comment: comment.trim(),
          invitationId: invitationId || null,
        }),
      });

      if (!res.ok) {
        throw new Error("Server returned an error");
      }

      const data = await res.json();
      if (!data || data.error) {
        throw new Error(data.error || "Unknown error");
      }

      setSubmitted(true);
    } catch (err) {
      console.error("Submit error", err);
      setError("Sorry, something went wrong while saving your feedback. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0B0F19] via-[#020617] to-[#020617] text-slate-100">
        <Seo
          path="/demo-survey"
          title="Thank you for your feedback | NPS Me"
          description="Thanks for taking a moment to share your feedback."
        />
        <main className="mx-auto max-w-2xl px-6 py-16">
          <div className="rounded-3xl border border-white/10 bg-black/40 p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#22C55E]" />
              <p className="text-xs tracking-widest text-slate-400 uppercase">Thank you</p>
            </div>
            <h1 className="text-2xl md:text-3xl font-semibold text-white">
              Thanks for sharing your feedback
            </h1>
            <p className="mt-4 text-slate-300">
              Your response has been recorded. Feedback like yours helps us understand what is
              working well and where to improve.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B0F19] via-[#020617] to-[#020617] text-slate-100">
      <Seo
        path="/demo-survey-legacy"
        title="Demo NPS Survey | NPS Me"
        description="Try a simple NPS-style survey flow from the customer point of view."
      />

      <main className="mx-auto max-w-3xl px-6 py-10 md:py-16">
        <div className="rounded-3xl border border-white/10 bg-black/40 p-6 md:p-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-3">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#22C55E]" />
            <p className="text-xs tracking-widest text-slate-400 uppercase">
              Demo survey
            </p>
          </div>
          <h1 className="text-2xl md:text-3xl font-semibold text-white">
            How likely are you to recommend us?
          </h1>
          <p className="mt-3 text-slate-300 max-w-2xl">
            On a scale from 0 to 10, where 0 means &ldquo;not at all likely&rdquo; and 10 means
            &ldquo;extremely likely&rdquo;, how likely are you to recommend us to a friend or colleague?
          </p>

          {/* NPS scale */}
          <form onSubmit={handleSubmit} className="mt-8 space-y-8">
            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-2">
                <span>Not at all likely</span>
                <span>Extremely likely</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {Array.from({ length: 11 }).map((_, n) => {
                  const isSelected = score === n;
                  const isDetractor = n <= 6;
                  const isPassive = n === 7 || n === 8;
                  const isPromoter = n >= 9;

                  let base =
                    "w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium border transition";
                  let color = "border-slate-600 bg-slate-900 text-slate-200";

                  if (isDetractor) {
                    color = "border-red-900 bg-red-950 text-red-100";
                  }
                  if (isPassive) {
                    color = "border-amber-700 bg-amber-900/70 text-amber-100";
                  }
                  if (isPromoter) {
                    color = "border-emerald-500 bg-emerald-600 text-emerald-50";
                  }
                  if (isSelected) {
                    color =
                      "border-white bg-white text-slate-900 shadow-lg shadow-emerald-500/30";
                  }

                  return (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setScore(n)}
                      onMouseEnter={() => setHoverScore(n)}
                      onMouseLeave={() => setHoverScore(null)}
                      className={`${base} ${color}`}
                    >
                      {n}
                    </button>
                  );
                })}
              </div>
              {displayScore != null && (
                <p className="mt-2 text-xs text-slate-400">
                  Selected score: <span className="text-slate-100 font-semibold">{displayScore}</span>
                </p>
              )}
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm text-slate-200 mb-1">
                What is the main reason for your score?
                <span className="text-slate-500 text-xs ml-1">(optional)</span>
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                placeholder="A quick sentence or two is perfect."
                className="w-full rounded-2xl bg-black/40 border border-white/10 p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/80"
              />
            </div>

            {/* Hidden info for future use */}
            {invitationId && (
              <p className="text-[11px] text-slate-500">
                Reference: <span className="font-mono">{invitationId}</span>
              </p>
            )}

            {/* Error */}
            {error && (
              <p className="text-sm text-red-400 bg-red-950/40 border border-red-900 rounded-xl px-3 py-2">
                {error}
              </p>
            )}

            {/* Submit */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? "Submitting..." : "Submit feedback"}
              </button>
              <p className="text-xs text-slate-500">
                This demo survey is for illustration only. Your answers are not tied to any real order.
              </p>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
