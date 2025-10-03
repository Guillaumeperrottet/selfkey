"use client";

import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { formatCHF } from "@/lib/fee-calculator";

// Interface pour les données de facture
interface InvoiceData {
  bookingNumber: number;
  bookingDate: Date;
  clientFirstName: string;
  clientLastName: string;
  clientEmail: string;
  clientPhone?: string;
  clientAddress?: string;
  clientPostalCode?: string;
  clientCity?: string;
  clientCountry?: string;
  checkInDate: Date;
  checkOutDate: Date;
  duration: number;
  roomName: string;
  roomPrice: number;
  baseRoomCost: number;
  pricingOptionsTotal: number;
  touristTaxTotal: number;
  subtotal: number;
  platformFees?: {
    commission: number;
    fixedFee: number;
    totalFees: number;
  };
  finalAmount: number;
  currency: string;
  establishment: {
    name: string;
    address?: string;
    city?: string;
    postalCode?: string;
    country?: string;
    phone?: string;
    email?: string;
  };
}

// Styles pour le PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 30,
    fontSize: 10,
    fontFamily: "Helvetica",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 30,
    borderBottom: "2 solid #e5e5e5",
    paddingBottom: 15,
  },
  logo: {
    width: 80,
    height: 40,
  },
  companyInfo: {
    textAlign: "right",
    fontSize: 9,
    color: "#666666",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2563eb",
    marginBottom: 20,
    textAlign: "center",
  },
  invoiceInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 25,
  },
  infoSection: {
    flex: 1,
    marginRight: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 8,
    borderBottom: "1 solid #e5e5e5",
    paddingBottom: 3,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 3,
  },
  label: {
    width: 80,
    fontSize: 9,
    color: "#6b7280",
  },
  value: {
    flex: 1,
    fontSize: 9,
    color: "#111827",
  },
  table: {
    marginTop: 20,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    padding: 8,
    fontSize: 9,
    fontWeight: "bold",
    color: "#374151",
  },
  tableRow: {
    flexDirection: "row",
    padding: 8,
    borderBottom: "1 solid #e5e5e5",
    fontSize: 9,
  },
  tableCell: {
    flex: 1,
  },
  tableCellRight: {
    flex: 1,
    textAlign: "right",
  },
  summary: {
    marginTop: 20,
    alignSelf: "flex-end",
    width: 200,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
    fontSize: 9,
  },
  summaryTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    padding: 8,
    backgroundColor: "#f3f4f6",
    fontSize: 11,
    fontWeight: "bold",
    color: "#111827",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: "center",
    fontSize: 8,
    color: "#6b7280",
    borderTop: "1 solid #e5e5e5",
    paddingTop: 10,
  },
});

interface InvoicePDFProps {
  data: InvoiceData;
}

export function InvoicePDF({ data }: InvoicePDFProps) {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text
              style={{ fontSize: 16, fontWeight: "bold", color: "#111827" }}
            >
              {data.establishment.name}
            </Text>
            {data.establishment.address && (
              <Text style={styles.companyInfo}>
                {data.establishment.address}
              </Text>
            )}
            {(data.establishment.postalCode || data.establishment.city) && (
              <Text style={styles.companyInfo}>
                {data.establishment.postalCode} {data.establishment.city}
              </Text>
            )}
            {data.establishment.country && (
              <Text style={styles.companyInfo}>
                {data.establishment.country}
              </Text>
            )}
          </View>
          <View style={styles.companyInfo}>
            {data.establishment.phone && (
              <Text>Tél: {data.establishment.phone}</Text>
            )}
            {data.establishment.email && (
              <Text>Email: {data.establishment.email}</Text>
            )}
            <Text style={{ marginTop: 5 }}>Date: {formatDate(new Date())}</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>FACTURE</Text>

        {/* Invoice and Client Info */}
        <View style={styles.invoiceInfo}>
          {/* Invoice Details */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Détails de la facture</Text>
            <View style={styles.infoRow}>
              <Text style={styles.label}>N° facture:</Text>
              <Text style={styles.value}>INV-{data.bookingNumber}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>N° réservation:</Text>
              <Text style={styles.value}>{data.bookingNumber}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Date réservation:</Text>
              <Text style={styles.value}>{formatDate(data.bookingDate)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Période:</Text>
              <Text style={styles.value}>
                {formatDate(data.checkInDate)} - {formatDate(data.checkOutDate)}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Durée:</Text>
              <Text style={styles.value}>
                {data.duration} nuit{data.duration > 1 ? "s" : ""}
              </Text>
            </View>
          </View>

          {/* Client Info */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Informations client</Text>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Nom:</Text>
              <Text style={styles.value}>
                {data.clientFirstName} {data.clientLastName}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Email:</Text>
              <Text style={styles.value}>{data.clientEmail}</Text>
            </View>
            {data.clientPhone && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>Téléphone:</Text>
                <Text style={styles.value}>{data.clientPhone}</Text>
              </View>
            )}
            {data.clientAddress && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>Adresse:</Text>
                <Text style={styles.value}>{data.clientAddress}</Text>
              </View>
            )}
            {(data.clientPostalCode || data.clientCity) && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>Ville:</Text>
                <Text style={styles.value}>
                  {data.clientPostalCode} {data.clientCity}
                </Text>
              </View>
            )}
            {data.clientCountry && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>Pays:</Text>
                <Text style={styles.value}>{data.clientCountry}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Services Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCell, { flex: 3 }]}>Description</Text>
            <Text style={styles.tableCell}>Quantité</Text>
            <Text style={styles.tableCellRight}>Prix unitaire</Text>
            <Text style={styles.tableCellRight}>Total</Text>
          </View>

          {/* Room */}
          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, { flex: 3 }]}>
              Hébergement - {data.roomName}
            </Text>
            <Text style={styles.tableCell}>{data.duration}</Text>
            <Text style={styles.tableCellRight}>
              {formatCHF(data.roomPrice)}
            </Text>
            <Text style={styles.tableCellRight}>
              {formatCHF(data.baseRoomCost)}
            </Text>
          </View>

          {/* Pricing Options */}
          {data.pricingOptionsTotal > 0 && (
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 3 }]}>
                Options supplémentaires
              </Text>
              <Text style={styles.tableCell}>1</Text>
              <Text style={styles.tableCellRight}>
                {formatCHF(data.pricingOptionsTotal)}
              </Text>
              <Text style={styles.tableCellRight}>
                {formatCHF(data.pricingOptionsTotal)}
              </Text>
            </View>
          )}

          {/* Tourist Tax */}
          {data.touristTaxTotal > 0 && (
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 3 }]}>
                Taxe de séjour
              </Text>
              <Text style={styles.tableCell}>1</Text>
              <Text style={styles.tableCellRight}>
                {formatCHF(data.touristTaxTotal)}
              </Text>
              <Text style={styles.tableCellRight}>
                {formatCHF(data.touristTaxTotal)}
              </Text>
            </View>
          )}

          {/* Platform Fees */}
          {data.platformFees && (
            <>
              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 3 }]}>
                  Frais de service - Commission
                </Text>
                <Text style={styles.tableCell}>1</Text>
                <Text style={styles.tableCellRight}>
                  {formatCHF(data.platformFees.commission)}
                </Text>
                <Text style={styles.tableCellRight}>
                  {formatCHF(data.platformFees.commission)}
                </Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 3 }]}>
                  Frais de service - Frais fixes
                </Text>
                <Text style={styles.tableCell}>1</Text>
                <Text style={styles.tableCellRight}>
                  {formatCHF(data.platformFees.fixedFee)}
                </Text>
                <Text style={styles.tableCellRight}>
                  {formatCHF(data.platformFees.fixedFee)}
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Summary */}
        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text>Sous-total:</Text>
            <Text>{formatCHF(data.subtotal)}</Text>
          </View>
          {data.platformFees && (
            <View style={styles.summaryRow}>
              <Text>Frais de service:</Text>
              <Text>{formatCHF(data.platformFees.totalFees)}</Text>
            </View>
          )}
          <View style={styles.summaryTotal}>
            <Text>TOTAL À PAYER:</Text>
            <Text>
              {formatCHF(data.finalAmount)} {data.currency}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={{ fontSize: 8, color: "#6b7280", marginTop: 5 }}>
              (TVA 8.1% {formatCHF((data.finalAmount * 8.1) / 100)}{" "}
              {data.currency} incluse)
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            Facture générée automatiquement le {formatDate(new Date())} - Merci
            de votre confiance !
          </Text>
          <Text style={{ marginTop: 3 }}>
            Pour toute question concernant cette facture, contactez-nous :
          </Text>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              gap: 20,
              marginTop: 3,
            }}
          >
            {data.establishment.email && (
              <Text>📧 {data.establishment.email}</Text>
            )}
            {data.establishment.phone && (
              <Text>📞 {data.establishment.phone}</Text>
            )}
          </View>
        </View>
      </Page>
    </Document>
  );
}
