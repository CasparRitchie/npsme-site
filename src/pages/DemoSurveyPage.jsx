// src/pages/DemoSurveyPage.jsx
import React from "react";
import Seo from "../components/Seo";

const STAGES = [
  "Discovery",
  "Ordering",
  "Delivery",
  "Installation & Setup",
  "After Sales Service",
  "Cease process",
];

export default function DemoSurveyPage() {
  const [customerName, setCustomerName] = React.useState("");
  const [businessName, setBusinessName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [stage, setStage] = React.useState("Discovery");
  const [surveyId, setSurveyId] = React.useState("NPS-DEMO-1");

  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState("");
  const [successMessage, setSuccessMessage] = React.useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!email.trim()) {
      setError("Please enter an email address so we can send the survey link.");
      return;
    }

    try {
      setSubmitting(true);

      const res = await fetch("/api/send-invitation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          customerId: "", // optional for demo
          customerName: customerName.trim() || "",
          businessName: businessName.trim() || "",
          stage,
          surveyId,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        setError(data.error || "We couldn’t send the demo survey. Please try again.");
        setSubmitting(false);
        return;
      }

      setSuccessMessage(
        "Success! We’ve sent a demo survey invitation to your email address. Open it and click the link to see the full flow."
      );
      setSubmitting(false);
    } catch (err) {
      console.error("send-invitation error", err);
      setError("Something went wrong while sending the invitation. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B0F19] via-[#0C1224] to-[#0B0F19] text-slate-200">
      <Seo
        path="/demo-survey-page"
        title="Run the NPS Me demo survey"
        description="Set up a live demo NPS survey and experience the full email, survey, and thank-you flow."
      />

      <main className="mx-auto flex min-h-screen max-w-3xl flex-col px-6 py-10">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#22C55E]" />
          <div>
            <p className="text-xs tracking-widest text-slate-400 uppercase">Demo setup</p>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-white">
              Try the full NPS Me survey flow
            </h1>
          </div>
        </div>

        {/* Card */}
        <div className="mb-10 rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8 shadow-xl">
          <p className="text-sm text-slate-300 mb-4">
            Enter your details below and we’ll send you a live demo survey link by email.
            You’ll see the same flow your customers would experience: invitation → survey → thank you.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Customer name */}
            <div>
              <label className="block text-sm font-medium text-slate-100 mb-1">
                Contact name <span className="text-slate-400 text-xs">(optional)</span>
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full rounded-2xl bg-black/40 border border-white/10 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/60"
                placeholder="e.g. Caspar Ritchie"
              />
            </div>

            {/* Business name */}
            <div>
              <label className="block text-sm font-medium text-slate-100 mb-1">
                Business name <span className="text-slate-400 text-xs">(optional)</span>
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full rounded-2xl bg-black/40 border border-white/10 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/60"
                placeholder="e.g. NPS Me Ltd"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-100 mb-1">
                Email to send the demo survey to
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl bg-black/40 border border-white/10 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/60"
                placeholder="you@example.com"
                required
              />
            </div>

            {/* Stage */}
            <div>
              <label className="block text-sm font-medium text-slate-100 mb-1">
                Customer journey stage
              </label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value)}
                className="w-full rounded-2xl bg-black/40 border border-white/10 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/60"
              >
                {STAGES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-[11px] text-slate-500">
                These are the standard milestones we’d typically set up for a client.
              </p>
            </div>

            {/* Survey ID */}
            <div>
              <label className="block text-sm font-medium text-slate-100 mb-1">
                Survey ID <span className="text-slate-400 text-xs">(for tracking)</span>
              </label>
              <input
                type="text"
                value={surveyId}
                onChange={(e) => setSurveyId(e.target.value)}
                className="w-full max-w-xs rounded-2xl bg-black/40 border border-white/10 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/60"
              />
              <p className="mt-1 text-[11px] text-slate-500">
                For the demo we’ll default to <span className="font-mono">NPS-DEMO-1</span>.
              </p>
            </div>

            {/* Error / success */}
            {error && (
              <div className="rounded-2xl border border-red-500/40 bg-red-900/20 p-3 text-xs text-red-100">
                {error}
              </div>
            )}
            {successMessage && (
              <div className="rounded-2xl border border-emerald-400/40 bg-emerald-900/20 p-3 text-xs text-emerald-100">
                {successMessage}
              </div>
            )}

            {/* Submit */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className={[
                  "inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold",
                  submitting
                    ? "bg-slate-600 text-slate-300 cursor-not-allowed"
                    : "bg-[#22C55E] text-slate-950 hover:bg-emerald-400",
                ].join(" ")}
              >
                {submitting ? "Sending..." : "Send me the demo survey"}
              </button>
              <p className="text-[11px] text-slate-500 max-w-xs text-right">
                We’ll send a single email with your unique link. No spam, and no follow-up unless you ask for it.
              </p>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
