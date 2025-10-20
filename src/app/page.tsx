import { Metadata } from "next";
import { headers } from "next/headers";
import { DomainRouter } from "@/components/shared/domain-router";
import { SelfcampHomepage } from "@/components/public-pages/selfcamp-homepage";
import { SelfkeyHomepage } from "@/components/public-pages/selfkey-homepage";

// Fonction pour générer les métadonnées dynamiquement selon le domaine
export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const host = headersList.get("host") || "";

  const isSelfcamp =
    host.includes("selfcamp.ch") || host.includes("selfcamp.vercel.app");

  if (isSelfcamp) {
    return {
      title:
        "Selfcamp - La liberté de camper, sans contraintes dans le canton de Fribourg",
      description:
        "Découvrez des aires de camping-car officielles ! Accès spontané sans app, ni compte, paiement sécurisé, emplacements de qualité.",
      keywords: [
        "camping-car Suisse",
        "aires camping-car",
        "stationnement camping-car",
        "camping spontané Suisse",
        "aires de services camping-car",
        "tourisme camping-car",
        "emplacements camping-car qualité",
        "camping sans réservation",
        "paiement camping numérique",
        "selfcamp",
        "motorhome parking Switzerland",
        "aires camping-car 24h",
        "camping-car montagne",
        "vignobles camping-car",
        "fermes camping-car",
        "tourisme local Suisse",
      ],
      openGraph: {
        title: "Selfcamp - Aires de Camping-Car en Suisse",
        description:
          "Accédez à des aires de camping-car. Spontané, sécurisé, légal. Découvrez la Suisse autrement avec des emplacements créés pour vous.",
        images: [
          {
            url: "/logo_map.png",
            width: 1200,
            height: 630,
            alt: "Selfcamp - Aires de camping-car en Suisse",
          },
        ],
        siteName: "Selfcamp",
        type: "website",
        locale: "fr_CH",
      },
      twitter: {
        card: "summary_large_image",
        title: "Selfcamp - Aires de Camping-Car en Suisse",
        description:
          "Accédez à des aires de camping-car. Spontané, sécurisé, légal. Découvrez la Suisse autrement avec des emplacements créés pour vous.",
        images: ["/logo_map.png"],
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
        canonical: "https://selfcamp.ch",
        languages: {
          "fr-CH": "https://selfcamp.ch",
          "de-CH": "https://selfcamp.ch/de",
          "en-CH": "https://selfcamp.ch/en",
        },
      },
    };
  }

  // Métadonnées pour SelfKey (domaine par défaut)
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
      "paiement en ligne",
      "Stripe",
      "accès automatique",
      "réservation",
      "Suisse",
      "selfkey",
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
      canonical: "https://selfkey.ch",
    },
  };
}

export default function Home() {
  return (
    <DomainRouter
      selfcampContent={<SelfcampHomepage />}
      selfkeyContent={<SelfkeyHomepage />}
    />
  );
}
