// src/routesRegistry.js
import React from "react";
import { ROUTES_MANIFEST } from "./routesManifest";
import RequireAuth from "./components/auth/RequireAuth";
import RequireWorkspaceAuth from "./components/auth/RequireWorkspaceAuth";

// React.lazy route components
const NpsMeLanding = React.lazy(() => import("./NpsMeLanding"));
const Products = React.lazy(() => import("./Products"));
const Training = React.lazy(() => import("./Training"));
const Speaking = React.lazy(() => import("./Speaking"));
const WhatIsNps = React.lazy(() => import("./pages/WhatIsNps"));
const ImpactPage = React.lazy(() => import("./ImpactPage"));
const About = React.lazy(() => import("./About"));
const WhyNpsMe = React.lazy(() => import("./pages/WhyNpsMe"));
const MilestoneNps = React.lazy(() => import("./MilestoneNps"));
const NpsSurveyProgramme = React.lazy(() => import("./NpsSurveyProgramme"));
const NpsIntelligenceLayer = React.lazy(() => import("./pages/NpsIntelligenceLayer"));
const IntercomNpsAnalytics = React.lazy(() => import("./pages/IntercomNpsAnalytics"));
const CustomerFeedbackWorkspace = React.lazy(() => import("./pages/CustomerFeedbackWorkspace"));
const EnvolaExample = React.lazy(() => import("./pages/EnvolaExample"));
const EnvolaQuestionDetail = React.lazy(() => import("./pages/EnvolaQuestionDetail"));
const Book = React.lazy(() => import("./Book"));
const CxPulseSample = React.lazy(() => import("./CxPulseSample"));
const Privacy = React.lazy(() => import("./Privacy"));
const Terms = React.lazy(() => import("./Terms"));

const SocialListening = React.lazy(() => import("./SocialListening"));
const SocialListeningIndex = React.lazy(() => import("./pages/SocialListeningIndex"));
const SocialListeningReport = React.lazy(() => import("./pages/SocialListeningReport"));

const BlogClosingTheLoop = React.lazy(() => import("./pages/BlogClosingTheLoop"));
const BlogDataVisualisation = React.lazy(() => import("./pages/BlogDataVisualisation"));
const BlogEthicalSurveys = React.lazy(() => import("./pages/BlogEthicalSurveys"));
const BlogEthicsOfContactSelection = React.lazy(() => import("./pages/BlogEthicsOfContactSelection"));
const BlogIndex = React.lazy(() => import("./pages/BlogIndex"));
const BlogIntercomNpsBeyondTheScore = React.lazy(() => import("./pages/BlogIntercomNpsBeyondTheScore"));
const BlogSendingNpsBeforeChristmas = React.lazy(() => import("./pages/BlogSendingNpsBeforeChristmas"));
const BlogWhatToDoWithNpsScores = React.lazy(() => import("./pages/BlogWhatToDoWithNpsScores"));
const BlogWhyNpsIsntImproving = React.lazy(() => import("./pages/BlogWhyNpsIsntImproving"));

const DataAutomationPage = React.lazy(() => import("./pages/DataAutomationPage"));
const DemoSurvey = React.lazy(() => import("./pages/DemoSurvey"));
const DemoSurveyPage = React.lazy(() => import("./pages/DemoSurveyPage"));
const DemoInvitationSurvey = React.lazy(() => import("./pages/DemoInvitationSurvey"));
const DemoThankYou = React.lazy(() => import("./pages/DemoThankYou"));

const LiveInvitationSurvey = React.lazy(() => import("./pages/LiveInvitationSurvey"));
const LiveSurveyAdminPage = React.lazy(() => import("./pages/LiveSurveyAdminPage"));
const LiveSurveyPage = React.lazy(() => import("./pages/LiveSurveyPage"));
const LiveThankYou = React.lazy(() => import("./pages/LiveThankYou"));
const LiveResultsPanel = React.lazy(() => import("./pages/LiveResultsPanel"));

const CxCockpit = React.lazy(() => import("./pages/CxCockpit"));

const PrivateLogin = React.lazy(() => import("./pages/PrivateLogin"));
const ClosingTheLoop = React.lazy(() => import("./pages/EnvolaClosingTheLoop"));
const NpsResponsesExplorer = React.lazy(() => import("./pages/NpsResponsesExplorer"));

const EnvolaPerformance = React.lazy(() => import("./pages/EnvolaPerformance"));
const EnvolaResponses = React.lazy(() => import("./pages/EnvolaResponses"));
const EnvolaInvitations = React.lazy(() => import("./pages/EnvolaInvitations"));
const EnvolaClosingTheLoop = React.lazy(() => import("./pages/EnvolaClosingTheLoop"));

const CsvNpsUpload = React.lazy(() => import("./pages/CsvNpsUpload"));
const CsvNpsPerformance = React.lazy(() => import("./pages/CsvNpsPerformance"));
const CsvNpsResponses = React.lazy(() => import("./pages/CsvNpsResponses"));
const CsvNpsInvitations = React.lazy(() => import("./pages/CsvNpsInvitations"));
const CsvNpsClosingTheLoop = React.lazy(() => import("./pages/CsvNpsClosingTheLoop"));
const NpsDatasets = React.lazy(() => import("./pages/NpsDatasets"));

const WorkspaceHome = React.lazy(() => import("./pages/WorkspaceHome"));
const WorkspaceLogin = React.lazy(() => import("./pages/workspace/Login"));
const WorkspaceAccount = React.lazy(() => import("./pages/workspace/Account"));

const protect = (Component) => {
  return function ProtectedPage() {
    return React.createElement(
      RequireAuth,
      null,
      React.createElement(Component, null)
    );
  };
};

const workspaceProtect = (Component) => {
  return function ProtectedWorkspacePage() {
    return React.createElement(
      RequireWorkspaceAuth,
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

  "/customer-feedback-workspace": CustomerFeedbackWorkspace,
  "/fr/customer-feedback-workspace": CustomerFeedbackWorkspace,

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

  "/envola/closing-the-loop": protect(EnvolaClosingTheLoop),
  "/fr/envola/closing-the-loop": protect(EnvolaClosingTheLoop),

  // NPS Me Workspace - new product-style routes
  "/workspace/login": WorkspaceLogin,
  "/fr/workspace/login": WorkspaceLogin,

  "/workspace": workspaceProtect(WorkspaceHome),
  "/fr/workspace": workspaceProtect(WorkspaceHome),

  "/workspace/account": workspaceProtect(WorkspaceAccount),
  "/fr/workspace/account": workspaceProtect(WorkspaceAccount),

  "/workspace/import": workspaceProtect(CsvNpsUpload),
  "/fr/workspace/import": workspaceProtect(CsvNpsUpload),

  "/workspace/datasets": workspaceProtect(NpsDatasets),
  "/fr/workspace/datasets": workspaceProtect(NpsDatasets),

  "/workspace/performance": workspaceProtect(CsvNpsPerformance),
  "/fr/workspace/performance": workspaceProtect(CsvNpsPerformance),

  "/workspace/responses": workspaceProtect(CsvNpsResponses),
  "/fr/workspace/responses": workspaceProtect(CsvNpsResponses),

  "/workspace/invitations": workspaceProtect(CsvNpsInvitations),
  "/fr/workspace/invitations": workspaceProtect(CsvNpsInvitations),

  "/workspace/closing-the-loop": workspaceProtect(CsvNpsClosingTheLoop),
  "/fr/workspace/closing-the-loop": workspaceProtect(CsvNpsClosingTheLoop),

  "/workspace/datasets/:datasetId/performance": workspaceProtect(CsvNpsPerformance),
  "/fr/workspace/datasets/:datasetId/performance": workspaceProtect(CsvNpsPerformance),

  "/workspace/datasets/:datasetId/responses": workspaceProtect(CsvNpsResponses),
  "/fr/workspace/datasets/:datasetId/responses": workspaceProtect(CsvNpsResponses),

  "/workspace/datasets/:datasetId/invitations": workspaceProtect(CsvNpsInvitations),
  "/fr/workspace/datasets/:datasetId/invitations": workspaceProtect(CsvNpsInvitations),

  "/workspace/datasets/:datasetId/closing-the-loop": workspaceProtect(CsvNpsClosingTheLoop),
  "/fr/workspace/datasets/:datasetId/closing-the-loop": workspaceProtect(CsvNpsClosingTheLoop),

  // CSV / NPS data workspace
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
