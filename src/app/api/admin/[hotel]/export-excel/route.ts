import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import * as XLSX from "xlsx";

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ hotel: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const { hotel: hotelSlug } = await params;

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "Les dates de début et de fin sont requises" },
        { status: 400 }
      );
    }

    // Vérifier l'authentification pour récupérer l'utilisateur
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    // Récupérer les réservations pour la période donnée
    const bookings = await prisma.booking.findMany({
      where: {
        hotelSlug,
        checkInDate: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
        // Seulement les réservations avec paiement confirmé
        paymentStatus: "succeeded",
        // Exclure les réservations de parking jour (elles ont leur propre export)
        NOT: {
          bookingType: {
            in: ["day", "day_parking"],
          },
        },
      },
      include: {
        room: true,
        establishment: true,
      },
      orderBy: {
        checkInDate: "asc",
      },
    });

    // Mapper les données au format Excel requis - Compatible avec Checkin FR
    const excelData = bookings.map((booking) => ({
      "Numéro de référence externe": booking.bookingNumber,
      "Date d'arrivée": formatDate(booking.checkInDate),
      "Date de départ": formatDate(booking.checkOutDate),
      "Exemptés adultes": 0,
      "Exemptés enfants": booking.children || 0,
      Nom: booking.clientLastName || "",
      Prénom: booking.clientFirstName || "",
      Titre: "", // Vide par défaut (M., Mme, etc.)
      "Groupe / Entreprise": "", // Nom du groupe ou entreprise si applicable
      "Date de naissance": formatDate(booking.clientBirthDate),
      Langue: "FR", // Langue par défaut
      "Adresse (Rue, Numéro)": booking.clientAddress || "",
      "Code postal": booking.clientPostalCode || "",
      "Adresse (Ville)": booking.clientCity || "",
      "Nom du pays": getCountryCode(booking.clientCountry || ""),
      "Téléphone privé": booking.clientPhone || "",
      "E-mail": booking.clientEmail || "",
      Nationalité: getCountryCode(booking.clientCountry || ""),
      "Lieu de naissance": booking.clientBirthPlace || "",
      "Nombre total d'Adultes": booking.adults || booking.guests || 0,
      "Nombre total d'enfants": booking.children || 0,
      "Type de clientèle": "Individuel", // Individuel, Groupe, Entreprise
      "Type de pièce d'identité": "Carte d'identité", // CI, Passeport, etc.
      "Numéro de la pièce d'identité": booking.clientIdNumber || "",
      "N° d'immatriculation du véhicule": booking.clientVehicleNumber || "",
      "Motif du séjour": "Loisir", // Loisir, Affaires, etc.
      "Carte d'hôte par mail": "", // Toujours null/vide
      "Carte d'hôte par sms": "1", // Toujours 1
    }));

    // Créer le workbook Excel
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Ajuster la largeur des colonnes pour correspondre au template Checkin FR
    const columnWidths = [
      { wch: 25 }, // Numéro de référence externe
      { wch: 12 }, // Date d'arrivée
      { wch: 12 }, // Date de départ
      { wch: 12 }, // Exemptés adultes
      { wch: 12 }, // Exemptés enfants
      { wch: 20 }, // Nom
      { wch: 20 }, // Prénom
      { wch: 8 }, // Titre
      { wch: 25 }, // Groupe / Entreprise
      { wch: 15 }, // Date de naissance
      { wch: 10 }, // Langue
      { wch: 35 }, // Adresse (Rue, Numéro)
      { wch: 12 }, // Code postal
      { wch: 20 }, // Adresse (Ville)
      { wch: 15 }, // Nom du pays
      { wch: 15 }, // Téléphone privé
      { wch: 30 }, // E-mail
      { wch: 15 }, // Nationalité
      { wch: 20 }, // Lieu de naissance
      { wch: 15 }, // Nombre total d'Adultes
      { wch: 15 }, // Nombre total d'enfants
      { wch: 15 }, // Type de clientèle
      { wch: 20 }, // Type de pièce d'identité
      { wch: 25 }, // Numéro de la pièce d'identité
      { wch: 20 }, // N° immatriculation véhicule
      { wch: 15 }, // Motif du séjour
      { wch: 20 }, // Carte d'hôte par mail
      { wch: 20 }, // Carte d'hôte par sms
    ];
    worksheet["!cols"] = columnWidths;

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Déclaration taxes séjour"
    );

    // Générer le fichier Excel
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "buffer",
    });

    // Créer le nom du fichier avec les dates
    const fileName = `declaration_taxes_sejour_${hotelSlug}_${startDate}_${endDate}.xlsx`;

    // Enregistrer l'export dans l'historique
    await prisma.excelExportHistory.create({
      data: {
        establishmentSlug: hotelSlug,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        fileName,
        recordsCount: bookings.length,
        userId: session?.user?.id || null,
      },
    });

    // Retourner le fichier
    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error("Erreur lors de l'exportation Excel:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'exportation des données" },
      { status: 500 }
    );
  }
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("fr-CH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function getCountryCode(countryName: string): string {
  const countryMap: { [key: string]: string } = {
    Suisse: "CH",
    Switzerland: "CH",
    France: "FR",
    Allemagne: "DE",
    Germany: "DE",
    Italie: "IT",
    Italy: "IT",
    Autriche: "AT",
    Austria: "AT",
    Belgique: "BE",
    Belgium: "BE",
    Espagne: "ES",
    Spain: "ES",
    Portugal: "PT",
    "Pays-Bas": "NL",
    Netherlands: "NL",
    Luxembourg: "LU",
    "Royaume-Uni": "GB",
    "United Kingdom": "GB",
    "États-Unis": "US",
    "United States": "US",
    Canada: "CA",
  };

  return countryMap[countryName] || countryName.substring(0, 2).toUpperCase();
}
