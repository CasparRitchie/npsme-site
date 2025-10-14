// src/routesRegistry.js
import { ROUTES_MANIFEST } from "./routesManifest";

// React components (browser-only)
import NpsMeLanding from "./NpsMeLanding";
import Products from "./Products";
import ImpactPage from "./ImpactPage";
import MilestoneNps from "./MilestoneNps";
import CxPulseSample from "./CxPulseSample";
import Privacy from "./Privacy";
import Terms from "./Terms";

// NEW pages
import SocialListeningIndex from "./pages/SocialListeningIndex";
import SocialListeningReport from "./pages/SocialListeningReport";

// Map paths to components
const COMPONENTS = {
  "/": NpsMeLanding,
  "/products": Products,
  "/impact": ImpactPage,
  "/milestone-nps": MilestoneNps,

  // Replace old SocialListening with the new pages
  "/social-listening": SocialListeningIndex,
  "/social-listening/:slug": SocialListeningReport,

  "/cx-pulse-sample": CxPulseSample,
  "/privacy": Privacy,
  "/terms": Terms,
};

export const ROUTES = ROUTES_MANIFEST.map(r => ({
  ...r,
  component: COMPONENTS[r.path] ?? null,
}));
