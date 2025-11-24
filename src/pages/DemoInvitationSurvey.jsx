// src/pages/DemoInvitationSurvey.jsx
import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Seo from "../components/Seo";
import PageHeader from "../components/PageHeader";


function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const npsScale = Array.from({ length: 11 }, (_, i) => i); // 0-10

export default function DemoInvitationSurvey() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [lookupError, setLookupError] = useState("");
  const [invitation, setInvitation] = useState(null);

  const [score, setScore] = useState(null);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const inv = searchParams.get("inv");

  useEffect(() => {
    async function fetchInvitation() {
      if (!inv) {
        setLookupError("This survey link is missing its reference. Please check the URL from your email.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setLookupError("");

        const res = await fetch(`/api/demo-survey/lookup?inv=${encodeURIComponent(inv)}`);
        const data = await res.json();

        if (!res.ok || !data.ok) {
          if (res.status === 404) {
            setLookupError("We couldn’t find this invitation. It may have expired or the link may be incorrect.");
          } else if (res.status === 409) {
            setLookupError("This invitation has already been used. Thank you for your feedback!");
          } else {
            setLookupError(data.error || "Something went wrong loading your survey.");
          }
          setLoading(false);
          return;
        }

        setInvitation(data.invitation);
        setLoading(false);
      } catch (err) {
        console.error("Lookup error", err);
        setLookupError("We couldn’t load your survey. Please try again in a few minutes.");
        setLoading(false);
      }
    }

    fetchInvitation();
  }, [inv]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitError("");

    if (score === null) {
      setSubmitError("Please choose a score from 0 to 10.");
      return;
    }

    try {
      setSubmitting(true);

      const res = await fetch("/api/demo-survey/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invitationId: invitation.invitationId,
          score,
          comment: comment.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        if (res.status === 409) {
          setSubmitError("This invitation has already been used. Thank you for your feedback!");
        } else {
          setSubmitError(data.error || "We couldn’t save your response. Please try again.");
        }
        setSubmitting(false);
        return;
      }

      // Success → go to Thank You page
      navigate("/demo-survey/thanks", {
        state: {
          name: invitation.customerName || "",
          stage: invitation.stage || "",
          businessName: invitation.businessName || "",
        },
      });
    } catch (err) {
      console.error("Submit error", err);
      setSubmitError("We couldn’t save your response. Please try again.");
      setSubmitting(false);
    }
  }

  const pageTitle = "NPS Demo Survey | NPS Me";
  const description =
    "Try the NPS Me demo survey experience and see how a simple, well-designed NPS flow feels from a customer’s point of view.";

  return (
    <>
      <Seo
        path="/demo-invitation-survey"
        title={pageTitle}
        description={description}
      />

      <div className="min-h-screen bg-[#020617] text-slate-100 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-2xl bg-[#020617]/60 border border-slate-800 rounded-3xl shadow-xl shadow-black/40 p-6 sm:p-8">
          {/* Brand header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-emerald-400 to-violet-500 flex items-center justify-center text-xs font-semibold">
                N
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-100">NPS Me</p>
                <p className="text-xs text-slate-400">Customer feedback demo</p>
              </div>
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="py-12 text-center">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent mb-3" />
              <p className="text-sm text-slate-300">Loading your survey…</p>
            </div>
          ) : lookupError ? (
            <div className="py-8">
              <h1 className="text-xl font-semibold text-slate-100 mb-2">
                We couldn’t open this survey
              </h1>
              <p className="text-sm text-slate-300 mb-6">{lookupError}</p>
              <p className="text-xs text-slate-500">
                If you believe this is an error, you can contact the team who sent you the survey and
                share this message.
              </p>
            </div>
          ) : (
            invitation && (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Intro */}
                <div>
                  <h1 className="text-2xl font-semibold text-slate-50 mb-1">
                    Just one question about your experience
                  </h1>
                  <p className="text-sm text-slate-300 mb-3">
                    This is the same NPS flow we use with clients — simple, quick, and focused.
                  </p>

                  {/* Context about who / what */}
                  <div className="text-xs text-slate-400 rounded-2xl border border-slate-800 bg-slate-900/40 px-3 py-2 inline-flex flex-col gap-0.5">
                    {invitation.customerName && (
                      <span>
                        For: <span className="font-medium text-slate-200">{invitation.customerName}</span>
                      </span>
                    )}
                    {invitation.businessName && (
                      <span>
                        Business:{" "}
                        <span className="font-medium text-slate-200">
                          {invitation.businessName}
                        </span>
                      </span>
                    )}
                    {invitation.stage && (
                      <span>
                        Stage:{" "}
                        <span className="font-medium text-slate-200">
                          {invitation.stage}
                        </span>
                      </span>
                    )}
                  </div>
                </div>

                {/* NPS question */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-slate-100">
                    How likely are you to recommend us to a friend or colleague?
                  </label>
                  <p className="text-xs text-slate-400">
                    0 = Not at all likely, 10 = Extremely likely
                  </p>

                  <div className="mt-2 grid grid-cols-11 gap-1.5 sm:gap-2">
                    {npsScale.map((value) => {
                      const isSelected = score === value;
                      const isDetractor = value <= 6;
                      const isPassive = value === 7 || value === 8;
                      const isPromoter = value >= 9;

                      let tone =
                        "bg-slate-900/60 border-slate-700 text-slate-200 hover:border-slate-500";
                      if (isSelected) {
                        if (isDetractor) {
                          tone = "bg-rose-500/90 border-rose-400 text-slate-950";
                        } else if (isPassive) {
                          tone = "bg-amber-400/90 border-amber-300 text-slate-950";
                        } else if (isPromoter) {
                          tone = "bg-emerald-400/90 border-emerald-300 text-slate-950";
                        }
                      }

                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setScore(value)}
                          className={classNames(
                            "h-10 rounded-2xl border text-xs sm:text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950",
                            tone
                          )}
                        >
                          {value}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Comment box */}
                <div className="space-y-2">
                  <label
                    htmlFor="comment"
                    className="block text-sm font-medium text-slate-100"
                  >
                    What’s the main reason for your score? <span className="text-slate-400">(optional)</span>
                  </label>
                  <textarea
                    id="comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                    maxLength={1000}
                    className="w-full rounded-2xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
                    placeholder="A short sentence or two is perfect."
                  />
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Optional, but very helpful.</span>
                    <span>{comment.length}/1000</span>
                  </div>
                </div>

                {/* Errors */}
                {submitError && (
                  <div className="rounded-2xl border border-rose-500/70 bg-rose-950/50 px-3 py-2 text-xs text-rose-100">
                    {submitError}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-2">
                  <p className="text-[11px] text-slate-500 max-w-xs">
                    Your response may be used in aggregate reporting, but not shared publicly with your name.
                  </p>
                  <button
                    type="submit"
                    disabled={submitting}
                    className={classNames(
                      "inline-flex items-center justify-center rounded-full px-4 py-2.5 text-sm font-semibold shadow-lg shadow-emerald-500/30",
                      submitting
                        ? "bg-emerald-500/60 cursor-not-allowed"
                        : "bg-emerald-400 text-slate-950 hover:bg-emerald-300"
                    )}
                  >
                    {submitting ? "Sending…" : "Submit feedback"}
                  </button>
                </div>
              </form>
            )
          )}
        </div>
      </div>
    </>
  );
}
