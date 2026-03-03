// src/data/socialReports.js
// Anonymised sample reports. Add more objects to grow the gallery.

export const REPORTS = [
    // --- Auto / Retail (anonymised) ---
  {
    slug: "auto-sector",
    clientName: "Auto Sector Client",
    industry: "Auto/Retail",
    period: "Rolling 8 weeks • updated 2025-10-23",
    lastUpdated: "2025-10-23",
    sources: ["X/Twitter", "Google Reviews", "Reddit"],
    // Paste your 8 most recent headline-sentiment points (0–100)
    // Example scaffold from recent pulse; replace with your ticker values
    sentimentSeries: [44, 46, 47, 49, 52, 54, 53, 57],
    // Paste your 8 most recent NPS-style index points (scaled balance)
    npsStyleSeries:  [8,  9,  10, 12, 14, 17, 16, 20],

    kpis: {
      // Relative changes (positive = good, e.g., fewer tickets)
      ticketsDown: 0.23,   // 23% ↓ tickets/1k orders vs. start of window
      repeatLift:  0.06,   // 6% ↑ cohort repeat
      churnDown:   0.018,  // 1.8% ↓ refunds/churn proxy
    },

    themes: [
      { name: "Pricing transparency",        change: "+12%", sev: "good", notes: "Clearer breakdowns in quotes reduced fee pushback." },
      { name: "Delivery promise vs reality", change: "+5%",  sev: "mid",  notes: "ETA comms helped; sporadic delays persist at peaks." },
      { name: "After-sales follow-up",       change: "+4%",  sev: "mid",  notes: "Proactive check-ins nudged satisfaction upward." },
      { name: "Support responsiveness",      change: "+16%", sev: "good", notes: "Humanised replies + SLA guidance improved trust." },
      { name: "App / ordering stability",    change: "-3%",  sev: "bad",  notes: "Isolated mobile checkout crash still reported." }
    ],

    quotes: [
      { src: "Google Reviews", txt: "Quote was itemised—no surprises this time." },
      { src: "X/Twitter",      txt: "Delivery ETA email helped me plan the handover." },
      { src: "Reddit",         txt: "Checkout froze once—had to retry on desktop." },
      { src: "Google Reviews", txt: "Agent actually read my note and solved it fast." }
    ],

    actions: [
      "Expanded pricing FAQ + inline fee tooltips in quote flow.",
      "Enabled ETA emails/SMS with live status link.",
      "Post-sale check-in sequence (48h / 14d).",
      "Macro clean-up + first-response coaching; public SLA page."
    ],

    nextSteps: [
      "Ship mobile checkout hotfix and monitor crash analytics.",
      "A/B test fee tooltip placement near totals.",
      "Track review velocity post-ETA rollout (weekly).",
      "Extend follow-up to 30-day product satisfaction pulse."
    ]
  },

  // --- Hospitality / F&B (anonymised) ---
  {
    slug: "hospitality-sector",
    clientName: "Hospitality Sector Client",
    industry: "Hospitality / F&B",
    period: "Rolling 8 weeks • updated 2025-10-23",
    lastUpdated: "2025-10-23",
    sources: ["X/Twitter", "TripAdvisor", "Google Reviews"],
    // Replace with your latest 8 points from the ticker
    sentimentSeries: [47, 45, 46, 48, 50, 53, 52, 56],
    npsStyleSeries:  [10,  9,  10, 11, 13, 16, 15, 19],

    kpis: {
      ticketsDown: 0.19,
      repeatLift:  0.04,
      churnDown:   0.017
    },

    themes: [
      { name: "Waiting times",   change: "+11%", sev: "good", notes: "Extra seating staff shortened weekend queues." },
      { name: "Menu clarity",    change: "+6%",  sev: "good", notes: "Allergen icons + plain-English descriptions reduced mistakes." },
      { name: "Reservations UX", change: "+7%",  sev: "good", notes: "More reliable confirmations; fewer double-book reports." },
      { name: "Staff attention", change: "+3%",  sev: "mid",  notes: "Service warmth mentioned more often; consistency improving." }
    ],

    quotes: [
      { src: "TripAdvisor",     txt: "Shorter wait than last month—host kept us updated." },
      { src: "Google Reviews",  txt: "Allergen labels made ordering stress-free." },
      { src: "X/Twitter",       txt: "Booking confirmation landed instantly this time." }
    ],

    actions: [
      "Peak-hour staffing rota adjusted; host updates every 10–15 min.",
      "Menu redesign with allergens and clearer dish notes.",
      "Reservation confirmation retries + SMS fallback."
    ],

    nextSteps: [
      "Test SMS reminders 60 min pre-booking.",
      "Add live wait-time widget to reservations page.",
      "24h post-visit micro-survey on clarity & service warmth."
    ]
  },
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
