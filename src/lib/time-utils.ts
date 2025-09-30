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
    const [cutoffHours, cutoffMinutes] = cutoffTime.split(":").map(Number);
    const [reopenHours, reopenMinutes] = (reopenTime || "00:00")
      .split(":")
      .map(Number);

    // Créer l'heure limite pour aujourd'hui
    const todayCutoff = new Date();
    todayCutoff.setHours(cutoffHours, cutoffMinutes, 0, 0);

    // Créer l'heure de réouverture pour aujourd'hui
    const todayReopen = new Date();
    todayReopen.setHours(reopenHours, reopenMinutes, 0, 0);

    // Déterminer si c'est un créneau qui traverse minuit
    const crossesMidnight =
      cutoffHours > reopenHours ||
      (cutoffHours === reopenHours && cutoffMinutes > reopenMinutes);

    if (crossesMidnight) {
      // Cas: créneau traverse minuit (ex: 22h à 9h)
      // Les réservations sont fermées entre cutoffTime hier et reopenTime aujourd'hui

      // Si on est avant l'heure de réouverture aujourd'hui, on est encore fermé
      if (now < todayReopen) {
        return {
          isAfterCutoff: true,
          nextAvailableTime: todayReopen,
          message: `Il est trop tard pour réserver. Réservations à nouveau disponibles à partir de ${reopenTime || "00:00"} aujourd'hui.`,
        };
      }

      // Si on est après l'heure limite d'aujourd'hui, on est fermé jusqu'à demain
      if (now > todayCutoff) {
        const tomorrowReopen = new Date();
        tomorrowReopen.setDate(tomorrowReopen.getDate() + 1);
        tomorrowReopen.setHours(reopenHours, reopenMinutes, 0, 0);

        return {
          isAfterCutoff: true,
          nextAvailableTime: tomorrowReopen,
          message: `Il est trop tard pour réserver aujourd'hui. Réservations à nouveau disponibles à partir de ${reopenTime || "00:00"} demain.`,
        };
      }

      // Sinon, on est dans la fenêtre ouverte (entre reopenTime et cutoffTime aujourd'hui)
      return {
        isAfterCutoff: false,
        nextAvailableTime: null,
        message: `Réservations disponibles jusqu'à ${cutoffTime} aujourd'hui`,
      };
    } else {
      // Cas normal: créneau dans la même journée (ex: 8h à 18h)
      // Si on est après l'heure limite aujourd'hui
      if (now > todayCutoff) {
        const tomorrowReopen = new Date();
        tomorrowReopen.setDate(tomorrowReopen.getDate() + 1);
        tomorrowReopen.setHours(reopenHours, reopenMinutes, 0, 0);

        return {
          isAfterCutoff: true,
          nextAvailableTime: tomorrowReopen,
          message: `Il est trop tard pour réserver aujourd'hui. Réservations à nouveau disponibles à partir de ${reopenTime || "00:00"} demain.`,
        };
      }

      // Si on est avant l'heure de réouverture aujourd'hui
      if (now < todayReopen) {
        return {
          isAfterCutoff: true,
          nextAvailableTime: todayReopen,
          message: `Il est trop tôt pour réserver. Réservations disponibles à partir de ${reopenTime || "00:00"} aujourd'hui.`,
        };
      }

      // Sinon, réservations disponibles
      return {
        isAfterCutoff: false,
        nextAvailableTime: null,
        message: `Réservations disponibles jusqu'à ${cutoffTime} aujourd'hui`,
      };
    }
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
