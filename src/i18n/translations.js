// src/i18n/translations.js

export const TRANSLATIONS = {
  en: {
    navbar: {
      bookDiscovery: "Book discovery",
      languageEn: "EN",
      languageFr: "FR",
    },
    routes: {
      products: "Products",
      whyNpsMe: "Why NPS Me",
      milestoneNps: "Milestone NPS",
      npsSurveyProgramme: "NPS Survey Programme",
      whatIsNps: "What is NPS?",
      dataAutomation: "Data & Automation",
      socialListening: "Social Listening",
      blog: "Blog",
      cxCockpit: "CX Cockpit",
    },
    milestonePage: {
      seoTitle: "Milestone (Transactional) NPS® & Survey Signals | NPS Me",
      seoDescription:
        "Capture customer sentiment at key journey moments to reveal friction in context. Implement close-the-loop and theme tracking for actionable CX.",

      header: {
        iconLabel: "Milestone / transactional NPS",
        tag: "NPS Me / Milestone NPS",
        title: "Milestone (Transactional) NPS & Survey Signals",
        intro:
          "A practical framework to capture feedback at key journey moments, turn it into prioritised work, and measure lift. We reference Net Promoter Score (NPS)® descriptively alongside CSAT, CES and behavioral data.",
        ctaImpact: "Estimate your impact",
        ctaBook: "Book discovery",
      },

      method: {
        title: "The 4-stage method (simple, repeatable)",
        intro:
          "Clear steps, fast wins, and compounding improvements. We meet you where you are and prioritise what moves the needle.",
        cards: [
          {
            title: "1) Discovery",
            desc: "Audit reviews, surveys, tickets and flows. Map friction. Establish baseline metrics.",
          },
          {
            title: "2) Recommend",
            desc: "Prioritised playbook with owners, effort/impact scores and timelines.",
          },
          {
            title: "3) Implement",
            desc: "Hands-on enablement: scripts, templates, automation, training. Unblock fast.",
          },
          {
            title: "4) Monitor",
            desc: "Track NPS/CSAT/CES & review velocity. Iterate monthly. Celebrate and scale wins.",
          },
        ],
      },

      fit: {
        title: "Where milestone surveys fit",
        cards: [
          {
            title: "Order placed",
            q: "Based on your ordering experience, how likely are you to recommend us (0-10)?",
            why: "Test checkout clarity, pricing transparency and payment reliability.",
          },
          {
            title: "Onboarding finished",
            q: "After onboarding, how likely are you to recommend us (0-10)?",
            why: "Gauge setup friction, documentation gaps, enablement quality.",
          },
          {
            title: "First delivery/use",
            q: "After your first delivery/use, how likely are you to recommend us (0-10)?",
            why: "Reveal fulfilment speed/accuracy, product readiness, first-use UX.",
          },
        ],
      },

      checklist: {
        stepsTitle: "Implementation in 5 steps",
        steps: [
          "Map milestones (checkout, onboarding, first value, renewal, support closure).",
          "Trigger surveys via your existing stack (ESP, product, helpdesk, CDP).",
          "Ask 0-10 + one open text; keep it short.",
          "Pipe results into a central view and tag by milestone.",
          "Close the loop and run monthly root-cause reviews.",
        ],
      },

      track: {
        title: "What we track",
        items: [
          "Score distribution by milestone (Promoters/Passives/Detractors).",
          "Themes by frequency & impact (effort vs. volume).",
          "Time-to-contact & close-the-loop rates.",
          "Downstream effects (repeat tickets, churn risk, review velocity).",
        ],
      },
    },
    landing: {
      seo: {
        title: "Customer Experience (CX) Consulting & NPS Improvement | NPS Me",
        description:
          "Pragmatic CX consulting to diagnose friction, prioritise fixes, and ship measurable gains - lift NPS®, reduce churn, increase repeat purchase.",
      },

      hero: {
        h1: {
          lead: "Customer Experience (CX) consulting to improve",
          nps: "Net Promoter Score (NPS)®",
          tail: "retention, and revenue.",
          accent: "Turn feedback into growth.",
        },
        body:
          "NPS Me helps teams run NPS and milestone feedback through their existing stack (Intercom, HubSpot, helpdesks, product tools, or CSV). We add the missing layer: survey governance, unbiased sampling, and decision-grade insight so feedback turns into measurable retention and revenue.",
        ctaPrimary: "Book a free discovery",
        ctaMethod: "See the 4-stage method",
        ctaDemo: "Try the NPS®-style demo",
        proof: {
          mining: "Review mining",
          enablement: "Hands-on enablement",
          lift: "Measurable lift",
        },
        chips: ["Intercom", "HubSpot", "Zendesk", "Product events", "CSV upload"],
        chipsNote:
          "Use NPS Me alongside your existing tools. We focus on governance, analysis and action, not replacing your CS platform.",
      },

      method: {
        title: "A simple, repeatable CX method to lift NPS®",
        body:
          "Clear steps, fast wins, and compounding improvements. We meet you where you are and prioritise what moves the needle.",
        cards: [
          {
            title: "1) Discovery",
            desc: "Audit reviews, surveys, and internal flows. Map friction. Establish baseline metrics.",
          },
          {
            title: "2) Recommend",
            desc: "Prioritised playbook of fixes and experiments with owners, effort/impact scoring, and timelines.",
          },
          {
            title: "3) Implement",
            desc: "Embed changes with teams: scripts, templates, automation, training. Hands-on support to unblock fast.",
          },
          {
            title: "4) Monitor",
            desc: "Track NPS/CSAT/CES and review velocity. Iterate monthly. Celebrate wins and scale what works.",
          },
        ],
      },

      demoBlock: {
        title: "Try the NPS®-style demo (close-the-loop ready)",
        body:
          "The demo shows how invitations, survey responses, and NPS metrics link together. In real deployments, targeting and sending often stay in your CS platform and NPS Me ingests responses to drive analysis and action. These numbers are live from the demo environment.",
        cta: "Run the live demo & see full results",
        note:
          "Opens the dedicated demo page where you can send yourself an invitation, complete the survey, and explore NPS & milestone scores.",
      },

      platform: {
        title: "Not another survey tool",
        body:
          "Most teams already have ways to send surveys. NPS Me helps you run a fair, consistent, decision-grade programme across whatever tools you use.",
        cards: [
          {
            title: "Governance",
            desc: "Sampling, cadence, anti-gaming, and comparability over time so the score means something.",
          },
          {
            title: "Interpretation",
            desc: "Theme and driver analysis, confidence checks, and clear prioritisation so action is obvious.",
          },
          {
            title: "Close the loop",
            desc: "Follow-up workflows and outcome tracking so responses lead to measurable changes.",
          },
        ],
      },

      about: {
        title: "About us",
        body:
          "We are experienced NPS and CX consultants. We combine quantitative analysis with hands-on team enablement to remove friction, improve sentiment, and grow revenue. We reference Net Promoter Score (NPS)® descriptively as one of several customer metrics.",
        bullets: [
          "Deep-dive review mining across Trustpilot, Google, and in-product surveys",
          "Voice-of-Customer to Voice-of-Process mapping",
          "Prioritised roadmaps with effort/impact scoring and owners",
          "Enablement: playbooks, scripts, templates, and training",
          "Measurement: NPS/CSAT/CES instrumentation and review velocity",
        ],
      },

      contact: {
        title: "Ready to turn feedback into growth?",
        body:
          "Book a free 30-minute discovery session. We’ll review your current scores and identify quick wins.",
        emailCta: "Email hello@npsme.com",
        bookCta: "Request a discovery call",
      },
    },
    surveyProgramme: {
      seoTitle: "Your personalised NPS Survey Programme | NPS Me",
      seoDescription:
        "Upload your customer list and we'll run a structured NPS survey programme for you - invitations, reminders, dashboards and insight-ready exports.",

      header: {
        iconLabel: "NPS survey programme",
        tag: "NPS Me / Survey Programme",
        accent: "Your personalised NPS Survey Programme",
        subtitle:
          "Provide us with a file of your customers' contact information and we'll run a structured NPS programme for you — invitations, reminders, dashboards and export-ready data — so you can focus on acting on the insight, not wrestling with tools.",
      },

      howItWorks: {
        title: "How it works",
        stepLabel: "Step {n}",
        steps: [
          {
            step: "1",
            title: "Upload your list",
            text:
              "You send us a CSV/Excel with customer name, email, company and any groupings you care about (sector, segment, persona, CSM, etc.).",
          },
          {
            step: "2",
            title: "We set up the survey",
            text:
              "We configure your NPS survey, branding and timing - including who to ask, when, and how often to follow up.",
          },
          {
            step: "3",
            title: "Invitations & reminders",
            text:
              "Invitations go out via email, with optional targeted reminders to non-responders. Every response is tracked and stored for analysis.",
          },
          {
            step: "4",
            title: "Live CX dashboard",
            text:
              "You get a secure portal with live NPS, response rates and verbatim comments, plus CSV exports you can drop straight into PowerPoint, Excel or your BI tool.",
          },
        ],
      },

      pulseBox: {
        title: "Perfect for a rapid, easy to set up, customer pulse",
        body:
          "If you have a list of customers you want to hear from quickly, we can spin up a focused NPS survey in days - not months. You send the list, we handle the invites and tracking, and you log in to see live NPS, completion and comments as they come in.",
        bullets: [
          "Single CSV upload - no complex tooling for your team.",
          "Branded NPS survey, tuned to your tone of voice.",
          "Live NPS and completion rates throughout the survey window.",
          "Comment feed you can filter by segment, persona or CSM.",
        ],
      },

      twoCol: {
        left: {
          title: "Client dashboard",
          intro:
            "Each client gets their own secure view of their survey programme - no heavy tooling or admin. They can see:",
          bullets: [
            "Current NPS and response rate.",
            "Breakdowns by segment, sector or persona.",
            "Verbatim comments, ready to tag and share.",
            "CSV export of the latest status at any time.",
          ],
        },
        right: {
          title: "Under the hood",
          intro:
            "Behind the scenes, NPS Me handles secure storage, deduplicated invitations, tracking and reminders - so you don't need to build or buy a heavy CX platform just to run one survey programme.",
          bullets: [
            "Contact file stored securely and versioned.",
            "Unique links per customer to avoid duplicate responses.",
            "Optional notifications when new responses arrive.",
            "Clear audit trail of what was sent and when.",
          ],
        },
      },

      cta: {
        title: "Want to run an NPS survey with your customers?",
        body:
          "Share your customer list and a target go-live date and we'll propose a simple, end-to-end survey plan - including email copy, timings and how we'll report back.",
        button: "Talk with us to set up your survey programme →",
      },

      demo: {
        title: "Try the NPS survey demo",
        body:
          "See how invitations, reminders, scoring, and dashboards all work — exactly as your customers would experience them. Quick, safe, and designed to show how NPSme runs full programmes.",
        button: "Open the NPS demo",
        note: "Sends a real invite and logs your demo response into the metrics.",
      },
    },
    products: {
      seoTitle:
        "Productized CX Services: Audits, Momentum Program & Weekly CX Pulse | NPS Me",
      seoDescription:
        "Pick a CX package to improve NPS®, reduce support load, and grow retention: Feedback Foundations, Momentum Program, and weekly CX Pulse reports.",

      header: {
        iconLabel: "Productized CX services",
        tag: "NPS Me / Services",
        accent: "Productized services",
        title: "that turn feedback into growth",
        subtitle:
          "Pick the package that fits your stage—from foundations, to enablement, to a weekly CX intelligence feed you can act on.",
      },

      cards: {
        foundations: {
          title: "Feedback Foundations",
          price: "from £450",
          bullets: [
            "Review mining & journey audit",
            "Baseline NPS®/CSAT/CES & quick wins",
            "Prioritised roadmap (effort/impact)",
          ],
          cta: "Request audit",
        },
        momentum: {
          title: "Momentum Program",
          price: "from £850/mo",
          bullets: [
            "Hands-on implementation & enablement",
            "Monthly review cycles & dashboards",
            "Measured lift on key outcomes",
          ],
          cta: "Book discovery",
        },
        pulse: {
          title: "CX Pulse Report (weekly)",
          price: "from £190/mo",
          bullets: [
            "Social listening across X/LinkedIn/Reddit/Reviews",
            "Top themes, sentiment & competitor pulse",
            "1-page actionable summary + next steps",
          ],
          cta: "See sample report",
          footnote: "Starts manual, scales with automation. Cancel anytime.",
        },
      },

      pulseExplainer: {
        title: "What you get in the weekly CX Pulse",
        left: [
          "Sentiment pulse (WoW change, drivers)",
          "Emerging topics (3-5 themes with examples)",
          "Competitor comparison (optional)",
        ],
        right: [
          "Plain-English insight summary (what to do next)",
          "Lightweight dashboard (rolling trends)",
          "Delivery on the same weekday, every week",
        ],
      },

      cta: {
        title: "Ready for a sample?",
        body:
          "I’ll run a one-off CX Pulse on your brand and send you the PDF within a few days.",
        email: "Email hello@npsme.com",
        book: "Book discovery",
      },
    },
    cxCockpit: {
      seoTitle: "CX Cockpit (Demo) | NPS Me",
      seoDescription:
        "Explore your customer experience cockpit: NPS, journey stages, response funnels and verbatim themes in one place.",

      badge: "CX cockpit · demo",
      headline: "Fly your customer experience spaceship",
      intro:
        "A single view of NPS scores, journey stages, response funnels and verbatim themes. This demo cockpit uses the live NPS Me sandbox data.",

      liveFeed: "Live demo data feed",
      liveFeedNote:
        "For a real client build, this cockpit would connect to your production survey and CRM events.",

      leftTitle: "NPS & journey instrumentation",
      leftSub:
        "Filter by contact, company, result type and stage to see how your NPS is behaving across the customer journey.",

      upcomingDial: "Upcoming dial",
      raceTitle: "Race chart – NPS over time by segment",
      raceBody:
        "This panel will show a “race” animation of NPS by journey stage or by key customer segment, so you can literally watch different parts of the experience pull ahead or fall behind.",
      racePlaceholder: "Race chart placeholder",

      copilotTitle: "CX co-pilot summary",
      copilotBody:
        "Here we’ll add an AI “co-pilot” that reads the charts and verbatim themes and gives you a short briefing: where NPS is drifting, which journey stages are hurting, and where to focus next.",
      copilotPlaceholder: "AI commentary placeholder",
    },
    liveAdmin: {
      seoTitle: "Live Survey Admin | NPS Me",
      seoDescription: "Review and send live NPS invitations from your Envola customer list.",

      eyebrow: "Live programme · Envola",
      title: "Live survey admin",
      intro:
        "Track invitations through the full lifecycle, resend when needed, and review completed scores.",

      refresh: "Refresh",
      refreshing: "Refreshing…",

      kpi: {
        total: "Total",
        totalSub: "All invitations in file",
        pending: "Pending",
        pendingSub: "Not yet sent",
        sent: "Sent",
        sentSub: "Delivered or queued",
        started: "Started",
        startedSub: "Opened survey link",
        completed: "Completed",
        npsNA: "NPS: n/a",
        npsValue: "NPS: {nps}",
      },

      responseRate: "Response rate",

      errors: {
        loadUnable: "Unable to load data.",
        selectAtLeastOne: "Please select at least one invitation to send.",
        loadInvFail: "Failed to load invitations",
        loadRespFail: "Failed to load responses",
        sendFail: "Batch send failed",
        resendFail: "Resend failed",
        sendUnable: "We couldn’t send those invitations.",
        resendUnable: "We couldn’t resend that invitation.",
      },

      statusMsg: {
        sent: "Sent {successes} invitation{plural}{failSuffix}",
        failSuffix: ", {failures} failed.",
        resent: "Resent invitation {invitationId}.",
      },

      sections: {
        pending: "Pending",
        pendingHelp: "Select and send invitations.",
        sent: "Sent",
        sentHelp: "Resend if someone cannot find the email.",
        started: "Started",
        startedHelp: "These recipients opened the survey link.",
        completed: "Completed",
        completedHelp: "Scores are shown when a response exists in /npsme/live/responses.csv.",
      },

      actions: {
        selectAll: "Select all",
        deselectAll: "Deselect all",
        sendSelected: "Send selected",
        sending: "Sending…",
        resend: "Resend",
        resending: "Resending…",
      },

      empty: {
        loading: "Loading…",
        noPending: "No pending invitations.",
        noSent: "No sent invitations.",
        noStarted: "No started invitations.",
        noCompleted: "No completed invitations.",
      },

      table: {
        invitationId: "Invitation ID",
        name: "Name",
        email: "Email",
        device: "Device",
        am: "AM",
        status: "Status",
        lastSent: "Last sent",
        resends: "Resends",
        action: "Action",
        score: "Score",
        comment: "Comment",
        created: "Created",
      },

      misc: {
        dash: "-",
      },
    },
    whatIsNps: {
      seoTitle: "What is Net Promoter Score (NPS)? | NPS Me",
      seoDescription:
        "Plain English guide to Net Promoter Score (NPS): how it works, how to calculate it, where it helps, where it misleads, and how to act on feedback.",

      header: {
        iconLabel: "What is NPS?",
        tag: "Guide / Customer Experience",
        title: "What is Net Promoter Score (NPS)?",
        subtitle:
          "A practical explanation of how NPS works, where it is useful, where it can go wrong, and how to use it as a starting point for real customer improvement rather than just a number on a dashboard.",
      },

      core: {
        title: "The core NPS question",
        intro: "Net Promoter Score is built around one simple question:",
        question:
          "“How likely are you to recommend [company] to a friend or colleague?”",
        body1:
          "Respondents answer on a 0 to 10 scale, where 0 means “not at all likely” and 10 means “extremely likely”. What matters is not the average, but how people are grouped.",
        groupsTitle: "Three groups",
        groups: {
          detractors: {
            label: "Detractors (0-6)",
            text:
              "At risk, unhappy, or blocked. More likely to churn, complain, or warn others.",
          },
          passives: {
            label: "Passives (7-8)",
            text:
              "Reasonably satisfied but not enthusiastic. Could be tempted by a competitor.",
          },
          promoters: {
            label: "Promoters (9-10)",
            text:
              "Loyal advocates who are more likely to stay, expand, and recommend you.",
          },
        },
      },

      calc: {
        title: "How Net Promoter Score is calculated",
        intro:
          "The NPS formula is intentionally simple. For a given sample of responses:",
        steps: [
          "Work out the percentage of Promoters (9-10).",
          "Work out the percentage of Detractors (0-6).",
          "Subtract Detractors from Promoters.",
        ],
        example:
          "For example, if 60 percent of respondents are Promoters and 20 percent are Detractors, your NPS is {value}.",
        scaleLabel: "NPS scale illustration",
        bar: {
          detractors: "Detractors",
          passives: "Passives",
          promoters: "Promoters",
        },
      },

      types: {
        title: "Relationship NPS and transactional NPS",
        intro:
          "NPS is not a single thing. The same question behaves differently depending on when you ask it and what just happened to the customer.",
        relationship: {
          title: "Relationship NPS",
          body:
            "Sent periodically to a sample of customers to understand overall brand sentiment. This is the number that often appears on executive dashboards.",
          bullets: [
            "Good for tracking overall direction over time.",
            "Not great at highlighting exactly what is broken.",
          ],
        },
        transactional: {
          title: "Transactional or milestone NPS",
          body:
            "Sent after key journey moments, such as onboarding, first delivery, renewal, or support closure.",
          bullets: [
            "Pinpoints where the experience creates friction.",
            "Much more useful for guiding concrete improvements.",
          ],
        },
      },

      beyond: {
        title: "Beyond the score: why comments matter more than the number",
        p1:
          "A common criticism of NPS is that one number cannot capture the quality of a business. That is true. A single score on its own is a very crude signal. It is also shaped by culture and context.",
        p2:
          "Someone in one country may see a 7 out of 10 as a good mark. In another market, anything below a 9 looks mediocre. In some cultures people avoid giving 10 unless everything really is perfect. In others, giving a 10 is simply a polite way to say that things were fine.",
        p3:
          "This is why the open comment that sits next to the NPS question is so important. The comment tells you what is driving the score. It points to specific friction, specific delights, and real language that you can share internally.",
        bullets: [
          "Use NPS as a routing tool to the comments, not as the whole story.",
          "Read what Detractors are saying first, then look at Promoters.",
          "Look for patterns in language, not just changes of two or three points.",
        ],
      },

      pitfalls: {
        title: "Common pitfalls and how to avoid them",
        pitfallsTitle: "Pitfalls",
        pitfallsList: [
          "Focusing only on the headline score and ignoring underlying comments.",
          "Letting teams control who is invited to respond, which introduces bias.",
          "Over-surveying the same contacts and creating fatigue.",
          "Coaching customers to “give us a 9 or 10” instead of asking for honest feedback.",
        ],
        betterTitle: "Better practice",
        betterList: [
          "Use transparent, representative sampling rules.",
          "Track NPS alongside retention, repeat purchase, and support volume.",
          "Publish regular internal summaries that explain what customers are saying.",
          "Reward teams for fixing root causes, not for pushing the score up at all costs.",
        ],
      },

      closeLoop: {
        title: "Making NPS useful: close the loop and show progress",
        intro:
          "The value of NPS comes from what you do with it. The companies that see the most impact treat surveys as the start of a conversation, not the end.",
        bullets: [
          "Follow up with customers who raise issues, especially high value accounts.",
          "Group comments into themes that map to real processes and owners.",
          "Agree a small number of fixes, ship them, and track the effect on both NPS and hard outcomes.",
          "Share simple “you said, we did” updates so customers can see that speaking up is worth it.",
        ],
        outro:
          "Over time this builds trust. Customers see that feedback leads to change, teams see that insight leads to better results, and the NPS score becomes one useful signal in a wider customer health picture.",
      },

      cta: {
        title: "Want help designing an NPS program that actually drives change?",
        body:
          "NPS Me works with teams to design fair surveys, realistic sampling, and practical follow-up so that every point of feedback has somewhere to go.",
        explore: "Explore services",
        book: "Book a discovery call",
        disclaimer:
          "NPS and Net Promoter Score are registered service marks of Bain & Company, Inc., Fred Reichheld, and Satmetrix Systems, Inc. References on this page are descriptive only. NPS Me is independent and not affiliated with or endorsed by those parties.",
      },
    },
    whyNpsMe: {
      seoTitle: "Why NPS Me: Pragmatic CX consulting for real business impact",
      seoDescription:
        "NPS Me helps you turn customer feedback into measurable outcomes: higher retention, more repeat revenue, and lower support costs, without big-consultancy overhead.",

      header: {
        iconLabel: "Why NPS Me",
        tag: "NPS Me / Why NPS Me",
        title: "CX consulting that connects feedback to the bottom line",
        intro:
          "NPS Me exists to bridge a gap. Many teams collect NPS and survey data. Fewer turn it into fewer churn events, more repeat revenue, and less firefighting in support. We help you do that, quickly, without a huge consulting army on your payroll.",
        ctaBook: "Book a discovery call",
        ctaDemo: "Try the NPS style demo",
      },

      whatYouGet: {
        title: "What you get when you work with NPS Me",
        body:
          "We combine CX strategy, data analysis, and hands on enablement. That means we do not only tell you where the problems are. We help fix them with you. That can include survey design, review mining, workflow changes, scripts, training, dashboards, and even changes to your digital journeys and internal tools.",
        cards: {
          pnl: {
            title: "From feedback to P and L",
            points: [
              "Tie customer feedback to repeat rate, churn, and ticket volume.",
              "Prioritise changes by commercial impact, not loudest voice.",
              "Make it easy for Finance and CX to speak the same language.",
            ],
          },
          teams: {
            title: "Practical help for your teams",
            points: [
              "Coaching for account, support, and product teams.",
              "Templates, playbooks, and scripts that fit your tone of voice.",
              "Support to embed new routines, not just one off workshops.",
            ],
          },
          systems: {
            title: "Systems and journeys that work",
            points: [
              "Help to tune surveys, journeys, forms, and messaging.",
              "Partner with your product or IT teams on small but high impact changes.",
              "Make better use of the tools you already own before buying new ones.",
            ],
          },
        },
      },

      vs: {
        title: "Why choose us instead of a big consulting firm",
        body:
          "Large audit and consulting firms can do great work, but they also come with high overhead, long lead times, and a lot of people in the room. NPS Me is built to be lean, expert, and focused on movement, not theatre.",

        leftTitle: "Typical big consultancy",
        leftPoints: [
          "Layers of partners, directors, and juniors on projects.",
          "Set piece reports and frameworks that may not fit your reality.",
          "High day rates and long commitments before you see value.",
          "Focus on the slide deck more than on your teams changing how they work.",
        ],

        rightTitle: "NPS Me approach",
        rightPoints: [
          "Direct access to an experienced CX lead, not a revolving junior team.",
          "Work shaped around your existing tools and data, not a generic template.",
          "Transparent, scoped engagements that respect your budget.",
          "Hands on support for implementation, not just recommendations.",
        ],

        footnote:
          "NPS Me is part of the cxms.fr group, which combines customer experience expertise with practical digital and data skills. That means we can help you both understand the story in your feedback and build the processes, content, and journeys that move the numbers.",
      },

      reassurance: {
        title: "How working with us feels",
        items: [
          "Clear framing of the problem and what success looks like.",
          "Regular, honest check ins. No hiding behind jargon.",
          "Simple artefacts your teams actually read and use.",
          "Respect for your constraints, culture, and in house expertise.",
          "A focus on sustainable change, not one quarter spikes.",
          "A partner who can speak to execs and practitioners in the same week.",
        ],
        ctaProducts: "Explore productized services",
        ctaBook: "Book discovery",
      },
    },
  },
  fr: {
    navbar: {
      bookDiscovery: "Prendre rendez-vous",
      languageEn: "EN",
      languageFr: "FR",
    },
    routes: {
      products: "Produits",
      whyNpsMe: "Pourquoi NPS Me",
      milestoneNps: "Parcours NPS",
      npsSurveyProgramme: "Programme d’enquête NPS",
      whatIsNps: "Qu’est-ce que le NPS ?",
      dataAutomation: "Données & automatisation",
      socialListening: "Social listening",
      blog: "Blog",
      cxCockpit: "Cockpit CX",
    },
    milestonePage: {
      seoTitle: "NPS® transactionnel (milestones) & signaux d’enquête | NPS Me",
      seoDescription:
        "Captez le sentiment client aux moments clés du parcours pour révéler les frictions en contexte. Mettez en place le close-the-loop et le suivi des thèmes pour une CX actionnable.",

      header: {
        iconLabel: "NPS milestone / transactionnel",
        tag: "NPS Me / NPS Milestone",
        title: "NPS transactionnel (milestones) & signaux d’enquête",
        intro:
          "Un cadre pratique pour capter le feedback aux moments clés du parcours, le transformer en plan d’action priorisé, et mesurer l’amélioration. Nous utilisons la référence Net Promoter Score (NPS)® de façon descriptive, aux côtés de la CSAT, du CES et des données comportementales.",
        ctaImpact: "Estimer votre impact",
        ctaBook: "Prendre rendez-vous",
      },

      method: {
        title: "La méthode en 4 étapes (simple, répétable)",
        intro:
          "Des étapes claires, des quick wins, et des améliorations qui se cumulent. On part de votre réalité et on priorise ce qui fait bouger les résultats.",
        cards: [
          {
            title: "1) Diagnostic",
            desc: "Audit des avis, enquêtes, tickets et parcours. Cartographie des frictions. Définition d’une baseline.",
          },
          {
            title: "2) Recommandations",
            desc: "Playbook priorisé avec responsables, scores effort/impact et calendrier.",
          },
          {
            title: "3) Mise en œuvre",
            desc: "Accompagnement terrain : scripts, templates, automatisations, formation. Déblocage rapide.",
          },
          {
            title: "4) Pilotage",
            desc: "Suivi NPS/CSAT/CES & dynamique des avis. Itérations mensuelles. On consolide et on scale ce qui marche.",
          },
        ],
      },

      fit: {
        title: "Où placer les enquêtes “milestone”",
        cards: [
          {
            title: "Commande passée",
            q: "Suite à votre expérience de commande, quelle est la probabilité que vous nous recommandiez (0–10) ?",
            why: "Tester la clarté du checkout, la transparence des prix et la fiabilité du paiement.",
          },
          {
            title: "Onboarding terminé",
            q: "Après l’onboarding, quelle est la probabilité que vous nous recommandiez (0–10) ?",
            why: "Mesurer les frictions de mise en route, les trous de documentation et la qualité d’activation.",
          },
          {
            title: "Première utilisation / livraison",
            q: "Après votre première utilisation/livraison, quelle est la probabilité que vous nous recommandiez (0–10) ?",
            why: "Révéler la vitesse/précision, la maturité produit et la qualité de la première expérience.",
          },
        ],
      },

      checklist: {
        stepsTitle: "Mise en œuvre en 5 étapes",
        steps: [
          "Définir les milestones (checkout, onboarding, premier bénéfice, renouvellement, clôture support).",
          "Déclencher les enquêtes via votre stack existant (ESP, produit, helpdesk, CDP).",
          "Poser la question 0–10 + une question ouverte ; rester court.",
          "Centraliser les résultats et taguer par milestone.",
          "Boucler la boucle (close-the-loop) et mener une revue mensuelle des causes racines.",
        ],
      },

      track: {
        title: "Ce que nous suivons",
        items: [
          "Distribution des scores par milestone (Promoteurs/Passifs/Détracteurs).",
          "Thèmes par fréquence & impact (effort vs volume).",
          "Délais de recontact & taux de close-the-loop.",
          "Effets aval (répétition des tickets, risque de churn, dynamique des avis).",
        ],
      },
    },
    landing: {
      seo: {
        title: "Conseil CX & amélioration du NPS® | NPS Me",
        description:
          "Conseil CX pragmatique pour diagnostiquer les frictions, prioriser les actions et livrer des gains mesurables : hausse du NPS®, baisse du churn, hausse de la rétention.",
      },

      hero: {
        h1: {
          lead: "Conseil en expérience client (CX) pour améliorer le",
          nps: "Net Promoter Score (NPS)®",
          tail: "la rétention et la croissance.",
          accent: "Transformer le feedback en décisions.",
        },
        body:
          "NPS Me aide les équipes à piloter le NPS et les feedbacks « par étape » via leur stack existante (Intercom, HubSpot, helpdesk, événements produit ou CSV). Nous apportons la couche qui manque souvent : gouvernance d’enquête, échantillonnage robuste et insights actionnables pour relier le verbatim aux priorités business.",
        ctaPrimary: "Réserver un échange",
        ctaMethod: "Voir la méthode en 4 étapes",
        ctaDemo: "Tester la démo NPS®",
        proof: {
          mining: "Analyse d’avis",
          enablement: "Mise en œuvre terrain",
          lift: "Gains mesurables",
        },
        chips: ["Intercom", "HubSpot", "Zendesk", "Événements produit", "Import CSV"],
        chipsNote:
          "NPS Me complète vos outils existants. Notre focus : gouvernance, analyse et mise en action — pas le remplacement de votre plateforme CS.",
      },

      method: {
        title: "Une méthode CX simple et reproductible pour faire progresser le NPS®",
        body:
          "Étapes claires, quick wins et amélioration continue. On s’adapte à votre contexte et on priorise ce qui a le plus d’impact.",
        cards: [
          {
            title: "1) Diagnostic",
            desc: "Analyse des avis, enquêtes et parcours internes. Cartographie des frictions. Baseline des indicateurs.",
          },
          {
            title: "2) Recommandations",
            desc: "Plan d’actions priorisé (impact/effort), responsables, séquencement et hypothèses de gains.",
          },
          {
            title: "3) Mise en œuvre",
            desc: "Outillage, automatisations, scripts et formation. Accompagnement opérationnel pour livrer vite.",
          },
          {
            title: "4) Pilotage",
            desc: "Suivi NPS/CSAT/CES et vélocité d’avis. Itérations mensuelles, arbitrages et passage à l’échelle.",
          },
        ],
      },

      demoBlock: {
        title: "Tester la démo NPS® (prête pour le close-the-loop)",
        body:
          "La démo montre le lien entre invitations, réponses et indicateurs NPS. En production, le ciblage et l’envoi restent souvent dans votre plateforme CS ; NPS Me ingère les retours pour analyser, prioriser et déclencher des actions. Les chiffres affichés ici proviennent de l’environnement de démo.",
        cta: "Lancer la démo et voir les résultats",
        note:
          "Ouvre la page dédiée : vous pouvez vous envoyer une invitation, répondre, puis explorer le NPS et les scores par étape.",
      },

      platform: {
        title: "Pas un énième outil d’enquête",
        body:
          "La plupart des équipes ont déjà un outil d’envoi. NPS Me vous aide à opérer un programme fiable, comparable dans le temps et utile pour décider — quel que soit votre stack.",
        cards: [
          {
            title: "Gouvernance",
            desc: "Échantillonnage, cadence, anti-biais et comparabilité pour que le score soit interprétable.",
          },
          {
            title: "Interprétation",
            desc: "Analyse des thèmes et drivers, contrôles de robustesse et priorisation claire des actions.",
          },
          {
            title: "Close the loop",
            desc: "Workflows de suivi et mesure d’impact pour relier feedback → actions → résultats.",
          },
        ],
      },

      about: {
        title: "À propos",
        body:
          "Nous combinons expertise NPS/CX, analyse quantitative et accompagnement opérationnel. Objectif : réduire les frictions, améliorer le ressenti et piloter des gains mesurables. Le NPS® est utilisé de manière descriptive, aux côtés d’autres métriques.",
        bullets: [
          "Analyse approfondie des avis (Google, Trustpilot, in-product)",
          "VoC → VoP : relier la voix du client aux processus",
          "Roadmap priorisée (impact/effort) et responsabilisation",
          "Enablement : playbooks, scripts, templates, formation",
          "Mesure : instrumentation NPS/CSAT/CES et vélocité d’avis",
        ],
      },

      contact: {
        title: "Prêt à transformer le feedback en croissance ?",
        body:
          "Réservez un échange de 30 minutes. On passe en revue vos scores et on identifie des quick wins concrets.",
        emailCta: "Écrire à hello@npsme.com",
        bookCta: "Demander un rendez-vous",
      },
    },
    surveyProgramme: {
      seoTitle: "Votre programme d’enquête NPS personnalisé | NPS Me",
      seoDescription:
        "Transmettez votre liste clients et nous déployons un programme NPS structuré : invitations, relances, dashboards et exports prêts pour l’analyse.",

      header: {
        iconLabel: "Programme d’enquête NPS",
        tag: "NPS Me / Programme d’enquête",
        accent: "Votre programme d’enquête NPS personnalisé",
        subtitle:
          "Fournissez un fichier de contacts clients et nous déployons pour vous un programme NPS structuré — invitations, relances, dashboards et données prêtes à exporter — pour que vous puissiez vous concentrer sur l’action, pas sur les outils.",
      },

      howItWorks: {
        title: "Comment ça marche",
        stepLabel: "Étape {n}",
        steps: [
          {
            step: "1",
            title: "Déposez votre liste",
            text:
              "Vous nous envoyez un CSV/Excel avec le nom, l’email, l’entreprise et les regroupements utiles (secteur, segment, persona, CSM, etc.).",
          },
          {
            step: "2",
            title: "Nous paramétrons l’enquête",
            text:
              "Nous configurons l’enquête NPS, le branding et le calendrier — y compris qui interroger, quand, et la fréquence des relances.",
          },
          {
            step: "3",
            title: "Invitations & relances",
            text:
              "Les invitations partent par email, avec relances ciblées possibles pour les non-répondants. Chaque réponse est tracée et stockée pour l’analyse.",
          },
          {
            step: "4",
            title: "Dashboard CX en direct",
            text:
              "Vous disposez d’un portail sécurisé avec NPS en temps réel, taux de réponse et verbatims, plus des exports CSV prêts pour PowerPoint, Excel ou votre outil BI.",
          },
        ],
      },

      pulseBox: {
        title: "Idéal pour un baromètre client rapide et simple à lancer",
        body:
          "Si vous avez une liste de clients à interroger rapidement, nous pouvons lancer une enquête NPS focalisée en quelques jours — pas en quelques mois. Vous envoyez la liste, nous gérons les invitations et le suivi, et vous vous connectez pour voir le NPS, l’avancement et les commentaires en temps réel.",
        bullets: [
          "Un seul upload CSV — pas d’outil complexe pour vos équipes.",
          "Enquête NPS brandée, adaptée à votre ton de voix.",
          "NPS et taux de complétion en direct pendant la fenêtre d’enquête.",
          "Filtre des commentaires par segment, persona ou CSM.",
        ],
      },

      twoCol: {
        left: {
          title: "Dashboard client",
          intro:
            "Chaque client dispose d’une vue sécurisée de son programme — sans lourdeur d’admin ni outil complexe. Ils peuvent voir :",
          bullets: [
            "NPS actuel et taux de réponse.",
            "Découpes par segment, secteur ou persona.",
            "Verbatims prêts à taguer et partager.",
            "Export CSV du statut à tout moment.",
          ],
        },
        right: {
          title: "Sous le capot",
          intro:
            "En coulisses, NPS Me gère le stockage sécurisé, la déduplication des invitations, le suivi et les relances — sans que vous ayez à construire (ou acheter) une plateforme CX lourde juste pour un programme d’enquête.",
          bullets: [
            "Fichier contacts stocké de façon sécurisée et versionné.",
            "Liens uniques par client pour éviter les doublons de réponse.",
            "Notifications optionnelles à l’arrivée de nouvelles réponses.",
            "Traçabilité claire de ce qui a été envoyé, et quand.",
          ],
        },
      },

      cta: {
        title: "Vous voulez lancer une enquête NPS auprès de vos clients ?",
        body:
          "Partagez votre liste clients et une date cible de lancement : nous vous proposerons un plan simple de bout en bout — incluant le contenu email, le timing et le reporting.",
        button: "Parlons-en pour mettre en place votre programme →",
      },

      demo: {
        title: "Tester la démo d’enquête NPS",
        body:
          "Découvrez le fonctionnement des invitations, relances, scoring et dashboards — exactement comme vos clients le vivraient. Rapide, sans risque, et conçu pour montrer comment NPS Me exécute des programmes complets.",
        button: "Ouvrir la démo NPS",
        note: "Envoie une vraie invitation et enregistre votre réponse démo dans les métriques.",
      },
    },

    products: {
      seoTitle:
        "Offres CX packagées : audits, programme Momentum & CX Pulse hebdo | NPS Me",
      seoDescription:
        "Choisissez une offre CX pour améliorer le NPS®, réduire la charge support et augmenter la rétention : Feedback Foundations, Momentum Program et rapports CX Pulse hebdomadaires.",

      header: {
        iconLabel: "Offres CX packagées",
        tag: "NPS Me / Services",
        accent: "Offres packagées",
        title: "qui transforment le feedback en croissance",
        subtitle:
          "Choisissez le pack adapté à votre étape : bases, accompagnement, ou un flux hebdomadaire d’insights CX actionnables.",
      },

      cards: {
        foundations: {
          title: "Feedback Foundations",
          price: "à partir de 450 £",
          bullets: [
            "Analyse des avis & audit du parcours",
            "NPS®/CSAT/CES de référence & quick wins",
            "Roadmap priorisée (effort/impact)",
          ],
          cta: "Demander un audit",
        },
        momentum: {
          title: "Momentum Program",
          price: "à partir de 850 £/mois",
          bullets: [
            "Mise en œuvre & accompagnement",
            "Cycles mensuels & dashboards",
            "Amélioration mesurée des résultats",
          ],
          cta: "Prendre rendez-vous",
        },
        pulse: {
          title: "Rapport CX Pulse (hebdo)",
          price: "à partir de 190 £/mois",
          bullets: [
            "Social listening (X/LinkedIn/Reddit/Avis)",
            "Thèmes clés, sentiment & pouls concurrentiel",
            "Synthèse actionnable (1 page) + prochaines étapes",
          ],
          cta: "Voir un exemple",
          footnote:
            "Démarre en manuel, évolue vers l’automatisation. Résiliable à tout moment.",
        },
      },

      pulseExplainer: {
        title: "Ce que vous recevez dans le CX Pulse hebdomadaire",
        left: [
          "Baromètre de sentiment (évolution semaine/semaine, causes)",
          "Sujets émergents (3–5 thèmes avec exemples)",
          "Comparaison concurrentielle (option)",
        ],
        right: [
          "Synthèse claire (quoi faire ensuite)",
          "Dashboard léger (tendances)",
          "Livraison le même jour chaque semaine",
        ],
      },

      cta: {
        title: "Prêt pour un exemple ?",
        body:
          "Je réalise un CX Pulse ponctuel sur votre marque et je vous envoie le PDF sous quelques jours.",
        email: "Écrire à hello@npsme.com",
        book: "Prendre rendez-vous",
      },
    },
    cxCockpit: {
      seoTitle: "Cockpit CX (Démo) | NPS Me",
      seoDescription:
        "Explorez votre cockpit d’expérience client : NPS, étapes du parcours, tunnel de réponses et thèmes verbatim, au même endroit.",

      badge: "Cockpit CX · démo",
      headline: "Pilotez votre vaisseau d’expérience client",
      intro:
        "Une vue unique sur les scores NPS, les étapes du parcours, le tunnel de réponses et les thèmes verbatim. Cette démo utilise les données sandbox NPS Me en temps réel.",

      liveFeed: "Flux de données démo en direct",
      liveFeedNote:
        "Pour un déploiement client, ce cockpit se connecterait à votre enquête en production et aux événements CRM.",

      leftTitle: "Instrumentation NPS & parcours",
      leftSub:
        "Filtrez par contact, entreprise, type de résultat et étape pour voir comment votre NPS évolue tout au long du parcours client.",

      upcomingDial: "Indicateur à venir",
      raceTitle: "Graphique “race” – NPS dans le temps par segment",
      raceBody:
        "Ce panneau affichera une animation “race” du NPS par étape du parcours ou par segment clé, pour visualiser en direct quelles parties de l’expérience prennent de l’avance… ou décrochent.",
      racePlaceholder: "Emplacement du graphique race",

      copilotTitle: "Résumé du co-pilote CX",
      copilotBody:
        "Ici, nous ajouterons un “co-pilote” IA qui lit les graphiques et les thèmes verbatim et vous donne un briefing : où le NPS dérive, quelles étapes du parcours posent problème, et où concentrer vos efforts.",
      copilotPlaceholder: "Emplacement du commentaire IA",
    },
     liveAdmin: {
      seoTitle: "Admin enquête live | NPS Me",
      seoDescription:
        "Gérez et envoyez des invitations NPS en direct depuis votre liste clients Envola.",

      eyebrow: "Programme live · Envola",
      title: "Administration enquête live",
      intro:
        "Suivez les invitations de bout en bout, renvoyez si besoin, et consultez les scores terminés.",

      refresh: "Rafraîchir",
      refreshing: "Rafraîchissement…",

      kpi: {
        total: "Total",
        totalSub: "Toutes les invitations du fichier",
        pending: "En attente",
        pendingSub: "Pas encore envoyées",
        sent: "Envoyées",
        sentSub: "Envoyées ou en file",
        started: "Commencées",
        startedSub: "Lien ouvert",
        completed: "Terminées",
        npsNA: "NPS : n/a",
        npsValue: "NPS : {nps}",
      },

      responseRate: "Taux de réponse",

      errors: {
        loadUnable: "Impossible de charger les données.",
        selectAtLeastOne: "Veuillez sélectionner au moins une invitation à envoyer.",
        loadInvFail: "Échec du chargement des invitations",
        loadRespFail: "Échec du chargement des réponses",
        sendFail: "Échec de l’envoi groupé",
        resendFail: "Échec du renvoi",
        sendUnable: "Impossible d’envoyer ces invitations.",
        resendUnable: "Impossible de renvoyer cette invitation.",
      },

      statusMsg: {
        sent: "{successes} invitation{plural} envoyée{plural}{failSuffix}",
        failSuffix: ", {failures} en échec.",
        resent: "Invitation {invitationId} renvoyée.",
      },

      sections: {
        pending: "En attente",
        pendingHelp: "Sélectionnez puis envoyez des invitations.",
        sent: "Envoyées",
        sentHelp: "Renvoyez si la personne ne retrouve pas l’email.",
        started: "Commencées",
        startedHelp: "Ces destinataires ont ouvert le lien du questionnaire.",
        completed: "Terminées",
        completedHelp:
          "Les scores s’affichent lorsqu’une réponse existe dans /npsme/live/responses.csv.",
      },

      actions: {
        selectAll: "Tout sélectionner",
        deselectAll: "Tout désélectionner",
        sendSelected: "Envoyer la sélection",
        sending: "Envoi…",
        resend: "Renvoyer",
        resending: "Renvoi…",
      },

      empty: {
        loading: "Chargement…",
        noPending: "Aucune invitation en attente.",
        noSent: "Aucune invitation envoyée.",
        noStarted: "Aucune invitation commencée.",
        noCompleted: "Aucune invitation terminée.",
      },

      table: {
        invitationId: "ID invitation",
        name: "Nom",
        email: "Email",
        device: "Appareil",
        am: "AM",
        status: "Statut",
        lastSent: "Dernier envoi",
        resends: "Renvois",
        action: "Action",
        score: "Score",
        comment: "Commentaire",
        created: "Créé",
      },

      misc: {
        dash: "-",
      },
    },
    whatIsNps: {
      seoTitle: "Qu’est-ce que le Net Promoter Score (NPS) ? | NPS Me",
      seoDescription:
        "Guide en français sur le Net Promoter Score (NPS) : fonctionnement, calcul, cas d’usage, pièges courants et comment agir sur les verbatims.",

      header: {
        iconLabel: "Qu’est-ce que le NPS ?",
        tag: "Guide / Expérience client",
        title: "Qu’est-ce que le Net Promoter Score (NPS) ?",
        subtitle:
          "Une explication pratique : comment le NPS fonctionne, quand il est utile, où il peut induire en erreur, et comment l’utiliser comme point de départ pour des améliorations concrètes — pas seulement comme un chiffre dans un dashboard.",
      },

      core: {
        title: "La question NPS de base",
        intro: "Le Net Promoter Score s’appuie sur une question simple :",
        question:
          "« Dans quelle mesure recommanderiez-vous [entreprise] à un ami ou un collègue ? »",
        body1:
          "Les répondants notent de 0 à 10, où 0 signifie « pas du tout probable » et 10 « extrêmement probable ». Ce qui compte n’est pas la moyenne, mais la répartition par groupes.",
        groupsTitle: "Trois groupes",
        groups: {
          detractors: {
            label: "Détracteurs (0–6)",
            text:
              "Insatisfaits, bloqués ou à risque. Plus susceptibles de churn, de se plaindre ou de décourager d’autres personnes.",
          },
          passives: {
            label: "Passifs (7–8)",
            text:
              "Plutôt satisfaits, mais pas enthousiastes. Peuvent basculer chez un concurrent.",
          },
          promoters: {
            label: "Promoteurs (9–10)",
            text:
              "Ambassadeurs fidèles, plus susceptibles de rester, d’étendre l’usage et de recommander.",
          },
        },
      },

      calc: {
        title: "Comment le Net Promoter Score est calculé",
        intro:
          "La formule du NPS est volontairement simple. Pour un échantillon de réponses :",
        steps: [
          "Calculez le pourcentage de Promoteurs (9–10).",
          "Calculez le pourcentage de Détracteurs (0–6).",
          "Soustrayez les Détracteurs aux Promoteurs.",
        ],
        example:
          "Par exemple, si 60 % des répondants sont Promoteurs et 20 % sont Détracteurs, votre NPS est {value}.",
        scaleLabel: "Illustration de l’échelle NPS",
        bar: {
          detractors: "Détracteurs",
          passives: "Passifs",
          promoters: "Promoteurs",
        },
      },

      types: {
        title: "NPS relationnel et NPS transactionnel",
        intro:
          "Le NPS n’est pas une chose unique. La même question se comporte différemment selon le moment où vous la posez et ce que le client vient de vivre.",
        relationship: {
          title: "NPS relationnel",
          body:
            "Envoyé périodiquement à un échantillon de clients pour mesurer le sentiment global envers la marque. C’est souvent le chiffre présenté dans les dashboards exécutifs.",
          bullets: [
            "Utile pour suivre la tendance globale dans le temps.",
            "Moins utile pour identifier précisément ce qui dysfonctionne.",
          ],
        },
        transactional: {
          title: "NPS transactionnel (ou “milestone”)",
          body:
            "Envoyé après un moment clé du parcours : onboarding, première livraison, renouvellement, clôture d’un ticket support, etc.",
          bullets: [
            "Permet de localiser les frictions dans le parcours.",
            "Beaucoup plus actionnable pour prioriser des améliorations concrètes.",
          ],
        },
      },

      beyond: {
        title: "Au-delà du score : pourquoi les commentaires comptent plus que le chiffre",
        p1:
          "Une critique fréquente du NPS : un seul nombre ne peut pas résumer la qualité d’une entreprise. C’est vrai. Pris isolément, le score est un signal très grossier, et il varie selon la culture et le contexte.",
        p2:
          "Dans certains pays, un 7/10 peut être perçu comme une bonne note. Dans d’autres marchés, tout ce qui est en dessous de 9 paraît moyen. Certaines cultures évitent de mettre 10 sauf perfection absolue. D’autres utilisent 10 comme une forme de politesse pour dire que “c’était correct”.",
        p3:
          "C’est pour cela que le commentaire ouvert associé à la question NPS est essentiel. Il explique ce qui motive la note : frictions concrètes, points forts, et formulation réelle que vous pouvez partager en interne.",
        bullets: [
          "Utilisez le NPS comme un routeur vers les verbatims, pas comme l’histoire complète.",
          "Lisez d’abord les Détracteurs, puis regardez les Promoteurs.",
          "Cherchez des patterns de langage, pas seulement des variations de 2 ou 3 points.",
        ],
      },

      pitfalls: {
        title: "Pièges courants et comment les éviter",
        pitfallsTitle: "Pièges",
        pitfallsList: [
          "Se focaliser uniquement sur le score et ignorer les verbatims.",
          "Laisser les équipes décider qui reçoit l’enquête, ce qui introduit un biais.",
          "Sur-solliciter les mêmes contacts et créer de la fatigue.",
          "Inciter les clients à “mettre 9 ou 10” au lieu de demander un retour honnête.",
        ],
        betterTitle: "Meilleures pratiques",
        betterList: [
          "Mettre en place des règles d’échantillonnage transparentes et représentatives.",
          "Suivre le NPS avec la rétention, le repeat purchase et la charge support.",
          "Publier des synthèses internes régulières sur ce que disent les clients.",
          "Récompenser la résolution des causes racines, pas la “poussée” du score à tout prix.",
        ],
      },

      closeLoop: {
        title: "Rendre le NPS utile : “close the loop” et démontrer les progrès",
        intro:
          "La valeur du NPS vient de ce que vous en faites. Les entreprises qui obtiennent le plus d’impact traitent l’enquête comme le début d’une conversation, pas comme la fin.",
        bullets: [
          "Recontacter les clients qui remontent des problèmes, surtout sur les comptes à forte valeur.",
          "Regrouper les verbatims en thèmes reliés à des processus réels et des owners.",
          "Choisir quelques actions, les livrer, puis mesurer l’effet sur le NPS et sur les résultats business.",
          "Partager des retours simples du type « vous avez dit / nous avons fait » pour montrer que ça sert à quelque chose.",
        ],
        outro:
          "Avec le temps, cela crée de la confiance. Les clients voient que leur feedback déclenche des changements, les équipes voient que l’insight améliore les résultats, et le NPS devient un signal utile parmi d’autres dans la santé client.",
      },

      cta: {
        title: "Besoin d’aide pour concevoir un programme NPS qui génère de vrais changements ?",
        body:
          "NPS Me accompagne les équipes pour concevoir des enquêtes justes, un échantillonnage réaliste, et des boucles de suivi pratiques — afin que chaque feedback mène quelque part.",
        explore: "Découvrir les offres",
        book: "Prendre rendez-vous",
        disclaimer:
          "NPS et Net Promoter Score sont des marques de service déposées de Bain & Company, Inc., Fred Reichheld, et Satmetrix Systems, Inc. Les références sur cette page sont purement descriptives. NPS Me est indépendant et n’est ni affilié ni sponsorisé par ces parties.",
      },
    },
    whyNpsMe: {
      seoTitle: "Pourquoi NPS Me : un conseil CX pragmatique pour un impact business réel",
      seoDescription:
        "NPS Me vous aide à transformer le feedback client en résultats mesurables : plus de rétention, plus de revenus récurrents, et moins de coûts support, sans l’overhead des grands cabinets.",

      header: {
        iconLabel: "Pourquoi NPS Me",
        tag: "NPS Me / Pourquoi NPS Me",
        title: "Un conseil CX qui relie le feedback à l’impact business",
        intro:
          "NPS Me existe pour combler un écart. Beaucoup d’équipes collectent du NPS et des données d’enquête. Peu les transforment en moins de churn, plus de revenus récurrents, et moins de “firefighting” côté support. Nous vous aidons à y arriver, rapidement, sans une armée de consultants sur votre payroll.",
        ctaBook: "Prendre un appel découverte",
        ctaDemo: "Tester la démo NPS",
      },

      whatYouGet: {
        title: "Ce que vous obtenez en travaillant avec NPS Me",
        body:
          "Nous combinons stratégie CX, analyse de données et accompagnement terrain. Concrètement : on ne se contente pas d’indiquer où sont les problèmes. On vous aide à les résoudre. Cela peut inclure la conception d’enquêtes, l’analyse des avis, des ajustements de workflows, des scripts et formations, des dashboards, et des évolutions de parcours digitaux ou d’outils internes.",
        cards: {
          pnl: {
            title: "Du feedback au P&L",
            points: [
              "Relier le feedback client à la rétention, au churn et au volume de tickets.",
              "Prioriser par impact commercial, pas par “la voix la plus forte”.",
              "Aligner Finance et CX avec un langage commun et des métriques actionnables.",
            ],
          },
          teams: {
            title: "De l’aide concrète pour vos équipes",
            points: [
              "Coaching pour les équipes account, support et produit.",
              "Templates, playbooks et scripts adaptés à votre ton de marque.",
              "Accompagnement pour ancrer de nouvelles routines, pas seulement des ateliers ponctuels.",
            ],
          },
          systems: {
            title: "Des systèmes et parcours qui fonctionnent",
            points: [
              "Optimisation des enquêtes, parcours, formulaires et messages.",
              "Partenariat avec vos équipes produit ou IT sur des changements petits mais à fort impact.",
              "Mieux exploiter les outils que vous avez déjà avant d’en acheter de nouveaux.",
            ],
          },
        },
      },

      vs: {
        title: "Pourquoi nous choisir plutôt qu’un grand cabinet",
        body:
          "Les grands cabinets peuvent faire du très bon travail, mais ils viennent aussi avec une structure coûteuse, des délais longs, et beaucoup de monde dans la pièce. NPS Me est construit pour être lean, expert, et focalisé sur le mouvement, pas sur le théâtre.",

        leftTitle: "Cabinet “classique”",
        leftPoints: [
          "Couches de partners, directeurs et juniors sur les missions.",
          "Rapports et frameworks “standard” qui ne collent pas toujours à votre réalité.",
          "TJM élevés et engagements longs avant de voir de la valeur.",
          "Focus sur le deck plus que sur le changement réel dans les équipes.",
        ],

        rightTitle: "Approche NPS Me",
        rightPoints: [
          "Accès direct à un lead CX expérimenté, pas une équipe junior qui tourne.",
          "Travail construit autour de vos outils et données existants, pas un template générique.",
          "Missions cadrées et transparentes, compatibles avec votre budget.",
          "Aide à l’implémentation, pas seulement des recommandations.",
        ],

        footnote:
          "NPS Me fait partie du groupe cxms.fr, qui combine expertise CX et compétences data/digital concrètes. Cela permet de comprendre l’histoire dans vos feedbacks et de construire les process, contenus et parcours qui font bouger les chiffres.",
      },

      reassurance: {
        title: "Ce que ça fait de travailler avec nous",
        items: [
          "Un cadrage clair : problème, objectifs, et définition du succès.",
          "Des points réguliers, honnêtes. Pas de jargon pour se cacher.",
          "Des livrables simples que les équipes lisent vraiment et utilisent.",
          "Respect de vos contraintes, de votre culture et de l’expertise interne.",
          "Un focus sur le changement durable, pas des pics sur un trimestre.",
          "Un partenaire capable de parler aux execs et aux opérationnels la même semaine.",
        ],
        ctaProducts: "Découvrir les offres packagées",
        ctaBook: "Prendre rendez-vous",
      },
    },
  },
};

/**
 * Very small translation helper.
 * Example: t(lang, "navbar.bookDiscovery", "Book discovery")
 */
export function translations(lang, path, fallback) {
  // ✅ Guard: never crash if a caller passes undefined/null/non-string
  if (typeof path !== "string" || !path.trim()) {
    return fallback !== undefined ? fallback : "";
  }

  const parts = path.split(".");
  let current = TRANSLATIONS[lang] || TRANSLATIONS.en;

  for (const p of parts) {
    if (current && Object.prototype.hasOwnProperty.call(current, p)) {
      current = current[p];
    } else {
      current = undefined;
      break;
    }
  }

  if (typeof current === "string") return current;
  return fallback !== undefined ? fallback : path;
}
