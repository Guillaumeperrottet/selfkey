import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface PaymentReportData {
  summary: {
    totalBookings: number;
    totalAmount: string;
    totalCommission: string;
    totalOwnerAmount: string;
    totalTouristTax: string;
    currency: string;
  };
  byEstablishment: Array<{
    name: string;
    slug: string;
    totalAmount: number;
    totalCommission: number;
    totalOwnerAmount: number;
    bookingCount: number;
    billingInfo: {
      companyName: string | null;
      address: string | null;
      city: string | null;
      postalCode: string | null;
      country: string | null;
      vatNumber: string | null;
    };
  }>;
  byMonth: Array<{
    month: string;
    totalAmount: number;
    totalCommission: number;
    totalOwnerAmount: number;
    bookingCount: number;
  }>;
  bookings: Array<{
    id: string;
    bookingNumber: number;
    bookingDate: string;
    checkInDate: string;
    checkOutDate: string;
    clientName: string;
    clientEmail: string;
    establishmentName: string;
    roomName: string;
    amount: number;
    platformCommission: number;
    ownerAmount: number;
    touristTax: number;
    currency: string;
    bookingType: string;
    stripePaymentIntentId: string | null;
    paymentStatus: string;
  }>;
}

interface ExportOptions {
  periodLabel?: string;
  establishmentName?: string;
}

export function generatePaymentReportPDF(
  data: PaymentReportData,
  options: ExportOptions = {}
) {
  const doc = new jsPDF();

  // Configuration des couleurs
  const primaryColor: [number, number, number] = [59, 130, 246]; // Bleu
  const textColor: [number, number, number] = [31, 41, 55]; // Gris foncé

  // En-tête du document
  doc.setFontSize(24);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text("JUSTIFICATIF DE PAIEMENTS", 105, 20, { align: "center" });

  doc.setFontSize(12);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.text("Rapport des paiements reçus via Stripe", 105, 28, {
    align: "center",
  });

  // Informations du rapport
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  const today = format(new Date(), "dd MMMM yyyy", { locale: fr });
  doc.text(`Date d'édition : ${today}`, 14, 40);

  if (options.periodLabel) {
    doc.text(`Période : ${options.periodLabel}`, 14, 46);
  }

  if (options.establishmentName) {
    doc.text(`Établissement : ${options.establishmentName}`, 14, 52);
  }

  let yPos = options.establishmentName ? 60 : options.periodLabel ? 54 : 48;

  // Section 1: Résumé global
  doc.setFontSize(14);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text("RÉSUMÉ GLOBAL", 14, yPos);

  yPos += 8;

  // Tableau résumé
  autoTable(doc, {
    startY: yPos,
    head: [["Indicateur", "Valeur"]],
    body: [
      ["Nombre total de réservations", data.summary.totalBookings.toString()],
      [
        "Montant total encaissé",
        `${data.summary.totalAmount} ${data.summary.currency}`,
      ],
      [
        "Commission plateforme (revenus)",
        `${data.summary.totalCommission} ${data.summary.currency}`,
      ],
      [
        "Montant reversé aux propriétaires",
        `${data.summary.totalOwnerAmount} ${data.summary.currency}`,
      ],
      [
        "Taxes de séjour collectées",
        `${data.summary.totalTouristTax} ${data.summary.currency}`,
      ],
    ],
    theme: "striped",
    headStyles: {
      fillColor: primaryColor,
      fontSize: 10,
      fontStyle: "bold",
    },
    bodyStyles: {
      fontSize: 9,
    },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 100 },
      1: { halign: "right", cellWidth: 80 },
    },
  });

  // Section 2: Répartition par établissement
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  yPos = (doc as any).lastAutoTable.finalY + 15;

  doc.setFontSize(14);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text("RÉPARTITION PAR ÉTABLISSEMENT", 14, yPos);

  yPos += 8;

  autoTable(doc, {
    startY: yPos,
    head: [
      [
        "Établissement",
        "Réservations",
        "Montant total",
        "Commission",
        "Reversé",
      ],
    ],
    body: data.byEstablishment.map((est) => [
      est.name,
      est.bookingCount.toString(),
      `${est.totalAmount.toFixed(2)} CHF`,
      `${est.totalCommission.toFixed(2)} CHF`,
      `${est.totalOwnerAmount.toFixed(2)} CHF`,
    ]),
    theme: "striped",
    headStyles: {
      fillColor: primaryColor,
      fontSize: 9,
      fontStyle: "bold",
    },
    bodyStyles: {
      fontSize: 8,
    },
    columnStyles: {
      0: { cellWidth: 60 },
      1: { halign: "center", cellWidth: 30 },
      2: { halign: "right", cellWidth: 35 },
      3: { halign: "right", cellWidth: 30 },
      4: { halign: "right", cellWidth: 30 },
    },
  });

  // Nouvelle page pour les transactions détaillées
  doc.addPage();

  // Section 3: Répartition mensuelle
  yPos = 20;
  doc.setFontSize(14);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text("RÉPARTITION MENSUELLE", 14, yPos);

  yPos += 8;

  autoTable(doc, {
    startY: yPos,
    head: [["Mois", "Réservations", "Montant total", "Commission"]],
    body: data.byMonth.map((month) => [
      format(new Date(month.month + "-01"), "MMMM yyyy", { locale: fr }),
      month.bookingCount.toString(),
      `${month.totalAmount.toFixed(2)} CHF`,
      `${month.totalCommission.toFixed(2)} CHF`,
    ]),
    theme: "striped",
    headStyles: {
      fillColor: primaryColor,
      fontSize: 9,
      fontStyle: "bold",
    },
    bodyStyles: {
      fontSize: 8,
    },
    columnStyles: {
      0: { cellWidth: 60 },
      1: { halign: "center", cellWidth: 40 },
      2: { halign: "right", cellWidth: 45 },
      3: { halign: "right", cellWidth: 40 },
    },
  });

  // Section 4: Détail des transactions (limité à 50 premières)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  yPos = (doc as any).lastAutoTable.finalY + 15;

  if (yPos > 250) {
    doc.addPage();
    yPos = 20;
  }

  doc.setFontSize(14);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text("DÉTAIL DES TRANSACTIONS", 14, yPos);

  if (data.bookings.length > 50) {
    doc.setFontSize(9);
    doc.setTextColor(200, 0, 0);
    doc.text(
      `(Affichage limité aux 50 premières transactions sur ${data.bookings.length})`,
      14,
      yPos + 6
    );
    yPos += 12;
  } else {
    yPos += 8;
  }

  const transactionsToShow = data.bookings.slice(0, 50);

  autoTable(doc, {
    startY: yPos,
    head: [["N°", "Date", "Client", "Établissement", "Montant", "Commission"]],
    body: transactionsToShow.map((booking) => [
      `#${booking.bookingNumber}`,
      format(new Date(booking.bookingDate), "dd/MM/yyyy", { locale: fr }),
      booking.clientName,
      booking.establishmentName,
      `${booking.amount.toFixed(2)} ${booking.currency}`,
      `${booking.platformCommission.toFixed(2)} ${booking.currency}`,
    ]),
    theme: "striped",
    headStyles: {
      fillColor: primaryColor,
      fontSize: 8,
      fontStyle: "bold",
    },
    bodyStyles: {
      fontSize: 7,
    },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 25 },
      2: { cellWidth: 40 },
      3: { cellWidth: 40 },
      4: { halign: "right", cellWidth: 30 },
      5: { halign: "right", cellWidth: 30 },
    },
  });

  // Pied de page avec notes légales
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);

    // Ligne de séparation
    doc.setDrawColor(200, 200, 200);
    doc.line(14, 280, 196, 280);

    // Texte du pied de page
    doc.text(
      "Ce document constitue un justificatif des paiements reçus via Stripe.",
      105,
      285,
      { align: "center" }
    );
    doc.text(
      "Pour toute vérification, les identifiants Stripe (PaymentIntent ID) sont disponibles.",
      105,
      290,
      { align: "center" }
    );

    // Numéro de page
    doc.setTextColor(100, 100, 100);
    doc.text(`Page ${i} sur ${pageCount}`, 196, 285, { align: "right" });
  }

  // Sauvegarder le PDF
  const fileName = `justificatif_paiements_${format(new Date(), "yyyy-MM-dd")}.pdf`;
  doc.save(fileName);
}
