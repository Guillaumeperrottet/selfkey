# Guide d'utilisation - Codes QR pour réservation

## 🎯 Objectif

Cette fonctionnalité permet aux hôteliers de générer et imprimer des codes QR qui redirigent directement vers leur page de réservation. Les clients peuvent scanner le code avec leur téléphone pour réserver une chambre instantanément.

## 📱 Fonctionnalités

### 1. Génération automatique de codes QR

- **Accès** : Dashboard Admin → "Code QR imprimable" ou directement `/admin/[hotel]/qr-code`
- **Contenu** : Le QR code redirige vers `votre-domaine.com/[hotel-slug]`
- **Format** : PNG haute qualité, optimisé pour l'impression

### 2. Aperçu dans le dashboard

- **Localisation** : Dashboard Admin, section centrale
- **Fonctionnalité** : Aperçu rapide du QR code avec lien direct

### 3. Options d'impression et de téléchargement

- **Impression directe** : Bouton "Imprimer" avec mise en page optimisée
- **Téléchargement** : Format PNG pour intégration dans vos supports
- **Taille** : Optimisé pour impression A4 et supports marketing

## 🛠 Comment utiliser

### Étape 1 : Accéder au générateur

1. Connectez-vous au dashboard admin : `/admin/[votre-hotel]`
2. Cliquez sur "Code QR imprimable" dans les actions rapides
3. Ou utilisez l'aperçu central et cliquez "Gérer et imprimer"

### Étape 2 : Générer et télécharger

1. Le code QR se génère automatiquement
2. Vérifiez l'URL de destination affichée
3. Options disponibles :
   - **Imprimer** : Impression directe avec mise en page soignée
   - **Télécharger** : Fichier PNG pour vos supports

### Étape 3 : Déployer physiquement

1. **Emplacements recommandés** :
   - Hall d'entrée principal
   - Réception / comptoir d'accueil
   - Vitrines extérieures
   - Supports publicitaires

2. **Bonnes pratiques** :
   - Hauteur des yeux (1,5m - 1,8m)
   - Support résistant aux intempéries
   - Éclairage suffisant
   - Test régulier du scan

## 📋 Exemples d'utilisation

### 🏨 Hôtels

- Affichage en réception pour check-in tardif
- Panneaux d'entrée pour réservations spontanées
- Cartes de visite et flyers

### 🏠 Chambres d'hôtes

- Panneau devant la propriété
- Intégration dans les annonces locales
- Support pour événements locaux

### 🏢 Établissements commerciaux

- Intégration dans la signalétique existante
- Supports marketing événementiels
- Partenariats avec offices de tourisme

## 🔧 Aspects techniques

### Format du QR Code

- **Taille** : 256x256px (affichage), 320x320px (impression)
- **Format** : PNG avec transparence
- **Encodage** : URL complète de réservation
- **Compatibilité** : Tous les lecteurs QR standard

### URL générée

```
https://votre-domaine.com/[hotel-slug]
```

### Responsive et accessibilité

- Interface adaptée mobile/desktop
- Contraste optimisé pour tous les écrans
- Texte alternatif pour accessibilité

## 🎨 Personnalisation possible

Si vous souhaitez personnaliser l'apparence :

1. **Couleurs** : Modifiez les couleurs dans `QRCodeGenerator.tsx`
2. **Taille** : Ajustez les paramètres `width` dans la génération
3. **Logo** : Possibilité d'ajouter un logo central (modification code requise)
4. **Mise en page impression** : Modifiez la section imprimable du composant

## 🚀 Avantages

- **Sans contact** : Réservation directe via smartphone
- **Accessible** : Aucune app spéciale requise
- **Professionnel** : Améliore l'image de marque
- **Efficace** : Réduit les frictions de réservation
- **Mesurable** : Suivi possible via analytics web

## 📞 Support

En cas de problème ou pour des personnalisations, consultez le code source dans :

- `/src/components/QRCodeGenerator.tsx` - Générateur principal
- `/src/components/QRCodePreview.tsx` - Aperçu dashboard
- `/src/app/admin/[hotel]/qr-code/page.tsx` - Page dédiée
