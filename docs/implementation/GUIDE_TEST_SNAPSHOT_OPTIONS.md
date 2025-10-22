# 🧪 Guide de Test - Système de Snapshot des Options

## 📋 Checklist de Test

### ✅ Test 1 : Nouvelle Réservation avec Options

**Objectif :** Vérifier que le nouveau format enrichi est correctement stocké et affiché

#### Étapes :

1. Démarrer le serveur de développement

   ```bash
   npm run dev
   ```

2. Créer une nouvelle réservation :
   - Choisir un établissement
   - Sélectionner des dates
   - Choisir une chambre
   - **Sélectionner plusieurs options de prix** (petit-déjeuner, parking, etc.)
   - Remplir les informations client
   - Finaliser la réservation

3. Vérifier dans le Dashboard Admin :
   - Ouvrir la réservation
   - **Vérifier que les options s'affichent avec leurs noms complets**
   - Exemple attendu : "Petit-déjeuner: Avec petit-déjeuner +15.00 CHF"

4. Télécharger la facture PDF :
   - Cliquer sur "Télécharger la facture"
   - **Vérifier que toutes les options sont listées avec détails**

5. Vérifier le récapitulatif :
   - Aller sur la page de récapitulatif de la réservation
   - **Vérifier l'affichage des options**

#### ✅ Résultats Attendus :

- [ ] Dashboard affiche les noms complets des options
- [ ] Facture PDF contient tous les détails
- [ ] Récapitulatif montre les options correctement
- [ ] Tous les totaux sont corrects

---

### ✅ Test 2 : Vérification du Format en Base de Données

**Objectif :** S'assurer que le snapshot enrichi est correctement stocké

#### Étapes :

1. Ouvrir l'outil d'inspection de la base de données (Prisma Studio) :

   ```bash
   npx prisma studio
   ```

2. Naviguer vers la table `Booking`

3. Ouvrir la dernière réservation créée

4. Examiner le champ `selectedPricingOptions`

#### ✅ Format Attendu :

```json
{
  "cmgkltx3v0001la048jvslotk": {
    "optionId": "cmgkltx3v0001la048jvslotk",
    "optionName": "Petit-déjeuner",
    "optionType": "radio",
    "valueId": "cmgkltxed0005la04x8834hai",
    "valueLabel": "Avec petit-déjeuner",
    "priceModifier": 15,
    "selectedAt": "2025-10-22T..."
  }
}
```

#### ✅ Résultats Attendus :

- [ ] Le champ contient des objets enrichis (pas juste des IDs)
- [ ] Tous les champs sont présents (optionName, valueLabel, priceModifier, etc.)
- [ ] Le timestamp `selectedAt` est présent

---

### ✅ Test 3 : Compatibilité avec Anciennes Réservations

**Objectif :** Vérifier que les anciennes réservations fonctionnent toujours

#### Étapes :

1. Dans le Dashboard Admin, ouvrir une **ancienne réservation** (créée avant l'implémentation)

2. Vérifier l'affichage :
   - Si les options existent toujours dans l'admin → Devrait afficher les noms
   - Si les options ont été modifiées/supprimées → Devrait afficher "Configuration modifiée"

3. Télécharger la facture d'une ancienne réservation

#### ✅ Résultats Attendus :

- [ ] Aucune erreur JavaScript
- [ ] L'affichage fonctionne (avec détails ou fallback)
- [ ] La facture se génère correctement
- [ ] Les totaux sont toujours corrects

---

### ✅ Test 4 : Scénario de Modification d'Options

**Objectif :** Vérifier que le snapshot protège contre les modifications futures

#### Étapes :

1. Créer une nouvelle réservation avec une option spécifique
   - Exemple : "Petit-déjeuner: Avec petit-déjeuner"

2. Noter le détail exact affiché dans l'admin

3. Aller dans l'admin des options de prix de l'établissement
   - Modifier le nom ou le prix de cette option
   - Exemple : Renommer "Avec petit-déjeuner" → "Breakfast included"
   - Ou changer le prix de 15 CHF → 18 CHF

4. Retourner voir la réservation dans le dashboard

#### ✅ Résultats Attendus :

- [ ] La réservation affiche toujours **l'ancien nom** ("Avec petit-déjeuner")
- [ ] Le prix affiché est toujours **l'ancien prix** (15 CHF)
- [ ] Aucune erreur
- [ ] Le snapshot a bien protégé les données historiques

---

### ✅ Test 5 : Plusieurs Types d'Options

**Objectif :** Tester avec tous les types d'options (radio, checkbox, select)

#### Étapes :

1. Créer une réservation avec :
   - Une option **radio** (ex: Petit-déjeuner)
   - Une option **checkbox** multiple (ex: plusieurs services)
   - Une option **select** (si vous en avez)

2. Vérifier l'affichage dans tous les endroits :
   - Dashboard admin
   - Facture PDF
   - Récapitulatif de réservation

#### ✅ Résultats Attendus :

- [ ] Options radio : 1 seule valeur affichée correctement
- [ ] Options checkbox : toutes les valeurs cochées affichées
- [ ] Options select : valeur sélectionnée affichée
- [ ] Tous les prix sont corrects et additionnés

---

### ✅ Test 6 : Facture PDF Complète

**Objectif :** Vérifier tous les détails dans la facture

#### Étapes :

1. Créer une réservation "complète" :
   - Avec options de prix
   - Avec taxe de séjour
   - Avec tous les détails client

2. Télécharger la facture PDF

3. Vérifier chaque section :
   - En-tête avec infos établissement
   - Infos client
   - Détails de réservation
   - **Ligne pour chaque option** avec nom + prix
   - Sous-total chambre
   - Sous-total options
   - Taxe de séjour
   - Frais de plateforme
   - Total TTC

#### ✅ Résultats Attendus :

- [ ] Toutes les sections présentes
- [ ] Options listées individuellement avec noms complets
- [ ] Tous les calculs corrects
- [ ] PDF bien formaté et lisible

---

## 🚨 Erreurs Possibles et Solutions

### Erreur : "Cannot read property 'optionName'"

**Cause :** Ancienne réservation avec format ancien  
**Solution :** Normal, le fallback devrait gérer ça automatiquement

### Options ne s'affichent pas

**Vérification :**

1. Ouvrir la console navigateur (F12)
2. Chercher des erreurs JavaScript
3. Vérifier que les données sont bien dans `selectedPricingOptions`

### Facture vide ou incomplète

**Vérification :**

1. Vérifier que les `pricingOptions` sont bien chargées
2. Regarder les logs console pour le décodage
3. Vérifier que `isEnrichedFormat()` retourne la bonne valeur

---

## 📊 Validation Finale

Une fois tous les tests passés, vérifier :

- [ ] ✅ Aucune erreur en console
- [ ] ✅ Tous les affichages corrects
- [ ] ✅ Factures PDF complètes
- [ ] ✅ Anciennes réservations fonctionnent
- [ ] ✅ Nouvelles réservations utilisent le snapshot
- [ ] ✅ Modification d'options ne casse pas l'historique

## 🎯 Commandes Utiles

```bash
# Démarrer le serveur de développement
npm run dev

# Ouvrir Prisma Studio (inspection BDD)
npx prisma studio

# Voir les logs en temps réel
# (déjà visible dans le terminal où npm run dev tourne)

# Build pour vérifier qu'il n'y a pas d'erreurs TypeScript
npm run build
```

---

## 📝 Notes de Test

Utilisez cette section pour noter vos observations pendant les tests :

### Test 1 - Nouvelle Réservation

- Date : ****\_\_\_****
- Résultat : ⬜ PASS / ⬜ FAIL
- Notes :

### Test 2 - Format BDD

- Date : ****\_\_\_****
- Résultat : ⬜ PASS / ⬜ FAIL
- Notes :

### Test 3 - Anciennes Réservations

- Date : ****\_\_\_****
- Résultat : ⬜ PASS / ⬜ FAIL
- Notes :

### Test 4 - Modification Options

- Date : ****\_\_\_****
- Résultat : ⬜ PASS / ⬜ FAIL
- Notes :

### Test 5 - Types d'Options

- Date : ****\_\_\_****
- Résultat : ⬜ PASS / ⬜ FAIL
- Notes :

### Test 6 - Facture PDF

- Date : ****\_\_\_****
- Résultat : ⬜ PASS / ⬜ FAIL
- Notes :

---

**Date de création :** 22 octobre 2025  
**Version testée :** Branche `snapshot`  
**Prêt pour production après :** Tous les tests PASS
