// src/routesManifest.js
export const ROUTES_MANIFEST = [
  { path: "/",                                 label: "Home",                           enabled: true,  inHeader: false, inFooter: false },
  { path: "/products",                         label: "Products",                       enabled: true,  inHeader: true,  inFooter: true  },
  { path: "/impact",                           label: "Impact",                         enabled: true,  inHeader: true,  inFooter: true  },
  { path: "/milestone-nps",                    label: "Milestone NPS",                  enabled: true,  inHeader: true,  inFooter: true  },
  { path: "/book",                             label: "Book discovery",                 enabled: true,  inHeader: false, inFooter: true },
  // Social Listening Index + dynamic anonymised reports
  { path: "/social-listening",                 label: "Social Listening",               enabled: true,  inHeader: true,  inFooter: true  },
  { path: "/social-listening/:slug",           label: "Social Listening Report",        enabled: true,  inHeader: false, inFooter: false },
  { path: "/cx-pulse-sample",                  label: "CX Pulse (sample)",              enabled: true,  inHeader: false, inFooter: true  },

  // Blogs
  { path: "/blog",                             label: "Blog",                           enabled: true,  inHeader: true,  inFooter: true  },
  { path: "/blog/ethical-surveys",             label: "Blog: Ethical Surveys",          enabled: true,  inHeader: false, inFooter: false },
  { path: "/blog/ethics-of-contact-selection", label: "Blog: Contact Selection Ethics", enabled: true,  inHeader: false, inFooter: false },

  // Regulatory and information
  { path: "/privacy",                          label: "Privacy",                        enabled: true,  inHeader: false, inFooter: true  },
  { path: "/terms",                            label: "Terms",                          enabled: true,  inHeader: false, inFooter: true  },


  // Hash/anchor (not for sitemap)
  { path: "/#contact",                         label: "Contact",                        enabled: true,  inHeader: false, inFooter: true, isHash: true },
];
