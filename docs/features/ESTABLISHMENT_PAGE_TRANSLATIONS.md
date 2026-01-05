# Traductions de la Page Établissement

## Vue d'ensemble

Ce document liste toutes les traductions ajoutées pour la page de détail d'un établissement (`/establishment/[slug]`).

## Structure des traductions

### Section `establishment` dans `selfcamp-translations.ts`

#### 1. Navigation et En-tête

- `backToMap` - Bouton retour vers la carte
- `contactUs` - Lien de contact (version desktop)
- `contactShort` - Lien de contact (version mobile)

#### 2. Page Non Trouvée (`notFound`)

- `title` - "Établissement non trouvé"
- `description` - Message d'erreur
- `backButton` - Bouton de retour

#### 3. En-tête de l'Établissement (`header`)

- `open247` - Badge "Ouvert 24h/24"
- `arrival` - Label "Arrivée:"
- `departure` - Label "Départ"
- `departureBefore` - Label "Départ avant"

#### 4. Informations de Contact (`info`)

- `website` - "Site web"
- `directions` - "Itinéraire"

#### 5. Section À Propos (`about`)

- `title` - "À propos"

#### 6. Boutons d'Action (`cta`)

- `bookNow` - "Réserver maintenant"
- `getDirections` - "Obtenir l'itinéraire"

#### 7. Impact Local (`impact`)

- `title` - "L'impact de votre séjour"

#### 8. Commerces à Proximité (`nearby`)

- `title` - "À proximité"
- `website` - "Site web"
- `directions` - "Itinéraire"
- `documents` - "Documents :"

#### 9. Équipements (`amenities`)

- `title` - "Équipements et services"

#### 10. Documents (`documents`)

- `title` - "Documents utiles"

#### 11. CTA Final (`finalCta`)

- `title` - "Prêt à réserver votre place ?"
- `description` - Description de la réservation
- `button` - "Réserver maintenant"

#### 12. Images (`images`)

- `noImage` - "Aucune image disponible"

#### 13. Attributs d'Équipements (`attributes`)

- `wifi` - "WiFi gratuit"
- `electricity` - "Électricité"
- `water` - "Eau potable"
- `showers` - "Douches"
- `toilets` - "Toilettes"
- `wasteDisposal` - "Vidange eaux usées"
- `parking` - "Parking"
- `security` - "Sécurité 24h/24"
- `restaurant` - "Restaurant"
- `store` - "Boutique"
- `laundry` - "Laverie"
- `playground` - "Aire de jeux"
- `petFriendly` - "Animaux acceptés"

## Traductions complètes

### Français (FR)

Tous les textes sont traduits dans un style naturel et professionnel en français.

### Anglais (EN)

Traductions en anglais international, adaptées pour un public anglophone.

### Allemand (DE)

Traductions en allemand standard, adaptées pour la Suisse et l'Allemagne.

## Textes Dynamiques à Traduire

Les textes suivants sont **dynamiques** (viennent de la base de données) et nécessiteront une solution de traduction dynamique :

### Données de l'Établissement

- `establishment.title` - Nom de l'établissement
- `establishment.description` - Description
- `establishment.address` - Adresse
- `establishment.city` - Ville
- `establishment.accessRestrictions` - Restrictions d'accès
- `establishment.localImpactTitle` - Titre de l'impact local
- `establishment.localImpactDescription` - Description de l'impact
- `establishment.touristTaxImpactMessage` - Message sur la taxe de séjour

### Commerces à Proximité

- `business.name` - Nom du commerce
- `business.type` - Type de commerce
- `business.description` - Description
- `business.distance` - Distance

### Documents

- `doc.name` - Nom du document
- `doc.description` - Description du document

## Prochaines Étapes

1. ✅ **Traductions statiques** - TERMINÉ
   - Tous les textes d'interface utilisateur sont traduits
   - 3 langues supportées (FR/EN/DE)

2. ⏳ **Traductions dynamiques** - À FAIRE
   - Décider de l'approche pour les contenus de la base de données
   - Options possibles :
     - Colonnes multilingues dans la BDD (ex: `title_fr`, `title_en`, `title_de`)
     - Table de traductions séparée
     - Service de traduction automatique (Google Translate API, DeepL)
     - Saisie manuelle dans l'admin pour chaque langue

## Utilisation dans le Code

```typescript
import { useSelfcampTranslation } from "@/hooks/useSelfcampTranslation";

export default function EstablishmentPage() {
  const { t } = useSelfcampTranslation();

  return (
    <div>
      <h1>{t.establishment.about.title}</h1>
      <button>{t.establishment.cta.bookNow}</button>
      <span>{t.establishment.attributes.wifi}</span>
    </div>
  );
}
```

## Notes Importantes

- Les traductions couvrent tous les textes statiques de l'interface
- La page charge automatiquement la langue sélectionnée via `useSelfcampTranslation`
- Les images et leur alt text devront également être adaptés si nécessaire
- Les formats de date/heure peuvent nécessiter une localisation spécifique
