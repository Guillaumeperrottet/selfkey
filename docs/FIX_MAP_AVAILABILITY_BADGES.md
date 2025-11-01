# Fix : Chargement des badges de disponibilité sur la map

## Problème identifié

Lors de l'affichage de la page `/map`, les badges de disponibilité affichaient d'abord tous les établissements comme "disponibles", puis se mettaient à jour pour afficher le statut réel (fermé/complet). Cela créait une mauvaise expérience utilisateur avec un effet de "clignotement".

### Cause

Le problème venait du fait que :

1. Les établissements étaient chargés via `fetchEstablishments()`
2. Les données de disponibilité étaient chargées en parallèle via le hook `useAvailability()`
3. Le rendu se faisait immédiatement, affichant un badge par défaut avec `status="available"` en attendant les vraies données

## Solution implémentée

### 1. Modification de la condition de chargement

**Fichier**: `src/app/map/page.tsx`

**Avant**:

```tsx
if (loading) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <VanLoading message={t.map.discovering} size="lg" />
    </div>
  );
}
```

**Après**:

```tsx
// Attendre que les établissements ET les données de disponibilité soient chargés
if (loading || (establishments.length > 0 && availabilityLoading)) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <VanLoading
        message={
          loading ? t.map.discovering : "Chargement des disponibilités..."
        }
        size="lg"
      />
    </div>
  );
}
```

### 2. Amélioration de l'affichage des badges

**Avant**:

```tsx
{availabilityData[spot.slug] ? (
  <AvailabilityBadge ... />
) : (
  <AvailabilityBadge
    status="available"  // ❌ Affichage trompeur
    loading={availabilityLoading}
  />
)}
```

**Après**:

```tsx
{availabilityData[spot.slug] ? (
  <AvailabilityBadge ... />
) : (
  <AvailabilityBadge
    status="available"
    loading={true}  // ✅ Toujours en loading si pas de données
  />
)}
```

## Résultat

- ✅ L'utilisateur voit un écran de chargement jusqu'à ce que TOUTES les données soient prêtes
- ✅ Les badges affichent immédiatement le bon statut (fermé/disponible/complet)
- ✅ Plus d'effet de "clignotement" ou de changement brusque après le chargement
- ✅ Meilleure expérience utilisateur avec un message de chargement approprié

## Performance

Cette modification n'impacte pas négativement les performances car :

- Le chargement des disponibilités est déjà parallélisé (toutes les API sont appelées en même temps)
- L'utilisateur attend quelques secondes de plus au chargement initial, mais voit immédiatement des données cohérentes
- Le rafraîchissement automatique (toutes les 2 minutes) ne déclenche pas de rechargement de la page

## Tests recommandés

1. Charger la page `/map` avec plusieurs établissements
2. Vérifier que tous les badges affichent le bon statut dès l'affichage
3. Tester avec des établissements fermés, complets et disponibles
4. Vérifier le rafraîchissement automatique après 2 minutes

## Date de modification

1 novembre 2025
