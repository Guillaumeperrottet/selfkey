# Debugging TWINT - Prochaines étapes

## État actuel des modifications

✅ **Côté client** :

- Configuration PaymentElement avec `fields.billingDetails` = "auto"
- `defaultValues` pré-remplies avec les données client
- Logs détaillés pour diagnostiquer
- Validation des devises et pays

✅ **Côté serveur** :

- `payment_method_types: ["card", "twint"]` explicite
- Customer Stripe créé avec toutes les informations
- Métadonnées enrichies pour TWINT

## Si le problème persiste en production

### Approche 1: PaymentMethod explicite

Créer le PaymentMethod explicitement avant la confirmation :

```typescript
// Dans handleSubmit, avant confirmPayment
const { error: pmError, paymentMethod } = await stripe.createPaymentMethod({
  type: "twint",
  billing_details: billingDetails,
});

if (pmError) {
  console.error("Erreur création PaymentMethod:", pmError);
  return;
}

// Puis utiliser ce PaymentMethod pour la confirmation
const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
  elements,
  confirmParams: {
    return_url: returnUrl,
    payment_method: paymentMethod.id,
  },
});
```

### Approche 2: Détection du type de paiement

Adapter les billing_details selon le type de paiement sélectionné :

```typescript
// Détecter le type de paiement sélectionné
const paymentElement = elements.getElement("payment");
// Observer les changements et adapter la stratégie

// Si TWINT, utiliser une approche spécifique
// Si carte, utiliser l'approche actuelle
```

### Approche 3: Vérification Connect

Vérifier que le compte connecté a TWINT activé :

```typescript
// Côté serveur, vérifier les capacités du compte
const account = await stripe.accounts.retrieve(connectedAccountId);
console.log("Capabilities:", account.capabilities);
// Vérifier que twint_payments === 'active'
```

### Approche 4: Configuration PaymentIntent différente

```typescript
// Essayer sans automatic_payment_methods
const paymentIntent = await stripe.paymentIntents.create({
  amount: amountRappen,
  currency: "chf",
  payment_method_types: ["twint"], // Seulement TWINT
  customer: customerId,
  // Pas de automatic_payment_methods
});
```

## Debug à vérifier en production

1. **Console navigateur** :
   - Logs des billing_details avant confirmation
   - Réponse complète de l'erreur Stripe
   - État du PaymentElement

2. **Stripe Dashboard** :
   - PaymentIntent créé avec Customer ID
   - PaymentMethod avec billing_details complets
   - Logs détaillés de l'erreur

3. **Réseau (DevTools)** :
   - Requête de création PaymentIntent
   - Requête de confirmation
   - Payload exact envoyé à Stripe

## Questions clés

1. Le Customer Stripe est-il bien créé avec toutes les informations ?
2. Le PaymentMethod TWINT est-il créé avec des billing_details complets ?
3. Le compte connecté a-t-il TWINT activé ?
4. La devise est-elle bien CHF ?
5. Le code pays est-il correct (CH) ?

## Rollback immédiat si nécessaire

Si les modifications causent d'autres problèmes :

```bash
git stash
# ou
git reset --hard HEAD~1
```

## Ressources Stripe supplémentaires

- [TWINT Integration Guide](https://docs.stripe.com/payments/twint)
- [PaymentMethod API](https://docs.stripe.com/api/payment_methods)
- [Connect Payment Methods](https://docs.stripe.com/connect/payment-methods)
