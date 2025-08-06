import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import ExcelJS from "exceljs";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    // Vérification de la session super-admin
    const session = request.cookies.get("super-admin-session");

    if (!session || session.value !== "authenticated") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id: userId } = await params;

    if (!userId) {
      return NextResponse.json(
        { error: "ID utilisateur requis" },
        { status: 400 }
      );
    }

    // Récupérer TOUTES les données de l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        accounts: true,
        sessions: true,
        establishments: {
          include: {
            establishment: {
              include: {
                bookings: {
                  where: {
                    paymentStatus: "succeeded",
                  },
                  include: {
                    room: true,
                  },
                },
                rooms: true,
                _count: {
                  select: {
                    bookings: true,
                  },
                },
              },
            },
          },
        },
        excelExports: {
          orderBy: {
            exportedAt: "desc",
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    // Créer un nouveau classeur Excel
    const workbook = new ExcelJS.Workbook();

    // Informations du classeur
    workbook.creator = "SelfKey Super Admin";
    workbook.created = new Date();
    workbook.title = `Export complet - ${user.name || user.email}`;

    // === FEUILLE 1: INFORMATIONS UTILISATEUR ===
    const userSheet = workbook.addWorksheet("Informations Utilisateur");

    // Headers
    userSheet.getRow(1).values = ["Propriété", "Valeur"];
    userSheet.getRow(1).font = { bold: true };

    // Données utilisateur
    const userRows = [
      ["ID", user.id],
      ["Nom", user.name || "Non renseigné"],
      ["Email", user.email],
      ["Email vérifié", user.emailVerified ? "Oui" : "Non"],
      ["Image", user.image || "Aucune"],
      ["Date de création", user.createdAt.toLocaleDateString("fr-FR")],
      ["Dernière mise à jour", user.updatedAt.toLocaleDateString("fr-FR")],
      ["Nombre d'établissements", user.establishments.length],
      ["Nombre de comptes liés", user.accounts.length],
      ["Nombre de sessions", user.sessions.length],
      ["Nombre d'exports effectués", user.excelExports.length],
    ];

    userRows.forEach((row, index) => {
      userSheet.getRow(index + 2).values = row;
    });

    userSheet.columns = [{ width: 30 }, { width: 40 }];

    // === FEUILLE 2: COMPTES ET SESSIONS ===
    const accountsSheet = workbook.addWorksheet("Comptes et Sessions");

    // Section Comptes
    accountsSheet.getRow(1).values = ["=== COMPTES D'AUTHENTIFICATION ==="];
    accountsSheet.getRow(1).font = { bold: true };

    accountsSheet.getRow(3).values = [
      "ID Compte",
      "Type",
      "Fournisseur",
      "Account ID",
      "Date de création",
      "Dernière mise à jour",
    ];
    accountsSheet.getRow(3).font = { bold: true };

    user.accounts.forEach((account, index) => {
      accountsSheet.getRow(4 + index).values = [
        account.id,
        account.type,
        account.providerId,
        account.accountId,
        account.createdAt.toLocaleDateString("fr-FR"),
        account.updatedAt.toLocaleDateString("fr-FR"),
      ];
    });

    // Section Sessions
    const sessionStartRow = 6 + user.accounts.length;
    accountsSheet.getRow(sessionStartRow).values = ["=== SESSIONS ACTIVES ==="];
    accountsSheet.getRow(sessionStartRow).font = { bold: true };

    accountsSheet.getRow(sessionStartRow + 2).values = [
      "ID Session",
      "Token (partiel)",
      "Expire le",
      "Adresse IP",
      "User Agent",
      "Créé le",
    ];
    accountsSheet.getRow(sessionStartRow + 2).font = { bold: true };

    user.sessions.forEach((session, index) => {
      accountsSheet.getRow(sessionStartRow + 3 + index).values = [
        session.id,
        session.token.substring(0, 20) + "...",
        session.expiresAt.toLocaleDateString("fr-FR"),
        session.ipAddress || "Non renseigné",
        session.userAgent
          ? session.userAgent.substring(0, 50) + "..."
          : "Non renseigné",
        session.createdAt.toLocaleDateString("fr-FR"),
      ];
    });

    accountsSheet.columns = [
      { width: 25 },
      { width: 15 },
      { width: 15 },
      { width: 20 },
      { width: 15 },
      { width: 15 },
    ];

    // === FEUILLE 3: ÉTABLISSEMENTS ===
    const establishmentsSheet = workbook.addWorksheet("Établissements");

    establishmentsSheet.getRow(1).values = [
      "Nom de l'établissement",
      "Slug",
      "Rôle de l'utilisateur",
      "Nombre de chambres",
      "Réservations réussies",
      "Revenus totaux (CHF)",
      "Taxe de séjour collectée (CHF)",
      "Commission activée",
      "Taux de commission (%)",
      "Stripe configuré",
    ];
    establishmentsSheet.getRow(1).font = { bold: true };

    user.establishments.forEach((userEst, index) => {
      const establishment = userEst.establishment;
      const totalRevenue = establishment.bookings.reduce(
        (sum, booking) => sum + booking.amount,
        0
      );
      const totalTax = establishment.bookings.reduce(
        (sum, booking) => sum + (booking.touristTaxTotal || 0),
        0
      );

      establishmentsSheet.getRow(index + 2).values = [
        establishment.name,
        establishment.slug,
        userEst.role,
        establishment.rooms.length,
        establishment.bookings.length,
        totalRevenue,
        totalTax,
        "Non applicable", // Commission non activée par défaut dans le schéma
        establishment.commissionRate,
        establishment.stripeOnboarded ? "Oui" : "Non",
      ];
    });

    establishmentsSheet.columns = [
      { width: 30 },
      { width: 20 },
      { width: 15 },
      { width: 15 },
      { width: 20 },
      { width: 20 },
      { width: 25 },
      { width: 18 },
      { width: 20 },
      { width: 18 },
    ];

    // === FEUILLE 4: TOUTES LES RÉSERVATIONS ===
    const bookingsSheet = workbook.addWorksheet("Toutes les Réservations");

    bookingsSheet.getRow(1).values = [
      "ID Réservation",
      "Établissement",
      "Chambre",
      "Client Email",
      "Nom du Client",
      "Prénom du Client",
      "Check-in",
      "Check-out",
      "Adultes",
      "Enfants",
      "Montant (CHF)",
      "Taxe de séjour (CHF)",
      "Commission (CHF)",
      "Montant propriétaire (CHF)",
      "Statut paiement",
      "Date de réservation",
      "Méthode de confirmation",
      "Adresse",
      "Ville",
      "Pays",
      "Téléphone",
    ];
    bookingsSheet.getRow(1).font = { bold: true };

    let bookingRowIndex = 2;
    user.establishments.forEach((userEst) => {
      userEst.establishment.bookings.forEach((booking) => {
        bookingsSheet.getRow(bookingRowIndex).values = [
          booking.id,
          userEst.establishment.name,
          booking.room?.name || "Chambre supprimée",
          booking.clientEmail,
          booking.clientLastName,
          booking.clientFirstName,
          booking.checkInDate.toLocaleDateString("fr-FR"),
          booking.checkOutDate.toLocaleDateString("fr-FR"),
          booking.adults,
          booking.children,
          booking.amount,
          booking.touristTaxTotal,
          booking.platformCommission,
          booking.ownerAmount,
          booking.paymentStatus,
          booking.bookingDate.toLocaleDateString("fr-FR"),
          booking.confirmationMethod || "Non renseigné",
          booking.clientAddress,
          booking.clientCity,
          booking.clientCountry,
          booking.clientPhone,
        ];
        bookingRowIndex++;
      });
    });

    bookingsSheet.columns = Array(21).fill({ width: 15 });

    // === FEUILLE 5: HISTORIQUE DES EXPORTS ===
    const exportsSheet = workbook.addWorksheet("Historique des Exports");

    exportsSheet.getRow(1).values = [
      "ID Export",
      "Nom du fichier",
      "Établissement",
      "Date de début",
      "Date de fin",
      "Nombre d'enregistrements",
      "Date d'export",
    ];
    exportsSheet.getRow(1).font = { bold: true };

    user.excelExports.forEach((exportItem, index) => {
      exportsSheet.getRow(index + 2).values = [
        exportItem.id,
        exportItem.fileName,
        exportItem.establishmentSlug,
        exportItem.startDate.toLocaleDateString("fr-FR"),
        exportItem.endDate.toLocaleDateString("fr-FR"),
        exportItem.recordsCount,
        exportItem.exportedAt.toLocaleDateString("fr-FR"),
      ];
    });

    exportsSheet.columns = [
      { width: 25 },
      { width: 40 },
      { width: 20 },
      { width: 15 },
      { width: 15 },
      { width: 20 },
      { width: 15 },
    ];

    // === FEUILLE 6: RÉSUMÉ STATISTIQUES ===
    const statsSheet = workbook.addWorksheet("Résumé Statistiques");

    statsSheet.getRow(1).values = ["=== RÉSUMÉ STATISTIQUES UTILISATEUR ==="];
    statsSheet.getRow(1).font = { bold: true, size: 14 };

    // Calculs globaux
    const allBookings = user.establishments.flatMap(
      (ue) => ue.establishment.bookings
    );
    const totalRevenue = allBookings.reduce(
      (sum, booking) => sum + booking.amount,
      0
    );
    const totalTax = allBookings.reduce(
      (sum, booking) => sum + (booking.touristTaxTotal || 0),
      0
    );
    const totalPersons = allBookings.reduce(
      (sum, booking) => sum + booking.adults + (booking.children || 0),
      0
    );
    const totalCommissions = allBookings.reduce(
      (sum, booking) => sum + booking.platformCommission,
      0
    );

    const statsRows = [
      ["Statistique", "Valeur"],
      ["", ""],
      ["Total des établissements gérés", user.establishments.length],
      ["Total des réservations", allBookings.length],
      ["Total des revenus générés", `${totalRevenue.toFixed(2)} CHF`],
      ["Total des taxes de séjour collectées", `${totalTax.toFixed(2)} CHF`],
      ["Total des commissions générées", `${totalCommissions.toFixed(2)} CHF`],
      ["Total des personnes hébergées", totalPersons],
      ["Total des exports effectués", user.excelExports.length],
      ["", ""],
      [
        "Moyenne par réservation",
        `${(totalRevenue / Math.max(allBookings.length, 1)).toFixed(2)} CHF`,
      ],
      [
        "Moyenne de personnes par réservation",
        (totalPersons / Math.max(allBookings.length, 1)).toFixed(1),
      ],
    ];

    statsRows.forEach((row, index) => {
      statsSheet.getRow(index + 3).values = row;
      if (index === 0) {
        statsSheet.getRow(index + 3).font = { bold: true };
      }
    });

    statsSheet.columns = [{ width: 40 }, { width: 30 }];

    // Générer le fichier Excel
    const buffer = await workbook.xlsx.writeBuffer();

    // Créer la réponse avec le fichier
    const response = new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="export-complet-utilisateur-${user.name || "utilisateur"}-${new Date().toISOString().split("T")[0]}.xlsx"`,
      },
    });

    return response;
  } catch (error) {
    console.error("Erreur lors de l'export:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'export des données" },
      { status: 500 }
    );
  }
}
