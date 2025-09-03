# 🖼️ Drag & Drop d'Images - SelfKey

## 🎯 Fonctionnalité Implémentée

Système de glisser-déposer d'images directement dans les templates d'email de confirmation, rendant l'ajout d'images aussi simple qu'un drag & drop !

## ✨ Fonctionnalités

### 🖱️ Interface Drag & Drop

- **Glisser-déposer** : Faites glisser vos images directement dans la zone prévue
- **Sélection de fichiers** : Bouton pour choisir des fichiers manuellement
- **Multi-upload** : Ajoutez plusieurs images en une fois
- **Prévisualisation** : Miniatures des images uploadées

### 🔧 Formats & Limitations

- **Formats supportés** : JPG, PNG, GIF, WebP
- **Taille maximale** : 5MB par image
- **Validation automatique** : Vérification du type et de la taille

### 🚀 Insertion Automatique

- **Ajout direct** : L'image est automatiquement ajoutée au template
- **Code HTML optimisé** : Génération automatique des balises `<img>`
- **Styles intégrés** : Taille et marges préconfiguées
- **Réutilisation** : Images récentes disponibles pour réinsertion

## 🎨 Interface Utilisateur

### Onglet "Images" dans ConfirmationManager

```
┌─────────────────────────────────────┐
│ Variables & Images                  │
├─────────────┬───────────────────────┤
│ Variables   │ Images                │
│             │                       │
│             │ ┌─────────────────┐   │
│             │ │  Drag & Drop    │   │
│             │ │     Zone        │   │
│             │ └─────────────────┘   │
│             │                       │
│             │ Images récentes:      │
│             │ • logo.png [Insérer]  │
│             │ • plan.jpg [Insérer]  │
└─────────────┴───────────────────────┘
```

## 🔄 Processus d'Upload

### 1. **Sélection/Drag & Drop**

```
Image sélectionnée → Validation → Traitement → Ajout au template
```

### 2. **Génération HTML Automatique**

```html
<img
  src="data:image/jpeg;base64,..."
  alt="nom-du-fichier.jpg"
  style="width: 300px; height: auto; margin: 10px 0;"
/>
```

### 3. **Insertion dans le Template**

L'image est ajoutée à la fin du template existant avec un saut de ligne.

## 💻 Implémentation Technique

### Composant `ImageUploader`

- **Drag & Drop Events** : `onDragOver`, `onDrop`, `onDragLeave`
- **File Processing** : `FileReader` pour conversion en Data URL
- **Image Analysis** : Extraction des dimensions et métadonnées
- **State Management** : Gestion des images uploadées et du statut

### Intégration dans `ConfirmationManager`

- **Fonction `insertImageInTemplate`** : Ajoute l'HTML au template
- **Interface à onglets** : Variables + Images
- **Feedback utilisateur** : Messages de succès et d'erreur

## 🎯 Avantages vs Ancien Système

| Ancien Système      | Nouveau Système        |
| ------------------- | ---------------------- |
| URLs manuelles      | Drag & Drop            |
| Copier-coller HTML  | Génération automatique |
| Gestion hébergement | Intégré (Data URLs)    |
| Erreurs de syntaxe  | Code HTML garanti      |
| Processus complexe  | Ultra simple           |

## 🚀 Comment Utiliser

### Étape 1 : Accéder à l'interface

1. Aller dans **Paramètres** → **Confirmations**
2. Cliquer sur l'onglet **"Images"**

### Étape 2 : Ajouter une image

1. **Option A** : Glisser-déposer l'image dans la zone
2. **Option B** : Cliquer sur "Choisir des fichiers"

### Étape 3 : L'image est automatiquement ajoutée

- HTML généré automatiquement
- Ajouté à la fin du template
- Prêt à être utilisé !

### Étape 4 : Personnaliser (optionnel)

- Déplacer l'image dans le template
- Modifier les styles CSS si nécessaire
- Ajuster la taille avec `width: XXXpx`

## 📝 Exemples d'Usage

### Logo de l'établissement

```html
<img
  src="data:image/png;base64,..."
  alt="logo-hotel.png"
  style="width: 200px; height: auto; margin: 20px 0;"
/>
```

### Plan d'accès

```html
<img
  src="data:image/jpeg;base64,..."
  alt="plan-acces.jpg"
  style="width: 400px; height: auto; margin: 15px 0;"
/>
```

### QR Code WiFi

```html
<img
  src="data:image/png;base64,..."
  alt="qr-wifi.png"
  style="width: 150px; height: auto; margin: 10px 0;"
/>
```

## 🔮 Évolutions Futures

### Phase 1 : Cloudinary Integration (optionnel)

- Upload vers Cloudinary au lieu de Data URLs
- Optimisation automatique des images
- URLs permanentes et optimisées
- Gestion centralisée des assets

### Phase 2 : Éditeur Visuel

- Interface WYSIWYG pour les templates
- Positionnement des images par drag & drop
- Redimensionnement visuel
- Aperçu en temps réel

### Phase 3 : Galerie d'Images

- Bibliothèque d'images de l'établissement
- Réutilisation entre templates
- Catégorisation (logos, plans, QR codes, etc.)
- Gestion des versions

## 📊 Bénéfices Immédiats

1. **Simplicité** : Plus besoin de connaissances HTML
2. **Rapidité** : Ajout d'image en quelques secondes
3. **Fiabilité** : Code HTML généré automatiquement
4. **Flexibilité** : Support de tous les formats d'image courants
5. **UX améliorée** : Interface intuitive et moderne

---

_Cette fonctionnalité transforme l'ajout d'images d'un processus technique complexe en une action simple et intuitive !_ 🚀
