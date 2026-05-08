// src/routesRegistry.js
import React from "react";
import { ROUTES_MANIFEST } from "./routesManifest";

// React components (browser-only)
import NpsMeLanding from "./NpsMeLanding";
import Products from "./Products";
import Training from "./Training";
import Speaking from "./Speaking";
import WhatIsNps from "./pages/WhatIsNps";
import ImpactPage from "./ImpactPage";
import About from "./About";
import WhyNpsMe from "./pages/WhyNpsMe";
import MilestoneNps from "./MilestoneNps";
import NpsSurveyProgramme from "./NpsSurveyProgramme";
import NpsIntelligenceLayer from "./pages/NpsIntelligenceLayer";
import IntercomNpsAnalytics from "./pages/IntercomNpsAnalytics";
import EnvolaExample from "./pages/EnvolaExample";
import EnvolaQuestionDetail from "./pages/EnvolaQuestionDetail";
import Book from "./Book";
import CxPulseSample from "./CxPulseSample";
import Privacy from "./Privacy";
import Terms from "./Terms";

import SocialListening from "./SocialListening";
import SocialListeningIndex from "./pages/SocialListeningIndex";
import SocialListeningReport from "./pages/SocialListeningReport";

import BlogClosingTheLoop from "./pages/BlogClosingTheLoop";
import BlogDataVisualisation from "./pages/BlogDataVisualisation";
import BlogEthicalSurveys from "./pages/BlogEthicalSurveys";
import BlogEthicsOfContactSelection from "./pages/BlogEthicsOfContactSelection";
import BlogIndex from "./pages/BlogIndex";
import BlogIntercomNpsBeyondTheScore from "./pages/BlogIntercomNpsBeyondTheScore";
import BlogSendingNpsBeforeChristmas from "./pages/BlogSendingNpsBeforeChristmas";
import BlogWhatToDoWithNpsScores from "./pages/BlogWhatToDoWithNpsScores";
import BlogWhyNpsIsntImproving from "./pages/BlogWhyNpsIsntImproving";

import DataAutomationPage from "./pages/DataAutomationPage";
import DemoSurvey from "./pages/DemoSurvey";
import DemoSurveyPage from "./pages/DemoSurveyPage";
import DemoInvitationSurvey from "./pages/DemoInvitationSurvey";
import DemoThankYou from "./pages/DemoThankYou";

import LiveInvitationSurvey from "./pages/LiveInvitationSurvey";
import LiveSurveyAdminPage from "./pages/LiveSurveyAdminPage";
import LiveSurveyPage from "./pages/LiveSurveyPage";
import LiveThankYou from "./pages/LiveThankYou";
import LiveResultsPanel from "./pages/LiveResultsPanel";

import CxCockpit from "./pages/CxCockpit";

import PrivateLogin from "./pages/PrivateLogin";
import ClosingTheLoop from "./pages/ClosingTheLoop";
import NpsResponsesExplorer from "./pages/NpsResponsesExplorer";
import RequireAuth from "./components/auth/RequireAuth";

import EnvolaPerformance from "./pages/EnvolaPerformance";
import EnvolaResponses from "./pages/EnvolaResponses";
import EnvolaInvitations from "./pages/EnvolaInvitations";
import EnvolaClosingTheLoop from "./pages/EnvolaClosingTheLoop";

import CsvNpsUpload from "./pages/CsvNpsUpload";
import CsvNpsPerformance from "./pages/CsvNpsPerformance";
import CsvNpsResponses from "./pages/CsvNpsResponses";
import CsvNpsClosingTheLoop from "./pages/CsvNpsClosingTheLoop";
import NpsDatasets from "./pages/NpsDatasets";
import WorkspaceHome from "./pages/WorkspaceHome";

const protect = (Component) => {
  return function ProtectedPage() {
    return React.createElement(
      RequireAuth,
      null,
      React.createElement(Component, null)
    );
  };
};

// Path to component mapping (EN + FR point to the same components)
const COMPONENTS = {
  // Home
  "/": NpsMeLanding,
  "/fr": NpsMeLanding,

  // Core
  "/products": Products,
  "/fr/products": Products,

  "/training": Training,
  "/fr/training": Training,

  "/speaking": Speaking,
  "/fr/speaking": Speaking,

  "/impact": ImpactPage,
  "/fr/impact": ImpactPage,

  "/about": About,
  "/fr/about": About,

  "/why-nps-me": WhyNpsMe,
  "/fr/why-nps-me": WhyNpsMe,

  "/milestone-nps": MilestoneNps,
  "/fr/milestone-nps": MilestoneNps,

  "/nps-survey-programme": NpsSurveyProgramme,
  "/fr/nps-survey-programme": NpsSurveyProgramme,

  "/nps-intelligence-layer": NpsIntelligenceLayer,
  "/fr/nps-intelligence-layer": NpsIntelligenceLayer,

  "/intercom-nps-analytics": IntercomNpsAnalytics,
  "/fr/analyse-nps-intercom": IntercomNpsAnalytics,

  "/envola": EnvolaExample,
  "/fr/exemple-envola": EnvolaExample,

  "/envola/questions/:questionId": EnvolaQuestionDetail,
  "/fr/exemple-envola/questions/:questionId": EnvolaQuestionDetail,

  "/envola/performance": protect(EnvolaPerformance),
  "/fr/envola/performance": protect(EnvolaPerformance),

  "/envola/responses": protect(EnvolaResponses),
  "/fr/envola/responses": protect(EnvolaResponses),

  "/envola/invitations": protect(EnvolaInvitations),
  "/fr/envola/invitations": protect(EnvolaInvitations),

  "/envola/closing-the-loop": EnvolaClosingTheLoop,
  "/fr/envola/closing-the-loop": EnvolaClosingTheLoop,

  // NPS Me Workspace - new product-style routes
  "/workspace": protect(WorkspaceHome),
  "/fr/workspace": protect(WorkspaceHome),

  "/workspace/import": protect(CsvNpsUpload),
  "/fr/workspace/import": protect(CsvNpsUpload),

  "/workspace/datasets": protect(NpsDatasets),
  "/fr/workspace/datasets": protect(NpsDatasets),

  "/workspace/datasets/:datasetId/performance": protect(CsvNpsPerformance),
  "/fr/workspace/datasets/:datasetId/performance": protect(CsvNpsPerformance),

  "/workspace/datasets/:datasetId/responses": protect(CsvNpsResponses),
  "/fr/workspace/datasets/:datasetId/responses": protect(CsvNpsResponses),

  "/workspace/datasets/:datasetId/closing-the-loop": protect(CsvNpsClosingTheLoop),
  "/fr/workspace/datasets/:datasetId/closing-the-loop": protect(CsvNpsClosingTheLoop),

  // CSV / NPS data workspace
  // Protected because datasets and follow-up actions are now persisted in Supabase.
  "/csv-nps/upload": protect(CsvNpsUpload),
  "/fr/csv-nps/upload": protect(CsvNpsUpload),

  "/csv-nps/datasets": protect(NpsDatasets),
  "/fr/csv-nps/datasets": protect(NpsDatasets),

  "/csv-nps/performance": protect(CsvNpsPerformance),
  "/fr/csv-nps/performance": protect(CsvNpsPerformance),

  "/csv-nps/responses": protect(CsvNpsResponses),
  "/fr/csv-nps/responses": protect(CsvNpsResponses),

  "/csv-nps/closing-the-loop": protect(CsvNpsClosingTheLoop),
  "/fr/csv-nps/closing-the-loop": protect(CsvNpsClosingTheLoop),

  "/csv-nps/datasets/:datasetId/performance": protect(CsvNpsPerformance),
  "/fr/csv-nps/datasets/:datasetId/performance": protect(CsvNpsPerformance),

  "/csv-nps/datasets/:datasetId/responses": protect(CsvNpsResponses),
  "/fr/csv-nps/datasets/:datasetId/responses": protect(CsvNpsResponses),

  "/csv-nps/datasets/:datasetId/closing-the-loop": protect(CsvNpsClosingTheLoop),
  "/fr/csv-nps/datasets/:datasetId/closing-the-loop": protect(CsvNpsClosingTheLoop),

  "/what-is-nps": WhatIsNps,
  "/fr/what-is-nps": WhatIsNps,

  "/data-automation": DataAutomationPage,
  "/fr/data-automation": DataAutomationPage,

  "/book": Book,
  "/fr/book": Book,

  "/privacy": Privacy,
  "/fr/privacy": Privacy,

  "/terms": Terms,
  "/fr/terms": Terms,

  // Social listening
  "/social-listening": SocialListening,
  "/fr/social-listening": SocialListening,

  "/social-listening-index": SocialListeningIndex,
  "/fr/social-listening-index": SocialListeningIndex,

  "/social-listening/:slug": SocialListeningReport,
  "/fr/social-listening/:slug": SocialListeningReport,

  // Blogs
  "/blog": BlogIndex,
  "/fr/blog": BlogIndex,

  "/blog/closing-the-loop": BlogClosingTheLoop,
  "/fr/blog/closing-the-loop": BlogClosingTheLoop,

  "/blog/data-visualisation-cx-insights": BlogDataVisualisation,
  "/fr/blog/data-visualisation-cx-insights": BlogDataVisualisation,

  "/blog/ethical-surveys": BlogEthicalSurveys,
  "/fr/blog/ethical-surveys": BlogEthicalSurveys,

  "/blog/ethics-of-contact-selection": BlogEthicsOfContactSelection,
  "/fr/blog/ethics-of-contact-selection": BlogEthicsOfContactSelection,

  "/blog/intercom-nps-beyond-the-score": BlogIntercomNpsBeyondTheScore,
  "/fr/blog/intercom-nps-beyond-the-score": BlogIntercomNpsBeyondTheScore,

  "/blog/sending-nps-before-christmas": BlogSendingNpsBeforeChristmas,
  "/fr/blog/sending-nps-before-christmas": BlogSendingNpsBeforeChristmas,

  "/blog/what-to-do-with-nps-scores": BlogWhatToDoWithNpsScores,
  "/fr/blog/what-to-do-with-nps-scores": BlogWhatToDoWithNpsScores,

  "/blog/why-nps-isnt-improving": BlogWhyNpsIsntImproving,
  "/fr/blog/why-nps-isnt-improving": BlogWhyNpsIsntImproving,

  // CX data
  "/cx-pulse-sample": CxPulseSample,
  "/fr/cx-pulse-sample": CxPulseSample,

  "/cx-cockpit": CxCockpit,
  "/fr/cx-cockpit": CxCockpit,

  // Demo survey
  "/demo-survey-legacy": DemoSurvey,
  "/fr/demo-survey-legacy": DemoSurvey,

  "/demo-survey-page": DemoSurveyPage,
  "/fr/demo-survey-page": DemoSurveyPage,

  "/demo-invitation-survey": DemoInvitationSurvey,
  "/fr/demo-invitation-survey": DemoInvitationSurvey,

  "/demo-survey/thanks": DemoThankYou,
  "/fr/demo-survey/thanks": DemoThankYou,

  // Live survey
  "/live-invitation-survey": LiveInvitationSurvey,
  "/fr/live-invitation-survey": LiveInvitationSurvey,

  "/live-survey-page": LiveSurveyPage,
  "/fr/live-survey-page": LiveSurveyPage,

  "/live-survey-admin-page": LiveSurveyAdminPage,
  "/fr/live-survey-admin-page": LiveSurveyAdminPage,

  "/live-survey/thanks": LiveThankYou,
  "/fr/live-survey/thanks": LiveThankYou,

  "/live-results": LiveResultsPanel,
  "/fr/live-results": LiveResultsPanel,

  "/private/login": PrivateLogin,
  "/fr/private/login": PrivateLogin,

  "/private/closing-the-loop": protect(ClosingTheLoop),
  "/fr/private/closing-the-loop": protect(ClosingTheLoop),

  "/private/nps-responses-explorer": protect(NpsResponsesExplorer),
  "/fr/private/nps-responses-explorer": protect(NpsResponsesExplorer),
};


export const ROUTES = ROUTES_MANIFEST.map((r) => ({
  ...r,
  component: COMPONENTS[r.path] ?? null,
}));
