import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-white/10 bg-[#0B0F19] text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-6 py-10 grid gap-6 md:grid-cols-3">
        {/* Left: Branding */}
        <div>
          <h3 className="text-white font-semibold text-lg">NPS Me</h3>
          <p className="mt-2 text-slate-400">
            Turning feedback into growth — helping organisations improve
            Net Promoter Score (NPS)® and customer experience.
          </p>
        </div>

        {/* Middle: Quick links */}
        <div>
          <h4 className="text-white font-semibold mb-2">Explore</h4>
          <ul className="space-y-1">
            <li><Link to="/" className="hover:text-white">Home</Link></li>
            <li><Link to="/impact" className="hover:text-white">Impact Calculator</Link></li>
            <li><Link to="/milestone-nps" className="hover:text-white">Method</Link></li>
            <li><Link to="/social-listening" className="hover:text-white">Social Listening</Link></li>
          </ul>
        </div>

        {/* Right: Legal + Disclaimer */}
        <div>
          <h4 className="text-white font-semibold mb-2">Legal</h4>
          <ul className="space-y-1">
            <li><Link to="/privacy" className="hover:text-white">Privacy Policy</Link></li>
            <li><Link to="/terms" className="hover:text-white">Terms of Service</Link></li>
          </ul>
          <p className="mt-4 text-xs text-slate-500">
            NPS® and Net Promoter Score® are registered service marks of Bain &amp; Company, Inc.,
            Fred Reichheld, and Satmetrix Systems, Inc. NPS Me is independent and unaffiliated.
          </p>
        </div>
      </div>
      <div className="border-t border-white/10 text-center py-4 text-[13px] text-slate-500">
        © {new Date().getFullYear()} NPS Me — All rights reserved.
      </div>
    </footer>
  );
}
