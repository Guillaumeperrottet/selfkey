# Migration vers Sonner - Toasts Modernes avec "Undo"

## Vue d'ensemble

L'application SelfKey a été migrée vers **Sonner**, une librairie de toasts moderne offrant des notifications élégantes avec la possibilité d'annuler les actions (bouton "Undo" comme dans l'image de référence).

## Configuration

### 1. Installation

```bash
npm install sonner
```

### 2. Configuration dans le layout principal

```tsx
// src/app/layout.tsx
import { Toaster } from "sonner";

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>
        {children}
        <Toaster
          position="top-right"
          closeButton
          richColors
          expand={false}
          duration={4000}
        />
      </body>
    </html>
  );
}
```

## Utilitaires Toasts (src/lib/toast-utils.ts)

### Toasts basiques

```tsx
import { toastUtils } from "@/lib/toast-utils";

// Toasts simples
toastUtils.success("Opération réussie");
toastUtils.error("Erreur détectée");
toastUtils.info("Information importante");
toastUtils.warning("Attention requise");
toastUtils.loading("Chargement...");
```

### Toasts avec action "Undo"

```tsx
// Toast de succès avec possibilité d'annuler
toastUtils.successWithUndo({
  message: "Place supprimée avec succès",
  undoAction: async () => {
    // Logique de restauration
    await restaurerPlace();
    loadRooms();
  },
  undoLabel: "Restaurer", // Optionnel, défaut: "Annuler"
  duration: 8000, // Optionnel, défaut: 6000ms
});

// Toast d'erreur avec "Réessayer"
toastUtils.errorWithRetry({
  message: "Échec de la sauvegarde",
  retryAction: async () => {
    await sauvegarderDonnees();
  },
  retryLabel: "Réessayer", // Optionnel
  duration: 8000,
});
```

### Toasts de confirmation

```tsx
// Confirmation d'action importante
toastUtils.confirm(
  "Êtes-vous sûr de vouloir supprimer cette place ?",
  async () => {
    await supprimerPlace();
  },
  {
    confirmLabel: "Oui, supprimer",
    cancelLabel: "Annuler",
  }
);
```

### Toasts CRUD pré-configurés

```tsx
// Avec possibilité d'annulation
toastUtils.crud.created("Place", undoAction);
toastUtils.crud.updated("Place", undoAction);
toastUtils.crud.deleted("Place", undoAction);
toastUtils.crud.activated("Place", undoAction);
toastUtils.crud.deactivated("Place", undoAction);

// Sans annulation (toasts simples)
toastUtils.crud.created("Place");
toastUtils.crud.updated("Place");
```

## Pattern d'utilisation recommandé

### 1. Pour les opérations asynchrones

```tsx
const handleSave = async () => {
  const loadingToast = toastUtils.loading("Sauvegarde en cours...");

  try {
    const response = await fetch("/api/save", {
      method: "POST",
      body: JSON.stringify(data),
    });

    toastUtils.dismiss(loadingToast);

    if (response.ok) {
      // Fonction d'annulation
      const undoAction = async () => {
        await fetch("/api/undo", { method: "POST" });
        reloadData();
      };

      toastUtils.crud.created("Élément", undoAction);
    } else {
      toastUtils.error("Erreur lors de la sauvegarde");
    }
  } catch (error) {
    toastUtils.dismiss(loadingToast);
    toastUtils.error("Erreur de connexion");
  }
};
```

### 2. Pour la validation de formulaires

```tsx
const handleSubmit = async () => {
  // Validation
  if (!name.trim()) {
    toastUtils.error("Le nom est requis");
    return;
  }

  if (!email.includes("@")) {
    toastUtils.error("Email invalide");
    return;
  }

  // Traitement...
};
```

## Composants migrés

### ✅ Terminés

- **RoomManagement.tsx** - Gestion des places avec undo sur activation/désactivation
- **BookingForm.tsx** - Formulaire de réservation
- **PricingOptionsManager.tsx** - Options de prix
- **SettingsManager.tsx** - Paramètres d'établissement
- **establishments/page.tsx** - Création d'établissements

### 🔄 En cours (optionnel)

- StripeOnboarding.tsx
- IntegrationManager.tsx
- ConfirmationManager.tsx
- EditCommissionModal.tsx

## Avantages de Sonner

1. **Design moderne** : Toasts élégants et cohérents
2. **Actions intelligentes** : Boutons "Undo" et "Retry"
3. **Performance** : Optimisé et léger
4. **UX améliorée** : Moins intrusif que les Alert/confirm() natifs
5. **Accessibilité** : Support des lecteurs d'écran
6. **Personnalisation** : Facilement stylisable

## Types de toasts disponibles

| Type              | Utilisation         | Durée par défaut |
| ----------------- | ------------------- | ---------------- |
| `success`         | Opération réussie   | 4s               |
| `error`           | Erreur, échec       | 6s               |
| `info`            | Information         | 4s               |
| `warning`         | Avertissement       | 5s               |
| `loading`         | En cours            | Infinie          |
| `successWithUndo` | Succès + annulation | 6s               |
| `errorWithRetry`  | Erreur + retry      | 8s               |
| `confirm`         | Confirmation        | 10s              |

## Configuration du Toaster

```tsx
<Toaster
  position="top-right" // Position : top-left, top-center, top-right, etc.
  closeButton // Bouton X pour fermer
  richColors // Couleurs riches selon le type
  expand={false} // Expansion au hover
  duration={4000} // Durée par défaut
  theme="light" // Thème : light, dark, system
  offset="16px" // Décalage depuis le bord
/>
```

## Migration depuis Alert/alert()

### Avant (ancien système)

```tsx
// Alert composant
{
  error && (
    <Alert variant="destructive">
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  );
}

// alert() natif
if (confirm("Supprimer ?")) {
  // action
}
```

### Après (Sonner)

```tsx
// Toast automatique
toastUtils.error("Message d'erreur");

// Confirmation moderne
toastUtils.confirm("Supprimer ?", () => {
  // action
});
```

L'intégration de Sonner améliore significativement l'expérience utilisateur avec des notifications modernes, élégantes et fonctionnelles ! 🎉
