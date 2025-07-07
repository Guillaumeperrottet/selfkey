# Guide d'intégration TWINT pour SelfKey

## 📋 État actuel des paiements

Votre plateforme SelfKey utilise actuellement **Stripe Connect** pour les paiements avec la configuration suivante :

### Flux de paiement actuel :

1. **Client** : Remplit le formulaire de réservation
2. **Redirection** : Vers la page de paiement `/[hotel]/payment`
3. **Paiement** : Via Stripe Elements avec CardElement (cartes uniquement)
4. **Confirmation** : Webhook Stripe → mise à jour BDD → email de confirmation

### Configuration Stripe actuelle :

- **Type de compte** : Express Connect accounts
- **Pays** : CH (Suisse) - configuré dans le code
- **Capabilities** : `card_payments` et `transfers`
- **Moyens de paiement** : Cartes uniquement via `CardElement`

## 🇨🇭 Intégration TWINT avec Stripe

Bonne nouvelle ! Stripe supporte TWINT pour les comptes suisses. Voici comment l'intégrer :

### 1. Activation de TWINT dans Stripe

#### Étape 1 : Configuration des capabilities

Modifier le fichier `src/lib/stripe-connect.ts` pour ajouter TWINT :

```typescript
const account = await stripe.accounts.create({
  type: "express",
  country: "CH", // Déjà configuré pour la Suisse
  email: params.email,
  business_type: params.businessType,
  capabilities: {
    card_payments: { requested: true },
    transfers: { requested: true },
    twint_payments: { requested: true }, // ⭐ NOUVEAU
  },
  metadata: {
    hotel_name: params.hotelName,
  },
});
```

#### Étape 2 : Mise à jour du PaymentIntent

Modifier `createPaymentIntentWithCommission()` pour inclure TWINT :

```typescript
const paymentIntent = await stripe.paymentIntents.create({
  amount: Math.round(amount * 100),
  currency: "chf", // TWINT fonctionne uniquement avec CHF
  application_fee_amount: Math.round(applicationFeeAmount * 100),
  transfer_data: {
    destination: connectedAccountId,
  },
  automatic_payment_methods: {
    enabled: true,
    allow_redirects: "always", // ⭐ NOUVEAU : nécessaire pour TWINT
  },
  // ⚠️ NE PAS utiliser payment_method_types avec automatic_payment_methods
  metadata: {
    integration_type: "direct_charge",
    platform: "selfkey_hotels",
  },
});
```

### 2. Modification du composant PaymentForm

#### Problème actuel

Le `CardElement` ne supporte que les cartes. Il faut utiliser `PaymentElement` pour TWINT.

#### Solution : Nouveau composant de paiement

Créer un nouveau fichier `src/components/PaymentFormMultiple.tsx` :

```tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

// ... interfaces existantes ...

function CheckoutForm({ booking }: Pick<PaymentFormProps, "booking">) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [clientSecret, setClientSecret] = useState<string>("");

  useEffect(() => {
    // Créer le PaymentIntent (même logique qu'avant)
    const createPaymentIntent = async () => {
      try {
        const response = await fetch("/api/payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: booking.amount,
            currency: booking.currency,
            bookingId: booking.id,
          }),
        });

        const { clientSecret } = await response.json();
        setClientSecret(clientSecret);
      } catch {
        setError("Erreur lors de l'initialisation du paiement");
      }
    };

    createPaymentIntent();
  }, [booking]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setIsLoading(true);
    setError("");

    // ⭐ NOUVEAU : Utiliser confirmPayment au lieu de confirmCardPayment
    const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
      elements,
      clientSecret,
      confirmParams: {
        return_url: `${window.location.origin}/${booking.hotelSlug}/success?booking=${booking.id}`,
        payment_method_data: {
          billing_details: {
            name: `${booking.clientFirstName} ${booking.clientLastName}`,
            email: booking.clientEmail,
          },
        },
      },
      redirect: "if_required", // Éviter les redirections inutiles pour les cartes
    });

    if (stripeError) {
      setError(stripeError.message || "Erreur de paiement");
      setIsLoading(false);
    } else if (paymentIntent?.status === "succeeded") {
      // Paiement réussi immédiatement (cartes)
      await fetch("/api/booking/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: booking.id,
          paymentIntentId: paymentIntent.id,
        }),
      });

      router.push(`/${booking.hotelSlug}/success?booking=${booking.id}`);
    }
    // Si paymentIntent?.status === "processing" : TWINT en cours
    // Si paymentIntent?.status === "requires_action" : redirection effectuée
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">
        Informations de paiement
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {clientSecret && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Choisissez votre méthode de paiement
            </label>
            <div className="border border-gray-300 rounded-md p-3">
              {/* ⭐ NOUVEAU : PaymentElement remplace CardElement */}
              <PaymentElement
                options={{
                  layout: "tabs",
                  wallets: {
                    applePay: "auto",
                    googlePay: "auto",
                  },
                }}
              />
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
          <p className="text-sm text-blue-700">
            🔒 Paiement sécurisé par Stripe. Vos données bancaires sont
            protégées.
          </p>
          <p className="text-sm text-blue-700 mt-1">
            💳 Cartes acceptées • 🇨🇭 TWINT • 📱 Apple Pay • 💳 Google Pay
          </p>
        </div>

        <button
          type="submit"
          disabled={!stripe || isLoading || !clientSecret}
          className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading
            ? "Traitement du paiement..."
            : `Payer ${booking.amount} ${booking.currency}`}
        </button>
      </form>
    </div>
  );
}

export function PaymentFormMultiple(props: PaymentFormProps) {
  const [stripePromise] = useState(() =>
    loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || "")
  );

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret: props.clientSecret, // À passer depuis le parent
        appearance: {
          theme: "stripe",
          variables: {
            colorPrimary: "#2563eb",
          },
        },
      }}
    >
      <CheckoutForm booking={props.booking} />
    </Elements>
  );
}
```

### 3. Gestion des redirections TWINT

#### Page de retour pour TWINT

Créer `src/app/[hotel]/payment-return/page.tsx` :

```tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";

export default function PaymentReturnPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const handlePaymentReturn = async () => {
      const stripe = await loadStripe(
        process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || ""
      );

      if (!stripe) {
        setError("Erreur de chargement Stripe");
        setStatus("error");
        return;
      }

      // Récupérer le PaymentIntent depuis l'URL
      const paymentIntentClientSecret = searchParams.get(
        "payment_intent_client_secret"
      );

      if (!paymentIntentClientSecret) {
        setError("Paramètres manquants");
        setStatus("error");
        return;
      }

      try {
        const { paymentIntent } = await stripe.retrievePaymentIntent(
          paymentIntentClientSecret
        );

        if (paymentIntent) {
          switch (paymentIntent.status) {
            case "succeeded":
              setStatus("success");
              // Rediriger vers la page de succès
              const bookingId = searchParams.get("booking");
              if (bookingId) {
                router.push(
                  `/${window.location.pathname.split("/")[1]}/success?booking=${bookingId}`
                );
              }
              break;
            case "processing":
              setStatus("loading");
              // Attendre et vérifier à nouveau
              setTimeout(handlePaymentReturn, 2000);
              break;
            case "requires_payment_method":
              setError("Paiement non autorisé");
              setStatus("error");
              break;
            default:
              setError("Statut de paiement inattendu");
              setStatus("error");
          }
        }
      } catch (error) {
        setError("Erreur lors de la vérification du paiement");
        setStatus("error");
      }
    };

    handlePaymentReturn();
  }, [router, searchParams]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900">
            Vérification du paiement...
          </h2>
          <p className="text-gray-600">
            Veuillez patienter pendant que nous confirmons votre paiement TWINT.
          </p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">❌</div>
          <h2 className="text-xl font-semibold text-gray-900">
            Erreur de paiement
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.back()}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  return null;
}
```

## 🔄 Étapes de migration

### Phase 1 : Préparation

1. **Tester TWINT en mode test** sur votre compte Stripe
2. **Vérifier les capabilities** TWINT sur vos comptes Connect existants
3. **Backup** de la configuration actuelle

### Phase 2 : Implémentation

1. **Modifier** `stripe-connect.ts` pour ajouter TWINT
2. **Créer** `PaymentFormMultiple.tsx`
3. **Ajouter** la page de retour TWINT
4. **Tester** en mode développement

### Phase 3 : Déploiement

1. **Feature flag** pour activer progressivement
2. **Monitoring** des paiements TWINT
3. **Formation** des hôteliers

## 🧪 Tests recommandés

### Numéros de test TWINT (mode test Stripe)

- **Succès** : Utiliser n'importe quel numéro de mobile suisse
- **Échec** : Utiliser le numéro `+41 79 123 45 67`

### Scénarios à tester

1. **Paiement carte** : Doit fonctionner comme avant
2. **Paiement TWINT** : Redirection → app TWINT → retour
3. **Paiement annulé** : Retour à la page de paiement
4. **Timeout** : Gestion des paiements expirés

## 📊 Avantages de TWINT

### Pour vos hôteliers

- **Populaire en Suisse** : 3,5 millions d'utilisateurs
- **Frais réduits** : Généralement moins chers que les cartes
- **Paiements instantanés** : Pas de chargeback

### Pour vos clients

- **Simplicité** : Paiement en 1 clic
- **Sécurité** : Authentification biométrique
- **Rapidité** : Pas de saisie de données

## ⚠️ Erreurs communes à éviter

### Erreur : "You cannot enable `automatic_payment_methods` and specify `payment_method_types`"

**Problème** : Cette erreur survient quand on essaie d'utiliser les deux approches ensemble dans le PaymentIntent.

**Solution** : Utiliser uniquement `automatic_payment_methods` pour TWINT :

```typescript
// ✅ CORRECT
const paymentIntent = await stripe.paymentIntents.create({
  // ... autres paramètres
  automatic_payment_methods: {
    enabled: true,
    allow_redirects: "always",
  },
  // ❌ NE PAS ajouter payment_method_types ici
});

// ❌ INCORRECT - Cause l'erreur
const paymentIntent = await stripe.paymentIntents.create({
  // ... autres paramètres
  automatic_payment_methods: {
    enabled: true,
    allow_redirects: "always",
  },
  payment_method_types: ["card", "twint"], // ⚠️ Erreur !
});
```

### Pourquoi `automatic_payment_methods` est mieux

- **Flexibilité** : Stripe active automatiquement les moyens de paiement selon les capabilities du compte
- **Maintenance** : Pas besoin de mettre à jour manuellement la liste
- **Nouveautés** : Les nouveaux moyens de paiement sont automatiquement inclus

## 🚀 Code de migration

Voulez-vous que je vous aide à implémenter cette solution ? Je peux :

1. **Modifier** les fichiers existants
2. **Créer** les nouveaux composants
3. **Tester** l'intégration
4. **Documenter** les changements

Dites-moi si vous souhaitez procéder à l'implémentation ! 🎯
