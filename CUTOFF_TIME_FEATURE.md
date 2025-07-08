# Fonctionnalité Heure Limite - Guide d'implémentation

## 🎯 **Objectif**

Permettre aux administrateurs de définir une heure limite après laquelle les nouvelles réservations ne sont plus acceptées (ex: après 22h00, afficher "Il est trop tard pour réserver"), ainsi qu'une heure de réouverture personnalisée.

## ✅ **Ce qui a été fait**

### 1. **Interface utilisateur (SettingsManager.tsx)**

- ✅ Ajout de la checkbox "Activer une heure limite pour les réservations"
- ✅ Input time pour sélectionner l'heure limite (format 24h)
- ✅ **NOUVEAU**: Input time pour sélectionner l'heure de réouverture
- ✅ Affichage conditionnel des inputs quand la fonctionnalité est activée
- ✅ Messages informatifs dynamiques incluant l'heure de réouverture
- ✅ Validation frontend

### 2. **Schema Prisma**

- ✅ Ajout des champs `enableCutoffTime`, `cutoffTime` et `reopenTime` au modèle `Establishment`
- ✅ Migration appliquée avec succès (20250708153523_add_reopen_time)
- ✅ Valeurs par défaut configurées

### 3. **API mise à jour**

- ✅ Support complet des champs `enableCutoffTime`, `cutoffTime` et `reopenTime`
- ✅ Validation du format d'heure (HH:mm) pour les deux champs
- ✅ Code API entièrement fonctionnel

## 🔄 **Logique de réouverture**

L'heure de réouverture détermine quand les réservations redeviennent disponibles :

- **Valeur par défaut** : `00:00` (minuit)
- **Comportement** : Si l'heure limite est dépassée, les réservations redeviennent disponibles à l'heure de réouverture le lendemain
- **Exemples** :
  - Heure limite : `22:00`, Réouverture : `00:00` → Réservations disponibles de minuit à 22h
  - Heure limite : `22:00`, Réouverture : `06:00` → Réservations disponibles de 6h à 22h

## 🛠 **Utilitaires créés**

### 1. **time-utils.ts**

Fonction `checkCutoffTime()` mise à jour pour supporter l'heure de réouverture :

```typescript
checkCutoffTime(enableCutoffTime, cutoffTime, reopenTime);
```

## 🚀 **Intégration côté client**

Pour intégrer cette fonctionnalité dans votre composant de réservation :

```typescript
// 1. Importer l'utilitaire
import { checkCutoffTime } from '@/lib/time-utils';

// 2. Dans votre composant de réservation
const { enableCutoffTime, cutoffTime, reopenTime } = establishment;
const cutoffResult = checkCutoffTime(enableCutoffTime, cutoffTime, reopenTime);

// 3. Vérifier si les réservations sont bloquées
if (cutoffResult.isAfterCutoff) {
  return (
    <div className="text-center p-8">
      <h2>Il est trop tard pour réserver</h2>
      <p>{cutoffResult.message}</p>
    </div>
  );
}

// 4. Afficher le formulaire normal si tout va bien
return <BookingForm />;
```

## 🚀 **Fonctionnement attendu**

### **Interface Admin**

1. Admin va dans les paramètres de l'établissement
2. Coche "Activer une heure limite pour les réservations"
3. Sélectionne une heure (ex: 22:00)
4. Sauvegarde

### **Côté client (à implémenter)**

1. Client scanne le QR code après l'heure limite
2. Système vérifie l'heure actuelle vs heure limite
3. Si dépassé : affiche "Il est trop tard pour réserver aujourd'hui"
4. Sinon : processus normal

## 📋 **Prochaines étapes d'implémentation**

### 1. **Logique de vérification côté client**

Créer une fonction utilitaire :

```typescript
// lib/time-utils.ts
export function isAfterCutoffTime(
  enableCutoffTime: boolean,
  cutoffTime: string
): boolean {
  if (!enableCutoffTime || !cutoffTime) return false;

  const now = new Date();
  const [hours, minutes] = cutoffTime.split(":").map(Number);
  const cutoff = new Date();
  cutoff.setHours(hours, minutes, 0, 0);

  return now > cutoff;
}
```

### 2. **Intégration dans le BookingForm**

- Charger les paramètres de l'établissement
- Vérifier l'heure limite avant d'afficher le formulaire
- Afficher un message d'erreur approprié si trop tard

### 3. **Message personnalisé**

```tsx
// Dans BookingForm.tsx
if (
  isAfterCutoffTime(establishment.enableCutoffTime, establishment.cutoffTime)
) {
  return (
    <div className="text-center p-8">
      <h2 className="text-xl font-bold text-red-600 mb-4">
        ⏰ Il est trop tard pour réserver
      </h2>
      <p className="text-gray-600">
        Les réservations ne sont plus acceptées après {establishment.cutoffTime}
        . Veuillez revenir demain ou contacter directement l'établissement.
      </p>
    </div>
  );
}
```

## 🎨 **Interface utilisateur actuelle**

L'interface est déjà fonctionnelle et affiche :

- ✅ Checkbox pour activer/désactiver
- ✅ Input time qui apparaît seulement si activé
- ✅ Message dynamique qui indique l'état
- ✅ Validation du format d'heure
- ✅ Informations détaillées dans la section aide

## 🔧 **Test de l'interface**

Vous pouvez déjà tester l'interface :

1. Aller dans l'admin d'un établissement
2. Section "Paramètres"
3. Voir la nouvelle option "Heure limite"
4. Tester l'activation/désactivation
5. Changer l'heure et voir le message se mettre à jour

**Note** : La sauvegarde ne fonctionne pas encore car les champs ne sont pas en base de données, mais l'interface est prête !
