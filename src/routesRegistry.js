// src/routesRegistry.js
import { ROUTES_MANIFEST } from "./routesManifest";

// React components (browser-only)
import NpsMeLanding from "./NpsMeLanding";
import Products from "./Products";
import WhatIsNps from "./pages/WhatIsNps";
import ImpactPage from "./ImpactPage";
import WhyNpsMe from "./pages/WhyNpsMe";
import MilestoneNps from "./MilestoneNps";
import Book from "./Book";
import CxPulseSample from "./CxPulseSample";
import Privacy from "./Privacy";
import Terms from "./Terms";

// NEW pages
import SocialListeningIndex from "./pages/SocialListeningIndex";
import SocialListeningReport from "./pages/SocialListeningReport";
import BlogIndex from "./pages/BlogIndex";
import BlogEthicalSurveys from "./pages/BlogEthicalSurveys";
import BlogEthicsOfContactSelection from "./pages/BlogEthicsOfContactSelection";
import BlogClosingTheLoop from "./pages/BlogClosingTheLoop";
import DataAutomationPage from "./pages/DataAutomationPage";

// Path to component mapping
const COMPONENTS = {
  "/": NpsMeLanding,
  "/products": Products,
  "/what-is-nps": WhatIsNps,
  "/impact": ImpactPage,
  "/why-nps-me": WhyNpsMe,
  "/milestone-nps": MilestoneNps,
  "/book": Book,
  "/data-automation": DataAutomationPage,

  // SocialListening pages
  "/social-listening": SocialListeningIndex,
  "/social-listening/:slug": SocialListeningReport,

  // Blogs
  "/blog": BlogIndex,
  "/blog/ethical-surveys": BlogEthicalSurveys,
  "/blog/ethics-of-contact-selection": BlogEthicsOfContactSelection,
  "/blog/closing-the-loop": BlogClosingTheLoop,

  "/cx-pulse-sample": CxPulseSample,
  "/privacy": Privacy,
  "/terms": Terms,
};

export const ROUTES = ROUTES_MANIFEST.map(r => ({
  ...r,
  component: COMPONENTS[r.path] ?? null,
}));
