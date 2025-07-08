# 🔄 Guide de Configuration Stripe Dynamique

## ✅ **Configuration actuelle**

Vous avez maintenant une configuration flexible qui vous permet de :

- Utiliser les **clés test** en développement
- Utiliser les **clés live** en production
- **Forcer le mode test** même en production

## 🎯 **Comment ça marche**

### **Automatique selon l'environnement :**

```bash
# En développement (NODE_ENV=development)
npm run dev
# → Utilise automatiquement les clés TEST

# En production (NODE_ENV=production)
npm run build && npm start
# → Utilise automatiquement les clés LIVE
```

### **Forcer le mode test en production :**

```bash
# Pour tester en production sans affecter les vrais paiements
STRIPE_FORCE_TEST_MODE=true npm start
# → Utilise les clés TEST même en production
```

## 🔧 **Utilisation dans votre code**

### **Ancienne méthode** (à remplacer) :

```typescript
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {...});
```

### **Nouvelle méthode** (recommandée) :

```typescript
import { stripe, stripePublicKey, isStripeTestMode } from "@/lib/stripe";

// L'instance stripe utilise automatiquement les bonnes clés
const paymentIntent = await stripe.paymentIntents.create({...});

// Pour le frontend
const publicKey = stripePublicKey;

// Pour vérifier le mode
if (isStripeTestMode) {
  console.log("🧪 Mode test activé");
}
```

## 📋 **Prochaines étapes**

### **1. Migrer vos fichiers existants**

✅ **Migration terminée** - Tous les fichiers ont été mis à jour :

- `src/lib/stripe-connect.ts` ✅
- `src/lib/risk-management.ts` ✅
- `src/app/api/stripe/test-connect/route.ts` ✅
- `src/app/api/webhooks/stripe/route.ts` ✅
- `src/app/api/admin/stripe-monitoring/route.ts` ✅
- `src/app/api/stripe/dashboard/route.ts` ✅
- `src/app/api/test/twint/route.ts` ✅

### **2. Variables d'environnement à ajouter**

Ajoutez dans votre **Vercel/production** :

```
STRIPE_TEST_SECRET_KEY=sk_test_...
STRIPE_TEST_PUBLISHABLE_KEY=pk_test_...
STRIPE_LIVE_SECRET_KEY=sk_live_...
STRIPE_LIVE_PUBLISHABLE_KEY=pk_live_...
STRIPE_FORCE_TEST_MODE=false
```

### **3. Comment tester**

```bash
# Test en local (mode test automatique)
npm run dev

# Test avec les clés live en local
NODE_ENV=production npm run dev

# Test en production avec clés test
# Mettre STRIPE_FORCE_TEST_MODE=true sur Vercel
```

## 🎉 **Avantages**

✅ **Sécurité** : Plus de mélange entre clés test/live  
✅ **Flexibilité** : Testez en production sans risque  
✅ **Simplicité** : Une seule import dans tous vos fichiers  
✅ **Debug** : Logs automatiques du mode utilisé

Voulez-vous que je migrate automatiquement tous vos autres fichiers ?
