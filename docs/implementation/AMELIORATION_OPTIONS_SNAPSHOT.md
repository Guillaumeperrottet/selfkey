# Amélioration : Snapshot des Options de Prix lors de la Réservation

## Problème Actuel

Actuellement, `selectedPricingOptions` stocke uniquement les IDs des options et valeurs :

```json
{
  "cmgkltx3v0001la048jvslotk": "cmgkltxed0005la04x8834hai",
  "cmgkltxh10007la04yaacals8": "cmgkltxkw0009la047pzut4w3"
}
```

**Conséquences :**

- Si les options sont modifiées/supprimées dans l'admin, les anciennes réservations ne peuvent plus afficher les détails
- Impossible de savoir exactement ce que le client a choisi au moment de la réservation
- Les factures et récapitulatifs perdent l'information détaillée
- Affichage de messages génériques "Configuration modifiée"

## Solution Recommandée : Enrichir les Données Stockées

### Format Cible

Au lieu de stocker juste les IDs, stocker un **snapshot complet** :

```json
{
  "breakfast": {
    "optionId": "cmgkltx3v0001la048jvslotk",
    "optionName": "Petit-déjeuner",
    "optionType": "radio",
    "valueId": "cmgkltxed0005la04x8834hai",
    "valueLabel": "Avec petit-déjeuner",
    "priceModifier": 15.0,
    "selectedAt": "2025-10-22T10:30:00Z"
  },
  "parking": {
    "optionId": "cmgkltxh10007la04yaacals8",
    "optionName": "Parking",
    "optionType": "checkbox",
    "valueId": "cmgkltxkw0009la047pzut4w3",
    "valueLabel": "Place de parking couverte",
    "priceModifier": 10.0,
    "selectedAt": "2025-10-22T10:30:00Z"
  }
}
```

### Avantages

✅ **Persistance des données** : Même si l'option est supprimée, on sait ce qui a été choisi  
✅ **Factures correctes** : Détail complet des services dans les factures PDF  
✅ **Audit trail** : Historique exact de ce qui a été vendu  
✅ **Compatibilité** : Ancien format toujours supporté (backward compatible)  
✅ **Reporting précis** : Statistiques fiables sur les options vendues

## Plan d'Implémentation

### Phase 1 : Modifier le Schéma de Stockage

**Fichier à modifier :** `/src/components/booking/BookingFormDetails.tsx`

**Dans la fonction qui prépare les données de réservation :**

```typescript
// AVANT (ligne ~350)
selectedPricingOptions: initialSelectedPricingOptions || {},

// APRÈS
selectedPricingOptions: enrichPricingOptions(
  initialSelectedPricingOptions || {},
  pricingOptions // Les options complètes avec tous les détails
),
```

**Créer la fonction d'enrichissement :**

```typescript
// À ajouter dans /src/lib/booking/pricing-options.ts
export function enrichPricingOptions(
  selectedOptions: Record<string, string | string[]>,
  availableOptions: PricingOption[]
): Record<string, EnrichedPricingOption | EnrichedPricingOption[]> {
  const enriched: Record<string, any> = {};

  Object.entries(selectedOptions).forEach(([optionId, valueIds]) => {
    const option = availableOptions.find((o) => o.id === optionId);
    if (!option) return;

    const valueArray = Array.isArray(valueIds) ? valueIds : [valueIds];

    const enrichedValues = valueArray
      .map((valueId) => {
        const value = option.values.find((v) => v.id === valueId);
        if (!value) return null;

        return {
          optionId: option.id,
          optionName: option.name,
          optionType: option.type,
          valueId: value.id,
          valueLabel: value.label,
          priceModifier: value.priceModifier,
          selectedAt: new Date().toISOString(),
        };
      })
      .filter(Boolean);

    // Si checkbox (multiple), garder en array, sinon prendre le premier
    enriched[optionId] =
      option.type === "checkbox" ? enrichedValues : enrichedValues[0];
  });

  return enriched;
}

// Interface TypeScript
export interface EnrichedPricingOption {
  optionId: string;
  optionName: string;
  optionType: "radio" | "checkbox" | "select";
  valueId: string;
  valueLabel: string;
  priceModifier: number;
  selectedAt: string;
}
```

### Phase 2 : Mettre à Jour l'Affichage

**Fichier à modifier :** `/src/components/admin/dashboard/BookingsTable.tsx`

**Dans la section d'affichage des options (ligne ~1400) :**

```typescript
{(() => {
  // Vérifier si on a le nouveau format (enrichi) ou l'ancien (IDs seulement)
  const firstKey = Object.keys(selectedBooking.selectedPricingOptions)[0];
  const firstValue = selectedBooking.selectedPricingOptions[firstKey];
  const isEnrichedFormat = typeof firstValue === 'object' && firstValue.optionName;

  if (isEnrichedFormat) {
    // NOUVEAU FORMAT : Utiliser les données enrichies directement
    return Object.values(selectedBooking.selectedPricingOptions).flat().map((opt: any) => (
      <div key={opt.valueId} className="flex justify-between pl-3">
        <span className="text-muted-foreground text-xs">
          • {opt.optionName}: {opt.valueLabel}
        </span>
        <span className={`font-medium text-xs ${
          opt.priceModifier < 0 ? "text-green-600" : ""
        }`}>
          {opt.priceModifier >= 0 ? "+" : ""}
          {formatCHF(opt.priceModifier)}
        </span>
      </div>
    ));
  } else {
    // ANCIEN FORMAT : Essayer de décoder avec pricingOptions actuels
    // (code existant)
    let foundOptions = 0;
    // ... reste du code actuel
  }
})()}
```

### Phase 3 : Compatibilité avec les Factures

**Fichiers à modifier :**

- `/src/components/invoice/InvoiceDownload.tsx`
- `/src/lib/email/templates/confirmation.ts`

**Mettre à jour pour utiliser les données enrichies si disponibles :**

```typescript
// Dans la génération de facture
const formatPricingOptions = (selectedOptions: any) => {
  // Vérifier le format
  if (isEnrichedFormat(selectedOptions)) {
    return Object.values(selectedOptions)
      .flat()
      .map((opt: any) => ({
        name: opt.optionName,
        label: opt.valueLabel,
        price: opt.priceModifier,
      }));
  }

  // Fallback ancien format
  return decodePricingOptions(selectedOptions, pricingOptions);
};
```

### Phase 4 : Migration (Optionnel)

**Pour les anciennes réservations, deux options :**

#### Option A : Ne rien faire

- Les anciennes réservations affichent "Configuration modifiée"
- Pas de migration nécessaire
- Simple et sans risque

#### Option B : Migration partielle

- Créer un script de migration pour enrichir les anciennes réservations
- **Risque** : Si les options ont changé, on ne peut pas recréer les données exactes
- Mieux vaut accepter que l'historique est perdu pour les anciennes

**Recommandation : Option A** - Accepter que les anciennes réservations n'ont pas le détail.

## Fichiers à Créer/Modifier

### Nouveaux Fichiers

1. **`/src/lib/booking/pricing-options.ts`**
   - Fonction `enrichPricingOptions()`
   - Interface `EnrichedPricingOption`
   - Fonction `isEnrichedFormat()` (helper)

### Fichiers à Modifier

1. **`/src/components/booking/BookingFormDetails.tsx`**
   - Ligne ~350 : Enrichir les options avant de les stocker
   - Importer la fonction d'enrichissement

2. **`/src/components/admin/dashboard/BookingsTable.tsx`**
   - Ligne ~1400 : Détecter et afficher le nouveau format
   - Garder la compatibilité avec l'ancien format

3. **`/src/components/invoice/InvoiceDownload.tsx`**
   - Utiliser les données enrichies pour les factures
   - Fallback sur l'ancien système si nécessaire

4. **`/src/lib/email/templates/confirmation.ts`**
   - Email de confirmation avec détails enrichis
   - Meilleur formatage des options

## Tests à Effectuer

### Test 1 : Nouvelle Réservation

1. Créer une réservation avec des options
2. Vérifier dans la BDD que `selectedPricingOptions` contient le format enrichi
3. Vérifier l'affichage dans l'admin
4. Télécharger la facture et vérifier le détail

### Test 2 : Modification des Options

1. Modifier ou supprimer une option dans l'admin
2. Créer une nouvelle réservation avec les nouvelles options
3. Vérifier qu'une ancienne réservation affiche toujours correctement ses options

### Test 3 : Ancienne Réservation

1. Ouvrir une réservation créée avant l'implémentation
2. Vérifier qu'elle affiche "Configuration modifiée" (fallback)
3. Vérifier que le total des options est correct

### Test 4 : Factures

1. Générer une facture pour une nouvelle réservation
2. Vérifier que toutes les options sont listées avec leurs prix
3. Vérifier les calculs HT/TTC/TVA

## Estimation de Temps

- **Phase 1** : 1-2 heures (création fonction enrichissement + tests)
- **Phase 2** : 30 min (affichage avec détection format)
- **Phase 3** : 1 heure (factures + emails)
- **Phase 4** : 0 heure (pas de migration)
- **Tests** : 1 heure

**Total estimé : 3-4 heures**

## Notes Importantes

⚠️ **Attention à la taille des données**

- Le nouveau format est plus verbeux
- Vérifier que la colonne `selectedPricingOptions` (type `Json` dans Prisma) peut stocker ~5-10 KB
- Pas de problème avec PostgreSQL (limite 1 GB par champ JSON)

⚠️ **Performance**

- Pas d'impact sur les performances (données déjà chargées)
- Réduction des requêtes pour charger les pricingOptions lors de l'affichage

⚠️ **Backward Compatibility**

- Le code doit **toujours** supporter l'ancien format
- Ne jamais supprimer le code de fallback
- Les anciennes réservations ne seront jamais migrées

## Avantages Business

💰 **Conformité légale** : Conservation exacte de ce qui a été vendu  
📊 **Analytics** : Statistiques précises sur les options populaires  
🧾 **Factures professionnelles** : Détail complet pour la comptabilité  
🔍 **Audit** : Traçabilité complète des transactions  
⚡ **Performance** : Moins de requêtes pour afficher les détails

## Alternatives Considérées

### Alternative 1 : Table séparée `booking_pricing_options`

**Avantages :**

- Structure relationnelle pure
- Requêtes SQL complexes possibles

**Inconvénients :**

- Plus complexe à implémenter
- Jointures supplémentaires
- Pas nécessaire pour ce cas d'usage

**Verdict : ❌ Trop complexe pour peu d'avantages**

### Alternative 2 : Soft delete des options

**Avantages :**

- Garde l'historique des options
- Permet de reconstruire les anciennes réservations

**Inconvénients :**

- BDD qui grossit avec des données obsolètes
- Complexité de gestion (isActive, isArchived, etc.)
- Pollution de l'interface admin

**Verdict : ❌ Maintenance difficile**

### Alternative 3 : Snapshot complet (CHOIX RETENU)

**Avantages :**

- Simple à implémenter
- Données garanties disponibles
- Pas de requêtes supplémentaires
- Facile à comprendre et déboguer

**Inconvénients :**

- Duplication de données (acceptable)
- Légèrement plus d'espace de stockage (négligeable)

**Verdict : ✅ Meilleur compromis simplicité/efficacité**

## Conclusion

Cette amélioration garantira que **chaque réservation conserve l'exact détail** de ce qui a été acheté, indépendamment des modifications futures de la configuration. C'est essentiel pour la conformité légale, la comptabilité et la satisfaction client.

L'implémentation est simple, backward-compatible et n'impacte pas les performances.

---

**Date de création :** 22 octobre 2025  
**Priorité :** Moyenne (amélioration future)  
**Complexité :** Moyenne (3-4 heures)  
**Impact :** Élevé (qualité des données et factures)
