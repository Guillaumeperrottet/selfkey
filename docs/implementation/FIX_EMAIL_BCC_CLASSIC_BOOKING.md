# 🔧 Correction : Emails en copie (BCC) pour les réservations classiques

## 📋 Problème identifié

Les emails de confirmation pour les réservations classiques (parking nuit) ne recevaient **pas systématiquement** les adresses en copie (BCC) configurées dans les paramètres de l'établissement.

### Cause du problème

Dans le webhook Stripe (`/api/webhooks/stripe/route.ts`), lors de la création d'une réservation classique et l'envoi automatique de l'email de confirmation :

1. ❌ Les champs `enableEmailCopyOnConfirmation` et `emailCopyAddresses` n'étaient **PAS récupérés** de la base de données
2. ❌ La fonction `sendMultilingualConfirmationEmail()` ne gérait **PAS** l'envoi en copie (BCC)

## ✅ Solution implémentée

### 1. Ajout des champs manquants dans la requête Prisma

**Fichier:** `src/app/api/webhooks/stripe/route.ts` (ligne ~453)

```typescript
establishment: {
  select: {
    // ... autres champs ...
    hotelContactEmail: true,
    hotelContactPhone: true,
    // ✅ AJOUT : Paramètres de copie email
    enableEmailCopyOnConfirmation: true,
    emailCopyAddresses: true,
  },
}
```

### 2. Mise à jour du type TypeScript

**Fichier:** `src/app/api/webhooks/stripe/route.ts` (ligne ~523)

Ajout des champs dans l'interface de la fonction `sendMultilingualConfirmationEmail()` :

```typescript
establishment: {
  // ... autres champs ...
  hotelContactEmail: string | null;
  hotelContactPhone: string | null;
  enableEmailCopyOnConfirmation: boolean;
  emailCopyAddresses: string[];
};
```

### 3. Implémentation de l'envoi en copie (BCC)

**Fichier:** `src/app/api/webhooks/stripe/route.ts` (ligne ~620)

```typescript
// Préparer les adresses en copie (BCC) si activées
let bccAddresses: string[] = [];
if (
  booking.establishment.enableEmailCopyOnConfirmation &&
  booking.establishment.emailCopyAddresses &&
  booking.establishment.emailCopyAddresses.length > 0
) {
  bccAddresses = booking.establishment.emailCopyAddresses;
  console.log(`📧 Envoi en copie (BCC) à: ${bccAddresses.join(", ")}`);
}

// Envoyer l'email
const result = await sendEmail({
  from: fromEmail,
  to: destinationEmail,
  subject: `${subject} - ${booking.establishment.name}`,
  html: emailContent,
  bcc: bccAddresses.length > 0 ? bccAddresses : undefined,
});
```

## 📊 Flux de traitement

### Avant (❌ Non fonctionnel)

```
1. Webhook Stripe reçu (payment_intent.succeeded)
2. Création de la réservation classique
3. Récupération de l'établissement (SANS enableEmailCopyOnConfirmation/emailCopyAddresses)
4. Envoi de l'email (SANS BCC)
   ├─> ✅ Client reçoit l'email
   └─> ❌ Adresses en copie ne reçoivent PAS l'email
```

### Après (✅ Fonctionnel)

```
1. Webhook Stripe reçu (payment_intent.succeeded)
2. Création de la réservation classique
3. Récupération de l'établissement (AVEC enableEmailCopyOnConfirmation/emailCopyAddresses)
4. Vérification : enableEmailCopyOnConfirmation = true ?
   ├─> Si OUI : préparer les adresses BCC
   └─> Si NON : continuer sans BCC
5. Envoi de l'email (AVEC BCC si configuré)
   ├─> ✅ Client reçoit l'email
   └─> ✅ Adresses en copie reçoivent AUSSI l'email
```

## 🔍 Types de réservations concernés

### ✅ Réservations classiques (classic_booking)

- **Type:** Parking nuit avec réservation de chambre/place
- **Correction:** Emails en copie maintenant envoyés systématiquement
- **Log identifiant:** `"booking_type": "classic_booking"`

### ℹ️ Parking jour (day_parking)

- **Type:** Parking à l'heure ou demi-journée
- **Note:** Utilise un système différent, non concerné par cette correction

### ℹ️ Parking nuit (night_parking)

- **Type:** Parking nuit simple sans réservation de place
- **Note:** Utilise un système différent, pas d'email de confirmation automatique

## 📝 Logs attendus après correction

Lors d'une réservation classique avec copie email activée, vous devriez voir :

```
🔗 Webhook Stripe reçu !
✅ Webhook vérifié, type d'événement: payment_intent.succeeded
🏨 Detected classic booking (hotel), creating reservation...
✅ Establishment found: [Nom établissement]
✅ Room found: [Nom place]
📧 Envoi de l'email de confirmation classique...
🌍 Langue de la réservation: [fr/en/de]
📧 Envoi de l'email de confirmation à: [email_client]
📧 Depuis: [email_etablissement]
📧 Sujet: [Sujet selon langue]
📧 Envoi en copie (BCC) à: [adresse1@exemple.com, adresse2@exemple.com]  ⬅️ NOUVELLE LIGNE
✅ Email envoyé avec succès (ID: xxxxxxxx)
✅ Email de confirmation classique envoyé
```

## ⚙️ Configuration requise

Pour que les emails en copie fonctionnent, l'établissement doit avoir configuré :

1. **`enableEmailCopyOnConfirmation`** = `true`
2. **`emailCopyAddresses`** = `["adresse1@exemple.com", "adresse2@exemple.com"]`

Ces paramètres se configurent dans l'interface d'administration de l'établissement, section "Paramètres de confirmation".

## 🧪 Test de la correction

Pour tester que la correction fonctionne :

1. Créer une réservation classique (parking nuit)
2. Vérifier les logs dans Vercel/console
3. Confirmer que la ligne `📧 Envoi en copie (BCC) à:` apparaît
4. Vérifier que les adresses en copie ont bien reçu l'email

## ✅ Statut

- [x] Problème identifié
- [x] Solution implémentée
- [x] Code compilé sans erreur
- [ ] Testé en production

---

**Date de correction:** 17 octobre 2025  
**Fichiers modifiés:** `src/app/api/webhooks/stripe/route.ts`
