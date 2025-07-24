# 🎨 Personnalisation du Formulaire de Réservation

## 🎯 Objectif

Cette fonctionnalité permet aux hôteliers de personnaliser le formulaire de réservation en masquant les champs dont ils n'ont pas besoin, rendant ainsi l'expérience client plus fluide et adaptée à leurs besoins spécifiques.

## 📱 Comment y accéder

1. **Connexion admin** : Se connecter au dashboard administrateur
2. **Navigation** : Aller dans l'onglet "Formulaire de réservation" dans la sidebar
3. **Configuration** : Activer/désactiver les champs selon vos besoins

## 🛠 Fonctionnalités

### ✅ **Champs personnalisables**

#### **Champs obligatoires (non modifiables)**

- ✅ Nombre d'adultes
- ✅ Prénom
- ✅ Nom
- ✅ Email
- ✅ Téléphone mobile

#### **Champs optionnels (peuvent être masqués)**

- 🔧 Nombre d'enfants
- 🔧 Date de naissance
- 🔧 Lieu de naissance
- 🔧 Adresse
- 🔧 Code postal
- 🔧 Localité
- 🔧 Pays
- 🔧 N° de permis ou carte d'identité
- 🔧 N° d'immatriculation du véhicule

### ✅ **Interface de gestion**

- **Vue d'ensemble** : Aperçu du nombre de champs activés
- **Catégories claires** : Séparation entre champs obligatoires et optionnels
- **Icônes visuelles** : 👁️ pour les champs visibles, 👁️‍🗨️ pour les champs masqués
- **Descriptions** : Explication de l'utilité de chaque champ
- **Sauvegarde instantanée** : Les modifications prennent effet immédiatement

## 🚀 **Avantages**

### **Pour l'hôtelier**

- **Flexibilité** : Adapter le formulaire selon ses besoins
- **Simplicité** : Réduire la friction pour les clients
- **Contrôle** : Choisir quelles informations collecter

### **Pour le client**

- **Rapidité** : Formulaire plus court et plus rapide à remplir
- **Clarté** : Moins de champs inutiles à remplir
- **Fluidité** : Expérience de réservation améliorée

## 🎨 **Interface utilisateur**

### **Page de configuration**

```
┌─────────────────────────────────────────┐
│ 🎨 Personnalisation du formulaire      │
├─────────────────────────────────────────┤
│ 12 sur 14 champs activés               │
│                                         │
│ ℹ️ Informations importantes :           │
│ • Les champs obligatoires ne peuvent   │
│   pas être désactivés                  │
│ • Configuration pour réservations nuit │
│ • Effet immédiat                       │
│                                         │
│ 📋 Champs obligatoires                 │
│ ✅ Prénom                   [Obligatoire]│
│ ✅ Nom                      [Obligatoire]│
│ ✅ Email                    [Obligatoire]│
│ ✅ Téléphone                [Obligatoire]│
│                                         │
│ 📝 Champs optionnels                   │
│ 👁️ Date de naissance        [☑️]       │
│ 👁️‍🗨️ Lieu de naissance       [☐]       │
│ 👁️ Adresse                  [☑️]       │
│ 👁️‍🗨️ Code postal             [☐]       │
│                                         │
│           [Sauvegarder]                 │
└─────────────────────────────────────────┘
```

### **Formulaire client (exemple personnalisé)**

```
┌─────────────────────────────────────────┐
│ 📝 Informations de réservation         │
├─────────────────────────────────────────┤
│ Nombre d'adultes: [2] ▼                │
│ Prénom: [Jean]                          │
│ Nom: [Dupont]                           │
│ Email: [jean@example.com]               │
│ Téléphone: [+41 79 123 45 67]          │
│ Adresse: [Rue de la Paix 123]          │
│                                         │
│ ← Champs masqués :                      │
│   Date de naissance, Code postal,      │
│   Lieu de naissance, etc.              │
│                                         │
│        [Continuer vers le résumé]       │
└─────────────────────────────────────────┘
```

## 🔧 **Aspects techniques**

### **Base de données**

- **Champ ajouté** : `formConfig` (JSON) dans la table `Establishment`
- **Type** : Configuration flexible stockée en JSON
- **Valeurs par défaut** : Tous les champs activés

### **Structure de configuration**

```json
{
  "clientBirthDate": { "enabled": true, "required": false },
  "clientBirthPlace": { "enabled": false, "required": false },
  "clientAddress": { "enabled": true, "required": false },
  "clientPostalCode": { "enabled": false, "required": false },
  "clientCity": { "enabled": true, "required": false },
  "clientCountry": { "enabled": true, "required": false },
  "clientIdNumber": { "enabled": false, "required": false },
  "clientVehicleNumber": { "enabled": true, "required": false }
}
```

### **APIs créées**

- `GET /api/admin/[hotel]/form-config` - Récupérer la configuration (admin)
- `POST /api/admin/[hotel]/form-config` - Sauvegarder la configuration (admin)
- `GET /api/establishments/[hotel]/form-config` - Configuration publique (client)

### **Composants créés**

- `FormCustomizer.tsx` - Interface de gestion
- `useFormConfig.ts` - Hook pour la configuration
- Modifications dans `BookingForm.tsx` - Rendu conditionnel

## 📋 **Guide d'utilisation**

### **Étape 1 : Accéder à la configuration**

1. Se connecter au dashboard admin
2. Aller dans "Formulaire de réservation"

### **Étape 2 : Personnaliser les champs**

1. Visualiser les champs obligatoires (non modifiables)
2. Activer/désactiver les champs optionnels selon vos besoins
3. Voir l'aperçu en temps réel

### **Étape 3 : Sauvegarder**

1. Cliquer sur "Sauvegarder la configuration"
2. La modification prend effet immédiatement
3. Tester avec une nouvelle réservation

### **Étape 4 : Vérification**

1. Aller sur votre page de réservation publique
2. Vérifier que les champs masqués n'apparaissent plus
3. Tester la réservation complète

## 💡 **Cas d'usage recommandés**

### **Hôtel urbain moderne**

- Masquer : Lieu de naissance, N° d'identification
- Garder : Adresse, Véhicule (pour parking)

### **Chambres d'hôtes rurales**

- Masquer : Code postal, Pays (si local)
- Garder : Téléphone, Date de naissance (hospitalité)

### **Parking de nuit simple**

- Masquer : Adresse, Lieu de naissance, Code postal
- Garder : Véhicule, Téléphone, Email

### **Établissement international**

- Garder : Tous les champs d'adresse, Pays
- Masquer : Lieu de naissance

## ⚠️ **Points d'attention**

### **Champs obligatoires**

- Les champs marqués comme obligatoires ne peuvent jamais être désactivés
- Ils sont essentiels au fonctionnement de la réservation

### **Impact sur la validation**

- La validation côté client s'adapte automatiquement
- Seuls les champs activés et requis sont validés
- La validation côté serveur reste identique

### **Compatibilité**

- Cette configuration s'applique uniquement aux réservations de nuit
- Les réservations parking jour utilisent leur propre formulaire simplifié
- Les réservations existantes ne sont pas affectées

## 🔄 **Évolutions futures possibles**

### **Version avancée**

- Configuration par type de chambre
- Champs conditionnels (ex: véhicule si parking disponible)
- Templates de configuration prédéfinis

### **Intégration**

- Export de la configuration
- Import de configurations entre établissements
- API publique pour développeurs tiers

---

## 📞 **Support**

En cas de problème ou pour des questions :

1. Vérifiez que tous les champs obligatoires restent actifs
2. Testez une réservation après chaque modification
3. Consultez les logs en cas d'erreur de sauvegarde

_Dernière mise à jour : 24 juillet 2025_
