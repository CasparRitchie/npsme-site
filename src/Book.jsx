// src/Book.jsx
import React from "react";
import Seo from "./components/Seo";
import PageHeader from "./components/PageHeader";
import { useLocation } from "react-router-dom";
import { useLanguage } from "./i18n/LanguageContext";
import { translations } from "./i18n/translations";

const BOOK_TOPICS = {
  "cx-foundations": {
    key: "cxFoundations",
    fallbackTitle: "Book a CX Foundations discussion",
    fallbackSubtitle:
      "Share a bit about your current setup and NPS Me will explore how to put the right customer experience foundations in place.",
    fallbackPrefill:
      "We’d like to discuss CX Foundations, especially around ",
    fallbackSubject: "CX Foundations booking request (npsme.com)",
  },
  "cx-embedded": {
    key: "cxEmbedded",
    fallbackTitle: "Book a CX Embedded discussion",
    fallbackSubtitle:
      "Share a bit about your business and NPS Me will explore how customer experience could be embedded into team routines, ownership and continuous improvement.",
    fallbackPrefill:
      "We’d like to discuss CX Embedded, especially around ",
    fallbackSubject: "CX Embedded booking request (npsme.com)",
  },
  discovery: {
    key: "discovery",
    fallbackTitle: "Book a free discovery call",
    fallbackSubtitle:
      "Share a bit about your current CX and feedback setup and NPS Me will explore where support could help most - no obligation.",
    fallbackPrefill: "",
    fallbackSubject: "Discovery booking request (npsme.com)",
  },
};

export default function Book() {
  const location = useLocation();
  const { lang } = useLanguage();
  const tr = (p, f) => translations(lang, p, f);

  const params = new URLSearchParams(location.search);
  const topicParam = params.get("topic");
  const topicConfig = BOOK_TOPICS[topicParam] || BOOK_TOPICS.discovery;
  const initialContext =
    tr(`book.topics.${topicConfig.key}.prefill`, topicConfig.fallbackPrefill) || "";

  const [status, setStatus] = React.useState("idle");
  const [form, setForm] = React.useState({
    name: "",
    email: "",
    date: "",
    time: "",
    tz: Intl.DateTimeFormat().resolvedOptions().timeZone || "",
    context: initialContext,
    company: "",
  });

  React.useEffect(() => {
    setForm((f) => ({
      ...f,
      context:
        f.context && f.context.trim().length > 0
          ? f.context
          : tr(`book.topics.${topicConfig.key}.prefill`, topicConfig.fallbackPrefill),
    }));
  }, [lang, topicConfig.key]); // eslint-disable-line react-hooks/exhaustive-deps

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const disabled = status === "success";

  const onSubmit = async (e) => {
    e.preventDefault();
    if (form.company) return;
    setStatus("sending");

    try {
      const payload = {
        _subject: tr(
          `book.topics.${topicConfig.key}.subject`,
          topicConfig.fallbackSubject
        ),
        _source: "booking-page",
        booking_topic: topicConfig.key,
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
        path={location.pathname + location.search}
        title={tr("book.seo.title", "Book a discussion | NPS Me")}
        description={tr(
          "book.seo.description",
          "Book a discussion with NPS Me about CX Foundations, CX Embedded or a general discovery conversation."
        )}
      />

      <PageHeader
        iconLabel={tr("book.header.iconLabel", "Discussion")}
        tag={tr("book.header.tag", "NPS Me / Book")}
        title={tr(`book.topics.${topicConfig.key}.title`, topicConfig.fallbackTitle)}
        subtitle={tr(
          `book.topics.${topicConfig.key}.subtitle`,
          topicConfig.fallbackSubtitle
        )}
      />

      <section className="mx-auto max-w-3xl px-6 pt-14 pb-20">
        <form
          onSubmit={onSubmit}
          className={`mt-8 grid gap-4 text-left transition ${
            disabled ? "opacity-60 pointer-events-none" : ""
          }`}
          aria-disabled={disabled}
        >
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
              placeholder={tr("book.form.name", "Your name")}
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              className="rounded-2xl bg-black/30 border border-white/10 p-3 text-sm text-slate-100 placeholder-slate-400"
              disabled={disabled}
            />
            <input
              required
              type="email"
              placeholder={tr("book.form.email", "Your email")}
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
              placeholder={tr("book.form.timezone", "Time zone (e.g., Europe/Paris)")}
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
            placeholder={tr(
              "book.form.context",
              "What would you like to focus on?"
            )}
            value={form.context}
            onChange={(e) => update("context", e.target.value)}
            className="rounded-2xl bg-black/30 border border-white/10 p-3 text-sm text-slate-100 placeholder-slate-400"
            disabled={disabled}
          />

          <button
            disabled={status === "sending" || disabled}
            className="rounded-2xl px-5 py-3 text-sm font-semibold bg-[#7C3AED] hover:bg-[#6D28D9] transition disabled:opacity-60"
          >
            {status === "sending"
              ? tr("book.form.sending", "Sending…")
              : tr("book.form.submit", "Request booking")}
          </button>

          {status === "success" && (
            <p className="mt-2 text-sm text-[#22C55E]">
              {tr(
                "book.form.success",
                "Thanks! NPS Me will confirm shortly and send a calendar invite."
              )}
            </p>
          )}

          {status === "error" && (
            <p className="mt-2 text-sm text-red-400">
              {tr("book.form.errorPrefix", "Sorry-something went wrong. Please email")}{" "}
              <a href="mailto:hello@npsme.com" className="underline">
                hello@npsme.com
              </a>
              .
            </p>
          )}
        </form>
      </section>
    </div>
  );
}
