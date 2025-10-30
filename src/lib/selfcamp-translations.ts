/**
 * Traductions pour les pages publiques SelfCamp
 * Support: Français, Anglais, Allemand
 */

export type SelfcampLocale = "fr" | "en" | "de";

export interface SelfcampTranslations {
  // Header
  header: {
    availability: string;
    contact: string;
    contactShort: string; // Version courte pour mobile
  };

  // Homepage - Hero
  hero: {
    tagline: string;
    findSpot: string; // "Trouvez votre" / "Find your" / "Finden Sie Ihren"
    findSpotHighlight: string; // "emplacement idéal" / "ideal spot" / "idealen Stellplatz"
    searchPlaceholder: string;
  };

  // Search Bar
  search: {
    seeMap: string;
    exploreAll: string;
    recentSearches: string;
  };

  // Loading Page
  loading: {
    message: string;
    subtitle: string;
  };

  // Map Page
  map: {
    availability: string;
    searchPlaceholder: string;
    results: string;
    result: string;
    available: string;
    seeDetails: string;
    bookNow: string;
    loadingMap: string;
    placesAvailable: string; // "places disponibles"
    onlineBooking: string; // "Réservation en ligne disponible"
    lateArrival: string; // "Camping avec possibilité d'arrivée tardive"
    gps: string;
    reserve: string; // "Réserver"
    menu: string;
    home: string;
    about: string;
    contact: string;
    tagline: string; // "Trouvez votre spot sans stress."
    followUs: string;
    discovering: string; // "Découverte des spots de camping..."
    loadingMapFallback: string; // "Chargement de la carte..."
    clearSearch: string; // "Effacer"
    onRequest: string; // "Sur demande"
    infoNotAvailable: string; // "Information non disponible"
    full: string; // "Complet"
    fullAvailableOn: (date: string) => string; // "Complet - Libre le {date}"
    availableLocations: string; // "Emplacements disponibles"
    closed: string; // "Fermé"
  };

  // Establishment Page
  establishment: {
    backToMap: string;
    contactUs: string;
    contactShort: string; // Version mobile
    notFound: {
      title: string;
      description: string;
      backButton: string;
    };
    header: {
      open247: string;
      arrival: string;
      departure: string;
      departureBefore: string;
    };
    info: {
      website: string;
      directions: string;
    };
    about: {
      title: string;
    };
    cta: {
      bookNow: string;
      getDirections: string;
    };
    impact: {
      title: string;
    };
    nearby: {
      title: string;
      website: string;
      directions: string;
      documents: string;
    };
    amenities: {
      title: string;
    };
    documents: {
      title: string;
    };
    finalCta: {
      title: string;
      description: string;
      button: string;
    };
    images: {
      noImage: string;
    };
    // Amenity attributes
    attributes: {
      wifi: string;
      electricity: string;
      water: string;
      showers: string;
      toilets: string;
      wasteDisposal: string;
      parking: string;
      security: string;
      restaurant: string;
      store: string;
      laundry: string;
      playground: string;
      petFriendly: string;
    };
  };

  // Homepage - Benefits
  benefits: {
    title: string;
    titleHighlight: string; // "SelfCamp"
    access247: {
      title: string;
      description: string;
    };
    discounts: {
      title: string;
      description: string;
    };
    legal: {
      title: string;
      description: string;
    };
  };

  // Homepage - CTA Section
  cta: {
    title: string;
    titleHighlight: string; // "SelfCamp"
    description: string;
    learnMore: string;
  };

  // About Page - Hero
  about: {
    badge: string;
    title: string;
    titleHighlight: string; // "SelfCamp"
    subtitle: string;
    stats: {
      legal: string;
      access: string;
      installation: string;
    };
    backHome: string;
  };

  // About Page - Mission
  mission: {
    title: string;
    titleHighlight: string; // "mission"
    subtitle: string;
    quotes: string[]; // Array de 3 citations
  };

  // About Page - Timeline
  timeline: {
    regionalSupport: {
      title: string;
      intro1: string;
      intro2: string;
      localCommerce: {
        title: string;
        description: string;
      };
      regionalDiscovery: {
        title: string;
        description: string;
      };
      circularEconomy: {
        title: string;
        description: string;
      };
      desktopIntro1: string;
      desktopIntro2: string;
    };
    services: {
      title: string;
      intro: string;
      introHighlight: string; // "solution d'enregistrement"
      introContinuation: string; // "nous vous accompagnons pour..."
      listTitle: string;
      items: string[];
      highlight: {
        title: string;
        description: string;
      };
    };
    providerBenefits: {
      title: string;
      regulatory: {
        title: string;
        items: string[];
      };
      revenue: {
        title: string;
        items: string[];
      };
      partnership: {
        title: string;
        items: string[];
      };
      data: {
        title: string;
        items: string[];
      };
      highlight: {
        title: string;
        description: string;
      };
    };
  };

  // About Page - Final CTA
  finalCta: {
    title: string;
    description: string;
    contactButton: string;
    mapButton: string;
  };

  // Contact Page
  contactPage: {
    // Header
    availability: string; // "24H/24 - 7J/7"
    contactButton: string; // "CONTACTEZ-NOUS"
    contactShort: string; // "CONTACT"
    backHome: string; // "Accueil"

    // Hero
    badge: string; // "Parlons de votre projet"
    title: string; // "Contactez"
    titleBrand: string; // "SelfCamp"
    subtitle: string; // "Une question ? Besoin d'informations ? Nous sommes à votre écoute"

    // Direct Contact Section
    directContactTitle: string; // "Contactez-nous directement"
    email: string; // "Email"
    phone: string; // "Téléphone"
    location: string; // "Localisation"

    // Form Section
    formTitle: string; // "Ou écrivez-nous"
    formSubtitle: string; // "Décrivez votre projet, nous vous répondrons rapidement"

    // Form Fields
    nameLabel: string; // "Nom et prénom *"
    namePlaceholder: string; // "Jean Dupont"
    emailLabel: string; // "Email *"
    emailPlaceholder: string; // "jean.dupont@websud.ch"
    companyLabel: string; // "Commune / parking / emplacement *"
    companyPlaceholder: string; // "Nom"
    projectLabel: string; // "Votre projet"
    projectPlaceholder: string; // "Décrivez votre situation : camping sauvage actuel, objectifs, contraintes..."

    // Form Actions
    sendButton: string; // "Envoyer le message"
    sending: string; // "Envoi en cours..."

    // Status Messages
    successMessage: string; // "Message envoyé avec succès ! Nous vous recontacterons rapidement."
    errorMessage: string; // "Une erreur est survenue"
    connectionError: string; // "Erreur de connexion. Veuillez réessayer."
  };

  // Footer
  footer: {
    description: string;
    contact: {
      title: string;
      location: string;
    };
    navigation: {
      title: string;
      home: string;
      map: string;
      about: string;
      contact: string;
      selfkeySystem: string;
    };
    legal: {
      title: string;
      terms: string;
      termsConditions: string;
      privacy: string;
    };
    copyright: string;
    developedBy: string;
    payments: string;
  };
}

export const selfcampTranslations: Record<
  SelfcampLocale,
  SelfcampTranslations
> = {
  // ========== FRANÇAIS ==========
  fr: {
    header: {
      availability: "24H/24 - 7J/7",
      contact: "CONTACTEZ-NOUS",
      contactShort: "CONTACT",
    },
    hero: {
      tagline: "La liberté de camper sans contrainte",
      findSpot: "Trouvez votre",
      findSpotHighlight: "emplacement idéal",
      searchPlaceholder: "Recherchez par ville, région ou nom de camping",
    },
    search: {
      seeMap: "Voir la carte",
      exploreAll: "Explorer tous les emplacements disponibles",
      recentSearches: "Recherches récentes",
    },
    loading: {
      message: "Chargement de votre carte Selfcamp...",
      subtitle: "Préparation des meilleurs spots de camping-car",
    },
    map: {
      availability: "Disponible 24H/24 - 7J/7",
      searchPlaceholder: "Rechercher un lieu, une ville, un emplacement...",
      results: "résultats",
      result: "résultat",
      available: "disponible",
      seeDetails: "Voir les détails",
      bookNow: "Réserver maintenant",
      loadingMap: "Chargement de la carte...",
      placesAvailable: "places disponibles",
      onlineBooking: "Réservation en ligne disponible",
      lateArrival: "Camping avec possibilité d'arrivée tardive",
      gps: "GPS",
      reserve: "Réserver",
      menu: "Menu",
      home: "Accueil",
      about: "A propos",
      contact: "Contact",
      tagline: "Trouvez votre spot sans stress.",
      followUs: "Suivez-nous",
      discovering: "Découverte des spots de camping...",
      loadingMapFallback: "Chargement de la carte...",
      clearSearch: "Effacer",
      onRequest: "Sur demande",
      infoNotAvailable: "Information non disponible",
      full: "Complet",
      fullAvailableOn: (date: string) => `Complet - Libre le ${date}`,
      availableLocations: "Emplacements disponibles",
      closed: "Fermé",
    },
    establishment: {
      backToMap: "Retour à la carte",
      contactUs: "CONTACTEZ-NOUS",
      contactShort: "CONTACT",
      notFound: {
        title: "Établissement non trouvé",
        description:
          "Cet établissement n'existe pas ou n'est pas disponible publiquement.",
        backButton: "Retour à la carte",
      },
      header: {
        open247: "Ouvert 24h/24",
        arrival: "Arrivée:",
        departure: "Départ",
        departureBefore: "Départ avant",
      },
      info: {
        website: "Site web",
        directions: "Itinéraire",
      },
      about: {
        title: "A propos",
      },
      cta: {
        bookNow: "Réserver maintenant",
        getDirections: "Obtenir l'itinéraire",
      },
      impact: {
        title: "L'impact de votre séjour",
      },
      nearby: {
        title: "À proximité",
        website: "Site web",
        directions: "Itinéraire",
        documents: "Documents :",
      },
      amenities: {
        title: "Équipements et services",
      },
      documents: {
        title: "Documents utiles",
      },
      finalCta: {
        title: "Prêt à réserver votre place ?",
        description:
          "Réservation simple et rapide. Paiement sécurisé. Accès immédiat.",
        button: "Réserver maintenant",
      },
      images: {
        noImage: "Aucune image disponible",
      },
      attributes: {
        wifi: "WiFi gratuit",
        electricity: "Électricité",
        water: "Eau potable",
        showers: "Douches",
        toilets: "Toilettes",
        wasteDisposal: "Vidange eaux usées",
        parking: "Parking",
        security: "Sécurité 24h/24",
        restaurant: "Restaurant",
        store: "Boutique",
        laundry: "Laverie",
        playground: "Aire de jeux",
        petFriendly: "Animaux acceptés",
      },
    },
    benefits: {
      title: "Pourquoi choisir",
      titleHighlight: "Selfcamp",
      access247: {
        title: "Accès 24h/24 et 7j/7",
        description:
          "Enregistrement autonome et facile, sans application à télécharger ni compte à créer. Arrivez quand vous voulez.",
      },
      discounts: {
        title: "Réductions auprès d'artisans locaux",
        description:
          "Profitez d'avantages dans les boulangeries, épiceries et boucheries... de la région",
      },
      legal: {
        title: "Emplacements conforme à la loi",
        description:
          "Dormez en toute tranquillité dans le respect des réglementations locales",
      },
    },
    cta: {
      title: "Intéressés par",
      titleHighlight: "Selfcamp",
      description:
        "Si vous êtes propriétaire d'un parking ou d'un espace pouvant accueillir des vans, découvrez comment devenir prestataire vous aussi.",
      learnMore: "En savoir plus",
    },
    about: {
      badge: "Solution pour communes suisses",
      title: "A propos de",
      titleHighlight: "Selfcamp",
      subtitle:
        "Une solution complète pour créer des aires de camping-car qui bénéficient aux communes, aux régions et aux vanlifer",
      stats: {
        legal: "Conforme à la loi",
        access: "Accès autonome",
        installation: "Installation Informatique",
      },
      backHome: "Accueil",
    },
    mission: {
      title: "Notre",
      titleHighlight: "mission",
      subtitle:
        "Transformer le camping sauvage en opportunité économique pour les communes fribourgeoises",
      quotes: [
        "Créer un pont entre tourisme durable et développement territorial",
        "Transformer chaque nuitée en opportunité pour les territoires",
        "Valoriser les régions tout en respectant l'environnement",
      ],
    },
    timeline: {
      regionalSupport: {
        title: "Soutien aux Régions",
        intro1:
          "Des aires de camping organisées pour valoriser les régions moins touristiques.",
        intro2:
          "Les artisans locaux profitent des touristes grâce au système de partenariat",
        localCommerce: {
          title: "Commerce Local",
          description: "Boulangeries, épiceries profitent du passage",
        },
        regionalDiscovery: {
          title: "Découverte Régionale",
          description: "Villages hors des grands axes touristiques",
        },
        circularEconomy: {
          title: "Économie Circulaire",
          description: "Retombées économiques directes pour la région",
        },
        desktopIntro1:
          "Le camping sauvage favorise les visites des régions moins touristiques. En créant des aires Selfcamp, nous organisons ces nuitées et faisons découvrir des villages hors des grands axes.",
        desktopIntro2:
          "Les artisans locaux profitent des touristes grâce au système de partenariat",
      },
      services: {
        title: "Nos Prestations",
        intro: "Au-delà de notre",
        introHighlight: "solution d'enregistrement",
        introContinuation:
          "nous vous accompagnons pour l'organisation optimale de votre aire.",
        listTitle: "Nos prestations incluent :",
        items: [
          "Délimitation de la zone et des places",
          "Mise en place de la signalétique",
          "Mise en place du système d'enregistrement (Totem et QR code)",
          "Solution de vidange (sur place ou dans campings partenaires)",
          "Promotion sur site internet",
          "Promotion sur réseaux sociaux",
        ],
        highlight: {
          title: "Solution Complète Clé en Main",
          description:
            "De la conception à la promotion, nous prenons en charge tous les aspects de votre aire de camping-car pour garantir son succès.",
        },
      },
      providerBenefits: {
        title: "Avantages Prestataires",
        regulatory: {
          title: "Conformité Réglementaire",
          items: [
            "Structure légale pour interdire le camping sauvage",
            "Respect des obligations de déclaration",
            "Traçabilité complète pour audits",
            "Conformité RGPD et protection des données",
          ],
        },
        revenue: {
          title: "Revenus Garantis",
          items: [
            "Collecte automatisée des taxes sans perte",
            "Augmentation des recettes fiscales",
          ],
        },
        partnership: {
          title: "Partenariat Tout-en-un",
          items: [
            "Amélioration des infrastructures",
            "Réseau de services via campings partenaires",
            "Option de parking payant",
          ],
        },
        data: {
          title: "Données Stratégiques",
          items: [
            "Fréquentation, flux et saisonnalité",
            "Profiling visiteurs et origine géographique",
            "Identification des zones sous-exploitées",
            "Anticipation des pics d'affluence",
          ],
        },
        highlight: {
          title: "Valorisez Votre Territoire",
          description:
            "Des outils concrets pour gérer, monétiser et développer votre attractivité touristique.",
        },
      },
    },
    finalCta: {
      title: "Nous sommes à disposition pour plus de détails",
      description:
        "Découvrez comment Selfcamp peut vous aider à créer des aires de camping-car conformes et autonomes.",
      contactButton: "Nous contacter",
      mapButton: "Voir les aires existantes",
    },
    footer: {
      description: "L'accès de stationnement pour vanlife en Suisse.",
      contact: {
        title: "Contact",
        location: "Nous contacter",
      },
      navigation: {
        title: "Navigation",
        home: "Accueil",
        map: "Carte des aires",
        about: "A propos de Selfcamp",
        contact: "Contactez-nous",
        selfkeySystem: "Système Selfkey",
      },
      legal: {
        title: "Informations légales",
        terms: "Mentions légales",
        termsConditions: "CGV & Droit de rétractation",
        privacy: "Politique de confidentialité",
      },
      copyright: "© 2025 Selfcamp. Tous droits réservés. Développé par",
      developedBy: "Webbing.ch",
      payments:
        "Paiements sécurisés par Stripe • Cartes bancaires et TWINT acceptés",
    },

    contactPage: {
      availability: "24H/24 - 7J/7",
      contactButton: "CONTACTEZ-NOUS",
      contactShort: "CONTACT",
      backHome: "Accueil",
      badge: "Parlons de votre projet",
      title: "Contactez",
      titleBrand: "SelfCamp",
      subtitle:
        "Une question ? Besoin d'informations ? Nous sommes à votre écoute",
      directContactTitle: "Contactez-nous directement",
      email: "Email",
      phone: "Téléphone",
      location: "Localisation",
      formTitle: "Ou écrivez-nous",
      formSubtitle: "Décrivez votre projet, nous vous répondrons rapidement",
      nameLabel: "Nom et prénom *",
      namePlaceholder: "Jean Dupont",
      emailLabel: "Email *",
      emailPlaceholder: "jean.dupont@websud.ch",
      companyLabel: "Commune / parking / emplacement *",
      companyPlaceholder: "Nom",
      projectLabel: "Votre projet",
      projectPlaceholder:
        "Décrivez votre situation : camping sauvage actuel, objectifs, contraintes...",
      sendButton: "Envoyer le message",
      sending: "Envoi en cours...",
      successMessage:
        "Message envoyé avec succès ! Nous vous recontacterons rapidement.",
      errorMessage: "Une erreur est survenue",
      connectionError: "Erreur de connexion. Veuillez réessayer.",
    },
  },

  // ========== ENGLISH ==========
  en: {
    header: {
      availability: "24/7 - YEAR ROUND",
      contact: "CONTACT US",
      contactShort: "CONTACT",
    },
    hero: {
      tagline: "The freedom to camp, without constraints",
      findSpot: "Find your",
      findSpotHighlight: "ideal spot",
      searchPlaceholder: "Search by city, region or campsite name",
    },
    search: {
      seeMap: "See map",
      exploreAll: "Explore all available locations",
      recentSearches: "Recent searches",
    },
    loading: {
      message: "Loading your Selfcamp map...",
      subtitle: "Preparing the best motorhome spots",
    },
    map: {
      availability: "Available 24/7",
      searchPlaceholder: "Search for a place, city, location...",
      results: "results",
      result: "result",
      available: "available",
      seeDetails: "See details",
      bookNow: "Book now",
      loadingMap: "Loading map...",
      placesAvailable: "places available",
      onlineBooking: "Online booking available",
      lateArrival: "Campsite with late arrival option",
      gps: "GPS",
      reserve: "Reserve",
      menu: "Menu",
      home: "Home",
      about: "About",
      contact: "Contact",
      tagline: "Find your spot stress-free.",
      followUs: "Follow us",
      discovering: "Discovering camping spots...",
      loadingMapFallback: "Loading map...",
      clearSearch: "Clear",
      onRequest: "On request",
      infoNotAvailable: "Information not available",
      full: "Full",
      fullAvailableOn: (date: string) => `Full - Available on ${date}`,
      availableLocations: "Available locations",
      closed: "Closed",
    },
    establishment: {
      backToMap: "Back to map",
      contactUs: "CONTACT US",
      contactShort: "CONTACT",
      notFound: {
        title: "Establishment not found",
        description:
          "This establishment does not exist or is not publicly available.",
        backButton: "Back to map",
      },
      header: {
        open247: "Open 24/7",
        arrival: "Arrival:",
        departure: "Departure",
        departureBefore: "Departure before",
      },
      info: {
        website: "Website",
        directions: "Directions",
      },
      about: {
        title: "About",
      },
      cta: {
        bookNow: "Book now",
        getDirections: "Get directions",
      },
      impact: {
        title: "The impact of your stay",
      },
      nearby: {
        title: "Nearby",
        website: "Website",
        directions: "Directions",
        documents: "Documents:",
      },
      amenities: {
        title: "Amenities and services",
      },
      documents: {
        title: "Useful documents",
      },
      finalCta: {
        title: "Ready to book your spot?",
        description:
          "Simple and fast booking. Secure payment. Immediate access.",
        button: "Book now",
      },
      images: {
        noImage: "No image available",
      },
      attributes: {
        wifi: "Free WiFi",
        electricity: "Electricity",
        water: "Drinking water",
        showers: "Showers",
        toilets: "Toilets",
        wasteDisposal: "Waste water disposal",
        parking: "Parking",
        security: "24/7 Security",
        restaurant: "Restaurant",
        store: "Shop",
        laundry: "Laundry",
        playground: "Playground",
        petFriendly: "Pets allowed",
      },
    },
    benefits: {
      title: "Why choose",
      titleHighlight: "Selfcamp",
      access247: {
        title: "24/7 Access",
        description:
          "Easy self-registration, no app to download or account to create. Arrive whenever you want.",
      },
      discounts: {
        title: "Discounts from local artisans",
        description:
          "Enjoy benefits at local bakeries, grocery stores and butcher shops in the region",
      },
      legal: {
        title: "Law-compliant locations",
        description: "Sleep peacefully in compliance with local regulations",
      },
    },
    cta: {
      title: "Interested in",
      titleHighlight: "Selfcamp",
      description:
        "If you own a parking lot or space that can accommodate vans, discover how to become a provider too.",
      learnMore: "Learn more",
    },
    about: {
      badge: "Solution for Swiss municipalities",
      title: "About",
      titleHighlight: "Selfcamp",
      subtitle:
        "A complete solution to create motorhome areas that benefit municipalities, regions and vanlifers",
      stats: {
        legal: "Law Compliant",
        access: "Autonomous Access",
        installation: "IT Installation",
      },
      backHome: "Home",
    },
    mission: {
      title: "Our",
      titleHighlight: "mission",
      subtitle:
        "Transforming wild camping into economic opportunity for Fribourg municipalities",
      quotes: [
        "Creating a bridge between sustainable tourism and territorial development",
        "Turning each overnight stay into an opportunity for territories",
        "Enhancing regions while respecting the environment",
      ],
    },
    timeline: {
      regionalSupport: {
        title: "Regional Support",
        intro1: "Organized camping areas to promote less touristy regions.",
        intro2:
          "Local artisans benefit from tourists through the partnership system",
        localCommerce: {
          title: "Local Commerce",
          description: "Bakeries, grocery stores benefit from traffic",
        },
        regionalDiscovery: {
          title: "Regional Discovery",
          description: "Villages off the main tourist routes",
        },
        circularEconomy: {
          title: "Circular Economy",
          description: "Direct economic benefits for the region",
        },
        desktopIntro1:
          "Wild camping promotes visits to less touristy regions. By creating Selfcamp areas, we organize these overnight stays and showcase villages off the main routes.",
        desktopIntro2:
          "Local artisans benefit from tourists through the partnership system",
      },
      services: {
        title: "Our Services",
        intro: "Beyond our",
        introHighlight: "registration solution",
        introContinuation:
          "we support you in the optimal organization of your area.",
        listTitle: "Our services include:",
        items: [
          "Zone and spot delimitation",
          "Signage installation",
          "Registration system setup (Totem and QR code)",
          "Waste disposal solution (on-site or in partner campsites)",
          "Website promotion",
          "Social media promotion",
        ],
        highlight: {
          title: "Complete Turnkey Solution",
          description:
            "From design to promotion, we handle all aspects of your motorhome area to ensure its success.",
        },
      },
      providerBenefits: {
        title: "Provider Benefits",
        regulatory: {
          title: "Regulatory Compliance",
          items: [
            "Legal structure to prohibit wild camping",
            "Compliance with declaration requirements",
            "Complete traceability for audits",
            "GDPR compliance and data protection",
          ],
        },
        revenue: {
          title: "Guaranteed Revenue",
          items: [
            "Automated tax collection without loss",
            "Increased tax revenue",
          ],
        },
        partnership: {
          title: "All-in-One Partnership",
          items: [
            "Infrastructure improvements",
            "Service network via partner campsites",
            "Paid parking option",
          ],
        },
        data: {
          title: "Strategic Data",
          items: [
            "Attendance, flow and seasonality",
            "Visitor profiling and geographical origin",
            "Identification of underused areas",
            "Peak attendance anticipation",
          ],
        },
        highlight: {
          title: "Enhance Your Territory",
          description:
            "Concrete tools to manage, monetize and develop your tourist attractiveness.",
        },
      },
    },
    finalCta: {
      title: "We are available for more details",
      description:
        "Discover how Selfcamp can help you create compliant and autonomous motorhome areas.",
      contactButton: "Contact us",
      mapButton: "See existing areas",
    },
    footer: {
      description: "Parking access for vanlife in Switzerland.",
      contact: {
        title: "Contact",
        location: "Contact us",
      },
      navigation: {
        title: "Navigation",
        home: "Home",
        map: "Area Map",
        about: "About Selfcamp",
        contact: "Contact Us",
        selfkeySystem: "SelfKey System",
      },
      legal: {
        title: "Legal Information",
        terms: "Legal Notice",
        termsConditions: "Terms & Right of Withdrawal",
        privacy: "Privacy Policy",
      },
      copyright: "© 2025 Selfcamp. All rights reserved. Developed by",
      developedBy: "Webbing.ch",
      payments: "Secure payments by Stripe • Credit cards and TWINT accepted",
    },

    contactPage: {
      availability: "24/7 - ALWAYS OPEN",
      contactButton: "CONTACT US",
      contactShort: "CONTACT",
      backHome: "Home",
      badge: "Let's talk about your project",
      title: "Contact",
      titleBrand: "SelfCamp",
      subtitle: "Have a question? Need information? We're here to listen",
      directContactTitle: "Contact us directly",
      email: "Email",
      phone: "Phone",
      location: "Location",
      formTitle: "Or write to us",
      formSubtitle: "Describe your project, we'll get back to you quickly",
      nameLabel: "First and last name *",
      namePlaceholder: "John Doe",
      emailLabel: "Email *",
      emailPlaceholder: "john.doe@websud.ch",
      companyLabel: "Municipality / parking / location *",
      companyPlaceholder: "Name",
      projectLabel: "Your project",
      projectPlaceholder:
        "Describe your situation: current wild camping, objectives, constraints...",
      sendButton: "Send message",
      sending: "Sending...",
      successMessage: "Message sent successfully! We will contact you shortly.",
      errorMessage: "An error occurred",
      connectionError: "Connection error. Please try again.",
    },
  },

  // ========== DEUTSCH (ALLEMAND) ==========
  de: {
    header: {
      availability: "24/7 - GANZJÄHRIG",
      contact: "KONTAKTIEREN SIE UNS",
      contactShort: "KONTAKT",
    },
    hero: {
      tagline: "Die Freiheit zu campen, ohne Einschränkungen",
      findSpot: "Finden Sie Ihren",
      findSpotHighlight: "idealen Stellplatz",
      searchPlaceholder: "Suche nach Stadt, Region oder Campingplatz",
    },
    search: {
      seeMap: "Karte ansehen",
      exploreAll: "Alle verfügbaren Standorte erkunden",
      recentSearches: "Letzte Suchanfragen",
    },
    loading: {
      message: "Ihre Selfcamp-Karte wird geladen...",
      subtitle: "Vorbereitung der besten Wohnmobilstellplätze",
    },
    map: {
      availability: "Verfügbar 24/7",
      searchPlaceholder: "Suche nach Ort, Stadt, Standort...",
      results: "Ergebnisse",
      result: "Ergebnis",
      available: "verfügbar",
      seeDetails: "Details anzeigen",
      bookNow: "Jetzt buchen",
      loadingMap: "Karte wird geladen...",
      placesAvailable: "Plätze verfügbar",
      onlineBooking: "Online-Buchung verfügbar",
      lateArrival: "Campingplatz mit Möglichkeit zur späten Ankunft",
      gps: "GPS",
      reserve: "Reservieren",
      menu: "Menü",
      home: "Startseite",
      about: "Über uns",
      contact: "Kontakt",
      tagline: "Finden Sie Ihren Platz stressfrei.",
      followUs: "Folgen Sie uns",
      discovering: "Campingplätze entdecken...",
      loadingMapFallback: "Karte wird geladen...",
      clearSearch: "Löschen",
      onRequest: "Auf Anfrage",
      infoNotAvailable: "Informationen nicht verfügbar",
      full: "Ausgebucht",
      fullAvailableOn: (date: string) => `Ausgebucht - Verfügbar am ${date}`,
      availableLocations: "Verfügbare Standorte",
      closed: "Geschlossen",
    },
    establishment: {
      backToMap: "Zurück zur Karte",
      contactUs: "KONTAKTIEREN SIE UNS",
      contactShort: "KONTAKT",
      notFound: {
        title: "Einrichtung nicht gefunden",
        description:
          "Diese Einrichtung existiert nicht oder ist nicht öffentlich verfügbar.",
        backButton: "Zurück zur Karte",
      },
      header: {
        open247: "Geöffnet 24/7",
        arrival: "Ankunft:",
        departure: "Abreise",
        departureBefore: "Abreise vor",
      },
      info: {
        website: "Webseite",
        directions: "Wegbeschreibung",
      },
      about: {
        title: "Über uns",
      },
      cta: {
        bookNow: "Jetzt buchen",
        getDirections: "Wegbeschreibung abrufen",
      },
      impact: {
        title: "Die Auswirkung Ihres Aufenthalts",
      },
      nearby: {
        title: "In der Nähe",
        website: "Webseite",
        directions: "Wegbeschreibung",
        documents: "Dokumente:",
      },
      amenities: {
        title: "Ausstattung und Dienstleistungen",
      },
      documents: {
        title: "Nützliche Dokumente",
      },
      finalCta: {
        title: "Bereit, Ihren Platz zu buchen?",
        description:
          "Einfache und schnelle Buchung. Sichere Zahlung. Sofortiger Zugang.",
        button: "Jetzt buchen",
      },
      images: {
        noImage: "Kein Bild verfügbar",
      },
      attributes: {
        wifi: "Kostenloses WLAN",
        electricity: "Strom",
        water: "Trinkwasser",
        showers: "Duschen",
        toilets: "Toiletten",
        wasteDisposal: "Abwasserentsorgung",
        parking: "Parkplatz",
        security: "24/7 Sicherheit",
        restaurant: "Restaurant",
        store: "Geschäft",
        laundry: "Wäscherei",
        playground: "Spielplatz",
        petFriendly: "Haustiere erlaubt",
      },
    },
    benefits: {
      title: "Warum",
      titleHighlight: "Selfcamp",
      access247: {
        title: "24/7 Zugang",
        description:
          "Einfache Selbstregistrierung, keine App herunterzuladen oder Konto zu erstellen. Kommen Sie, wann Sie wollen.",
      },
      discounts: {
        title: "Rabatte bei lokalen Handwerkern",
        description:
          "Profitieren Sie von Vorteilen in Bäckereien, Lebensmittelgeschäften und Metzgereien der Region",
      },
      legal: {
        title: "Gesetzeskonforme Standorte",
        description:
          "Schlafen Sie ruhig in Übereinstimmung mit lokalen Vorschriften",
      },
    },
    cta: {
      title: "Interessiert an",
      titleHighlight: "Selfcamp",
      description:
        "Wenn Sie einen Parkplatz oder einen Raum besitzen, der Wohnmobile aufnehmen kann, erfahren Sie, wie auch Sie Anbieter werden können.",
      learnMore: "Mehr erfahren",
    },
    about: {
      badge: "Lösung für Schweizer Gemeinden",
      title: "Über",
      titleHighlight: "Selfcamp",
      subtitle:
        "Eine komplette Lösung zur Schaffung von Wohnmobilstellplätzen, die Gemeinden, Regionen und Vanlifern zugutekommen",
      stats: {
        legal: "Gesetzeskonform",
        access: "Autonomer Zugang",
        installation: "IT-Installation",
      },
      backHome: "Startseite",
    },
    mission: {
      title: "Unsere",
      titleHighlight: "Mission",
      subtitle:
        "Wildcamping in wirtschaftliche Chancen für Freiburger Gemeinden verwandeln",
      quotes: [
        "Eine Brücke zwischen nachhaltigem Tourismus und territorialer Entwicklung schaffen",
        "Jede Übernachtung in eine Chance für Territorien verwandeln",
        "Regionen aufwerten und gleichzeitig die Umwelt respektieren",
      ],
    },
    timeline: {
      regionalSupport: {
        title: "Regionale Unterstützung",
        intro1:
          "Organisierte Campingplätze zur Förderung weniger touristischer Regionen.",
        intro2:
          "Lokale Handwerker profitieren durch das Partnerschaftssystem von Touristen",
        localCommerce: {
          title: "Lokaler Handel",
          description:
            "Bäckereien, Lebensmittelgeschäfte profitieren vom Verkehr",
        },
        regionalDiscovery: {
          title: "Regionale Entdeckung",
          description: "Dörfer abseits der Haupttouristenrouten",
        },
        circularEconomy: {
          title: "Kreislaufwirtschaft",
          description: "Direkte wirtschaftliche Vorteile für die Region",
        },
        desktopIntro1:
          "Wildcamping fördert Besuche in weniger touristischen Regionen. Durch die Schaffung von SelfCamp-Bereichen organisieren wir diese Übernachtungen und präsentieren Dörfer abseits der Hauptrouten.",
        desktopIntro2:
          "Lokale Handwerker profitieren durch das Partnerschaftssystem von Touristen",
      },
      services: {
        title: "Unsere Dienstleistungen",
        intro: "Über unsere",
        introHighlight: "Registrierungslösung hinaus",
        introContinuation:
          "begleiten wir Sie bei der optimalen Organisation Ihres Bereichs.",
        listTitle: "Unsere Dienstleistungen umfassen:",
        items: [
          "Zonen- und Stellplatzbegrenzung",
          "Beschilderung Installation",
          "Registrierungssystem-Einrichtung (Totem und QR-Code)",
          "Entsorgungslösung (vor Ort oder in Partnercampingplätzen)",
          "Website-Promotion",
          "Social-Media-Promotion",
        ],
        highlight: {
          title: "Komplette Schlüsselfertige Lösung",
          description:
            "Vom Design bis zur Promotion kümmern wir uns um alle Aspekte Ihres Wohnmobilstellplatzes, um seinen Erfolg zu garantieren.",
        },
      },
      providerBenefits: {
        title: "Anbietervorteile",
        regulatory: {
          title: "Regulatorische Konformität",
          items: [
            "Rechtsstruktur zum Verbot von Wildcamping",
            "Einhaltung der Meldepflichten",
            "Vollständige Rückverfolgbarkeit für Audits",
            "DSGVO-Konformität und Datenschutz",
          ],
        },
        revenue: {
          title: "Garantierte Einnahmen",
          items: [
            "Automatisierte Steuererhebung ohne Verlust",
            "Erhöhte Steuereinnahmen",
          ],
        },
        partnership: {
          title: "All-in-One-Partnerschaft",
          items: [
            "Infrastrukturverbesserungen",
            "Servicenetzwerk über Partnercampingplätze",
            "Kostenpflichtige Parkoption",
          ],
        },
        data: {
          title: "Strategische Daten",
          items: [
            "Besucherzahlen, Fluss und Saisonalität",
            "Besucherprofiling und geografische Herkunft",
            "Identifizierung ungenutzter Bereiche",
            "Vorhersage von Besucherspitzen",
          ],
        },
        highlight: {
          title: "Werten Sie Ihr Gebiet auf",
          description:
            "Konkrete Werkzeuge zur Verwaltung, Monetarisierung und Entwicklung Ihrer touristischen Attraktivität.",
        },
      },
    },
    finalCta: {
      title: "Wir stehen für weitere Details zur Verfügung",
      description:
        "Entdecken Sie, wie Selfcamp Ihnen helfen kann, konforme und autonome Wohnmobilstellplätze zu schaffen.",
      contactButton: "Kontaktieren Sie uns",
      mapButton: "Bestehende Bereiche ansehen",
    },
    footer: {
      description: "Parkplatzzugang für Vanlife in der Schweiz.",
      contact: {
        title: "Kontakt",
        location: "Kontaktieren Sie uns",
      },
      navigation: {
        title: "Navigation",
        home: "Startseite",
        map: "Bereichskarte",
        about: "Über Selfcamp",
        contact: "Kontaktieren Sie uns",
        selfkeySystem: "SelfKey-System",
      },
      legal: {
        title: "Rechtliche Informationen",
        terms: "Impressum",
        termsConditions: "AGB & Widerrufsrecht",
        privacy: "Datenschutz",
      },
      copyright: "© 2025 Selfcamp. Alle Rechte vorbehalten. Entwickelt von",
      developedBy: "Webbing.ch",
      payments:
        "Sichere Zahlungen durch Stripe • Kreditkarten und TWINT akzeptiert",
    },

    contactPage: {
      availability: "24/7 - RUND UM DIE UHR",
      contactButton: "KONTAKTIEREN SIE UNS",
      contactShort: "KONTAKT",
      backHome: "Startseite",
      badge: "Lassen Sie uns über Ihr Projekt sprechen",
      title: "Kontaktieren Sie",
      titleBrand: "SelfCamp",
      subtitle:
        "Haben Sie eine Frage? Benötigen Sie Informationen? Wir hören Ihnen zu",
      directContactTitle: "Kontaktieren Sie uns direkt",
      email: "E-Mail",
      phone: "Telefon",
      location: "Standort",
      formTitle: "Oder schreiben Sie uns",
      formSubtitle:
        "Beschreiben Sie Ihr Projekt, wir melden uns schnell zurück",
      nameLabel: "Vor- und Nachname *",
      namePlaceholder: "Max Mustermann",
      emailLabel: "E-Mail *",
      emailPlaceholder: "max.mustermann@websud.ch",
      companyLabel: "Gemeinde / Parkplatz / Standort *",
      companyPlaceholder: "Name",
      projectLabel: "Ihr Projekt",
      projectPlaceholder:
        "Beschreiben Sie Ihre Situation: aktuelles Wildcamping, Ziele, Einschränkungen...",
      sendButton: "Nachricht senden",
      sending: "Wird gesendet...",
      successMessage:
        "Nachricht erfolgreich gesendet! Wir werden uns in Kürze bei Ihnen melden.",
      errorMessage: "Ein Fehler ist aufgetreten",
      connectionError: "Verbindungsfehler. Bitte versuchen Sie es erneut.",
    },
  },
};
