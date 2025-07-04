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
import {
  KeyRound,
  Clock,
  Shield,
  Zap,
  CreditCard,
  Settings,
  MapPin,
  Star,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-900 dark:bg-white rounded-lg flex items-center justify-center">
              <KeyRound className="text-white dark:text-gray-900 w-5 h-5" />
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
              <Link href="/establishments">Administration</Link>
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
              24h/24, avec paiement sécurisé et accès instantané. Aucun
              abonnement, seulement une petite commission.
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
                  S&apos;intègre parfaitement avec vos systèmes existants.
                  Configuration simple via QR code et tableau de bord intuitif.
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

        {/* Benefits Section */}
        <section
          id="benefits"
          className="py-20 bg-gray-50 dark:bg-gray-900 -mx-6 px-6"
        >
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
                  Seulement une petite commission sur les réservations réussies
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

        {/* How it works */}
        <section className="py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Comment ça marche ?
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Un processus simple en 3 étapes
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-900 dark:bg-white rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white dark:text-gray-900 text-xl font-bold">
                  1
                </span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Scan du QR code
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Le client scanne le QR code affiché dans votre établissement
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gray-900 dark:bg-white rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white dark:text-gray-900 text-xl font-bold">
                  2
                </span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Paiement sécurisé
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Paiement en ligne via Stripe avec toutes les protections
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gray-900 dark:bg-white rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white dark:text-gray-900 text-xl font-bold">
                  3
                </span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Accès instantané
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Réception automatique du code d&apos;accès par email
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 text-center">
          <Card className="max-w-3xl mx-auto border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl md:text-3xl">
                Prêt à automatiser votre check-in ?
              </CardTitle>
              <CardDescription className="text-lg">
                Rejoignez les établissements qui ont déjà adopté SelfKey
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild size="lg" className="px-8">
                <Link href="/establishments">Commencer maintenant</Link>
              </Button>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                Aucun engagement • Configuration en 5 minutes
              </p>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 py-12">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-gray-900 dark:bg-white rounded-lg flex items-center justify-center">
              <KeyRound className="text-white dark:text-gray-900 w-5 h-5" />
            </div>
            <span className="text-xl font-semibold text-gray-900 dark:text-white">
              SelfKey
            </span>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Solution suisse de check-in automatique pour l&apos;hôtellerie
          </p>
        </div>
      </footer>
    </div>
  );
}
