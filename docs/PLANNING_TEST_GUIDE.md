# 🧪 Test du Planning des Réservations

## Étapes de test

### 1. Accès au Planning

```
1. Lancer le serveur : npm run dev
2. Se connecter à l'admin : /admin
3. Aller dans la sidebar : Réservations > Planning
```

### 2. Vérifications visuelles

#### ✅ Vue principale

- [ ] Le calendrier s'affiche correctement
- [ ] Les événements (réservations) apparaissent comme des barres bleues
- [ ] Le jour actuel est surligné en jaune
- [ ] Les en-têtes des jours sont bien visibles

#### ✅ Contrôles de navigation

- [ ] Boutons "Précédent" / "Suivant" fonctionnent
- [ ] Bouton "Aujourd'hui" ramène au mois actuel
- [ ] Le titre affiche le mois et l'année en cours

#### ✅ Dropdown de filtrage

- [ ] La liste déroulante affiche "Toutes les chambres" + liste des chambres
- [ ] Le filtrage par chambre fonctionne (seules les réservations de cette chambre apparaissent)
- [ ] Le compteur en bas se met à jour

### 3. Test des tooltips

#### ✅ Au survol d'une réservation

- [ ] Un tooltip apparaît
- [ ] Contient toutes les informations :
  - Numéro de réservation
  - Nom complet du client
  - Email
  - Téléphone (si présent)
  - Chambre/Place
  - Date d'arrivée (format dd/MM/yyyy)
  - Date de départ (format dd/MM/yyyy)
  - Durée en nuits
  - Nombre de personnes
  - Montant en CHF
  - Type de réservation

### 4. Test d'impression

#### ✅ Bouton "Imprimer"

1. Cliquer sur le bouton "Imprimer"
2. La fenêtre d'impression s'ouvre
3. Vérifier :
   - [ ] Format paysage (landscape)
   - [ ] Tout le calendrier tient sur une page
   - [ ] Les contrôles (boutons, filtres) n'apparaissent pas
   - [ ] Les couleurs sont préservées
   - [ ] Les réservations sont lisibles (texte réduit mais visible)

### 5. Test de performance

#### ✅ Avec beaucoup de réservations

- [ ] Le calendrier charge rapidement (< 2s)
- [ ] Le scroll est fluide
- [ ] Les tooltips apparaissent instantanément
- [ ] Pas de lag lors de la navigation entre mois

### 6. Test responsive

#### ✅ Desktop (> 1024px)

- [ ] Vue complète avec tous les contrôles
- [ ] Les événements sont bien espacés

#### ✅ Tablette (768px - 1024px)

- [ ] Les contrôles s'adaptent
- [ ] Le calendrier reste lisible

#### ✅ Mobile (< 768px)

- [ ] Scroll horizontal possible si nécessaire
- [ ] Les tooltips fonctionnent au tap

## 🐛 Problèmes potentiels

### Si le calendrier ne s'affiche pas

```bash
# Vérifier que react-big-calendar est bien installé
npm list react-big-calendar

# Réinstaller si nécessaire
pnpm add react-big-calendar @types/react-big-calendar
```

### Si les styles sont cassés

```css
/* Vérifier que l'import CSS est présent dans globals.css */
@import "react-big-calendar/lib/css/react-big-calendar.css";
```

### Si les tooltips ne fonctionnent pas

- Vérifier que `TooltipProvider` entoure bien le calendrier
- Tester le `delayDuration` (actuellement 100ms)

## 📸 Captures d'écran attendues

### Vue normale

```
┌─────────────────────────────────────────────────────────┐
│  Planning des réservations        [<] Aujourd'hui [>]   │
│  [Toutes les chambres ▼]          [Imprimer]            │
├─────────────────────────────────────────────────────────┤
│       Lun  Mar  Mer  Jeu  Ven  Sam  Dim                 │
│ 1                              [Rés 1]                   │
│ 2     [Réservation 2────────]                            │
│ 3                      [Rés 3]                           │
│ ...                                                      │
└─────────────────────────────────────────────────────────┘
```

### Tooltip au survol

```
┌─────────────────────────────┐
│ Réservation #123            │
├─────────────────────────────┤
│ Client: Jean Dupont         │
│ Email: jean@example.com     │
│ Tél: +41 79 123 45 67      │
│ Chambre/Place: Place 1      │
│ Arrivée: 15/01/2026         │
│ Départ: 17/01/2026          │
│ Durée: 2 nuits              │
│ Personnes: 2                │
│ Montant: 150.00 CHF         │
│ Type: Nuitée                │
└─────────────────────────────┘
```

## ✨ Résultat attendu

Une vue calendrier professionnelle qui permet de :

1. **Visualiser** rapidement l'occupation du mois
2. **Identifier** les périodes creuses et pleines
3. **Consulter** les détails de chaque réservation au survol
4. **Filtrer** par chambre pour une vue ciblée
5. **Imprimer** le planning sur une seule page A4 paysage

## 🎉 Si tout fonctionne

Le planning est opérationnel ! Vous pouvez maintenant :

- Former votre équipe sur cette nouvelle vue
- L'utiliser pour planifier les nettoyages
- Imprimer et afficher le planning
- Identifier rapidement les disponibilités
