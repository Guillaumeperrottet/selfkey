import { describe, it, expect } from "vitest";
import {
  calculateFees,
  calculateTouristTax,
  formatCHF,
  formatPercentage,
} from "@/lib/pricing/fees";

describe("Fee Calculator", () => {
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
