# Guide d'utilisation : Emails multilingues

## 📧 Système d'emails en 3 langues (FR/EN/DE)

Votre système d'emails de confirmation supporte maintenant **3 langues** : Français, English et Deutsch.

## Comment ça marche ?

### 1. Sélection automatique de la langue

Quand un client remplit le formulaire de réservation :

- Il choisit sa langue préférée (🇫🇷 / 🇬🇧 / 🇩🇪)
- Cette langue est automatiquement sauvegardée avec la réservation
- L'email de confirmation sera envoyé **dans la langue choisie par le client**

### 2. Interface d'administration

Dans votre panneau admin (`/admin/[hotel]/confirmations`), vous verrez maintenant :

#### **Sélecteur de langue** (en haut)

```
🇫🇷 Français   🇬🇧 English   🇩🇪 Deutsch
```

- Cliquez sur une langue pour modifier les emails dans cette langue
- Le bouton actif est surligné en bleu

#### **Onglets pour chaque variante**

- **Email Général** : pour les réservations normales
- **Email Avec Chiens** : pour les réservations avec animaux (si activé)
- **Email Sans Chiens** : pour les réservations explicitement sans animaux (si activé)

### 3. Comment créer vos emails multilingues

**Pour chaque langue (FR/EN/DE) :**

1. **Sélectionnez la langue** avec les boutons 🇫🇷 / 🇬🇧 / 🇩🇪
2. **Tapez votre email** directement dans l'éditeur Unlayer
   - Rédigez tout le texte en français pour FR
   - Rédigez tout le texte en anglais pour EN
   - Rédigez tout le texte en allemand pour DE
3. **Utilisez les variables** disponibles :
   - `{{firstName}}` - Prénom du client
   - `{{lastName}}` - Nom du client
   - `{{email}}` - Email du client
   - `{{checkInDate}}` - Date d'arrivée
   - `{{checkOutDate}}` - Date de départ
   - `{{roomName}}` - Nom de la chambre
   - `{{totalAmount}}` - Montant total
   - Et plus... (voir VARIABLES_EMAIL_TEMPLATES.md)
4. **Cliquez sur "Sauvegarder le template"**

**Répétez pour chaque langue et chaque variante !**

## Exemple de workflow

### Étape 1 : Créer l'email français

1. Cliquez sur 🇫🇷 **Français**
2. Onglet **"Email Général"**
3. Rédigez votre email en français :

   ```
   Bonjour {{firstName}},

   Nous confirmons votre réservation pour la chambre {{roomName}}
   du {{checkInDate}} au {{checkOutDate}}.

   Montant total : {{totalAmount}} CHF

   À bientôt !
   ```

4. **Sauvegarder**

### Étape 2 : Créer l'email anglais

1. Cliquez sur 🇬🇧 **English**
2. Onglet **"Email Général"**
3. Rédigez votre email en anglais :

   ```
   Hello {{firstName}},

   We confirm your reservation for the room {{roomName}}
   from {{checkInDate}} to {{checkOutDate}}.

   Total amount: {{totalAmount}} CHF

   See you soon!
   ```

4. **Sauvegarder**

### Étape 3 : Créer l'email allemand

1. Cliquez sur 🇩🇪 **Deutsch**
2. Onglet **"Email Général"**
3. Rédigez votre email en allemand :

   ```
   Hallo {{firstName}},

   Wir bestätigen Ihre Reservierung für das Zimmer {{roomName}}
   vom {{checkInDate}} bis {{checkOutDate}}.

   Gesamtbetrag: {{totalAmount}} CHF

   Bis bald!
   ```

4. **Sauvegarder**

### Étape 4 : Répéter pour "Avec Chiens" et "Sans Chiens" (si activé)

Si vous avez activé l'option chiens :

- Répétez les étapes 1-3 pour l'onglet **"Email Avec Chiens"**
- Répétez les étapes 1-3 pour l'onglet **"Email Sans Chiens"**

## 🎯 Résultat

Maintenant, quand un client fait une réservation :

- Il choisit **🇬🇧 English** sur le formulaire
- Il reçoit automatiquement l'email en **anglais**
- Avec le bon template (**général** / **avec chiens** / **sans chiens**)

## 💡 Conseils

### Organisation

- Commencez par le français (votre langue principale)
- Puis traduisez vers l'anglais
- Enfin traduisez vers l'allemand

### Cohérence

- Gardez la même **structure** dans les 3 langues
- Utilisez les mêmes **variables** aux mêmes endroits
- Vérifiez le **style** et le **ton** (formel/informel)

### Variables de date

Les dates seront automatiquement formatées selon la langue :

- FR : `23 décembre 2024`
- EN : `December 23, 2024`
- DE : `23. Dezember 2024`

## 📊 Base de données

Le système stocke **18 champs** différents :

### Français (6 champs - déjà existants)

- `confirmationEmailTemplate` - Email général FR
- `confirmationEmailTemplateWithDog` - Email avec chiens FR
- `confirmationEmailTemplateWithoutDog` - Email sans chiens FR
- `confirmationEmailDesign` - Design JSON général FR
- `confirmationEmailDesignWithDog` - Design JSON avec chiens FR
- `confirmationEmailDesignWithoutDog` - Design JSON sans chiens FR

### English (6 nouveaux champs)

- `confirmationEmailTemplateEn` - Email général EN
- `confirmationEmailTemplateWithDogEn` - Email avec chiens EN
- `confirmationEmailTemplateWithoutDogEn` - Email sans chiens EN
- `confirmationEmailDesignEn` - Design JSON général EN
- `confirmationEmailDesignWithDogEn` - Design JSON avec chiens EN
- `confirmationEmailDesignWithoutDogEn` - Design JSON sans chiens EN

### Deutsch (6 nouveaux champs)

- `confirmationEmailTemplateDe` - Email général DE
- `confirmationEmailTemplateWithDogDe` - Email avec chiens DE
- `confirmationEmailTemplateWithoutDogDe` - Email sans chiens DE
- `confirmationEmailDesignDe` - Design JSON général DE
- `confirmationEmailDesignWithDogDe` - Design JSON avec chiens DE
- `confirmationEmailDesignWithoutDogDe` - Design JSON sans chiens DE

## ✅ Statut de l'implémentation

- ✅ Base de données configurée (18 champs)
- ✅ Formulaire de réservation multilingue
- ✅ Sauvegarde de la langue choisie (`bookingLocale`)
- ✅ Sélection intelligente du template selon langue + variante
- ✅ Interface admin avec sélecteur de langue
- ✅ API backend pour sauvegarder/charger tous les templates
- ✅ Page de succès multilingue

## 🔧 Fichiers modifiés

1. **prisma/schema.prisma** - 12 nouveaux champs dans Establishment
2. **src/components/ConfirmationManager.tsx** - Sélecteur de langue + helpers
3. **src/app/api/admin/[hotel]/confirmation-settings/route.ts** - API GET/POST mise à jour
4. **src/lib/email/confirmation-template.ts** - Logique de sélection des templates

## 📝 Pour tester

1. Allez dans l'admin : `/admin/[votre-hotel]/confirmations`
2. Créez des templates dans les 3 langues
3. Faites une réservation test en choisissant une langue
4. Vérifiez que vous recevez l'email dans la bonne langue

## 🆘 Support

Si un template n'existe pas pour une langue :

- Le système utilisera le template français par défaut
- Aucune erreur ne sera affichée au client
- Mais vérifiez les logs pour voir les avertissements

---

**Système créé par : Copilot**  
**Date : Janvier 2025**
