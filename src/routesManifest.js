// src/routesManifest.js
// Plain data (safe to import from Node scripts)
export const ROUTES_MANIFEST = [
  { path: "/",                label: "Home",               enabled: true,  inHeader: false, inFooter: false },
  { path: "/products",        label: "Products",           enabled: true,  inHeader: true,  inFooter: true  },
  { path: "/impact",          label: "Impact",             enabled: true,  inHeader: true,  inFooter: true  },
  { path: "/milestone-nps",   label: "Milestone NPS",      enabled: true,  inHeader: true,  inFooter: true  },
  { path: "/social-listening",label: "Social Listening",   enabled: true,  inHeader: true,  inFooter: true  },
  { path: "/cx-pulse-sample", label: "CX Pulse (sample)",  enabled: true,  inHeader: false, inFooter: true  },
  { path: "/privacy",         label: "Privacy",            enabled: true,  inHeader: false, inFooter: true  },
  { path: "/terms",           label: "Terms",              enabled: true,  inHeader: false, inFooter: true  },

  // Hash/anchor (don’t include in sitemap)
  { path: "/#contact",        label: "Contact",            enabled: true,  inHeader: false, inFooter: true, isHash: true },
];
