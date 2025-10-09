"use client";

import { useState, useEffect } from "react";
import { translations, type Locale } from "@/lib/booking-translations";

const LOCALE_STORAGE_KEY = "booking_locale";

/**
 * Hook pour gérer les traductions du système de réservation
 * Persiste la langue choisie dans le localStorage
 */
export function useBookingTranslation() {
  const [locale, setLocaleState] = useState<Locale>("fr");
  const [mounted, setMounted] = useState(false);

  // Charger la langue sauvegardée au montage
  useEffect(() => {
    const savedLocale = localStorage.getItem(
      LOCALE_STORAGE_KEY
    ) as Locale | null;
    if (savedLocale && ["fr", "en", "de"].includes(savedLocale)) {
      setLocaleState(savedLocale);
    }
    setMounted(true);
  }, []);

  // Fonction pour changer de langue
  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
  };

  // Retourner les traductions de la langue active
  const t = translations[locale];

  return {
    t,
    locale,
    setLocale,
    mounted, // Pour éviter les hydration mismatches
  };
}

/**
 * Hook simplifié pour obtenir uniquement les traductions
 * (sans gestion du changement de langue)
 */
export function useT() {
  const { t } = useBookingTranslation();
  return t;
}
