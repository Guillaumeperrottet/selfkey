import { Metadata } from "next";
import { SelfcampAboutPage } from "@/components/public-pages/selfcamp-about-page";

export const metadata: Metadata = {
  title: "À propos - SelfCamp | Notre Approche & Solutions",
  description:
    "Découvrez l'approche complète de SelfCamp pour créer des aires de camping-car qui bénéficient à tous : prestataires, régions et camping-caristes. Solutions clé en main pour le tourisme local.",
  keywords: [
    "selfcamp à propos",
    "aires camping-car Suisse",
    "solution tourisme local",
    "camping-car communal",
    "prestataires camping",
    "développement régional",
    "infrastructure camping-car",
    "conformité légale camping",
  ],
  openGraph: {
    title: "À propos de SelfCamp - Solutions Aires de Camping-Car",
    description:
      "Notre approche complète pour créer des aires de camping-car conformes et rentables. Partenariat gagnant-gagnant entre communes, prestataires et camping-caristes.",
    images: [
      {
        url: "/logo_map.png",
        width: 1200,
        height: 630,
        alt: "SelfCamp - À propos de nos solutions",
      },
    ],
    siteName: "SelfCamp",
    type: "website",
    locale: "fr_CH",
  },
  twitter: {
    card: "summary_large_image",
    title: "À propos de SelfCamp - Solutions Aires de Camping-Car",
    description:
      "Découvrez notre approche pour transformer les aires de camping-car en opportunités économiques structurées.",
    images: ["/logo_map.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://selfcamp.ch/about",
  },
};

export default function AboutPage() {
  return <SelfcampAboutPage />;
}
