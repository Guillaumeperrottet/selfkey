import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import {
  Clock,
  Shield,
  Zap,
  CreditCard,
  Settings,
  MapPin,
  Star,
} from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "SelfKey - Check-in automatique 24h/24 pour votre établissement",
  description:
    "Automatisez vos check-ins avec SelfKey ! Solution suisse pour hôtels, campings, locations. QR code, paiement Stripe sécurisé, accès instantané. Aucun abonnement.",
  keywords: [
    "check-in automatique",
    "QR code hotel",
    "paiement automatique camping",
    "location saisonnière automation",
    "Stripe Connect Suisse",
    "accès automatique chambre",
    "selfkey",
  ],
  openGraph: {
    title: "SelfKey - Check-in automatique 24h/24",
    description:
      "Automatisez vos check-ins avec QR code et paiement sécurisé. Solution suisse sans abonnement pour hôtels, campings et locations.",
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
      "Automatisez vos check-ins avec QR code et paiement sécurisé. Solution suisse sans abonnement.",
  },
};

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "SelfKey",
    description:
      "Solution suisse de check-in automatique 24h/24 pour hôtels, campings, et locations",
    url: "https://www.selfkey.ch",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "CHF",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        referenceQuantity: {
          "@type": "QuantitativeValue",
          value: "1",
          unitText: "réservation",
        },
      },
    },
    publisher: {
      "@type": "Organization",
      name: "SelfKey",
      logo: {
        "@type": "ImageObject",
        url: "https://www.selfkey.ch/logo.png",
      },
    },
    featureList: [
      "Check-in automatique 24h/24",
      "Paiement sécurisé Stripe",
      "QR Code integration",
      "Gestion multi-établissements",
      "Codes d'accès automatiques",
    ],
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center">
              <Image
                src="/logo.png"
                alt="SelfKey Logo"
                width={32}
                height={32}
                className="rounded-lg"
              />
            </div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              SelfKey
            </h1>
          </div>
          <nav className="hidden md:flex gap-6">
            <Link
              href="#features"
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Fonctionnalités
            </Link>
            <Link
              href="#benefits"
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Avantages
            </Link>
            <Button asChild variant="outline" size="sm">
              <Link href="/establishments">Connexion</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-6">
        <section className="py-20 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-center mb-6">
              <Badge variant="secondary" className="px-4 py-2">
                <MapPin className="w-4 h-4 mr-2" />
                Développé en Suisse
              </Badge>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Check-in automatique
              <span className="block text-gray-600 dark:text-gray-400">
                pour votre établissement
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
              Permettez à vos clients de s&apos;enregistrer automatiquement
              24h/24, avec paiement sécurisé et accès instantané.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="px-8">
                <Link href="/establishments">Commencer maintenant</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="px-8">
                <Link href="#features">Découvrir les fonctionnalités</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Une solution complète pour automatiser votre processus de check-in
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                  <Clock className="text-blue-600 dark:text-blue-400 w-6 h-6" />
                </div>
                <CardTitle className="text-xl">Check-in 24h/24</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Vos clients peuvent s&apos;enregistrer à toute heure, même
                  quand votre réception est fermée. Parfait pour les arrivées
                  tardives ou les week-ends.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
                  <Settings className="text-green-600 dark:text-green-400 w-6 h-6" />
                </div>
                <CardTitle className="text-xl">Intégration facile</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Configuration simple via QR code, tableau de bord intuitif et
                  export Excel automatique pour vos déclarations de taxes de
                  séjour.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="text-purple-600 dark:text-purple-400 w-6 h-6" />
                </div>
                <CardTitle className="text-xl">Paiement sécurisé</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Intégration Stripe Connect pour des paiements entièrement
                  sécurisés. Aucun accès accordé tant que le paiement n&apos;est
                  pas validé.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* How it Works Section */}
        <section className="py-20 bg-gray-50 dark:bg-gray-900 -mx-6 px-6">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Comment ça fonctionne ?
              </h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Un processus simple en 3 étapes pour automatiser vos check-ins
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Image du totem */}
              <div className="flex justify-center">
                <div className="relative max-w-md">
                  <Image
                    src="/totem.png"
                    alt="Totem SelfKey - Système de check-in automatique"
                    width={400}
                    height={600}
                    className="rounded-2xl shadow-2xl"
                    priority
                  />
                  <div className="absolute -top-4 -right-4 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg shadow-lg">
                    QR
                  </div>
                </div>
              </div>

              {/* Étapes d'utilisation */}
              <div className="space-y-8">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0">
                    1
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      Le client scanne le QR code
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Affiché sur votre totem, votre réception ou envoyé par
                      email. Le client accède instantanément au formulaire de
                      réservation depuis son smartphone.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0">
                    2
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      Saisie des informations et paiement
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Le client renseigne ses données personnelles et effectue
                      le paiement sécurisé via Stripe (cartes, TWINT, Apple Pay,
                      Google Pay).
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-gray-700 dark:bg-gray-300 text-white dark:text-gray-900 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0">
                    3
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      Accès automatique accordé
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Une fois le paiement validé, le client reçoit
                      immédiatement son code d&apos;accès ou ses instructions
                      pour accéder à sa chambre/emplacement.
                    </p>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <Shield className="text-gray-700 dark:text-gray-300 w-5 h-5" />
                    <span className="font-semibold text-gray-900 dark:text-white">
                      Sécurisé et automatique
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Aucune intervention de votre part nécessaire. Le système
                    fonctionne 24h/24, même pendant vos absences.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section id="benefits" className="py-20">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Pourquoi choisir SelfKey ?
              </h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Une solution pensée pour les professionnels de l&apos;hôtellerie
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <CreditCard className="text-gray-700 dark:text-gray-300 w-8 h-8" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Aucun abonnement
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Afin d&apos;éviter tout frais inutiles en cas de périodes
                  creuses, aucun abonnement n&apos;est nécessaire. Uniquement
                  une commission sur les réservations.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <MapPin className="text-gray-700 dark:text-gray-300 w-8 h-8" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Basé en Suisse
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Conformité RGPD et sécurité des données garanties
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <Zap className="text-gray-700 dark:text-gray-300 w-8 h-8" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Installation rapide
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Configurez votre système en quelques minutes seulement
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <Star className="text-gray-700 dark:text-gray-300 w-8 h-8" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Facile à utiliser
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Interface intuitive pour vous et vos clients
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Target Audience Section */}
        <section className="py-20">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Pour qui est SelfKey ?
              </h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Notre solution s&apos;adapte à tous les types
                d&apos;hébergements
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-2xl">🏨</span>
                  </div>
                  <CardTitle className="text-xl">Hôtels</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Parfait pour les hôtels de toutes tailles, particulièrement
                    ceux qui reçoivent des arrivées tardives ou fonctionnent
                    avec une réception limitée.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-2xl">🅿️</span>
                  </div>
                  <CardTitle className="text-xl">Parkings</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Parfait pour les parkings avec barrière à code, parkings
                    privés ou espaces de stationnement sécurisés nécessitant un
                    accès payant automatisé.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-2xl">🏕️</span>
                  </div>
                  <CardTitle className="text-xl">Campings</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Excellent pour les campings qui proposent des hébergements
                    insolites, mobil-homes ou chalets avec accès autonome.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-2xl">🏠</span>
                  </div>
                  <CardTitle className="text-xl">
                    Locations saisonnières
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Parfait pour les propriétaires d&apos;appartements ou
                    chalets de vacances qui veulent automatiser leurs locations
                    courte durée.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-2xl">🏨</span>
                  </div>
                  <CardTitle className="text-xl">Auberges</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Adapté aux auberges de jeunesse et hostels pour simplifier
                    l&apos;enregistrement et réduire les contraintes horaires.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-2xl">🏘️</span>
                  </div>
                  <CardTitle className="text-xl">
                    Résidences de services
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Idéal pour les résidences hôtelières, apart-hôtels et autres
                    établissements proposant des séjours de moyenne à longue
                    durée.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>

            <div className="mt-12 text-center">
              <Card className="max-w-2xl mx-auto border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl">
                    Vous n&apos;êtes pas sûr si SelfKey convient à votre
                    établissement ?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Notre solution fonctionne avec tout hébergement utilisant
                    des codes d&apos;accès, des clés ou des cartes pour
                    l&apos;accès aux places.
                  </p>
                  <Button asChild variant="outline">
                    <Link href="/establishments">Tester gratuitement</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 py-12">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center">
              <Image
                src="/logo.png"
                alt="SelfKey Logo"
                width={32}
                height={32}
                className="rounded-lg"
              />
            </div>
            <span className="text-xl font-semibold text-gray-900 dark:text-white">
              SelfKey
            </span>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Solution suisse de check-in automatique
          </p>
        </div>
      </footer>
    </div>
  );
}
