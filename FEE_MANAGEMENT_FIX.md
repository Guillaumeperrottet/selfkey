# 💰 Gestion des Frais et Commissions - Fix

## 🔍 Problème Identifié

Il y avait une incohérence dans la gestion des frais de plateforme :

1. **Variables d'environnement** : Configurées à 0% commission et 3 CHF de frais fixes
2. **Base de données** : Les établissements étaient créés avec des valeurs par défaut de 0 pour les deux champs
3. **Interface admin** : Affichait parfois des frais différents de ce qui était réellement appliqué

## ✅ Solution Implémentée

### 1. **Correction du Schéma de Base de Données**

```prisma
model Establishment {
  // ...
  commissionRate    Float @default(0)     // 0% par défaut
  fixedFee         Float @default(3.00)   // 3.00 CHF par défaut
  // ...
}
```

### 2. **Mise à Jour de la Création d'Établissements**

Les nouveaux établissements sont maintenant créés avec les frais configurés dans l'environnement :

```typescript
// src/app/api/establishments/route.ts & src/lib/auth-utils.ts
const establishment = await prisma.establishment.create({
  data: {
    name,
    slug,
    commissionRate: parseFloat(process.env.PLATFORM_COMMISSION_RATE || "0"),
    fixedFee: parseFloat(process.env.PLATFORM_FIXED_FEE || "3.00"),
  },
});
```

### 3. **Correction des Valeurs par Défaut dans fee-calculator.ts**

```typescript
export const defaultPlatformConfig = {
  commissionRate: parseFloat(process.env.PLATFORM_COMMISSION_RATE || "0") / 100, // 0% = 0.00
  fixedFee: parseFloat(process.env.PLATFORM_FIXED_FEE || "3.00"), // 3.00 CHF
};
```

### 4. **Migration des Données Existantes**

Un script `update-establishment-fees.js` a été créé et exécuté pour mettre à jour les établissements existants.

## 🎯 Configuration Actuelle

### Variables d'Environnement (.env)

```bash
PLATFORM_COMMISSION_RATE="0"    # 0% de commission
PLATFORM_FIXED_FEE="3.00"       # 3 CHF par transaction
```

### Comportement

- **Nouveaux établissements** : Créés automatiquement avec 0% commission et 3 CHF de frais fixes
- **Calcul des frais** : Utilise les valeurs de la base de données pour chaque établissement
- **Interface admin** : Affiche les frais réels et permet la modification via `/admin/commissions`

## 🔧 Gestion des Frais

### 1. **Frais par Défaut**

- **Commission** : 0% (pas de pourcentage sur le prix)
- **Frais fixes** : 3.00 CHF par réservation

### 2. **Calcul du Montant Net**

Pour une place à 25 CHF :

- Prix affiché : 25.00 CHF
- Commission (0%) : 0.00 CHF
- Frais fixes : 3.00 CHF
- **Montant net** : 22.00 CHF

### 3. **Modification des Frais**

Les frais peuvent être modifiés pour chaque établissement via :

- Interface Super Admin : `/admin/commissions`
- API : `PATCH /api/admin/update-commission`

## 📊 Points de Vérification

### Vérifier les Frais d'un Établissement

```bash
# Via l'API
curl "http://localhost:3000/api/establishments/camping/fees"

# Résultat attendu :
{
  "commissionRate": 0,
  "fixedFee": 3,
  "currency": "CHF"
}
```

### Vérifier le Calcul

```typescript
import { calculateFees } from "@/lib/fee-calculator";

const result = calculateFees(25, 0, 3); // prix, commission, frais fixes
// result.netAmount should be 22.00
```

## 🎯 Logique Infaillible

### 1. **Hiérarchie de Priorité**

1. Frais spécifiques à l'établissement (base de données)
2. Frais par défaut (variables d'environnement)
3. Fallback hardcodé (0% commission, 3 CHF frais)

### 2. **Cohérence Garantie**

- Tous les nouveaux établissements utilisent les mêmes frais par défaut
- Les établissements existants ont été migrés
- L'interface affiche toujours les frais réels appliqués

### 3. **Flexibilité**

- Possibilité d'ajuster les frais par établissement
- Possibilité de changer les frais par défaut via les variables d'environnement
- Interface super admin pour la gestion centralisée

## 🔄 Scripts Utiles

### Vérifier l'État des Frais

```bash
node update-establishment-fees.js
```

### Réinitialiser les Frais aux Valeurs par Défaut

Si besoin de remettre tous les établissements aux frais par défaut, modifier le script pour forcer la mise à jour.

## 📝 Tests de Validation

### 1. **Nouveau Établissement**

- Créer un nouvel établissement
- Vérifier qu'il a 0% commission et 3 CHF de frais fixes
- Vérifier que le calcul du net est correct

### 2. **Modification des Frais**

- Aller sur `/admin/commissions`
- Modifier les frais d'un établissement
- Vérifier que les nouveaux frais sont appliqués partout

### 3. **Cohérence Interface**

- L'affichage du montant net dans la gestion des places doit correspondre aux frais configurés
- Le tooltip doit afficher le bon détail des calculs

## ✅ Résultat Final

Maintenant vous avez :

- ✅ Une logique de frais infaillible et cohérente
- ✅ Des frais par défaut de 0% commission et 3 CHF de frais fixes
- ✅ La possibilité d'augmenter les frais si besoin via l'interface admin
- ✅ Un affichage correct du montant net partout dans l'interface
- ✅ Une migration automatique des données existantes
