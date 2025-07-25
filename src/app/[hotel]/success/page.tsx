import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Calendar, MapPin, Mail, Phone } from "lucide-react";
import Link from "next/link";
import { AutoEmailConfirmation } from "@/components/AutoEmailConfirmation";

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
            Réservation confirmée ! / Booking Confirmed!
          </h1>
          <p className="text-gray-600">
            Votre paiement a été traité avec succès. Vous recevrez une
            confirmation par email sous peu.
            <br />
            <em>
              Your payment has been processed successfully. You will receive an
              email confirmation shortly.
            </em>
          </p>
        </div>

        {/* Détails de la réservation */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Détails de votre séjour / Stay Details
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
                  Place: {booking.room ? booking.room.name : "Parking jour"}
                </div>
              </div>
              <Badge variant="secondary">
                {duration} nuit{duration > 1 ? "s" : ""}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium text-gray-700 mb-1">
                  Arrivée / Check-in
                </div>
                <div className="text-sm text-gray-900">
                  {formatDate(booking.checkInDate)}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  À partir de 15h00 / From 3:00 PM
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium text-gray-700 mb-1">
                  Départ / Check-out
                </div>
                <div className="text-sm text-gray-900">
                  {formatDate(booking.checkOutDate)}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Avant 11h00 / Before 11:00 AM
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total payé / Total Paid</span>
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
              Vos informations / Your Information
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
                    Téléphone / Phone
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
              <br />
              <em>
                <strong>Note:</strong> A confirmation email with all booking
                details and access instructions will be sent shortly to{" "}
                {booking.clientEmail}
              </em>
            </div>
          </CardContent>
        </Card>

        {/* Prochaines étapes */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Prochaines étapes / Next Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-medium text-blue-600">1</span>
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    Confirmation par email / Email Confirmation
                  </div>
                  <div className="text-sm text-gray-600">
                    Vous recevrez un email avec votre code d&apos;accès et les
                    instructions détaillées.
                    <br />
                    <em>
                      You will receive an email with your access code and
                      detailed instructions.
                    </em>
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-medium text-blue-600">3</span>
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    Profitez de votre séjour ! / Enjoy Your Stay!
                  </div>
                  <div className="text-sm text-gray-600">
                    N&apos;hésitez pas à nous contacter si vous avez des
                    questions.
                    <br />
                    <em>
                      Don&apos;t hesitate to contact us if you have any
                      questions.
                    </em>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button asChild className="flex-1">
            <Link href={`/${hotel}`}>
              Retour à l&apos;accueil / Back to Home
            </Link>
          </Button>
        </div>

        {/* Note de bas de page */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Numéro de réservation / Booking Number :{" "}
            <span className="font-mono">
              {booking.id.slice(-8).toUpperCase()}
            </span>
          </p>
          <p className="mt-1">
            Conservez ce numéro pour toute correspondance future.
            <br />
            <em>Keep this number for future correspondence.</em>
          </p>
        </div>
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
  // Retry logic pour attendre que le webhook crée la réservation
  let dayParkingBooking = null;
  let attempts = 0;
  const maxAttempts = 10; // 10 tentatives maximum

  while (!dayParkingBooking && attempts < maxAttempts) {
    attempts++;

    // Récupérer la réservation parking jour via le PaymentIntent
    dayParkingBooking = await prisma.booking.findFirst({
      where: {
        stripePaymentIntentId: paymentIntent,
        bookingType: "day_parking",
      },
      include: {
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
          <Card>
            <CardContent className="p-6 text-center">
              <h1 className="text-xl font-bold text-red-600 mb-4">
                Réservation non trouvée
              </h1>
              <p className="text-gray-600 mb-4">
                Nous n&apos;avons pas pu trouver votre réservation parking jour.
              </p>
              <details className="text-left mb-4">
                <summary className="text-sm cursor-pointer text-gray-500">
                  Informations de debug
                </summary>
                <pre className="text-xs mt-2 bg-gray-100 p-2 rounded">
                  {`PaymentIntent: ${paymentIntent}
Hotel: ${hotel}
Type: day_parking`}
                </pre>
              </details>
              <Button asChild>
                <Link href={`/${hotel}`}>Retour à l&apos;accueil</Link>
              </Button>
            </CardContent>
          </Card>
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
            Numéro de transaction :{" "}
            <span className="font-mono">
              {dayParkingBooking.id.slice(-8).toUpperCase()}
            </span>
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
  // Retry logic pour attendre que le webhook crée la réservation
  let classicBooking = null;
  let attempts = 0;
  const maxAttempts = 10; // 10 tentatives maximum

  while (!classicBooking && attempts < maxAttempts) {
    attempts++;

    // Récupérer la réservation classique via le PaymentIntent
    classicBooking = await prisma.booking.findFirst({
      where: {
        stripePaymentIntentId: paymentIntent,
        bookingType: "classic_booking",
      },
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

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Paiement en cours de traitement
            </h1>
            <p className="text-gray-600 mb-6">
              Votre paiement a été accepté et est en cours de traitement. Votre
              réservation sera confirmée sous peu par email.
            </p>
            <Button asChild>
              <Link href={`/${hotel}`}>Retour à l&apos;accueil</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const duration = Math.ceil(
    (new Date(classicBooking.checkOutDate).getTime() -
      new Date(classicBooking.checkInDate).getTime()) /
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
      <AutoEmailConfirmation bookingId={classicBooking.id} />

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header de succès */}
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
            Votre paiement a été traité avec succès. Vous recevrez une
            confirmation par email sous peu.
            <br />
            <em>
              Your payment has been processed successfully. You will receive an
              email confirmation shortly.
            </em>
          </p>
        </div>

        {/* Détails de la réservation */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Détails de votre réservation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Établissement et chambre */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <MapPin className="w-5 h-5 text-gray-600" />
              <div className="flex-1">
                <div className="font-medium text-gray-900">
                  {classicBooking.establishment.name}
                </div>
                <div className="text-sm text-gray-600">
                  Chambre: {classicBooking.room?.name || "Standard"}
                </div>
              </div>
              <Badge variant="secondary">
                {duration} nuit{duration > 1 ? "s" : ""}
              </Badge>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Calendar className="w-5 h-5 text-gray-600" />
                <div>
                  <div className="text-sm font-medium text-gray-700">
                    Arrivée
                  </div>
                  <div className="text-sm text-gray-900">
                    {formatDate(classicBooking.checkInDate)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Calendar className="w-5 h-5 text-gray-600" />
                <div>
                  <div className="text-sm font-medium text-gray-700">
                    Départ
                  </div>
                  <div className="text-sm text-gray-900">
                    {formatDate(classicBooking.checkOutDate)}
                  </div>
                </div>
              </div>
            </div>

            {/* Informations client */}
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Informations client</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span>{classicBooking.clientEmail}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span>{classicBooking.clientPhone}</span>
                </div>
              </div>
            </div>

            {/* Montant payé */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-900">Total payé</span>
                <span className="text-xl font-bold text-green-600">
                  {classicBooking.amount} {classicBooking.currency}
                </span>
              </div>
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
            <span className="font-mono">
              {classicBooking.id.slice(-8).toUpperCase()}
            </span>
          </p>
          <p className="mt-1">
            Conservez ce numéro pour toute correspondance future.
          </p>
        </div>
      </div>
    </div>
  );
}
