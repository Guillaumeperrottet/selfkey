import { Metadata } from "next";
import { DomainRouter } from "@/components/domain-router";
import { SelfcampHomepage } from "@/components/selfcamp-homepage";
import { SelfkeyHomepage } from "@/components/selfkey-homepage";

export const metadata: Metadata = {
  title: "SelfKey - Check-in automatique 24h/24 pour votre établissement",
  description:
    "Automatisez vos check-ins avec SelfKey ! Solution suisse pour hôtels, campings, parkings, locations. QR code, paiement Stripe sécurisé, accès instantané. Aucun abonnement.",
  keywords: [
    "check-in automatique",
    "QR code hotel",
    "paiement automatique camping",
    "location saisonnière automation",
    "Stripe Connect Suisse",
    "accès automatique chambre",
    "parking automatisé",
    "contrôle accès parking",
    "selfkey",
    "selfcamp",
    "camping automatisé",
  ],
  openGraph: {
    title: "SelfKey - Check-in automatique 24h/24",
    description:
      "Automatisez vos check-ins avec QR code et paiement sécurisé. Solution suisse sans abonnement pour hôtels, campings, parkings et locations.",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "SelfKey - Check-in automatique",
      },
    ],
  },
  twitter: {
    title: "SelfKey - Check-in automatique 24h/24",
    description:
      "Automatisez vos check-ins avec QR code et paiement sécurisé. Solution suisse sans abonnement pour hôtels, campings et parkings.",
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
