import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { KeyRound } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="container mx-auto px-6 py-8 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
            <KeyRound className="text-white w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">SelfKey</h1>
        </div>
        <nav className="hidden md:flex gap-4">
          <Button variant="ghost" asChild>
            <Link href="#features">Fonctionnalités</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="#about">À propos</Link>
          </Button>
          <Button asChild>
            <Link href="/establishments">Administration</Link>
          </Button>
        </nav>
      </header>
      <Separator className="mb-8" />

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-16">
        <Card className="max-w-3xl mx-auto text-center py-12">
          <CardHeader>
            <CardTitle className="text-5xl md:text-6xl font-bold">
              Check-in autonome
              <span className="block text-indigo-600 dark:text-indigo-400">
                24h/24
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-xl mb-8">
              La solution parfaite pour les arrivées tardives quand la réception
              est fermée. Vos clients peuvent s&apos;enregistrer et accéder à
              leur chambre à toute heure grâce à notre système de check-in
              automatisé.
            </CardDescription>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button asChild size="lg">
                <Link href="/establishments">
                  Accéder à l&apos;administration
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="#features">Découvrir les fonctionnalités</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Features Grid */}
        <div id="features" className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">🌙</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Arrivées tardives
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Plus besoin d&apos;attendre la réception ! Vos clients arrivent
              quand ils veulent, même après 22h ou le weekend.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">💳</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Paiements Stripe
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Intégration complète avec Stripe Connect pour des paiements
              sécurisés et automatisés.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">🔑</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Check-in automatique
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Scan du QR code, paiement en ligne sécurisé et réception d&apos;un
              email avec le code d&apos;accès. Aucun accès n&apos;est donné tant
              que le paiement n&apos;est pas validé.
            </p>
          </div>
        </div>

        {/* About Section */}
        <div id="about" className="mt-24 text-center">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 shadow-xl">
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Réception fermée ? Pas de problème !
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              SelfKey permet aux clients de s&apos;enregistrer automatiquement,
              même quand votre équipe n&apos;est pas présente. Après paiement
              validé, ils reçoivent un email de confirmation avec leur code
              d&apos;accès ou les instructions pour récupérer leur carte.
              Parfait pour les hôtels, chambres d&apos;hôtes et locations
              saisonnières.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 dark:bg-gray-900 mt-24 py-12">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">🔑</span>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              SelfKey
            </span>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Solution de check-in autonome pour arrivées tardives
          </p>
        </div>
      </footer>
    </div>
  );
}
