import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { QRCodeGenerator } from "@/components/QRCodeGenerator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  QrCode,
  CheckCircle,
  Info,
  Smartphone,
  MapPin,
  Eye,
  Shield,
  Lightbulb,
} from "lucide-react";
import Link from "next/link";

interface Props {
  params: Promise<{ hotel: string }>;
}

export default async function QRCodePage({ params }: Props) {
  const { hotel } = await params;

  // Récupérer l'établissement
  const establishment = await prisma.establishment.findUnique({
    where: { slug: hotel },
  });

  if (!establishment) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header moderne */}
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <QrCode className="h-8 w-8 text-primary" />
              Code QR - {establishment.name}
            </h1>
            <p className="text-muted-foreground">
              Générez et partagez votre code QR pour permettre aux clients de
              réserver directement
            </p>
          </div>
          <Link href={`/admin/${hotel}`}>
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Retour au tableau de bord
            </Button>
          </Link>
        </div>

        {/* Instructions d'utilisation */}
        <Alert className="mb-8">
          <Smartphone className="h-4 w-4" />
          <AlertDescription>
            <strong>Comment ça marche :</strong> Vos clients scannent le code QR
            avec leur téléphone pour accéder directement à la page de
            réservation de votre établissement. Aucune application spéciale
            n&apos;est requise !
          </AlertDescription>
        </Alert>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Générateur QR Code - Colonne principale */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="h-5 w-5" />
                  Générateur de Code QR
                </CardTitle>
                <CardDescription>
                  Personnalisez et téléchargez votre code QR
                </CardDescription>
              </CardHeader>
              <CardContent>
                <QRCodeGenerator
                  hotelSlug={hotel}
                  hotelName={establishment.name}
                />
              </CardContent>
            </Card>
          </div>

          {/* Informations et conseils - Colonne latérale */}
          <div className="space-y-6">
            {/* URL de destination */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  Destination
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant="secondary" className="font-mono text-sm">
                  /{hotel}
                </Badge>
                <p className="text-sm text-muted-foreground mt-2">
                  URL de votre page de réservation
                </p>
              </CardContent>
            </Card>

            {/* Bonnes pratiques */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Bonnes pratiques
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <Eye className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Visibilité</p>
                    <p className="text-xs text-muted-foreground">
                      Placez le code à hauteur des yeux
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Résistance</p>
                    <p className="text-xs text-muted-foreground">
                      Support résistant aux intempéries
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Lightbulb className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Éclairage</p>
                    <p className="text-xs text-muted-foreground">
                      Éclairage suffisant pour le scan
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Emplacements suggérés */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  Emplacements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  Hall d&apos;entrée principal
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  Réception / comptoir d&apos;accueil
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  Vitrines extérieures
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  Supports publicitaires
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
