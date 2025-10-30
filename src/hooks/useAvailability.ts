import { useState, useEffect, useCallback } from "react";

interface AvailabilityData {
  establishmentSlug: string;
  totalRooms: number;
  availableRooms: number;
  occupiedRooms: number;
  availabilityPercentage: number;
  status: "available" | "limited" | "full" | "closed";
  nextAvailable?: string | null;
  lastUpdated: string;
}

interface UseAvailabilityReturn {
  availabilityData: Record<string, AvailabilityData>;
  loading: boolean;
  error: string | null;
  refreshAvailability: () => Promise<void>;
}

export function useAvailability(
  establishmentSlugs: string[]
): UseAvailabilityReturn {
  const [availabilityData, setAvailabilityData] = useState<
    Record<string, AvailabilityData>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAvailability = useCallback(async () => {
    if (establishmentSlugs.length === 0) {
      setLoading(false);
      return;
    }

    try {
      setError(null);

      // Récupérer la disponibilité pour tous les établissements en parallèle
      const promises = establishmentSlugs.map(async (slug) => {
        try {
          const response = await fetch(
            `/api/public/establishments/${slug}/availability`
          );
          if (response.ok) {
            const data = await response.json();
            return { slug, data };
          } else {
            console.warn(
              `Erreur pour l'établissement ${slug}:`,
              response.status
            );
            return { slug, data: null };
          }
        } catch (error) {
          console.warn(`Erreur réseau pour l'établissement ${slug}:`, error);
          return { slug, data: null };
        }
      });

      const results = await Promise.all(promises);

      const newAvailabilityData: Record<string, AvailabilityData> = {};
      results.forEach(({ slug, data }) => {
        if (data) {
          newAvailabilityData[slug] = data;
        }
      });

      setAvailabilityData(newAvailabilityData);
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des disponibilités:",
        error
      );
      setError("Erreur lors du chargement des disponibilités");
    } finally {
      setLoading(false);
    }
  }, [establishmentSlugs]);

  useEffect(() => {
    fetchAvailability();
  }, [fetchAvailability]);

  // Rafraîchir les données toutes les 2 minutes
  useEffect(() => {
    if (establishmentSlugs.length === 0) return;

    const interval = setInterval(
      () => {
        fetchAvailability();
      },
      2 * 60 * 1000
    ); // 2 minutes

    return () => clearInterval(interval);
  }, [establishmentSlugs.length, fetchAvailability]);

  return {
    availabilityData,
    loading,
    error,
    refreshAvailability: fetchAvailability,
  };
}
