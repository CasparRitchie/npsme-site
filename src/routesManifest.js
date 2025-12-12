// src/routesManifest.js
export const ROUTES_MANIFEST = [
  { path: "/",                                 label: "Home",                             enabled: true,  inHeader: false,  inFooter: false },
  { path: "/impact",                           label: "Impact",                           enabled: true,  inHeader: false,  inFooter: true  },
  { path: "/book",                             label: "Book discovery",                   enabled: true,  inHeader: false,  inFooter: true },
  { path: "/products",     label: "Products",    labelKey: "routes.products", enabled: true, inHeader: true, inFooter: true },
  { path: "/why-nps-me",   label: "Why NPS Me",  labelKey: "routes.whyNpsMe", enabled: true, inHeader: true, inFooter: true },
  { path: "/milestone-nps",label: "Milestone NPS",labelKey:"routes.milestoneNps", enabled:true, inHeader:true, inFooter:true },
  { path: "/nps-survey-programme", label:"NPS Survey Programme", labelKey:"routes.npsSurveyProgramme", enabled:true, inHeader:true, inFooter:true },
  { path: "/what-is-nps",  label: "What is NPS?", labelKey: "routes.whatIsNps", enabled: true, inHeader: true, inFooter: true },
  { path: "/data-automation", label:"Data & Automation", labelKey:"routes.dataAutomation", enabled:true, inHeader:true, inFooter:true },

  // Social Listening Index + dynamic anonymised reports
  { path: "/social-listening", label:"Social Listening", labelKey:"routes.socialListening", enabled:true, inHeader:true, inFooter:true },
  { path: "/social-listening-index",           label: "Social Listening Index",           enabled: true,  inHeader: true,   inFooter: true  },
  { path: "/social-listening/:slug",           label: "Social Listening Report",          enabled: true,  inHeader: false,  inFooter: false },

  // NPSme data
  { path: "/cx-pulse-sample",                  label: "CX Pulse (sample)",                enabled: true,  inHeader: false,  inFooter: true  },

  // 🚀 CX Cockpit (demo / spaceship dashboard)
  { path: "/cx-cockpit",   label: "CX Cockpit",  labelKey: "routes.cxCockpit", enabled: true, inHeader: true, inFooter: true },

  // Blogs
  { path: "/blog",         label: "Blog",        labelKey: "routes.blog", enabled: true, inHeader: true, inFooter: true },
  { path: "/blog/ethical-surveys",             label: "Blog: Ethical Surveys",            enabled: true,  inHeader: false,  inFooter: false },
  { path: "/blog/ethics-of-contact-selection", label: "Blog: Contact Selection Ethics",   enabled: true,  inHeader: false,  inFooter: false },
  { path: "/blog/closing-the-loop",            label: "Blog: Closing the Loop",           enabled: true,  inHeader: false,  inFooter: false },
  { path: "/blog/what-to-do-with-nps-scores",  label: "Blog: What To Do With NPS Scores", enabled: true,  inHeader: false,  inFooter: false },
  { path: "/blog/sending-nps-before-christmas",label: "Blog: Sending NPS Before Christmas",enabled: true, inHeader: false,  inFooter: false},
  { path: "/blog/why-nps-isnt-improving",      label: "Blog: Why NPS Isn’t Improving",    enabled: true,  inHeader: false,  inFooter: false },
  { path: "/blog/data-visualisation-cx-insights", label: "Blog: Data Visualisation & CX Insights", enabled: true, inHeader: false, inFooter: false },

  // DEMO survey journey
  { path: "/demo-survey-legacy",               label: "Demo survey",                      enabled: false, inHeader: false,  inFooter: false },
  { path: "/demo-survey-page",                 label: "Demo survey Page",                 enabled: true,  inHeader: false,  inFooter: false },
  { path: "/demo-invitation-survey",           label: "Demo invitation survey",           enabled: true,  inHeader: false,  inFooter: false },
  { path: "/demo-survey/thanks",               label: "Demo survey thanks",               enabled: true,  inHeader: false,  inFooter: false },

  // LIVE survey journey
  { path: "/live-invitation-survey",           label: "Live invitation survey",           enabled: true,  inHeader: false,  inFooter: false },
  { path: "/live-survey-page",                 label: "Live survey Page",                 enabled: true,  inHeader: false,  inFooter: false },
  { path: "/live-survey-admin-page",           label: "Live survey Admin Page",           enabled: true,  inHeader: false,  inFooter: false },
  { path: "/live-survey/thanks",               label: "Live survey thanks",               enabled: true,  inHeader: false,  inFooter: false },
  { path: "/live-results",                     label: "Live survey results",              enabled: true,  inHeader: false,  inFooter: false },


  // Regulatory and information
  { path: "/privacy",                          label: "Privacy",                          enabled: true,  inHeader: false,  inFooter: true  },
  { path: "/terms",                            label: "Terms",                            enabled: true,  inHeader: false,  inFooter: true  },

  // Hash/anchor (not for sitemap)
  { path: "/#contact",                         label: "Contact",                          enabled: true,  inHeader: false,  inFooter: true, isHash: true },
];
