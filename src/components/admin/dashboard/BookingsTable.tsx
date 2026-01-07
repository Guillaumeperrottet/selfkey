"use client";

import { useState, useMemo, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePrint } from "@/hooks/use-print";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  ArrowUpDown,
  Users,
  Calendar,
  MapPin,
  Phone,
  Mail,
  User,
  FileText,
  Clock,
  Printer,
  Calculator,
} from "lucide-react";
import { calculateStayDuration } from "@/lib/availability";
import { formatCHF, calculateFees } from "@/lib/fee-calculator";
import { InvoiceDownload } from "@/components/invoice/InvoiceDownload";
import {
  isEnrichedFormat,
  getFlatEnrichedOptions,
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
  type: "select" | "radio" | "checkbox";
  values: PricingOptionValue[];
}

interface Booking {
  id: string;
  bookingNumber: number;
  clientFirstName: string;
  clientLastName: string;
  clientEmail: string;
  clientPhone?: string;
  clientBirthDate?: Date;
  clientBirthPlace?: string;
  clientAddress?: string;
  clientPostalCode?: string;
  clientCity?: string;
  clientCountry?: string;
  clientIdNumber?: string;
  clientIdType?: string;
  clientVehicleNumber?: string;
  amount: number;
  guests: number;
  checkInDate: Date;
  checkOutDate: Date;
  bookingDate: Date;
  currency?: string;
  selectedPricingOptions?: Record<string, string | string[]>;
  pricingOptionsTotal?: number;
  stripePaymentIntentId?: string | null;
  paymentStatus?: string;
  confirmationSent?: boolean;
  confirmationSentAt?: Date | null;
  confirmationMethod?: string | null;
  touristTaxTotal?: number;
  adults?: number;
  children?: number;
  hasDog?: boolean;
  bookingLocale?: string;
  internalNote?: string | null;
  room: {
    name: string;
    price?: number;
  } | null;
  establishment?: {
    name: string;
    slug?: string;
    commissionRate?: number;
    fixedFee?: number;
  };
}

interface BookingsTableProps {
  bookings: Booking[];
  establishment?: {
    name: string;
    slug: string;
    commissionRate: number;
    fixedFee: number;
    hotelContactEmail?: string | null;
    hotelContactPhone?: string | null;
    address?: string | null;
    city?: string | null;
    postalCode?: string | null;
    country?: string | null;
    // Informations de facturation
    billingCompanyName?: string | null;
    billingAddress?: string | null;
    billingCity?: string | null;
    billingPostalCode?: string | null;
    billingCountry?: string | null;
    vatNumber?: string | null;
  };
}

type SortField =
  | "name"
  | "email"
  | "room"
  | "checkIn"
  | "checkOut"
  | "amount"
  | "bookingDate";
type SortDirection = "asc" | "desc";

export function BookingsTable({ bookings, establishment }: BookingsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("bookingDate");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [pricingOptions, setPricingOptions] = useState<PricingOption[]>([]);
  const [editingInternalNote, setEditingInternalNote] = useState(false);
  const [internalNoteValue, setInternalNoteValue] = useState("");
  const [isSavingNote, setIsSavingNote] = useState(false);
  const { printTable, print } = usePrint();

  // Charger les pricing options pour pouvoir décoder les noms
  useEffect(() => {
    const loadPricingOptions = async () => {
      if (!establishment?.slug) return;

      try {
        const response = await fetch(
          `/api/establishments/${establishment.slug}/pricing-options`
        );
        if (response.ok) {
          const data = await response.json();
          setPricingOptions(data.pricingOptions || []);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des pricing options:", error);
      }
    };

    loadPricingOptions();
  }, [establishment?.slug]);

  // Fonction pour décoder le nom d'une option à partir de son ID
  const getOptionDisplayName = (
    selectedOptions: Record<string, string | string[]>
  ): string[] => {
    if (!selectedOptions || Object.keys(selectedOptions).length === 0) {
      return [];
    }

    // Vérifier si c'est le nouveau format enrichi
    if (isEnrichedFormat(selectedOptions)) {
      const enrichedOptions = getFlatEnrichedOptions(selectedOptions);
      return enrichedOptions.map(
        (opt) => `${opt.optionName}: ${opt.valueLabel}`
      );
    }

    // ANCIEN FORMAT : Décoder avec les options actuelles
    const optionNames: string[] = [];

    Object.entries(selectedOptions).forEach(([optionId, valueId]) => {
      const option = pricingOptions.find((opt) => opt.id === optionId);
      if (!option) return;

      if (Array.isArray(valueId)) {
        valueId.forEach((vid) => {
          const value = option.values.find((v) => v.id === vid);
          if (value) {
            optionNames.push(`${option.name}: ${value.label}`);
          }
        });
      } else {
        const value = option.values.find((v) => v.id === valueId);
        if (value) {
          optionNames.push(`${option.name}: ${value.label}`);
        }
      }
    });

    return optionNames;
  };

  const getBookingStatus = (booking: Booking) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkOut = new Date(booking.checkOutDate);
    checkOut.setHours(0, 0, 0, 0); // Normaliser la date de départ
    const checkIn = new Date(booking.checkInDate);
    checkIn.setHours(0, 0, 0, 0); // Normaliser la date d'arrivée

    if (checkIn.getTime() === today.getTime()) {
      return {
        status: "checkin",
        label: "Arrivée aujourd'hui",
        color: "bg-blue-100 text-blue-800",
      };
    } else if (
      checkIn.getTime() < today.getTime() &&
      checkOut.getTime() > today.getTime()
    ) {
      return {
        status: "current",
        label: "En cours",
        color: "bg-red-100 text-red-800",
      };
    } else if (checkIn.getTime() > today.getTime()) {
      return {
        status: "future",
        label: "À venir",
        color: "bg-gray-100 text-gray-800",
      };
    } else {
      return {
        status: "past",
        label: "Terminé",
        color: "bg-gray-100 text-gray-600",
      };
    }
  };

  const filteredAndSortedBookings = useMemo(() => {
    const filtered = bookings.filter((booking) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        `${booking.clientFirstName} ${booking.clientLastName}`
          .toLowerCase()
          .includes(searchLower) ||
        booking.clientEmail.toLowerCase().includes(searchLower) ||
        (booking.room
          ? booking.room.name.toLowerCase().includes(searchLower)
          : false);

      if (statusFilter === "all") return matchesSearch;

      const status = getBookingStatus(booking).status;
      return matchesSearch && status === statusFilter;
    });

    // Tri
    filtered.sort((a, b) => {
      let aValue: string | number | Date;
      let bValue: string | number | Date;

      switch (sortField) {
        case "name":
          aValue = `${a.clientFirstName} ${a.clientLastName}`;
          bValue = `${b.clientFirstName} ${b.clientLastName}`;
          break;
        case "email":
          aValue = a.clientEmail;
          bValue = b.clientEmail;
          break;
        case "room":
          aValue = a.room ? a.room.name : "Parking jour";
          bValue = b.room ? b.room.name : "Parking jour";
          break;
        case "checkIn":
          aValue = new Date(a.checkInDate);
          bValue = new Date(b.checkInDate);
          break;
        case "checkOut":
          aValue = new Date(a.checkOutDate);
          bValue = new Date(b.checkOutDate);
          break;
        case "amount":
          aValue = a.amount;
          bValue = b.amount;
          break;
        case "bookingDate":
          aValue = new Date(a.bookingDate);
          bValue = new Date(b.bookingDate);
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [bookings, searchTerm, sortField, sortDirection, statusFilter]);

  const handleSaveInternalNote = async () => {
    if (!selectedBooking) return;

    setIsSavingNote(true);
    try {
      const response = await fetch(`/api/bookings/${selectedBooking.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          internalNote:
            internalNoteValue.trim() === "" ? null : internalNoteValue.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la sauvegarde de la note");
      }

      // Mettre à jour le booking local
      setSelectedBooking({
        ...selectedBooking,
        internalNote:
          internalNoteValue.trim() === "" ? null : internalNoteValue.trim(),
      });

      setEditingInternalNote(false);
      toast.success("Note interne enregistrée !");

      // Recharger la page pour mettre à jour la liste
      window.location.reload();
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Impossible d'enregistrer la note");
    } finally {
      setIsSavingNote(false);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleRowClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setInternalNoteValue(booking.internalNote || "");
    setEditingInternalNote(false);
    setShowDetails(true);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleString("fr-FR");
  };

  // Fonction pour calculer les détails de facturation d'une réservation
  const calculateBookingFinancials = (booking: Booking) => {
    const duration = calculateStayDuration(
      booking.checkInDate,
      booking.checkOutDate
    );
    const roomPrice = booking.room?.price || 0;
    const baseRoomCost = roomPrice * duration;
    const pricingOptionsTotal = booking.pricingOptionsTotal || 0;
    const touristTaxTotal = booking.touristTaxTotal || 0;

    // Montant avant frais de plateforme
    const subtotal = baseRoomCost + pricingOptionsTotal + touristTaxTotal;

    // Calcul des frais de plateforme si on a les infos de l'établissement
    let platformFees = null;
    if (establishment) {
      platformFees = calculateFees(
        subtotal,
        establishment.commissionRate / 100,
        establishment.fixedFee
      );
    }

    return {
      duration,
      roomPrice,
      baseRoomCost,
      pricingOptionsTotal,
      touristTaxTotal,
      subtotal,
      platformFees,
      finalAmount: booking.amount,
    };
  };

  const handlePrintBooking = (booking: Booking) => {
    const duration = calculateStayDuration(
      booking.checkInDate,
      booking.checkOutDate
    );
    const status = getBookingStatus(booking);
    const today = new Date();

    // Calculer l'âge du client si date de naissance disponible
    let clientAge = "";
    if (booking.clientBirthDate) {
      const birthDate = new Date(booking.clientBirthDate);
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        clientAge = `${age - 1} ans`;
      } else {
        clientAge = `${age} ans`;
      }
    }

    const bookingHTML = `
      <style>
        @media print {
          body { margin: 0; font-family: Arial, sans-serif; font-size: 11px; line-height: 1.3; }
          .reception-sheet { max-width: 210mm; margin: 0; padding: 12mm; }
          .hotel-header { text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 12px; margin-bottom: 15px; }
          .hotel-name { font-size: 20px; font-weight: bold; color: #1e40af; margin: 0; }
          .document-title { font-size: 15px; font-weight: bold; margin: 6px 0 3px 0; color: #374151; }
          .date-print { font-size: 10px; color: #6b7280; margin: 0; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 12px 0; }
          .info-section { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px; }
          .section-title { font-size: 12px; font-weight: bold; color: #1e40af; margin: 0 0 8px 0; padding-bottom: 3px; border-bottom: 1px solid #cbd5e1; }
          .info-row { display: flex; justify-content: space-between; margin: 4px 0; padding: 2px 0; }
          .info-label { font-weight: 500; color: #374151; flex: 1; font-size: 10px; }
          .info-value { font-weight: 600; color: #111827; flex: 1.5; text-align: right; font-size: 10px; }
          .status-paid { color: #059669; font-weight: bold; }
          .status-pending { color: #d97706; font-weight: bold; }
          .status-current { background: #dcfce7; color: #166534; padding: 1px 6px; border-radius: 3px; font-size: 9px; }
          .status-future { background: #dbeafe; color: #1d4ed8; padding: 1px 6px; border-radius: 3px; font-size: 9px; }
          .status-past { background: #f3f4f6; color: #374151; padding: 1px 6px; border-radius: 3px; font-size: 9px; }
          .full-width { grid-column: 1 / -1; }
          .important-info { background: #fee2e2; border: 1px solid #fca5a5; border-radius: 6px; padding: 10px; margin: 12px 0; }
          .footer-info { border-top: 1px solid #e2e8f0; padding-top: 10px; margin-top: 15px; text-align: center; font-size: 9px; color: #6b7280; }
        }
      </style>
      
      <div class="reception-sheet">
        <!-- En-tête hôtel -->
        <div class="hotel-header">
          <h1 class="hotel-name">${establishment?.name || "Établissement"}</h1>
          <p class="document-title">FICHE RÉCEPTION - RÉSERVATION</p>
          <p class="date-print">Imprimé le ${today.toLocaleDateString("fr-FR", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}</p>
        </div>

        <!-- Informations principales -->
        <div class="info-grid">
          <!-- Séjour -->
          <div class="info-section">
            <h3 class="section-title">📅 INFORMATIONS SÉJOUR</h3>
            <div class="info-row">
              <span class="info-label">N° Réservation :</span>
              <span class="info-value" style="font-size: 14px; font-weight: bold;">#${booking.bookingNumber}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Chambre/Place :</span>
              <span class="info-value">${booking.room ? booking.room.name : "Parking jour"}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Arrivée :</span>
              <span class="info-value">${formatDate(booking.checkInDate)}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Départ :</span>
              <span class="info-value">${formatDate(booking.checkOutDate)}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Durée :</span>
              <span class="info-value">${duration} nuit${duration > 1 ? "s" : ""}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Invités :</span>
              <span class="info-value">${booking.guests} pers.</span>
            </div>
            <div class="info-row">
              <span class="info-label">Statut :</span>
              <span class="info-value status-${status.color.includes("green") ? "current" : status.color.includes("blue") ? "future" : "past"}">${status.label}</span>
            </div>
          </div>

          <!-- Client -->
          <div class="info-section">
            <h3 class="section-title">👤 INFORMATIONS CLIENT</h3>
            <div class="info-row">
              <span class="info-label">Nom complet :</span>
              <span class="info-value">${booking.clientFirstName} ${booking.clientLastName}</span>
            </div>
            ${
              clientAge
                ? `
            <div class="info-row">
              <span class="info-label">Âge :</span>
              <span class="info-value">${clientAge}</span>
            </div>
            `
                : ""
            }
            ${
              booking.clientBirthDate
                ? `
            <div class="info-row">
              <span class="info-label">Date naissance :</span>
              <span class="info-value">${new Date(booking.clientBirthDate).toLocaleDateString("fr-FR")}</span>
            </div>
            `
                : ""
            }
            ${
              booking.clientBirthPlace
                ? `
            <div class="info-row">
              <span class="info-label">Lieu naissance :</span>
              <span class="info-value">${booking.clientBirthPlace}</span>
            </div>
            `
                : ""
            }
            <div class="info-row">
              <span class="info-label">Email :</span>
              <span class="info-value" style="font-size: 10px;">${booking.clientEmail}</span>
            </div>
            ${
              booking.clientPhone
                ? `
            <div class="info-row">
              <span class="info-label">Téléphone :</span>
              <span class="info-value">${booking.clientPhone}</span>
            </div>
            `
                : ""
            }
            ${
              booking.clientIdNumber
                ? `
            <div class="info-row">
              <span class="info-label">N° ID :</span>
              <span class="info-value">${booking.clientIdNumber}</span>
            </div>
            `
                : ""
            }
            ${
              booking.clientVehicleNumber
                ? `
            <div class="info-row">
              <span class="info-label">Plaque véhicule :</span>
              <span class="info-value">${booking.clientVehicleNumber}</span>
            </div>
            `
                : ""
            }
          </div>
        </div>

        <!-- Adresse complète si disponible -->
        ${
          booking.clientAddress || booking.clientCity || booking.clientCountry
            ? `
        <div class="info-section full-width">
          <h3 class="section-title">📍 ADRESSE CLIENT</h3>
          <div style="padding: 5px 0; font-size: 10px;">
            ${booking.clientAddress ? `<div style="margin: 2px 0;"><strong>Rue :</strong> ${booking.clientAddress}</div>` : ""}
            ${booking.clientPostalCode || booking.clientCity ? `<div style="margin: 2px 0;"><strong>Ville :</strong> ${booking.clientPostalCode || ""} ${booking.clientCity || ""}</div>` : ""}
            ${booking.clientCountry ? `<div style="margin: 2px 0;"><strong>Pays :</strong> ${booking.clientCountry}</div>` : ""}
          </div>
        </div>
        `
            : ""
        }

        <!-- Détail de la facturation -->
        <div class="info-section full-width">
          <h3 class="section-title">💰 DÉTAIL DE LA FACTURATION</h3>
          <div style="background: white; border: 1px solid #e2e8f0; border-radius: 4px; padding: 8px;">
            <!-- Info adultes/enfants -->
            ${
              booking.adults !== undefined || booking.children !== undefined
                ? `
            <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 3px; padding: 6px; margin-bottom: 8px; font-size: 10px;">
              <strong style="color: #0369a1;">👥 Composition du groupe :</strong>
              ${booking.adults !== undefined ? `<span style="margin-left: 8px;">Adultes (16+) : <strong>${booking.adults}</strong></span>` : ""}
              ${booking.children !== undefined ? `<span style="margin-left: 10px;">Enfants : <strong>${booking.children}</strong></span>` : ""}
              ${booking.guests ? `<span style="margin-left: 10px;">Total invités : <strong>${booking.guests}</strong></span>` : ""}
            </div>
            `
                : ""
            }
            
            <table style="width: 100%; border-collapse: collapse; font-size: 10px;">
              <thead>
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <th style="text-align: left; padding: 4px; font-weight: bold; color: #374151;">Description</th>
                  <th style="text-align: center; padding: 4px; font-weight: bold; color: #374151;">Qté</th>
                  <th style="text-align: right; padding: 4px; font-weight: bold; color: #374151;">Prix unit.</th>
                  <th style="text-align: right; padding: 4px; font-weight: bold; color: #374151;">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 4px; color: #374151;">Hébergement - ${booking.room ? booking.room.name : "Service"}</td>
                  <td style="padding: 4px; text-align: center; color: #374151;">${duration}</td>
                  <td style="padding: 4px; text-align: right; color: #374151;">${booking.room?.price || 0} ${booking.currency || "CHF"}</td>
                  <td style="padding: 4px; text-align: right; font-weight: 600; color: #374151;">${((booking.room?.price || 0) * duration).toFixed(2)} ${booking.currency || "CHF"}</td>
                </tr>
                ${
                  booking.selectedPricingOptions &&
                  Object.keys(booking.selectedPricingOptions).length > 0
                    ? (() => {
                        // Vérifier si c'est le nouveau format enrichi
                        if (isEnrichedFormat(booking.selectedPricingOptions)) {
                          // NOUVEAU FORMAT : Utiliser les données enrichies
                          const enrichedOptions = getFlatEnrichedOptions(
                            booking.selectedPricingOptions
                          );

                          return enrichedOptions
                            .map(
                              (opt) => `
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 4px; color: #374151;">${opt.optionName}: ${opt.valueLabel}</td>
                  <td style="padding: 4px; text-align: center; color: #374151;">1</td>
                  <td style="padding: 4px; text-align: right; color: #374151;">${opt.priceModifier.toFixed(2)} ${booking.currency || "CHF"}</td>
                  <td style="padding: 4px; text-align: right; font-weight: 600; color: #374151;">${opt.priceModifier.toFixed(2)} ${booking.currency || "CHF"}</td>
                </tr>
                              `
                            )
                            .join("");
                        }

                        // ANCIEN FORMAT : Décoder avec les options actuelles
                        const optionNames = getOptionDisplayName(
                          booking.selectedPricingOptions
                        );

                        if (
                          optionNames.length === 0 &&
                          booking.pricingOptionsTotal &&
                          booking.pricingOptionsTotal > 0
                        ) {
                          // Fallback si les options ne sont pas encore chargées
                          return `
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 4px; color: #374151;">Options supplémentaires</td>
                  <td style="padding: 4px; text-align: center; color: #374151;">1</td>
                  <td style="padding: 4px; text-align: right; color: #374151;">${booking.pricingOptionsTotal} ${booking.currency || "CHF"}</td>
                  <td style="padding: 4px; text-align: right; font-weight: 600; color: #374151;">${booking.pricingOptionsTotal} ${booking.currency || "CHF"}</td>
                </tr>
                          `;
                        }

                        // Calculer le prix de chaque option
                        return optionNames
                          .map((optionName, index) => {
                            const entries = Object.entries(
                              booking.selectedPricingOptions || {}
                            );
                            if (index >= entries.length) return "";

                            const [optionId, valueId] = entries[index];
                            const option = pricingOptions.find(
                              (opt) => opt.id === optionId
                            );
                            if (!option) return "";

                            let price = 0;
                            if (Array.isArray(valueId)) {
                              valueId.forEach((vid) => {
                                const value = option.values.find(
                                  (v) => v.id === vid
                                );
                                if (value) {
                                  // Multiplier par duration si isPerNight=true
                                  const multiplier = value.isPerNight
                                    ? duration
                                    : 1;
                                  price += value.priceModifier * multiplier;
                                }
                              });
                            } else {
                              const value = option.values.find(
                                (v) => v.id === valueId
                              );
                              if (value) {
                                // Multiplier par duration si isPerNight=true
                                const multiplier = value.isPerNight
                                  ? duration
                                  : 1;
                                price = value.priceModifier * multiplier;
                              }
                            }

                            return `
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 4px; color: #374151;">${optionName}</td>
                  <td style="padding: 4px; text-align: center; color: #374151;">1</td>
                  <td style="padding: 4px; text-align: right; color: #374151;">${price.toFixed(2)} ${booking.currency || "CHF"}</td>
                  <td style="padding: 4px; text-align: right; font-weight: 600; color: #374151;">${price.toFixed(2)} ${booking.currency || "CHF"}</td>
                </tr>
                            `;
                          })
                          .join("");
                      })()
                    : ""
                }
                ${
                  booking.touristTaxTotal && booking.touristTaxTotal > 0
                    ? `
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 4px; color: #374151;">Taxe de séjour${booking.adults ? ` (${booking.adults} adulte${booking.adults > 1 ? "s" : ""} × ${duration} nuit${duration > 1 ? "s" : ""})` : ""}</td>
                  <td style="padding: 4px; text-align: center; color: #374151;">${booking.adults || 1}</td>
                  <td style="padding: 4px; text-align: right; color: #374151;">${booking.adults ? (booking.touristTaxTotal / (booking.adults * duration)).toFixed(2) : (booking.touristTaxTotal / duration).toFixed(2)} ${booking.currency || "CHF"}</td>
                  <td style="padding: 4px; text-align: right; font-weight: 600; color: #374151;">${booking.touristTaxTotal} ${booking.currency || "CHF"}</td>
                </tr>
                `
                    : ""
                }
              </tbody>
            </table>
            <!-- Sous-totaux -->
            <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e2e8f0; font-size: 10px;">
              <div style="display: flex; justify-content: space-between; margin: 3px 0;">
                <span style="color: #6b7280;">Sous-total :</span>
                <span style="font-weight: 600; color: #374151;">${(booking.amount - (establishment?.fixedFee || 0)).toFixed(2)} ${booking.currency || "CHF"}</span>
              </div>
              ${
                establishment?.fixedFee && establishment.fixedFee > 0
                  ? `
              <div style="display: flex; justify-content: space-between; margin: 3px 0;">
                <span style="color: #6b7280;">Frais de service :</span>
                <span style="font-weight: 600; color: #374151;">${establishment.fixedFee.toFixed(2)} ${booking.currency || "CHF"}</span>
              </div>
              `
                  : ""
              }
              <div style="display: flex; justify-content: space-between; margin: 6px 0; padding-top: 6px; border-top: 2px solid #1e40af; font-size: 13px;">
                <span style="font-weight: bold; color: #1e40af;">TOTAL À PAYER :</span>
                <span style="font-weight: bold; color: #1e40af; font-size: 14px;">${booking.amount} ${booking.currency || "CHF"}</span>
              </div>
              ${(() => {
                // Calcul de la TVA (3.8% sur le montant sans la taxe de séjour)
                const totalWithoutTouristTax =
                  booking.amount - (booking.touristTaxTotal || 0);
                const tvaRate = 0.038;
                const tvaAmount =
                  totalWithoutTouristTax -
                  totalWithoutTouristTax / (1 + tvaRate);

                return `
              <div style="display: flex; justify-content: space-between; margin: 3px 0;">
                <span style="color: #6b7280; font-size: 9px;">(TVA 3.8% ${tvaAmount.toFixed(2)} ${booking.currency || "CHF"} incluse)</span>
              </div>
              `;
              })()}
              <div style="display: flex; justify-content: space-between; margin: 3px 0;">
                <span style="color: #6b7280; font-size: 10px;">Statut paiement :</span>
                <span style="font-weight: bold; color: ${booking.stripePaymentIntentId ? "#059669" : "#d97706"}; font-size: 11px;">${booking.stripePaymentIntentId ? "✓ PAYÉ" : "⏳ EN ATTENTE"}</span>
              </div>
              ${
                booking.stripePaymentIntentId
                  ? `
              <div style="font-size: 9px; color: #6b7280; margin-top: 6px;">
                Date de paiement : ${formatDateTime(booking.bookingDate)}<br>
                ID Transaction : ${booking.stripePaymentIntentId.slice(-12)}
              </div>
              `
                  : ""
              }
            </div>
          </div>
        </div>

        ${
          !booking.stripePaymentIntentId
            ? `
        <div class="important-info">
          <h3 style="color: #dc2626; margin: 0 0 6px 0; font-weight: bold; font-size: 11px;">⚠️ ATTENTION - PAIEMENT EN ATTENTE</h3>
          <p style="margin: 3px 0; font-size: 10px;">Cette réservation n'est pas encore payée. Vérifier le statut de paiement avant la remise des clés.</p>
        </div>
        `
            : ""
        }

        ${
          booking.internalNote
            ? `
        <div class="info-section full-width" style="background: #fffbeb; border: 2px solid #f59e0b;">
          <h3 class="section-title" style="color: #92400e;">📝 NOTE INTERNE (ADMIN UNIQUEMENT)</h3>
          <div style="padding: 8px; background: white; border-radius: 3px; font-size: 10px; white-space: pre-wrap;">
            ${booking.internalNote}
          </div>
        </div>
        `
            : ""
        }

        <!-- Footer -->
        <div class="footer-info">
          <p>Document généré automatiquement • ${establishment?.name || "SelfKey"} • Système de réservation</p>
        </div>
      </div>
    `;

    print(bookingHTML, {
      title: `Réception-${booking.clientLastName}-${booking.bookingNumber}`,
    });
  };

  const handlePrintTable = () => {
    const tableData = filteredAndSortedBookings.map((booking) => {
      const status = getBookingStatus(booking);
      return {
        Nom: `${booking.clientFirstName} ${booking.clientLastName}`,
        Email: booking.clientEmail,
        Téléphone: booking.clientPhone || "-",
        Chambre: booking.room ? booking.room.name : "Parking jour",
        Arrivée: formatDate(booking.checkInDate),
        Départ: formatDate(booking.checkOutDate),
        Invités: booking.guests.toString(),
        Montant: `${booking.amount} ${booking.currency || "CHF"}`,
        Statut: status.label,
        "Réservé le": formatDateTime(booking.bookingDate),
        "Note interne": booking.internalNote || "-",
      };
    });

    const columns = [
      { key: "Nom" as const, label: "Nom" },
      { key: "Email" as const, label: "Email" },
      { key: "Téléphone" as const, label: "Téléphone" },
      { key: "Chambre" as const, label: "Chambre" },
      { key: "Arrivée" as const, label: "Arrivée" },
      { key: "Départ" as const, label: "Départ" },
      { key: "Invités" as const, label: "Invités" },
      { key: "Montant" as const, label: "Montant" },
      { key: "Statut" as const, label: "Statut" },
      { key: "Réservé le" as const, label: "Réservé le" },
      { key: "Note interne" as const, label: "Note interne" },
    ];

    const title = `Liste des réservations - ${filteredAndSortedBookings.length} réservation${filteredAndSortedBookings.length > 1 ? "s" : ""} • Généré le ${new Date().toLocaleDateString(
      "fr-FR",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    )}`;

    printTable(tableData, columns, title);
  };

  const SortableHeader = ({
    field,
    children,
  }: {
    field: SortField;
    children: React.ReactNode;
  }) => (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 p-0 hover:bg-transparent"
      onClick={() => handleSort(field)}
    >
      <span className="flex items-center gap-2">
        {children}
        <ArrowUpDown
          className={`h-3 w-3 ${
            sortField === field ? "text-primary" : "text-muted-foreground"
          }`}
        />
        {sortField === field && (
          <span className="text-xs text-primary">
            {sortDirection === "asc" ? "↑" : "↓"}
          </span>
        )}
      </span>
    </Button>
  );

  return (
    <div className="space-y-4">
      {/* Barre de recherche et filtres */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom, email ou chambre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrintTable}
              className="flex items-center gap-2 no-print"
            >
              <Printer className="h-4 w-4" />
              Imprimer
            </Button>
            <span className="text-sm text-muted-foreground">
              {filteredAndSortedBookings.length} résultat
              {filteredAndSortedBookings.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Filtres par statut */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={statusFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("all")}
          >
            Toutes
          </Button>
          <Button
            variant={statusFilter === "checkin" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("checkin")}
          >
            Arrivées aujourd&apos;hui
          </Button>
          <Button
            variant={statusFilter === "checkout" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("checkout")}
          >
            Départs aujourd&apos;hui
          </Button>
          <Button
            variant={statusFilter === "current" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("current")}
          >
            En cours
          </Button>
          <Button
            variant={statusFilter === "future" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("future")}
          >
            À venir
          </Button>
          <Button
            variant={statusFilter === "past" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("past")}
          >
            Terminées
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">
                <SortableHeader field="name">Client</SortableHeader>
              </TableHead>
              <TableHead className="w-[190px]">
                <SortableHeader field="email">Email</SortableHeader>
              </TableHead>
              <TableHead className="w-[120px]">
                <SortableHeader field="room">Chambre</SortableHeader>
              </TableHead>
              <TableHead className="w-[120px]">
                <SortableHeader field="checkIn">Arrivée</SortableHeader>
              </TableHead>
              <TableHead className="w-[120px]">
                <SortableHeader field="checkOut">Départ</SortableHeader>
              </TableHead>
              <TableHead className="w-[100px]">
                <SortableHeader field="amount">Montant</SortableHeader>
              </TableHead>
              <TableHead className="w-[80px]">
                <Users className="h-4 w-4" />
              </TableHead>
              <TableHead className="w-[120px]">
                <SortableHeader field="bookingDate">Réservé le</SortableHeader>
              </TableHead>
              <TableHead className="w-[140px]">Statut</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedBookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <Users className="h-8 w-8 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      {searchTerm || statusFilter !== "all"
                        ? "Aucune réservation trouvée pour ces critères"
                        : "Aucune réservation pour le moment"}
                    </p>
                    {searchTerm && (
                      <p className="text-sm text-muted-foreground">
                        Essayez de modifier votre recherche ou les filtres
                      </p>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedBookings.map((booking) => {
                const bookingStatus = getBookingStatus(booking);
                return (
                  <TableRow
                    key={booking.id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleRowClick(booking)}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <span>{`${booking.clientFirstName} ${booking.clientLastName}`}</span>
                        {booking.internalNote && (
                          <span
                            className="text-amber-600"
                            title="Cette réservation a une note interne"
                          >
                            📝
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-[180px] truncate">
                      {booking.clientEmail}
                    </TableCell>
                    <TableCell className="max-w-[120px] truncate">
                      {booking.room ? booking.room.name : "Parking jour"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        {new Date(booking.checkInDate).toLocaleDateString(
                          "fr-FR"
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        {new Date(booking.checkOutDate).toLocaleDateString(
                          "fr-FR"
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <span className="font-medium">{booking.amount}</span>
                        <span className="text-xs text-muted-foreground">
                          CHF
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        <span>{booking.guests}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(booking.bookingDate).toLocaleDateString(
                        "fr-FR"
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={bookingStatus.color}
                      >
                        {bookingStatus.label}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialog des détails */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="!w-[1200px] !max-w-[95vw] h-[85vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Détails de la réservation
                </DialogTitle>
                <DialogDescription>
                  Informations complètes sur la réservation de{" "}
                  {selectedBooking?.clientFirstName}{" "}
                  {selectedBooking?.clientLastName}
                </DialogDescription>
              </div>
              <div className="flex items-center gap-2">
                {/* Bouton de téléchargement de facture */}
                {selectedBooking && establishment && (
                  <InvoiceDownload
                    booking={{
                      ...selectedBooking,
                      pricingOptionsTotal:
                        selectedBooking.pricingOptionsTotal || 0,
                      touristTaxTotal: selectedBooking.touristTaxTotal || 0,
                      adults: selectedBooking.adults,
                      selectedPricingOptions:
                        selectedBooking.selectedPricingOptions || null,
                      room: selectedBooking.room
                        ? {
                            name: selectedBooking.room.name,
                            price: selectedBooking.room.price || 0,
                          }
                        : null,
                    }}
                    establishment={establishment}
                    variant="outline"
                    size="sm"
                    showText={true}
                  />
                )}
                <Button
                  variant="default"
                  size="sm"
                  onClick={() =>
                    selectedBooking && handlePrintBooking(selectedBooking)
                  }
                  className="no-print"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Fiche réception
                </Button>
              </div>
            </div>
          </DialogHeader>

          {selectedBooking && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Colonne 1: Informations du séjour + Status */}
              <div className="space-y-3">
                <div className="bg-muted/50 p-3 rounded-lg">
                  <h3 className="font-semibold mb-2 flex items-center gap-2 text-sm">
                    <Calendar className="h-3 w-3" />
                    Informations du séjour
                  </h3>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        N° réservation :
                      </span>
                      <span className="font-medium">
                        {selectedBooking.bookingNumber}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Place :</span>
                      <span className="font-medium">
                        {selectedBooking.room
                          ? selectedBooking.room.name
                          : "Parking jour"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Arrivée :</span>
                      <span className="font-medium">
                        {formatDate(selectedBooking.checkInDate)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Départ :</span>
                      <span className="font-medium">
                        {formatDate(selectedBooking.checkOutDate)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Durée :</span>
                      <span className="font-medium">
                        {calculateStayDuration(
                          selectedBooking.checkInDate,
                          selectedBooking.checkOutDate
                        )}{" "}
                        nuit
                        {calculateStayDuration(
                          selectedBooking.checkInDate,
                          selectedBooking.checkOutDate
                        ) > 1
                          ? "s"
                          : ""}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Invités :</span>
                      <span className="font-medium">
                        {selectedBooking.guests} personne
                        {selectedBooking.guests > 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Chien :</span>
                      <span className="font-medium">
                        {selectedBooking.hasDog === true ? (
                          <span className="text-orange-600">🐕 Oui</span>
                        ) : selectedBooking.hasDog === false ? (
                          <span className="text-gray-600">Non</span>
                        ) : (
                          <span className="text-gray-400">Non renseigné</span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Statut de la réservation */}
                <div className="bg-muted/50 p-3 rounded-lg">
                  <h3 className="font-semibold mb-2 flex items-center gap-2 text-sm">
                    <Clock className="h-3 w-3" />
                    Statut
                  </h3>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className={
                          getBookingStatus(selectedBooking).color + " text-xs"
                        }
                      >
                        {getBookingStatus(selectedBooking).label}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Réservée le {formatDateTime(selectedBooking.bookingDate)}
                    </div>
                    {selectedBooking.confirmationSent && (
                      <div className="text-xs text-green-600">
                        ✓ Confirmation
                        {selectedBooking.hasDog === true && (
                          <span className="font-medium"> (avec chien)</span>
                        )}
                        {selectedBooking.hasDog === false && (
                          <span className="font-medium"> (sans chien)</span>
                        )}{" "}
                        envoyée
                        {selectedBooking.confirmationSentAt &&
                          ` le ${formatDateTime(selectedBooking.confirmationSentAt)}`}
                        {selectedBooking.bookingLocale && (
                          <span className="ml-1">
                            {selectedBooking.bookingLocale === "fr" && "🇫🇷"}
                            {selectedBooking.bookingLocale === "en" && "🇬🇧"}
                            {selectedBooking.bookingLocale === "de" && "🇩🇪"}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Colonne 2: Informations client + Adresse */}
              <div className="space-y-3">
                <div className="bg-muted/50 p-3 rounded-lg">
                  <h3 className="font-semibold mb-2 flex items-center gap-2 text-sm">
                    <User className="h-3 w-3" />
                    Informations client
                  </h3>
                  <div className="space-y-1 text-xs">
                    <div>
                      <span className="text-muted-foreground block">
                        Nom complet :
                      </span>
                      <span className="font-medium">
                        {selectedBooking.clientFirstName}{" "}
                        {selectedBooking.clientLastName}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">
                        Email :
                      </span>
                      <div className="font-medium flex items-start gap-1">
                        <Mail className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        <span className="break-all text-xs">
                          {selectedBooking.clientEmail}
                        </span>
                      </div>
                    </div>
                    {selectedBooking.clientPhone && (
                      <div>
                        <span className="text-muted-foreground block">
                          Téléphone :
                        </span>
                        <div className="font-medium flex items-center gap-1">
                          <Phone className="h-3 w-3 flex-shrink-0" />
                          <span>{selectedBooking.clientPhone}</span>
                        </div>
                      </div>
                    )}
                    {selectedBooking.clientBirthDate && (
                      <div>
                        <span className="text-muted-foreground block">
                          Date de naissance :
                        </span>
                        <span className="font-medium">
                          {new Date(
                            selectedBooking.clientBirthDate
                          ).toLocaleDateString("fr-FR")}
                        </span>
                      </div>
                    )}
                    {selectedBooking.clientBirthPlace && (
                      <div>
                        <span className="text-muted-foreground block">
                          Lieu de naissance :
                        </span>
                        <span className="font-medium">
                          {selectedBooking.clientBirthPlace}
                        </span>
                      </div>
                    )}
                    {selectedBooking.clientIdNumber && (
                      <div>
                        <span className="text-muted-foreground block">
                          N° d&apos;identification :
                        </span>
                        <div className="font-medium flex items-center gap-1">
                          <FileText className="h-3 w-3 flex-shrink-0" />
                          <span className="break-all">
                            {selectedBooking.clientIdNumber}
                          </span>
                        </div>
                      </div>
                    )}
                    {selectedBooking.clientIdType && (
                      <div>
                        <span className="text-muted-foreground block">
                          Type de pièce d&apos;identité :
                        </span>
                        <span className="font-medium">
                          {selectedBooking.clientIdType}
                        </span>
                      </div>
                    )}
                    {selectedBooking.clientVehicleNumber && (
                      <div>
                        <span className="text-muted-foreground block">
                          Plaque d&apos;immatriculation :
                        </span>
                        <div className="font-medium flex items-center gap-1">
                          <FileText className="h-3 w-3 flex-shrink-0" />
                          <span className="break-all">
                            {selectedBooking.clientVehicleNumber}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Adresse */}
                {(selectedBooking.clientAddress ||
                  selectedBooking.clientCity ||
                  selectedBooking.clientCountry) && (
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <h3 className="font-semibold mb-2 flex items-center gap-2 text-sm">
                      <MapPin className="h-3 w-3" />
                      Adresse
                    </h3>
                    <div className="text-xs space-y-1">
                      {selectedBooking.clientAddress && (
                        <div className="font-medium">
                          {selectedBooking.clientAddress}
                        </div>
                      )}
                      {(selectedBooking.clientPostalCode ||
                        selectedBooking.clientCity) && (
                        <div>
                          {selectedBooking.clientPostalCode}{" "}
                          {selectedBooking.clientCity}
                        </div>
                      )}
                      {selectedBooking.clientCountry && (
                        <div>{selectedBooking.clientCountry}</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              {/* Colonne 3: Paiement + Facturation */}
              <div className="space-y-3">
                {/* Informations de paiement */}
                <div className="bg-muted/50 p-3 rounded-lg">
                  <h3 className="font-semibold mb-2 flex items-center gap-2 text-sm">
                    <span className="text-xs bg-primary/10 text-primary px-1 py-0.5 rounded">
                      CHF
                    </span>
                    Paiement
                  </h3>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Montant total :
                      </span>
                      <span className="font-semibold">
                        {selectedBooking.amount}{" "}
                        {selectedBooking.currency || "CHF"}
                      </span>
                    </div>
                    Parfait
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Statut paiement :
                      </span>
                      <span
                        className={`font-medium ${
                          selectedBooking.paymentStatus === "succeeded"
                            ? "text-green-600"
                            : "text-orange-600"
                        }`}
                      >
                        {selectedBooking.paymentStatus === "succeeded"
                          ? "✓ Payé"
                          : "⏳ En attente"}
                      </span>
                    </div>
                    {selectedBooking.stripePaymentIntentId && (
                      <div className="text-xs text-muted-foreground truncate">
                        ID: {selectedBooking.stripePaymentIntentId}
                      </div>
                    )}
                  </div>
                </div>

                {/* Détails de facturation */}
                <div className="bg-muted/50 p-3 rounded-lg">
                  <h3 className="font-semibold mb-2 flex items-center gap-2 text-sm">
                    <Calculator className="h-3 w-3" />
                    Détail de la facturation
                  </h3>
                  {(() => {
                    const financials =
                      calculateBookingFinancials(selectedBooking);
                    return (
                      <div className="space-y-2 text-xs">
                        {/* Prix de base */}
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Chambre ({financials.roomPrice} CHF ×{" "}
                              {financials.duration} nuit
                              {financials.duration > 1 ? "s" : ""}) :
                            </span>
                            <span className="font-medium">
                              {formatCHF(financials.baseRoomCost)}
                            </span>
                          </div>

                          {/* Détail des options supplémentaires */}
                          {selectedBooking.selectedPricingOptions &&
                            Object.keys(selectedBooking.selectedPricingOptions)
                              .length > 0 && (
                              <div className="space-y-1 py-1 border-t">
                                <div className="text-xs font-medium text-muted-foreground mb-1">
                                  Options supplémentaires :
                                </div>
                                {(() => {
                                  // Vérifier si c'est le nouveau format enrichi
                                  if (
                                    isEnrichedFormat(
                                      selectedBooking.selectedPricingOptions
                                    )
                                  ) {
                                    // NOUVEAU FORMAT : Utiliser directement les données enrichies
                                    const enrichedOptions =
                                      getFlatEnrichedOptions(
                                        selectedBooking.selectedPricingOptions
                                      );

                                    return enrichedOptions.map((opt) => (
                                      <div
                                        key={`${opt.optionId}-${opt.valueId}`}
                                        className="flex justify-between pl-3"
                                      >
                                        <span className="text-muted-foreground text-xs">
                                          • {opt.optionName}: {opt.valueLabel}
                                        </span>
                                        <span
                                          className={`font-medium text-xs ${
                                            opt.priceModifier < 0
                                              ? "text-green-600"
                                              : ""
                                          }`}
                                        >
                                          {opt.priceModifier >= 0 ? "+" : ""}
                                          {formatCHF(opt.priceModifier)}
                                        </span>
                                      </div>
                                    ));
                                  }

                                  // ANCIEN FORMAT : Essayer de décoder avec les options actuelles
                                  let foundOptions = 0;
                                  const optionsDisplay = Object.entries(
                                    selectedBooking.selectedPricingOptions
                                  ).map(([optionId, valueIds]) => {
                                    const option = pricingOptions.find(
                                      (o) => o.id === optionId
                                    );

                                    if (!option) {
                                      // Option obsolète - ne rien afficher individuellement
                                      return null;
                                    }

                                    foundOptions++;

                                    // Gérer plusieurs valeurs (array) ou une seule (string)
                                    const valueArray = Array.isArray(valueIds)
                                      ? valueIds
                                      : [valueIds];

                                    return valueArray.map((valueId) => {
                                      const value = option.values.find(
                                        (v) => v.id === valueId
                                      );

                                      if (!value) {
                                        return null;
                                      }

                                      return (
                                        <div
                                          key={`${optionId}-${valueId}`}
                                          className="flex justify-between pl-3"
                                        >
                                          <span className="text-muted-foreground text-xs">
                                            • {option.name}: {value.label}
                                          </span>
                                          <span
                                            className={`font-medium text-xs ${
                                              value.priceModifier < 0
                                                ? "text-green-600"
                                                : ""
                                            }`}
                                          >
                                            {value.priceModifier >= 0
                                              ? "+"
                                              : ""}
                                            {formatCHF(value.priceModifier)}
                                          </span>
                                        </div>
                                      );
                                    });
                                  });

                                  // Si aucune option n'a été trouvée, afficher un message
                                  if (foundOptions === 0) {
                                    return (
                                      <div className="pl-3 text-xs text-muted-foreground italic">
                                        Configuration d&apos;options modifiée
                                        depuis cette réservation
                                      </div>
                                    );
                                  }

                                  return optionsDisplay;
                                })()}
                                {/* Afficher le total si on ne peut pas décoder les options */}
                                {financials.pricingOptionsTotal !== 0 && (
                                  <div className="flex justify-between pt-1 border-t">
                                    <span className="text-muted-foreground text-xs font-medium">
                                      Total options :
                                    </span>
                                    <span
                                      className={`font-medium text-xs ${
                                        financials.pricingOptionsTotal < 0
                                          ? "text-green-600"
                                          : ""
                                      }`}
                                    >
                                      {financials.pricingOptionsTotal >= 0
                                        ? "+"
                                        : ""}
                                      {formatCHF(
                                        financials.pricingOptionsTotal
                                      )}
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}

                          {/* Fallback: afficher juste le total si pas d'options détaillées mais qu'il y a un montant */}
                          {(!selectedBooking.selectedPricingOptions ||
                            Object.keys(selectedBooking.selectedPricingOptions)
                              .length === 0) &&
                            financials.pricingOptionsTotal !== 0 && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                  Options supplémentaires :
                                </span>
                                <span
                                  className={`font-medium ${
                                    financials.pricingOptionsTotal < 0
                                      ? "text-green-600"
                                      : ""
                                  }`}
                                >
                                  {financials.pricingOptionsTotal >= 0
                                    ? "+"
                                    : ""}
                                  {formatCHF(financials.pricingOptionsTotal)}
                                </span>
                              </div>
                            )}

                          {financials.touristTaxTotal > 0 && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Taxe de séjour :
                              </span>
                              <span className="font-medium">
                                +{formatCHF(financials.touristTaxTotal)}
                              </span>
                            </div>
                          )}

                          <div className="border-t pt-1">
                            <div className="flex justify-between font-medium">
                              <span>Sous-total (sans frais) :</span>
                              <span>{formatCHF(financials.subtotal)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Frais de plateforme */}
                        {financials.platformFees && (
                          <div className="space-y-1 border-t pt-1">
                            <div className="text-xs text-muted-foreground font-medium mb-1">
                              Frais de plateforme
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Commission (
                                {establishment
                                  ? establishment.commissionRate.toFixed(1)
                                  : "0.0"}
                                %) :
                              </span>
                              <span className="font-medium text-red-600">
                                +{formatCHF(financials.platformFees.commission)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Frais fixes :
                              </span>
                              <span className="font-medium text-red-600">
                                +{formatCHF(financials.platformFees.fixedFee)}
                              </span>
                            </div>
                            <div className="flex justify-between text-red-600 font-medium">
                              <span>Total frais :</span>
                              <span>
                                +{formatCHF(financials.platformFees.totalFees)}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Total final */}
                        <div className="border-t pt-1">
                          <div className="flex justify-between font-bold">
                            <span>Total payé par le client :</span>
                            <span className="text-green-600">
                              {formatCHF(financials.finalAmount)}
                            </span>
                          </div>
                          {financials.platformFees && (
                            <div className="flex justify-between text-xs text-muted-foreground mt-1">
                              <span>
                                Montant net pour l&apos;établissement :
                              </span>
                              <span className="font-medium">
                                {formatCHF(financials.platformFees.netAmount)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Note interne */}
                <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg">
                  <h3 className="font-semibold mb-2 flex items-center gap-2 text-sm text-amber-900">
                    <FileText className="h-3 w-3" />
                    Note interne (admin uniquement)
                  </h3>
                  <div className="space-y-2">
                    {editingInternalNote ? (
                      <div className="space-y-2">
                        <textarea
                          value={internalNoteValue}
                          onChange={(e) => setInternalNoteValue(e.target.value)}
                          className="w-full p-2 text-xs border rounded-md min-h-[80px] resize-y"
                          placeholder="Ajoutez une note interne visible uniquement par l'équipe admin..."
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={handleSaveInternalNote}
                            disabled={isSavingNote}
                            className="text-xs px-3 py-1.5 bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:opacity-50"
                          >
                            {isSavingNote ? "Enregistrement..." : "Enregistrer"}
                          </button>
                          <button
                            onClick={() => {
                              setEditingInternalNote(false);
                              setInternalNoteValue(
                                selectedBooking.internalNote || ""
                              );
                            }}
                            disabled={isSavingNote}
                            className="text-xs px-3 py-1.5 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50"
                          >
                            Annuler
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        {selectedBooking.internalNote ? (
                          <div className="text-xs whitespace-pre-wrap p-2 bg-white rounded border">
                            {selectedBooking.internalNote}
                          </div>
                        ) : (
                          <div className="text-xs text-muted-foreground italic">
                            Aucune note interne pour cette réservation
                          </div>
                        )}
                        <button
                          onClick={() => setEditingInternalNote(true)}
                          className="mt-2 text-xs px-3 py-1.5 bg-amber-100 text-amber-800 rounded-md hover:bg-amber-200"
                        >
                          {selectedBooking.internalNote
                            ? "Modifier"
                            : "Ajouter une note"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
