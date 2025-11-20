// src/pages/BlogSendingNpsBeforeChristmas.jsx
import React from "react";
import Seo from "../components/Seo";

export default function BlogSendingNpsBeforeChristmas() {
  const title = "Sending an NPS survey before Christmas (without annoying your customers)";
  const description =
    "How to run a respectful, effective pre-Christmas NPS pulse - and what to do with the insights.";

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B0F19] via-[#0C1224] to-[#0B0F19] text-slate-200">
      <Seo path="/blog/sending-nps-before-christmas" title={title} description={description} />

      {/* Header */}
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="pointer-events-none absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_20%_20%,#7C3AED_0%,transparent_35%),radial-gradient(circle_at_80%_30%,#22C55E_0%,transparent_25%)]" />
        <div className="mx-auto max-w-4xl px-6 py-16">
          <p className="text-xs uppercase tracking-widest text-[#22C55E]">Insights</p>
          <h1 className="mt-2 text-3xl md:text-4xl font-semibold tracking-tight text-white">
            {title}
          </h1>
          <p className="mt-3 max-w-2xl text-slate-300">{description}</p>
        </div>
      </section>

      {/* Body */}
      <article className="mx-auto max-w-3xl px-6 py-12 prose prose-invert prose-slate prose-headings:text-white prose-strong:text-white
                          prose-li:marker:text-slate-400 prose-a:text-[#22C55E]">

        {/* 🔒 Your exact text starts here */}
        <h2>How to Send an NPS Survey Before Christmas - Even If You’ve Never Done One Before</h2>

        <p>
          As the year winds down, many companies enter “reflection mode.” Customers are taking stock of
          the brands they rely on, inboxes quieten slightly, and people find themselves with just enough
          mental space to offer thoughtful feedback.
        </p>

        <p>
          That’s why the period between late November and mid-December is one of the most effective windows
          of the year to send an NPS survey - especially if you’ve never run one before.
        </p>

        <p>
          Better yet: with the right approach, you can launch a clean, branded, high-response NPS survey
          in under 48 hours, even if you’re starting from scratch.
        </p>

        <p>In this guide, you’ll learn exactly how to do it.</p>

        <hr />

        <h3>1. Why Sending an NPS Survey Before Christmas Works So Well</h3>

        <p>It sounds counter-intuitive - December is “busy”, right?</p>

        <p>Yes and no. Emails about discounts or logistics get ignored. But feedback requests hit differently in December:</p>

        <ul>
          <li>People are reflective and open to giving input</li>
          <li>Customers appreciate being asked before the new year starts</li>
          <li>You get richer qualitative comments - not rushed mid-year replies</li>
          <li>January inboxes become chaos, so December has higher engagement</li>
        </ul>

        <p>
          For small and mid-size businesses - especially those with relationship-based customer models -
          this window is a golden opportunity.
        </p>

        <hr />

        <h3>2. What You Need to Send an NPS Survey (It’s Less Than You Think)</h3>

        <p>Here’s everything you need to run an NPS survey:</p>

        <p><strong>✔ A list of customers</strong></p>
        <p>A simple Excel/CSV with:</p>
        <ul>
          <li>First name</li>
          <li>Last name</li>
          <li>Company name (optional)</li>
          <li>Email</li>
        </ul>

        <p><strong>✔ Your logo + colours</strong><br />To make the email feel branded and trustworthy.</p>

        <p><strong>✔ One question</strong><br />The NPS standard:</p>

        <blockquote>
          “How likely are you to recommend us to a friend or colleague?”<br />
          <em>Scale: 0–10</em>
        </blockquote>

        <p><strong>✔ One optional open-text question</strong></p>
        <blockquote>“What’s the main reason for your score?”</blockquote>

        <p><strong>✔ A way to send the surveys</strong></p>
        <p>You can use your ESP (Brevo, Mailjet, HubSpot…), or NPSme can handle everything for you.</p>

        <p><strong>✔ A way to track results</strong></p>
        <p>You need:</p>
        <ul>
          <li>Overall NPS</li>
          <li>Response rate</li>
          <li>Score distribution (promoters/passives/detractors)</li>
          <li>Themes from comments</li>
        </ul>

        <p>You do not need a CRM or complex automation. A clean, simple setup works perfectly.</p>

        <hr />

        <h3>3. When Exactly Should You Send It?</h3>

        <p>Here’s the surprisingly simple rule:</p>
        <p><strong>The earlier in December, the better.</strong></p>

        <p>But even mid-December works if you time it well.</p>

        <p>Best windows:</p>
        <ul>
          <li>1–14 December → Highest quality responses</li>
          <li>15–20 December → Still safe, especially for digital businesses</li>
          <li>Avoid 21–25 December (unless B2C retail or hospitality)</li>
        </ul>

        <p>Within those windows:</p>
        <ul>
          <li>Send Mon–Wed mornings</li>
          <li>Around 9:00–11:00am</li>
          <li>Avoid Friday afternoons</li>
        </ul>

        <p>Responses typically land within 24–48 hours.</p>

        <hr />

        <h3>4. How to Craft the Email for Maximum Response</h3>

        <p>The email is everything. If the email feels long or corporate, response rate collapses.</p>

        <p>Principles:</p>
        <ul>
          <li>✔ Write like a human</li>
          <li>✔ Keep it short</li>
          <li>✔ Make it founder-led</li>
          <li>✔ Reassure: 10–20 seconds max</li>
          <li>✔ Avoid marketing language</li>
        </ul>

        <pre className="text-xs sm:text-sm bg-slate-900/60 border border-slate-700/70 rounded-2xl px-4 py-3 text-slate-100 overflow-x-auto">
          Subject: Quick question before the holidays?

          Hi &#123;&#123;name&#125;&#125;,
          As we wrap up the year, we’re reflecting on how we’re doing. Would you mind answering one quick question?

          It takes less than 30 seconds, and your feedback genuinely helps shape our priorities for next year.

          👉 &#123;&#123;survey_link&#125;&#125;

          Thank you - it means a lot.
          &#123;&#123;Founder name&#125;&#125;
        </pre>
        <pre className="text-xs sm:text-sm bg-slate-900/60 border border-slate-700/70 rounded-2xl px-4 py-3 text-slate-100 overflow-x-auto">
          Objet : Une petite question avant les fêtes ?

          Bonjour &#123;&#123;name&#125;&#125;,
          En cette fin d’année, nous prenons un moment pour réfléchir à ce que nous pouvons améliorer. Pourriez-vous répondre à une seule question ?

          Cela prend moins de 30 secondes, et votre avis compte vraiment pour nous.

          👉 &#123;&#123;survey_link&#125;&#125;

          Merci beaucoup,
          &#123;&#123;Nom du fondateur&#125;&#125;
        </pre>

        <hr />

        <h3>5. Avoid These Common Mistakes</h3>

        <ul>
          <li>❌ Sending from a “no-reply” address</li>
          <li>❌ Asking too many questions</li>
          <li>❌ Mixing transactional and overall NPS</li>
          <li>❌ Not closing the loop</li>
          <li>❌ Incentivising answers</li>
        </ul>

        <hr />

        <h3>6. What to Do With the Results</h3>

        <p>Promoters (9–10)</p>
        <ul>
          <li>Ask for testimonials</li>
          <li>Encourage reviews</li>
          <li>Identify delight factors</li>
        </ul>

        <p>Passives (7–8)</p>
        <ul>
          <li>Ask what almost made it a 9</li>
          <li>Look for easy fixes</li>
        </ul>

        <p>Detractors (0–6)</p>
        <ul>
          <li>Callback quickly</li>
          <li>Sort by theme: speed, clarity, service, price…</li>
          <li>Fix early-Q1 root causes</li>
        </ul>

        <hr />

        <h3>7. Tools to Run Your Survey</h3>

        <p><strong>Beginner option (free)</strong></p>
        <ul><li>Google Forms + manual NPS</li></ul>

        <p><strong>Mid-range</strong></p>
        <ul><li>Your ESP + simple survey link</li></ul>

        <p><strong>Turnkey (NPSme)</strong></p>
        <ul>
          <li>Branded emails</li>
          <li>English/French survey</li>
          <li>Personalised messaging</li>
          <li>One-time or milestone-based</li>
          <li>Response dashboard</li>
          <li>Text analytics</li>
          <li>Exportable Excel/PDF</li>
        </ul>

        <p>Setup time: <strong>24–48 hours</strong> after receiving your file.</p>

        <hr />

        <h3>8. How NPSme Can Run Your Pre-Christmas Survey</h3>

        <ol>
          <li>Send your customer file</li>
          <li>We build the email (EN/FR)</li>
          <li>We apply your branding</li>
          <li>We send it (your ESP or ours)</li>
          <li>You get a real-time dashboard</li>
          <li>We prepare a January CX insights deck</li>
        </ol>

        <hr />

        <h3>Conclusion</h3>

        <p>
          Sending an NPS survey before Christmas is one of the simplest, highest-ROI actions a business
          can take. And you can launch a professional, branded version in under 48 hours.
        </p>

        <p>
          👉 <a href="/demo-survey-page">Try the demo</a><br />
          👉 <a href="/book">Book a discovery call</a>
        </p>
        {/* 🔒 Your exact text ends here */}
      </article>
    </div>
  );
}
