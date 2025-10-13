// src/routesRegistry.js
import NpsMeLanding from "./NpsMeLanding";
import Products from "./Products";
import ImpactPage from "./ImpactPage";
import MilestoneNps from "./MilestoneNps";
import SocialListening from "./SocialListening";
import CxPulseSample from "./CxPulseSample";
import Privacy from "./Privacy";
import Terms from "./Terms";

export const ROUTES = [
  { path: "/",               label: "Home",              component: NpsMeLanding,   inHeader: false, inFooter: false, enabled: true },
  { path: "/products",       label: "Products",          component: Products,       inHeader: true,  inFooter: true,  enabled: true },
  { path: "/impact",         label: "Impact",            component: ImpactPage,     inHeader: true,  inFooter: true,  enabled: true },
  { path: "/milestone-nps",  label: "Milestone NPS",     component: MilestoneNps,   inHeader: true,  inFooter: true,  enabled: true },
  { path: "/social-listening", label: "Social Listening",component: SocialListening, inHeader: true,  inFooter: true,  enabled: true },
  { path: "/cx-pulse-sample", label: "CX Pulse (sample)",component: CxPulseSample,  inHeader: false, inFooter: true,  enabled: true },
  { path: "/privacy",        label: "Privacy",           component: Privacy,        inHeader: false, inFooter: true,  enabled: true },
  { path: "/terms",          label: "Terms",             component: Terms,          inHeader: false, inFooter: true,  enabled: true },

  // Hash/anchor example (footer only)
  { path: "/#contact",       label: "Contact",           component: null,           inHeader: false, inFooter: true,  enabled: true, isHash: true },
];
