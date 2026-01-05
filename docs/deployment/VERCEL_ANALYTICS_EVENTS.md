# 📊 Vercel Analytics Events - SelfCamp

Documentation complète des événements analytics trackés sur le domaine **SelfCamp**.

## 🎯 Vue d'ensemble

Ce document détaille tous les événements personnalisés trackés via Vercel Analytics pour comprendre le comportement des utilisateurs sur SelfCamp.ch.

## 🏗️ Architecture

### Fichiers clés

- **`src/lib/analytics.ts`** : Définitions des événements et fonctions de tracking
- **`src/hooks/useAnalytics.ts`** : Hook React pour faciliter l'utilisation
- **Composants trackés** : Homepage, Map, Establishment, About, Contact

### Configuration

Les événements sont automatiquement trackés en **production**. En **développement**, ils sont affichés dans la console.

```typescript
// Activer le tracking en développement
NEXT_PUBLIC_ENABLE_ANALYTICS = true;
```

## 📍 Événements par Page

### 🏠 Page d'Accueil (`/`)

#### `homepage_cta_about_clicked`

- **Description** : Clic sur le bouton "En savoir plus" vers la page About
- **Localisation** : Section CTA principale
- **Propriétés** : Aucune
- **Usage** : Mesurer l'intérêt pour la page À propos

#### `homepage_search_used`

- **Description** : Utilisation de la barre de recherche
- **Propriétés** :
  - `query` (string) : Terme de recherche
- **Usage** : Comprendre ce que les utilisateurs recherchent

#### `homepage_map_link_clicked`

- **Description** : Clic vers la carte des emplacements
- **Propriétés** : Aucune
- **Usage** : Mesurer l'engagement vers la carte

#### `homepage_contact_clicked`

- **Description** : Clic sur "Contactez-nous" (header)
- **Propriétés** : Aucune
- **Usage** : Mesurer l'intention de contact

---

### 🗺️ Page Carte (`/map`)

#### `map_establishment_selected`

- **Description** : Sélection d'un établissement sur la carte
- **Propriétés** :
  - `slug` (string) : Identifiant unique de l'établissement
  - `name` (string) : Nom de l'établissement
- **Usage** : Identifier les établissements les plus consultés

#### `map_search_performed`

- **Description** : Recherche effectuée sur la page carte
- **Propriétés** :
  - `query` (string) : Terme de recherche
  - `resultsCount` (number) : Nombre de résultats
- **Usage** : Analyser l'efficacité de la recherche

#### `map_directions_clicked`

- **Description** : Clic sur "Itinéraire" pour ouvrir Google Maps
- **Propriétés** :
  - `slug` (string) : Établissement concerné
  - `name` (string) : Nom de l'établissement
- **Usage** : **Indicateur d'intention de visite réelle**

#### `search_completed`

- **Description** : Recherche avec résultats
- **Propriétés** :
  - `query` (string) : Terme recherché
  - `resultsCount` (number) : Nombre de résultats trouvés
- **Usage** : Mesurer le succès des recherches

#### `search_no_results`

- **Description** : Recherche sans résultats
- **Propriétés** :
  - `query` (string) : Terme sans résultat
- **Usage** : **Identifier les opportunités d'amélioration**

---

### 🏕️ Page Établissement (`/establishment/[slug]`)

#### `establishment_viewed`

- **Description** : Consultation d'une page établissement
- **Propriétés** :
  - `slug` (string) : Identifiant de l'établissement
  - `name` (string) : Nom de l'établissement
- **Usage** : **Mesurer la popularité des établissements**

#### `establishment_directions_clicked`

- **Description** : Clic sur le bouton "Itinéraire"
- **Propriétés** :
  - `slug` (string) : Établissement
  - `name` (string) : Nom
- **Usage** : **Forte intention de visite**

#### `establishment_image_gallery_opened`

- **Description** : Ouverture de la galerie photos (lightbox)
- **Propriétés** :
  - `slug` (string) : Établissement
  - `imageIndex` (number) : Index de l'image cliquée
- **Usage** : Mesurer l'engagement visuel

#### `establishment_contact_clicked`

- **Description** : Clic sur email, téléphone ou site web
- **Propriétés** :
  - `slug` (string) : Établissement
  - `contactType` (string) : "email" | "phone" | "website"
- **Usage** : Comprendre les préférences de contact

#### `establishment_nearby_business_clicked`

- **Description** : Clic sur un commerce à proximité
- **Propriétés** :
  - `slug` (string) : Établissement
  - `businessName` (string) : Nom du commerce
  - `businessType` (string) : Type (restaurant, magasin, etc.)
- **Usage** : Valeur ajoutée des commerces locaux

---

### ℹ️ Page À Propos (`/about`)

#### `about_contact_cta_clicked`

- **Description** : Clic sur "Contactez-nous"
- **Propriétés** :
  - `ctaLocation` (string) : "mobile_bottom" | "desktop_bottom"
- **Usage** : Mesurer les conversions depuis la page About

#### `about_map_cta_clicked`

- **Description** : Clic sur "Voir les aires existantes"
- **Propriétés** :
  - `ctaLocation` (string) : Localisation du CTA
- **Usage** : Engagement vers la carte depuis About

---

### 📧 Page Contact (`/contact`)

#### `contact_form_started`

- **Description** : Début de remplissage du formulaire
- **Propriétés** : Aucune
- **Usage** : Mesurer l'intention de contact initiale

#### `contact_form_submitted`

- **Description** : Soumission du formulaire
- **Propriétés** :
  - `success` (boolean) : Statut de la soumission
- **Usage** : **KPI de conversion principal**

#### `contact_form_error`

- **Description** : Erreur lors de la soumission
- **Propriétés** :
  - `errorType` (string) : Type d'erreur
- **Usage** : Identifier les problèmes techniques

---

### 🔍 Événements de Recherche Globaux

#### `search_initiated`

- **Description** : Début d'une recherche
- **Propriétés** :
  - `query` (string) : Terme de recherche
  - `location` (string) : Page source (homepage, map, etc.)
- **Usage** : Volume de recherches par page

#### `search_suggestion_clicked`

- **Description** : Clic sur une suggestion de recherche
- **Propriétés** :
  - `suggestion` (string) : Suggestion choisie
- **Usage** : Efficacité de l'autocomplétion

---

## 📈 KPIs Clés à Surveiller

### 🎯 Conversion Funnel

1. **Homepage → Map** : `homepage_map_link_clicked`
2. **Map → Establishment** : `map_establishment_selected`
3. **Establishment → Directions** : `establishment_directions_clicked`
4. **About → Contact** : `about_contact_cta_clicked`
5. **Contact Form** : `contact_form_submitted`

### 🔥 Top Priorités

| Événement                          | Priorité   | Pourquoi                      |
| ---------------------------------- | ---------- | ----------------------------- |
| `establishment_viewed`             | 🔴 Haute   | Popularité des établissements |
| `establishment_directions_clicked` | 🔴 Haute   | Intention de visite réelle    |
| `contact_form_submitted`           | 🔴 Haute   | Conversion principale         |
| `search_no_results`                | 🟡 Moyenne | Opportunités d'amélioration   |
| `map_establishment_selected`       | 🟡 Moyenne | Parcours utilisateur          |

---

## 🛠️ Utilisation du Code

### Dans un Composant React

```typescript
import { useAnalytics } from "@/hooks/useAnalytics";

export function MyComponent() {
  const { trackEstablishment } = useAnalytics();

  const handleClick = () => {
    trackEstablishment.viewed("slug-example", "Nom Établissement");
  };

  return <button onClick={handleClick}>Voir</button>;
}
```

### Tracking Direct

```typescript
import { trackEvent, AnalyticsEvents } from "@/lib/analytics";

trackEvent(AnalyticsEvents.HOMEPAGE_CTA_ABOUT_CLICKED);
```

---

## 📊 Dashboard Vercel Analytics

Pour visualiser ces événements :

1. Aller sur [vercel.com/dashboard](https://vercel.com/dashboard)
2. Sélectionner le projet **selfkey**
3. Onglet **Analytics** → **Events**
4. Filtrer par événement personnalisé

### Requêtes Utiles

- **Établissements les plus vus** : Grouper par `slug` sur `establishment_viewed`
- **Taux de conversion contact** : `contact_form_started` → `contact_form_submitted`
- **Recherches populaires** : Top queries sur `search_completed`
- **Recherches échouées** : Analyser `search_no_results`

---

## 🚀 Prochaines Étapes

### Événements à Ajouter (Optionnels)

- **`footer_link_clicked`** : Navigation depuis le footer
- **`availability_checked`** : Vérification de disponibilité
- **`pricing_viewed`** : Consultation des tarifs
- **`amenity_filter_used`** : Filtrage par équipements

### Améliorations

- [ ] Ajouter des événements de scroll (sections vues)
- [ ] Tracker le temps passé sur chaque page
- [ ] Créer des cohortes d'utilisateurs
- [ ] Implémenter A/B testing

---

## 📝 Notes Techniques

- **Production Only** : Les événements ne sont trackés qu'en production par défaut
- **Type-Safe** : Toutes les fonctions sont typées TypeScript
- **Performance** : Aucun impact sur les performances (asynchrone)
- **Privacy** : Aucune donnée personnelle n'est collectée

---

## 📞 Support

Pour toute question sur l'analytics :

- **Fichier** : `src/lib/analytics.ts`
- **Documentation Vercel** : [vercel.com/docs/analytics/custom-events](https://vercel.com/docs/analytics/custom-events)

---

**Dernière mise à jour** : 16 octobre 2025
**Version** : 1.0.0
