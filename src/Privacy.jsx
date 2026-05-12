// src/Privacy.jsx
import React from "react";
import { Link } from "react-router-dom";
import Seo from "./components/Seo";
import PageHeader from "./components/PageHeader";

export default function Privacy() {
  const updated = "12 May 2026";

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B0F19] via-[#0C1224] to-[#0B0F19] text-slate-200">
      <Seo
        path="/privacy"
        title="Privacy Policy | NPS Me"
        description="How NPS Me handles workspace data, imported feedback datasets, cookies, AI analysis, and third-party services."
      />

      <PageHeader
        iconLabel="Policy"
        tag="NPS Me / Policy"
        accent="Privacy Policy"
        title=""
        subtitle={`Last updated: ${updated}`}
      />

      <section className="mx-auto max-w-3xl px-6">
        <div className="prose prose-invert prose-slate mt-8">
          <p>
            NPS Me (“we”, “us”) provides customer experience consulting, NPS
            analysis tools, private customer feedback workspaces, and demo tools
            on <Link to="/" className="text-[#22C55E]">npsme.com</Link>. This
            policy explains what data we collect, how we use it, and your choices.
          </p>

          <h2>What we collect</h2>
          <ul>
            <li>
              <strong>Contact details you submit</strong> - name, email, and
              message content when you use our contact form or email us.
            </li>
            <li>
              <strong>Operational/demo data</strong> - if you try our demo widgets
              or sample tools, we may store your score/comment for demonstration,
              testing, or product improvement purposes.
            </li>
            <li>
              <strong>Workspace and imported customer feedback data</strong> - if
              you use a private NPS Me workspace, you or your organisation may
              upload or import feedback datasets containing customer names, email
              addresses, scores, dates, comments, survey answers, selected options,
              follow-up notes, and related customer experience information.
            </li>
            <li>
              <strong>Account and authentication data</strong> - for workspace
              users, we store login email addresses, names, password hashes,
              workspace membership, roles, login timestamps, and basic security
              audit events.
            </li>
            <li>
              <strong>AI-generated analysis</strong> - where workspace AI features
              are used, we may process uploaded feedback data to generate summaries,
              themes, risks, recommended actions, and close-the-loop suggestions.
            </li>
            <li>
              <strong>Technical information</strong> - standard logs such as IP
              address, user agent, pages viewed, referrer, request times, and error
              information for security and performance.
            </li>
            <li>
              <strong>Cookies</strong> - minimal cookies, including authentication
              cookies for private workspaces and basic site functionality. We do
              not sell personal data.
            </li>
          </ul>

          <h2>How we use data</h2>
          <ul>
            <li>Reply to enquiries and deliver requested information or proposals.</li>
            <li>
              Operate demos, maintain site security and performance, and improve
              the site’s content.
            </li>
            <li>
              Provide private workspace functionality, including saved datasets,
              response views, NPS performance reporting, and close-the-loop tracking.
            </li>
            <li>
              Generate AI-assisted summaries, themes, risks, and recommended actions
              when a workspace user requests AI analysis.
            </li>
            <li>
              Authenticate workspace users, manage access, and maintain security
              audit records.
            </li>
            <li>
              Support legal compliance and enforcement, including abuse mitigation,
              security investigation, and required retention.
            </li>
          </ul>

          <h2>Private workspaces and customer feedback data</h2>
          <p>
            Private workspace data is used to provide the NPS Me workspace features
            requested by the workspace owner or authorised users. This includes
            saving datasets, displaying NPS performance, searching responses,
            generating AI-assisted insights, and managing close-the-loop follow-up
            actions.
          </p>
          <p>
            Where a customer or client uploads personal data relating to their own
            customers, that customer or client is responsible for ensuring they
            have a valid lawful basis and the necessary rights, notices, and
            permissions to provide that data to NPS Me for processing. NPS Me
            processes that workspace data to provide the requested service and does
            not sell it or use it for advertising.
          </p>

          <h2>AI-assisted analysis</h2>
          <p>
            Some workspace features may use AI services to summarise feedback,
            identify themes, highlight risks, and suggest follow-up actions. We aim
            to send only the information needed for the requested analysis. AI
            outputs should be reviewed by a human before being used for important
            decisions or customer communications.
          </p>

          <h2>Legal bases (EEA/UK)</h2>
          <ul>
            <li>
              <strong>Legitimate interests</strong> - running the site, maintaining
              security, improving services, and using light analytics.
            </li>
            <li>
              <strong>Consent</strong> - where required, such as optional newsletter
              or marketing features if added in future.
            </li>
            <li>
              <strong>Contract</strong> - when we provide consulting, a private
              workspace, customer feedback analysis, or other services requested by
              you or your organisation.
            </li>
            <li>
              <strong>Legal obligation</strong> - where we need to retain or process
              information to comply with applicable law.
            </li>
          </ul>

          <h2>Processors & infrastructure</h2>
          <p>
            We use reputable providers to run the site, store data, deliver
            workspace functionality, and process requests. These may include:
          </p>
          <ul>
            <li><strong>Heroku</strong> - application hosting.</li>
            <li><strong>Cloudflare</strong> - CDN, DNS, caching, and security services.</li>
            <li>
              <strong>Supabase</strong> - database, workspace data storage, and
              related backend infrastructure.
            </li>
            <li>
              <strong>OpenAI</strong> - AI-assisted analysis where AI insight
              features are used.
            </li>
            <li><strong>Formspree</strong> - contact submissions, where used.</li>
          </ul>
          <p>
            Providers may change over time. We aim to keep appropriate contracts,
            safeguards, and access controls in place, including standard contractual
            clauses where applicable.
          </p>

          <h2>Data retention</h2>
          <p>
            Contact messages are kept as long as needed to respond and for routine
            business records. Demo inputs may be cleared periodically. Server logs
            typically rotate within 30-90 days unless required for security or legal
            reasons. Workspace datasets and related feedback records are kept while
            the workspace is active or while needed to provide the requested service,
            unless deletion is requested earlier by an authorised workspace owner or
            required by law.
          </p>

          <h2>Your rights</h2>
          <p>
            Depending on where you live, you may have rights to access, correct,
            delete, or receive a copy of your personal data, and to object or
            restrict certain processing. To exercise these rights, email{" "}
            <a href="mailto:hello@npsme.com" className="text-[#22C55E]">
              hello@npsme.com
            </a>.
          </p>
          <p>
            If your data was uploaded to a workspace by one of our customers, we may
            need to refer your request to that customer where they are the data
            controller.
          </p>

          <h2>International transfers</h2>
          <p>
            We may process data in the UK, EU, and US. Where required, we rely on
            appropriate safeguards, such as standard contractual clauses or equivalent
            protections.
          </p>

          <h2>Security</h2>
          <p>
            We use reasonable technical and organisational measures, including HTTPS,
            access controls, private workspace authentication, password hashing,
            role-based restrictions for some actions, and restricted backend access.
            However, no method of transmission or storage is 100% secure. Workspace
            users should only upload data they are authorised to process and should
            avoid uploading unnecessary sensitive data.
          </p>

          <h2>Contact</h2>
          <p>
            Data controller: NPS Me • Email:{" "}
            <a href="mailto:hello@npsme.com" className="text-[#22C55E]">
              hello@npsme.com
            </a>
          </p>

          <hr />

          <p className="text-xs text-slate-500">
            NPS® and Net Promoter Score® are registered service marks of Bain
            &amp; Company, Inc., Fred Reichheld, and Satmetrix Systems, Inc.
            References are descriptive only. NPS Me is independent and not
            affiliated with or endorsed by those parties.
          </p>
        </div>
      </section>
    </div>
  );
}
