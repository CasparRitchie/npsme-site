// src/pages/DemoSurveyPage.jsx
import React from "react";
import Seo from "../components/Seo";
import DemoResultsPanel from "../components/DemoResultsPanel";

const STAGES = [
  "Overall NPS",
  "Discovery",
  "Ordering",
  "Delivery",
  "Installation & setup",
  "After-sales service",
  "Cease / leaving",
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function DemoSurveyPage() {
  // ----- Form state (send invitation) -----
  const [email, setEmail] = React.useState("");
  const [customerName, setCustomerName] = React.useState("");
  const [businessName, setBusinessName] = React.useState("");
  const [stage, setStage] = React.useState("Overall NPS");
  const [sending, setSending] = React.useState(false);
  const [sendError, setSendError] = React.useState("");
  const [sendSuccess, setSendSuccess] = React.useState("");

  const title = "NPS Demo Experience | NPS Me";
  const description =
    "See the full NPS Me demo: send yourself an invitation, experience the survey, and view live NPS results.";

  async function handleSendDemo(e) {
    e.preventDefault();
    setSendError("");
    setSendSuccess("");

    if (!email) {
      setSendError("Please enter an email address.");
      return;
    }

    try {
      setSending(true);

      const body = {
        email,
        customerId: "", // optional for now
        customerName: customerName || "",
        businessName: businessName || "",
        stage: stage || "",
        surveyId: "NPS-DEMO-1",
      };

      const res = await fetch("/api/send-invitation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to send invitation");
      }

      setSendSuccess(
        "Invitation sent. Check your inbox and follow the link to complete the survey."
      );
    } catch (err) {
      console.error("send demo error", err);
      setSendError(
        "We couldn’t send that invitation. Please check the details and try again."
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100">
      <Seo path="/demo-survey-page" title={title} description={description} />

      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-8 sm:py-12 space-y-10">
        {/* Page header */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-emerald-400 to-violet-500 flex items-center justify-center text-xs font-semibold">
              N
            </div>
            <div>
              <p className="text-xs tracking-widest text-slate-400 uppercase">
                Demo experience
              </p>
              <h1 className="text-2xl sm:text-3xl font-semibold text-slate-50">
                Try the full NPS Me survey flow
              </h1>
              <p className="mt-1 text-sm text-slate-400 max-w-xl">
                Send yourself a live invitation, answer the one-question NPS survey, and see the
                results update here in real time, including example CX visualisations.
              </p>
            </div>
          </div>
        </header>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.2fr)] items-start">
          {/* LEFT: Run the demo */}
          <section className="rounded-3xl border border-slate-800 bg-slate-950/60 p-5 sm:p-6 lg:p-7 shadow-xl shadow-black/40">
            <h2 className="text-lg font-semibold text-slate-50 mb-2">
              1. Send yourself a demo invitation
            </h2>
            <p className="text-sm text-slate-400 mb-4">
              Use this form to trigger the same email flow we’d use in a live programme. The link
              will take you to the customer-facing survey page.
            </p>

            <form onSubmit={handleSendDemo} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Contact name */}
                <div>
                  <label
                    htmlFor="demo-contact-name"
                    className="block text-xs font-medium text-slate-300 mb-1"
                  >
                    Contact name
                  </label>
                  <input
                    id="demo-contact-name"
                    name="contactName"
                    type="text"
                    autoComplete="name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full rounded-2xl border border-slate-800 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
                    placeholder="e.g. Alex Carter"
                  />
                </div>

                {/* Business name */}
                <div>
                  <label
                    htmlFor="demo-business-name"
                    className="block text-xs font-medium text-slate-300 mb-1"
                  >
                    Business name
                  </label>
                  <input
                    id="demo-business-name"
                    name="businessName"
                    type="text"
                    autoComplete="organization"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full rounded-2xl border border-slate-800 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
                    placeholder="e.g. Example Ltd"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="demo-email"
                  className="block text-xs font-medium text-slate-300 mb-1"
                >
                  Email address to send the demo to
                </label>
                <input
                  id="demo-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl border border-slate-800 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
                  placeholder="you@example.com"
                  required
                />
              </div>

              {/* Stage */}
              <div>
                <label
                  htmlFor="demo-stage"
                  className="block text-xs font-medium text-slate-300 mb-1"
                >
                  Journey stage (for this question)
                </label>
                <select
                  id="demo-stage"
                  name="stage"
                  value={stage}
                  onChange={(e) => setStage(e.target.value)}
                  className="w-full rounded-2xl border border-slate-800 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
                >
                  {STAGES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-[11px] text-slate-500">
                  Choose{" "}
                  <span className="font-medium text-slate-300">Overall NPS</span> for a general
                  question, or tag it to a specific journey stage (e.g. delivery, after-sales).
                </p>
              </div>

              {sendError && (
                <div className="rounded-2xl border border-rose-500/70 bg-rose-950/50 px-3 py-2 text-xs text-rose-100">
                  {sendError}
                </div>
              )}

              {sendSuccess && (
                <div className="rounded-2xl border border-emerald-500/70 bg-emerald-950/40 px-3 py-2 text-xs text-emerald-100">
                  {sendSuccess}
                </div>
              )}

              <div className="flex items-center justify-between pt-2 gap-3">
                <button
                  type="submit"
                  disabled={sending}
                  className={classNames(
                    "inline-flex items-center justify-center rounded-full px-4 py-2.5 text-sm font-semibold shadow-lg shadow-emerald-500/30",
                    sending
                      ? "bg-emerald-500/60 cursor-not-allowed"
                      : "bg-emerald-400 text-slate-950 hover:bg-emerald-300"
                  )}
                >
                  {sending ? "Sending…" : "Run demo"}
                </button>
                <p className="text-[11px] text-slate-500 max-w-xs text-right">
                  Step 2: open the email, follow the link, and submit your score and comment. Then
                  refresh the results on the right.
                </p>
              </div>
            </form>
          </section>

          {/* RIGHT: Live results + visualisations */}
          <section className="rounded-3xl border border-slate-800 bg-slate-950/40 p-5 sm:p-6 lg:p-7">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-50">
                  2. See live NPS results from this demo
                </h2>
                <p className="text-xs text-slate-400">
                  Every time someone completes the demo survey, their response is logged and feeds
                  into these metrics and visualisations.
                </p>
              </div>
            </div>

            <DemoResultsPanel />
          </section>
        </div>
      </main>
    </div>
  );
}
