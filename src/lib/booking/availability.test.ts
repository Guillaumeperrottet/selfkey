import { describe, it, expect } from "vitest";
import {
  calculateStayDuration,
  validateBookingDates,
} from "@/lib/booking/availability";

describe("Availability Utils", () => {
  describe("calculateStayDuration", () => {
    it("calcule correctement la durée pour 1 nuit", () => {
      const checkIn = new Date("2025-01-10");
      const checkOut = new Date("2025-01-11");

      expect(calculateStayDuration(checkIn, checkOut)).toBe(1);
    });

    it("calcule correctement la durée pour plusieurs nuits", () => {
      const checkIn = new Date("2025-01-10");
      const checkOut = new Date("2025-01-15");

      expect(calculateStayDuration(checkIn, checkOut)).toBe(5);
    });

    it("calcule correctement la durée pour une semaine", () => {
      const checkIn = new Date("2025-01-10");
      const checkOut = new Date("2025-01-17");

      expect(calculateStayDuration(checkIn, checkOut)).toBe(7);
    });

    it("gère les dates avec heures différentes (même jour)", () => {
      const checkIn = new Date("2025-01-10T14:00:00");
      const checkOut = new Date("2025-01-10T11:00:00");

      // Départ avant arrivée le même jour = fraction de jour arrondie
      // Note: Math.ceil d'un nombre négatif peut donner -0
      const duration = calculateStayDuration(checkIn, checkOut);
      expect(Math.abs(duration)).toBe(0);
    });

    it("arrondit vers le haut les fractions de jour", () => {
      const checkIn = new Date("2025-01-10T14:00:00");
      const checkOut = new Date("2025-01-11T11:00:00");

      // Moins de 24h mais compte comme 1 jour
      expect(calculateStayDuration(checkIn, checkOut)).toBe(1);
    });

    it("gère les longues durées", () => {
      const checkIn = new Date("2025-01-01");
      const checkOut = new Date("2025-01-31");

      expect(calculateStayDuration(checkIn, checkOut)).toBe(30);
    });

    it("gère les durées sur plusieurs mois", () => {
      const checkIn = new Date("2025-01-15");
      const checkOut = new Date("2025-03-15");

      expect(calculateStayDuration(checkIn, checkOut)).toBe(59);
    });
  });

  describe("validateBookingDates", () => {
    const maxBookingDays = 14;

    describe("Validation de base", () => {
      it("accepte des dates valides", () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);

        const dayAfter = new Date(tomorrow);
        dayAfter.setDate(dayAfter.getDate() + 1);

        const result = validateBookingDates(tomorrow, dayAfter, maxBookingDays);

        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
      });

      it("rejette une date d'arrivée dans le passé", () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        const result = validateBookingDates(
          yesterday,
          tomorrow,
          maxBookingDays
        );

        expect(result.isValid).toBe(false);
        expect(result.error).toContain("passé");
      });

      it("rejette une date de départ avant ou égale à la date d'arrivée", () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);

        const sameDay = new Date(tomorrow);

        const result = validateBookingDates(tomorrow, sameDay, maxBookingDays);

        expect(result.isValid).toBe(false);
        expect(result.error).toContain("après");
      });

      it("rejette une durée dépassant la limite maximale", () => {
        const checkIn = new Date();
        checkIn.setDate(checkIn.getDate() + 1);

        const checkOut = new Date(checkIn);
        checkOut.setDate(checkOut.getDate() + 15); // 15 jours > 14 max

        const result = validateBookingDates(checkIn, checkOut, maxBookingDays);

        expect(result.isValid).toBe(false);
        expect(result.error).toContain("14");
        expect(result.error).toContain("dépasser");
      });

      it("accepte une durée égale à la limite maximale", () => {
        const checkIn = new Date();
        checkIn.setDate(checkIn.getDate() + 1);

        const checkOut = new Date(checkIn);
        checkOut.setDate(checkOut.getDate() + maxBookingDays);

        const result = validateBookingDates(checkIn, checkOut, maxBookingDays);

        expect(result.isValid).toBe(true);
      });
    });

    describe("Fenêtre de réservation", () => {
      it("accepte des dates dans la fenêtre de réservation", () => {
        const windowStart = new Date("2026-06-01"); // Année future
        const windowEnd = new Date("2026-08-31");

        const checkIn = new Date("2026-07-10");
        const checkOut = new Date("2026-07-15");

        const result = validateBookingDates(
          checkIn,
          checkOut,
          maxBookingDays,
          windowStart,
          windowEnd
        );

        expect(result.isValid).toBe(true);
      });

      it("rejette une date d'arrivée avant la fenêtre", () => {
        const windowStart = new Date("2026-06-01");
        const windowEnd = new Date("2026-08-31");

        const checkIn = new Date("2026-05-20");
        const checkOut = new Date("2026-06-05");

        const result = validateBookingDates(
          checkIn,
          checkOut,
          maxBookingDays,
          windowStart,
          windowEnd
        );

        expect(result.isValid).toBe(false);
        expect(result.error).toContain("à partir du");
      });

      it("rejette une date de départ après la fenêtre", () => {
        const windowStart = new Date("2026-06-01");
        const windowEnd = new Date("2026-08-31");

        const checkIn = new Date("2026-08-25");
        const checkOut = new Date("2026-09-05");

        const result = validateBookingDates(
          checkIn,
          checkOut,
          maxBookingDays,
          windowStart,
          windowEnd
        );

        expect(result.isValid).toBe(false);
        expect(result.error).toContain("jusqu'au");
      });

      it("accepte une réservation au début exact de la fenêtre", () => {
        const windowStart = new Date("2026-06-01");
        const windowEnd = new Date("2026-08-31");

        const checkIn = new Date("2026-06-01");
        const checkOut = new Date("2026-06-05");

        const result = validateBookingDates(
          checkIn,
          checkOut,
          maxBookingDays,
          windowStart,
          windowEnd
        );

        expect(result.isValid).toBe(true);
      });

      it("accepte une réservation à la fin exacte de la fenêtre", () => {
        const windowStart = new Date("2026-06-01");
        const windowEnd = new Date("2026-08-31");

        const checkIn = new Date("2026-08-28");
        const checkOut = new Date("2026-08-31");

        const result = validateBookingDates(
          checkIn,
          checkOut,
          maxBookingDays,
          windowStart,
          windowEnd
        );

        expect(result.isValid).toBe(true);
      });
    });

    describe("Cas réels", () => {
      it("valide une réservation weekend typique", () => {
        const friday = new Date();
        friday.setDate(friday.getDate() + 7); // Vendredi prochain
        friday.setHours(0, 0, 0, 0);

        const sunday = new Date(friday);
        sunday.setDate(sunday.getDate() + 2); // Dimanche

        const result = validateBookingDates(friday, sunday, maxBookingDays);

        expect(result.isValid).toBe(true);
      });

      it("valide une réservation vacances (1 semaine)", () => {
        const checkIn = new Date();
        checkIn.setDate(checkIn.getDate() + 30);
        checkIn.setHours(0, 0, 0, 0);

        const checkOut = new Date(checkIn);
        checkOut.setDate(checkOut.getDate() + 7);

        const result = validateBookingDates(checkIn, checkOut, maxBookingDays);

        expect(result.isValid).toBe(true);
      });

      it("rejette une réservation trop longue pour camping", () => {
        const checkIn = new Date();
        checkIn.setDate(checkIn.getDate() + 10);

        const checkOut = new Date(checkIn);
        checkOut.setDate(checkOut.getDate() + 21); // 21 jours > limite

        const result = validateBookingDates(checkIn, checkOut, 14);

        expect(result.isValid).toBe(false);
      });

      it("valide une réservation saison estivale", () => {
        const windowStart = new Date("2026-06-01");
        const windowEnd = new Date("2026-09-15");

        const checkIn = new Date("2026-07-15");
        const checkOut = new Date("2026-07-22");

        const result = validateBookingDates(
          checkIn,
          checkOut,
          30,
          windowStart,
          windowEnd
        );

        expect(result.isValid).toBe(true);
      });
    });

    describe("Cas limites", () => {
      it("gère une limite de 1 jour", () => {
        const checkIn = new Date();
        checkIn.setDate(checkIn.getDate() + 1);

        const checkOut = new Date(checkIn);
        checkOut.setDate(checkOut.getDate() + 1);

        const result = validateBookingDates(checkIn, checkOut, 1);

        expect(result.isValid).toBe(true);
      });

      it("gère une limite très élevée", () => {
        const checkIn = new Date();
        checkIn.setDate(checkIn.getDate() + 1);

        const checkOut = new Date(checkIn);
        checkOut.setDate(checkOut.getDate() + 60);

        const result = validateBookingDates(checkIn, checkOut, 365);

        expect(result.isValid).toBe(true);
      });

      it("gère des dates avec heures différentes", () => {
        const checkIn = new Date();
        checkIn.setDate(checkIn.getDate() + 1);
        checkIn.setHours(14, 0, 0, 0); // 14h

        const checkOut = new Date(checkIn);
        checkOut.setDate(checkOut.getDate() + 3);
        checkOut.setHours(11, 0, 0, 0); // 11h

        const result = validateBookingDates(checkIn, checkOut, maxBookingDays);

        expect(result.isValid).toBe(true);
      });
    });

    describe("Messages d'erreur", () => {
      it("retourne un message clair pour date passée", () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        const result = validateBookingDates(
          yesterday,
          tomorrow,
          maxBookingDays
        );

        expect(result.error).toBe(
          "La date d'arrivée ne peut pas être dans le passé"
        );
      });

      it("retourne un message clair pour ordre de dates invalide", () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        const result = validateBookingDates(tomorrow, tomorrow, maxBookingDays);

        expect(result.error).toBe(
          "La date de départ doit être après la date d'arrivée"
        );
      });

      it("retourne un message avec la limite de jours", () => {
        const checkIn = new Date();
        checkIn.setDate(checkIn.getDate() + 1);

        const checkOut = new Date(checkIn);
        checkOut.setDate(checkOut.getDate() + 20);

        const result = validateBookingDates(checkIn, checkOut, 14);

        expect(result.error).toContain("14");
        expect(result.error).toContain("jours");
      });
    });
  });
});
