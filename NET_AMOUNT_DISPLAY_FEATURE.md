# Affichage du Montant Net dans la Liste des Places (Dashboard Admin)

## 📋 Résumé

Cette fonctionnalité affiche de façon transparente le montant net réellement touché par l'admin après déduction des frais de plateforme, directement dans la liste des places du dashboard admin.

## ✨ Fonctionnalités ajoutées

### 1. Affichage du montant net dans la liste des places

- **Emplacement** : Dashboard admin → Section "Places" → Liste des places
- **Affichage** : À côté du prix affiché au client
- **Format** : `Net: XX.XX CHF` avec icône tendance descendante
- **Couleur** : Vert émeraude pour bien distinguer du prix client

### 2. Tooltip explicatif au survol

- **Déclenchement** : Survol du montant net
- **Contenu** : Décomposition complète du calcul
  - Prix affiché au client
  - Commission (% et montant)
  - Frais fixes
  - **Montant net final**

### 3. Calcul dynamique par établissement

- **Source** : Frais récupérés dynamiquement depuis la BDD pour chaque établissement
- **Paramètres** : `commissionRate` et `fixedFee` spécifiques à chaque hôtel
- **Fallback** : Frais par défaut depuis les variables d'environnement

## 🎯 Objectif atteint

L'admin voit immédiatement dans la liste des places :

1. Le **prix affiché** au client (ex: "25 CHF")
2. Le **montant net** qu'il recevra réellement (ex: "Net: 24.65 CHF")
3. Le **détail du calcul** au survol pour transparence maximale

## 🔧 Implémentation technique

### Fichiers modifiés

- **`src/components/RoomManagement.tsx`** : Ajout de l'affichage du montant net avec tooltip

### Composants utilisés

- **`useEstablishmentFees`** : Hook pour récupérer les frais dynamiquement
- **`calculateFees`** : Utilitaire de calcul des frais et montant net
- **`Tooltip`** : Composant UI pour l'explication du calcul

### Structure de l'affichage

```tsx
// Prix affiché
<div className="flex items-center gap-1">
  <DollarSign className="h-3 w-3" />
  <span>{room.price} CHF</span>
</div>

// Montant net avec tooltip
<Tooltip>
  <TooltipTrigger asChild>
    <div className="flex items-center gap-1 text-emerald-600 cursor-help">
      <TrendingDown className="h-3 w-3" />
      <span className="font-medium">
        Net: {netAmount} CHF
      </span>
    </div>
  </TooltipTrigger>
  <TooltipContent>
    {/* Décomposition détaillée du calcul */}
  </TooltipContent>
</Tooltip>
```

## 🎨 Interface utilisateur

### Affichage dans la liste

```
Place 1
💰 25 CHF  |  📉 Net: 24.65 CHF  |  Active
```

### Tooltip au survol du montant net

```
Calcul des frais :
Prix affiché: 25.00 CHF
Commission (1%): -0.25 CHF
Frais fixes: -0.10 CHF
─────────────────────────
Montant net: 24.65 CHF
```

## ✅ Avantages

### Pour l'administrateur

- **Transparence immédiate** : Voit le montant réel sans calculs
- **Comparaison facile** : Prix client vs montant net côte à côte
- **Compréhension claire** : Tooltip expliquant le calcul détaillé

### Pour la plateforme

- **Confiance renforcée** : Transparence totale sur les frais
- **Gestion facilitée** : Admin comprend immédiatement ses revenus
- **Pas de surprise** : Montant affiché = montant réellement versé

## 🔄 États de l'affichage

### Cas normal

- **Prix affiché** : Visible
- **Montant net** : Visible en vert avec icône
- **Tooltip** : Disponible au survol

### Pendant le chargement des frais

- **Prix affiché** : Visible
- **Montant net** : Masqué
- **Indication** : Aucune (évite le clignotement)

### En cas d'erreur de chargement des frais

- **Prix affiché** : Visible
- **Montant net** : Utilise les frais par défaut
- **Comportement** : Graceful fallback

## 🚀 Extensions possibles

### Court terme

- Affichage du montant net dans d'autres vues (réservations, statistiques)
- Export des données avec montants nets
- Historique des frais appliqués

### Moyen terme

- Simulation de différents taux de commission
- Comparaison avant/après modification des frais
- Graphiques revenus nets vs prix affichés

## 🧪 Tests recommandés

1. **Affichage correct** : Vérifier que le montant net s'affiche bien
2. **Calcul exact** : Valider la formule mathématique
3. **Tooltip** : S'assurer que l'explication est claire
4. **Performance** : Pas de ralentissement de la liste
5. **Responsive** : Affichage correct sur mobile

## 📝 Notes de développement

### Performance

- Les frais sont chargés une seule fois par établissement
- Le calcul est fait côté client (pas d'appel API supplémentaire)
- Hook avec cache pour éviter les requêtes répétées

### Accessibilité

- Tooltip accessible au clavier
- Contraste suffisant pour le texte vert
- Icônes avec signification claire

Cette fonctionnalité complète parfaitement le système de transparence des frais en affichant l'information cruciale là où l'admin en a le plus besoin : dans la liste de ses places.
