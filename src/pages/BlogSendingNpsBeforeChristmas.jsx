// src/pages/BlogSendingNpsBeforeChristmas.jsx
import React from "react";
import { Link } from "react-router-dom";
import Seo from "../components/Seo";

export default function BlogSendingNpsBeforeChristmas() {
  const title = "Sending an NPS survey before Christmas (without annoying your customers)";
  const description =
    "Why sending an NPS survey before the holidays is smart - and how to do it in a way that feels thoughtful, low-friction, and genuinely useful for your customers.";

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#020617] via-[#020617] to-[#020617] text-slate-100">
      <Seo
        path="/blog/sending-nps-before-christmas"
        title={title + " | NPS Me"}
        description={description}
      />

      <main className="mx-auto max-w-3xl px-6 pt-16 pb-20">
        {/* Breadcrumb / back link */}
        <div className="mb-6 text-xs text-slate-400">
          <Link to="/blog" className="hover:text-slate-200">
            ← Back to blog
          </Link>
        </div>

        {/* Title + meta */}
        <header className="mb-8">
          <p className="text-xs uppercase tracking-[0.18em] text-emerald-400 mb-2">
            Blog · NPS & CX
          </p>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-white">
            Sending an NPS survey before Christmas (without annoying your customers)
          </h1>
          <p className="mt-3 text-sm text-slate-300">{description}</p>
          <p className="mt-2 text-[11px] text-slate-500">
            Approx. 6-8 minute read · Seasonal NPS & customer feedback
          </p>
        </header>

        <article className="prose prose-invert prose-slate max-w-none">
          {/* Intro */}
          <p>
            The run-up to Christmas is a strange time for customer feedback.
            On the one hand, it's a{" "}
            <span className="font-medium text-slate-100">
              high-emotion, high-stakes moment
            </span>{" "}
            in many journeys: parents ordering gifts, families booking travel,
            subscribers deciding whether to renew before year end.
          </p>
          <p>
            On the other hand, inboxes are full, teams are stretched, and nobody
            wants to be that brand sending a 20-question survey on 22 December.
          </p>
          <p>
            Done well, a short NPS®-style survey before Christmas can give you:
          </p>
          <ul>
            <li>
              a clean, comparable read on{" "}
              <span className="font-medium">how this year felt vs. last</span>,
            </li>
            <li>
              early warning on customers who{" "}
              <span className="font-medium">might churn in Q1</span>,
            </li>
            <li>
              and a pool of{" "}
              <span className="font-medium">promoters you can thank, feature, or
              invite into advocacy programmes</span> in the new year.
            </li>
          </ul>
          <p>
            The key is to design the survey and the comms so they feel{" "}
            <span className="font-medium">light, respectful, and useful</span>{" "}
            for your customers - not like another demand on their time.
          </p>

          <hr />

          {/* Section 1 */}
          <h2>1. Why the pre-Christmas window is powerful for NPS</h2>
          <p>
            If you operate in B2C, education, childcare, e-commerce, or
            subscription services, the weeks before Christmas are often when:
          </p>
          <ul>
            <li>customers have just experienced key milestones,</li>
            <li>emotions (good and bad) are fresh, and</li>
            <li>
              teams are already looking ahead to{" "}
              <span className="font-medium">“what we'll fix next year”</span>.
            </li>
          </ul>
          <p>
            That makes December a great time to ask a{" "}
            <span className="font-medium">single, well-framed NPS question</span>{" "}
            plus one short comment box. You're not asking them to audit your
            whole business - just to tell you how their year with you felt, in
            their own words.
          </p>
          <p>Done right, you get:</p>
          <ul>
            <li>
              A measurable{" "}
              <span className="font-medium">“end of year sentiment” baseline</span>.
            </li>
            <li>
              A clear list of{" "}
              <span className="font-medium">recurring themes to fix in Q1</span>.
            </li>
            <li>
              Concrete stories you can share internally to{" "}
              <span className="font-medium">humanise your CX roadmap</span>.
            </li>
          </ul>

          {/* Section 2 */}
          <h2>2. How to ask the question without annoying your customers</h2>
          <p>
            The biggest risk in December is not “bad scores” - it's{" "}
            <span className="font-medium">survey fatigue</span>. People are busy
            and slightly more protective of their time and attention.
          </p>
          <p>Some small choices make a big difference:</p>
          <h3>Keep the survey extremely short</h3>
          <p>
            For a pre-Christmas pulse, I usually recommend:
          </p>
          <ol>
            <li>
              0-10 NPS-style question (e.g. “How likely are you to recommend us
              to a friend or colleague?”).
            </li>
            <li>
              One open question, such as:
              <ul>
                <li>
                  <em>“What's the main reason for your score?”</em> or
                </li>
                <li>
                  <em>“If we could improve one thing for you next year, what would it be?”</em>
                </li>
              </ul>
            </li>
          </ol>
          <p>
            Tell people upfront that{" "}
            <span className="font-medium">it takes 30-60 seconds</span> -
            and then honour that promise.
          </p>

          <h3>Use a warm, human tone</h3>
          <p>
            December is a good time to lean into the fact that{" "}
            <span className="font-medium">humans are behind your brand</span>.
            For example:
          </p>
          <ul>
            <li>
              A brief intro from a founder or team lead (&quot;We&apos;ve been
              working hard on X and Y this year…&quot;).
            </li>
            <li>
              A genuine thank-you for their trust and custom.
            </li>
            <li>
              A clear explanation of{" "}
              <span className="font-medium">how you'll use the feedback</span>.
            </li>
          </ul>

          <h3>Be thoughtful about timing</h3>
          <p>Some options that work well in practice:</p>
          <ul>
            <li>
              <span className="font-medium">Early December</span>: less inbox
              traffic, still fresh in people&apos;s minds.
            </li>
            <li>
              <span className="font-medium">Right after a key milestone</span>:
              e.g. renewal confirmation, contract anniversary, or first delivery.
            </li>
          </ul>
          <p>
            Trying to squeeze a first-ever NPS launch into the last couple of
            days before Christmas break is possible - but usually not ideal.
          </p>

          {/* Section 3 */}
          <h2>3. What you can do with the results in January</h2>
          <p>
            The magic isn't in the NPS number itself - it's in what you{" "}
            <span className="font-medium">do with the insights</span> in Q1.
          </p>
          <p>For example, a December NPS run can feed directly into:</p>
          <ul>
            <li>
              <span className="font-medium">Journey mapping workshops</span>
              {" "}with real comments pinned to each stage.
            </li>
            <li>
              A prioritised list of{" "}
              <span className="font-medium">customer experience fixes</span>{" "}
              for the next quarter.
            </li>
            <li>
              <span className="font-medium">Team coaching and training</span>{" "}
              using anonymised verbatims.
            </li>
            <li>
              A set of{" "}
              <span className="font-medium">promoter stories and testimonials</span>{" "}
              you can (with permission) reuse in marketing.
            </li>
          </ul>
          <p>
            If you're already calling some customers personally (like many
            founders and small teams do), the survey acts as a{" "}
            <span className="font-medium">wide-angle lens</span>, and those
            calls become the{" "}
            <span className="font-medium">high-resolution close-ups</span>.
          </p>

          {/* Section 4 */}
          <h2>4. How NPS Me can support a pre-Christmas NPS run</h2>
          <p>
            If you're considering a quick but robust NPS run before Christmas,
            NPS Me can handle the{" "}
            <span className="font-medium">plumbing and analysis</span> so you
            can stay focused on your customers.
          </p>

          <h3>1) Managing the send for you</h3>
          <p>We can work from a simple export of your customers, for example:</p>
          <ul>
            <li>Excel or CSV with name, email, and any key segment tags.</li>
            <li>
              Optional grouping (e.g. by region, cohort, or journey stage).
            </li>
          </ul>
          <p>
            From there, we can either send from our infrastructure or{" "}
            <span className="font-medium">
              integrate with your own email system
            </span>{" "}
            so replies appear in a way that feels natural for your customers.
            We can even CC a shared inbox or team if you'd like to{" "}
            <span className="font-medium">follow up personally</span>.
          </p>

          <h3>2) Branded, language-appropriate invitations</h3>
          <p>
            We'll customise the survey emails and landing page so they feel
            like they{" "}
            <span className="font-medium">belong to your brand</span>, not ours:
          </p>
          <ul>
            <li>Logo, colours, and typography aligned with your style.</li>
            <li>
              Wording tailored to your tone of voice (English, French, or
              bilingual if needed).
            </li>
            <li>
              Microcopy that sets expectations clearly (&quot;one quick
              question&quot; really means one quick question).
            </li>
          </ul>

          <h3>3) Live NPS dashboard and response overview</h3>
          <p>
            As responses come in, you get a{" "}
            <span className="font-medium">live view of your NPS</span> and
            response rates, similar to the demo page on this site:
          </p>
          <ul>
            <li>Overall NPS for the campaign.</li>
            <li>
              Breakdowns by segment (e.g. region, cohort, or journey stage).
            </li>
            <li>Promoter / Passive / Detractor counts.</li>
          </ul>
          <p>
            If you'd like to see how this looks in practice, you can{" "}
            <Link
              to="/demo-survey-page"
              className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2"
            >
              try the live NPS demo here
            </Link>{" "}
            and watch the metrics update in real time.
          </p>

          <h3>4) Text analytics and themes from comments</h3>
          <p>
            The score is only half the story. The open comments tell you{" "}
            <span className="font-medium">why</span>.
          </p>
          <p>
            We'll group comments into{" "}
            <span className="font-medium">
              clear, human-readable themes
            </span>{" "}
            (e.g. onboarding clarity, speed of support, ease of billing),
            highlight what matters most, and pull out a shortlist of{" "}
            <span className="font-medium">
              “no-regrets fixes” for early next year
            </span>.
          </p>

          {/* Section 5 */}
          <h2>5. Combining surveys with founder-led calls</h2>
          <p>
            In some organisations - especially in education, childcare, or
            high-trust services - founders or senior leaders also{" "}
            <span className="font-medium">
              pick up the phone and call customers directly
            </span>{" "}
            before Christmas.
          </p>
          <p>
            That's powerful. A short NPS survey can sit alongside those calls,
            not replace them:
          </p>
          <ul>
            <li>
              The survey gives you{" "}
              <span className="font-medium">coverage across your base</span>.
            </li>
            <li>
              The calls let you{" "}
              <span className="font-medium">
                go deeper with a subset of customers
              </span>{" "}
              - and those conversations feel even more relevant because you're
              seeing themes in the data.
            </li>
          </ul>
          <p>
            You can also use survey responses to{" "}
            <span className="font-medium">
              prioritise who you call first
            </span>{" "}
            (for example, detractors with high lifetime value, or promoters
            who might be open to advocacy).
          </p>

          {/* Closing */}
          <h2>6. Want to explore a pre-Christmas NPS run?</h2>
          <p>
            If you'd like to get a lightweight but robust NPS pulse out before
            Christmas, or if you're planning something for early in the new
            year, I'd be happy to help you design it.
          </p>
          <p>
            We can start with a{" "}
            <Link
              to="/demo-survey-page"
              className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2"
            >
              walkthrough of the demo experience
            </Link>{" "}
            and then adapt the flow, wording, and branding to your context.
          </p>
          <p>
            If that sounds useful, you can{" "}
            <Link
              to="/book"
              className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2"
            >
              book a discovery session
            </Link>{" "}
            or just send a quick email with your questions.
          </p>
          <p className="mt-4">
            <span className="font-medium text-slate-100">
              Either way, the goal is simple:
            </span>{" "}
            use this moment in the year to listen well, act on what you hear,
            and make next year meaningfully better for your customers.
          </p>
        </article>
      </main>
    </div>
  );
}
