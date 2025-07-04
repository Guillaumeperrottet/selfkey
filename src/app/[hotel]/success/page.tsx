import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  Calendar,
  MapPin,
  Mail,
  Phone,
  Download,
} from "lucide-react";
import Link from "next/link";
import { AutoEmailConfirmation } from "@/components/AutoEmailConfirmation";

interface Props {
  params: Promise<{ hotel: string }>;
  searchParams: Promise<{ booking?: string }>;
}

export default async function SuccessPage({ params, searchParams }: Props) {
  const { hotel } = await params;
  const { booking: bookingId } = await searchParams;

  if (!bookingId) {
    redirect(`/${hotel}`);
  }

  // Récupérer la réservation avec tous les détails
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      room: true,
      establishment: {
        select: {
          name: true,
          slug: true,
        },
      },
    },
  });

  if (!booking || booking.hotelSlug !== hotel) {
    notFound();
  }

  // Si pas encore payé, rediriger vers le paiement
  if (!booking.stripePaymentIntentId) {
    redirect(`/${hotel}/payment?booking=${bookingId}`);
  }

  const duration = Math.ceil(
    (new Date(booking.checkOutDate).getTime() -
      new Date(booking.checkInDate).getTime()) /
      (1000 * 60 * 60 * 24)
  );

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Composant invisible pour déclencher l'envoi d'email automatique */}
      <AutoEmailConfirmation bookingId={bookingId} />

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header de succès */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Réservation confirmée !
          </h1>
          <p className="text-gray-600">
            Votre paiement a été traité avec succès. Vous recevrez une
            confirmation par email sous peu.
          </p>
        </div>

        {/* Détails de la réservation */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Détails de votre séjour
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
              <MapPin className="h-5 w-5 text-blue-600" />
              <div className="flex-1">
                <div className="font-medium text-blue-900">
                  {booking.establishment.name}
                </div>
                <div className="text-sm text-blue-700">
                  Chambre: {booking.room.name}
                </div>
              </div>
              <Badge variant="secondary">
                {duration} nuit{duration > 1 ? "s" : ""}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium text-gray-700 mb-1">
                  Arrivée
                </div>
                <div className="text-sm text-gray-900">
                  {formatDate(booking.checkInDate)}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  À partir de 15h00
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium text-gray-700 mb-1">
                  Départ
                </div>
                <div className="text-sm text-gray-900">
                  {formatDate(booking.checkOutDate)}
                </div>
                <div className="text-xs text-gray-500 mt-1">Avant 11h00</div>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total payé</span>
                <span className="text-xl font-bold text-green-600">
                  {booking.amount} {booking.currency}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informations du client */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Vos informations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-gray-500" />
                <div>
                  <div className="text-sm font-medium text-gray-700">Email</div>
                  <div className="text-sm text-gray-900">
                    {booking.clientEmail}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-gray-500" />
                <div>
                  <div className="text-sm font-medium text-gray-700">
                    Téléphone
                  </div>
                  <div className="text-sm text-gray-900">
                    {booking.clientPhone}
                  </div>
                </div>
              </div>
            </div>
            <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
              <strong>Note :</strong> Un email de confirmation avec tous les
              détails de votre réservation et les instructions d&apos;accès vous
              sera envoyé sous peu à {booking.clientEmail}
            </div>
          </CardContent>
        </Card>

        {/* Prochaines étapes */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Prochaines étapes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-medium text-blue-600">1</span>
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    Confirmation par email
                  </div>
                  <div className="text-sm text-gray-600">
                    Vous recevrez un email avec votre code d&apos;accès et les
                    instructions détaillées.
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-medium text-blue-600">2</span>
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    Jour de votre arrivée
                  </div>
                  <div className="text-sm text-gray-600">
                    Présentez-vous à partir de 15h00 avec votre pièce
                    d&apos;identité.
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-medium text-blue-600">3</span>
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    Profitez de votre séjour !
                  </div>
                  <div className="text-sm text-gray-600">
                    N&apos;hésitez pas à nous contacter si vous avez des
                    questions.
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button asChild className="flex-1">
            <Link href={`/${hotel}`}>Retour à l&apos;accueil</Link>
          </Button>
          <Button variant="outline" className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            Télécharger le reçu
          </Button>
        </div>

        {/* Note de bas de page */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Numéro de réservation :{" "}
            <span className="font-mono">
              {booking.id.slice(-8).toUpperCase()}
            </span>
          </p>
          <p className="mt-1">
            Conservez ce numéro pour toute correspondance future.
          </p>
        </div>

        {/* Envoi automatique de l'email de confirmation */}
        <AutoEmailConfirmation bookingId={booking.id} />
      </div>
    </div>
  );
}
