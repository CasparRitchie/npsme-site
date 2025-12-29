// src/ImpactPage.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import Seo from "./components/Seo";
import PageHeader from "./components/PageHeader";
import { useLanguage } from "./i18n/LanguageContext";
import { translations } from "./i18n/translations";
import { localizePath } from "./i18n/pathHelpers";

/**
 * Impact calculator (NPS Me)
 * - Computes monthly & annual gross profit impact from:
 *   1) Repeat-purchase lift
 *   2) Churn reduction
 *   3) Support cost savings
 * It is a simple directional tool to help you think about the upside of improving CX.
 */

export default function ImpactPage() {
  const location = useLocation();
  const { lang } = useLanguage();
  const tr = (p, f) => translations(lang, p, f);

  // --- Inputs (with sensible defaults you can tweak) ---
  const [currency, setCurrency] = React.useState("£");
  const [monthlyRevenue, setMonthlyRevenue] = React.useState(50000); // baseline monthly revenue
  const [grossMarginPct, setGrossMarginPct] = React.useState(55); // % gross margin
  const [avgOrderValue, setAvgOrderValue] = React.useState(75); // AOV
  const [repeatRateLiftPct, setRepeatRateLiftPct] = React.useState(6); // % lift in repeat rate (90 day)
  const [churnReductionPct, setChurnReductionPct] = React.useState(2); // % fewer lost customers / refunds
  const [ticketsPer1k, setTicketsPer1k] = React.useState(22); // support tickets per 1,000 orders (WISMO etc.)
  const [ticketReductionPct, setTicketReductionPct] = React.useState(25); // % fewer tickets after improvements
  const [costPerTicket, setCostPerTicket] = React.useState(3.8); // blended handling cost per ticket

  // --- Deriveds ---
  const ordersPerMonth = safeDivide(monthlyRevenue, avgOrderValue); // simple proxy
  const margin = pctToRatio(grossMarginPct);

  // Revenue effects (directional proxies)
  const repeatRevenueAdded = monthlyRevenue * pctToRatio(repeatRateLiftPct);
  const churnRevenueSaved = monthlyRevenue * pctToRatio(churnReductionPct);

  // Support savings
  const monthlyTickets = (ordersPerMonth / 1000) * ticketsPer1k;
  const ticketsAvoided = monthlyTickets * pctToRatio(ticketReductionPct);
  const supportSavings = ticketsAvoided * costPerTicket;

  // Gross profit impact (rev effects × margin + opex savings)
  const gpImpactMonthly = (repeatRevenueAdded + churnRevenueSaved) * margin + supportSavings;
  const gpImpactAnnual = gpImpactMonthly * 12;

  // Helpers
  const fmt = (n) =>
    `${currency}${Number(n).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

  const preset = (label) => {
    if (label === "Conservative") {
      setRepeatRateLiftPct(3);
      setChurnReductionPct(1);
      setTicketReductionPct(15);
    } else if (label === "Likely") {
      setRepeatRateLiftPct(6);
      setChurnReductionPct(2);
      setTicketReductionPct(25);
    } else if (label === "Stretch") {
      setRepeatRateLiftPct(10);
      setChurnReductionPct(3.5);
      setTicketReductionPct(35);
    }
  };

  const whyPath = localizePath("/why-nps-me", lang);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B0F19] via-[#0C1224] to-[#0B0F19] text-slate-200">
      <Seo
        path={location.pathname}
        lang={lang}
        title={tr(
          "impact.seoTitle",
          "CX Impact Calculator: Estimate NPS, churn and support savings | NPS Me"
        )}
        description={tr(
          "impact.seoDescription",
          "Simple calculator to estimate gross profit impact from repeat purchase lift, churn reduction, and support ticket savings when you improve customer experience."
        )}
      />

      <PageHeader
        iconLabel={tr("impact.header.iconLabel", "Impact calculator")}
        tag={tr("impact.header.tag", "NPS Me / Impact")}
        title={tr("impact.header.title", "Estimate your outcome in minutes")}
        subtitle={tr(
          "impact.header.subtitle",
          "A simple directional model to frame the upside of improving customer experience."
        )}
      />

      <section id="impact" className="mx-auto max-w-7xl px-6 pb-20 pt-10">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-10">
          {/* Intro text */}
          <p className="mt-1 text-slate-300 max-w-3xl">
            This calculator gives you a directional view of what better customer experience can be
            worth: more repeat purchases, fewer refunds and churn events, and lower support load.
            It is not a forecast. It is a way to frame the upside from fixing the friction your
            customers already tell you about.
          </p>
          <p className="mt-3 text-sm text-slate-300 max-w-3xl">
            In real engagements we validate these assumptions with your Finance and Operational
            teams, tie them to actual cohorts and journeys, and build dashboards so you can see the
            impact of each change over time. If you want help doing that,{" "}
            <Link
              to={whyPath}
              className="text-[#22C55E] hover:text-[#16A34A] underline underline-offset-2"
            >
              see why teams work with NPS Me
            </Link>
            .
          </p>

          {/* Presets */}
          <div className="mt-6 flex flex-wrap gap-3">
            {["Conservative", "Likely", "Stretch"].map((p) => (
              <button
                key={p}
                onClick={() => preset(p)}
                className="rounded-xl px-3 py-2 text-xs font-medium border border-white/10 bg-white/5 hover:bg-white/10"
              >
                {p} preset
              </button>
            ))}
            <div className="ml-auto flex items-center gap-2 text-sm text-slate-300">
              Currency:
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="rounded-lg bg-black/30 border border-white/10 px-2 py-1 text-sm"
              >
                <option>£</option>
                <option>$</option>
                <option>€</option>
              </select>
            </div>
          </div>

          {/* Inputs */}
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <Field
                label="Monthly revenue"
                value={monthlyRevenue}
                onChange={setMonthlyRevenue}
                prefix={currency}
              />
              <Field
                label="Gross margin (%)"
                value={grossMarginPct}
                onChange={setGrossMarginPct}
                min={0}
                max={100}
              />
              <Field
                label="Average order value"
                value={avgOrderValue}
                onChange={setAvgOrderValue}
                prefix={currency}
              />
              <div className="text-xs text-slate-400">
                Orders per month (derived):{" "}
                <span className="text-slate-300">
                  {Math.round(ordersPerMonth).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <Field
                label="Repeat purchase lift (%)"
                value={repeatRateLiftPct}
                onChange={setRepeatRateLiftPct}
                min={0}
                max={30}
              />
              <Field
                label="Churn / refunds reduction (%)"
                value={churnReductionPct}
                onChange={setChurnReductionPct}
                min={0}
                max={30}
              />
              <Field
                label="Tickets per 1,000 orders (baseline)"
                value={ticketsPer1k}
                onChange={setTicketsPer1k}
                min={0}
                step={1}
              />
              <Field
                label="Ticket reduction (%)"
                value={ticketReductionPct}
                onChange={setTicketReductionPct}
                min={0}
                max={80}
              />
              <Field
                label="Cost per ticket"
                value={costPerTicket}
                onChange={setCostPerTicket}
                prefix={currency}
                step={0.1}
              />
            </div>
          </div>

          {/* Results */}
          <div className="mt-8 grid gap-6 md:grid-cols-4">
            <Kpi
              label="Repeat revenue added (mo.)"
              value={fmt(repeatRevenueAdded)}
              note={`${repeatRateLiftPct}% of monthly revenue`}
            />
            <Kpi
              label="Churn revenue saved (mo.)"
              value={fmt(churnRevenueSaved)}
              note={`${churnReductionPct}% of monthly revenue`}
            />
            <Kpi
              label="Support savings (mo.)"
              value={fmt(supportSavings)}
              note={`${Math.round(ticketsAvoided)} tickets avoided`}
            />
            <Kpi
              label="Gross profit impact (mo.)"
              value={fmt(gpImpactMonthly)}
              highlight
              note={`Annual: ${fmt(gpImpactAnnual)}`}
            />
          </div>

          {/* Assumptions & disclaimer */}
          <div className="mt-8 rounded-2xl border border-white/10 bg-black/30 p-5 text-sm text-slate-300 space-y-2">
            <p className="text-white font-medium">How this works</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <span className="text-white">Repeat revenue added</span> is approximated as monthly
                revenue × repeat rate lift.
              </li>
              <li>
                <span className="text-white">Churn revenue saved</span> is approximated as monthly
                revenue × churn reduction.
              </li>
              <li>
                <span className="text-white">Support savings</span> is (orders × tickets per 1k ×
                reduction) × cost per ticket.
              </li>
              <li>
                <span className="text-white">Gross profit impact</span> is (added + saved) × gross
                margin plus support savings.
              </li>
            </ul>
            <p className="text-xs text-slate-400">
              This is a directional estimate for planning. Actuals depend on mix, seasonality,
              sampling, and experimentation. During an engagement we align assumptions with your
              Finance team, set up tracking, and adjust the model based on real data.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ---------- Small components ---------- */
function Field({ label, value, onChange, prefix, min, max, step = 1 }) {
  return (
    <label className="block">
      <span className="text-sm text-slate-300">{label}</span>
      <div className="mt-1 relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
            {prefix}
          </span>
        )}
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(numberOrZero(e.target.value))}
          min={min}
          max={max}
          step={step}
          className={`w-full rounded-2xl bg-black/30 border border-white/10 p-3 text-sm text-slate-100 placeholder-slate-400 ${
            prefix ? "pl-8" : ""
          }`}
        />
      </div>
    </label>
  );
}

function Kpi({ label, value, note, highlight = false }) {
  return (
    <div
      className={`rounded-2xl border border-white/10 p-5 ${
        highlight ? "bg-gradient-to-br from-[#141B2E] to-[#0F172A]" : "bg-black/20"
      }`}
    >
      <div className="text-xs uppercase tracking-wider text-slate-400">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-white">{value}</div>
      {note && <div className="mt-1 text-xs text-slate-400">{note}</div>}
    </div>
  );
}

/* ---------- Utils ---------- */
function pctToRatio(p) {
  return Number(p) / 100;
}
function safeDivide(a, b) {
  const x = Number(a);
  const y = Number(b);
  if (!isFinite(x) || !isFinite(y) || y === 0) return 0;
  return x / y;
}
function numberOrZero(v) {
  const n = Number(v);
  return isFinite(n) ? n : 0;
}
