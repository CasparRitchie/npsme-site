// src/Privacy.jsx
import React from "react";
import { Link } from "react-router-dom";
import Seo from "./components/Seo";
import PageHeader from "./components/PageHeader";


export default function Privacy() {
  const updated = "12 Oct 2025";

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B0F19] via-[#0C1224] to-[#0B0F19] text-slate-200">
      <Seo
        path="/privacy"
        title="Privacy Policy | NPS Me"
        description="How NPS Me handles data, cookies, and third-party services. Contact details for privacy requests."
      />
      <section className="mx-auto max-w-3xl px-6 py-14">
        <PageHeader
          iconLabel="Policy"
          tag="NPS Me / Policy"
          accent="Privacy Policy"
          title=""
          subtitle={`Last updated: ${updated}`}
        />

        <div className="prose prose-invert prose-slate mt-8">
          <p>
            NPS Me (“we”, “us”) provides customer experience consulting and simple demo tools on{" "}
            <Link to="/" className="text-[#22C55E]">npsme.com</Link>. This policy explains what data we collect,
            how we use it, and your choices.
          </p>

          <h2>What we collect</h2>
          <ul>
            <li>
              <strong>Contact details you submit</strong> - name, email, and message content when you use our contact
              form or email us.
            </li>
            <li>
              <strong>Operational/demo data</strong> - if you try our demo widgets (e.g., the “NPS®-style” demo),
              we store your score/comment for demonstration purposes only (no profiling).
            </li>
            <li>
              <strong>Technical information</strong> - standard logs (IP address, user agent, pages viewed,
              referrer) for security and performance.
            </li>
            <li>
              <strong>Cookies</strong> - minimal, primarily for performance and basic analytics. We don’t run ad
              trackers or sell personal data.
            </li>
          </ul>

          <h2>How we use data</h2>
          <ul>
            <li>Reply to enquiries and deliver requested information or proposals.</li>
            <li>Operate demos, maintain site security and performance, and improve the site’s content.</li>
            <li>Legal compliance and enforcement (e.g., abuse mitigation, required retention).</li>
          </ul>

          <h2>Legal bases (EEA/UK)</h2>
          <ul>
            <li><strong>Legitimate interests</strong> - running the site, security, light analytics.</li>
            <li><strong>Consent</strong> - where required (e.g., optional newsletter, if added in future).</li>
            <li><strong>Contract</strong> - when we discuss or deliver consulting services you request.</li>
          </ul>

          <h2>Processors & infrastructure</h2>
          <p>
            We use reputable providers to run the site and handle submissions, such as:
          </p>
          <ul>
            <li><strong>Heroku</strong> (hosting) and <strong>Cloudflare</strong> (CDN & caching).</li>
            <li><strong>Formspree</strong> (contact submissions).</li>
          </ul>
          <p>
            Providers may change over time; we keep appropriate contracts and safeguards in place (e.g., SCCs where
            applicable).
          </p>

          <h2>Data retention</h2>
          <p>
            Contact messages are kept as long as needed to respond and for routine business records. Demo inputs may be
            cleared periodically. Server logs typically rotate within 30–90 days unless required for security or legal
            reasons.
          </p>

          <h2>Your rights</h2>
          <p>
            Depending on where you live, you may have rights to access, correct, delete, or receive a copy of your
            personal data, and to object or restrict certain processing. To exercise these rights, email{" "}
            <a href="mailto:hello@npsme.com" className="text-[#22C55E]">hello@npsme.com</a>.
          </p>

          <h2>International transfers</h2>
          <p>
            We may process data in the UK, EU, and US. Where required, we rely on appropriate safeguards (e.g., SCCs).
          </p>

          <h2>Security</h2>
          <p>
            We use industry-standard measures (HTTPS, access controls). No method is 100% secure; please share only
            information you’re comfortable providing online.
          </p>

          <h2>Contact</h2>
          <p>
            Data controller: NPS Me • Email:{" "}
            <a href="mailto:hello@npsme.com" className="text-[#22C55E]">hello@npsme.com</a>
          </p>

          <hr />

          <p className="text-xs text-slate-500">
            NPS® and Net Promoter Score® are registered service marks of Bain &amp; Company, Inc., Fred Reichheld,
            and Satmetrix Systems, Inc. References are descriptive only. NPS Me is independent and not affiliated with
            or endorsed by those parties.
          </p>
        </div>
      </section>
    </div>
  );
}
