import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  HelpCircle,
  Settings,
  Bed,
  BarChart3,
  CreditCard,
  QrCode,
  Users,
  FileText,
} from "lucide-react";
import { Metadata } from "next";
import { SelfkeyFooter } from "@/components/public-pages/selfkey-footer";

export const metadata: Metadata = {
  title: "Centre d'aide - SelfKey",
  description:
    "Guide complet d'utilisation de SelfKey : configuration, gestion des réservations, paiements Stripe, codes d'accès et support technique.",
  openGraph: {
    title: "Centre d'aide - SelfKey",
    description:
      "Guide complet pour utiliser SelfKey : configuration, gestion des réservations et analyses.",
  },
};

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link href="/">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white hover:opacity-80 transition-opacity">
                SelfKey
              </h1>
            </Link>
          </div>
          <nav className="hidden md:flex gap-2 items-center">
            <Button asChild variant="ghost" size="sm" className="font-normal">
              <Link href="/">Accueil</Link>
            </Button>
            <Button asChild variant="ghost" size="sm" className="font-normal">
              <Link href="/contact-selfkey">Contact</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/establishments">Connexion</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="max-w-5xl mx-auto space-y-12">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <HelpCircle className="h-4 w-4" />
              <span>Centre d&apos;aide</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white">
              Comment utiliser{" "}
              <span
                className="text-blue-600 dark:text-blue-400"
                style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700 }}
              >
                SelfKey
              </span>{" "}
              ?
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Découvrez toutes les fonctionnalités pour automatiser vos
              check-ins et gérer vos réservations en toute simplicité.
            </p>
          </div>

          {/* Démarrage rapide */}
          <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                Au démarrage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Suivez ces étapes pour configurer votre établissement en moins
                  de 5 minutes :
                </p>
                <ol className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                  <li className="flex items-start gap-3">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex-shrink-0">
                      1
                    </span>
                    <span>
                      <strong>Créez votre établissement</strong> - Renseignez
                      les informations de base (nom, adresse, type)
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex-shrink-0">
                      2
                    </span>
                    <span>
                      <strong>Configurez Stripe Connect</strong> - Connectez
                      votre compte pour recevoir les paiements
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex-shrink-0">
                      3
                    </span>
                    <span>
                      <strong>Ajoutez vos places</strong> - Créez vos chambres,
                      emplacements ou places de parking
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex-shrink-0">
                      4
                    </span>
                    <span>
                      <strong>Partagez votre QR code</strong> - Affichez-le pour
                      permettre les réservations 24h/24
                    </span>
                  </li>
                </ol>
              </div>
            </CardContent>
          </Card>

          {/* Fonctionnalités principales */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Fonctionnalités principales
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                      <Settings className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li>• Créer votre établissement</li>
                    <li>• Personnaliser vos paramètres</li>
                    <li>• Configurer vos emails</li>
                    <li>• Définir vos tarifs</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                      <Bed className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    Places & Disponibilités
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li>• Gérer vos emplacements</li>
                    <li>• Disponibilités en temps réel</li>
                    <li>• Codes d&apos;accès automatiques</li>
                    <li>• Calendrier d&apos;occupation</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    Paiements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li>• Paiements sécurisés Stripe</li>
                    <li>• TWINT, cartes, Apple Pay</li>
                    <li>• Versements automatiques</li>
                    <li>• Suivi des transactions</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                      <QrCode className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    QR Code
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li>• QR code unique par établissement</li>
                    <li>• Accès instantané au formulaire</li>
                    <li>• Téléchargeable et imprimable</li>
                    <li>• Check-in sans contact</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                      <Users className="h-5 w-5 text-red-600 dark:text-red-400" />
                    </div>
                    Réservations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li>• Gestion centralisée</li>
                    <li>• Confirmations automatiques</li>
                    <li>• Historique complet</li>
                    <li>• Export pour taxes de séjour</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900 rounded-lg flex items-center justify-center">
                      <BarChart3 className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                    </div>
                    Statistiques
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li>• Tableau de bord interactif</li>
                    <li>• Revenus et performances</li>
                    <li>• Taux d&apos;occupation</li>
                    <li>• Graphiques détaillés</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Questions fréquentes */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Questions fréquentes
            </h2>
            <div className="space-y-4">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">
                    Comment fonctionne le paiement ?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    SelfKey utilise Stripe Connect pour traiter les paiements de
                    manière sécurisée. Les clients paient directement lors de
                    leur réservation, et vous recevez les fonds sur votre compte
                    Stripe (moins une commission).
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">
                    Y a-t-il un abonnement ?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Non, SelfKey ne facture aucun abonnement mensuel. Par
                    défaut, des frais fixes de 3 CHF sont appliqués par
                    réservation. Ces frais sont négociables selon votre volume
                    d&apos;activité.{" "}
                    <Link
                      href="/contact-selfkey"
                      className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                    >
                      Contactez-nous
                    </Link>{" "}
                    pour discuter d&apos;une tarification adaptée à vos besoins.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">
                    Comment mes clients accèdent-ils aux lieux ?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Après paiement, vos clients reçoivent immédiatement par
                    email le code d&apos;accès ou les instructions pour accéder
                    à leur chambre/emplacement. Vous pouvez personnaliser ces
                    instructions dans les paramètres.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">
                    Puis-je gérer plusieurs établissements ?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Oui, vous pouvez créer et gérer plusieurs établissements
                    depuis un seul compte. Chaque établissement a son propre QR
                    code et ses propres paramètres.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Contact support */}
          <Card className="border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-900/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                Besoin d&apos;aide supplémentaire ?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                Notre équipe est disponible pour répondre à toutes vos questions
                et vous accompagner dans l&apos;utilisation de SelfKey.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild>
                  <Link href="/contact-selfkey">Contacter le support</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <SelfkeyFooter />
    </div>
  );
}
