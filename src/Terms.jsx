// src/Terms.jsx
import React from "react";
import { Link } from "react-router-dom";
import Seo from "./components/Seo";
import PageHeader from "../components/PageHeader";


export default function Terms() {
  const updated = "12 Oct 2025";

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B0F19] via-[#0C1224] to-[#0B0F19] text-slate-200">
      <Seo
        path="/terms"
        title="Terms of Service | NPS Me"
        description="NPS Me terms, scope of services, limitations, and contact details."
      />
      <section className="mx-auto max-w-3xl px-6 py-14">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#22C55E]" />
          <span className="text-xs tracking-widest text-slate-400 uppercase">Terms</span>
        </div>
        <h1 className="text-3xl font-semibold text-white">Website Terms &amp; Conditions</h1>
        <p className="mt-2 text-sm text-slate-400">Last updated: {updated}</p>

        <div className="prose prose-invert prose-slate mt-8">
          <p>
            Welcome to <Link to="/" className="text-[#22C55E]">npsme.com</Link>. By accessing or using this site
            you agree to these Terms. If you engage NPS Me for consulting, the engagement will be governed by a separate
            written agreement which prevails over these Terms.
          </p>

          <h2>Use of the site</h2>
          <ul>
            <li>Do not misuse the site (e.g., introduce malware, scrape at scale, or attempt to break security).</li>
            <li>Demo widgets are illustrative only and provided “as is”.</li>
            <li>We may update or remove content and features at any time.</li>
          </ul>

          <h2>Intellectual property</h2>
          <p>
            The site’s content, design, and code are owned by NPS Me or its licensors. You may not copy or reuse content
            without permission except as allowed by law (e.g., fair use).
          </p>

          <h2>Disclaimers</h2>
          <ul>
            <li>
              The site is provided on an “as is” and “as available” basis. We make no warranties about accuracy,
              reliability, or availability.
            </li>
            <li>
              Demo calculations are directional and not financial advice. Decisions are your responsibility.
            </li>
          </ul>

          <h2>Limitation of liability</h2>
          <p>
            To the maximum extent permitted by law, NPS Me is not liable for any indirect, incidental, special,
            consequential, or exemplary damages arising from your use of the site. In any case, our total liability for
            claims related to the site will not exceed £100.
          </p>

          <h2>Third-party services</h2>
          <p>
            We may link to or integrate third-party services (e.g., Formspree for contact submissions). Those services
            are governed by their own terms and policies.
          </p>

          <h2>Privacy</h2>
          <p>
            See our <Link to="/privacy" className="text-[#22C55E]">Privacy Policy</Link> for how we handle personal data.
          </p>

          <h2>Governing law</h2>
          <p>
            These Terms are governed by the laws of England &amp; Wales. Courts in England have exclusive jurisdiction,
            except where local mandatory law applies.
          </p>

          <h2>Contact</h2>
          <p>
            Questions about these Terms? Email{" "}
            <a href="mailto:hello@npsme.com" className="text-[#22C55E]">hello@npsme.com</a>.
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
