// src/pages/BlogEthicalSurveys.jsx
import React from "react";
import Seo from "../components/Seo";
import { Link } from "react-router-dom";

export default function BlogEthicalSurveys() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B0F19] via-[#0C1224] to-[#0B0F19] text-slate-200">
      <Seo
        path="/blog/ethical-surveys"
        title="When Feedback Fatigue Sets In: The Ethics of Customer Contact Selection | NPS Me"
        description="A reflection by former Telco Head of Customer Experience (Europe) on survey ethics, contact selection, and how to build genuinely trustworthy feedback systems."
      />

      <div className="mx-auto max-w-3xl px-6 py-12">
        <p className="text-xs uppercase tracking-widest text-[#22C55E] mb-4">
          Blog • Customer Experience
        </p>
        <h1 className="text-3xl md:text-4xl font-semibold text-white leading-tight">
          When Feedback Fatigue Sets In: The Ethics of Customer Contact Selection
        </h1>
        <p className="mt-3 text-slate-400 text-sm">
          By a former Head of Customer Experience (Europe) for a large telco
        </p>

        <div className="mt-8 space-y-6 text-slate-300 leading-relaxed">
          <p>
            Every company wants to be customer-centric, but few stop to ask whether
            their feedback processes are <em>ethically customer-centric</em>.
            It’s one thing to measure Net Promoter Score (NPS) - it’s another to ensure
            that the way you collect that feedback actually reflects reality.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10">
            Contact selection: the invisible bias
          </h2>
          <p>
            At my former company, we used Salesforce to manage “contact selection” for our B2B NPS programme.
            Each Account Manager could flag a contact as either
            <strong> “Available for Survey” </strong> or
            <strong> “Not Suitable for Survey.” </strong>
            Each month, the system randomly selected a sample from those “available” contacts.
          </p>
          <p>
            On paper, that sounds like a fair process. In practice, however, Account Managers
            could easily exclude contacts they knew were unhappy - or mark entire Accounts as
            “Do Not Survey” (DNS). Initially, that decision didn’t require approval,
            meaning anyone who didn’t want a low score could quietly hide detractors from the data.
          </p>
          <p>
            We later introduced a VP approval process to control DNS flags, but the problem was clear:
            when the people being measured control who provides feedback,
            the resulting NPS isn’t a measure of customer advocacy - it’s a measure of survey design ethics.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10">
            Response rates vs authenticity
          </h2>
          <p>
            Once the survey window opened, we worked hard to drive up response rates.
            Surveys ran for three weeks, and every week, Account Managers were encouraged
            to nudge customers to complete them.
          </p>
          <p>
            The challenge? Those nudges often crossed ethical lines. While our guidance was
            clear - encourage participation, but never influence the score - human nature
            and incentive structures can blur that line.
          </p>
          <blockquote className="border-l-4 border-[#22C55E] pl-4 italic text-slate-400">
            “Please give us a 9 or 10, otherwise it’s seen as bad” - the classic poster
            once found in Mercure hotel lifts, perfectly illustrates this dilemma.
          </blockquote>
          <p>
            This type of “coached feedback” destroys the credibility of the data.
            You end up optimising for a number rather than for genuine improvement.
            It feels like progress - but it’s performance theatre.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10">
            How to rebuild trust in feedback
          </h2>
          <ul className="list-disc list-inside space-y-2">
            <li>
              <strong>Decouple incentives from scores.</strong> Reward behaviours that
              improve customer outcomes, not just survey results.
            </li>
            <li>
              <strong>Audit “Do Not Survey” logic.</strong> Every DNS flag should have
              a clear rationale and VP-level oversight.
            </li>
            <li>
              <strong>Control communication.</strong> Pre-survey messaging should come
              from the company, not individual account owners, to avoid bias.
            </li>
            <li>
              <strong>Rotate samples regularly.</strong> Avoid repeatedly surveying the same contacts because it skews sentiment and causes fatigue.
            </li>
            <li>
              <strong>Close the loop transparently.</strong> Publish common themes and show customers
              what’s changing as a result of their feedback.
            </li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-10">Final thoughts</h2>
          <p>
            Ethical feedback systems aren’t about avoiding criticism; they’re about earning
            credibility. A mature CX programme measures itself not by the height of its NPS bar,
            but by the integrity of the data beneath it.
          </p>
          <p>
            True improvement comes from facing uncomfortable truths... and ensuring your customers
            feel safe enough to tell them.
          </p>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 text-center">
          <p className="text-slate-400 text-sm">
            Interested in building a healthier NPS or CX framework for your organisation?
          </p>
          <div className="mt-4 flex flex-col sm:flex-row justify-center gap-3">
            <Link
              to="/products"
              className="rounded-2xl px-6 py-3 text-sm font-semibold bg-[#7C3AED] hover:bg-[#6D28D9] transition"
            >
              Explore NPS Me Services
            </Link>
            <a
              href="/#contact"
              className="rounded-2xl px-6 py-3 text-sm font-semibold bg-[#22C55E] text-[#0B0F19] hover:bg-[#16A34A] transition"
            >
              Book Discovery Call
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
