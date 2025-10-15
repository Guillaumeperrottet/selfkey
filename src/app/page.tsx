import { Metadata } from "next";
import { DomainRouter } from "@/components/shared/domain-router";
import { SelfcampHomepage } from "@/components/public-pages/selfcamp-homepage";
import { SelfkeyHomepage } from "@/components/public-pages/selfkey-homepage";

export const metadata: Metadata = {
  title:
    "SelfCamp - La liberté de camper, sans contraintes dans le canton de Fribourg",
  description:
    "Découvrez des aires de camping-car officielles ! Accès spontané sans réservation, paiement sécurisé, emplacements de qualité.",
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
    title: "SelfCamp - Aires de Camping-Car en Suisse",
    description:
      "Accédez à des aires de camping-car de qualité supérieure sans réservation. Spontané, sécurisé, légal. Découvrez la Suisse autrement avec des emplacements créés pour vous.",
    images: [
      {
        url: "/logo_map.png",
        width: 1200,
        height: 630,
        alt: "SelfCamp - Aires de camping-car en Suisse",
      },
    ],
    siteName: "SelfCamp",
    type: "website",
    locale: "fr_CH",
  },
  twitter: {
    card: "summary_large_image",
    title: "SelfCamp - Aires de Camping-Car en Suisse",
    description:
      "Découvrez des aires de camping-car de qualité supérieure en Suisse. Accès spontané, paiement sécurisé, emplacements.",
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

export default function Home() {
  return (
    <DomainRouter
      selfcampContent={<SelfcampHomepage />}
      selfkeyContent={<SelfkeyHomepage />}
    />
  );
}
