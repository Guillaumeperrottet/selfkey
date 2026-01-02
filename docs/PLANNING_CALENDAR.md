# Planning des Réservations - React Big Calendar

## 📅 Nouvelle Fonctionnalité

Visualisation calendrier mensuel de toutes les réservations de l'établissement.

## 🎯 Fonctionnalités

### Vue Calendrier

- **Vue mensuelle** : Affichage de toutes les réservations du mois
- **Navigation** : Boutons précédent/suivant + bouton "Aujourd'hui"
- **Filtrage** : Sélection par chambre/place ou toutes les chambres

### Informations au Survol

Tooltip détaillé au survol d'une réservation :

- Numéro de réservation
- Nom du client
- Email et téléphone
- Chambre/Place
- Dates d'arrivée et de départ
- Durée du séjour
- Nombre de personnes
- Montant
- Type (nuitée ou parking jour)

### Impression

- **Bouton "Imprimer"** : Impression optimisée pour une page landscape
- **Format A4 paysage** : Tout le calendrier sur une seule page
- **Styles préservés** : Couleurs et mise en page conservées

## 📍 Localisation

### Dans le menu admin

- **Groupe** : Réservations
- **Position** : Après "Réservations", avant "Finances"
- **Route** : `/admin` avec `activeTab="planning"`

## 🎨 Design

### Couleurs

- **Événements** : Indigo (#6366f1) - couleur neutre unique
- **Jour actuel** : Jaune clair (#fef3c7)
- **Hover** : Indigo foncé (#4f46e5)

### Responsive

- **Desktop** : Vue complète avec tous les contrôles
- **Tablette** : Navigation et filtres adaptés
- **Mobile** : Scroll horizontal possible

## 🔧 Implémentation Technique

### Librairies

- `react-big-calendar@1.19.4` - Composant calendrier
- `@types/react-big-calendar@1.16.3` - Types TypeScript
- `date-fns` - Localisation française (déjà installé)

### Fichiers créés/modifiés

1. **Nouveau** : `src/components/admin/dashboard/BookingCalendar.tsx`
2. **Modifié** : `src/components/admin/dashboard/AdminDashboard.tsx`
3. **Modifié** : `src/components/admin/AdminSidebar.tsx`
4. **Modifié** : `src/app/globals.css`

### Props du composant

```typescript
interface BookingCalendarProps {
  bookings: Booking[]; // Toutes les réservations
  rooms: Room[]; // Liste des chambres
}
```

## 📊 Données Affichées

### Statistiques en bas

- Total des réservations affichées
- Nombre de chambres actives
- Période en cours

### Format des événements

```
[Chambre] - [Prénom] [Nom]
```

## 🖨️ Impression

### Configuration automatique

- **Format** : Landscape (paysage)
- **Marges** : 1cm
- **Police** : Réduite à 10px pour tout faire tenir
- **Masqué** : Contrôles et en-têtes (classe `.no-print`)

### CSS Print Media Query

```css
@media print {
  @page {
    size: landscape;
    margin: 1cm;
  }
  .no-print {
    display: none !important;
  }
  .rbc-calendar {
    height: auto !important;
  }
}
```

## 🚀 Utilisation

1. **Accéder** : Menu Admin > Réservations > Planning
2. **Naviguer** : Boutons ◀ Aujourd'hui ▶
3. **Filtrer** : Sélectionner une chambre dans le dropdown
4. **Survoler** : Passer la souris sur une réservation pour voir les détails
5. **Imprimer** : Cliquer sur le bouton "Imprimer"

## ✅ Avantages

- ✅ Vue d'ensemble rapide de l'occupation
- ✅ Identification facile des périodes creuses/pleines
- ✅ Export/impression facile pour partage
- ✅ Pas de drag & drop (évite les erreurs de manipulation)
- ✅ Information complète au hover
- ✅ Performances optimales (pas de requêtes supplémentaires)

## 🔮 Évolutions Possibles

- [ ] Vue semaine / jour
- [ ] Export PDF du calendrier
- [ ] Légende avec couleurs par statut de paiement
- [ ] Filtres multiples (type de réservation, statut)
- [ ] Vue multi-établissements
