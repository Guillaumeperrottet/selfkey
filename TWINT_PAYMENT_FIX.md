# Fix pour les paiements TWINT

## Problème identifié

Le problème principal était que les `billing_details` n'étaient pas transmis correctement à Stripe pour les paiements TWINT. Dans l'erreur Stripe, tous les champs billing_details étaient `null`.

### Causes du problème :

1. **Configuration PaymentElement** : Les `billing_details` étaient configurés sur "never", empêchant la collecte des informations nécessaires à TWINT
2. **Différences TWINT vs Cartes** : TWINT nécessite des informations de facturation complètes, contrairement aux cartes de crédit qui peuvent fonctionner sans

## Solutions implementées

### 1. Modification du PaymentElement

Changement de la configuration dans `PaymentFormMultiple.tsx` :

```tsx
// AVANT (problématique)
fields: {
  billingDetails: {
    name: "never",
    email: "never",
    phone: "never",
    address: "never",
  },
}

// APRÈS (fixé)
fields: {
  billingDetails: {
    name: "auto",
    email: "auto",
    phone: "auto",
    address: "auto",
  },
},
defaultValues: {
  billingDetails: {
    name: `${booking.clientFirstName} ${booking.clientLastName}`,
    email: booking.clientEmail,
    phone: booking.clientPhone,
    address: {
      line1: booking.clientAddress,
      postal_code: booking.clientPostalCode,
      city: booking.clientCity,
      country: getCountryCode(booking.clientCountry),
    },
  },
}
```

### 2. Amélioration côté serveur

- Optimisation de la création de Customer Stripe (éviter les doublons)
- Meilleure gestion des erreurs pour TWINT

## Test requis

1. Tester un paiement TWINT avec les nouvelles configurations
2. Vérifier que les billing_details sont correctement transmis à Stripe
3. S'assurer que les paiements par carte fonctionnent toujours

## Alternative plus sophistiquée

Si vous voulez une approche plus élégante, vous pouvez implémenter une détection du type de paiement et ajuster les billing_details dynamiquement :

```tsx
// Configuration conditionnelle selon le type de paiement
const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("");

// Dans PaymentElement onChange
onChange={(event) => {
  if (event.value?.type) {
    setSelectedPaymentMethod(event.value.type);
  }
  // Ajuster les billing_details selon le type
}}
```

## Notes importantes

- TWINT nécessite des données client complètes (nom, email, téléphone, adresse)
- La configuration "auto" permet à Stripe de déterminer quand demander ces informations
- Les defaultValues pré-remplissent les champs avec les données de réservation existantes
