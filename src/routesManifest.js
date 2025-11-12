// src/routesManifest.js
export const ROUTES_MANIFEST = [
  { path: "/",                                 label: "Home",                             enabled: true,  inHeader: false, inFooter: false },
  { path: "/products",                         label: "Products",                         enabled: true,  inHeader: true,  inFooter: true  },
  { path: "/impact",                           label: "Impact",                           enabled: true,  inHeader: true,  inFooter: true  },
  { path: "/why-nps-me",                       label: "Why NPS Me",                       enabled: true,  inHeader: true,  inFooter: true  },
  { path: "/milestone-nps",                    label: "Milestone NPS",                    enabled: true,  inHeader: true,  inFooter: true  },
  { path: "/book",                             label: "Book discovery",                   enabled: true,  inHeader: false, inFooter: true },
  { path: "/what-is-nps",                      label: "What is NPS?",                     enabled: true,  inHeader: true,  inFooter: true },
  { path: "/data-automation",                  label: "Data & Automation",                enabled: true,  inHeader: true,  inFooter: true  },

  // Social Listening Index + dynamic anonymised reports
  { path: "/social-listening",                 label: "Social Listening",                 enabled: true,  inHeader: true,  inFooter: true  },
  { path: "/social-listening/:slug",           label: "Social Listening Report",          enabled: true,  inHeader: false, inFooter: false },
  { path: "/cx-pulse-sample",                  label: "CX Pulse (sample)",                enabled: true,  inHeader: false, inFooter: true  },

  // Blogs
  { path: "/blog",                             label: "Blog",                             enabled: true,  inHeader: true,  inFooter: true  },
  { path: "/blog/ethical-surveys",             label: "Blog: Ethical Surveys",            enabled: true,  inHeader: false, inFooter: false },
  { path: "/blog/ethics-of-contact-selection", label: "Blog: Contact Selection Ethics",   enabled: true,  inHeader: false, inFooter: false },
  { path: "/blog/closing-the-loop",            label: "Blog: Closing the Loop",           enabled: true,  inHeader: false, inFooter: false },
  { path: "/blog/what-to-do-with-nps-scores",  label: "Blog: What To Do With NPS Scores", enabled: true,  inHeader: false, inFooter: false },


  // Regulatory and information
  { path: "/privacy",                          label: "Privacy",                          enabled: true,  inHeader: false, inFooter: true  },
  { path: "/terms",                            label: "Terms",                            enabled: true,  inHeader: false, inFooter: true  },


  // Hash/anchor (not for sitemap)
  { path: "/#contact",                         label: "Contact",                          enabled: true,  inHeader: false, inFooter: true, isHash: true },
];
