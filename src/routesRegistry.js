// src/routesRegistry.js
import { ROUTES_MANIFEST } from "./routesManifest";

// React components (browser-only)
import NpsMeLanding from "./NpsMeLanding";
import Products from "./Products";
import WhatIsNps from "./pages/WhatIsNps";
import ImpactPage from "./ImpactPage";
import WhyNpsMe from "./pages/WhyNpsMe";
import MilestoneNps from "./MilestoneNps";
import NpsSurveyProgramme from "./NpsSurveyProgramme";
import Book from "./Book";
import CxPulseSample from "./CxPulseSample";
import Privacy from "./Privacy";
import Terms from "./Terms";

import SocialListening from "./SocialListening";
import SocialListeningIndex from "./pages/SocialListeningIndex";
import SocialListeningReport from "./pages/SocialListeningReport";
import BlogIndex from "./pages/BlogIndex";
import BlogEthicalSurveys from "./pages/BlogEthicalSurveys";
import BlogEthicsOfContactSelection from "./pages/BlogEthicsOfContactSelection";
import BlogClosingTheLoop from "./pages/BlogClosingTheLoop";
import BlogWhatToDoWithNpsScores from "./pages/BlogWhatToDoWithNpsScores";
import BlogSendingNpsBeforeChristmas from "./pages/BlogSendingNpsBeforeChristmas";
import BlogWhyNpsIsntImproving from "./pages/BlogWhyNpsIsntImproving";
import BlogDataVisualisation from "./pages/BlogDataVisualisation";
import DataAutomationPage from "./pages/DataAutomationPage";
import DemoSurvey from "./pages/DemoSurvey";
import DemoSurveyPage from "./pages/DemoSurveyPage";
import DemoInvitationSurvey from "./pages/DemoInvitationSurvey";
import DemoThankYou from "./pages/DemoThankYou";
import LiveInvitationSurvey from "./pages/LiveInvitationSurvey";
import LiveSurveyPage from "./pages/LiveSurveyPage";
import LiveThankYou from "./pages/LiveThankYou";
import LiveResultsPanel from "./pages/LiveResultsPanel";

import CxCockpit from "./pages/CxCockpit";

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
  "/nps-survey-programme": NpsSurveyProgramme,
  "/privacy": Privacy,
  "/terms": Terms,

  // SocialListening pages
  "/social-listening": SocialListening,
  "/social-listening-index": SocialListeningIndex,
  "/social-listening/:slug": SocialListeningReport,

  // Blogs
  "/blog": BlogIndex,
  "/blog/ethical-surveys": BlogEthicalSurveys,
  "/blog/ethics-of-contact-selection": BlogEthicsOfContactSelection,
  "/blog/closing-the-loop": BlogClosingTheLoop,
  "/blog/what-to-do-with-nps-scores": BlogWhatToDoWithNpsScores,
  "/blog/sending-nps-before-christmas": BlogSendingNpsBeforeChristmas,
  "/blog/why-nps-isnt-improving": BlogWhyNpsIsntImproving,
  "/blog/data-visualisation-cx-insights": BlogDataVisualisation,

  // Demo survey components
  "/demo-survey-legacy": DemoSurvey,
  "/demo-survey-page": DemoSurveyPage,
  "/demo-invitation-survey": DemoInvitationSurvey,
  "/demo-survey/thanks": DemoThankYou,

  // Live survey components
  "/live-invitation-survey": LiveInvitationSurvey,
  "/live-survey-page": LiveSurveyPage,
  "/live-thank-you": LiveThankYou,
  "/live-results": LiveResultsPanel,

  // NPSme data
  "/cx-pulse-sample": CxPulseSample,
  "/cx-cockpit": CxCockpit,
};

export const ROUTES = ROUTES_MANIFEST.map(r => ({
  ...r,
  component: COMPONENTS[r.path] ?? null,
}));
