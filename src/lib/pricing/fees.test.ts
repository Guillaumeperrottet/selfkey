import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockPrisma } from "../../../tests/mocks/prisma";

// Mock du module Prisma AVANT l'import des fonctions
vi.mock("@/lib/database/prisma", () => ({
  prisma: mockPrisma,
}));

import {
  calculateFees,
  calculateTouristTax,
  formatCHF,
  formatPercentage,
  getEstablishmentFees,
  getDayParkingFees,
  calculateEstablishmentFees,
  getTouristTaxSettings,
  calculateEstablishmentTouristTax,
  calculateCompleteBooking,
  defaultPlatformConfig,
} from "@/lib/pricing/fees";

describe("Fee Calculator", () => {
  beforeEach(() => {
    // Réinitialiser les mocks avant chaque test
    vi.clearAllMocks();
  });

  describe("getEstablishmentFees", () => {
    it("récupère les frais d'un établissement existant", async () => {
      mockPrisma.establishment.findUnique.mockResolvedValue({
        id: "est-1",
        slug: "test-hotel",
        name: "Test Hotel",
        commissionRate: 5.5,
        dayParkingCommissionRate: 7.0,
        fixedFee: 2.5,
        touristTaxEnabled: true,
        touristTaxAmount: 3.0,
      } as any);

      const result = await getEstablishmentFees("test-hotel");

      expect(result.commissionRate).toBe(0.055); // Converti de % en décimal
      expect(result.fixedFee).toBe(2.5);
      expect(mockPrisma.establishment.findUnique).toHaveBeenCalledWith({
        where: { slug: "test-hotel" },
        select: {
          commissionRate: true,
          dayParkingCommissionRate: true,
          fixedFee: true,
        },
      });
    });

    it("retourne les frais par défaut si l'établissement n'existe pas", async () => {
      mockPrisma.establishment.findUnique.mockResolvedValue(null);

      const result = await getEstablishmentFees("inexistant");

      expect(result.commissionRate).toBe(defaultPlatformConfig.commissionRate);
      expect(result.fixedFee).toBe(defaultPlatformConfig.fixedFee);
    });

    it("retourne les frais par défaut en cas d'erreur de base de données", async () => {
      mockPrisma.establishment.findUnique.mockRejectedValue(
        new Error("Database error")
      );

      const result = await getEstablishmentFees("test-hotel");

      expect(result.commissionRate).toBe(defaultPlatformConfig.commissionRate);
      expect(result.fixedFee).toBe(defaultPlatformConfig.fixedFee);
    });
  });

  describe("getDayParkingFees", () => {
    it("récupère les frais de parking jour pour un établissement", async () => {
      mockPrisma.establishment.findUnique.mockResolvedValue({
        id: "est-1",
        slug: "test-hotel",
        dayParkingCommissionRate: 8.0,
        fixedFee: 2.0,
      } as any);

      const result = await getDayParkingFees("test-hotel");

      expect(result.commissionRate).toBe(0.08); // Converti de % en décimal
      expect(result.fixedFee).toBe(0); // Pas de frais fixe pour parking jour
    });

    it("retourne les frais par défaut si l'établissement n'existe pas", async () => {
      mockPrisma.establishment.findUnique.mockResolvedValue(null);

      const result = await getDayParkingFees("inexistant");

      expect(result.commissionRate).toBe(0.05); // 5% par défaut
      expect(result.fixedFee).toBe(0);
    });

    it("retourne les frais par défaut en cas d'erreur", async () => {
      mockPrisma.establishment.findUnique.mockRejectedValue(
        new Error("Database error")
      );

      const result = await getDayParkingFees("test-hotel");

      expect(result.commissionRate).toBe(0.05);
      expect(result.fixedFee).toBe(0);
    });
  });

  describe("calculateEstablishmentFees", () => {
    it("calcule les frais pour un établissement spécifique", async () => {
      mockPrisma.establishment.findUnique.mockResolvedValue({
        id: "est-1",
        slug: "luxury-hotel",
        commissionRate: 700, // 7% stocké comme 700 (sera divisé par 100 dans getEstablishmentFees)
        fixedFee: 4.0,
      } as any);

      const result = await calculateEstablishmentFees(200, "luxury-hotel");

      expect(result.originalAmount).toBe(200);
      expect(result.commission).toBe(14); // 200 * 0.07
      expect(result.fixedFee).toBe(4);
      expect(result.totalFees).toBe(18);
      expect(result.netAmount).toBe(182);
    });
  });

  describe("getTouristTaxSettings", () => {
    it("récupère les paramètres de taxe de séjour d'un établissement", async () => {
      mockPrisma.establishment.findUnique.mockResolvedValue({
        id: "est-1",
        slug: "geneva-hotel",
        touristTaxEnabled: true,
        touristTaxAmount: 3.75,
      } as any);

      const result = await getTouristTaxSettings("geneva-hotel");

      expect(result.touristTaxEnabled).toBe(true);
      expect(result.touristTaxAmount).toBe(3.75);
    });

    it("retourne les valeurs par défaut si l'établissement n'existe pas", async () => {
      mockPrisma.establishment.findUnique.mockResolvedValue(null);

      const result = await getTouristTaxSettings("inexistant");

      expect(result.touristTaxEnabled).toBe(true);
      expect(result.touristTaxAmount).toBe(3.0);
    });

    it("retourne les valeurs par défaut en cas d'erreur", async () => {
      mockPrisma.establishment.findUnique.mockRejectedValue(
        new Error("Database error")
      );

      const result = await getTouristTaxSettings("test-hotel");

      expect(result.touristTaxEnabled).toBe(true);
      expect(result.touristTaxAmount).toBe(3.0);
    });
  });

  describe("calculateEstablishmentTouristTax", () => {
    it("calcule la taxe de séjour pour un établissement spécifique", async () => {
      mockPrisma.establishment.findUnique.mockResolvedValue({
        id: "est-1",
        slug: "geneva-hotel",
        touristTaxEnabled: true,
        touristTaxAmount: 3.75,
      } as any);

      const result = await calculateEstablishmentTouristTax(
        2,
        3,
        "geneva-hotel"
      );

      expect(result.enabled).toBe(true);
      expect(result.taxPerPerson).toBe(3.75);
      expect(result.numberOfAdults).toBe(2);
      expect(result.numberOfNights).toBe(3);
      expect(result.totalTax).toBe(22.5); // 2 * 3 * 3.75
    });

    it("retourne 0 si la taxe est désactivée pour l'établissement", async () => {
      mockPrisma.establishment.findUnique.mockResolvedValue({
        id: "est-1",
        slug: "no-tax-hotel",
        touristTaxEnabled: false,
        touristTaxAmount: 3.0,
      } as any);

      const result = await calculateEstablishmentTouristTax(
        2,
        3,
        "no-tax-hotel"
      );

      expect(result.enabled).toBe(false);
      expect(result.totalTax).toBe(0);
    });
  });

  describe("calculateCompleteBooking", () => {
    it("calcule le prix total d'une réservation complète", async () => {
      // Mock pour la taxe de séjour
      mockPrisma.establishment.findUnique
        .mockResolvedValueOnce({
          id: "est-1",
          slug: "test-hotel",
          touristTaxEnabled: true,
          touristTaxAmount: 3.0,
        } as any)
        // Mock pour les frais
        .mockResolvedValueOnce({
          id: "est-1",
          slug: "test-hotel",
          commissionRate: 500, // 5% stocké comme 500
          fixedFee: 3.0,
        } as any);

      const result = await calculateCompleteBooking(
        100, // roomPrice
        2, // numberOfAdults
        3, // numberOfNights
        "test-hotel",
        15 // pricingOptionsTotal
      );

      expect(result.roomPrice).toBe(100);
      expect(result.pricingOptionsTotal).toBe(15);
      expect(result.touristTax.totalTax).toBe(18); // 2 * 3 * 3
      expect(result.subtotal).toBe(133); // 100 + 15 + 18
      expect(result.fees.totalFees).toBe(9.65); // (133 * 0.05) + 3
      expect(result.totalAmount).toBe(133); // Client paie le sous-total
    });

    it("calcule correctement sans options de prix", async () => {
      mockPrisma.establishment.findUnique
        .mockResolvedValueOnce({
          id: "est-1",
          slug: "simple-hotel",
          touristTaxEnabled: true,
          touristTaxAmount: 3.0,
        } as any)
        .mockResolvedValueOnce({
          id: "est-1",
          slug: "simple-hotel",
          commissionRate: 500, // 5% stocké comme 500
          fixedFee: 3.0,
        } as any);

      const result = await calculateCompleteBooking(
        50,
        1,
        1,
        "simple-hotel"
        // pas de pricingOptionsTotal
      );

      expect(result.roomPrice).toBe(50);
      expect(result.pricingOptionsTotal).toBe(0);
      expect(result.touristTax.totalTax).toBe(3); // 1 * 1 * 3
      expect(result.subtotal).toBe(53); // 50 + 0 + 3
      expect(result.fees.totalFees).toBe(5.65); // (53 * 0.05) + 3
      expect(result.totalAmount).toBe(53);
    });

    it("gère le cas où la taxe de séjour est désactivée", async () => {
      mockPrisma.establishment.findUnique
        .mockResolvedValueOnce({
          id: "est-1",
          slug: "no-tax-hotel",
          touristTaxEnabled: false,
          touristTaxAmount: 3.0,
        } as any)
        .mockResolvedValueOnce({
          id: "est-1",
          slug: "no-tax-hotel",
          commissionRate: 500, // 5% stocké comme 500
          fixedFee: 3.0,
        } as any);

      const result = await calculateCompleteBooking(
        100,
        2,
        2,
        "no-tax-hotel",
        10
      );

      expect(result.touristTax.enabled).toBe(false);
      expect(result.touristTax.totalTax).toBe(0);
      expect(result.subtotal).toBe(110); // 100 + 10 + 0
      expect(result.totalAmount).toBe(110);
    });

    it("simule une réservation réelle complète", async () => {
      mockPrisma.establishment.findUnique
        .mockResolvedValueOnce({
          id: "est-1",
          slug: "lakeside-hotel",
          touristTaxEnabled: true,
          touristTaxAmount: 3.5,
        } as any)
        .mockResolvedValueOnce({
          id: "est-1",
          slug: "lakeside-hotel",
          commissionRate: 650, // 6.5% stocké comme 650
          fixedFee: 2.5,
        } as any);

      const result = await calculateCompleteBooking(
        120, // chambre double
        2, // 2 adultes
        4, // 4 nuits
        "lakeside-hotel",
        30 // petit déjeuner + parking
      );

      expect(result.roomPrice).toBe(120);
      expect(result.pricingOptionsTotal).toBe(30);
      expect(result.touristTax.totalTax).toBe(28); // 2 * 4 * 3.5
      expect(result.subtotal).toBe(178); // 120 + 30 + 28
      expect(result.fees.commission).toBe(11.57); // 178 * 0.065
      expect(result.fees.fixedFee).toBe(2.5);
      expect(result.fees.totalFees).toBe(14.07);
      expect(result.fees.netAmount).toBe(163.93); // Ce que reçoit l'hôte
      expect(result.totalAmount).toBe(178); // Ce que paie le client
    });
  });

  describe("calculateFees", () => {
    it("calcule correctement les frais avec commission et frais fixe", () => {
      const result = calculateFees(100, 5, 3);

      expect(result.originalAmount).toBe(100);
      expect(result.commission).toBe(5);
      expect(result.fixedFee).toBe(3);
      expect(result.totalFees).toBe(8);
      expect(result.netAmount).toBe(92);
    });

    it("calcule les frais avec un taux de commission décimal", () => {
      const result = calculateFees(200, 7.5, 2);

      expect(result.originalAmount).toBe(200);
      expect(result.commission).toBe(15);
      expect(result.fixedFee).toBe(2);
      expect(result.totalFees).toBe(17);
      expect(result.netAmount).toBe(183);
    });

    it("calcule le pourcentage de frais total", () => {
      const result = calculateFees(100, 10, 5);

      expect(result.feePercentage).toBe(15); // (10 + 5) / 100 * 100
    });

    it("gère une commission de 0%", () => {
      const result = calculateFees(100, 0, 5);

      expect(result.commission).toBe(0);
      expect(result.totalFees).toBe(5);
      expect(result.netAmount).toBe(95);
    });

    it("gère un frais fixe de 0", () => {
      const result = calculateFees(100, 10, 0);

      expect(result.fixedFee).toBe(0);
      expect(result.totalFees).toBe(10);
      expect(result.netAmount).toBe(90);
    });

    it("retourne 0 pour le montant net si les frais dépassent le montant", () => {
      const result = calculateFees(10, 50, 20);

      expect(result.totalFees).toBe(25);
      expect(result.netAmount).toBe(0); // Ne peut pas être négatif
    });

    it("évite les erreurs d'arrondi avec des montants décimaux", () => {
      const result = calculateFees(33.33, 5.5, 2.5);

      expect(result.commission).toBe(1.83);
      expect(result.fixedFee).toBe(2.5);
      expect(result.totalFees).toBe(4.33);
      expect(result.netAmount).toBe(29);
    });

    it("calcule correctement pour des montants réels de réservation", () => {
      // Exemple: réservation de 150 CHF avec 5% + 3 CHF
      const result = calculateFees(150, 5, 3);

      expect(result.commission).toBe(7.5);
      expect(result.totalFees).toBe(10.5);
      expect(result.netAmount).toBe(139.5);
      expect(result.commissionRate).toBe(5);
    });

    it("calcule correctement pour le parking jour (5%, pas de frais fixe)", () => {
      const result = calculateFees(15, 5, 0);

      expect(result.commission).toBe(0.75);
      expect(result.totalFees).toBe(0.75);
      expect(result.netAmount).toBe(14.25);
    });
  });

  describe("calculateTouristTax", () => {
    it("calcule la taxe de séjour pour 1 adulte, 1 nuit", () => {
      const result = calculateTouristTax(1, 1, 3);

      expect(result.enabled).toBe(true);
      expect(result.taxPerPerson).toBe(3);
      expect(result.numberOfAdults).toBe(1);
      expect(result.numberOfNights).toBe(1);
      expect(result.totalTax).toBe(3);
    });

    it("calcule la taxe de séjour pour plusieurs adultes", () => {
      const result = calculateTouristTax(2, 1, 3);

      expect(result.numberOfAdults).toBe(2);
      expect(result.totalTax).toBe(6); // 2 * 1 * 3
    });

    it("calcule la taxe de séjour pour plusieurs nuits", () => {
      const result = calculateTouristTax(1, 3, 3);

      expect(result.numberOfNights).toBe(3);
      expect(result.totalTax).toBe(9); // 1 * 3 * 3
    });

    it("calcule la taxe de séjour pour plusieurs adultes et plusieurs nuits", () => {
      const result = calculateTouristTax(2, 5, 3);

      expect(result.totalTax).toBe(30); // 2 * 5 * 3
    });

    it("retourne 0 si la taxe est désactivée", () => {
      const result = calculateTouristTax(2, 3, 3, false);

      expect(result.enabled).toBe(false);
      expect(result.totalTax).toBe(0);
    });

    it("retourne 0 si le nombre d'adultes est 0", () => {
      const result = calculateTouristTax(0, 3, 3);

      expect(result.totalTax).toBe(0);
    });

    it("retourne 0 si le nombre de nuits est 0", () => {
      const result = calculateTouristTax(2, 0, 3);

      expect(result.totalTax).toBe(0);
    });

    it("retourne 0 si la taxe par personne est 0", () => {
      const result = calculateTouristTax(2, 3, 0);

      expect(result.totalTax).toBe(0);
    });

    it("gère des valeurs négatives", () => {
      const result = calculateTouristTax(-2, 3, 3);

      expect(result.totalTax).toBe(0);
    });

    it("calcule avec un montant de taxe décimal", () => {
      const result = calculateTouristTax(2, 3, 2.5);

      expect(result.totalTax).toBe(15); // 2 * 3 * 2.5
    });

    it("simule un cas réel: couple pour 3 nuits à Genève (taxe 3.75 CHF)", () => {
      const result = calculateTouristTax(2, 3, 3.75);

      expect(result.totalTax).toBe(22.5); // 2 * 3 * 3.75
    });

    it("ne compte pas les enfants (comportement explicite)", () => {
      // Dans votre système, seuls les adultes (16+) paient la taxe
      const adults = 2;
      // Les enfants ne sont pas comptés dans le calcul
      const result = calculateTouristTax(adults, 2, 3);

      expect(result.totalTax).toBe(12); // Seulement 2 adultes * 2 nuits * 3 CHF
    });
  });

  describe("formatCHF", () => {
    it("formate correctement un montant en CHF", () => {
      expect(formatCHF(100)).toBe("100.00\u00a0CHF");
    });

    it("formate avec 2 décimales", () => {
      expect(formatCHF(50.5)).toBe("50.50\u00a0CHF");
      expect(formatCHF(10.1)).toBe("10.10\u00a0CHF");
    });

    it("formate les grands montants avec séparateurs", () => {
      // fr-CH utilise l'espace fine (U+202F) pour les milliers et l'espace insécable (U+00A0) avant CHF
      expect(formatCHF(1234.56)).toBe("1\u202f234.56\u00a0CHF");
      expect(formatCHF(10000)).toBe("10\u202f000.00\u00a0CHF");
    });

    it("gère les montants négatifs", () => {
      expect(formatCHF(-25.5)).toBe("-25.50\u00a0CHF");
    });

    it("gère zéro", () => {
      expect(formatCHF(0)).toBe("0.00\u00a0CHF");
    });
  });

  describe("formatPercentage", () => {
    it("formate correctement un pourcentage", () => {
      // fr-CH utilise la virgule comme séparateur décimal
      expect(formatPercentage(10)).toBe("10,0%");
      expect(formatPercentage(25)).toBe("25,0%");
    });

    it("formate avec une décimale", () => {
      // fr-CH utilise la virgule comme séparateur décimal
      expect(formatPercentage(5.5)).toBe("5,5%");
      expect(formatPercentage(12.75)).toBe("12,8%"); // Arrondi à 1 décimale
    });

    it("formate 0%", () => {
      expect(formatPercentage(0)).toBe("0,0%");
    });

    it("formate 100%", () => {
      expect(formatPercentage(100)).toBe("100,0%");
    });
  });

  describe("Cas d'usage réels combinés", () => {
    it("calcule un prix de réservation complet avec tous les frais", () => {
      // Prix de la chambre: 45.50 CHF
      const roomPrice = 45.5;

      // Options: +12.50 CHF
      const optionsTotal = 12.5;

      // 2 adultes, 1 nuit, taxe 3 CHF/personne/nuit
      const touristTax = calculateTouristTax(2, 1, 3);
      expect(touristTax.totalTax).toBe(6);

      // Sous-total avant frais de plateforme
      const subtotal = roomPrice + optionsTotal + touristTax.totalTax;
      expect(subtotal).toBe(64);

      // Frais de plateforme: 5% + 3 CHF
      const fees = calculateFees(subtotal, 5, 3);
      expect(fees.totalFees).toBe(6.2);
      expect(fees.netAmount).toBe(57.8); // Ce que reçoit l'hôte
    });

    it("calcule une réservation longue durée", () => {
      const roomPricePerNight = 50;
      const nights = 7;
      const roomTotal = roomPricePerNight * nights; // 350 CHF

      const touristTax = calculateTouristTax(2, nights, 3);
      expect(touristTax.totalTax).toBe(42); // 2 * 7 * 3

      const subtotal = roomTotal + touristTax.totalTax; // 392 CHF

      const fees = calculateFees(subtotal, 5, 3);
      expect(fees.commission).toBe(19.6);
      expect(fees.totalFees).toBe(22.6);
      expect(fees.netAmount).toBe(369.4);
    });

    it("calcule une réservation parking jour", () => {
      const parkingPrice = 15;

      // Pas de taxe de séjour pour le parking jour
      const touristTax = calculateTouristTax(0, 0, 3);
      expect(touristTax.totalTax).toBe(0);

      // Commission 5%, pas de frais fixe pour parking jour
      const fees = calculateFees(parkingPrice, 5, 0);
      expect(fees.commission).toBe(0.75);
      expect(fees.totalFees).toBe(0.75);
      expect(fees.netAmount).toBe(14.25);
    });

    it("simule une grande réservation familiale", () => {
      const roomPrice = 80;
      const optionsTotal = 30; // Petit déj + parking + extras
      const adults = 4;
      const nights = 3;

      const touristTax = calculateTouristTax(adults, nights, 3);
      expect(touristTax.totalTax).toBe(36); // 4 * 3 * 3

      const subtotal = roomPrice + optionsTotal + touristTax.totalTax;
      expect(subtotal).toBe(146);

      const fees = calculateFees(subtotal, 5, 3);
      expect(fees.totalFees).toBe(10.3);
      expect(fees.netAmount).toBe(135.7);
    });
  });

  describe("Précision et arrondis", () => {
    it("gère correctement les calculs avec beaucoup de décimales", () => {
      const result = calculateFees(99.99, 7.77, 2.22);

      expect(result.commission).toBe(7.77);
      expect(result.fixedFee).toBe(2.22);
      expect(result.totalFees).toBe(9.99);
      expect(result.netAmount).toBe(90);
    });

    it("évite les erreurs d'arrondi cumulatives", () => {
      // Tester plusieurs calculs successifs
      const fees1 = calculateFees(33.33, 10, 1);
      const fees2 = calculateFees(66.67, 10, 1);

      // Note: les arrondis indépendants peuvent créer des différences mineures
      // C'est un comportement attendu, pas un bug
      // fees1: 33.33 - (3.33 + 1) = 29.00
      // fees2: 66.67 - (6.67 + 1) = 59.00
      // Total: 29 + 59 = 88 (arrondis individuels)
      expect(fees1.netAmount + fees2.netAmount).toBeCloseTo(88, 2);
    });
  });
});
