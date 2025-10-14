import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, MapPin } from "lucide-react";
import Link from "next/link";
import { AutoEmailConfirmation } from "@/components/admin/email/AutoEmailConfirmation";
import { ConfirmationDetails } from "@/components/confirmation/ConfirmationDetails";

interface Props {
  params: Promise<{ hotel: string }>;
  searchParams: Promise<{
    booking?: string;
    paymentIntent?: string;
    type?: string;
  }>;
}

export default async function SuccessPage({ params, searchParams }: Props) {
  const { hotel } = await params;
  const { booking: bookingId, paymentIntent, type } = await searchParams;

  // Cas du parking jour
  if (type === "day_parking" && paymentIntent) {
    return (
      <DayParkingSuccessPage hotel={hotel} paymentIntent={paymentIntent} />
    );
  }

  // Cas des réservations classiques payment-first
  if (type === "classic_booking" && paymentIntent) {
    return (
      <ClassicBookingSuccessPage hotel={hotel} paymentIntent={paymentIntent} />
    );
  }

  // Cas des réservations normales
  if (!bookingId) {
    redirect(`/${hotel}`);
  }

  // Récupérer la réservation avec tous les détails
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: {
      id: true,
      bookingNumber: true,
      stripePaymentIntentId: true,
      hotelSlug: true,
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Composant invisible pour déclencher l'envoi d'email automatique */}
      <AutoEmailConfirmation bookingId={bookingId} />

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header de succès simplifié */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Réservation confirmée ! / Booking Confirmed!
          </h1>
          <p className="text-gray-600">
            Vous avez reçu un email de confirmation
            <br />
            <em className="text-sm">You have received a confirmation email</em>
          </p>
        </div>

        {/* Détails complets de la confirmation (identique à l'email) */}
        <ConfirmationDetails bookingId={bookingId} />
      </div>
    </div>
  );
}

// Composant pour la page de succès du parking jour
async function DayParkingSuccessPage({
  hotel,
  paymentIntent,
}: {
  hotel: string;
  paymentIntent: string;
}) {
  // Récupérer les informations de l'établissement pour le téléphone
  const establishment = await prisma.establishment.findUnique({
    where: { slug: hotel },
    select: {
      name: true,
      hotelContactPhone: true,
    },
  });

  // Retry logic pour attendre que le webhook crée la réservation
  let dayParkingBooking = null;
  let attempts = 0;
  const maxAttempts = 5; // 5 tentatives maximum (5 secondes)

  while (!dayParkingBooking && attempts < maxAttempts) {
    attempts++;

    // Récupérer la réservation parking jour via le PaymentIntent
    dayParkingBooking = await prisma.booking.findFirst({
      where: {
        stripePaymentIntentId: paymentIntent,
        bookingType: "day_parking",
      },
      select: {
        id: true,
        bookingNumber: true,
        clientFirstName: true,
        clientLastName: true,
        clientVehicleNumber: true,
        dayParkingDuration: true,
        dayParkingStartTime: true,
        dayParkingEndTime: true,
        amount: true,
        establishment: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    });

    // Si pas trouvée et qu'on n'a pas atteint le maximum, attendre 1 seconde
    if (!dayParkingBooking && attempts < maxAttempts) {
      console.log(
        `🔄 Tentative ${attempts}/${maxAttempts} - Attente de la création de la réservation par webhook...`
      );
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  if (!dayParkingBooking) {
    console.error("❌ Réservation parking jour non trouvée:", {
      paymentIntent,
      hotel,
      attempts,
    });

    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <div className="w-8 h-8 text-red-600 text-2xl">⚠️</div>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Problème système temporaire
            </h1>
            <p className="text-gray-600 mb-6">
              Votre paiement a été accepté, mais nous rencontrons un problème
              technique temporaire.
              <br />
              <br />
              <strong>Que faire ?</strong>
            </p>

            <div className="space-y-4 mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-2">
                  🔄 Option 1 : Réessayer
                </h3>
                <p className="text-sm text-blue-700 mb-3">
                  Retournez au formulaire et tentez une nouvelle réservation
                </p>
                <Button asChild className="w-full">
                  <Link href={`/${hotel}`}>Faire une nouvelle réservation</Link>
                </Button>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 mb-2">
                  📞 Option 2 : Contacter l&apos;établissement
                </h3>
                <p className="text-sm text-green-700 mb-2">
                  Pour une assistance immédiate, contactez directement
                  l&apos;établissement avec votre numéro de paiement :
                </p>
                <code className="bg-green-100 px-2 py-1 rounded text-xs block mb-3">
                  {paymentIntent}
                </code>
                <p className="text-sm font-medium text-green-800">
                  📞 Téléphone de l&apos;établissement :{" "}
                  {establishment?.hotelContactPhone ||
                    "Contactez l'établissement"}
                </p>
              </div>
            </div>

            <Button asChild variant="outline">
              <Link href={`/${hotel}`}>Retour à l&apos;accueil</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header de succès */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Paiement confirmé !
          </h1>
          <p className="text-gray-600">
            Votre parking a été réservé avec succès. Vous recevrez une
            confirmation par email avec tous les détails.
            <br />
            <span className="inline-block mt-2 text-sm font-medium text-amber-700 bg-amber-50 px-3 py-1 rounded-full">
              ⚠️ Pensez à vérifier vos spams / Don&apos;t forget to check your
              spam folder
            </span>
          </p>
        </div>

        {/* Détails de la réservation */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Détails de votre parking jour
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Établissement</p>
                <p className="font-semibold">
                  {dayParkingBooking.establishment.name}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Client</p>
                <p className="font-semibold">
                  {dayParkingBooking.clientFirstName}{" "}
                  {dayParkingBooking.clientLastName}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Véhicule</p>
                <p className="font-semibold">
                  {dayParkingBooking.clientVehicleNumber}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Durée</p>
                <p className="font-semibold">
                  {dayParkingBooking.dayParkingDuration}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Période</p>
                <p className="font-semibold">
                  {dayParkingBooking.dayParkingStartTime
                    ? new Date(
                        dayParkingBooking.dayParkingStartTime
                      ).toLocaleString("fr-CH")
                    : "Non définie"}
                  <br />
                  au{" "}
                  {dayParkingBooking.dayParkingEndTime
                    ? new Date(
                        dayParkingBooking.dayParkingEndTime
                      ).toLocaleString("fr-CH")
                    : "Non définie"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Montant payé</p>
                <p className="font-semibold text-green-600">
                  {dayParkingBooking.amount} CHF
                </p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
              <h3 className="font-semibold text-green-800 mb-2">
                ✅ Réservation confirmée
              </h3>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button asChild className="flex-1">
            <Link href={`/${hotel}`}>Retour à l&apos;accueil</Link>
          </Button>
        </div>

        {/* Note de bas de page */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Numéro de réservation :{" "}
            <span className="font-mono">{dayParkingBooking.bookingNumber}</span>
          </p>
          <p className="mt-1">
            Conservez ce numéro pour toute correspondance future.
          </p>
        </div>
      </div>
    </div>
  );
}

// Composant pour la page de succès des réservations classiques payment-first
async function ClassicBookingSuccessPage({
  hotel,
  paymentIntent,
}: {
  hotel: string;
  paymentIntent: string;
}) {
  // Récupérer les informations de l'établissement pour le téléphone
  const establishment = await prisma.establishment.findUnique({
    where: { slug: hotel },
    select: {
      name: true,
      hotelContactPhone: true,
    },
  });

  // Retry logic pour attendre que le webhook crée la réservation
  let classicBooking = null;
  let attempts = 0;
  const maxAttempts = 5; // 5 tentatives maximum (5 secondes)

  while (!classicBooking && attempts < maxAttempts) {
    attempts++;

    // Récupérer la réservation classique via le PaymentIntent
    classicBooking = await prisma.booking.findFirst({
      where: {
        stripePaymentIntentId: paymentIntent,
        bookingType: "classic_booking",
      },
      select: {
        id: true,
        bookingNumber: true,
        checkInDate: true,
        checkOutDate: true,
        clientEmail: true,
        clientPhone: true,
        amount: true,
        currency: true,
        room: true,
        establishment: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    });

    // Si pas trouvée et qu'on n'a pas atteint le maximum, attendre 1 seconde
    if (!classicBooking && attempts < maxAttempts) {
      console.log(
        `🔄 Tentative ${attempts}/${maxAttempts} - Attente de la création de la réservation classique par webhook...`
      );
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  if (!classicBooking) {
    console.error("❌ Réservation classique non trouvée:", {
      paymentIntent,
      hotel,
      attempts,
    });

    // Après 5 tentatives, c'est probablement une erreur système
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <div className="w-8 h-8 text-red-600 text-2xl">⚠️</div>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Problème système temporaire
            </h1>
            <p className="text-gray-600 mb-6">
              Votre paiement a été accepté, mais nous rencontrons un problème
              technique temporaire.
              <br />
              <br />
              <strong>Que faire ?</strong>
            </p>

            <div className="space-y-4 mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-2">
                  🔄 Option 1 : Réessayer
                </h3>
                <p className="text-sm text-blue-700 mb-3">
                  Retournez au formulaire et tentez une nouvelle réservation
                </p>
                <Button asChild className="w-full">
                  <Link href={`/${hotel}`}>Faire une nouvelle réservation</Link>
                </Button>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 mb-2">
                  📞 Option 2 : Contacter l&apos;établissement
                </h3>
                <p className="text-sm text-green-700 mb-2">
                  Pour une assistance immédiate, contactez directement
                  l&apos;établissement avec votre numéro de paiement :
                </p>
                <code className="bg-green-100 px-2 py-1 rounded text-xs block mb-3">
                  {paymentIntent}
                </code>
                <p className="text-sm font-medium text-green-800">
                  📞 Téléphone de l&apos;établissement :{" "}
                  {establishment?.hotelContactPhone ||
                    "Contactez l'établissement"}
                </p>
              </div>
            </div>

            <Button asChild variant="outline">
              <Link href={`/${hotel}`}>Retour à l&apos;accueil</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Composant invisible pour déclencher l'envoi d'email automatique */}
      <AutoEmailConfirmation bookingId={classicBooking.id} />

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header de succès simplifié */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Réservation confirmée ! / Booking Confirmed!
          </h1>
          <p className="text-gray-600">
            Vous avez reçu un email de confirmation
            <br />
            <em className="text-sm">You have received a confirmation email</em>
          </p>
        </div>

        {/* Détails complets de la confirmation (identique à l'email) */}
        <ConfirmationDetails bookingId={classicBooking.id} />
      </div>
    </div>
  );
}
