import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  calculatePricingOptionsTotal,
  fetchPricingOptions,
} from "@/lib/pricing/options";
import type { PricingOption } from "@/lib/pricing/options";

describe("Pricing Options Calculator", () => {
  const mockPricingOptions: PricingOption[] = [
    {
      id: "option-1",
      name: "Petit déjeuner",
      description: "Petit déjeuner continental",
      type: "select",
      isRequired: false,
      isActive: true,
      displayOrder: 1,
      values: [
        {
          id: "value-1-1",
          label: "Non",
          priceModifier: 0,
          isDefault: true,
          displayOrder: 1,
        },
        {
          id: "value-1-2",
          label: "Oui (+15 CHF)",
          priceModifier: 15,
          isDefault: false,
          displayOrder: 2,
        },
      ],
    },
    {
      id: "option-2",
      name: "Parking",
      description: "Place de parking",
      type: "radio",
      isRequired: true,
      isActive: true,
      displayOrder: 2,
      values: [
        {
          id: "value-2-1",
          label: "Pas de parking",
          priceModifier: 0,
          isDefault: true,
          displayOrder: 1,
        },
        {
          id: "value-2-2",
          label: "Parking standard (+10 CHF)",
          priceModifier: 10,
          isDefault: false,
          displayOrder: 2,
        },
        {
          id: "value-2-3",
          label: "Parking couvert (+20 CHF)",
          priceModifier: 20,
          isDefault: false,
          displayOrder: 3,
        },
      ],
    },
    {
      id: "option-3",
      name: "Équipements supplémentaires",
      description: "Équipements à ajouter",
      type: "checkbox",
      isRequired: false,
      isActive: true,
      displayOrder: 3,
      values: [
        {
          id: "value-3-1",
          label: "Draps (+5 CHF)",
          priceModifier: 5,
          isDefault: false,
          displayOrder: 1,
        },
        {
          id: "value-3-2",
          label: "Serviettes (+3 CHF)",
          priceModifier: 3,
          isDefault: false,
          displayOrder: 2,
        },
        {
          id: "value-3-3",
          label: "Kit de bienvenue (+8 CHF)",
          priceModifier: 8,
          isDefault: false,
          displayOrder: 3,
        },
      ],
    },
  ];

  describe("Options de type select", () => {
    it("calcule le prix avec une option select (valeur par défaut)", () => {
      const selectedOptions = {
        "option-1": "value-1-1", // Non (0 CHF)
      };

      const total = calculatePricingOptionsTotal(
        selectedOptions,
        mockPricingOptions
      );
      expect(total).toBe(0);
    });

    it("calcule le prix avec une option select (avec surcoût)", () => {
      const selectedOptions = {
        "option-1": "value-1-2", // Oui (+15 CHF)
      };

      const total = calculatePricingOptionsTotal(
        selectedOptions,
        mockPricingOptions
      );
      expect(total).toBe(15);
    });
  });

  describe("Options de type radio", () => {
    it("calcule le prix avec une option radio (valeur par défaut)", () => {
      const selectedOptions = {
        "option-2": "value-2-1", // Pas de parking (0 CHF)
      };

      const total = calculatePricingOptionsTotal(
        selectedOptions,
        mockPricingOptions
      );
      expect(total).toBe(0);
    });

    it("calcule le prix avec une option radio (parking standard)", () => {
      const selectedOptions = {
        "option-2": "value-2-2", // Parking standard (+10 CHF)
      };

      const total = calculatePricingOptionsTotal(
        selectedOptions,
        mockPricingOptions
      );
      expect(total).toBe(10);
    });

    it("calcule le prix avec une option radio (parking couvert)", () => {
      const selectedOptions = {
        "option-2": "value-2-3", // Parking couvert (+20 CHF)
      };

      const total = calculatePricingOptionsTotal(
        selectedOptions,
        mockPricingOptions
      );
      expect(total).toBe(20);
    });
  });

  describe("Options de type checkbox", () => {
    it("calcule le prix sans checkbox sélectionnée", () => {
      const selectedOptions = {
        "option-3": [],
      };

      const total = calculatePricingOptionsTotal(
        selectedOptions,
        mockPricingOptions
      );
      expect(total).toBe(0);
    });

    it("calcule le prix avec une seule checkbox", () => {
      const selectedOptions = {
        "option-3": ["value-3-1"], // Draps (+5 CHF)
      };

      const total = calculatePricingOptionsTotal(
        selectedOptions,
        mockPricingOptions
      );
      expect(total).toBe(5);
    });

    it("calcule le prix avec plusieurs checkboxes", () => {
      const selectedOptions = {
        "option-3": ["value-3-1", "value-3-2"], // Draps + Serviettes (8 CHF)
      };

      const total = calculatePricingOptionsTotal(
        selectedOptions,
        mockPricingOptions
      );
      expect(total).toBe(8);
    });

    it("calcule le prix avec toutes les checkboxes", () => {
      const selectedOptions = {
        "option-3": ["value-3-1", "value-3-2", "value-3-3"], // Tout (16 CHF)
      };

      const total = calculatePricingOptionsTotal(
        selectedOptions,
        mockPricingOptions
      );
      expect(total).toBe(16);
    });
  });

  describe("Combinaisons d'options", () => {
    it("calcule le prix avec plusieurs types d'options", () => {
      const selectedOptions = {
        "option-1": "value-1-2", // Petit déj (+15 CHF)
        "option-2": "value-2-2", // Parking standard (+10 CHF)
        "option-3": ["value-3-1"], // Draps (+5 CHF)
      };

      const total = calculatePricingOptionsTotal(
        selectedOptions,
        mockPricingOptions
      );
      expect(total).toBe(30);
    });

    it("calcule le prix avec toutes les options maximales", () => {
      const selectedOptions = {
        "option-1": "value-1-2", // Petit déj (+15 CHF)
        "option-2": "value-2-3", // Parking couvert (+20 CHF)
        "option-3": ["value-3-1", "value-3-2", "value-3-3"], // Tout (+16 CHF)
      };

      const total = calculatePricingOptionsTotal(
        selectedOptions,
        mockPricingOptions
      );
      expect(total).toBe(51);
    });

    it("calcule le prix avec seulement les valeurs par défaut", () => {
      const selectedOptions = {
        "option-1": "value-1-1", // Non (0 CHF)
        "option-2": "value-2-1", // Pas de parking (0 CHF)
        "option-3": [], // Rien (0 CHF)
      };

      const total = calculatePricingOptionsTotal(
        selectedOptions,
        mockPricingOptions
      );
      expect(total).toBe(0);
    });
  });

  describe("Cas limites", () => {
    it("gère une option inexistante", () => {
      const selectedOptions = {
        "option-inexistante": "value-1",
      };

      const total = calculatePricingOptionsTotal(
        selectedOptions,
        mockPricingOptions
      );
      expect(total).toBe(0);
    });

    it("gère une valeur inexistante pour une option", () => {
      const selectedOptions = {
        "option-1": "value-inexistante",
      };

      const total = calculatePricingOptionsTotal(
        selectedOptions,
        mockPricingOptions
      );
      expect(total).toBe(0);
    });

    it("gère un objet de sélection vide", () => {
      const selectedOptions = {};

      const total = calculatePricingOptionsTotal(
        selectedOptions,
        mockPricingOptions
      );
      expect(total).toBe(0);
    });

    it("gère une liste d'options vide", () => {
      const selectedOptions = {
        "option-1": "value-1-2",
      };

      const total = calculatePricingOptionsTotal(selectedOptions, []);
      expect(total).toBe(0);
    });

    it("gère des checkboxes avec des valeurs invalides", () => {
      const selectedOptions = {
        "option-3": ["value-3-1", "value-inexistante", "value-3-2"],
      };

      const total = calculatePricingOptionsTotal(
        selectedOptions,
        mockPricingOptions
      );
      // Seulement les valeurs valides sont comptées (5 + 3)
      expect(total).toBe(8);
    });
  });

  describe("Cas réels de l'application", () => {
    it("simule une réservation typique avec petit déjeuner et parking", () => {
      const selectedOptions = {
        "option-1": "value-1-2", // Petit déj (+15 CHF)
        "option-2": "value-2-2", // Parking (+10 CHF)
        "option-3": [], // Pas d'équipement
      };

      const total = calculatePricingOptionsTotal(
        selectedOptions,
        mockPricingOptions
      );
      expect(total).toBe(25);
    });

    it("simule une réservation premium complète", () => {
      const selectedOptions = {
        "option-1": "value-1-2", // Petit déj (+15 CHF)
        "option-2": "value-2-3", // Parking couvert (+20 CHF)
        "option-3": ["value-3-1", "value-3-2", "value-3-3"], // Tout (+16 CHF)
      };

      const total = calculatePricingOptionsTotal(
        selectedOptions,
        mockPricingOptions
      );
      expect(total).toBe(51);
    });

    it("simule une réservation basique sans options", () => {
      const selectedOptions = {
        "option-1": "value-1-1",
        "option-2": "value-2-1",
        "option-3": [],
      };

      const total = calculatePricingOptionsTotal(
        selectedOptions,
        mockPricingOptions
      );
      expect(total).toBe(0);
    });
  });

  describe("Précision des calculs", () => {
    it("gère correctement les montants décimaux", () => {
      const optionsWithDecimals: PricingOption[] = [
        {
          id: "decimal-option",
          name: "Option avec décimales",
          description: null,
          type: "select",
          isRequired: false,
          isActive: true,
          displayOrder: 1,
          values: [
            {
              id: "decimal-1",
              label: "Option 1",
              priceModifier: 5.5,
              isDefault: false,
              displayOrder: 1,
            },
            {
              id: "decimal-2",
              label: "Option 2",
              priceModifier: 3.25,
              isDefault: false,
              displayOrder: 2,
            },
          ],
        },
      ];

      const selectedOptions = {
        "decimal-option": "decimal-1",
      };

      const total = calculatePricingOptionsTotal(
        selectedOptions,
        optionsWithDecimals
      );
      expect(total).toBe(5.5);
    });

    it("additionne correctement plusieurs montants décimaux", () => {
      const optionsWithDecimals: PricingOption[] = [
        {
          id: "option-a",
          name: "Option A",
          description: null,
          type: "checkbox",
          isRequired: false,
          isActive: true,
          displayOrder: 1,
          values: [
            {
              id: "val-a1",
              label: "A1",
              priceModifier: 5.5,
              isDefault: false,
              displayOrder: 1,
            },
            {
              id: "val-a2",
              label: "A2",
              priceModifier: 3.25,
              isDefault: false,
              displayOrder: 2,
            },
            {
              id: "val-a3",
              label: "A3",
              priceModifier: 2.75,
              isDefault: false,
              displayOrder: 3,
            },
          ],
        },
      ];

      const selectedOptions = {
        "option-a": ["val-a1", "val-a2", "val-a3"],
      };

      const total = calculatePricingOptionsTotal(
        selectedOptions,
        optionsWithDecimals
      );
      expect(total).toBe(11.5);
    });
  });

  describe("fetchPricingOptions", () => {
    beforeEach(() => {
      global.fetch = vi.fn();
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("récupère les options de prix depuis l'API", async () => {
      const mockResponse = {
        pricingOptions: [
          {
            id: "opt-1",
            name: "Test Option",
            description: "Description",
            type: "select" as const,
            isRequired: false,
            isActive: true,
            displayOrder: 1,
            values: [],
          },
        ],
      };

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await fetchPricingOptions("test-hotel");

      expect(global.fetch).toHaveBeenCalledWith(
        "/api/establishments/test-hotel/pricing-options"
      );
      expect(result).toEqual(mockResponse.pricingOptions);
    });

    it("retourne un tableau vide si la réponse est vide", async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({}),
      });

      const result = await fetchPricingOptions("test-hotel");

      expect(result).toEqual([]);
    });

    it("retourne un tableau vide si la requête échoue", async () => {
      (global.fetch as any).mockResolvedValue({
        ok: false,
        status: 404,
      });

      const result = await fetchPricingOptions("test-hotel");

      expect(result).toEqual([]);
    });

    it("gère les erreurs réseau", async () => {
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      (global.fetch as any).mockRejectedValue(new Error("Network error"));

      const result = await fetchPricingOptions("test-hotel");

      expect(result).toEqual([]);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Erreur lors du chargement des options de prix:",
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });

    it("gère les réponses JSON invalides", async () => {
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => {
          throw new Error("Invalid JSON");
        },
      });

      const result = await fetchPricingOptions("test-hotel");

      expect(result).toEqual([]);
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it("construit la bonne URL avec le slug de l'hôtel", async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ pricingOptions: [] }),
      });

      await fetchPricingOptions("mon-camping-geneve");

      expect(global.fetch).toHaveBeenCalledWith(
        "/api/establishments/mon-camping-geneve/pricing-options"
      );
    });

    it("retourne plusieurs options correctement structurées", async () => {
      const mockResponse = {
        pricingOptions: [
          {
            id: "opt-1",
            name: "Option 1",
            description: null,
            type: "select" as const,
            isRequired: true,
            isActive: true,
            displayOrder: 1,
            values: [
              {
                id: "val-1",
                label: "Value 1",
                priceModifier: 10,
                isDefault: true,
                displayOrder: 1,
              },
            ],
          },
          {
            id: "opt-2",
            name: "Option 2",
            description: "Description 2",
            type: "checkbox" as const,
            isRequired: false,
            isActive: true,
            displayOrder: 2,
            values: [],
          },
        ],
      };

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await fetchPricingOptions("test-hotel");

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("opt-1");
      expect(result[1].id).toBe("opt-2");
    });
  });
});
