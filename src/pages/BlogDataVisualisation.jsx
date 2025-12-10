// src/pages/BlogCxDataVisualisation.jsx
import React from "react";
import Seo from "../components/Seo";
import PageHeader from "../components/PageHeader";

export default function BlogCxDataVisualisation() {
  const title =
    "How to Use Data Visualisation to Drill Into CX Data and Uncover Insights That Teams Can Act On";

  const description =
    "Most companies have more CX dashboards than time. Learn how to use data visualisation to spot patterns, find friction, and turn NPS data into clear next actions.";

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B0F19] via-[#0C1224] to-[#0B0F19] text-slate-200">
      <Seo
        path="/blog/cx-data-visualisation"
        title={`${title} | NPS Me`}
        description={description}
      />

      {/* Header */}
      <PageHeader
        iconLabel="Data"
        tag="CX & NPS / Blog"
        accent="How to Use Data Visualisation"
        title="to Unlock Hidden CX Insights"
        subtitle="Go beyond pretty dashboards. Design visuals that make the next action obvious."
      />

      {/* Content */}
      <main className="mx-auto max-w-4xl px-6 py-10 md:py-14 space-y-10 md:space-y-12">
        {/* Intro */}
        <section className="space-y-4 text-sm sm:text-base leading-relaxed">
          <p>
            Most companies have more dashboards than time. Yet despite all the reports, customer
            friction still goes unseen, decisions stall, and leaders feel like the story is missing.
          </p>

          <p>
            The problem usually isn&apos;t the lack of visuals. It&apos;s that most charts don&apos;t
            actually explain anything.
          </p>

          <p>
            Used well, data visualisation turns raw CX signals into something teams can immediately
            interpret and act on. Used poorly, it just becomes another place to scroll.
          </p>

          <p>
            In this post we&apos;ll look at how to use visualisation properly – with examples from CX
            work – so your teams see what matters and move faster.
          </p>
        </section>

        {/* 1. Dashboards aren't the destination */}
        <ArticleSection
          number="1"
          title="Dashboards Aren't the Destination – They're the Lens"
        >
          <p>
            A dashboard is not the insight. It&apos;s the tool that helps you find the insight. In many
            CX teams we see:
          </p>

          <ul className="mt-3 space-y-1.5 text-sm sm:text-base">
            <li>• Dozens of dashboards but no single source of truth</li>
            <li>• Charts that look impressive but don&apos;t answer questions</li>
            <li>• Reports that explain what is happening, but not why</li>
            <li>• Visuals built for the presenter, not the reader</li>
          </ul>

          <p className="mt-4">
            A great CX visualisation has one job:{" "}
            <span className="font-semibold text-slate-100">
              make the next action obvious.
            </span>
          </p>
        </ArticleSection>

        {/* 2. Three layers of visual insight */}
        <ArticleSection
          number="2"
          title="The Three Layers of Visual Insight in Customer Experience"
        >
          <KeyLabel>Layer 1 – Pattern spotting (macro trends)</KeyLabel>
          <p className="mt-2">
            These visuals tell you whether something is drifting, flattening, or breaking. You are
            scanning for shape, not precision:
          </p>
          <ul className="mt-2 space-y-1.5">
            <li>• Sentiment or NPS over time</li>
            <li>• Ticket volume per 1,000 customers</li>
            <li>• Refund rate trends</li>
            <li>• First-contact resolution by month</li>
          </ul>
          <p className="mt-2">
            At this layer you&apos;re asking:{" "}
            <em>&ldquo;Is something interesting happening?&rdquo;</em> – not yet{" "}
            <em>&ldquo;Why?&rdquo;</em>
          </p>

          <KeyLabel className="mt-5">Layer 2 – Friction hunting (the where and why)</KeyLabel>
          <p className="mt-2">
            Once a pattern shows something worth investigating, visualisations help pinpoint the
            specifics:
          </p>
          <ul className="mt-2 space-y-1.5">
            <li>• Heatmaps showing satisfaction by channel or product line</li>
            <li>• Drop-off charts showing where onboarding fails</li>
            <li>• Journey maps where wait times spike</li>
            <li>• Theme frequency charts linked to customer value</li>
          </ul>
          <p className="mt-2">
            Here the question becomes:{" "}
            <em>&ldquo;Where exactly is the experience breaking down?&rdquo;</em>
          </p>

          <KeyLabel className="mt-5">
            Layer 3 – Expectation gaps (where your reality and the customer&apos;s differ)
          </KeyLabel>
          <p className="mt-2">
            Some of the strongest insights come from comparing operational metrics to customer
            sentiment:
          </p>
          <ul className="mt-2 space-y-1.5">
            <li>• Fast delivery time + poor sentiment → expectations mismatch</li>
            <li>• High CSAT + high churn → product–market mismatch</li>
            <li>• Low NPS + strong operational KPIs → communications gap</li>
          </ul>
          <p className="mt-2">
            These visuals reveal the disconnects that text alone hides – where customers feel one
            thing and your dashboards insist everything is fine.
          </p>
        </ArticleSection>

        {/* 3. Visuals that consistently deliver insight */}
        <ArticleSection
          number="3"
          title="Visuals That Consistently Deliver Insight in CX Programmes"
        >
          <h3 className="font-semibold text-slate-100 mt-1">
            1) Theme-by-value heatmap
          </h3>
          <p className="mt-2">
            Show which customer themes link most strongly to revenue, churn, or support cost. Rows
            are themes, columns are value segments or products. The darker the cell, the more it
            matters commercially.
          </p>
          <p className="mt-2">
            This instantly surfaces &ldquo;small but noisy&rdquo; issues versus the themes that
            quietly drain loyalty from your most valuable customers.
          </p>

          <h3 className="font-semibold text-slate-100 mt-4">
            2) Verbatim clustering (simple, not AI hype)
          </h3>
          <p className="mt-2">
            Group comments into 8–12 human-labelled categories and visualise their size and
            sentiment over time. No need for a complex model – start with simple rules and tags.
          </p>
          <p className="mt-2">
            You&apos;ll quickly see which issues generate the most pain and which positive themes you
            should double down on.
          </p>

          <h3 className="font-semibold text-slate-100 mt-4">
            3) Sankey flow of the customer journey
          </h3>
          <p className="mt-2">
            A Sankey diagram shows volume moving through steps in a journey – where people drop out,
            retry, escalate to support, or convert.
          </p>
          <p className="mt-2">
            It&apos;s especially powerful for onboarding, installation, and cancellation journeys
            where lots of things can happen in a short window.
          </p>

          <h3 className="font-semibold text-slate-100 mt-4">
            4) NPS vs retention scatterplot
          </h3>
          <p className="mt-2">
            Plot customers by their NPS score on one axis and retention or tenure on the other. If
            Promoters churn, you have an expectation gap. If Detractors stay, you may have a
            price–value balance issue.
          </p>
          <p className="mt-2">
            This view stops you obsessing about scores from low-value segments and helps you focus
            on the customers who shape your future revenue.
          </p>

          <h3 className="font-semibold text-slate-100 mt-4">
            5) Ticket topic trend lines
          </h3>
          <p className="mt-2">
            Simple line charts of ticket topics over time often predict churn or revenue risk before
            any score moves. A small rise in one issue from a key segment is often your earliest
            warning signal.
          </p>
        </ArticleSection>

        {/* 4. Common mistakes */}
        <ArticleSection number="4" title="Common Mistakes That Kill Insight">
          <ul className="mt-2 space-y-1.5">
            <li>• Over-aggregating (&ldquo;Overall NPS&rdquo; hides almost everything useful)</li>
            <li>• Using averages instead of distributions or segments</li>
            <li>• Putting design and colour over clarity and labelling</li>
            <li>• Visualising dirty or mismatched data</li>
            <li>• Assuming the chart is the answer when it should start a conversation</li>
          </ul>

          <p className="mt-4">
            One honest, slightly ugly chart beats a beautiful dashboard of noise. If a visual makes
            people argue about the formatting instead of the decision, change it.
          </p>
        </ArticleSection>

        {/* 5. Workflow */}
        <ArticleSection
          number="5"
          title="A Simple Workflow for Turning Visuals Into Action"
        >
          <h3 className="font-semibold text-slate-100 mt-1">
            Step 1 – Start with a question
          </h3>
          <p className="mt-2">Examples:</p>
          <ul className="mt-2 space-y-1.5">
            <li>• Why is onboarding satisfaction flat even after we simplified the process?</li>
            <li>• Which themes cost us the most revenue or support time?</li>
          </ul>

          <h3 className="font-semibold text-slate-100 mt-4">
            Step 2 – Build the smallest visual that answers it
          </h3>
          <p className="mt-2">
            One chart. One insight. No clutter. If you need three filters, try again. The best CX
            visuals are boringly clear.
          </p>

          <h3 className="font-semibold text-slate-100 mt-4">
            Step 3 – Interpret it in a single sentence
          </h3>
          <p className="mt-2">
            If the chart needs a paragraph to explain what it says, it&apos;s the wrong chart.
            Stakeholders should be able to glance and say: &ldquo;Right, so we&apos;re losing
            high-value customers at installation.&rdquo;
          </p>

          <h3 className="font-semibold text-slate-100 mt-4">
            Step 4 – Assign ownership
          </h3>
          <p className="mt-2">
            Every useful visual should end with:{" "}
            <em>&ldquo;So who owns this, and what happens next?&rdquo;</em>
          </p>
          <p className="mt-2">
            A beautiful heatmap with no owner is just decoration. Insight only matters once someone
            is accountable for changing it.
          </p>
        </ArticleSection>

        {/* 6. Quick wins */}
        <ArticleSection number="6" title="Quick Wins You Can Implement This Week">
          <ul className="mt-2 space-y-1.5">
            <li>
              • A retention curve segmented by Promoter / Passive / Detractor for one core product
            </li>
            <li>
              • A heatmap of complaint themes by customer value band (high / medium / low, to start)
            </li>
            <li>• A journey timeline visual showing where customers wait the longest</li>
            <li>
              • A simple &ldquo;you said, we did&rdquo; tracker next to each dashboard – so people
              see action as well as scores
            </li>
          </ul>

          <p className="mt-4">
            None of these require complex AI. They require clean data, clear questions, and visuals
            that respect your stakeholders&apos; time.
          </p>
        </ArticleSection>

        {/* Closing / CTA */}
        <section className="rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6 md:p-7 space-y-4">
          <h2 className="text-lg sm:text-xl font-semibold text-white">
            Turning Visuals Into Decisions
          </h2>
          <p className="text-sm sm:text-base">
            If you&apos;d like help visualising CX data so the next action becomes obvious,{" "}
            <strong>NPS Me</strong> can:
          </p>

          <ul className="mt-2 space-y-1.5 text-sm sm:text-base">
            <li>• Link data across survey, ticketing, and CRM tools</li>
            <li>• Build lightweight dashboards your teams actually read</li>
            <li>
              • Design a small set of visuals that move you from &ldquo;interesting charts&rdquo; to
              repeatable decisions
            </li>
          </ul>

          <p className="mt-3 text-sm sm:text-base">
            <a
              href="/book"
              className="inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-sm font-semibold bg-[#22C55E] text-[#0B0F19] hover:bg-[#16A34A]"
            >
              Book a short discovery call
            </a>{" "}
            and we&apos;ll look at where visualisation could make the biggest difference in your
            programme.
          </p>
        </section>
      </main>
    </div>
  );
}

/* --- Small layout helpers (same pattern as Christmas blog) --- */

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
