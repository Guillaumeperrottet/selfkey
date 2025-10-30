# 🔄 Migration vers Direct Charge (Stripe)

## 📅 Date de Migration

**30 octobre 2025**

## 🎯 Objectif du Changement

Passer d'un modèle **"Destination Charges"** (l'argent va directement aux hôteliers) à un modèle **"Direct Charges"** (tout l'argent arrive sur le compte principal de SelfKey).

---

## 🏗️ Architecture Avant vs Après

### ❌ AVANT : Destination Charges with on_behalf_of

```
Client paie 126.90 CHF
    ↓
Stripe fait automatiquement :
  → 8.90 CHF vers compte SelfKey (commission)
  → 118.00 CHF vers compte hôtelier (transfer automatique)
```

**Caractéristiques :**

- Utilisation de `application_fee_amount`
- Utilisation de `transfer_data` + `on_behalf_of`
- L'hôtelier est le "merchant of record"
- Transfer automatique immédiat

### ✅ APRÈS : Direct Charges (Separate Charges and Transfers)

```
Client paie 126.90 CHF
    ↓
TOUT arrive sur le compte Stripe principal de SelfKey
    ↓
SelfKey garde l'argent (trésorerie)
    ↓
SelfKey fait des Transfers manuels vers les comptes connectés
    ↓
L'hôtelier reçoit sur son compte bancaire
```

**Caractéristiques :**

- Pas de `application_fee_amount`
- Pas de `transfer_data` ni `on_behalf_of`
- SelfKey est le "merchant of record"
- Transfers manuels (quand SelfKey le décide)

---

## 📝 Fichiers Modifiés

### 1. `/src/lib/payment/connect.ts`

**Ajout de 2 nouvelles fonctions :**

#### `createDirectChargePaymentIntent()`

```typescript
/**
 * Créer un PaymentIntent directement sur le compte principal
 * Tout l'argent arrive chez SelfKey
 */
export async function createDirectChargePaymentIntent(
  amount: number,
  currency: string,
  metadata?: Record<string, string>
);
```

**Différences clés :**

- ✅ Pas de `application_fee_amount`
- ✅ Pas de `transfer_data.destination`
- ✅ Pas de `on_behalf_of`
- ✅ `integration_type: "direct_charge"` dans metadata

#### `transferToConnectedAccount()`

```typescript
/**
 * Transférer de l'argent vers un compte connecté
 * À utiliser pour payer les hôteliers
 */
export async function transferToConnectedAccount(
  amount: number,
  currency: string,
  connectedAccountId: string,
  metadata?: Record<string, string>
);
```

**Usage :**

- Via Stripe Dashboard (manuel)
- Via API custom (automatisation future possible)

### 2. Routes Modifiées

- ✅ `/src/app/api/establishments/[hotel]/bookings/route.ts`
- ✅ `/src/app/api/establishments/[hotel]/day-parking-bookings/route.ts`
- ✅ `/src/app/api/bookings/[bookingId]/payment-intent/route.ts`
- ✅ `/src/lib/booking/booking.ts`

**Changement principal :**

```typescript
// AVANT
const paymentIntent = await createPaymentIntentWithCommission(
  finalPrice,
  "chf",
  establishment.stripeAccountId, // ❌
  establishment.commissionRate, // ❌
  establishment.fixedFee // ❌
);

// APRÈS
const paymentIntent = await createDirectChargePaymentIntent(finalPrice, "chf", {
  ...metadata,
  connected_account_id: establishment.stripeAccountId || "",
  platform_commission: platformCommission.toString(),
  owner_amount: ownerAmount.toString(),
});
```

---

## 💰 Gestion des Paiements aux Hôteliers

### Via Stripe Dashboard (Recommandé pour démarrer)

1. **Se connecter au Dashboard Stripe** (compte principal)
2. **Aller dans "Transfers"**
3. **Créer un nouveau Transfer :**
   - Montant : Ce que vous devez à l'hôtelier
   - Destination : Son compte connecté (acct_XXX)
   - Description : "Paiement octobre 2025 - Hôtel Geneva"

### Via API (Automatisation future)

```typescript
import { transferToConnectedAccount } from "@/lib/payment/connect";

// Exemple : Paiement mensuel automatique
const transfer = await transferToConnectedAccount(
  1770.0, // CHF
  "chf",
  "acct_hotel_geneva", // ID du compte connecté
  {
    period: "2025-10",
    hotel_slug: "hotel-geneva",
    booking_count: "15",
    total_bookings_amount: "1950.00",
    commission: "180.00",
  }
);
```

---

## 📊 Avantages du Nouveau Système

### ✅ Pour SelfKey

1. **Trésorerie améliorée** : Vous gardez l'argent le temps souhaité
2. **Flexibilité totale** : Vous décidez quand payer (mensuel, hebdo, etc.)
3. **Simplification** : Plus besoin de gérer les commissions automatiques Stripe
4. **Contrôle** : Vous voyez tout l'argent qui entre sur un seul compte
5. **Moins de frais** : Un seul compte à gérer

### ✅ Pour les Hôteliers

1. **Visibilité identique** : Ils continuent à voir leurs réservations dans votre app
2. **Emails identiques** : Notifications en temps réel
3. **Paiements fiables** : Via Stripe (toujours traçable)
4. **Dashboard Stripe** : Ils voient les transfers que vous leur envoyez

### ⚠️ Point d'Attention

- **Les hôteliers ne voient plus le détail** des paiements individuels dans leur Stripe Dashboard
- **Mais ils voient tout** dans votre application SelfKey (qui est leur outil principal)

---

## 🧪 Tests à Effectuer

### Test 1 : Nouvelle Réservation

```bash
1. Aller sur votre site en mode test
2. Faire une réservation
3. Payer avec carte test : 4242 4242 4242 4242
4. Vérifier :
   ✅ Le paiement apparaît dans VOTRE Stripe Dashboard
   ✅ Pas dans celui de l'hôtelier
   ✅ La réservation est créée en DB
   ✅ L'email part au client
   ✅ L'hôtelier voit la réservation dans l'app
```

### Test 2 : Transfer Manuel

```bash
1. Aller dans Stripe Dashboard → Transfers
2. Créer un transfer vers un compte connecté
3. Vérifier que le transfer apparaît dans le dashboard de l'hôtelier
```

---

## 🔄 Réversion (si nécessaire)

Si vous voulez revenir en arrière :

1. **Changer les imports** dans les routes :

   ```typescript
   import { createPaymentIntentWithCommission } from "@/lib/payment/connect";
   ```

2. **Utiliser l'ancienne fonction** (elle est toujours présente) :

   ```typescript
   const paymentIntent = await createPaymentIntentWithCommission(
     finalPrice,
     "chf",
     establishment.stripeAccountId,
     establishment.commissionRate,
     establishment.fixedFee,
     metadata
   );
   ```

3. **Redéployer**

---

## 📞 Support

En cas de problème :

- **Logs Stripe** : Dashboard → Developers → Logs
- **Logs Application** : Vercel Dashboard → Logs
- **Base de données** : Vérifier les `stripePaymentIntentId` des bookings

---

## 📚 Ressources

- [Stripe Connect - Separate Charges and Transfers](https://stripe.com/docs/connect/separate-charges-and-transfers)
- [Stripe Transfers API](https://stripe.com/docs/api/transfers)
- [Stripe Dashboard](https://dashboard.stripe.com)
