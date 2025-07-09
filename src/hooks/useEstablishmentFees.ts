"use client";

import { useState, useEffect } from "react";

interface EstablishmentFees {
  commissionRate: number; // En pourcentage
  fixedFee: number;
  loading: boolean;
  error: string | null;
}

/**
 * Hook pour récupérer les frais d'un établissement
 */
export function useEstablishmentFees(
  establishmentSlug: string | null
): EstablishmentFees {
  const [fees, setFees] = useState<EstablishmentFees>({
    commissionRate: 0, // Valeur par défaut corrigée
    fixedFee: 3.0, // Valeur par défaut corrigée
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!establishmentSlug) {
      setFees((prev) => ({ ...prev, loading: false }));
      return;
    }

    const fetchFees = async () => {
      try {
        setFees((prev) => ({ ...prev, loading: true, error: null }));

        const response = await fetch(
          `/api/establishments/${establishmentSlug}/fees`
        );

        if (!response.ok) {
          throw new Error("Erreur lors du chargement des frais");
        }

        const data = await response.json();

        setFees({
          commissionRate: data.commissionRate ?? 0, // Utiliser ?? au lieu de || pour bien gérer le 0
          fixedFee: data.fixedFee ?? 3.0, // Utiliser ?? au lieu de || pour bien gérer le 0
          loading: false,
          error: null,
        });
      } catch (error) {
        console.error("Erreur chargement frais:", error);
        setFees((prev) => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : "Erreur inconnue",
        }));
      }
    };

    fetchFees();
  }, [establishmentSlug]);

  return fees;
}
