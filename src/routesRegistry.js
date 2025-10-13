// src/routesRegistry.js
import { ROUTES_MANIFEST } from "./routesManifest";

// React components (browser-only)
import NpsMeLanding from "./NpsMeLanding";
import Products from "./Products";
import ImpactPage from "./ImpactPage";
import MilestoneNps from "./MilestoneNps";
import SocialListening from "./SocialListening";
import CxPulseSample from "./CxPulseSample";
import Privacy from "./Privacy";
import Terms from "./Terms";

// Map paths to components
const COMPONENTS = {
  "/": NpsMeLanding,
  "/products": Products,
  "/impact": ImpactPage,
  "/milestone-nps": MilestoneNps,
  "/social-listening": SocialListening,
  "/cx-pulse-sample": CxPulseSample,
  "/privacy": Privacy,
  "/terms": Terms,
};

export const ROUTES = ROUTES_MANIFEST.map(r => ({
  ...r,
  component: COMPONENTS[r.path] ?? null,
}));
