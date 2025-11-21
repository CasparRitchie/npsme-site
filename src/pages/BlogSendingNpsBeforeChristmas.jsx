// src/pages/BlogSendingNpsBeforeChristmas.jsx
import React from "react";
import { Link } from "react-router-dom";
import Seo from "../components/Seo";
import PageHeader from "../components/PageHeader";

export default function BlogSendingNpsBeforeChristmas() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B0F19] via-[#0C1224] to-[#0B0F19] text-slate-200">
      <Seo
        path="/blog/sending-nps-before-christmas"
        title="Sending an NPS survey before Christmas (without annoying your customers)"
        description="How to run a respectful, effective pre-Christmas NPS pulse - and what to do with the insights."
      />

      {/* Header */}
      <PageHeader
        tag="CX & NPS / Blog"
        accent="How to Send an NPS Survey Before Christmas"
        title="- Even If You’ve Never Done One Before"
        subtitle="A practical, founder-friendly guide to launching a respectful, high-signal NPS pulse before the holidays."
      />

      {/* Content */}
      <main className="mx-auto max-w-4xl px-6 py-10 md:py-14 space-y-10 md:space-y-12">
        {/* Intro */}
        <section className="space-y-4 text-sm sm:text-base leading-relaxed">
          <p>
            As the year winds down, many companies enter{" "}
            <span className="text-[#22C55E] font-medium">“reflection mode.”</span> Customers are taking
            stock of the brands they rely on, inboxes quieten slightly, and people find themselves
            with just enough mental space to offer thoughtful feedback.
          </p>
          <p>
            That’s why the period between late November and mid-December is one of the most effective
            windows of the year to send an NPS survey - especially if you’ve never run one before.
          </p>
          <p>
            Better yet: with the right approach, you can launch a clean, branded, high-response NPS
            survey in under 48 hours, even if you’re starting from scratch.
          </p>
          <p className="font-medium text-slate-100">
            In this guide, you’ll learn exactly how to do it.
          </p>
        </section>

        {/* Section helper */}
        <ArticleSection
          number="1"
          title="Why Sending an NPS Survey Before Christmas Works So Well"
        >
          <p>
            It sounds counter-intuitive - December is “busy”, right?
          </p>
          <p>
            Yes and no. Emails about discounts or logistics get ignored. But feedback requests hit
            differently in December:
          </p>
          <ul className="mt-3 space-y-1.5 text-sm sm:text-base">
            <li>• People are reflective and open to giving input</li>
            <li>• Customers appreciate being asked before the new year starts</li>
            <li>• You get richer qualitative comments - not rushed mid-year replies</li>
            <li>• January inboxes become chaos, so December has higher engagement</li>
          </ul>
          <p className="mt-4">
            For small and mid-size businesses - especially those with relationship-based customer
            models - this window is{" "}
            <span className="text-[#7C3AED] font-medium">a golden opportunity.</span>
          </p>
        </ArticleSection>

        <ArticleSection
          number="2"
          title="What You Need to Send an NPS Survey (It’s Less Than You Think)"
        >
          <p>Here’s everything you need to run an NPS survey:</p>

          <KeyLabel>✔ A list of customers</KeyLabel>
          <p>A simple Excel/CSV with:</p>
          <ul className="mt-2 space-y-1.5">
            <li>• First name</li>
            <li>• Last name</li>
            <li>• Company name (optional)</li>
            <li>• Email</li>
          </ul>

          <KeyLabel className="mt-4">✔ Your logo + colours</KeyLabel>
          <p>To make the email feel branded and trustworthy.</p>

          <KeyLabel className="mt-4">✔ One question</KeyLabel>
          <p>
            The NPS standard:
            <br />
            <span className="italic text-slate-100">
              “How likely are you to recommend us to a friend or colleague?”
            </span>
            <br />
            Scale: <span className="font-medium text-[#22C55E]">0–10</span>
          </p>

          <KeyLabel className="mt-4">✔ One optional open-text question</KeyLabel>
          <p>
            <span className="italic text-slate-100">“What’s the main reason for your score?”</span>
          </p>

          <KeyLabel className="mt-4">✔ A way to send the surveys</KeyLabel>
          <p>
            You can use your ESP (Brevo, Mailjet, HubSpot…), or{" "}
            <span className="text-[#22C55E] font-medium">NPSme can handle everything for you.</span>
          </p>

          <KeyLabel className="mt-4">✔ A way to track results</KeyLabel>
          <p>You need:</p>
          <ul className="mt-2 space-y-1.5">
            <li>• Overall NPS</li>
            <li>• Response rate</li>
            <li>• Score distribution (promoters/passives/detractors)</li>
            <li>• Themes from comments</li>
          </ul>

          <p className="mt-4">
            You do not need a CRM or complex automation.{" "}
            <span className="font-medium text-slate-100">
              A clean, simple setup works perfectly.
            </span>
          </p>
        </ArticleSection>

        <ArticleSection number="3" title="When Exactly Should You Send It?">
          <p>Here’s the surprisingly simple rule:</p>
          <p className="mt-2 font-medium text-slate-100">
            The earlier in December, the better.
          </p>
          <p className="mt-2">
            But even mid-December works if you time it well.
          </p>

          <KeyLabel className="mt-4">Best windows:</KeyLabel>
          <ul className="mt-2 space-y-1.5">
            <li>• <span className="font-medium text-[#22C55E]">1–14 December</span> → Highest quality responses</li>
            <li>• <span className="font-medium">15–20 December</span> → Still safe, especially if your product is digital or operational</li>
            <li>• Avoid <span className="font-medium">21–25 December</span> (unless B2C retail or hospitality)</li>
          </ul>

          <p className="mt-4">Within those windows:</p>
          <ul className="mt-2 space-y-1.5">
            <li>• Send on Mon–Wed mornings</li>
            <li>• Around 9:00–11:00am local time</li>
            <li>• Avoid Friday afternoons</li>
          </ul>

          <p className="mt-4">
            Responses typically land within <span className="font-medium text-[#7C3AED]">24–48 hours.</span>
          </p>
        </ArticleSection>

        <ArticleSection number="4" title="How to Craft the Email for Maximum Response">
          <p>
            The email is everything. If the email feels long or corporate, response rate collapses.
          </p>

          <p className="mt-3 font-medium text-slate-100">Principles:</p>
          <ul className="mt-2 space-y-1.5">
            <li>• Write like a human</li>
            <li>• Keep it short</li>
            <li>• Make it founder-led if possible</li>
            <li>• Reassure: 10–20 seconds max</li>
            <li>• Avoid marketing language</li>
          </ul>

          {/* English template */}
          <div className="mt-5 rounded-2xl border border-white/10 bg-black/40 p-4 sm:p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-[#22C55E] mb-2">
              Example template (English)
            </p>
            <pre className="text-xs sm:text-sm bg-slate-900/60 border border-slate-700/70 rounded-2xl px-4 py-3 text-slate-100 whitespace-pre-wrap break-words">
              Subject: Quick question before the holidays?

              Hi &#123;&#123;name&#125;&#125;,
              As we wrap up the year, we’re reflecting on how we’re doing. Would you mind answering one quick question?

              It takes 10 seconds, and your feedback genuinely helps shape our priorities for next year.

              👉 &#123;&#123;survey_link&#125;&#125;

              Thank you - it means a lot.
              &#123;&#123;Founder name&#125;&#125;
            </pre>
          </div>

          {/* French template */}
          <div className="mt-5 rounded-2xl border border-white/10 bg-black/40 p-4 sm:p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-[#7C3AED] mb-2">
              Exemple de template (Français)
            </p>
            <pre className="text-xs sm:text-sm bg-slate-900/60 border border-slate-700/70 rounded-2xl px-4 py-3 text-slate-100 whitespace-pre-wrap break-words">
              Objet : Une petite question avant les fêtes ?

              Bonjour &#123;&#123;name&#125;&#125;,
              En cette fin d’année, nous prenons un moment pour réfléchir à ce que nous pouvons améliorer.
              Pourriez-vous répondre à une seule question ?

              Cela prend moins de 20 secondes, et votre avis compte vraiment pour nous.

              👉 &#123;&#123;survey_link&#125;&#125;

              Merci beaucoup,
              &#123;&#123;Nom du fondateur&#125;&#125;
            </pre>
          </div>
        </ArticleSection>

        <ArticleSection
          number="5"
          title="Avoid These Common Mistakes (Beginner Mistakes That Hurt Results)"
        >
          <p>These are the pitfalls that even big brands fall into:</p>
          <ul className="mt-3 space-y-1.5">
            <li>
              <span className="text-rose-400 font-semibold">❌ Sending from a “no-reply” address</span>
              <br />
              <span className="text-sm text-slate-300">
                Kills trust. Always send from a person.
              </span>
            </li>
            <li>
              <span className="text-rose-400 font-semibold">❌ Asking too many questions</span>
              <br />
              <span className="text-sm text-slate-300">
                NPS works because it’s fast. Stick to 1–2 questions max.
              </span>
            </li>
            <li>
              <span className="text-rose-400 font-semibold">❌ Mixing transactional and overall NPS</span>
              <br />
              <span className="text-sm text-slate-300">
                Keep milestone feedback separate from relationship feedback.
              </span>
            </li>
            <li>
              <span className="text-rose-400 font-semibold">❌ Not closing the loop</span>
              <br />
              <span className="text-sm text-slate-300">
                A short callback to detractors in January can transform your reputation.
              </span>
            </li>
            <li>
              <span className="text-rose-400 font-semibold">❌ Incentivising answers</span>
              <br />
              <span className="text-sm text-slate-300">
                It introduces bias and skews your NPS.
              </span>
            </li>
          </ul>
        </ArticleSection>

        <ArticleSection
          number="6"
          title="What to Do With the Results (A Simple, Actionable Framework)"
        >
          <p>
            Once the responses come in, here’s how to use them:
          </p>

          <KeyLabel className="mt-4">Promoters (9–10)</KeyLabel>
          <ul className="mt-2 space-y-1.5">
            <li>• Ask for permission to use comments as testimonials</li>
            <li>• Encourage them to leave a Trustpilot/Google review</li>
            <li>• Identify what delighted them</li>
          </ul>

          <KeyLabel className="mt-4">Passives (7–8)</KeyLabel>
          <ul className="mt-2 space-y-1.5">
            <li>• Ask what almost made it a 9</li>
            <li>• Often low-effort fixes exist here (small UX or process issues)</li>
          </ul>

          <KeyLabel className="mt-4">Detractors (0–6)</KeyLabel>
          <ul className="mt-2 space-y-1.5">
            <li>• Prioritise these for callbacks</li>
            <li>• Categorise their feedback: speed, clarity, service, price, etc.</li>
            <li>• Fix recurring problems early in Q1 to lift NPS fast</li>
          </ul>

          <p className="mt-4">
            A good January debrief turns feedback into{" "}
            <span className="font-medium text-[#22C55E]">an actionable roadmap.</span>
          </p>
        </ArticleSection>

        <ArticleSection
          number="7"
          title="Tools to Run Your Survey (From Free to Turnkey)"
        >
          <p>You don’t need enterprise software.</p>

          <KeyLabel className="mt-4">Beginner option (free):</KeyLabel>
          <ul className="mt-2 space-y-1.5">
            <li>• Google Forms + manual NPS calculation</li>
            <li>• Good for very small batches</li>
          </ul>

          <KeyLabel className="mt-4">Mid-range option:</KeyLabel>
          <ul className="mt-2 space-y-1.5">
            <li>• Your email tool + a lightweight survey link</li>
            <li>• Manual spreadsheets for results</li>
          </ul>

          <KeyLabel className="mt-4">Turnkey option (NPSme):</KeyLabel>
          <p className="mt-2">
            What we can provide:
          </p>
          <ul className="mt-2 space-y-1.5">
            <li>• Branded emails (your logo, your colours)</li>
            <li>• Survey in English or French</li>
            <li>• Personalised messaging</li>
            <li>• Automatic link generation</li>
            <li>• One-time invites or milestone-triggered</li>
            <li>• Response rate dashboard</li>
            <li>• NPS score + promoter/passive/detractor split</li>
            <li>• Text analytics (themes, sentiment, keyword extraction)</li>
            <li>• Support with closing the loop</li>
            <li>• Exportable Excel / PDF packs for board reporting</li>
          </ul>

          <p className="mt-4">
            Setup time:{" "}
            <span className="font-medium text-[#7C3AED]">
              24–48 hours after receiving your customer file.
            </span>
          </p>
        </ArticleSection>

        <ArticleSection
          number="8"
          title="How NPSme Can Run Your Pre-Christmas Survey for You"
        >
          <p>
            If you want this handled for you before Christmas, here’s the process:
          </p>
          <ol className="mt-3 space-y-1.5 list-decimal pl-5 text-sm sm:text-base">
            <li>Send us your customer file (CSV or Excel)</li>
            <li>We build your email invite (English, French, or both)</li>
            <li>We apply your branding (logo, colours, tone)</li>
            <li>We send your survey - either through your email tool or our own</li>
            <li>
              You get a real-time dashboard showing:
              <ul className="mt-1.5 space-y-1.5 list-disc pl-4 text-[13px] sm:text-sm text-slate-300">
                <li>response rate</li>
                <li>NPS</li>
                <li>score distribution</li>
                <li>milestone scores (optional)</li>
                <li>key themes from comments</li>
              </ul>
            </li>
            <li>
              In January, we provide a short CX insights deck and recommendations
            </li>
          </ol>

          <p className="mt-4">
            This gives you clarity for Q1 planning - and it requires almost no setup from your side.
          </p>
        </ArticleSection>

        {/* Conclusion + CTA */}
        <section className="rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6 md:p-7 space-y-4">
          <h2 className="text-lg sm:text-xl font-semibold text-white">
            Conclusion
          </h2>
          <p className="text-sm sm:text-base">
            Sending an NPS survey before Christmas is one of the simplest, highest-ROI actions a business
            can take. Whether you have 20 customers or 2,000, a well-timed NPS survey gives you:
          </p>
          <ul className="mt-2 space-y-1.5 text-sm sm:text-base">
            <li>• immediate visibility into customer sentiment</li>
            <li>• actionable feedback to fix issues early in the new year</li>
            <li>• a structured way to prioritise CX improvements in Q1</li>
          </ul>
          <p className="mt-3 text-sm sm:text-base">
            And you can launch a professional, branded version in under 48 hours.
          </p>

          <p className="mt-4 text-sm sm:text-base">
            If you’d like help setting it up - or want to try the demo - you can start here:
          </p>

          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            <Link
              to="/demo-survey-page"
              className="inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-sm font-semibold bg-[#7C3AED] hover:bg-[#6D28D9] text-white"
            >
              Try the NPS demo experience
            </Link>
            <Link
              to="/book"
              className="inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-sm font-semibold bg-[#22C55E] text-[#0B0F19] hover:bg-[#16A34A]"
            >
              Book a free discovery call
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

/* --- Small layout helpers --- */

function ArticleSection({ number, title, children }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-black/30 p-5 sm:p-6 md:p-7">
      <div className="flex items-baseline gap-2 mb-3">
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[#7C3AED] to-[#22C55E] text-[11px] font-semibold text-white">
          {number}
        </span>
        <h2 className="text-base sm:text-lg md:text-xl font-semibold text-white">
          {title}
        </h2>
      </div>
      <div className="mt-1 space-y-3 text-sm sm:text-base leading-relaxed text-slate-200">
        {children}
      </div>
    </section>
  );
}

function KeyLabel({ children, className = "" }) {
  return (
    <p
      className={[
        "inline-flex items-center gap-2 text-sm font-semibold text-slate-100",
        className,
      ].join(" ")}
    >
      <span className="h-1.5 w-4 rounded-full bg-gradient-to-r from-[#7C3AED] to-[#22C55E]" />
      <span>{children}</span>
    </p>
  );
}
