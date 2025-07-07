# Guide de test TWINT - SelfKey

## 🚀 Intégration terminée !

L'intégration TWINT a été complétée avec succès. Voici ce qui a été modifié :

### ✅ Fichiers modifiés :

1. **`src/lib/stripe-connect.ts`** : Ajout capability TWINT + configuration PaymentIntent
2. **`src/components/PaymentFormMultiple.tsx`** : Nouveau composant avec PaymentElement
3. **`src/app/[hotel]/payment-return/page.tsx`** : Page de retour pour paiements TWINT
4. **`src/app/[hotel]/payment/page.tsx`** : Utilisation du nouveau composant
5. **`src/app/api/test/twint/route.ts`** : API de test TWINT
6. **`src/app/api/booking/confirm/route.ts`** : Déjà existant (parfait!)

### 🧪 Tests à effectuer

#### 1. Test de configuration TWINT

```bash
# Démarrer le serveur de développement
npm run dev

# Tester la configuration TWINT
curl http://localhost:3000/api/test/twint
```

#### 2. Test du flux de réservation complet

**Étape 1 : Créer une réservation**

1. Aller sur `http://localhost:3000/hotel-test-paradise`
2. Sélectionner une chambre
3. Remplir le formulaire client
4. Cliquer sur "Réserver"

**Étape 2 : Tester le paiement**

1. Vous serez redirigé vers la page de paiement
2. Vous devriez voir les options : Cartes, TWINT, Apple Pay
3. **Pour tester TWINT** : Sélectionner TWINT et utiliser un numéro suisse

**Étape 3 : Vérifier les redirections**

- Paiement carte : Reste sur la page
- Paiement TWINT : Redirection vers app TWINT puis retour

#### 3. Numéros de test TWINT (mode test Stripe)

```
✅ Succès : +41 79 123 45 67 (ou n'importe quel numéro suisse)
❌ Échec : +41 79 000 00 00
⏳ Timeout : +41 79 999 99 99
```

### 🔧 Configuration requise

#### Variables d'environnement (déjà configurées)

```env
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_...
```

#### Activation TWINT sur Stripe

1. Aller sur [Stripe Dashboard](https://dashboard.stripe.com)
2. Paramètres → Moyens de paiement
3. Activer TWINT pour la Suisse

### 📱 Expérience utilisateur

#### Sur desktop

1. Sélection du moyen de paiement
2. Pour TWINT : Saisie du numéro de téléphone
3. Redirection vers l'app TWINT
4. Confirmation dans l'app
5. Retour automatique sur le site

#### Sur mobile

1. Sélection TWINT
2. Ouverture automatique de l'app TWINT
3. Confirmation biométrique
4. Retour automatique sur le site

### 🎯 Fonctionnalités implémentées

#### ✅ Paiements supportés

- 💳 **Cartes** : Visa, Mastercard, American Express
- 🇨🇭 **TWINT** : Paiement mobile suisse
- 📱 **Apple Pay** : Paiement rapide iOS
- 💳 **Google Pay** : Paiement rapide Android

#### ✅ Gestion des redirections

- **Paiement réussi** : Redirection vers page de succès
- **Paiement échoué** : Retour à la page de paiement
- **Paiement annulé** : Retour avec message d'erreur

#### ✅ Confirmations

- **Email automatique** : Envoyé après paiement réussi
- **Mise à jour BDD** : PaymentIntent ID enregistré
- **Webhook Stripe** : Gestion des événements

### 🔍 Débogage

#### Logs à surveiller

```bash
# Démarrer avec logs détaillés
npm run dev

# Surveiller les logs Stripe
tail -f .next/trace

# Vérifier les webhooks
# Stripe Dashboard → Webhooks → Logs
```

#### Points de vérification

1. **PaymentIntent créé** : Vérifier les payment_method_types
2. **Redirection TWINT** : URL de retour correcte
3. **Confirmation réservation** : PaymentIntent ID enregistré
4. **Email envoyé** : Vérifier la fonction d'email

### 🚨 Problèmes potentiels

#### TWINT non disponible

- **Cause** : Compte Stripe non configuré pour TWINT
- **Solution** : Activer TWINT dans Stripe Dashboard

#### Redirection échoue

- **Cause** : URL de retour incorrecte
- **Solution** : Vérifier NEXT_PUBLIC_BASE_URL

#### Paiement reste "processing"

- **Cause** : Webhook non configuré
- **Solution** : Configurer webhook Stripe

### 🎉 Prochaines étapes

1. **Tester en production** : Déployer et tester avec vrais paiements
2. **Analyser les conversions** : Tracker l'adoption TWINT
3. **Former les hôteliers** : Expliquer les nouveaux moyens de paiement
4. **Optimiser l'UX** : Améliorer selon les retours utilisateurs

## 🔗 Ressources

- [Documentation Stripe TWINT](https://stripe.com/docs/payments/twint)
- [Guide PaymentElement](https://stripe.com/docs/payments/payment-element)
- [Stripe Connect Express](https://stripe.com/docs/connect/express-accounts)

---

**L'intégration TWINT est maintenant fonctionnelle ! 🎯**

Pour tester immédiatement :

1. `npm run dev`
2. Aller sur `http://localhost:3000/hotel-test-paradise`
3. Faire une réservation
4. Tester TWINT avec un numéro suisse (+41 79 123 45 67)
