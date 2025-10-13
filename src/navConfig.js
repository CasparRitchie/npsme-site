// Central place to define site navigation.
// Toggle pages by flipping `enabled` to true/false.

export const NAV = {
  cta: { href: "/#contact", label: "Book discovery" },

  main: [
    { to: "/", label: "Home", enabled: true },
    { to: "/products", label: "Products", enabled: true },
    { to: "/impact", label: "Impact", enabled: true },
    { to: "/milestone-nps", label: "Milestone NPS", enabled: true },
    { to: "/social-listening", label: "Social Listening", enabled: true },
  ],

  footer: [
    { to: "/products", label: "Products", enabled: true },
    { to: "/impact", label: "Impact", enabled: true },
    { to: "/privacy", label: "Privacy Policy", enabled: true },
    { to: "/terms", label: "Terms of Service", enabled: true },
  ],
};
