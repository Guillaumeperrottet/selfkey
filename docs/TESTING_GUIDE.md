# Guide de Testing - SelfKey

> Documentation complète pour utiliser les tests Vitest dans l'application SelfKey

## 📋 Table des matières

1. [Introduction](#introduction)
2. [Installation et Configuration](#installation-et-configuration)
3. [Architecture des Tests](#architecture-des-tests)
4. [Commandes Disponibles](#commandes-disponibles)
5. [Écrire des Tests](#écrire-des-tests)
6. [Tests Unitaires](#tests-unitaires)
7. [Tests d'Intégration](#tests-dintégration)
8. [Tests de Composants](#tests-de-composants)
9. [Mocks et Helpers](#mocks-et-helpers)
10. [Couverture de Code](#couverture-de-code)
11. [Bonnes Pratiques](#bonnes-pratiques)
12. [Dépannage](#dépannage)

---

## Introduction

Ce projet utilise **Vitest** comme framework de test, optimisé pour Next.js 15 et React 19. Vitest offre :

- ⚡ **Performance** : 10x plus rapide que Jest
- 🔧 **Configuration simplifiée** : Compatibilité native avec TypeScript et ESM
- 🎯 **API familière** : Syntaxe similaire à Jest
- 🎨 **UI intégrée** : Interface graphique pour visualiser les tests
- 📊 **Coverage natif** : Rapports de couverture intégrés

### Pourquoi des tests ?

1. **Fiabilité** : Éviter les régressions lors des modifications
2. **Confiance** : Déployer en production sereinement
3. **Documentation** : Les tests documentent le comportement attendu
4. **Refactoring** : Modifier le code sans peur de tout casser
5. **Calculs financiers** : Vérifier la précision des montants (critique pour Stripe)

---

## Installation et Configuration

### Dépendances installées

```json
{
  "devDependencies": {
    "vitest": "^4.0.15",
    "@vitejs/plugin-react": "^5.1.2",
    "@vitest/ui": "^4.0.15",
    "happy-dom": "^20.0.11",
    "@testing-library/react": "^16.3.1",
    "@testing-library/jest-dom": "^6.9.1",
    "@testing-library/user-event": "^14.6.1",
    "msw": "^2.12.4"
  }
}
```

### Configuration Vitest

Le fichier [vitest.config.ts](../vitest.config.ts) est configuré avec :

- ✅ Support TypeScript et JSX
- ✅ Path aliases (@/...)
- ✅ Environnement happy-dom (plus rapide que jsdom)
- ✅ Setup automatique des tests
- ✅ Coverage avec seuils de qualité (70%)

---

## Architecture des Tests

```
selfkey/
├── vitest.config.ts           # Configuration Vitest
├── tests/
│   ├── setup.ts               # Setup global (mocks Next.js)
│   └── mocks/
│       ├── prisma.ts          # Mock Prisma Client
│       ├── stripe.ts          # Mock Stripe
│       ├── resend.ts          # Mock Resend (emails)
│       └── auth.ts            # Mock Better Auth
├── src/
│   ├── lib/
│   │   ├── pricing/
│   │   │   ├── money.ts
│   │   │   ├── money.test.ts          ✅ Tests unitaires
│   │   │   ├── options.ts
│   │   │   ├── options.test.ts        ✅ Tests unitaires
│   │   │   ├── fees.ts
│   │   │   └── fees.test.ts           ✅ Tests unitaires
│   │   └── booking/
│   │       ├── availability.ts
│   │       └── availability.test.ts   ✅ Tests unitaires
│   └── components/
│       └── components.test.tsx        ✅ Tests composants
```

---

## Commandes Disponibles

### Lancer les tests

```bash
# Mode watch (recommandé en développement)
pnpm test

# Lancer tous les tests une fois
pnpm test:run

# Interface graphique
pnpm test:ui

# Tests spécifiques
pnpm test money
pnpm test fees
pnpm test availability

# Tests avec coverage
pnpm test:coverage
```

### Mode Watch

Le mode watch (par défaut) relance automatiquement les tests quand vous modifiez un fichier :

```bash
pnpm test
```

**Raccourcis clavier en mode watch :**

- `a` : Lancer tous les tests
- `f` : Lancer uniquement les tests en échec
- `p` : Filtrer par nom de fichier
- `t` : Filtrer par nom de test
- `q` : Quitter

### Interface UI

Pour une expérience visuelle :

```bash
pnpm test:ui
```

Ouvre une interface web sur `http://localhost:51204` avec :

- 🎯 Vue d'ensemble des tests
- 📊 Statistiques de passage
- 🔍 Inspection détaillée
- ⚡ Relance en temps réel

---

## Écrire des Tests

### Structure de base

```typescript
import { describe, it, expect } from "vitest";

describe("Ma Fonctionnalité", () => {
  it("fait quelque chose", () => {
    const result = maFonction(input);
    expect(result).toBe(expected);
  });
});
```

### Matchers courants

```typescript
// Égalité stricte
expect(value).toBe(5);
expect(value).toBe("hello");

// Égalité profonde (objets/tableaux)
expect(object).toEqual({ a: 1, b: 2 });

// Vérifications booléennes
expect(value).toBeTruthy();
expect(value).toBeFalsy();
expect(value).toBeDefined();
expect(value).toBeUndefined();
expect(value).toBeNull();

// Nombres
expect(value).toBeGreaterThan(10);
expect(value).toBeLessThan(100);
expect(value).toBeCloseTo(0.3, 2); // Arrondi à 2 décimales

// Strings
expect(text).toContain("mot");
expect(text).toMatch(/regex/);

// Tableaux
expect(array).toHaveLength(3);
expect(array).toContain("item");

// Exceptions
expect(() => fn()).toThrow();
expect(() => fn()).toThrow("Message d'erreur");
```

---

## Tests Unitaires

### Calculs monétaires

Fichier : [src/lib/pricing/money.test.ts](../src/lib/pricing/money.test.ts)

**Exemple de test :**

```typescript
describe("addMoney", () => {
  it("évite les erreurs d'arrondi JavaScript", () => {
    // En JavaScript: 0.1 + 0.2 = 0.30000000000000004
    expect(addMoney(0.1, 0.2)).toBe(0.3);
  });

  it("additionne plusieurs montants", () => {
    expect(addMoney(10, 20, 30, 40)).toBe(100);
  });
});
```

**📊 Couverture : 94 tests**

### Options de prix

Fichier : [src/lib/pricing/options.test.ts](../src/lib/pricing/options.test.ts)

Tests pour le calcul des options de prix (select, radio, checkbox).

**Exemple :**

```typescript
it("calcule le prix avec plusieurs checkboxes", () => {
  const selectedOptions = {
    "option-3": ["value-3-1", "value-3-2"], // Draps + Serviettes
  };

  const total = calculatePricingOptionsTotal(
    selectedOptions,
    mockPricingOptions
  );
  expect(total).toBe(8);
});
```

**📊 Couverture : 47 tests**

### Frais et commissions

Fichier : [src/lib/pricing/fees.test.ts](../src/lib/pricing/fees.test.ts)

Tests pour les calculs de frais de plateforme et taxe de séjour.

**Exemple :**

```typescript
it("calcule les frais avec commission et frais fixe", () => {
  const result = calculateFees(100, 5, 3);

  expect(result.commission).toBe(5);
  expect(result.fixedFee).toBe(3);
  expect(result.totalFees).toBe(8);
  expect(result.netAmount).toBe(92);
});
```

**📊 Couverture : 38 tests**

### Disponibilité

Fichier : [src/lib/booking/availability.test.ts](../src/lib/booking/availability.test.ts)

Tests pour la validation des dates et calcul de durée.

**Exemple :**

```typescript
it("calcule correctement la durée pour 1 nuit", () => {
  const checkIn = new Date("2025-01-10");
  const checkOut = new Date("2025-01-11");

  expect(calculateStayDuration(checkIn, checkOut)).toBe(1);
});
```

**📊 Couverture : 35 tests**

---

## Tests d'Intégration

Les tests d'intégration vérifient l'interaction entre plusieurs modules (ex: API routes + base de données).

### Structure

```typescript
import { describe, it, expect, beforeEach, vi } from "vitest";
import { mockPrisma } from "@/tests/mocks/prisma";

describe("API Bookings", () => {
  beforeEach(() => {
    // Réinitialiser les mocks avant chaque test
    vi.clearAllMocks();
  });

  it("crée une réservation valide", async () => {
    mockPrisma.booking.create.mockResolvedValue({
      id: "booking-123",
      bookingNumber: "BK-001",
      // ...
    });

    // Test de l'API
    const response = await POST(mockRequest, { params: { hotel: "test" } });

    expect(response.status).toBe(200);
    expect(mockPrisma.booking.create).toHaveBeenCalled();
  });
});
```

---

## Tests de Composants

Fichier : [src/components/components.test.tsx](../src/components/components.test.tsx)

### Exemple complet

```typescript
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BookingForm } from "./BookingForm";

describe("BookingForm", () => {
  it("affiche les champs requis", () => {
    render(<BookingForm />);

    expect(screen.getByLabelText(/prénom/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/nom/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });

  it("valide les champs avant soumission", async () => {
    const user = userEvent.setup();
    render(<BookingForm />);

    const submitButton = screen.getByRole("button", { name: /réserver/i });
    await user.click(submitButton);

    expect(screen.getByText(/champ requis/i)).toBeInTheDocument();
  });

  it("soumet le formulaire avec des données valides", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<BookingForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/prénom/i), "Jean");
    await user.type(screen.getByLabelText(/nom/i), "Dupont");
    await user.type(screen.getByLabelText(/email/i), "jean@example.com");

    await user.click(screen.getByRole("button", { name: /réserver/i }));

    expect(onSubmit).toHaveBeenCalledWith({
      firstName: "Jean",
      lastName: "Dupont",
      email: "jean@example.com",
    });
  });
});
```

### Queries utiles

```typescript
// Par rôle (accessible)
screen.getByRole("button", { name: /soumettre/i });
screen.getByRole("textbox", { name: /email/i });

// Par label
screen.getByLabelText(/nom/i);

// Par texte
screen.getByText(/bienvenue/i);

// Par placeholder
screen.getByPlaceholderText(/entrez votre email/i);

// Par test ID (à éviter sauf nécessité)
screen.getByTestId("submit-button");
```

---

## Mocks et Helpers

### Prisma Client Mock

Fichier : [tests/mocks/prisma.ts](../tests/mocks/prisma.ts)

```typescript
import { mockPrisma } from "@/tests/mocks/prisma";

// Mock une réponse
mockPrisma.establishment.findUnique.mockResolvedValue({
  id: "est-1",
  slug: "test-hotel",
  commissionRate: 5,
  fixedFee: 3,
});

// Vérifier un appel
expect(mockPrisma.booking.create).toHaveBeenCalledWith({
  data: expect.objectContaining({
    clientEmail: "test@example.com",
  }),
});
```

### Stripe Mock

Fichier : [tests/mocks/stripe.ts](../tests/mocks/stripe.ts)

```typescript
import { mockStripe } from "@/tests/mocks/stripe";

mockStripe.paymentIntents.create.mockResolvedValue({
  id: "pi_test_123",
  client_secret: "pi_test_123_secret_abc",
  amount: 10000,
  currency: "chf",
});
```

### Auth Mock

Fichier : [tests/mocks/auth.ts](../tests/mocks/auth.ts)

```typescript
import { mockAuth, createMockSession } from "@/tests/mocks/auth";

mockAuth.api.getSession.mockResolvedValue(
  createMockSession("user-123", "test@example.com")
);
```

---

## Couverture de Code

### Générer un rapport

```bash
pnpm test:coverage
```

Génère un rapport dans `coverage/` avec :

- **coverage/index.html** : Rapport HTML interactif
- **coverage/lcov.info** : Pour intégrations CI/CD
- Console : Résumé des statistiques

### Objectifs de couverture

Configuré dans [vitest.config.ts](../vitest.config.ts) :

```typescript
coverage: {
  thresholds: {
    lines: 70,       // 70% des lignes
    functions: 70,   // 70% des fonctions
    branches: 70,    // 70% des branches
    statements: 70,  // 70% des statements
  },
}
```

### Interpréter le rapport

```
File                | % Stmts | % Branch | % Funcs | % Lines
--------------------|---------|----------|---------|--------
pricing/money.ts    |   95.45 |    88.89 |  100.00 |   95.45
pricing/fees.ts     |   78.26 |    75.00 |   85.71 |   78.26
pricing/options.ts  |   88.89 |    66.67 |  100.00 |   88.89
```

**Légende :**

- **Stmts** : Pourcentage d'instructions exécutées
- **Branch** : Pourcentage de branches (if/else) testées
- **Funcs** : Pourcentage de fonctions appelées
- **Lines** : Pourcentage de lignes exécutées

---

## Bonnes Pratiques

### ✅ À FAIRE

1. **Tests courts et ciblés**

   ```typescript
   // ✅ BON
   it("additionne deux nombres", () => {
     expect(add(2, 3)).toBe(5);
   });

   // ❌ MAUVAIS
   it("teste toutes les fonctionnalités du calculateur", () => {
     // 100 lignes de tests...
   });
   ```

2. **Noms descriptifs**

   ```typescript
   // ✅ BON
   it("rejette une date d'arrivée dans le passé", () => {});

   // ❌ MAUVAIS
   it("test 1", () => {});
   ```

3. **AAA Pattern** (Arrange, Act, Assert)

   ```typescript
   it("calcule correctement les frais", () => {
     // Arrange (préparer)
     const amount = 100;
     const rate = 5;
     const fixedFee = 3;

     // Act (agir)
     const result = calculateFees(amount, rate, fixedFee);

     // Assert (vérifier)
     expect(result.totalFees).toBe(8);
   });
   ```

4. **Tester les cas limites**

   ```typescript
   describe("calculateStayDuration", () => {
     it("gère 1 nuit", () => {});
     it("gère plusieurs nuits", () => {});
     it("gère les durées très longues", () => {});
     it("gère les dates identiques", () => {});
   });
   ```

5. **Éviter les tests fragiles**

   ```typescript
   // ❌ MAUVAIS (dépend de la date actuelle)
   const today = new Date();

   // ✅ BON (date fixe)
   const testDate = new Date("2025-01-15");
   ```

### ❌ À ÉVITER

1. **Tests trop génériques**
2. **Dépendances entre tests** (chaque test doit être indépendant)
3. **Tests qui testent l'implémentation** (tester le comportement, pas le code)
4. **Magic numbers** sans contexte
5. **Tests dupliqués**

### 🎯 Tests critiques prioritaires

Pour SelfKey, testez en priorité :

1. **Calculs monétaires** (money.ts) - Erreurs = pertes financières
2. **Commissions Stripe** (fees.ts) - Impact direct sur les paiements
3. **Disponibilité** (availability.ts) - Éviter les doubles réservations
4. **Validations** - Données utilisateur

---

## Dépannage

### Problème : Tests qui échouent après modification

```bash
# Relancer les tests en mode watch
pnpm test

# Ou spécifiquement
pnpm test money
```

### Problème : Erreur "Cannot find module"

Vérifiez les path aliases dans `vitest.config.ts` :

```typescript
resolve: {
  alias: {
    "@": path.resolve(__dirname, "./src"),
  },
},
```

### Problème : Mocks ne fonctionnent pas

Assurez-vous d'importer les mocks **avant** le code testé :

```typescript
import { mockPrisma } from "@/tests/mocks/prisma";
import { myFunction } from "@/lib/myModule"; // Après le mock
```

### Problème : Tests lents

1. Utilisez le mode watch : `pnpm test`
2. Filtrez les tests : `pnpm test money`
3. Vérifiez les timeouts dans `vitest.config.ts`

### Problème : Coverage ne se génère pas

```bash
# Installer les dépendances de coverage
pnpm add -D @vitest/coverage-v8

# Relancer
pnpm test:coverage
```

---

## Ressources Utiles

### Documentation officielle

- [Vitest](https://vitest.dev/) - Documentation complète
- [Testing Library](https://testing-library.com/) - Guide des bonnes pratiques
- [MSW](https://mswjs.io/) - Mock Service Worker pour API mocking

### Exemples de tests dans le projet

- [money.test.ts](../src/lib/pricing/money.test.ts) - Calculs monétaires
- [fees.test.ts](../src/lib/pricing/fees.test.ts) - Frais et commissions
- [options.test.ts](../src/lib/pricing/options.test.ts) - Options de prix
- [availability.test.ts](../src/lib/booking/availability.test.ts) - Disponibilité

### Commandes rapides

```bash
# Tests en continu pendant le dev
pnpm test

# Interface graphique
pnpm test:ui

# Tous les tests une fois
pnpm test:run

# Avec couverture
pnpm test:coverage

# Tests spécifiques
pnpm test money
pnpm test availability
```

---

## Statistiques

### 📊 Couverture actuelle

- **Tests unitaires** : 214 tests
- **Modules testés** : 4/4 modules critiques
- **Couverture** : ~85% des fonctions critiques

### 🎯 Modules couverts

| Module                  | Tests | Statut |
| ----------------------- | ----- | ------ |
| pricing/money.ts        | 94    | ✅     |
| pricing/options.ts      | 47    | ✅     |
| pricing/fees.ts         | 38    | ✅     |
| booking/availability.ts | 35    | ✅     |

---

## Support

Pour toute question ou problème :

1. Consultez ce guide
2. Vérifiez les exemples de tests existants
3. Consultez la [documentation Vitest](https://vitest.dev/)

**Bon testing ! 🚀**
