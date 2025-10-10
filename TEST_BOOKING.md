# 🧪 Script de Test Complet de Réservation

Ce script simule une réservation complète du début à la fin, exactement comme le ferait un vrai client.

## 🎯 Ce que fait le script

1. **Trouve un établissement et une chambre** disponibles
2. **Crée un Payment Intent** Stripe avec toutes les métadonnées
3. **Simule le paiement** (mode test Stripe)
4. **Déclenche le webhook** pour créer la réservation
5. **Envoie l'email de confirmation** dans la langue choisie
6. **Affiche un résumé complet** avec tous les détails

## 📋 Prérequis

### 1. Serveur de développement lancé

```bash
npm run dev
```

### 2. Webhooks Stripe configurés (pour les étapes 4-6)

**Option A: Utiliser Stripe CLI (RECOMMANDÉ pour test local)**

```bash
# Installer Stripe CLI
brew install stripe/stripe-cli/stripe

# Se connecter
stripe login

# Forwarder les webhooks vers localhost
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

**Option B: Tester directement sur Vercel**
Les webhooks fonctionnent automatiquement en production.

## 🚀 Utilisation

### Test en français (par défaut)

```bash
npm run test:booking
```

### Test en anglais

```bash
npm run test:booking:en
```

### Test en allemand

```bash
npm run test:booking:de
```

### Test avec options avancées

```bash
# Avec un chien
npx tsx scripts/test-complete-booking.ts fr withDog

# Sans chien
npx tsx scripts/test-complete-booking.ts en withoutDog
```

## 📧 Email de test

Par défaut, l'email est envoyé à : `perrottet.guillaume.1997@gmail.com`

Pour changer l'email, ajoutez dans `.env.local` :

```env
TEST_EMAIL=votre.email@exemple.com
```

## 🧹 Nettoyage automatique

Par défaut, les réservations de test sont **conservées** pour que vous puissiez les voir dans l'admin.

Pour les supprimer automatiquement après le test :

```env
CLEANUP_TEST_BOOKING=true
```

## 📊 Exemple de sortie

```
======================================================================
🧪 TEST COMPLET D'UNE RÉSERVATION
======================================================================

🇫🇷 Langue: Français
📧 Email: perrottet.guillaume.1997@gmail.com
👤 Client: Guillaume Perrottet
🐕 Chien: Non spécifié (général)
👥 Voyageurs: 2 adulte(s), 0 enfant(s)
📅 Check-in: Dans 7 jours
🌙 Durée: 3 nuit(s)

📍 ÉTAPE 1: Recherche d'un établissement et d'une chambre...
   ✅ Établissement: Camping du lac (camping-du-lac)
   ✅ Chambre: Emplacement Standard - 50.00 CHF/nuit

💰 ÉTAPE 2: Calcul des dates et du prix...
   📅 Check-in: 17.10.2025
   📅 Check-out: 20.10.2025
   💵 Prix de base: 150.00 CHF
   💵 Commission: 15.00 CHF
   💵 Frais fixes: 2.00 CHF
   💵 TOTAL: 167.00 CHF

💳 ÉTAPE 3: Création du Payment Intent Stripe...
   ✅ Payment Intent créé: pi_xxxxxxxxxxxxx

✅ ÉTAPE 4: Simulation du paiement Stripe...
   ⏳ Attente du webhook...

📦 ÉTAPE 5: Vérification de la réservation...
   ✅ Réservation créée: #100022

📧 ÉTAPE 6: Envoi de l'email de confirmation...
   ✅ Email de confirmation envoyé !

======================================================================
✨ TEST TERMINÉ AVEC SUCCÈS !
======================================================================

📋 RÉSUMÉ DE LA RÉSERVATION:
   • Numéro: #100022
   • Établissement: Camping du lac
   • Chambre: Emplacement Standard
   • Client: Guillaume Perrottet
   • Email: perrottet.guillaume.1997@gmail.com
   • Check-in: 17.10.2025
   • Check-out: 20.10.2025
   • Montant: 150.00 CHF
   • Statut: succeeded
   • Langue: 🇫🇷 FR
   • Chien: ➖ Non spécifié

📬 VÉRIFICATIONS:
   [ ] Vérifiez votre email
   [ ] L'email est dans la bonne langue
   [ ] Les informations sont correctes
   [ ] Le design s'affiche correctement
   [ ] La réservation apparaît dans l'admin

🔗 LIENS UTILES:
   • Admin: http://localhost:3000/admin/camping-du-lac
   • Stripe Dashboard: https://dashboard.stripe.com/test/payments/pi_xxx
   • Invoice: http://localhost:3000/invoice/xxx
```

## ✅ Checklist après le test

1. [ ] Email reçu dans la bonne langue
2. [ ] Variables correctement remplacées (nom, dates, etc.)
3. [ ] Design correct
4. [ ] Réservation visible dans l'admin
5. [ ] Drapeau de langue affiché dans la modal
6. [ ] Bon template utilisé (général/avec chien/sans chien)

## 🐛 Dépannage

### "Réservation pas encore créée (webhook en attente)"

➡️ Les webhooks ne sont pas configurés. Suivez les instructions ci-dessus pour installer Stripe CLI.

### "Erreur Payment Intent"

➡️ Vérifiez que :

- Votre serveur dev tourne (`npm run dev`)
- Vous avez un établissement et une chambre active dans la DB
- Stripe est bien configuré (`STRIPE_SECRET_KEY` dans `.env.local`)

### "Erreur email"

➡️ Vérifiez que :

- `RESEND_API_KEY` est configuré dans `.env.local`
- Vous avez créé des templates d'email dans l'admin
- Le template existe pour la langue testée

### Email en français au lieu de la langue choisie

➡️ Créez les templates dans toutes les langues :

1. Allez dans Admin → Confirmations
2. Créez le template FR
3. Cliquez sur "Propager vers toutes les langues"
4. Traduisez les textes pour EN et DE

## 💡 Conseils

- **Premier test** : Lancez d'abord en français pour vérifier que tout fonctionne
- **Webhooks locaux** : Utilisez Stripe CLI pour un test complet en local
- **Production** : Testez directement sur Vercel où les webhooks fonctionnent automatiquement
- **Nettoyage** : Gardez quelques réservations de test pour vérifier l'affichage dans l'admin

## 🔗 Voir aussi

- [Documentation Stripe Testing](https://stripe.com/docs/testing)
- [Stripe CLI](https://stripe.com/docs/stripe-cli)
- [Guide multilingue](./MULTILINGUAL_EMAIL_ADMIN_GUIDE.md)

---

**Note** : Ce script est conçu pour le développement et les tests uniquement. En production, les réservations sont créées automatiquement via le flow Stripe normal.
