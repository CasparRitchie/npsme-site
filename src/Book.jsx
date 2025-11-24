// src/Book.jsx
import React from "react";
import Seo from "./components/Seo";
import PageHeader from "./components/PageHeader";


export default function Book() {
  const [status, setStatus] = React.useState("idle"); // idle | sending | success | error
  const [form, setForm] = React.useState({
    name: "",
    email: "",
    date: "",
    time: "",
    tz: Intl.DateTimeFormat().resolvedOptions().timeZone || "",
    context: "",
    company: "" // honeypot
  });
  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const disabled = status === "success";

  const onSubmit = async (e) => {
    e.preventDefault();
    if (form.company) return; // bot trap
    setStatus("sending");
    try {
      const payload = {
        _subject: "Discovery booking request (npsme.com)",
        _source: "booking-page",
        name: form.name,
        email: form.email,
        preferred_date: form.date,
        preferred_time: form.time,
        timezone: form.tz,
        context: form.context,
      };
      const res = await fetch("https://formspree.io/f/mwprrzro", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });
      setStatus(res.ok ? "success" : "error");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B0F19] via-[#0C1224] to-[#0B0F19] text-slate-200">
      <Seo
        path="/book"
        title="Book a discovery session | NPS Me"
        description="Pick a time that works for you and we’ll confirm a 30-minute discovery call to discuss CX and NPS improvement."
      />
      <PageHeader
        iconLabel="Discovery call"
        tag="NPS Me / Book"
        title="Book a free discovery call"
        subtitle="Share a bit about your current CX and NPS setup and we’ll explore where we can help - no obligation."
      />

      <section className="mx-auto max-w-3xl px-6 pt-14 pb-20">
        <form
          onSubmit={onSubmit}
          className={`mt-8 grid gap-4 text-left transition ${disabled ? "opacity-60 pointer-events-none" : ""}`}
          aria-disabled={disabled}
        >
          {/* Honeypot */}
          <input
            tabIndex="-1"
            autoComplete="off"
            value={form.company}
            onChange={(e) => update("company", e.target.value)}
            className="hidden"
            placeholder="Company"
          />

          <div className="grid md:grid-cols-2 gap-4">
            <input
              required
              placeholder="Your name"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              className="rounded-2xl bg-black/30 border border-white/10 p-3 text-sm text-slate-100 placeholder-slate-400"
              disabled={disabled}
            />
            <input
              required
              type="email"
              placeholder="Your email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              className="rounded-2xl bg-black/30 border border-white/10 p-3 text-sm text-slate-100 placeholder-slate-400"
              disabled={disabled}
            />
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <input
              required
              type="date"
              value={form.date}
              onChange={(e) => update("date", e.target.value)}
              className="rounded-2xl bg-black/30 border border-white/10 p-3 text-sm text-slate-100"
              disabled={disabled}
            />
            <input
              required
              type="time"
              value={form.time}
              onChange={(e) => update("time", e.target.value)}
              className="rounded-2xl bg-black/30 border border-white/10 p-3 text-sm text-slate-100"
              disabled={disabled}
            />
            <input
              required
              placeholder="Time zone (e.g., Europe/Paris)"
              value={form.tz}
              onChange={(e) => update("tz", e.target.value)}
              className="rounded-2xl bg-black/30 border border-white/10 p-3 text-sm text-slate-100 placeholder-slate-400"
              disabled={disabled}
              list="tz-list"
            />
            <datalist id="tz-list">
              <option value="Europe/Paris" />
              <option value="Europe/London" />
              <option value="America/New_York" />
              <option value="America/Los_Angeles" />
              <option value="UTC" />
            </datalist>
          </div>

          <textarea
            required
            rows={5}
            placeholder="What would you like to focus on? (e.g., survey design, close-the-loop, onboarding friction, support response time, etc.)"
            value={form.context}
            onChange={(e) => update("context", e.target.value)}
            className="rounded-2xl bg-black/30 border border-white/10 p-3 text-sm text-slate-100 placeholder-slate-400"
            disabled={disabled}
          />

          <button
            disabled={status === "sending" || disabled}
            className="rounded-2xl px-5 py-3 text-sm font-semibold bg-[#7C3AED] hover:bg-[#6D28D9] transition disabled:opacity-60"
          >
            {status === "sending" ? "Sending…" : "Request booking"}
          </button>

          {status === "success" && (
            <p className="mt-2 text-sm text-[#22C55E]">
              Thanks! I’ll confirm shortly and send a calendar invite.
            </p>
          )}
          {status === "error" && (
            <p className="mt-2 text-sm text-red-400">
              Sorry—something went wrong. Please email <a href="mailto:hello@npsme.com" className="underline">hello@npsme.com</a>.
            </p>
          )}
        </form>
      </section>
    </div>
  );
}
