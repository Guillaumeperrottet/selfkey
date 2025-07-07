import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  HelpCircle,
  ArrowLeft,
  Calendar,
  Settings,
  Bed,
  BarChart3,
  Star,
} from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Aide SelfKey - Guide d'utilisation et support",
  description:
    "Guide complet d'utilisation de SelfKey : configuration, gestion des places, réservations, analyses. Support technique et questions fréquentes.",
  openGraph: {
    title: "Aide SelfKey - Guide d'utilisation",
    description:
      "Guide complet pour utiliser SelfKey : configuration, gestion des places, réservations et analyses.",
  },
};

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <HelpCircle className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Aide SelfKey</h1>
                <p className="text-sm text-muted-foreground">
                  Guide d&apos;utilisation et questions fréquentes
                </p>
              </div>
            </div>
            <Button asChild variant="outline">
              <Link href="/establishments" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Retour
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Introduction */}
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold">Comment utiliser SelfKey ?</h2>
            <p className="text-lg text-muted-foreground">
              SelfKey simplifie la gestion de vos réservations et offre une
              expérience fluide à vos clients.
            </p>
          </div>

          {/* Guide rapide */}
          <Card>
            <CardHeader>
              <CardTitle>Guide interactif</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Lors de votre première connexion, un guide interactif vous
                  accompagne pour découvrir les fonctionnalités principales.
                </p>
                <div className="flex gap-4">
                  <Badge variant="outline" className="flex items-center gap-2">
                    <HelpCircle className="h-3 w-3" />
                    Guide automatique
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-2">
                    <Star className="h-3 w-3" />
                    Disponible sur toutes les pages
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fonctionnalités */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configuration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Créer un établissement</li>
                  <li>• Configurer Stripe</li>
                  <li>• Ajouter des places</li>
                  <li>• Définir les prix</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bed className="h-5 w-5" />
                  Gestion des places
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Disponibilités en temps réel</li>
                  <li>• Codes d&apos;accès automatiques</li>
                  <li>• Gestion des réservations</li>
                  <li>• Suivi des occupations</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Réservations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Réservations automatiques</li>
                  <li>• Confirmations par email</li>
                  <li>• Paiements sécurisés</li>
                  <li>• Gestion des disponibilités</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Analyses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Tableau de bord</li>
                  <li>• Statistiques de performance</li>
                  <li>• Graphiques interactifs</li>
                  <li>• Rapports de revenus</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Boutons d'action */}
          <div className="flex justify-center gap-4">
            <Button asChild>
              <Link href="/establishments">Retour au tableau de bord</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="mailto:support@selfkey.com">
                Contacter le support
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
