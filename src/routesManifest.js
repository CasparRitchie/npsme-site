// src/routesManifest.js
export const ROUTES_MANIFEST = [
  // Home
  { path: "/",                                                  label: "Home",                 labelKey: "routes.home",                 enabled: true,  indexable: true,  inHeader: false, inFooter: false, lang: "en", authMode: "none" },
  { path: "/fr",                                                label: "Accueil",              labelKey: "routes.home",                 enabled: true,  indexable: true,  inHeader: false, inFooter: false, lang: "fr", authMode: "none" },

  // Core site
  { path: "/products",                                          label: "Products",             labelKey: "routes.products",             enabled: true,  indexable: true,  inHeader: true,  inFooter: true,  lang: "en", authMode: "none" },
  { path: "/fr/products",                                       label: "Produits",             labelKey: "routes.products",             enabled: true,  indexable: true,  inHeader: true,  inFooter: true,  lang: "fr", authMode: "none" },

  { path: "/training",                                          label: "Training",             labelKey: "routes.training",             enabled: true,  indexable: true,  inHeader: false, inFooter: true,  lang: "en", authMode: "none" },
  { path: "/fr/training",                                       label: "Formation",            labelKey: "routes.training",             enabled: true,  indexable: true,  inHeader: false, inFooter: true,  lang: "fr", authMode: "none" },

  { path: "/speaking",                                          label: "Speaking",             labelKey: "routes.speaking",             enabled: true,  indexable: true,  inHeader: false, inFooter: true,  lang: "en", authMode: "none" },
  { path: "/fr/speaking",                                       label: "Conférences",          labelKey: "routes.speaking",             enabled: true,  indexable: true,  inHeader: false, inFooter: true,  lang: "fr", authMode: "none" },

  { path: "/impact",                                            label: "Impact",               labelKey: "routes.impact",               enabled: true,  indexable: true,  inHeader: false, inFooter: true,  lang: "en", authMode: "none" },
  { path: "/fr/impact",                                         label: "Impact",               labelKey: "routes.impact",               enabled: true,  indexable: true,  inHeader: false, inFooter: true,  lang: "fr", authMode: "none" },

  { path: "/about",                                             label: "About",                labelKey: "routes.about",                enabled: true,  indexable: true,  inHeader: true,  inFooter: true,  lang: "en", authMode: "none" },
  { path: "/fr/about",                                          label: "À propos",             labelKey: "routes.about",                enabled: true,  indexable: true,  inHeader: true,  inFooter: true,  lang: "fr", authMode: "none" },

  { path: "/why-nps-me",                                        label: "Why NPS Me",           labelKey: "routes.whyNpsMe",             enabled: true,  indexable: true,  inHeader: true,  inFooter: true,  lang: "en", authMode: "none" },
  { path: "/fr/why-nps-me",                                     label: "Pourquoi NPS Me",      labelKey: "routes.whyNpsMe",             enabled: true,  indexable: true,  inHeader: true,  inFooter: true,  lang: "fr", authMode: "none" },

  { path: "/milestone-nps",                                     label: "Milestone NPS",        labelKey: "routes.milestoneNps",         enabled: true,  indexable: true,  inHeader: true,  inFooter: true,  lang: "en", authMode: "none" },
  { path: "/fr/milestone-nps",                                  label: "Étapes NPS",           labelKey: "routes.milestoneNps",         enabled: true,  indexable: true,  inHeader: true,  inFooter: true,  lang: "fr", authMode: "none" },

  { path: "/nps-survey-programme",                              label: "NPS Survey Programme", labelKey: "routes.npsSurveyProgramme",   enabled: true,  indexable: true,  inHeader: true,  inFooter: true,  lang: "en", authMode: "none" },
  { path: "/fr/nps-survey-programme",                           label: "Programme NPS",        labelKey: "routes.npsSurveyProgramme",   enabled: true,  indexable: true,  inHeader: true,  inFooter: true,  lang: "fr", authMode: "none" },

  { path: "/what-is-nps",                                       label: "What is NPS?",         labelKey: "routes.whatIsNps",            enabled: true,  indexable: true,  inHeader: true,  inFooter: true,  lang: "en", authMode: "none" },
  { path: "/fr/what-is-nps",                                    label: "Qu’est-ce que le NPS ?", labelKey: "routes.whatIsNps",          enabled: true,  indexable: true,  inHeader: true,  inFooter: true,  lang: "fr", authMode: "none" },

  { path: "/nps-intelligence-layer",                            label: "NPS Intelligence Layer",    labelKey: "routes.npsIntelligenceLayer", enabled: true, indexable: true, inHeader: true, inFooter: true, lang: "en", authMode: "none" },
  { path: "/fr/nps-intelligence-layer",                         label: "Couche d’intelligence NPS", labelKey: "routes.npsIntelligenceLayer", enabled: true, indexable: true, inHeader: true, inFooter: true, lang: "fr", authMode: "none" },

  { path: "/intercom-nps-analytics",                            label: "Intercom NPS Analytics", labelKey: "routes.intercomNpsAnalytics", enabled: true, indexable: true, inHeader: true, inFooter: true, lang: "en", authMode: "none" },
  { path: "/fr/analyse-nps-intercom",                           label: "Analyse NPS Intercom",   labelKey: "routes.intercomNpsAnalytics", enabled: true, indexable: true, inHeader: true, inFooter: true, lang: "fr", authMode: "none" },

  { path: "/customer-feedback-workspace",                       label: "Customer Feedback Workspace", labelKey: "routes.customerFeedbackWorkspace", enabled: true, indexable: true, inHeader: true, inFooter: true, lang: "en", authMode: "none" },
  { path: "/fr/customer-feedback-workspace",                    label: "Espace feedback client",    labelKey: "routes.customerFeedbackWorkspace", enabled: true, indexable: true, inHeader: true, inFooter: true, lang: "fr", authMode: "none" },

  // Client example (public)
  { path: "/envola",                                            label: "Customer (example)",     labelKey: "routes.envola",               enabled: true,  indexable: false, inHeader: false, inFooter: true,  lang: "en", authMode: "none" },
  { path: "/fr/exemple-envola",                                 label: "Client (exemple)",     labelKey: "routes.envola",               enabled: true,  indexable: false, inHeader: false, inFooter: true,  lang: "fr", authMode: "none" },

  { path: "/data-automation",                                   label: "Data & Automation",    labelKey: "routes.dataAutomation",       enabled: true,  indexable: true,  inHeader: true,  inFooter: true,  lang: "en", authMode: "none" },
  { path: "/fr/data-automation",                                label: "Data & Automatisation", labelKey: "routes.dataAutomation",      enabled: true,  indexable: true,  inHeader: true,  inFooter: true,  lang: "fr", authMode: "none" },

  { path: "/book",                                              label: "Book discovery",       labelKey: "routes.book",                 enabled: true,  indexable: true,  inHeader: false, inFooter: true,  lang: "en", authMode: "none" },
  { path: "/fr/book",                                           label: "Prendre rendez-vous",  labelKey: "routes.book",                 enabled: true,  indexable: true,  inHeader: false, inFooter: true,  lang: "fr", authMode: "none" },

  // Envola question drilldown (private-ish UX, not indexable)
  { path: "/envola/questions/:questionId",                      label: "Customer Question",      labelKey: "routes.envolaQuestion",       enabled: true,  indexable: false, inHeader: false, inFooter: false, lang: "en", authMode: "private_cookie" },
  { path: "/fr/exemple-envola/questions/:questionId",           label: "Question Client",      labelKey: "routes.envolaQuestion",       enabled: true,  indexable: false, inHeader: false, inFooter: false, lang: "fr", authMode: "private_cookie" },

  // Private (auth)
  { path: "/private/login",                                     label: "Private login",        labelKey: "routes.privateLogin",         enabled: true,  indexable: false, inHeader: false, inFooter: false, lang: "en", authMode: "none" },
  { path: "/fr/private/login",                                  label: "Connexion privée",     labelKey: "routes.privateLogin",         enabled: true,  indexable: false, inHeader: false, inFooter: false, lang: "fr", authMode: "none" },

  { path: "/private/closing-the-loop",                          label: "Closing the loop",     labelKey: "routes.closingTheLoop",       enabled: true,  indexable: false, inHeader: false, inFooter: false, lang: "en", authMode: "private_cookie" },
  { path: "/fr/private/closing-the-loop",                       label: "Boucler la boucle",    labelKey: "routes.closingTheLoop",       enabled: true,  indexable: false, inHeader: false, inFooter: false, lang: "fr", authMode: "private_cookie" },

  // Envola private workspace
  { path: "/envola/performance",                                label: "Customer Performance",   enabled: true, indexable: false, inHeader: false, inFooter: true,  lang: "en", authMode: "private_cookie" },
  { path: "/fr/envola/performance",                             label: "Performance Client",   enabled: true, indexable: false, inHeader: false, inFooter: true,  lang: "fr", authMode: "private_cookie" },

  { path: "/envola/responses",                                  label: "Customer Responses",     enabled: true, indexable: false, inHeader: false, inFooter: false, lang: "en", authMode: "private_cookie" },
  { path: "/fr/envola/responses",                               label: "Réponses Client",      enabled: true, indexable: false, inHeader: false, inFooter: false, lang: "fr", authMode: "private_cookie" },

  { path: "/envola/invitations",                                label: "Customer Invitations",   enabled: true, indexable: false, inHeader: false, inFooter: false, lang: "en", authMode: "private_cookie" },
  { path: "/fr/envola/invitations",                             label: "Invitations Client",   enabled: true, indexable: false, inHeader: false, inFooter: false, lang: "fr", authMode: "private_cookie" },

  { path: "/envola/closing-the-loop",                           label: "Customer Closing the Loop", enabled: true, indexable: false, inHeader: false, inFooter: false, lang: "en", authMode: "private_cookie" },
  { path: "/fr/envola/closing-the-loop",                        label: "Boucle de feedback Client", enabled: true, indexable: false, inHeader: false, inFooter: false, lang: "fr", authMode: "private_cookie" },

  // NPS Me Workspace
  // Product-style protected workspace routes.
  // These are the preferred routes. The older /csv-nps routes remain as aliases for now.
  { path: "/workspace/login",                                   label: "Workspace login",      labelKey: "routes.workspaceLogin",       enabled: true,  indexable: false, inHeader: false, inFooter: false, lang: "en", authMode: "none" },
  { path: "/fr/workspace/login",                                label: "Connexion workspace",  labelKey: "routes.workspaceLogin",       enabled: true,  indexable: false, inHeader: false, inFooter: false, lang: "fr", authMode: "none" },

  { path: "/workspace",                                         label: "NPS Me Workspace",     labelKey: "routes.workspace",            enabled: true,  indexable: false, inHeader: false, inFooter: true,  lang: "en", authMode: "workspace_cookie" },
  { path: "/fr/workspace",                                      label: "NPS Me Espace de travail", labelKey: "routes.workspace",         enabled: true,  indexable: false, inHeader: false, inFooter: true,  lang: "fr", authMode: "workspace_cookie" },

  { path: "/workspace/account",                                 label: "Account",              labelKey: "routes.workspaceAccount",     enabled: true,  indexable: false, inHeader: false, inFooter: false, lang: "en", authMode: "workspace_cookie" },
  { path: "/fr/workspace/account",                              label: "Compte",               labelKey: "routes.workspaceAccount",     enabled: true,  indexable: false, inHeader: false, inFooter: false, lang: "fr", authMode: "workspace_cookie" },

  { path: "/workspace/import",                                  label: "Import feedback",      labelKey: "routes.workspaceImport",      enabled: true,  indexable: false, inHeader: false, inFooter: true,  lang: "en", authMode: "workspace_cookie" },
  { path: "/fr/workspace/import",                               label: "Importer des données", labelKey: "routes.workspaceImport",      enabled: true,  indexable: false, inHeader: false, inFooter: true,  lang: "fr", authMode: "workspace_cookie" },

  { path: "/workspace/datasets",                                label: "Saved datasets",       labelKey: "routes.workspaceDatasets",    enabled: true,  indexable: false, inHeader: false, inFooter: true,  lang: "en", authMode: "workspace_cookie" },
  { path: "/fr/workspace/datasets",                             label: "Datasets",             labelKey: "routes.workspaceDatasets",    enabled: true,  indexable: false, inHeader: false, inFooter: true,  lang: "fr", authMode: "workspace_cookie" },

  { path: "/workspace/datasets/:datasetId/performance",         label: "Dataset Performance",  labelKey: "routes.workspaceDatasetPerformance", enabled: true, indexable: false, inHeader: false, inFooter: false, lang: "en", authMode: "workspace_cookie" },
  { path: "/fr/workspace/datasets/:datasetId/performance",      label: "Performance dataset",  labelKey: "routes.workspaceDatasetPerformance", enabled: true, indexable: false, inHeader: false, inFooter: false, lang: "fr", authMode: "workspace_cookie" },

  { path: "/workspace/datasets/:datasetId/responses",           label: "Dataset Responses",    labelKey: "routes.workspaceDatasetResponses", enabled: true, indexable: false, inHeader: false, inFooter: false, lang: "en", authMode: "workspace_cookie" },
  { path: "/fr/workspace/datasets/:datasetId/responses",        label: "Réponses dataset",     labelKey: "routes.workspaceDatasetResponses", enabled: true, indexable: false, inHeader: false, inFooter: false, lang: "fr", authMode: "workspace_cookie" },

  { path: "/workspace/datasets/:datasetId/closing-the-loop",    label: "Dataset Closing the Loop", labelKey: "routes.workspaceDatasetClosingTheLoop", enabled: true, indexable: false, inHeader: false, inFooter: false, lang: "en", authMode: "workspace_cookie" },
  { path: "/fr/workspace/datasets/:datasetId/closing-the-loop", label: "Boucle de feedback dataset", labelKey: "routes.workspaceDatasetClosingTheLoop", enabled: true, indexable: false, inHeader: false, inFooter: false, lang: "fr", authMode: "workspace_cookie" },

  // CSV NPS workspace
  // Generic pasted/uploaded CSV survey data workspace.
  // Keep separate from Envola/Intercom routes so existing Envola dashboards are not impacted.
  { path: "/csv-nps/upload",                                    label: "CSV NPS Upload",       labelKey: "routes.csvNpsUpload",         enabled: true,  indexable: false, inHeader: false, inFooter: false, lang: "en", authMode: "private_cookie" },
  { path: "/fr/csv-nps/upload",                                 label: "Import CSV NPS",       labelKey: "routes.csvNpsUpload",         enabled: true,  indexable: false, inHeader: false, inFooter: false, lang: "fr", authMode: "private_cookie" },

  { path: "/csv-nps/datasets",                                  label: "NPS Datasets",         labelKey: "routes.csvNpsDatasets",       enabled: true,  indexable: false, inHeader: false, inFooter: false, lang: "en", authMode: "private_cookie" },
  { path: "/fr/csv-nps/datasets",                               label: "Datasets NPS",         labelKey: "routes.csvNpsDatasets",       enabled: true,  indexable: false, inHeader: false, inFooter: false, lang: "fr", authMode: "private_cookie" },

  { path: "/csv-nps/performance",                               label: "CSV NPS Performance",  labelKey: "routes.csvNpsPerformance",    enabled: true,  indexable: false, inHeader: false, inFooter: false, lang: "en", authMode: "private_cookie" },
  { path: "/fr/csv-nps/performance",                            label: "Performance CSV NPS",  labelKey: "routes.csvNpsPerformance",    enabled: true,  indexable: false, inHeader: false, inFooter: false, lang: "fr", authMode: "private_cookie" },

  { path: "/csv-nps/responses",                                 label: "CSV NPS Responses",    labelKey: "routes.csvNpsResponses",      enabled: true,  indexable: false, inHeader: false, inFooter: false, lang: "en", authMode: "private_cookie" },
  { path: "/fr/csv-nps/responses",                              label: "Réponses CSV NPS",     labelKey: "routes.csvNpsResponses",      enabled: true,  indexable: false, inHeader: false, inFooter: false, lang: "fr", authMode: "private_cookie" },

  { path: "/csv-nps/closing-the-loop",                          label: "CSV NPS Closing the Loop", labelKey: "routes.csvNpsClosingTheLoop", enabled: true, indexable: false, inHeader: false, inFooter: false, lang: "en", authMode: "private_cookie" },
  { path: "/fr/csv-nps/closing-the-loop",                       label: "Boucle de feedback CSV NPS", labelKey: "routes.csvNpsClosingTheLoop", enabled: true, indexable: false, inHeader: false, inFooter: false, lang: "fr", authMode: "private_cookie" },

  // CSV NPS saved dataset views
  { path: "/csv-nps/datasets/:datasetId/performance",           label: "Saved NPS Performance", labelKey: "routes.csvNpsSavedPerformance", enabled: true, indexable: false, inHeader: false, inFooter: false, lang: "en", authMode: "private_cookie" },
  { path: "/fr/csv-nps/datasets/:datasetId/performance",        label: "Performance dataset NPS", labelKey: "routes.csvNpsSavedPerformance", enabled: true, indexable: false, inHeader: false, inFooter: false, lang: "fr", authMode: "private_cookie" },

  { path: "/csv-nps/datasets/:datasetId/responses",             label: "Saved NPS Responses",  labelKey: "routes.csvNpsSavedResponses", enabled: true, indexable: false, inHeader: false, inFooter: false, lang: "en", authMode: "private_cookie" },
  { path: "/fr/csv-nps/datasets/:datasetId/responses",          label: "Réponses dataset NPS", labelKey: "routes.csvNpsSavedResponses", enabled: true, indexable: false, inHeader: false, inFooter: false, lang: "fr", authMode: "private_cookie" },

  { path: "/csv-nps/datasets/:datasetId/closing-the-loop",      label: "Saved NPS Closing the Loop", labelKey: "routes.csvNpsSavedClosingTheLoop", enabled: true, indexable: false, inHeader: false, inFooter: false, lang: "en", authMode: "private_cookie" },
  { path: "/fr/csv-nps/datasets/:datasetId/closing-the-loop",   label: "Boucle de feedback dataset NPS", labelKey: "routes.csvNpsSavedClosingTheLoop", enabled: true, indexable: false, inHeader: false, inFooter: false, lang: "fr", authMode: "private_cookie" },

  // Social listening (indexable)
  { path: "/social-listening",                                  label: "Social Listening",      labelKey: "routes.socialListening",      enabled: true, indexable: true, inHeader: true,  inFooter: true,  lang: "en", authMode: "none" },
  { path: "/fr/social-listening",                               label: "Écoute sociale",        labelKey: "routes.socialListening",      enabled: true, indexable: true, inHeader: true,  inFooter: true,  lang: "fr", authMode: "none" },

  { path: "/social-listening-index",                            label: "Social Listening Index", labelKey: "routes.socialListeningIndex", enabled: true, indexable: true, inHeader: true,  inFooter: true,  lang: "en", authMode: "none" },
  { path: "/fr/social-listening-index",                         label: "Index écoute sociale",   labelKey: "routes.socialListeningIndex", enabled: true, indexable: true, inHeader: true,  inFooter: true,  lang: "fr", authMode: "none" },

  // Dynamic report route: indexable (but excluded from sitemap by ":" rule)
  { path: "/social-listening/:slug",                            label: "Social Listening Report", labelKey: "routes.socialListeningReport", enabled: true, indexable: true, inHeader: false, inFooter: false, lang: "en", authMode: "none" },
  { path: "/fr/social-listening/:slug",                         label: "Rapport écoute sociale",  labelKey: "routes.socialListeningReport", enabled: true, indexable: true, inHeader: false, inFooter: false, lang: "fr", authMode: "none" },

  // Data pages
  // "sample" page: keep live, but not indexable
  { path: "/cx-pulse-sample",                                   label: "CX Pulse (sample)",    labelKey: "routes.cxPulseSample",        enabled: true, indexable: false, inHeader: false, inFooter: true,  lang: "en", authMode: "none" },
  { path: "/fr/cx-pulse-sample",                                label: "CX Pulse (exemple)",   labelKey: "routes.cxPulseSample",        enabled: true, indexable: false, inHeader: false, inFooter: true,  lang: "fr", authMode: "none" },

  { path: "/cx-cockpit",                                        label: "CX Cockpit",           labelKey: "routes.cxCockpit",            enabled: true, indexable: true,  inHeader: true,  inFooter: true,  lang: "en", authMode: "none" },
  { path: "/fr/cx-cockpit",                                     label: "Cockpit CX",           labelKey: "routes.cxCockpit",            enabled: true, indexable: true,  inHeader: true,  inFooter: true,  lang: "fr", authMode: "none" },

  // Blog index + articles (indexable)
  { path: "/blog",                                              label: "Blog",                 labelKey: "routes.blog",                 enabled: true, indexable: true, inHeader: true,  inFooter: true,  lang: "en", authMode: "none" },
  { path: "/fr/blog",                                           label: "Blog",                 labelKey: "routes.blog",                 enabled: true, indexable: true, inHeader: true,  inFooter: true,  lang: "fr", authMode: "none" },

  { path: "/blog/ethical-surveys",                              label: "Blog: Ethical Surveys",                    labelKey: "routes.blogEthicalSurveys",           enabled: true, indexable: true, inHeader: false, inFooter: false, lang: "en", authMode: "none" },
  { path: "/fr/blog/ethical-surveys",                           label: "Blog : Enquêtes éthiques",                 labelKey: "routes.blogEthicalSurveys",           enabled: true, indexable: true, inHeader: false, inFooter: false, lang: "fr", authMode: "none" },

  { path: "/blog/ethics-of-contact-selection",                  label: "Blog: Contact Selection Ethics",           labelKey: "routes.blogEthicsOfContactSelection", enabled: true, indexable: true, inHeader: false, inFooter: false, lang: "en", authMode: "none" },
  { path: "/fr/blog/ethics-of-contact-selection",               label: "Blog : Éthique de sélection des contacts", labelKey: "routes.blogEthicsOfContactSelection", enabled: true, indexable: true, inHeader: false, inFooter: false, lang: "fr", authMode: "none" },

  { path: "/blog/closing-the-loop",                             label: "Blog: Closing the Loop",                   labelKey: "routes.blogClosingTheLoop",           enabled: true, indexable: true, inHeader: false, inFooter: false, lang: "en", authMode: "none" },
  { path: "/fr/blog/closing-the-loop",                          label: "Blog : Boucler la boucle",                 labelKey: "routes.blogClosingTheLoop",           enabled: true, indexable: true, inHeader: false, inFooter: false, lang: "fr", authMode: "none" },

  { path: "/private/nps-responses-explorer",                    label: "NPS Explorer",        labelKey: "routes.npsExplorer",                enabled: true, indexable: false, inHeader: false, inFooter: true,  lang: "en", authMode: "private_cookie" },
  { path: "/fr/private/nps-responses-explorer",                 label: "Explorateur NPS",     labelKey: "routes.npsExplorer",                enabled: true, indexable: false, inHeader: false, inFooter: true,  lang: "fr", authMode: "private_cookie" },

  { path: "/blog/intercom-nps-beyond-the-score",                label: "Blog: Intercom NPS Beyond the Score",      labelKey: "routes.blogIntercomNpsBeyondScore",  enabled: true, indexable: true, inHeader: false, inFooter: false, lang: "en", authMode: "none" },
  { path: "/fr/blog/intercom-nps-beyond-the-score",             label: "Blog : Intercom NPS au-delà du score",     labelKey: "routes.blogIntercomNpsBeyondScore",  enabled: true, indexable: true, inHeader: false, inFooter: false, lang: "fr", authMode: "none" },

  { path: "/blog/what-to-do-with-nps-scores",                   label: "Blog: What To Do With NPS Scores",         labelKey: "routes.blogWhatToDoWithNpsScores",   enabled: true, indexable: true, inHeader: false, inFooter: false, lang: "en", authMode: "none" },
  { path: "/fr/blog/what-to-do-with-nps-scores",                label: "Blog : Que faire avec vos scores NPS",     labelKey: "routes.blogWhatToDoWithNpsScores",   enabled: true, indexable: true, inHeader: false, inFooter: false, lang: "fr", authMode: "none" },

  { path: "/blog/sending-nps-before-christmas",                 label: "Blog: Sending NPS Before Christmas",       labelKey: "routes.blogSendingNpsBeforeChristmas", enabled: true, indexable: true, inHeader: false, inFooter: false, lang: "en", authMode: "none" },
  { path: "/fr/blog/sending-nps-before-christmas",              label: "Blog : Envoyer du NPS avant Noël",         labelKey: "routes.blogSendingNpsBeforeChristmas", enabled: true, indexable: true, inHeader: false, inFooter: false, lang: "fr", authMode: "none" },

  { path: "/blog/why-nps-isnt-improving",                       label: "Blog: Why NPS Isn’t Improving",            labelKey: "routes.blogWhyNpsIsntImproving",     enabled: true, indexable: true, inHeader: false, inFooter: false, lang: "en", authMode: "none" },
  { path: "/fr/blog/why-nps-isnt-improving",                    label: "Blog : Pourquoi le NPS ne progresse pas",  labelKey: "routes.blogWhyNpsIsntImproving",     enabled: true, indexable: true, inHeader: false, inFooter: false, lang: "fr", authMode: "none" },

  { path: "/blog/data-visualisation-cx-insights",               label: "Blog: Data Visualisation & CX Insights",   labelKey: "routes.blogDataVisualisation",       enabled: true, indexable: true, inHeader: false, inFooter: false, lang: "en", authMode: "none" },
  { path: "/fr/blog/data-visualisation-cx-insights",            label: "Blog : Data viz & insights CX",            labelKey: "routes.blogDataVisualisation",       enabled: true, indexable: true, inHeader: false, inFooter: false, lang: "fr", authMode: "none" },

  // Demo survey journey (keep usable, but not indexed)
  { path: "/demo-survey-legacy",                                label: "Demo survey",         labelKey: "routes.demoSurveyLegacy",      enabled: false, indexable: false, inHeader: false, inFooter: false, lang: "en", authMode: "none" },
  { path: "/fr/demo-survey-legacy",                             label: "Enquête démo",        labelKey: "routes.demoSurveyLegacy",      enabled: false, indexable: false, inHeader: false, inFooter: false, lang: "fr", authMode: "none" },

  { path: "/demo-survey-page",                                  label: "Demo survey Page",    labelKey: "routes.demoSurveyPage",        enabled: true,  indexable: false, inHeader: false, inFooter: false, lang: "en", authMode: "none" },
  { path: "/fr/demo-survey-page",                               label: "Page enquête démo",   labelKey: "routes.demoSurveyPage",        enabled: true,  indexable: false, inHeader: false, inFooter: false, lang: "fr", authMode: "none" },

  { path: "/demo-invitation-survey",                            label: "Demo invitation survey", labelKey: "routes.demoInvitationSurvey", enabled: true,  indexable: false, inHeader: false, inFooter: false, lang: "en", authMode: "none" },
  { path: "/fr/demo-invitation-survey",                         label: "Invitation enquête démo", labelKey: "routes.demoInvitationSurvey", enabled: true,  indexable: false, inHeader: false, inFooter: false, lang: "fr", authMode: "none" },

  { path: "/demo-survey/thanks",                                label: "Demo survey thanks",  labelKey: "routes.demoThanks",            enabled: true,  indexable: false, inHeader: false, inFooter: false, lang: "en", authMode: "none" },
  { path: "/fr/demo-survey/thanks",                             label: "Merci (démo)",        labelKey: "routes.demoThanks",            enabled: true,  indexable: false, inHeader: false, inFooter: false, lang: "fr", authMode: "none" },

  // Live survey journey (keep usable, but not indexed)
  { path: "/live-invitation-survey",                            label: "Live invitation survey", labelKey: "routes.liveInvitationSurvey", enabled: true, indexable: false, inHeader: false, inFooter: false, lang: "en", authMode: "none" },
  { path: "/fr/live-invitation-survey",                         label: "Invitation enquête live", labelKey: "routes.liveInvitationSurvey", enabled: true, indexable: false, inHeader: false, inFooter: false, lang: "fr", authMode: "none" },

  { path: "/live-survey-page",                                  label: "Live survey Page",    labelKey: "routes.liveSurveyPage",        enabled: true, indexable: false, inHeader: false, inFooter: false, lang: "en", authMode: "none" },
  { path: "/fr/live-survey-page",                               label: "Page enquête live",   labelKey: "routes.liveSurveyPage",        enabled: true, indexable: false, inHeader: false, inFooter: false, lang: "fr", authMode: "none" },

  { path: "/live-survey-admin-page",                            label: "Live survey Admin Page", labelKey: "routes.liveSurveyAdmin",      enabled: true, indexable: false, inHeader: false, inFooter: false, lang: "en", authMode: "none" },
  { path: "/fr/live-survey-admin-page",                         label: "Admin enquête live",  labelKey: "routes.liveSurveyAdmin",       enabled: true, indexable: false, inHeader: false, inFooter: false, lang: "fr", authMode: "none" },

  { path: "/live-survey/thanks",                                label: "Live survey thanks",  labelKey: "routes.liveThanks",            enabled: true, indexable: false, inHeader: false, inFooter: false, lang: "en", authMode: "none" },
  { path: "/fr/live-survey/thanks",                             label: "Merci (live)",        labelKey: "routes.liveThanks",            enabled: true, indexable: false, inHeader: false, inFooter: false, lang: "fr", authMode: "none" },

  { path: "/live-results",                                      label: "Live survey results", labelKey: "routes.liveResults",           enabled: true, indexable: false, inHeader: false, inFooter: false, lang: "en", authMode: "none" },
  { path: "/fr/live-results",                                   label: "Résultats enquête live", labelKey: "routes.liveResults",         enabled: true, indexable: false, inHeader: false, inFooter: false, lang: "fr", authMode: "none" },

  // Regulatory (indexable)
  { path: "/privacy",                                           label: "Privacy",             labelKey: "routes.privacy",              enabled: true, indexable: true, inHeader: false, inFooter: true,  lang: "en", authMode: "none" },
  { path: "/fr/privacy",                                        label: "Confidentialité",     labelKey: "routes.privacy",              enabled: true, indexable: true, inHeader: false, inFooter: true,  lang: "fr", authMode: "none" },

  { path: "/terms",                                             label: "Terms",               labelKey: "routes.terms",                enabled: true, indexable: true, inHeader: false, inFooter: true,  lang: "en", authMode: "none" },
  { path: "/fr/terms",                                          label: "Conditions",          labelKey: "routes.terms",                enabled: true, indexable: true, inHeader: false, inFooter: true,  lang: "fr", authMode: "none" },

  // Hash/anchor (not for sitemap / not indexable)
  { path: "/#contact",                                          label: "Contact",             labelKey: "routes.contact",              enabled: true, indexable: false, inHeader: false, inFooter: true, isHash: true, lang: "en", authMode: "none" },
  { path: "/fr/#contact",                                       label: "Contact",             labelKey: "routes.contact",              enabled: true, indexable: false, inHeader: false, inFooter: true, isHash: true, lang: "fr", authMode: "none" },
];
