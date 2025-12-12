// src/i18n/translations.js

export const TRANSLATIONS = {
  en: {
    navbar: {
      bookDiscovery: "Book discovery",
      languageEn: "EN",
      languageFr: "FR",
    },
    routes: {
      products: "Products",
      whyNpsMe: "Why NPS Me",
      milestoneNps: "Milestone NPS",
      npsSurveyProgramme: "NPS Survey Programme",
      whatIsNps: "What is NPS?",
      dataAutomation: "Data & Automation",
      socialListening: "Social Listening",
      blog: "Blog",
      cxCockpit: "CX Cockpit",
    },
    cxCockpit: {
      seoTitle: "CX Cockpit (Demo) | NPS Me",
      seoDescription:
        "Explore your customer experience cockpit: NPS, journey stages, response funnels and verbatim themes in one place.",

      badge: "CX cockpit · demo",
      headline: "Fly your customer experience spaceship",
      intro:
        "A single view of NPS scores, journey stages, response funnels and verbatim themes. This demo cockpit uses the live NPS Me sandbox data.",

      liveFeed: "Live demo data feed",
      liveFeedNote:
        "For a real client build, this cockpit would connect to your production survey and CRM events.",

      leftTitle: "NPS & journey instrumentation",
      leftSub:
        "Filter by contact, company, result type and stage to see how your NPS is behaving across the customer journey.",

      upcomingDial: "Upcoming dial",
      raceTitle: "Race chart – NPS over time by segment",
      raceBody:
        "This panel will show a “race” animation of NPS by journey stage or by key customer segment, so you can literally watch different parts of the experience pull ahead or fall behind.",
      racePlaceholder: "Race chart placeholder",

      copilotTitle: "CX co-pilot summary",
      copilotBody:
        "Here we’ll add an AI “co-pilot” that reads the charts and verbatim themes and gives you a short briefing: where NPS is drifting, which journey stages are hurting, and where to focus next.",
      copilotPlaceholder: "AI commentary placeholder",
    },
  },
  fr: {
    navbar: {
      bookDiscovery: "Prendre rendez-vous",
      languageEn: "EN",
      languageFr: "FR",
    },
    routes: {
      products: "Produits",
      whyNpsMe: "Pourquoi NPS Me",
      milestoneNps: "Parcours NPS",
      npsSurveyProgramme: "Programme d’enquête NPS",
      whatIsNps: "Qu’est-ce que le NPS ?",
      dataAutomation: "Données & automatisation",
      socialListening: "Social listening",
      blog: "Blog",
      cxCockpit: "Cockpit CX",
    },
    cxCockpit: {
      seoTitle: "Cockpit CX (Démo) | NPS Me",
      seoDescription:
        "Explorez votre cockpit d’expérience client : NPS, étapes du parcours, tunnel de réponses et thèmes verbatim, au même endroit.",

      badge: "Cockpit CX · démo",
      headline: "Pilotez votre vaisseau d’expérience client",
      intro:
        "Une vue unique sur les scores NPS, les étapes du parcours, le tunnel de réponses et les thèmes verbatim. Cette démo utilise les données sandbox NPS Me en temps réel.",

      liveFeed: "Flux de données démo en direct",
      liveFeedNote:
        "Pour un déploiement client, ce cockpit se connecterait à votre enquête en production et aux événements CRM.",

      leftTitle: "Instrumentation NPS & parcours",
      leftSub:
        "Filtrez par contact, entreprise, type de résultat et étape pour voir comment votre NPS évolue tout au long du parcours client.",

      upcomingDial: "Indicateur à venir",
      raceTitle: "Graphique “race” – NPS dans le temps par segment",
      raceBody:
        "Ce panneau affichera une animation “race” du NPS par étape du parcours ou par segment clé, pour visualiser en direct quelles parties de l’expérience prennent de l’avance… ou décrochent.",
      racePlaceholder: "Emplacement du graphique race",

      copilotTitle: "Résumé du co-pilote CX",
      copilotBody:
        "Ici, nous ajouterons un “co-pilote” IA qui lit les graphiques et les thèmes verbatim et vous donne un briefing : où le NPS dérive, quelles étapes du parcours posent problème, et où concentrer vos efforts.",
      copilotPlaceholder: "Emplacement du commentaire IA",
    },
  },
};

/**
 * Very small translation helper.
 * Example: t(lang, "navbar.bookDiscovery", "Book discovery")
 */
export function t(lang, path, fallback) {
  const parts = path.split(".");
  let current = TRANSLATIONS[lang] || TRANSLATIONS.en;

  for (const p of parts) {
    if (current && Object.prototype.hasOwnProperty.call(current, p)) {
      current = current[p];
    } else {
      current = undefined;
      break;
    }
  }

  if (typeof current === "string") return current;
  return fallback !== undefined ? fallback : path;
}
