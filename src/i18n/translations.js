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
    products: {
      seoTitle:
        "Productized CX Services: Audits, Momentum Program & Weekly CX Pulse | NPS Me",
      seoDescription:
        "Pick a CX package to improve NPS®, reduce support load, and grow retention: Feedback Foundations, Momentum Program, and weekly CX Pulse reports.",

      header: {
        iconLabel: "Productized CX services",
        tag: "NPS Me / Services",
        accent: "Productized services",
        title: "that turn feedback into growth",
        subtitle:
          "Pick the package that fits your stage—from foundations, to enablement, to a weekly CX intelligence feed you can act on.",
      },

      cards: {
        foundations: {
          title: "Feedback Foundations",
          price: "from £450",
          bullets: [
            "Review mining & journey audit",
            "Baseline NPS®/CSAT/CES & quick wins",
            "Prioritised roadmap (effort/impact)",
          ],
          cta: "Request audit",
        },
        momentum: {
          title: "Momentum Program",
          price: "from £850/mo",
          bullets: [
            "Hands-on implementation & enablement",
            "Monthly review cycles & dashboards",
            "Measured lift on key outcomes",
          ],
          cta: "Book discovery",
        },
        pulse: {
          title: "CX Pulse Report (weekly)",
          price: "from £190/mo",
          bullets: [
            "Social listening across X/LinkedIn/Reddit/Reviews",
            "Top themes, sentiment & competitor pulse",
            "1-page actionable summary + next steps",
          ],
          cta: "See sample report",
          footnote: "Starts manual, scales with automation. Cancel anytime.",
        },
      },

      pulseExplainer: {
        title: "What you get in the weekly CX Pulse",
        left: [
          "Sentiment pulse (WoW change, drivers)",
          "Emerging topics (3-5 themes with examples)",
          "Competitor comparison (optional)",
        ],
        right: [
          "Plain-English insight summary (what to do next)",
          "Lightweight dashboard (rolling trends)",
          "Delivery on the same weekday, every week",
        ],
      },

      cta: {
        title: "Ready for a sample?",
        body:
          "I’ll run a one-off CX Pulse on your brand and send you the PDF within a few days.",
        email: "Email hello@npsme.com",
        book: "Book discovery",
      },
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
    liveAdmin: {
      seoTitle: "Live Survey Admin | NPS Me",
      seoDescription: "Review and send live NPS invitations from your Envola customer list.",

      eyebrow: "Live programme · Envola",
      title: "Live survey admin",
      intro:
        "Track invitations through the full lifecycle, resend when needed, and review completed scores.",

      refresh: "Refresh",
      refreshing: "Refreshing…",

      kpi: {
        total: "Total",
        totalSub: "All invitations in file",
        pending: "Pending",
        pendingSub: "Not yet sent",
        sent: "Sent",
        sentSub: "Delivered or queued",
        started: "Started",
        startedSub: "Opened survey link",
        completed: "Completed",
        npsNA: "NPS: n/a",
        npsValue: "NPS: {nps}",
      },

      responseRate: "Response rate",

      errors: {
        loadUnable: "Unable to load data.",
        selectAtLeastOne: "Please select at least one invitation to send.",
        loadInvFail: "Failed to load invitations",
        loadRespFail: "Failed to load responses",
        sendFail: "Batch send failed",
        resendFail: "Resend failed",
        sendUnable: "We couldn’t send those invitations.",
        resendUnable: "We couldn’t resend that invitation.",
      },

      statusMsg: {
        sent: "Sent {successes} invitation{plural}{failSuffix}",
        failSuffix: ", {failures} failed.",
        resent: "Resent invitation {invitationId}.",
      },

      sections: {
        pending: "Pending",
        pendingHelp: "Select and send invitations.",
        sent: "Sent",
        sentHelp: "Resend if someone cannot find the email.",
        started: "Started",
        startedHelp: "These recipients opened the survey link.",
        completed: "Completed",
        completedHelp: "Scores are shown when a response exists in /npsme/live/responses.csv.",
      },

      actions: {
        selectAll: "Select all",
        deselectAll: "Deselect all",
        sendSelected: "Send selected",
        sending: "Sending…",
        resend: "Resend",
        resending: "Resending…",
      },

      empty: {
        loading: "Loading…",
        noPending: "No pending invitations.",
        noSent: "No sent invitations.",
        noStarted: "No started invitations.",
        noCompleted: "No completed invitations.",
      },

      table: {
        invitationId: "Invitation ID",
        name: "Name",
        email: "Email",
        device: "Device",
        am: "AM",
        status: "Status",
        lastSent: "Last sent",
        resends: "Resends",
        action: "Action",
        score: "Score",
        comment: "Comment",
        created: "Created",
      },

      misc: {
        dash: "-",
      },
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
    products: {
      seoTitle:
        "Offres CX packagées : audits, programme Momentum & CX Pulse hebdo | NPS Me",
      seoDescription:
        "Choisissez une offre CX pour améliorer le NPS®, réduire la charge support et augmenter la rétention : Feedback Foundations, Momentum Program et rapports CX Pulse hebdomadaires.",

      header: {
        iconLabel: "Offres CX packagées",
        tag: "NPS Me / Services",
        accent: "Offres packagées",
        title: "qui transforment le feedback en croissance",
        subtitle:
          "Choisissez le pack adapté à votre étape : bases, accompagnement, ou un flux hebdomadaire d’insights CX actionnables.",
      },

      cards: {
        foundations: {
          title: "Feedback Foundations",
          price: "à partir de 450 £",
          bullets: [
            "Analyse des avis & audit du parcours",
            "NPS®/CSAT/CES de référence & quick wins",
            "Roadmap priorisée (effort/impact)",
          ],
          cta: "Demander un audit",
        },
        momentum: {
          title: "Momentum Program",
          price: "à partir de 850 £/mois",
          bullets: [
            "Mise en œuvre & accompagnement",
            "Cycles mensuels & dashboards",
            "Amélioration mesurée des résultats",
          ],
          cta: "Prendre rendez-vous",
        },
        pulse: {
          title: "Rapport CX Pulse (hebdo)",
          price: "à partir de 190 £/mois",
          bullets: [
            "Social listening (X/LinkedIn/Reddit/Avis)",
            "Thèmes clés, sentiment & pouls concurrentiel",
            "Synthèse actionnable (1 page) + prochaines étapes",
          ],
          cta: "Voir un exemple",
          footnote:
            "Démarre en manuel, évolue vers l’automatisation. Résiliable à tout moment.",
        },
      },

      pulseExplainer: {
        title: "Ce que vous recevez dans le CX Pulse hebdomadaire",
        left: [
          "Baromètre de sentiment (évolution semaine/semaine, causes)",
          "Sujets émergents (3–5 thèmes avec exemples)",
          "Comparaison concurrentielle (option)",
        ],
        right: [
          "Synthèse claire (quoi faire ensuite)",
          "Dashboard léger (tendances)",
          "Livraison le même jour chaque semaine",
        ],
      },

      cta: {
        title: "Prêt pour un exemple ?",
        body:
          "Je réalise un CX Pulse ponctuel sur votre marque et je vous envoie le PDF sous quelques jours.",
        email: "Écrire à hello@npsme.com",
        book: "Prendre rendez-vous",
      },
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
     liveAdmin: {
      seoTitle: "Admin enquête live | NPS Me",
      seoDescription:
        "Gérez et envoyez des invitations NPS en direct depuis votre liste clients Envola.",

      eyebrow: "Programme live · Envola",
      title: "Administration enquête live",
      intro:
        "Suivez les invitations de bout en bout, renvoyez si besoin, et consultez les scores terminés.",

      refresh: "Rafraîchir",
      refreshing: "Rafraîchissement…",

      kpi: {
        total: "Total",
        totalSub: "Toutes les invitations du fichier",
        pending: "En attente",
        pendingSub: "Pas encore envoyées",
        sent: "Envoyées",
        sentSub: "Envoyées ou en file",
        started: "Commencées",
        startedSub: "Lien ouvert",
        completed: "Terminées",
        npsNA: "NPS : n/a",
        npsValue: "NPS : {nps}",
      },

      responseRate: "Taux de réponse",

      errors: {
        loadUnable: "Impossible de charger les données.",
        selectAtLeastOne: "Veuillez sélectionner au moins une invitation à envoyer.",
        loadInvFail: "Échec du chargement des invitations",
        loadRespFail: "Échec du chargement des réponses",
        sendFail: "Échec de l’envoi groupé",
        resendFail: "Échec du renvoi",
        sendUnable: "Impossible d’envoyer ces invitations.",
        resendUnable: "Impossible de renvoyer cette invitation.",
      },

      statusMsg: {
        sent: "{successes} invitation{plural} envoyée{plural}{failSuffix}",
        failSuffix: ", {failures} en échec.",
        resent: "Invitation {invitationId} renvoyée.",
      },

      sections: {
        pending: "En attente",
        pendingHelp: "Sélectionnez puis envoyez des invitations.",
        sent: "Envoyées",
        sentHelp: "Renvoyez si la personne ne retrouve pas l’email.",
        started: "Commencées",
        startedHelp: "Ces destinataires ont ouvert le lien du questionnaire.",
        completed: "Terminées",
        completedHelp:
          "Les scores s’affichent lorsqu’une réponse existe dans /npsme/live/responses.csv.",
      },

      actions: {
        selectAll: "Tout sélectionner",
        deselectAll: "Tout désélectionner",
        sendSelected: "Envoyer la sélection",
        sending: "Envoi…",
        resend: "Renvoyer",
        resending: "Renvoi…",
      },

      empty: {
        loading: "Chargement…",
        noPending: "Aucune invitation en attente.",
        noSent: "Aucune invitation envoyée.",
        noStarted: "Aucune invitation commencée.",
        noCompleted: "Aucune invitation terminée.",
      },

      table: {
        invitationId: "ID invitation",
        name: "Nom",
        email: "Email",
        device: "Appareil",
        am: "AM",
        status: "Statut",
        lastSent: "Dernier envoi",
        resends: "Renvois",
        action: "Action",
        score: "Score",
        comment: "Commentaire",
        created: "Créé",
      },

      misc: {
        dash: "-",
      },
    },
  },
};

/**
 * Very small translation helper.
 * Example: t(lang, "navbar.bookDiscovery", "Book discovery")
 */
export function tr(lang, path, fallback) {
  // ✅ Guard: never crash if a caller passes undefined/null/non-string
  if (typeof path !== "string" || !path.trim()) {
    return fallback !== undefined ? fallback : "";
  }

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
