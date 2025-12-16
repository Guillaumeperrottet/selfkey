import { describe, it, expect, beforeEach, vi } from "vitest";
import { mockPrisma } from "../../../tests/mocks/prisma";

// Mock Prisma AVANT d'importer les fonctions
vi.mock("@/lib/database/prisma", () => ({ prisma: mockPrisma }));

import {
  calculateStayDuration,
  validateBookingDates,
  checkRoomAvailability,
  getAvailableRooms,
  getCurrentDateTime,
  isRoomCurrentlyAvailable,
  getCurrentlyAvailableRooms,
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

  describe("checkRoomAvailability", () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it("retourne disponible quand il n'y a pas de conflit", async () => {
      mockPrisma.booking.findMany.mockResolvedValue([]);

      const checkIn = new Date("2025-07-10");
      const checkOut = new Date("2025-07-15");

      const result = await checkRoomAvailability("room-1", checkIn, checkOut);

      expect(result.isAvailable).toBe(true);
      expect(result.conflictingBookings).toBeUndefined();
      expect(mockPrisma.booking.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            roomId: "room-1",
            paymentStatus: "succeeded",
          }),
        })
      );
    });

    it("détecte un conflit quand une réservation existe", async () => {
      const existingBooking = {
        id: "booking-1",
        checkInDate: new Date("2025-07-12"),
        checkOutDate: new Date("2025-07-14"),
        clientFirstName: "Jean",
        clientLastName: "Dupont",
      };

      mockPrisma.booking.findMany.mockResolvedValue([existingBooking]);

      const checkIn = new Date("2025-07-10");
      const checkOut = new Date("2025-07-15");

      const result = await checkRoomAvailability("room-1", checkIn, checkOut);

      expect(result.isAvailable).toBe(false);
      expect(result.conflictingBookings).toHaveLength(1);
      expect(result.conflictingBookings?.[0].clientFirstName).toBe("Jean");
    });

    it("exclut une réservation spécifique (mode édition)", async () => {
      mockPrisma.booking.findMany.mockResolvedValue([]);

      const checkIn = new Date("2025-07-10");
      const checkOut = new Date("2025-07-15");

      await checkRoomAvailability(
        "room-1",
        checkIn,
        checkOut,
        "booking-to-exclude"
      );

      expect(mockPrisma.booking.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            id: { not: "booking-to-exclude" },
          }),
        })
      );
    });

    it("gère plusieurs conflits", async () => {
      const conflicts = [
        {
          id: "booking-1",
          checkInDate: new Date("2025-07-12"),
          checkOutDate: new Date("2025-07-14"),
          clientFirstName: "Jean",
          clientLastName: "Dupont",
        },
        {
          id: "booking-2",
          checkInDate: new Date("2025-07-16"),
          checkOutDate: new Date("2025-07-18"),
          clientFirstName: "Marie",
          clientLastName: "Martin",
        },
      ];

      mockPrisma.booking.findMany.mockResolvedValue(conflicts);

      const checkIn = new Date("2025-07-10");
      const checkOut = new Date("2025-07-20");

      const result = await checkRoomAvailability("room-1", checkIn, checkOut);

      expect(result.isAvailable).toBe(false);
      expect(result.conflictingBookings).toHaveLength(2);
    });
  });

  describe("getAvailableRooms", () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it("retourne les chambres disponibles pour une période", async () => {
      const mockRooms = [
        { id: "room-1", name: "Chambre 1", price: 100, isActive: true },
        { id: "room-2", name: "Chambre 2", price: 120, isActive: true },
      ];

      mockPrisma.establishment.findUnique.mockResolvedValue({
        enableDogOption: false,
      } as any);

      mockPrisma.room.findMany.mockResolvedValue(mockRooms as any);
      mockPrisma.booking.findMany.mockResolvedValue([]);

      const checkIn = new Date("2025-07-10");
      const checkOut = new Date("2025-07-15");

      const result = await getAvailableRooms("test-hotel", checkIn, checkOut);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("room-1");
      expect(result[0].available).toBe(1);
    });

    it("filtre les chambres occupées", async () => {
      const mockRooms = [
        { id: "room-1", name: "Chambre 1", price: 100, isActive: true },
        { id: "room-2", name: "Chambre 2", price: 120, isActive: true },
      ];

      mockPrisma.establishment.findUnique.mockResolvedValue({
        enableDogOption: false,
      } as any);

      mockPrisma.room.findMany.mockResolvedValue(mockRooms as any);

      // room-1 est occupée
      mockPrisma.booking.findMany
        .mockResolvedValueOnce([
          {
            id: "booking-1",
            checkInDate: new Date("2025-07-12"),
            checkOutDate: new Date("2025-07-14"),
            clientFirstName: "Jean",
            clientLastName: "Dupont",
          },
        ] as any)
        .mockResolvedValueOnce([]); // room-2 est disponible

      const checkIn = new Date("2025-07-10");
      const checkOut = new Date("2025-07-15");

      const result = await getAvailableRooms("test-hotel", checkIn, checkOut);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("room-2");
    });

    it("filtre les chambres selon l'option chien (avec chien)", async () => {
      const mockRooms = [
        {
          id: "room-1",
          name: "Chambre avec chien",
          price: 100,
          isActive: true,
          allowDogs: true,
        },
      ];

      mockPrisma.establishment.findUnique.mockResolvedValue({
        enableDogOption: true,
      } as any);

      mockPrisma.room.findMany.mockResolvedValue(mockRooms as any);
      mockPrisma.booking.findMany.mockResolvedValue([]);

      const checkIn = new Date("2025-07-10");
      const checkOut = new Date("2025-07-15");

      await getAvailableRooms("test-hotel", checkIn, checkOut, true);

      expect(mockPrisma.room.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            allowDogs: true,
          }),
        })
      );
    });

    it("filtre les chambres selon l'option chien (sans chien)", async () => {
      mockPrisma.establishment.findUnique.mockResolvedValue({
        enableDogOption: true,
      } as any);

      mockPrisma.room.findMany.mockResolvedValue([]);

      const checkIn = new Date("2025-07-10");
      const checkOut = new Date("2025-07-15");

      await getAvailableRooms("test-hotel", checkIn, checkOut, false);

      expect(mockPrisma.room.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            allowDogs: false,
          }),
        })
      );
    });

    it("retourne un tableau vide si aucune chambre n'existe", async () => {
      mockPrisma.establishment.findUnique.mockResolvedValue({
        enableDogOption: false,
      } as any);

      mockPrisma.room.findMany.mockResolvedValue([]);

      const checkIn = new Date("2025-07-10");
      const checkOut = new Date("2025-07-15");

      const result = await getAvailableRooms("test-hotel", checkIn, checkOut);

      expect(result).toEqual([]);
    });
  });

  describe("getCurrentDateTime", () => {
    it("retourne la date et heure actuelle", () => {
      const before = new Date();
      const result = getCurrentDateTime();
      const after = new Date();

      expect(result.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(result.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });

  describe("isRoomCurrentlyAvailable", () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it("retourne true si aucune réservation", async () => {
      mockPrisma.establishment.findFirst.mockResolvedValue({
        checkoutTime: "12:00",
      } as any);

      mockPrisma.booking.findMany.mockResolvedValue([]);

      const result = await isRoomCurrentlyAvailable("room-1", "test-hotel");

      expect(result).toBe(true);
    });

    it("retourne false si la chambre est occupée toute la journée", async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      mockPrisma.establishment.findFirst.mockResolvedValue({
        checkoutTime: "12:00",
      } as any);

      mockPrisma.booking.findMany.mockResolvedValue([
        {
          id: "booking-1",
          checkInDate: new Date(today.getTime() - 24 * 60 * 60 * 1000),
          checkOutDate: new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000),
          paymentStatus: "succeeded",
        },
      ] as any);

      const result = await isRoomCurrentlyAvailable("room-1", "test-hotel");

      expect(result).toBe(false);
    });

    it("retourne false avant l'heure de checkout pour un départ aujourd'hui", async () => {
      vi.useFakeTimers();
      const today = new Date("2025-07-15T10:00:00"); // 10h du matin
      vi.setSystemTime(today);

      const todayMidnight = new Date(today);
      todayMidnight.setHours(0, 0, 0, 0);

      mockPrisma.establishment.findFirst.mockResolvedValue({
        checkoutTime: "12:00", // Checkout à midi
      } as any);

      mockPrisma.booking.findMany.mockResolvedValue([
        {
          id: "booking-1",
          checkInDate: new Date("2025-07-14"),
          checkOutDate: todayMidnight, // Départ aujourd'hui
          paymentStatus: "succeeded",
        },
      ] as any);

      const result = await isRoomCurrentlyAvailable("room-1", "test-hotel");

      expect(result).toBe(false); // Avant midi = occupé

      vi.useRealTimers();
    });

    it("retourne false si une arrivée est prévue aujourd'hui", async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      mockPrisma.establishment.findFirst.mockResolvedValue({
        checkoutTime: "12:00",
      } as any);

      mockPrisma.booking.findMany.mockResolvedValue([
        {
          id: "booking-1",
          checkInDate: today,
          checkOutDate: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000),
          paymentStatus: "succeeded",
        },
      ] as any);

      const result = await isRoomCurrentlyAvailable("room-1", "test-hotel");

      expect(result).toBe(false);
    });

    it("utilise l'heure de checkout par défaut si non configurée", async () => {
      mockPrisma.establishment.findFirst.mockResolvedValue(null);
      mockPrisma.booking.findMany.mockResolvedValue([]);

      const result = await isRoomCurrentlyAvailable("room-1", "test-hotel");

      expect(result).toBe(true);
    });
  });

  describe("getCurrentlyAvailableRooms", () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it("retourne toutes les chambres avec leur disponibilité", async () => {
      const mockRooms = [
        {
          id: "room-1",
          name: "Chambre 1",
          price: 100,
          isActive: true,
          hotelSlug: "test-hotel",
        },
        {
          id: "room-2",
          name: "Chambre 2",
          price: 120,
          isActive: true,
          hotelSlug: "test-hotel",
        },
      ];

      mockPrisma.room.findMany.mockResolvedValue(mockRooms as any);
      mockPrisma.establishment.findFirst.mockResolvedValue({
        checkoutTime: "12:00",
      } as any);
      mockPrisma.booking.findMany.mockResolvedValue([]);

      const result = await getCurrentlyAvailableRooms("test-hotel");

      expect(result).toHaveLength(2);
      expect(result[0].available).toBe(true);
      expect(result[1].available).toBe(true);
    });

    it("marque les chambres occupées comme non disponibles", async () => {
      const mockRooms = [
        {
          id: "room-1",
          name: "Chambre 1",
          price: 100,
          isActive: true,
          hotelSlug: "test-hotel",
        },
      ];

      mockPrisma.room.findMany.mockResolvedValue(mockRooms as any);
      mockPrisma.establishment.findFirst.mockResolvedValue({
        checkoutTime: "12:00",
      } as any);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      mockPrisma.booking.findMany.mockResolvedValue([
        {
          id: "booking-1",
          checkInDate: today,
          checkOutDate: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000),
          paymentStatus: "succeeded",
        },
      ] as any);

      const result = await getCurrentlyAvailableRooms("test-hotel");

      expect(result).toHaveLength(1);
      expect(result[0].available).toBe(false);
    });

    it("filtre uniquement les chambres actives", async () => {
      const mockRooms = [
        {
          id: "room-1",
          name: "Chambre active",
          price: 100,
          isActive: true,
          hotelSlug: "test-hotel",
        },
      ];

      mockPrisma.room.findMany.mockResolvedValue(mockRooms as any);
      mockPrisma.establishment.findFirst.mockResolvedValue({
        checkoutTime: "12:00",
      } as any);
      mockPrisma.booking.findMany.mockResolvedValue([]);

      await getCurrentlyAvailableRooms("test-hotel");

      expect(mockPrisma.room.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isActive: true,
          }),
        })
      );
    });
  });
});
