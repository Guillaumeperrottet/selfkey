# 🔍 Guide de Configuration Sentry

Ce guide vous explique comment configurer Sentry pour capturer tous les bugs et erreurs de votre application SelfKey.

## 📋 Table des matières

1. [Créer un compte Sentry](#1-créer-un-compte-sentry)
2. [Créer un projet](#2-créer-un-projet)
3. [Récupérer les clés](#3-récupérer-les-clés)
4. [Configurer les variables d'environnement](#4-configurer-les-variables-denvironnement)
5. [Tester en local](#5-tester-en-local)
6. [Déployer en production](#6-déployer-en-production)
7. [Utiliser les helpers](#7-utiliser-les-helpers)
8. [Consulter les erreurs](#8-consulter-les-erreurs)

---

## 1. Créer un compte Sentry

1. Allez sur **https://sentry.io/signup/**
2. Créez un compte (vous pouvez utiliser Google ou GitHub)
3. Choisissez le **plan gratuit** (5,000 événements/mois)
4. Confirmez votre email

---

## 2. Créer un projet

1. Dans le dashboard Sentry, cliquez sur **"Create Project"**
2. Sélectionnez la plateforme : **Next.js**
3. Nommez votre projet : `selfkey` (ou le nom que vous voulez)
4. Choisissez l'équipe (laissez par défaut si c'est votre premier projet)
5. Cliquez sur **"Create Project"**

---

## 3. Récupérer les clés

### A. DSN (Data Source Name)

Après avoir créé le projet, vous verrez une page avec le **DSN**. Il ressemble à :

```
https://abc123def456@o123456.ingest.sentry.io/7890123
```

**Copiez-le**, vous en aurez besoin !

Sinon, pour le retrouver plus tard :

1. Allez dans **Settings** (⚙️ en haut)
2. Cliquez sur **Projects** dans la sidebar
3. Sélectionnez votre projet `selfkey`
4. Cliquez sur **Client Keys (DSN)** dans la sidebar gauche
5. Copiez le **DSN**

### B. Auth Token (pour upload des source maps)

1. Allez dans **Settings** > **Account** > **API** > **Auth Tokens**
2. Cliquez sur **"Create New Token"**
3. Permissions requises :
   - ✅ `project:read`
   - ✅ `project:releases`
   - ✅ `org:read`
4. Nommez-le : `selfkey-upload-sourcemaps`
5. Cliquez sur **"Create Token"**
6. **Copiez le token immédiatement** (vous ne pourrez plus le voir après)

### C. Organization Slug & Project Slug

- **Organization slug** : visible dans l'URL `https://sentry.io/organizations/[votre-org]/`
- **Project slug** : visible dans l'URL ou dans Settings > Projects

---

## 4. Configurer les variables d'environnement

### A. En local (développement)

Créez un fichier `.env.local` à la racine du projet :

```bash
# Sentry
SENTRY_DSN="https://abc123def456@o123456.ingest.sentry.io/7890123"
NEXT_PUBLIC_SENTRY_DSN="https://abc123def456@o123456.ingest.sentry.io/7890123"

SENTRY_AUTH_TOKEN="sntrys_votre_token_ici"
SENTRY_ORG="votre-organization-slug"
SENTRY_PROJECT="selfkey"

SENTRY_ENVIRONMENT="development"
NEXT_PUBLIC_SENTRY_ENVIRONMENT="development"
```

> ⚠️ **Note** : En mode développement, les erreurs sont loggées dans la console mais **ne sont PAS envoyées à Sentry** (pour éviter de polluer vos quotas). C'est configuré dans les fichiers `sentry.*.config.ts`.

### B. En production (Vercel/Infomaniak/Exoscale)

Ajoutez les variables d'environnement dans votre plateforme d'hébergement :

#### **Sur Vercel** :

1. Allez dans votre projet Vercel
2. **Settings** > **Environment Variables**
3. Ajoutez chaque variable :
   - `SENTRY_DSN`
   - `NEXT_PUBLIC_SENTRY_DSN`
   - `SENTRY_AUTH_TOKEN`
   - `SENTRY_ORG`
   - `SENTRY_PROJECT`
   - `SENTRY_ENVIRONMENT` = `production`
   - `NEXT_PUBLIC_SENTRY_ENVIRONMENT` = `production`

4. Redéployez l'application

#### **Sur un serveur (Infomaniak/Exoscale)** :

Ajoutez les variables dans votre fichier `.env` de production ou dans la configuration de votre serveur.

---

## 5. Tester en local

### A. Forcer l'envoi d'une erreur de test

Pour tester en production uniquement, modifiez temporairement `sentry.client.config.ts` :

```typescript
beforeSend(event, hint) {
  // Commentez cette ligne pour tester :
  // if (process.env.NODE_ENV === "development") {
  //   console.error("Sentry would capture:", hint.originalException);
  //   return null;
  // }

  return event;
}
```

Puis lancez votre appli et provoquez une erreur (par exemple, cliquez sur un bouton qui n'existe pas).

### B. Créer une page de test

Créez `src/app/test-sentry/page.tsx` :

```tsx
"use client";

import { captureError } from "@/lib/monitoring/sentry";

export default function TestSentryPage() {
  const throwError = () => {
    try {
      throw new Error("Test Sentry - Erreur intentionnelle");
    } catch (error) {
      captureError(error, {
        extra: {
          testContext: "Page de test Sentry",
          timestamp: new Date().toISOString(),
        },
      });
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Sentry</h1>
      <button
        onClick={throwError}
        className="px-4 py-2 bg-red-600 text-white rounded"
      >
        Envoyer une erreur test à Sentry
      </button>
    </div>
  );
}
```

Puis allez sur `http://localhost:3000/test-sentry` et cliquez sur le bouton.

---

## 6. Déployer en production

1. **Commitez** tous les fichiers créés :

   ```bash
   git add .
   git commit -m "feat: add Sentry error monitoring"
   git push
   ```

2. **Vérifiez** que les variables d'environnement sont bien configurées sur Vercel/votre serveur

3. **Déployez** l'application

4. **Vérifiez** dans Sentry que les erreurs sont bien capturées

---

## 7. Utiliser les helpers

### A. Capturer une erreur simple

```typescript
import { captureError } from "@/lib/monitoring/sentry";

try {
  // Votre code
  await faireQuelqueChose();
} catch (error) {
  captureError(error, {
    user: {
      id: userId,
      email: userEmail,
    },
    establishment: {
      slug: hotelSlug,
      name: hotelName,
    },
  });
  throw error; // Ou gérez l'erreur
}
```

### B. Capturer une erreur de réservation

```typescript
import { captureBookingError } from "@/lib/monitoring/sentry";

try {
  await createBooking(bookingData);
} catch (error) {
  captureBookingError(
    error,
    {
      id: bookingId,
      bookingNumber: 12345,
      amount: 150.0,
      currency: "CHF",
      type: "night",
    },
    {
      user: { id: userId, email: userEmail },
      establishment: { slug: hotelSlug, name: hotelName },
    }
  );
  throw error;
}
```

### C. Capturer une erreur de paiement Stripe

```typescript
import { capturePaymentError } from "@/lib/monitoring/sentry";

try {
  const paymentIntent = await stripe.paymentIntents.create({...});
} catch (error) {
  capturePaymentError(
    error,
    {
      paymentIntentId: "pi_123abc",
      amount: 150.00,
      currency: "CHF",
      status: "failed",
      errorCode: error.code,
      errorMessage: error.message,
    },
    {
      user: { id: userId, email: userEmail },
      establishment: { slug: hotelSlug, name: hotelName },
      booking: { id: bookingId },
    }
  );
  throw error;
}
```

### D. Capturer une erreur d'API

```typescript
import { captureApiError } from "@/lib/monitoring/sentry";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // ... votre logique
  } catch (error) {
    captureApiError(
      error,
      {
        endpoint: "/api/bookings",
        method: "POST",
        statusCode: 500,
        requestBody: body,
      },
      {
        user: { id: userId, email: userEmail },
      }
    );

    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
```

### E. Ajouter des breadcrumbs (tracer le parcours utilisateur)

```typescript
import { addBreadcrumb } from "@/lib/monitoring/sentry";

// Quand l'utilisateur clique sur "Réserver"
addBreadcrumb("User clicked booking button", "user_action", {
  roomId: "room_123",
  checkIn: "2024-01-15",
  checkOut: "2024-01-17",
});

// Quand une action importante se produit
addBreadcrumb("Stripe PaymentIntent created", "payment", {
  paymentIntentId: "pi_123",
  amount: 150.0,
});
```

---

## 8. Consulter les erreurs

### A. Dashboard Sentry

1. Allez sur **https://sentry.io/**
2. Sélectionnez votre projet `selfkey`
3. Vous verrez la liste des erreurs avec :
   - **Stack trace** complète
   - **Contexte utilisateur** (email, ID)
   - **Breadcrumbs** (parcours avant l'erreur)
   - **Tags** pour filtrer (establishment_slug, error_type, etc.)
   - **Nombre d'occurrences**
   - **Utilisateurs affectés**

### B. Filtrer les erreurs

Utilisez les filtres pour trouver rapidement :

- **Par établissement** : `establishment_slug:selfcamp`
- **Par type** : `error_type:payment`
- **Par utilisateur** : `user.email:client@example.com`
- **Par environnement** : `environment:production`

### C. Créer des alertes

1. Dans Sentry, allez dans **Alerts** > **Create Alert**
2. Choisissez les conditions (ex: plus de 10 erreurs en 1 heure)
3. Configurez les notifications (email, Slack, etc.)

---

## 📊 **Exemples de ce qui sera capturé**

### ✅ Erreurs automatiquement capturées :

- ❌ Erreurs JavaScript (client)
- ❌ Erreurs API (serveur)
- ❌ Erreurs non gérées (unhandled promises)
- ❌ Erreurs Prisma (base de données)
- ❌ Erreurs Stripe (paiements)
- ❌ Erreurs d'envoi d'emails
- ❌ Crashes de l'application

### 🎯 Informations capturées pour chaque erreur :

- **Stack trace** complète
- **Message d'erreur**
- **Contexte utilisateur** (email, ID)
- **Établissement** concerné
- **Réservation** en cours (si applicable)
- **URL** de la page
- **Navigateur** et version
- **Device** (mobile/desktop)
- **Breadcrumbs** (actions avant l'erreur)

---

## 🎉 C'est tout !

Vous êtes maintenant prêt à capturer toutes les erreurs de votre application. Sentry vous notifiera par email dès qu'une nouvelle erreur se produit.

### 📚 Ressources utiles :

- **Documentation Sentry Next.js** : https://docs.sentry.io/platforms/javascript/guides/nextjs/
- **Dashboard Sentry** : https://sentry.io/
- **Support Sentry** : https://sentry.io/support/

---

## 🔧 Dépannage

### Problème : Les erreurs ne sont pas envoyées

**Solution** :

1. Vérifiez que `NEXT_PUBLIC_SENTRY_DSN` est bien configuré
2. Vérifiez que vous êtes en mode `production` (pas `development`)
3. Regardez la console du navigateur pour les erreurs Sentry
4. Vérifiez dans Sentry > Settings > Client Keys que votre DSN est actif

### Problème : Les source maps ne s'uploadent pas

**Solution** :

1. Vérifiez que `SENTRY_AUTH_TOKEN` est bien configuré
2. Vérifiez que `SENTRY_ORG` et `SENTRY_PROJECT` sont corrects
3. Regardez les logs de build pour voir les erreurs d'upload

### Problème : Trop d'erreurs capturées

**Solution** :
Ajustez les filtres dans `sentry.client.config.ts` et `sentry.server.config.ts` :

```typescript
ignoreErrors: [
  "MonErreurAIgnorer",
  /RegexPourIgnorer/,
],
```

---

**Besoin d'aide ?** Contactez le support Sentry ou consultez leur documentation.
