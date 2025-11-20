// src/pages/BlogClosingTheLoop.jsx
import React from "react";
import Seo from "../components/Seo";
import { Link } from "react-router-dom";

export default function BlogClosingTheLoop() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B0F19] via-[#0C1224] to-[#0B0F19] text-slate-200">
      <Seo
        path="/blog/closing-the-loop"
        title="Beyond the Score: Why Closing the Loop Builds Trust | NPS Me"
        description="Customer feedback isn't valuable until you act on it. Learn why closing the loop, reading beyond the NPS score, and understanding cultural context build lasting customer trust."
      />

      <main className="mx-auto max-w-3xl px-6 py-12">
        {/* Meta header */}
        <header>
          <p className="text-[11px] uppercase tracking-[0.25em] text-[#22C55E] mb-2">
            Blog • Customer Experience
          </p>

          <h1 className="text-3xl md:text-4xl font-semibold text-white leading-tight">
            Beyond the Score: Why Closing the Loop Builds Trust
          </h1>

          <p className="mt-3 text-xs md:text-sm text-slate-400">
            By a former Head of Customer Experience (Europe) for a large telco
          </p>

          {/* Gradient accent rule (not full width) */}
          <div className="mt-6 h-px w-24 bg-gradient-to-r from-[#22C55E] via-[#7C3AED] to-transparent" />
        </header>

        {/* Intro block */}
        <section className="mt-8 rounded-2xl border border-white/10 bg-black/30 p-5 md:p-6">
          <p className="text-sm md:text-base text-slate-200 leading-relaxed">
            Most organisations measure feedback. Fewer act on it. And even fewer
            tell customers what they changed as a result.
          </p>
          <p className="mt-3 text-sm md:text-base text-slate-200 leading-relaxed">
            I've seen countless teams track Net Promoter Scores with impressive
            dashboards and detailed monthly reports, yet the most important part
            of the process is often missing. A number can only tell you so much.
            The real work starts after the results are in.
          </p>
        </section>

        {/* 1. When the survey ends, the story begins */}
        <section className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5 md:p-6">
          <h2 className="flex items-center gap-3 text-lg md:text-xl font-semibold text-white">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#22C55E] to-[#7C3AED] text-[11px] font-bold">
              1
            </span>
            <span>When the survey ends, the story begins</span>
          </h2>
          <div className="mt-3 space-y-3 text-sm md:text-base text-slate-200 leading-relaxed">
            <p>
              An NPS report often feels like closure. It lands on an executive’s
              desk, there's a quick review of promoters and detractors, and
              everyone moves on to the next quarter. But feedback isn't a
              destination. It's a mirror. And the reflection it gives is only
              useful if someone acts on it.
            </p>

            <p>
              The companies that truly benefit from NPS understand this. They don’t
              chase higher scores or quick wins. They listen carefully to what’s
              behind each comment, work across teams to address the root causes,
              and make sure customers notice when things improve. That simple act
              of acknowledgment can change how customers feel about a brand more
              than any marketing campaign.
            </p>
          </div>
        </section>

        {/* 2. The silence that damages trust */}
        <section className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5 md:p-6">
          <h2 className="flex items-center gap-3 text-lg md:text-xl font-semibold text-white">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#7C3AED] to-[#22C55E] text-[11px] font-bold">
              2
            </span>
            <span>The silence that damages trust</span>
          </h2>
          <div className="mt-3 space-y-3 text-sm md:text-base text-slate-200 leading-relaxed">
            <p>
              Customers remember what happens after they speak. A survey with no
              visible follow-up is like a conversation that ends halfway through.
              It can leave people feeling ignored, even if the company has made
              progress behind the scenes.
            </p>

            <p>
              I’ve watched organisations quietly rebuild credibility just by being
              transparent about what they were working on. They didn’t need big
              announcements or perfectly polished messages. They simply showed
              that someone was listening. Over time, those small acts of honesty
              became the foundation of real loyalty.
            </p>
          </div>
        </section>

        {/* 3. Cultural differences */}
        <section className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5 md:p-6">
          <h2 className="flex items-center gap-3 text-lg md:text-xl font-semibold text-white">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#22C55E] to-[#7C3AED] text-[11px] font-bold">
              3
            </span>
            <span>Cultural differences: when a seven means something else</span>
          </h2>
          <div className="mt-3 space-y-3 text-sm md:text-base text-slate-200 leading-relaxed">
            <p>
              One of the most overlooked parts of NPS is cultural interpretation.
              In Germany, it’s rare to give a 10 out of 10. In Japan, people are
              often reluctant to provide negative feedback. In the UK, a seven can
              mean “fine”, which often means “not fine”. These patterns matter.
            </p>

            <p>
              A company that treats NPS as an absolute measure risks missing the
              context that gives it meaning. Scores are relative to culture,
              personality, and even industry norms. Reading the written comments
              and understanding tone is far more valuable than chasing a
              particular number. A high score might hide frustration. A low score
              might come from cultural restraint rather than genuine dissatisfaction.
            </p>
          </div>
        </section>

        {/* 4. Looking beyond the number */}
        <section className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5 md:p-6">
          <h2 className="flex items-center gap-3 text-lg md:text-xl font-semibold text-white">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#7C3AED] to-[#22C55E] text-[11px] font-bold">
              4
            </span>
            <span>Looking beyond the number</span>
          </h2>
          <div className="mt-3 space-y-3 text-sm md:text-base text-slate-200 leading-relaxed">
            <p>
              NPS was never meant to be a competition. It was designed to be a
              compass. The best teams use it to guide internal improvement, not to
              decorate performance slides.
            </p>

            <p>
              Over time, I’ve noticed that when companies focus less on the number
              and more on the patterns behind it, the results start to move on
              their own. You can’t manufacture advocacy. You earn it by doing the
              right things consistently and quietly.
            </p>
          </div>
        </section>

        {/* 5. Closing the loop without showing your playbook */}
        <section className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5 md:p-6">
          <h2 className="flex items-center gap-3 text-lg md:text-xl font-semibold text-white">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#22C55E] to-[#7C3AED] text-[11px] font-bold">
              5
            </span>
            <span>Closing the loop without showing your playbook</span>
          </h2>
          <div className="mt-3 space-y-3 text-sm md:text-base text-slate-200 leading-relaxed">
            <p>
              Every organisation can find its own rhythm for following up with
              customers. Some prefer a visible approach, others make subtle
              adjustments that customers simply notice over time. What matters is
              that the loop is genuinely closed. That customers feel the difference,
              even if they can’t pinpoint what changed.
            </p>

            <p>
              When handled well, closing the loop can completely transform
              perception. Done right, it shifts a brand from being seen as
              reactive to being trusted as proactive. But there’s no one-size-fits-all
              formula. Each company needs its own way of turning insight into action.
              Finding that method is what separates ordinary feedback programmes
              from truly effective ones.
            </p>
          </div>
        </section>

        {/* 6. The outcome that matters most */}
        <section className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5 md:p-6">
          <h2 className="flex items-center gap-3 text-lg md:text-xl font-semibold text-white">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#7C3AED] to-[#22C55E] text-[11px] font-bold">
              6
            </span>
            <span>The outcome that matters most</span>
          </h2>
          <div className="mt-3 space-y-3 text-sm md:text-base text-slate-200 leading-relaxed">
            <p>
              A strong NPS score might impress a boardroom, but customers notice
              something different. They remember how they were treated after they
              spoke up. Whether their issue was acknowledged, or whether their
              feedback simply vanished into a spreadsheet.
            </p>

            <p>
              The goal isn’t a perfect score. It’s credibility. When customers
              sense that their opinions drive real change, their confidence grows.
              They start believing that the brand means what it says. That’s how
              you move from measuring loyalty to earning it.
            </p>
          </div>
        </section>

        {/* CTA footer – aligned with Christmas blog style */}
        <footer className="mt-12">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#141B2E] via-[#0B1120] to-[#0B0F19] p-6 md:p-8 text-center">
            <p className="text-sm md:text-base text-slate-200">
              Ready to turn feedback into actions your customers actually feel?
            </p>
            <p className="mt-2 text-xs md:text-sm text-slate-400 max-w-2xl mx-auto">
              NPS Me helps you design fair surveys, close the loop consistently,
              and present results in a way that drives decisions — not just dashboards.
            </p>
            <div className="mt-5 flex flex-col sm:flex-row justify-center gap-3">
              <Link
                to="/products"
                className="rounded-2xl px-6 py-2.5 text-sm font-semibold bg-[#7C3AED] hover:bg-[#6D28D9] transition"
              >
                Explore NPS Me services
              </Link>
              <Link
                to="/book"
                className="rounded-2xl px-6 py-2.5 text-sm font-semibold bg-[#22C55E] text-[#020617] hover:bg-[#16A34A] transition"
              >
                Book a discovery call
              </Link>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
