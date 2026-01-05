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
    totalStripeFees: string;
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
    baseAmountHT: number;
    pricingOptionsTotal: number;
    touristTax: number;
    tva: number;
    platformCommission: number;
    ownerAmount: number;
    currency: string;
    bookingType: string;
    stripePaymentIntentId: string | null;
    paymentStatus: string;
    stripeFee: number | null;
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
  doc.setFontSize(20);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text("JUSTIFICATIF DE PAIEMENTS", 105, 18, { align: "center" });

  doc.setFontSize(10);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.text("Rapport des paiements reçus via Stripe", 105, 25, {
    align: "center",
  });

  // Informations du rapport sur une seule ligne
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  const today = format(new Date(), "dd MMMM yyyy", { locale: fr });

  let infoLine = `Date d'édition : ${today}`;
  if (options.periodLabel) {
    infoLine += ` • Période : ${options.periodLabel}`;
  }
  if (options.establishmentName) {
    infoLine += ` • Établissement : ${options.establishmentName}`;
  }

  doc.text(infoLine, 14, 33);

  let yPos = 39;

  // Section 1: Résumé global
  doc.setFontSize(12);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text("RÉSUMÉ GLOBAL", 14, yPos);

  yPos += 6;

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
        "Frais Stripe (coûts)",
        `${data.summary.totalStripeFees} ${data.summary.currency}`,
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

  // Section 2: Répartition par établissement (seulement si plusieurs établissements)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  yPos = (doc as any).lastAutoTable.finalY + 10;

  // N'afficher la répartition par établissement que s'il y a plus d'un établissement
  const showEstablishmentBreakdown = data.byEstablishment.length > 1;

  if (showEstablishmentBreakdown) {
    doc.setFontSize(12);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("RÉPARTITION PAR ÉTABLISSEMENT", 14, yPos);

    yPos += 6;

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
  }

  // Section 3: Répartition mensuelle (sur la même page si possible)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  yPos = (doc as any).lastAutoTable.finalY + 10;

  // Nouvelle page seulement si pas assez de place
  if (yPos > 230) {
    doc.addPage();
    yPos = 20;
  }

  doc.setFontSize(12);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text("RÉPARTITION MENSUELLE", 14, yPos);

  yPos += 6;

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

  // Section 4: Détail des transactions avec calculs détaillés
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  yPos = (doc as any).lastAutoTable.finalY + 10;

  if (yPos > 240) {
    doc.addPage();
    yPos = 20;
  }

  doc.setFontSize(12);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text("DÉTAIL DES TRANSACTIONS", 14, yPos);

  if (data.bookings.length > 100) {
    doc.setFontSize(8);
    doc.setTextColor(200, 0, 0);
    doc.text(
      `(Affichage limité aux 100 premières transactions sur ${data.bookings.length})`,
      14,
      yPos + 5
    );
    yPos += 10;
  } else {
    yPos += 6;
  }

  const transactionsToShow = data.bookings.slice(0, 100);

  // Calculer les totaux
  const totals = transactionsToShow.reduce(
    (acc, booking) => ({
      baseAmountHT: acc.baseAmountHT + booking.baseAmountHT,
      pricingOptionsTotal:
        acc.pricingOptionsTotal + booking.pricingOptionsTotal,
      touristTax: acc.touristTax + booking.touristTax,
      amount: acc.amount + booking.amount,
      tva: acc.tva + booking.tva,
      platformCommission: acc.platformCommission + booking.platformCommission,
    }),
    {
      baseAmountHT: 0,
      pricingOptionsTotal: 0,
      touristTax: 0,
      amount: 0,
      tva: 0,
      platformCommission: 0,
    }
  );

  autoTable(doc, {
    startY: yPos,
    head: [
      [
        "N°",
        "Date",
        "Client",
        "Base HT",
        "Options",
        "Taxe\nséjour",
        "Total TTC",
        "TVA\n3.8%",
        "Commission",
      ],
    ],
    body: transactionsToShow.map((booking) => {
      // Préparer les informations sur les options
      let optionsText = "-";
      if (
        booking.pricingOptionsTotal &&
        Math.abs(booking.pricingOptionsTotal) > 0.01
      ) {
        const sign = booking.pricingOptionsTotal >= 0 ? "+" : "";
        optionsText = `${sign}${booking.pricingOptionsTotal.toFixed(2)}`;
      }

      return [
        `#${booking.bookingNumber}`,
        format(new Date(booking.bookingDate), "dd/MM/yy", { locale: fr }),
        booking.clientName.length > 18
          ? booking.clientName.substring(0, 16) + "..."
          : booking.clientName,
        `${booking.baseAmountHT.toFixed(2)}`,
        optionsText,
        booking.touristTax > 0 ? `${booking.touristTax.toFixed(2)}` : "-",
        `${booking.amount.toFixed(2)}`,
        `${booking.tva.toFixed(2)}`,
        `${booking.platformCommission.toFixed(2)}`,
      ];
    }),
    foot: [
      [
        "",
        "",
        "TOTAUX",
        `${totals.baseAmountHT.toFixed(2)}`,
        totals.pricingOptionsTotal >= 0
          ? `+${totals.pricingOptionsTotal.toFixed(2)}`
          : `${totals.pricingOptionsTotal.toFixed(2)}`,
        `${totals.touristTax.toFixed(2)}`,
        `${totals.amount.toFixed(2)}`,
        `${totals.tva.toFixed(2)}`,
        `${totals.platformCommission.toFixed(2)}`,
      ],
    ],
    theme: "striped",
    headStyles: {
      fillColor: primaryColor,
      fontSize: 7,
      fontStyle: "bold",
      halign: "center",
      valign: "middle",
    },
    bodyStyles: {
      fontSize: 6.5,
    },
    footStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontSize: 7,
      fontStyle: "bold",
      halign: "right",
    },
    columnStyles: {
      0: { cellWidth: 15, halign: "left" },
      1: { cellWidth: 18, halign: "center" },
      2: { cellWidth: 30, halign: "left" },
      3: { halign: "right", cellWidth: 18 },
      4: { halign: "right", cellWidth: 18 },
      5: { halign: "right", cellWidth: 16 },
      6: { halign: "right", cellWidth: 20, fontStyle: "bold" },
      7: { halign: "right", cellWidth: 16 },
      8: { halign: "right", cellWidth: 20 },
    },
  });

  // Ajouter une légende explicative après le tableau
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  yPos = (doc as any).lastAutoTable.finalY + 8;

  // Vérifier si on a assez de place, sinon nouvelle page
  if (yPos > 265) {
    doc.addPage();
    yPos = 20;
  }

  doc.setFontSize(9);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.text("CALCUL DES MONTANTS :", 14, yPos);
  doc.setFontSize(7.5);
  doc.setTextColor(100, 100, 100);
  yPos += 5;
  doc.text("• Base HT = Base du séjour hors TVA (hébergement)", 14, yPos);
  yPos += 4;
  doc.text(
    "• Options = Suppléments ou réductions appliqués (parking, chien, etc.)",
    14,
    yPos
  );
  yPos += 4;
  doc.text("• Taxe séjour = Taxe collectée (TVA 0%)", 14, yPos);
  yPos += 4;
  doc.text("• Total TTC = (Base HT + Options) × 1.038 + Taxe séjour", 14, yPos);
  yPos += 4;
  doc.text("• TVA 3.8% = Calculée sur base + options uniquement", 14, yPos);
  yPos += 4;
  doc.text(
    "• Commission = Frais de plateforme prélevés sur le montant total",
    14,
    yPos
  );

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
