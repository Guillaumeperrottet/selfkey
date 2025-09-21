"use client";

export function StructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "SelfCamp",
    description:
      "Application de stationnement pour camping-cars en Suisse avec aires",
    url: "https://selfcamp.ch",
    applicationCategory: "TravelApplication",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "CHF",
      description:
        "Accès gratuit à l'application, paiement uniquement pour les nuitées",
    },
    provider: {
      "@type": "Organization",
      name: "SelfCamp",
      url: "https://selfcamp.ch",
      logo: "https://selfcamp.ch/logo_map.png",
      address: {
        "@type": "PostalAddress",
        addressCountry: "CH",
        addressRegion: "Fribourg",
      },
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "Customer Support",
        email: "support@selfcamp.ch",
        availableLanguage: ["French", "German", "English"],
      },
    },
    serviceArea: {
      "@type": "Country",
      name: "Switzerland",
    },
    featureList: [
      "Accès sans réservation",
      "Paiement sécurisé",
      "Aires",
      "Check-in numérique",
      "Disponible 24h/24",
    ],
  };

  const organizationData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "SelfCamp",
    url: "https://selfcamp.ch",
    logo: "https://selfcamp.ch/logo_map.png",
    description: "Plateforme d'aires de camping-car en Suisse",
    address: {
      "@type": "PostalAddress",
      addressCountry: "CH",
      addressRegion: "Fribourg",
    },
    sameAs: ["https://selfkey.ch"],
    potentialAction: {
      "@type": "SearchAction",
      target: "https://selfcamp.ch/search?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  const websiteData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "SelfCamp",
    url: "https://selfcamp.ch",
    description: "Aires de camping-car en Suisse",
    inLanguage: "fr-CH",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://selfcamp.ch/search?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationData),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteData),
        }}
      />
    </>
  );
}
