# 🐕 Fonctionnalité Templates Email selon Option Chien

## 📝 Description

Cette fonctionnalité permet d'avoir des templates d'email de confirmation différents selon si l'emplacement réservé accepte les chiens ou non.

## ✨ Fonctionnalités

### 🎯 Templates Adaptatifs

- **Template avec chiens** : Utilisé quand l'emplacement accepte les chiens (`allowDogs: true`)
- **Template sans chiens** : Utilisé quand l'emplacement n'accepte pas les chiens (`allowDogs: false`)
- **Template général** : Utilisé comme fallback si aucun template spécifique n'est configuré

### 🔄 Logique de Sélection

1. Si la chambre accepte les chiens ET qu'un template "avec chien" est configuré → Template avec chien
2. Si la chambre n'accepte pas les chiens ET qu'un template "sans chien" est configuré → Template sans chien
3. Sinon → Template général (existant)

### 🎨 Interface d'Administration

- **Onglet "Email Général"** : Template par défaut/fallback
- **Onglet "🐕 Avec Chiens"** : Template spécifique pour emplacements acceptant les chiens
- **Onglet "🚫🐕 Sans Chiens"** : Template spécifique pour emplacements sans chiens
- Les onglets spécifiques ne s'affichent que si l'option chien est activée

## 🛠️ Modifications Techniques

### Base de Données

```sql
-- Nouveaux champs ajoutés à la table establishments
ALTER TABLE "establishments" ADD COLUMN "confirmationEmailTemplateWithDog" TEXT;
ALTER TABLE "establishments" ADD COLUMN "confirmationEmailTemplateWithoutDog" TEXT;
```

### API

- **GET/POST** `/api/admin/[hotel]/confirmation-settings` : Gestion des nouveaux templates
- Support des nouveaux champs dans la réponse et la sauvegarde

### Components

- **ConfirmationManager.tsx** : Interface d'administration avec nouveaux onglets
- Templates par défaut optimisés pour chaque cas d'usage

### Logique Email

- **sendEmailConfirmation()** : Sélection automatique du bon template selon `room.allowDogs`
- Logs pour traçabilité du template utilisé

## 📋 Templates par Défaut

### 🐕 Template Avec Chiens

- Informations spéciales pour propriétaires de chiens
- Règles et zones autorisées
- Contact vétérinaire
- Zone d'exercice pour chiens

### 🚫🐕 Template Sans Chiens

- Mise en avant de la tranquillité
- Espaces premium sans animaux
- Zone de relaxation exclusive
- Avantages des espaces calmes

## 🎯 Cas d'Usage

### 🏕️ Camping avec Zones Séparées

- **Zone A** : Emplacements familiaux avec chiens autorisés
- **Zone B** : Emplacements premium tranquilles sans chiens
- **Emails différents** : Plan du site adapté, informations spécifiques

### 🏨 Hôtel avec Politiques Flexibles

- **Chambres pet-friendly** : Informations animaux, services spéciaux
- **Chambres standard** : Focus tranquillité, services premium

## 🔧 Configuration

### 1. Activer l'Option Chien

1. Aller dans **Paramètres → Gestion des animaux**
2. Activer **"Permettre aux clients d'indiquer s'ils voyagent avec un chien"**

### 2. Configurer les Chambres

1. Aller dans **Gestion des Places**
2. Pour chaque place, cocher/décocher **"🐕 Cette place autorise les chiens"**

### 3. Configurer les Templates

1. Aller dans **Confirmations → Email Général** (template fallback)
2. Si option chien activée → **Confirmations → 🐕 Avec Chiens**
3. Si option chien activée → **Confirmations → 🚫🐕 Sans Chiens**

## 🧪 Tests

### Test de Sélection de Template

```javascript
// Cas 1: Chambre avec chien + template configuré
room.allowDogs = true;
establishment.confirmationEmailTemplateWithDog = "Template avec chien";
// → Utilise le template avec chien

// Cas 2: Chambre sans chien + template configuré
room.allowDogs = false;
establishment.confirmationEmailTemplateWithoutDog = "Template sans chien";
// → Utilise le template sans chien

// Cas 3: Aucun template spécifique configuré
// → Utilise le template général
```

### Vérification Logs

```
📧 Utilisation du template EMAIL AVEC CHIEN
📧 Utilisation du template EMAIL SANS CHIEN
📧 Utilisation du template EMAIL GÉNÉRAL
```

## 🚀 Évolutions Futures

### 📱 WhatsApp

- Templates WhatsApp différents selon option chien
- Messages adaptés pour mobile

### 📊 Statistiques

- Suivi des templates utilisés
- Analytics par type d'emplacement

### 🎨 Personnalisation Avancée

- Templates par type d'animal (chat, etc.)
- Templates par saison/période

---

_Cette fonctionnalité améliore la personnalisation des communications clients selon leurs besoins spécifiques (avec ou sans animaux)._
