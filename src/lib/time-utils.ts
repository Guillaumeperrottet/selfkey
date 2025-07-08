/**
 * Utilitaires pour gérer les heures limites de réservation
 */

export interface CutoffTimeResult {
  isAfterCutoff: boolean;
  nextAvailableTime: Date | null;
  message: string;
}

/**
 * Vérifie si l'heure actuelle dépasse l'heure limite de réservation
 * @param enableCutoffTime - Si la fonctionnalité est activée
 * @param cutoffTime - Heure limite au format "HH:mm" (ex: "22:00")
 * @param reopenTime - Heure de réouverture au format "HH:mm" (ex: "00:00")
 * @returns Objet avec les informations sur la disponibilité
 */
export function checkCutoffTime(
  enableCutoffTime: boolean,
  cutoffTime: string | null,
  reopenTime: string | null = "00:00"
): CutoffTimeResult {
  // Si la fonctionnalité n'est pas activée, toujours disponible
  if (!enableCutoffTime || !cutoffTime) {
    return {
      isAfterCutoff: false,
      nextAvailableTime: null,
      message: "Réservations disponibles 24h/24",
    };
  }

  try {
    const now = new Date();
    const [hours, minutes] = cutoffTime.split(":").map(Number);

    // Créer l'heure limite pour aujourd'hui
    const todayCutoff = new Date();
    todayCutoff.setHours(hours, minutes, 0, 0);

    // Si on est après l'heure limite aujourd'hui
    if (now > todayCutoff) {
      // Calculer la prochaine disponibilité selon l'heure de réouverture
      const [reopenHours, reopenMinutes] = (reopenTime || "00:00")
        .split(":")
        .map(Number);

      const nextAvailable = new Date();
      nextAvailable.setDate(nextAvailable.getDate() + 1);
      nextAvailable.setHours(reopenHours, reopenMinutes, 0, 0);

      // Si l'heure de réouverture est le même jour (ex: cutoff à 22h, réouverture à 6h)
      // et que l'heure de réouverture est avant l'heure limite
      if (
        reopenHours < hours ||
        (reopenHours === hours && reopenMinutes < minutes)
      ) {
        // La réouverture est le lendemain
        // nextAvailable est déjà configuré pour le lendemain
      } else if (reopenHours === 0 && reopenMinutes === 0) {
        // Cas spécial pour minuit (00:00) - réouverture immédiate le lendemain
        nextAvailable.setHours(0, 0, 0, 0);
      }

      const reopenTimeDisplay = reopenTime || "00:00";

      return {
        isAfterCutoff: true,
        nextAvailableTime: nextAvailable,
        message:
          reopenTimeDisplay === "00:00"
            ? `Il est trop tard pour réserver aujourd'hui. Réservations à nouveau disponibles à partir de minuit.`
            : `Il est trop tard pour réserver aujourd'hui. Réservations à nouveau disponibles à partir de ${reopenTimeDisplay} demain.`,
      };
    }

    // Sinon, réservations disponibles
    return {
      isAfterCutoff: false,
      nextAvailableTime: null,
      message: `Réservations disponibles jusqu'à ${cutoffTime} aujourd'hui`,
    };
  } catch (error) {
    console.error("Erreur lors du parsing de cutoffTime:", error);
    return {
      isAfterCutoff: false,
      nextAvailableTime: null,
      message: "Réservations disponibles 24h/24",
    };
  }
}

/**
 * Formate une date en heure locale pour l'affichage
 * @param date - Date à formater
 * @returns String au format "HH:mm"
 */
export function formatTimeForDisplay(date: Date): string {
  return date.toLocaleTimeString("fr-CH", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/**
 * Calcule le temps restant avant l'heure limite
 * @param cutoffTime - Heure limite au format "HH:mm"
 * @returns Nombre de minutes restantes (null si dépassé)
 */
export function getMinutesUntilCutoff(cutoffTime: string): number | null {
  try {
    const now = new Date();
    const [hours, minutes] = cutoffTime.split(":").map(Number);

    const todayCutoff = new Date();
    todayCutoff.setHours(hours, minutes, 0, 0);

    if (now > todayCutoff) {
      return null; // Déjà dépassé
    }

    const diffMs = todayCutoff.getTime() - now.getTime();
    return Math.floor(diffMs / (1000 * 60)); // Convertir en minutes
  } catch (error) {
    console.error("Erreur calcul minutes restantes:", error);
    return null;
  }
}
