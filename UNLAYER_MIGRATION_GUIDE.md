# 🎨 Migration vers Unlayer - Guide Complet

## 🎯 Ce qui a changé

Votre système d'emails a été complètement transformé avec **Unlayer**, un éditeur visuel drag-and-drop professionnel !

### ✅ Nouvelles fonctionnalités

1. **Éditeur visuel** : Plus besoin d'écrire du HTML
2. **Templates professionnels** : Design moderne et responsive
3. **Variables automatiques** : Glissez-déposez les données clients
4. **Aperçu en temps réel** : Voyez le résultat immédiatement
5. **Compatibilité email** : Fonctionne sur tous les clients email

## 🚀 Comment utiliser le nouvel éditeur

### 1. Accédez à vos templates

- Allez dans **Administration → Confirmations de réservation**
- Choisissez l'onglet qui vous intéresse :
  - **Email Général** : Template par défaut
  - **🐕 Avec Chiens** : Pour les emplacements acceptant les animaux
  - **🚫🐕 Sans Chiens** : Pour les emplacements sans animaux

### 2. Créez votre design

- **Zone de design** : Glissez-déposez les éléments (texte, images, boutons, etc.)
- **Variables disponibles** : Onglet dédié avec toutes les variables client
- **Aperçu** : Testez votre email avant de sauvegarder

### 3. Utilisez les variables

```
{{clientFirstName}}     → Prénom du client
{{establishmentName}}   → Nom de votre établissement
{{roomName}}           → Nom de la chambre
{{accessCode}}         → Code d'accès
{{checkInDate}}        → Date d'arrivée
{{bookingNumber}}      → Numéro de réservation
```

### 4. Ajoutez des images

```html
<!-- Logo -->
<img
  src="https://votre-site.com/logo.png"
  alt="Logo"
  style="width: 150px; height: auto; margin: 20px 0;"
/>

<!-- Plan d'accès -->
<img
  src="https://votre-site.com/plan.jpg"
  alt="Plan d'accès"
  style="width: 100%; max-width: 400px;"
/>

<!-- QR Code WiFi -->
<img
  src="https://votre-site.com/qr-wifi.png"
  alt="QR WiFi"
  style="width: 200px; height: auto;"
/>
```

## 📧 Migration de vos anciens templates

### ⚡ Migration automatique

Vos anciens templates HTML sont **automatiquement conservés** en arrière-plan.
Si un template Unlayer n'est pas encore configuré, l'ancien HTML sera utilisé.

### 🔄 Migration manuelle recommandée

1. **Ouvrez l'éditeur Unlayer**
2. **Recréez visuellement** votre template existant
3. **Testez** avec l'outil d'aperçu
4. **Sauvegardez** le nouveau design

## 🎨 Conseils de design

### ✨ Bonnes pratiques

- **Largeur max 600px** : Optimal pour tous les clients email
- **Polices web-safe** : Arial, Georgia, Times New Roman
- **Contrastes élevés** : Texte noir sur fond blanc
- **Images optimisées** : Format JPEG/PNG, taille < 500KB

### 🎯 Structure recommandée

1. **Header** : Logo + nom établissement
2. **Corps principal** : Informations de réservation
3. **Détails** : Dates, chambre, code d'accès
4. **Contact** : Email et téléphone
5. **Footer** : Remerciements + signature

## 🛠️ Fonctionnalités avancées

### 🔍 Test d'emails

- Saisissez votre email de test
- Cliquez sur **"Tester"**
- Recevez un email avec des données d'exemple

### 📋 Copie automatique

- Configurez des adresses de copie
- Tous les emails seront envoyés en copie
- Parfait pour administration/comptabilité

### 🐕 Templates spécialisés

- **Avec chiens** : Informations spéciales, zones autorisées
- **Sans chiens** : Focus tranquillité, espaces premium

## 🆘 Support et aide

### 🐛 Problèmes courants

**L'éditeur ne se charge pas ?**

- Rafraîchissez la page
- Vérifiez votre connexion internet
- Contactez le support si le problème persiste

**Variables non remplacées ?**

- Vérifiez la syntaxe : `{{nomVariable}}`
- Assurez-vous d'utiliser les variables de la liste
- Testez avec l'outil de prévisualisation

**Email illisible ?**

- Utilisez l'aperçu pour vérifier
- Testez sur différents clients email
- Évitez les polices trop petites

### 📞 Contact

En cas de difficulté, contactez notre équipe de support avec :

- Capture d'écran du problème
- Description détaillée
- Navigateur utilisé

---

## 🎉 Profitez de votre nouvel éditeur !

L'éditeur Unlayer vous permettra de créer des emails **professionnels**, **responsives** et **personnalisés** en quelques minutes, sans aucune connaissance technique !
