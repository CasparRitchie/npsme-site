// src/pages/DemoSurveyPage.jsx
import React from "react";
import { useSearchParams } from "react-router-dom";
import Seo from "../components/Seo";

export default function DemoSurveyPage() {
  const [searchParams] = useSearchParams();
  const invitationId = searchParams.get("inv");

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [invitation, setInvitation] = React.useState(null);

  const [score, setScore] = React.useState(null);
  const [comment, setComment] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);

  React.useEffect(() => {
    if (!invitationId) {
      setError("This survey link is missing its reference. Please check the URL or request a new link.");
      setLoading(false);
      return;
    }

    async function load() {
      try {
        const res = await fetch(`/api/demo-survey/lookup?inv=${encodeURIComponent(invitationId)}`);
        if (!res.ok) {
          if (res.status === 404) {
            setError("This survey link is no longer valid. It may have expired, or you may already have responded.");
          } else if (res.status === 409) {
            setError("It looks like you have already responded to this survey. Thank you again for your feedback.");
          } else {
            setError("We could not load this survey. Please try again later.");
          }
          setLoading(false);
          return;
        }
        const data = await res.json();
        setInvitation(data.invitation || null);
        setLoading(false);
      } catch (err) {
        console.error("lookup error", err);
        setError("We could not load this survey. Please try again later.");
        setLoading(false);
      }
    }

    load();
  }, [invitationId]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (score == null) return;
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/demo-survey/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invitationId,
          score: Number(score),
          comment: comment.trim(),
        }),
      });

      if (!res.ok) {
        if (res.status === 409) {
          setError("It looks like you have already responded to this survey. Thank you again for your feedback.");
        } else {
          setError("We could not save your response. Please try again in a few minutes.");
        }
        setSubmitting(false);
        return;
      }

      setSubmitted(true);
      setSubmitting(false);
    } catch (err) {
      console.error("submit error", err);
      setError("Something went wrong while sending your response. Please try again.");
      setSubmitting(false);
    }
  }

  const stageLabel = invitation?.stage
    ? invitation.stage[0].toUpperCase() + invitation.stage.slice(1)
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B0F19] via-[#0C1224] to-[#0B0F19] text-slate-200">
      <Seo
        path="/demo-survey"
        title="NPS Me Demo Survey"
        description="Try a short NPS-style survey and see how NPS Me links invitations, responses, and insight together."
      />

      <main className="mx-auto flex min-h-screen max-w-3xl flex-col px-6 py-10">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#22C55E]" />
          <div>
            <p className="text-xs tracking-widest text-slate-400 uppercase">Demo survey</p>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-white">
              Quick feedback on your experience
            </h1>
          </div>
        </div>

        {/* Card */}
        <div className="mb-10 rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8 shadow-xl">
          {loading && (
            <p className="text-sm text-slate-300">Loading your survey link...</p>
          )}

          {!loading && error && (
            <div className="rounded-2xl border border-red-500/40 bg-red-900/20 p-4 text-sm text-red-100">
              {error}
            </div>
          )}

          {!loading && !error && !submitted && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Intro */}
              <div className="space-y-1">
                {invitation?.customerName && (
                  <p className="text-sm text-slate-200">
                    Hi <span className="font-medium">{invitation.customerName}</span>,
                  </p>
                )}
                <p className="text-sm text-slate-300">
                  This is a short, one question survey from NPS Me. It should take around 1–2 minutes.
                </p>
                {stageLabel && (
                  <p className="text-xs text-slate-400">
                    This question is about: <span className="text-slate-200">{stageLabel}</span>.
                  </p>
                )}
              </div>

              {/* NPS question */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-slate-100">
                  Overall, how likely are you to recommend us to a friend or colleague?
                </label>
                <p className="text-xs text-slate-400">
                  0 = Not at all likely, 10 = Extremely likely.
                </p>

                <div className="mt-2 grid grid-cols-11 gap-2 text-center text-xs">
                  {Array.from({ length: 11 }, (_, i) => i).map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setScore(n)}
                      className={[
                        "flex h-9 items-center justify-center rounded-xl border text-sm transition",
                        score === n
                          ? n <= 6
                            ? "border-red-500 bg-red-900/40 text-red-50"
                            : n <= 8
                            ? "border-amber-400 bg-amber-900/30 text-amber-50"
                            : "border-[#22C55E] bg-emerald-900/40 text-emerald-50"
                          : "border-white/10 bg-black/20 text-slate-200 hover:bg-black/40",
                      ].join(" ")}
                    >
                      {n}
                    </button>
                  ))}
                </div>

                {/* Labels */}
                <div className="mt-1 flex justify-between text-[11px] text-slate-400">
                  <span>Detractor (0–6)</span>
                  <span>Passive (7–8)</span>
                  <span>Promoter (9–10)</span>
                </div>
              </div>

              {/* Comment */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-100">
                  What is the main reason for your score?
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  className="w-full rounded-2xl bg-black/40 border border-white/10 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/60"
                  placeholder="Anything that worked well, and anything that could be better..."
                  maxLength={1000}
                />
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Optional but very helpful.</span>
                  <span>{comment.length}/1000</span>
                </div>
              </div>

              {/* Submit */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="submit"
                  disabled={score == null || submitting}
                  className={[
                    "inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold",
                    score == null || submitting
                      ? "bg-slate-600 text-slate-300 cursor-not-allowed"
                      : "bg-[#22C55E] text-slate-950 hover:bg-emerald-400",
                  ].join(" ")}
                >
                  {submitting ? "Sending..." : "Submit feedback"}
                </button>
                <p className="text-[11px] text-slate-500 max-w-xs text-right">
                  Your response will be used anonymously in aggregate analysis unless we agree otherwise with you.
                </p>
              </div>
            </form>
          )}

          {!loading && !error && submitted && (
            <div className="space-y-3">
              <h2 className="text-xl font-semibold text-white">Thank you for your feedback</h2>
              <p className="text-sm text-slate-300">
                Your response has been recorded. In our client work, this data would be combined with other responses,
                linked back to the original invitation, and fed into dashboards and alerting.
              </p>
              <p className="text-xs text-slate-500">
                If you want to see how this works for your business, we can walk through a live example with your own data.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
