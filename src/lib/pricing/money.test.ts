import { describe, it, expect } from "vitest";
import {
  toRappen,
  fromRappen,
  addMoney,
  multiplyMoney,
  percentageOf,
  calculateCommission,
  formatCHF,
  isValidMoneyAmount,
  fixRounding,
} from "@/lib/pricing/money";

describe("Money Utils - Conversions", () => {
  describe("toRappen", () => {
    it("convertit correctement des CHF en centimes", () => {
      expect(toRappen(1)).toBe(100);
      expect(toRappen(10.5)).toBe(1050);
      expect(toRappen(123.45)).toBe(12345);
      expect(toRappen(0.01)).toBe(1);
    });

    it("gère les montants négatifs", () => {
      expect(toRappen(-5.5)).toBe(-550);
    });

    it("arrondit les fractions de centimes", () => {
      expect(toRappen(1.234)).toBe(123);
      expect(toRappen(1.235)).toBe(124);
    });
  });

  describe("fromRappen", () => {
    it("convertit correctement des centimes en CHF", () => {
      expect(fromRappen(100)).toBe(1);
      expect(fromRappen(1050)).toBe(10.5);
      expect(fromRappen(12345)).toBe(123.45);
      expect(fromRappen(1)).toBe(0.01);
    });

    it("gère les montants négatifs", () => {
      expect(fromRappen(-550)).toBe(-5.5);
    });

    it("gère zéro", () => {
      expect(fromRappen(0)).toBe(0);
    });
  });
});

describe("Money Utils - Opérations", () => {
  describe("addMoney", () => {
    it("additionne deux montants correctement", () => {
      expect(addMoney(10.5, 20.3)).toBe(30.8);
    });

    it("additionne plusieurs montants", () => {
      expect(addMoney(10, 20, 30, 40)).toBe(100);
    });

    it("évite les erreurs d'arrondi JavaScript", () => {
      // En JavaScript: 0.1 + 0.2 = 0.30000000000000004
      expect(addMoney(0.1, 0.2)).toBe(0.3);
    });

    it("additionne des montants avec des décimales complexes", () => {
      expect(addMoney(19.99, 5.01, 3.5)).toBe(28.5);
    });

    it("gère un seul montant", () => {
      expect(addMoney(42)).toBe(42);
    });

    it("gère un tableau vide", () => {
      expect(addMoney()).toBe(0);
    });

    it("gère les montants négatifs", () => {
      expect(addMoney(100, -25, -10)).toBe(65);
    });
  });

  describe("multiplyMoney", () => {
    it("multiplie correctement un montant", () => {
      expect(multiplyMoney(10, 2)).toBe(20);
      expect(multiplyMoney(15.5, 3)).toBe(46.5);
    });

    it("multiplie par un facteur décimal", () => {
      expect(multiplyMoney(100, 0.5)).toBe(50);
      expect(multiplyMoney(33.33, 1.5)).toBe(50);
    });

    it("évite les erreurs d'arrondi JavaScript", () => {
      // En JavaScript: 0.1 * 3 = 0.30000000000000004
      expect(multiplyMoney(0.1, 3)).toBe(0.3);
    });

    it("multiplie par zéro", () => {
      expect(multiplyMoney(100, 0)).toBe(0);
    });

    it("gère les valeurs négatives", () => {
      expect(multiplyMoney(10, -2)).toBe(-20);
      expect(multiplyMoney(-10, 2)).toBe(-20);
    });
  });

  describe("percentageOf", () => {
    it("calcule correctement un pourcentage", () => {
      expect(percentageOf(100, 10)).toBe(10);
      expect(percentageOf(200, 25)).toBe(50);
    });

    it("calcule des pourcentages décimaux", () => {
      expect(percentageOf(100, 5.5)).toBe(5.5);
    });

    it("évite les erreurs d'arrondi", () => {
      expect(percentageOf(33.33, 30)).toBe(10);
    });

    it("gère 0%", () => {
      expect(percentageOf(100, 0)).toBe(0);
    });

    it("gère 100%", () => {
      expect(percentageOf(50, 100)).toBe(50);
    });

    it("calcule des pourcentages supérieurs à 100%", () => {
      expect(percentageOf(50, 200)).toBe(100);
    });
  });
});

describe("Money Utils - Commission", () => {
  describe("calculateCommission", () => {
    it("calcule correctement les commissions", () => {
      const result = calculateCommission(100, 10, 3);

      expect(result.originalAmount).toBe(100);
      expect(result.commission).toBe(10);
      expect(result.fixedFee).toBe(3);
      expect(result.totalCommission).toBe(13);
      expect(result.netAmount).toBe(87);
    });

    it("calcule les commissions avec taux décimal", () => {
      const result = calculateCommission(200, 5.5, 2);

      expect(result.originalAmount).toBe(200);
      expect(result.commission).toBe(11);
      expect(result.fixedFee).toBe(2);
      expect(result.totalCommission).toBe(13);
      expect(result.netAmount).toBe(187);
    });

    it("retourne les valeurs en centimes pour Stripe", () => {
      const result = calculateCommission(100, 10, 3);

      expect(result.amountRappen).toBe(10000);
      expect(result.commissionRappen).toBe(1300);
    });

    it("gère une commission de 0%", () => {
      const result = calculateCommission(100, 0, 5);

      expect(result.commission).toBe(0);
      expect(result.totalCommission).toBe(5);
      expect(result.netAmount).toBe(95);
    });

    it("gère un frais fixe de 0", () => {
      const result = calculateCommission(100, 10, 0);

      expect(result.fixedFee).toBe(0);
      expect(result.totalCommission).toBe(10);
      expect(result.netAmount).toBe(90);
    });

    it("ne retourne pas de montant négatif", () => {
      const result = calculateCommission(5, 50, 10);

      expect(result.totalCommission).toBe(12.5);
      expect(result.netAmount).toBe(0); // Ne peut pas être négatif
    });

    it("calcule correctement pour les prix réels de l'application", () => {
      // Exemple: réservation de 150 CHF avec 5% + 3 CHF
      const result = calculateCommission(150, 5, 3);

      expect(result.commission).toBe(7.5);
      expect(result.totalCommission).toBe(10.5);
      expect(result.netAmount).toBe(139.5);
    });
  });
});

describe("Money Utils - Formatage", () => {
  describe("formatCHF", () => {
    it("formate correctement en CHF", () => {
      expect(formatCHF(100)).toBe("100.00\u00a0CHF");
      expect(formatCHF(50.5)).toBe("50.50\u00a0CHF");
    });

    it("affiche toujours 2 décimales", () => {
      expect(formatCHF(10)).toBe("10.00\u00a0CHF");
      expect(formatCHF(10.1)).toBe("10.10\u00a0CHF");
    });

    it("gère les montants négatifs", () => {
      expect(formatCHF(-25.5)).toBe("-25.50\u00a0CHF");
    });

    it("formate les grands montants", () => {
      // fr-CH utilise l'espace fine (U+202F) pour les milliers et l'espace insécable (U+00A0) avant CHF
      expect(formatCHF(1234.56)).toBe("1\u202f234.56\u00a0CHF");
      expect(formatCHF(1000000)).toBe("1\u202f000\u202f000.00\u00a0CHF");
    });
  });
});

describe("Money Utils - Validation", () => {
  describe("isValidMoneyAmount", () => {
    it("valide les montants corrects", () => {
      expect(isValidMoneyAmount(10.5)).toBe(true);
      expect(isValidMoneyAmount(100)).toBe(true);
      expect(isValidMoneyAmount(0.01)).toBe(true);
    });

    it("détecte les montants avec trop de décimales", () => {
      expect(isValidMoneyAmount(10.123)).toBe(false);
      expect(isValidMoneyAmount(0.001)).toBe(false);
    });

    it("gère les erreurs d'arrondi JavaScript", () => {
      const jsError = 0.1 + 0.2; // 0.30000000000000004
      expect(isValidMoneyAmount(jsError)).toBe(true); // Tolérance
    });
  });

  describe("fixRounding", () => {
    it("corrige les erreurs d'arrondi JavaScript", () => {
      const jsError = 0.1 + 0.2; // 0.30000000000000004
      expect(fixRounding(jsError)).toBe(0.3);
    });

    it("conserve les montants déjà corrects", () => {
      expect(fixRounding(10.5)).toBe(10.5);
      expect(fixRounding(100)).toBe(100);
    });

    it("arrondit à 2 décimales", () => {
      expect(fixRounding(10.123)).toBe(10.12);
      expect(fixRounding(10.126)).toBe(10.13);
    });
  });
});

describe("Money Utils - Cas réels", () => {
  it("calcule correctement un prix de réservation complet", () => {
    const roomPrice = 45.5;
    const optionsTotal = 12.5;
    const touristTax = 6; // 2 adultes * 1 nuit * 3 CHF

    const subtotal = addMoney(roomPrice, optionsTotal, touristTax);
    expect(subtotal).toBe(64);

    const commission = calculateCommission(subtotal, 5, 3);
    expect(commission.totalCommission).toBe(6.2);
    expect(commission.netAmount).toBe(57.8);
  });

  it("gère les calculs de parking jour", () => {
    const parkingPrice = 15;
    const commission = calculateCommission(parkingPrice, 5, 0); // Pas de frais fixe

    expect(commission.commission).toBe(0.75);
    expect(commission.totalCommission).toBe(0.75);
    expect(commission.netAmount).toBe(14.25);
  });

  it("calcule des options de prix multiples", () => {
    const option1 = 5.5;
    const option2 = 8.0;
    const option3 = 3.5;

    const total = addMoney(option1, option2, option3);
    expect(total).toBe(17);
  });
});
