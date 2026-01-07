"use client";

import React, { useEffect, useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { InvoicePDF } from "@/components/invoice/InvoicePDF";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { calculateFees } from "@/lib/fee-calculator";
import { calculateStayDuration } from "@/lib/availability";
import {
  isEnrichedFormat,
  formatEnrichedOptionsForDisplay,
} from "@/lib/booking/pricing-options";

interface PricingOptionValue {
  id: string;
  label: string;
  priceModifier: number;
  isPerNight?: boolean;
}

interface PricingOption {
  id: string;
  name: string;
  values: PricingOptionValue[];
}

interface InvoiceDownloadProps {
  booking: {
    id: string;
    bookingNumber: number;
    bookingDate: Date;
    clientFirstName: string;
    clientLastName: string;
    clientEmail: string;
    clientPhone?: string | null;
    clientAddress?: string | null;
    clientPostalCode?: string | null;
    clientCity?: string | null;
    clientCountry?: string | null;
    amount: number;
    currency?: string;
    checkInDate: Date;
    checkOutDate: Date;
    pricingOptionsTotal: number;
    touristTaxTotal: number;
    adults?: number;
    selectedPricingOptions?: Record<string, string | string[]> | null;
    room: {
      name: string;
      price: number;
    } | null;
  };
  establishment: {
    name: string;
    slug: string;
    commissionRate: number;
    fixedFee: number;
    address?: string | null;
    city?: string | null;
    postalCode?: string | null;
    country?: string | null;
    hotelContactPhone?: string | null;
    hotelContactEmail?: string | null;
    // Informations de facturation
    billingCompanyName?: string | null;
    billingAddress?: string | null;
    billingCity?: string | null;
    billingPostalCode?: string | null;
    billingCountry?: string | null;
    vatNumber?: string | null;
  };
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  showText?: boolean;
}

export function InvoiceDownload({
  booking,
  establishment,
  variant = "outline",
  size = "sm",
  showText = true,
}: InvoiceDownloadProps) {
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [pricingOptions, setPricingOptions] = useState<PricingOption[]>([]);
  const [optionsLoaded, setOptionsLoaded] = useState(false);

  // Charger les pricing options au montage du composant
  useEffect(() => {
    const loadPricingOptions = async () => {
      try {
        const response = await fetch(
          `/api/establishments/${establishment.slug}/pricing-options`
        );
        if (response.ok) {
          const data = await response.json();
          setPricingOptions(data.pricingOptions || []);
          console.log(
            "✅ Pricing options chargées:",
            data.pricingOptions?.length
          );
        }
      } catch (error) {
        console.error("Erreur chargement pricing options:", error);
      } finally {
        setOptionsLoaded(true);
      }
    };

    loadPricingOptions();
  }, [establishment.slug]);

  // Fonction pour décoder les options sélectionnées
  const decodeSelectedOptions = (): Array<{
    name: string;
    price: number;
  }> => {
    if (!booking.selectedPricingOptions) {
      return [];
    }

    // Vérifier si c'est le nouveau format enrichi
    if (isEnrichedFormat(booking.selectedPricingOptions)) {
      // NOUVEAU FORMAT : Utiliser directement les données enrichies
      const enrichedOptions = formatEnrichedOptionsForDisplay(
        booking.selectedPricingOptions
      );
      return enrichedOptions
        .filter((opt) => opt.price !== 0)
        .map((opt) => ({
          name: `${opt.name}: ${opt.label}`,
          price: opt.price,
        }));
    }

    // ANCIEN FORMAT : Décoder avec les pricingOptions actuelles
    if (pricingOptions.length === 0) {
      return [];
    }

    const decodedOptions: Array<{ name: string; price: number }> = [];

    Object.entries(booking.selectedPricingOptions).forEach(
      ([optionId, valueId]) => {
        const option = pricingOptions.find((opt) => opt.id === optionId);
        if (!option) return;

        if (Array.isArray(valueId)) {
          // Checkbox : plusieurs valeurs
          valueId.forEach((vid) => {
            const value = option.values.find((v) => v.id === vid);
            if (value && value.priceModifier !== 0) {
              decodedOptions.push({
                name: `${option.name}: ${value.label}`,
                price: value.priceModifier,
              });
            }
          });
        } else {
          // Select/Radio : une seule valeur
          const value = option.values.find((v) => v.id === valueId);
          if (value && value.priceModifier !== 0) {
            decodedOptions.push({
              name: `${option.name}: ${value.label}`,
              price: value.priceModifier,
            });
          }
        }
      }
    );

    return decodedOptions;
  };

  const handleDownload = async () => {
    try {
      setIsGenerating(true);

      // Calculer les détails financiers
      const duration = calculateStayDuration(
        booking.checkInDate,
        booking.checkOutDate
      );
      const roomPrice = booking.room?.price || 0;
      const baseRoomCost = roomPrice * duration;
      const subtotal =
        baseRoomCost + booking.pricingOptionsTotal + booking.touristTaxTotal;

      // Calculer les frais de plateforme
      const platformFees = calculateFees(
        subtotal,
        establishment.commissionRate / 100,
        establishment.fixedFee
      );

      // Décoder les options sélectionnées
      const pricingOptionsDetails = decodeSelectedOptions();

      console.log("🔍 Debug génération facture:", {
        selectedPricingOptions: booking.selectedPricingOptions,
        pricingOptions: pricingOptions,
        pricingOptionsLoaded: pricingOptions.length,
        decodedOptions: pricingOptionsDetails,
      });

      // Préparer les données pour la facture
      const invoiceData = {
        bookingNumber: booking.bookingNumber,
        bookingDate: booking.bookingDate,
        clientFirstName: booking.clientFirstName,
        clientLastName: booking.clientLastName,
        clientEmail: booking.clientEmail,
        clientPhone: booking.clientPhone || undefined,
        clientAddress: booking.clientAddress || undefined,
        clientPostalCode: booking.clientPostalCode || undefined,
        clientCity: booking.clientCity || undefined,
        clientCountry: booking.clientCountry || undefined,
        checkInDate: booking.checkInDate,
        checkOutDate: booking.checkOutDate,
        duration,
        adults: booking.adults,
        roomName: booking.room?.name || "Service",
        roomPrice,
        baseRoomCost,
        pricingOptionsTotal: booking.pricingOptionsTotal,
        pricingOptionsDetails:
          pricingOptionsDetails.length > 0 ? pricingOptionsDetails : undefined,
        touristTaxTotal: booking.touristTaxTotal,
        subtotal,
        platformFees: {
          commission: platformFees.commission,
          fixedFee: platformFees.fixedFee,
          totalFees: platformFees.totalFees,
        },
        finalAmount: booking.amount,
        currency: booking.currency || "CHF",
        establishment: {
          name: establishment.name,
          address: establishment.address || undefined,
          city: establishment.city || undefined,
          postalCode: establishment.postalCode || undefined,
          country: establishment.country || "Suisse",
          phone: establishment.hotelContactPhone || undefined,
          email: establishment.hotelContactEmail || undefined,
          // Informations de facturation
          billingCompanyName: establishment.billingCompanyName || undefined,
          billingAddress: establishment.billingAddress || undefined,
          billingCity: establishment.billingCity || undefined,
          billingPostalCode: establishment.billingPostalCode || undefined,
          billingCountry: establishment.billingCountry || undefined,
          vatNumber: establishment.vatNumber || undefined,
        },
      };

      // Debug: Afficher les données de l'établissement
      console.log("Données établissement pour PDF:", {
        phone: establishment.hotelContactPhone,
        email: establishment.hotelContactEmail,
        establishment: establishment,
        finalData: invoiceData.establishment,
      });

      // Générer le PDF
      const pdfDoc = pdf(<InvoicePDF data={invoiceData} />);
      const pdfBlob = await pdfDoc.toBlob();

      // Créer un lien de téléchargement
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `facture-${booking.bookingNumber}-${booking.clientLastName.toLowerCase()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erreur génération facture:", error);
      alert("Erreur lors de la génération de la facture");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleDownload}
      disabled={isGenerating || !optionsLoaded}
      className="flex items-center gap-2"
    >
      {isGenerating ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : !optionsLoaded ? (
        <>
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          {showText && <span>Chargement...</span>}
        </>
      ) : (
        <FileText className="h-4 w-4" />
      )}
      {showText && (isGenerating ? "Génération..." : "Télécharger facture")}
    </Button>
  );
}
