// src/pages/DemoThankYou.jsx
import React from "react";
import { useLocation, Link } from "react-router-dom";
import Seo from "../components/Seo";

export default function DemoThankYou() {
  const location = useLocation();
  const state = location.state || {};
  const { name, stage, businessName } = state;

  const title = "Thanks for your feedback | NPS Me";
  const description =
    "Thank you for completing the NPS Me demo survey. This is the final step in the customer feedback loop.";

  return (
    <>
      <Seo
        path="/demo-survey/thanks"
        title={title}
        description={description}
      />

      <div className="min-h-screen bg-[#020617] text-slate-100 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md bg-[#020617]/60 border border-slate-800 rounded-3xl shadow-xl shadow-black/40 p-6 sm:p-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-400 to-violet-500">
            <span className="text-xl font-bold text-slate-950">✓</span>
          </div>

          <h1 className="text-2xl font-semibold mb-2">Thank you for your feedback</h1>

          <p className="text-sm text-slate-300 mb-4">
            We’ve recorded your response
            {name ? (
              <>
                , <span className="font-medium text-slate-100">{name}</span>
              </>
            ) : null}
            {businessName ? (
              <>
                {" "}
                for <span className="font-medium text-slate-100">{businessName}</span>
              </>
            ) : null}
            {stage ? (
              <>
                {" "}
                on the <span className="font-medium text-slate-100">{stage}</span> stage.
              </>
            ) : (
              "."
            )}
          </p>

          <p className="text-xs text-slate-400 mb-6">
            In a real NPS programme, this data would now feed into live dashboards and trigger
            follow-up workflows for detractors and promoters.
          </p>

          <div className="flex flex-col gap-3 items-center">
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-full px-4 py-2.5 text-sm font-semibold bg-emerald-400 text-slate-950 hover:bg-emerald-300 shadow-lg shadow-emerald-500/30"
            >
              Back to NPS Me
            </Link>
            <Link
              to="/data-automation"
              className="text-xs text-emerald-300 hover:text-emerald-200"
            >
              See how we connect & automate this data →
            </Link>
            <Link
              to="/demo-survey-page"
              className="inline-flex items-center justify-center rounded-full px-4 py-2.5 text-sm font-semibold bg-violet-500 text-white hover:bg-violet-400 shadow-lg shadow-violet-500/30"
            >
              View my result →
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
