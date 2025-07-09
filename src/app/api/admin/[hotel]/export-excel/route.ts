import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
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

    // Récupérer les réservations pour la période donnée
    const bookings = await prisma.booking.findMany({
      where: {
        hotelSlug,
        checkInDate: {
          gte: new Date(startDate),
          lte: new Date(endDate),
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

    // Mapper les données au format Excel requis
    const excelData = bookings.map((booking, index) => ({
      "Numéro de formulaire": `${booking.hotelSlug}-${String(index + 1).padStart(4, "0")}`,
      "Date d'arrivée": formatDate(booking.checkInDate),
      "Date de départ": formatDate(booking.checkOutDate),
      "Exemples adultes": booking.adults || booking.guests, // Utilise adults ou guests en fallback
      "Exemples enfants": booking.children || 0,
      Nom: booking.clientLastName,
      Prénom: booking.clientFirstName,
      Titre: "", // À remplir si vous avez cette information
      "Groupes / Exemptions": "", // À adapter selon vos besoins
      "Date de naissance": formatDate(booking.clientBirthDate),
      "Lieu de naissance": booking.clientBirthPlace || "",
      Langue: "FR", // À adapter selon vos besoins
      "Adresse (Rue, Numéro)": booking.clientAddress,
      "Numéro de pièce d'identité": booking.clientIdNumber,
      "Adresse (Ville)": booking.clientCity,
      Pays: booking.clientCountry,
      "Téléphone privé": booking.clientPhone,
      "E-mail": booking.clientEmail,
      Nationalité: booking.clientCountry, // Même valeur que pays
      "Lieu de résidence": `${booking.clientCity}, ${booking.clientCountry}`,
      "Nombre total d'Adultes": booking.adults || booking.guests,
      "Nombre total d'enfants": booking.children || 0,
      "Type de pièce d'identité": "Carte d'identité", // À adapter
      "Type de clientèle": "Individuel", // À adapter
      "Numéro de la pièce d'identité": booking.clientIdNumber,
      "N° d'immatriculation véhicule": booking.clientVehicleNumber || "",
      "Moyen de communication": "E-mail", // À adapter
      "Motif du séjour": "Loisir", // À adapter
    }));

    // Créer le workbook Excel
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Ajuster la largeur des colonnes
    const columnWidths = [
      { wch: 20 }, // Numéro de formulaire
      { wch: 15 }, // Date d'arrivée
      { wch: 15 }, // Date de départ
      { wch: 10 }, // Exemples adultes
      { wch: 10 }, // Exemples enfants
      { wch: 20 }, // Nom
      { wch: 20 }, // Prénom
      { wch: 10 }, // Titre
      { wch: 20 }, // Groupes
      { wch: 15 }, // Date de naissance
      { wch: 20 }, // Lieu de naissance
      { wch: 10 }, // Langue
      { wch: 30 }, // Adresse
      { wch: 20 }, // Numéro pièce
      { wch: 20 }, // Ville
      { wch: 10 }, // Pays
      { wch: 15 }, // Téléphone
      { wch: 25 }, // E-mail
      { wch: 15 }, // Nationalité
      { wch: 25 }, // Lieu de résidence
      { wch: 10 }, // Nb adultes
      { wch: 10 }, // Nb enfants
      { wch: 15 }, // Type de pièce
      { wch: 15 }, // Type de clientèle
      { wch: 20 }, // Numéro pièce (bis)
      { wch: 20 }, // N° immat véhicule
      { wch: 15 }, // Moyen communication
      { wch: 15 }, // Motif séjour
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
