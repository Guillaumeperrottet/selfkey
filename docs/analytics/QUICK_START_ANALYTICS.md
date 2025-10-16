# 🚀 Guide Rapide - Analytics SelfCamp

## ⚡ Démarrage Rapide

### 1. Importer le hook

```typescript
import { useAnalytics } from "@/hooks/useAnalytics";
```

### 2. Utiliser dans votre composant

```typescript
export function MyComponent() {
  const { trackEstablishment } = useAnalytics();

  const handleEstablishmentClick = (slug: string, name: string) => {
    trackEstablishment.viewed(slug, name);
  };

  return <div onClick={() => handleEstablishmentClick("mon-slug", "Mon Établissement")}>...</div>;
}
```

## 📚 Exemples d'Utilisation

### Page d'Accueil

```typescript
const { trackHomepage } = useAnalytics();

// CTA vers About
<Link href="/about" onClick={() => trackHomepage.ctaAboutClicked()}>
  En savoir plus
</Link>

// Recherche
<SearchBar onSearch={(query) => trackHomepage.searchUsed(query)} />
```

### Page Map

```typescript
const { trackMap } = useAnalytics();

// Sélection d'établissement
trackMap.establishmentSelected(establishment.slug, establishment.name);

// Recherche avec résultats
trackMap.searchPerformed(query, results.length);

// Clic sur directions
trackMap.directionsClicked(slug, name);
```

### Page Établissement

```typescript
const { trackEstablishment } = useAnalytics();

// Vue de la page
useEffect(() => {
  trackEstablishment.viewed(slug, name);
}, [slug, name]);

// Galerie photos
trackEstablishment.imageGalleryOpened(slug, imageIndex);

// Contact
trackEstablishment.contactClicked(slug, "email");
```

### Page Contact

```typescript
const { trackContact } = useAnalytics();

// Début du formulaire
const handleFirstInput = () => {
  trackContact.formStarted();
};

// Soumission
const handleSubmit = async () => {
  try {
    // ... submit logic
    trackContact.formSubmitted(true);
  } catch (error) {
    trackContact.formError("submission_failed");
  }
};
```

## 🎯 Événements Disponibles

| Catégorie         | Méthodes                                                                                                               |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------- |
| **Homepage**      | `ctaAboutClicked()`, `searchUsed(query)`, `mapLinkClicked()`, `contactClicked()`                                       |
| **Map**           | `establishmentSelected(slug, name)`, `searchPerformed(query, count)`, `directionsClicked(slug, name)`                  |
| **Establishment** | `viewed(slug, name)`, `directionsClicked(slug, name)`, `imageGalleryOpened(slug, index)`, `contactClicked(slug, type)` |
| **About**         | `contactCtaClicked(location)`, `mapCtaClicked(location)`                                                               |
| **Contact**       | `formStarted()`, `formSubmitted(success)`, `formError(type)`                                                           |
| **Search**        | `initiated(query, location)`, `completed(query, count)`, `noResults(query)`                                            |

## 🔍 Mode Debug

En développement, les événements sont affichés dans la console :

```
📊 Analytics Event: establishment_viewed { slug: "mon-slug", name: "Mon Établissement" }
```

Pour activer en développement :

```bash
# .env.local
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

## 📊 Visualiser les Données

1. Aller sur [vercel.com/dashboard](https://vercel.com/dashboard)
2. Sélectionner le projet **selfkey**
3. Analytics → Events
4. Filtrer par événement personnalisé

## 🎨 Bonnes Pratiques

### ✅ À Faire

```typescript
// Tracker les actions importantes
trackEstablishment.viewed(slug, name);

// Utiliser des noms descriptifs
trackContact.formError("invalid_email");

// Tracker au bon moment
useEffect(() => {
  trackEstablishment.viewed(slug, name);
}, [slug, name]);
```

### ❌ À Éviter

```typescript
// Ne pas tracker dans les boucles
establishments.forEach((est) => {
  trackEstablishment.viewed(est.slug, est.name); // ❌
});

// Ne pas tracker les données sensibles
trackContact.formSubmitted({ email: user.email }); // ❌

// Ne pas oublier les dépendances
useEffect(() => {
  trackEstablishment.viewed(slug, name);
}); // ❌ Missing dependencies
```

## 📝 Documentation Complète

Voir [`docs/VERCEL_ANALYTICS_EVENTS.md`](./VERCEL_ANALYTICS_EVENTS.md) pour la liste complète des événements et leurs propriétés.

## 🆘 Support

En cas de problème :

1. Vérifier la console en mode développement
2. Consulter la documentation Vercel : [vercel.com/docs/analytics/custom-events](https://vercel.com/docs/analytics/custom-events)
3. Examiner `src/lib/analytics.ts` pour la logique de tracking
