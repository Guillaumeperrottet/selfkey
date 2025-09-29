# Test Plan pour TWINT Fix

## Problème identifié

Les paiements TWINT échouent avec l'erreur `payment_method_provider_decline` car les `billing_details` sont `null` dans la réponse Stripe.

## Corrections apportées

### 1. Configuration PaymentElement

- ✅ Changé les champs `billing_details` de "auto" à "auto" avec commentaires spécifiques pour TWINT
- ✅ Ajouté des logs pour diagnostiquer la sélection TWINT
- ✅ Amélioré les `defaultValues` pour pré-remplir les champs

### 2. Côté serveur

- ✅ Ajouté `payment_method_types: ["card", "twint"]` explicitement
- ✅ Amélioré la création du Customer Stripe avec toutes les informations requises
- ✅ Validation que le Customer est correctement associé au PaymentIntent

### 3. Validation et logs

- ✅ Ajouté des logs détaillés pour diagnostiquer les billing_details
- ✅ Validation que la devise est CHF (requis pour TWINT)
- ✅ Amélioration de la conversion des codes pays

## Tests à effectuer

### Test 1: Paiement TWINT avec données complètes

1. Créer une réservation avec :
   - Client suisse
   - Adresse complète
   - Email et téléphone valides
   - Montant en CHF
2. Sélectionner TWINT comme méthode de paiement
3. Vérifier que les billing_details sont pré-remplies
4. Confirmer le paiement
5. Vérifier que le paiement est accepté

### Test 2: Validation des logs

1. Ouvrir la console du navigateur
2. Rechercher les logs spécifiques :
   - `🔍 TWINT sélectionné, billing details required`
   - `🔍 TWINT BILLING DETAILS:`
   - `🌍 Conversion pays:`
3. Vérifier que toutes les données sont correctement formatées

### Test 3: Comparaison avant/après

1. Comparer avec l'erreur précédente dans Stripe Dashboard
2. Vérifier que les billing_details ne sont plus `null`
3. Confirmer que le PaymentMethod a toutes les informations requises

## Points de vérification Stripe Dashboard

Dans le Stripe Dashboard, vérifier :

1. Le PaymentIntent créé a un Customer associé
2. Le PaymentMethod TWINT a des billing_details complets
3. Aucune erreur `payment_method_provider_decline`

## Rollback si nécessaire

Si les modifications causent des problèmes :

1. Revenir à la configuration précédente des `fields.billingDetails`
2. Enlever l'ajout explicite de `payment_method_types`
3. Restaurer les logs originaux

## Documentation Stripe consultée

- https://docs.stripe.com/payments/twint
- https://docs.stripe.com/payments/twint/accept-a-payment
- https://docs.stripe.com/api/payment_intents/create

## Notes importantes

- TWINT ne fonctionne qu'avec la devise CHF
- TWINT nécessite des billing_details complets
- Le Customer Stripe doit être créé avec les informations complètes
- La redirection (`allow_redirects: "always"`) est obligatoire pour TWINT
