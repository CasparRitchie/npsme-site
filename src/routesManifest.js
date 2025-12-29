// src/routesManifest.js
export const ROUTES_MANIFEST = [
  // Home
  { path: "/",            label: "Home",                 labelKey: "routes.home",                 enabled: true,  inHeader: false, inFooter: false, lang: "en" },
  { path: "/fr",          label: "Accueil",              labelKey: "routes.home",                 enabled: true,  inHeader: false, inFooter: false, lang: "fr" },

  // Core site
  { path: "/products",    label: "Products",             labelKey: "routes.products",             enabled: true,  inHeader: true,  inFooter: true,  lang: "en" },
  { path: "/fr/products", label: "Produits",             labelKey: "routes.products",             enabled: true,  inHeader: true,  inFooter: true,  lang: "fr" },

  { path: "/impact",      label: "Impact",               labelKey: "routes.impact",               enabled: true,  inHeader: false, inFooter: true,  lang: "en" },
  { path: "/fr/impact",   label: "Impact",               labelKey: "routes.impact",               enabled: true,  inHeader: false, inFooter: true,  lang: "fr" },

  { path: "/why-nps-me",      label: "Why NPS Me",       labelKey: "routes.whyNpsMe",             enabled: true,  inHeader: true,  inFooter: true,  lang: "en" },
  { path: "/fr/why-nps-me",   label: "Pourquoi NPS Me",  labelKey: "routes.whyNpsMe",             enabled: true,  inHeader: true,  inFooter: true,  lang: "fr" },

  { path: "/milestone-nps",     label: "Milestone NPS",  labelKey: "routes.milestoneNps",         enabled: true,  inHeader: true,  inFooter: true,  lang: "en" },
  { path: "/fr/milestone-nps",  label: "Étapes NPS",     labelKey: "routes.milestoneNps",         enabled: true,  inHeader: true,  inFooter: true,  lang: "fr" },

  { path: "/nps-survey-programme",     label: "NPS Survey Programme", labelKey: "routes.npsSurveyProgramme", enabled: true, inHeader: true, inFooter: true, lang: "en" },
  { path: "/fr/nps-survey-programme",  label: "Programme NPS",        labelKey: "routes.npsSurveyProgramme", enabled: true, inHeader: true, inFooter: true, lang: "fr" },

  { path: "/what-is-nps",     label: "What is NPS?",     labelKey: "routes.whatIsNps",            enabled: true,  inHeader: true,  inFooter: true,  lang: "en" },
  { path: "/fr/what-is-nps",  label: "Qu’est-ce que le NPS ?", labelKey: "routes.whatIsNps",      enabled: true,  inHeader: true,  inFooter: true,  lang: "fr" },

  { path: "/nps-intelligence-layer",     label: "NPS Intelligence Layer",          labelKey: "routes.npsIntelligenceLayer", enabled: true,  inHeader: true,  inFooter: true,  lang: "en" },
  { path: "/fr/nps-intelligence-layer",  label: "Couche d’intelligence NPS",       labelKey: "routes.npsIntelligenceLayer", enabled: true,  inHeader: true,  inFooter: true,  lang: "fr" },

  { path: "/intercom-nps-analytics",   label: "Intercom NPS Analytics",   labelKey: "routes.intercomNpsAnalytics", enabled: true, inHeader: true, inFooter: true, lang: "en" },
  { path: "/fr/analyse-nps-intercom",  label: "Analyse NPS Intercom",     labelKey: "routes.intercomNpsAnalytics", enabled: true, inHeader: true, inFooter: true, lang: "fr" },

  { path: "/data-automation",     label: "Data & Automation", labelKey: "routes.dataAutomation", enabled: true, inHeader: true, inFooter: true, lang: "en" },
  { path: "/fr/data-automation",  label: "Data & Automatisation", labelKey: "routes.dataAutomation", enabled: true, inHeader: true, inFooter: true, lang: "fr" },

  { path: "/book",     label: "Book discovery",          labelKey: "routes.book",                enabled: true,  inHeader: false, inFooter: true,  lang: "en" },
  { path: "/fr/book",  label: "Prendre rendez-vous",     labelKey: "routes.book",                enabled: true,  inHeader: false, inFooter: true,  lang: "fr" },

  // Social listening
  { path: "/social-listening",     label: "Social Listening",       labelKey: "routes.socialListening",      enabled: true,  inHeader: true,  inFooter: true,  lang: "en" },
  { path: "/fr/social-listening",  label: "Écoute sociale",         labelKey: "routes.socialListening",      enabled: true,  inHeader: true,  inFooter: true,  lang: "fr" },

  { path: "/social-listening-index",     label: "Social Listening Index",  labelKey: "routes.socialListeningIndex", enabled: true, inHeader: true,  inFooter: true,  lang: "en" },
  { path: "/fr/social-listening-index",  label: "Index écoute sociale",    labelKey: "routes.socialListeningIndex", enabled: true, inHeader: true,  inFooter: true,  lang: "fr" },

  { path: "/social-listening/:slug",     label: "Social Listening Report", labelKey: "routes.socialListeningReport", enabled: true, inHeader: false, inFooter: false, lang: "en" },
  { path: "/fr/social-listening/:slug",  label: "Rapport écoute sociale",  labelKey: "routes.socialListeningReport", enabled: true, inHeader: false, inFooter: false, lang: "fr" },

  // Data pages
  { path: "/cx-pulse-sample",     label: "CX Pulse (sample)", labelKey: "routes.cxPulseSample", enabled: true, inHeader: false, inFooter: true, lang: "en" },
  { path: "/fr/cx-pulse-sample",  label: "CX Pulse (exemple)", labelKey: "routes.cxPulseSample", enabled: true, inHeader: false, inFooter: true, lang: "fr" },

  { path: "/cx-cockpit",     label: "CX Cockpit", labelKey: "routes.cxCockpit", enabled: true, inHeader: true, inFooter: true, lang: "en" },
  { path: "/fr/cx-cockpit",  label: "Cockpit CX", labelKey: "routes.cxCockpit", enabled: true, inHeader: true, inFooter: true, lang: "fr" },

  // Blog index
  { path: "/blog",     label: "Blog", labelKey: "routes.blog", enabled: true, inHeader: true, inFooter: true, lang: "en" },
  { path: "/fr/blog",  label: "Blog", labelKey: "routes.blog", enabled: true, inHeader: true, inFooter: true, lang: "fr" },

  // Blog articles (kept as-is, but duplicated under /fr for SEO structure)
  { path: "/blog/ethical-surveys",                  label: "Blog: Ethical Surveys",                   labelKey: "routes.blogEthicalSurveys",           enabled: true, inHeader: false, inFooter: false, lang: "en" },
  { path: "/fr/blog/ethical-surveys",               label: "Blog : Enquêtes éthiques",                 labelKey: "routes.blogEthicalSurveys",           enabled: true, inHeader: false, inFooter: false, lang: "fr" },

  { path: "/blog/ethics-of-contact-selection",      label: "Blog: Contact Selection Ethics",          labelKey: "routes.blogEthicsOfContactSelection", enabled: true, inHeader: false, inFooter: false, lang: "en" },
  { path: "/fr/blog/ethics-of-contact-selection",   label: "Blog : Éthique de sélection des contacts", labelKey: "routes.blogEthicsOfContactSelection", enabled: true, inHeader: false, inFooter: false, lang: "fr" },

  { path: "/blog/closing-the-loop",                 label: "Blog: Closing the Loop",                  labelKey: "routes.blogClosingTheLoop",           enabled: true, inHeader: false, inFooter: false, lang: "en" },
  { path: "/fr/blog/closing-the-loop",              label: "Blog : Boucler la boucle",                labelKey: "routes.blogClosingTheLoop",           enabled: true, inHeader: false, inFooter: false, lang: "fr" },

  { path: "/blog/what-to-do-with-nps-scores",       label: "Blog: What To Do With NPS Scores",        labelKey: "routes.blogWhatToDoWithNpsScores",    enabled: true, inHeader: false, inFooter: false, lang: "en" },
  { path: "/fr/blog/what-to-do-with-nps-scores",    label: "Blog : Que faire avec vos scores NPS",    labelKey: "routes.blogWhatToDoWithNpsScores",    enabled: true, inHeader: false, inFooter: false, lang: "fr" },

  { path: "/blog/sending-nps-before-christmas",     label: "Blog: Sending NPS Before Christmas",      labelKey: "routes.blogSendingNpsBeforeChristmas", enabled: true, inHeader: false, inFooter: false, lang: "en" },
  { path: "/fr/blog/sending-nps-before-christmas",  label: "Blog : Envoyer du NPS avant Noël",        labelKey: "routes.blogSendingNpsBeforeChristmas", enabled: true, inHeader: false, inFooter: false, lang: "fr" },

  { path: "/blog/why-nps-isnt-improving",           label: "Blog: Why NPS Isn’t Improving",           labelKey: "routes.blogWhyNpsIsntImproving",      enabled: true, inHeader: false, inFooter: false, lang: "en" },
  { path: "/fr/blog/why-nps-isnt-improving",        label: "Blog : Pourquoi le NPS ne progresse pas", labelKey: "routes.blogWhyNpsIsntImproving",      enabled: true, inHeader: false, inFooter: false, lang: "fr" },

  { path: "/blog/data-visualisation-cx-insights",   label: "Blog: Data Visualisation & CX Insights",  labelKey: "routes.blogDataVisualisation",        enabled: true, inHeader: false, inFooter: false, lang: "en" },
  { path: "/fr/blog/data-visualisation-cx-insights",label: "Blog : Data viz & insights CX",           labelKey: "routes.blogDataVisualisation",        enabled: true, inHeader: false, inFooter: false, lang: "fr" },

  // Demo survey journey
  { path: "/demo-survey-legacy",       label: "Demo survey",              labelKey: "routes.demoSurveyLegacy",      enabled: false, inHeader: false, inFooter: false, lang: "en" },
  { path: "/fr/demo-survey-legacy",    label: "Enquête démo",             labelKey: "routes.demoSurveyLegacy",      enabled: false, inHeader: false, inFooter: false, lang: "fr" },

  { path: "/demo-survey-page",         label: "Demo survey Page",         labelKey: "routes.demoSurveyPage",        enabled: true,  inHeader: false, inFooter: false, lang: "en" },
  { path: "/fr/demo-survey-page",      label: "Page enquête démo",        labelKey: "routes.demoSurveyPage",        enabled: true,  inHeader: false, inFooter: false, lang: "fr" },

  { path: "/demo-invitation-survey",   label: "Demo invitation survey",   labelKey: "routes.demoInvitationSurvey",  enabled: true,  inHeader: false, inFooter: false, lang: "en" },
  { path: "/fr/demo-invitation-survey",label: "Invitation enquête démo",  labelKey: "routes.demoInvitationSurvey",  enabled: true,  inHeader: false, inFooter: false, lang: "fr" },

  { path: "/demo-survey/thanks",       label: "Demo survey thanks",       labelKey: "routes.demoThanks",            enabled: true,  inHeader: false, inFooter: false, lang: "en" },
  { path: "/fr/demo-survey/thanks",    label: "Merci (démo)",             labelKey: "routes.demoThanks",            enabled: true,  inHeader: false, inFooter: false, lang: "fr" },

  // Live survey journey
  { path: "/live-invitation-survey",   label: "Live invitation survey",   labelKey: "routes.liveInvitationSurvey",  enabled: true,  inHeader: false, inFooter: false, lang: "en" },
  { path: "/fr/live-invitation-survey",label: "Invitation enquête live",  labelKey: "routes.liveInvitationSurvey",  enabled: true,  inHeader: false, inFooter: false, lang: "fr" },

  { path: "/live-survey-page",         label: "Live survey Page",         labelKey: "routes.liveSurveyPage",        enabled: true,  inHeader: false, inFooter: false, lang: "en" },
  { path: "/fr/live-survey-page",      label: "Page enquête live",        labelKey: "routes.liveSurveyPage",        enabled: true,  inHeader: false, inFooter: false, lang: "fr" },

  { path: "/live-survey-admin-page",   label: "Live survey Admin Page",   labelKey: "routes.liveSurveyAdmin",       enabled: true,  inHeader: false, inFooter: false, lang: "en" },
  { path: "/fr/live-survey-admin-page",label: "Admin enquête live",       labelKey: "routes.liveSurveyAdmin",       enabled: true,  inHeader: false, inFooter: false, lang: "fr" },

  { path: "/live-survey/thanks",       label: "Live survey thanks",       labelKey: "routes.liveThanks",            enabled: true,  inHeader: false, inFooter: false, lang: "en" },
  { path: "/fr/live-survey/thanks",    label: "Merci (live)",             labelKey: "routes.liveThanks",            enabled: true,  inHeader: false, inFooter: false, lang: "fr" },

  { path: "/live-results",             label: "Live survey results",      labelKey: "routes.liveResults",           enabled: true,  inHeader: false, inFooter: false, lang: "en" },
  { path: "/fr/live-results",          label: "Résultats enquête live",   labelKey: "routes.liveResults",           enabled: true,  inHeader: false, inFooter: false, lang: "fr" },

  // Regulatory
  { path: "/privacy",     label: "Privacy",           labelKey: "routes.privacy", enabled: true, inHeader: false, inFooter: true, lang: "en" },
  { path: "/fr/privacy",  label: "Confidentialité",   labelKey: "routes.privacy", enabled: true, inHeader: false, inFooter: true, lang: "fr" },

  { path: "/terms",       label: "Terms",             labelKey: "routes.terms",   enabled: true, inHeader: false, inFooter: true, lang: "en" },
  { path: "/fr/terms",    label: "Conditions",        labelKey: "routes.terms",   enabled: true, inHeader: false, inFooter: true, lang: "fr" },

  // Hash/anchor (not for sitemap)
  { path: "/#contact",      label: "Contact", labelKey: "routes.contact", enabled: true, inHeader: false, inFooter: true,  isHash: true, lang: "en" },
  { path: "/fr/#contact",   label: "Contact", labelKey: "routes.contact", enabled: true, inHeader: false, inFooter: true,  isHash: true, lang: "fr" },
];
