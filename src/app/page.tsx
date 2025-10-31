import { Metadata } from "next";
import { headers } from "next/headers";
import { SelfcampHomepage } from "@/components/public-pages/selfcamp-homepage";
import { SelfkeyHomepage } from "@/components/public-pages/selfkey-homepage";
import { isSelfcampDomain } from "@/lib/domain-utils";

// Fonction pour générer les métadonnées dynamiquement selon le domaine
export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const host = headersList.get("host") || "";

  const isSelfcamp = isSelfcampDomain(host);

  if (isSelfcamp) {
    return {
      title:
        "Selfcamp - La liberté de camper sans contrainte dans le canton de Fribourg",
      description:
        "Découvrez des aires de camping-car officielles ! Accès spontané sans app, ni compte, paiement sécurisé, emplacements de qualité.",
      keywords: [
        "selfcamp",
        "selfcamp suisse",
        "selfcamp.ch",
        "camping-car Suisse",
        "aires camping-car",
        "stationnement camping-car",
        "camping spontané Suisse",
        "aires de services camping-car",
        "tourisme camping-car",
        "emplacements camping-car qualité",
        "camping sans réservation",
        "paiement camping numérique",
        "motorhome parking Switzerland",
        "wohnmobil stellplatz schweiz",
        "aires camping-car 24h",
        "camping-car montagne",
        "vignobles camping-car",
        "fermes camping-car",
        "tourisme local Suisse",
        "canton de Fribourg",
      ],
      openGraph: {
        title: "Selfcamp - Aires de vanlife en Suisse",
        description:
          "Accédez à des aires de vanlife. Spontané, sécurisé, légal. Découvrez la Suisse autrement avec des emplacements créés pour vous.",
        images: [
          {
            url: "/logo_map.png",
            width: 1200,
            height: 630,
            alt: "Selfcamp - Aires de vanlife en Suisse",
          },
        ],
        siteName: "Selfcamp",
        type: "website",
        locale: "fr_CH",
        url: "https://www.selfcamp.ch",
      },
      twitter: {
        card: "summary_large_image",
        title: "Selfcamp - Aires de vanlife en Suisse",
        description:
          "Accédez à des aires de vanlife. Spontané, sécurisé, légal. Découvrez la Suisse autrement avec des emplacements créés pour vous.",
        images: ["/logo_map.png"],
        creator: "@selfcamp_ch",
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-video-preview": -1,
          "max-image-preview": "large",
          "max-snippet": -1,
        },
      },
      alternates: {
        canonical: "https://www.selfcamp.ch",
        languages: {
          "fr-CH": "https://www.selfcamp.ch",
          "de-CH": "https://www.selfcamp.ch/de",
          "en-CH": "https://www.selfcamp.ch/en",
        },
      },
    };
  }

  // Métadonnées pour SelfKey (domaine par défaut) - NOINDEX pour éviter confusion SEO avec Selfcamp
  return {
    title: "Selfkey - Check-in automatique pour votre établissement",
    description:
      "Solution suisse de check-in automatique 24h/24 pour hôtels, campings, et locations. Paiement sécurisé via Stripe, accès instantané par QR code.",
    keywords: [
      "check-in automatique",
      "hôtel",
      "camping",
      "location saisonnière",
      "QR code",
      "accès automatique",
      "réservation",
      "Suisse",
    ],
    openGraph: {
      title: "Selfkey - Check-in automatique pour votre établissement",
      description:
        "Solution suisse de check-in automatique 24h/24 pour hôtels, campings, et locations. Paiement sécurisé via Stripe.",
      images: [
        {
          url: "/logo.png",
          width: 1200,
          height: 630,
          alt: "SelfKey - Check-in automatique",
        },
      ],
      siteName: "Selfkey",
      type: "website",
      locale: "fr_CH",
    },
    twitter: {
      card: "summary_large_image",
      title: "Selfkey - Check-in automatique pour votre établissement",
      description:
        "Solution suisse de check-in automatique 24h/24 pour hôtels, campings, et locations.",
      images: ["/logo.png"],
    },
    robots: {
      index: false, // Désindexer Selfkey pour focus SEO sur Selfcamp uniquement
      follow: false,
      googleBot: {
        index: false,
        follow: false,
      },
    },
    alternates: {
      canonical: "https://selfkey.ch",
    },
  };
}

// Page principale - rendu côté serveur selon le domaine
export default async function Home() {
  const headersList = await headers();
  const host = headersList.get("host") || "";

  // Détection du domaine côté serveur pour un rendu instantané
  const isSelfcamp = isSelfcampDomain(host);

  // Rendu direct du bon contenu sans client-side routing
  if (isSelfcamp) {
    return <SelfcampHomepage />;
  }

  return <SelfkeyHomepage />;
}
