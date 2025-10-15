# Icônes d'équipements Selfcamp

Ce dossier contient le composant `AmenityIcon` qui fournit des icônes SVG personnalisées pour les équipements et services de Selfcamp.

## 🎨 Design

Les icônes utilisent la couleur signature de Selfcamp : **#84994F** (vert olive)

Chaque icône est conçue avec :

- Des lignes épurées et modernes
- Une opacité variable pour créer de la profondeur
- Une taille personnalisable
- Une cohérence visuelle avec la marque Selfcamp

## 📦 Utilisation

```tsx
import { AmenityIcon } from "@/components/ui/amenity-icon";

// Utilisation basique
<AmenityIcon type="wifi" />

// Avec taille personnalisée
<AmenityIcon type="parking" size={32} />

// Avec classe CSS supplémentaire
<AmenityIcon type="restaurant" className="hover:scale-110" />
```

## 🎯 Types d'icônes disponibles

| Type            | Description        |
| --------------- | ------------------ |
| `wifi`          | WiFi gratuit       |
| `electricity`   | Électricité        |
| `water`         | Eau potable        |
| `showers`       | Douches            |
| `toilets`       | Toilettes          |
| `wasteDisposal` | Vidange eaux usées |
| `parking`       | Parking            |
| `security`      | Sécurité 24h/24    |
| `restaurant`    | Restaurant         |
| `store`         | Boutique           |
| `laundry`       | Laverie            |
| `playground`    | Aire de jeux       |
| `petFriendly`   | Animaux acceptés   |

## 🔧 Props

| Prop        | Type          | Default | Description                 |
| ----------- | ------------- | ------- | --------------------------- |
| `type`      | `AmenityType` | -       | Type d'équipement (requis)  |
| `size`      | `number`      | `24`    | Taille de l'icône en pixels |
| `className` | `string`      | `""`    | Classes CSS supplémentaires |

## 🎨 Exemples de mise en page

### Grille d'équipements

```tsx
<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
  {amenities.map((amenity) => (
    <div
      key={amenity.type}
      className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-[#84994F]/5 to-transparent border-l-2 border-[#84994F]/30"
    >
      <AmenityIcon type={amenity.type} size={28} />
      <span className="text-sm font-medium text-gray-700">{amenity.label}</span>
    </div>
  ))}
</div>
```

### Liste simple

```tsx
<ul className="space-y-2">
  {amenities.map((amenity) => (
    <li key={amenity.type} className="flex items-center gap-2">
      <AmenityIcon type={amenity.type} size={20} />
      <span>{amenity.label}</span>
    </li>
  ))}
</ul>
```

## 🌟 Avantages

✅ **Personnalisé** - Design unique Selfcamp, pas d'emojis génériques
✅ **Cohérent** - Tous les styles sont uniformes
✅ **Flexible** - Taille et couleur personnalisables
✅ **Performant** - SVG inline, pas de requêtes HTTP
✅ **Accessible** - Composants React avec props TypeScript
✅ **Responsive** - S'adapte à toutes les tailles d'écran
