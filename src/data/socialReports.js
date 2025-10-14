// src/data/socialReports.js
// Anonymised sample reports. Add more objects to grow the gallery.

export const REPORTS = [
  {
    slug: "alpha",
    clientName: "Sample Client Alpha",
    industry: "Marketplace",
    period: "Last 8 weeks (rolling)",
    sources: ["X/Twitter", "Reddit", "App Store", "Trustpilot"],
    sentimentSeries: [46, 47, 50, 48, 53, 56, 54, 59],
    npsStyleSeries: [10, 7, 12, 13, 17, 20, 18, 23],
    kpis: {
      ticketsDown: 0.22, // 22%
      repeatLift: 0.05,  // 5%
      churnDown: 0.018   // 1.8%
    },
    themes: [
      { name: "Onboarding clarity", change: "+15%", sev: "good", notes: "Checklist cut early confusion; fewer 'what now?' threads." },
      { name: "Delivery reliability", change: "+7%", sev: "mid", notes: "ETA emails lowered WISMO but delays surface at peaks." },
      { name: "Billing transparency", change: "+2%", sev: "mid", notes: "Refund edge cases improved; monthly trickle persists." },
      { name: "Support responsiveness", change: "+19%", sev: "good", notes: "Macro removal + public SLA boosted perceived quality." },
      { name: "Mobile app stability", change: "-3%", sev: "bad", notes: "Subset crash on login for older Android devices." }
    ],
    quotes: [
      { src: "X/Twitter", txt: "The welcome checklist made day 1 feel easy. Nice touch." },
      { src: "Trustpilot", txt: "Delivery slipped by a day, but ETA update saved me contacting support." },
      { src: "Reddit", txt: "Android build still freezes on sign-in sometimes. Please fix." },
      { src: "App Store", txt: "Real reply from support with steps that worked. Much better than last month." }
    ],
    actions: [
      "Launched 3-step onboarding + first-week email nudges.",
      "Added ETA/tracking email and ‘running late?’ self-serve link.",
      "Replaced boilerplate macros with concise diagnostic prompts.",
      "Help-center billing explainer linked from invoice emails."
    ],
    nextSteps: [
      "Ship hotfix for Android login crash; monitor store reviews 2 weeks.",
      "Pre-empt late deliveries with banner on tracking page.",
      "Continue first-response coaching and publish public SLAs.",
      "A/B test invoice PDF placement for billing explainer."
    ]
  },
  {
    slug: "bravo",
    clientName: "Sample Client Bravo",
    industry: "Fintech",
    period: "Last 8 weeks (rolling)",
    sources: ["X/Twitter", "App Store", "Google Reviews"],
    sentimentSeries: [52, 51, 49, 53, 55, 54, 58, 57],
    npsStyleSeries: [14, 12, 11, 15, 19, 18, 22, 21],
    kpis: { ticketsDown: 0.27, repeatLift: 0.06, churnDown: 0.022 },
    themes: [
      { name: "Card declines", change: "+10%", sev: "good", notes: "Better error copy; fewer 'mystery' fails reported." },
      { name: "Fees clarity", change: "+4%", sev: "mid", notes: "Tooltip added; edge cases still surface." },
      { name: "App performance", change: "+8%", sev: "good", notes: "Cold-start improved; fewer lag complaints." }
    ],
    quotes: [
      { src: "Google Reviews", txt: "Clearer fee info. No surprises this time." },
      { src: "X/Twitter", txt: "App opens faster after update. Thanks!" }
    ],
    actions: [
      "Error copy overhaul with next-best-action hints.",
      "Inline fee breakdown and hover tips in pricing table."
    ],
    nextSteps: [
      "Instrument decline reasons end-to-end.",
      "Run survey on clarity after fee tooltip change."
    ]
  },
  {
    slug: "charlie",
    clientName: "Sample Client Charlie",
    industry: "EdTech",
    period: "Last 8 weeks (rolling)",
    sources: ["Reddit", "Trustpilot", "App Store"],
    sentimentSeries: [44, 45, 47, 46, 48, 51, 50, 52],
    npsStyleSeries: [8, 9, 11, 10, 12, 16, 15, 17],
    kpis: { ticketsDown: 0.18, repeatLift: 0.04, churnDown: 0.015 },
    themes: [
      { name: "Tutor quality", change: "+9%", sev: "good", notes: "Profile revamp increased trust signals." },
      { name: "Scheduling UX", change: "+3%", sev: "mid", notes: "Fewer double-book issues after calendar sync fix." },
      { name: "Pricing fairness", change: "-2%", sev: "bad", notes: "Comparisons with competitors spark price sensitivity." }
    ],
    quotes: [
      { src: "Reddit", txt: "Tutor profiles feel more legit now. Booked faster." }
    ],
    actions: [
      "Added verified badges and example lesson clips.",
      "Calendar sync patch + guardrails for overlap."
    ],
    nextSteps: [
      "Test value-prop copy on pricing; explore bundles."
    ]
  }
];

// Helpers
export function getReportBySlug(slug) {
  return REPORTS.find(r => r.slug === slug);
}
