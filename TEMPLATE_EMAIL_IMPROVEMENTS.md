# Améliorations du Template Email - SelfKey

## 🎯 Objectifs

1. **Simplification des variables** : Suppression de `{accessInstructions}` redondant
2. **Support des images** : Possibilité d'ajouter des images dans les emails
3. **Amélioration UX** : Interface plus claire pour la gestion des templates

## ✅ Modifications apportées

### 1. **Suppression de `{accessInstructions}`**

**Problème résolu :**

- La variable `{accessInstructions}` était redondante avec `{accessCode}`
- Créait de la confusion et des répétitions dans les emails

**Solution :**

- ✅ Template par défaut mis à jour (suppression de `{accessInstructions}`)
- ✅ Liste des variables disponibles mise à jour
- ✅ API de confirmation mise à jour
- ✅ API de test mise à jour
- ✅ Templates WhatsApp mis à jour

**Résultat :**

```
Ancien template :
- Code d'accès : {accessCode}
{accessInstructions}

Nouveau template :
- Code d'accès : {accessCode}
```

### 2. **Support des images dans les templates**

**Nouvelles fonctionnalités :**

- ✅ Interface à onglets (Variables / Images)
- ✅ Exemples d'images prêts à copier-coller
- ✅ Support HTML complet dans les emails

**Exemples disponibles :**

1. **Logo de l'établissement**

```html
<img
  src="https://votre-site.com/logo.png"
  alt="Logo"
  style="width: 150px; height: auto; margin: 20px 0;"
/>
```

2. **Plan d'accès**

```html
<img
  src="https://votre-site.com/plan.jpg"
  alt="Plan d'accès"
  style="width: 100%; max-width: 400px; height: auto; margin: 10px 0;"
/>
```

3. **QR Code WiFi**

```html
<img
  src="https://votre-site.com/qr-code.png"
  alt="QR Code WiFi"
  style="width: 200px; height: auto; margin: 15px 0;"
/>
```

### 3. **Interface améliorée**

**Nouveautés :**

- ✅ Section "Variables & Images" avec onglets
- ✅ Guide contextuel avec conseils pratiques
- ✅ Exemples cliquables pour copier-coller
- ✅ Messages d'aide informatifs

## 🚀 Comment utiliser les nouvelles fonctionnalités

### Ajouter une image

1. **Préparer votre image :**
   - Hébergez l'image en ligne (votre site web, service cloud, etc.)
   - Récupérez l'URL complète (ex: `https://monhotel.com/logo.png`)

2. **Ajouter dans le template :**
   - Allez dans l'onglet "Images"
   - Cliquez sur un exemple pour le copier
   - Collez dans votre template
   - Remplacez l'URL par la vôtre

3. **Personnaliser le style :**
   ```html
   <img
     src="VOTRE_URL"
     alt="Description"
     style="width: 200px; height: auto; margin: 10px 0;"
   />
   ```

### Variables disponibles

| Variable              | Description              |
| --------------------- | ------------------------ |
| `{clientFirstName}`   | Prénom du client         |
| `{clientLastName}`    | Nom du client            |
| `{establishmentName}` | Nom de l'établissement   |
| `{roomName}`          | Nom de la chambre        |
| `{checkInDate}`       | Date d'arrivée           |
| `{checkOutDate}`      | Date de départ           |
| `{accessCode}`        | Code d'accès (simplifié) |
| `{hotelContactEmail}` | Email de contact         |
| `{hotelContactPhone}` | Téléphone de contact     |
| `{bookingNumber}`     | Numéro de réservation    |

## 📧 Exemple de template avec image

```html
Bonjour {clientFirstName} {clientLastName},

<img
  src="https://monhotel.com/logo.png"
  alt="Logo Mon Hôtel"
  style="width: 150px; height: auto; margin: 20px 0;"
/>

Votre réservation à {establishmentName} a été confirmée avec succès ! Détails de
votre réservation : - Chambre : {roomName} - Arrivée : {checkInDate} - Départ :
{checkOutDate} - Code d'accès : {accessCode}

<img
  src="https://monhotel.com/plan-acces.jpg"
  alt="Plan d'accès"
  style="width: 100%; max-width: 400px; height: auto; margin: 15px 0;"
/>

WiFi gratuit - Scannez ce QR code :
<img
  src="https://monhotel.com/qr-wifi.png"
  alt="QR Code WiFi"
  style="width: 150px; height: auto; margin: 10px 0;"
/>

Pour toute question : 📧 Email : {hotelContactEmail} 📞 Téléphone :
{hotelContactPhone} Excellent séjour ! L'équipe de {establishmentName}
```

## 🛠️ Fichiers modifiés

- `src/components/ConfirmationManager.tsx` - Interface utilisateur
- `src/app/api/bookings/[bookingId]/send-confirmation/route.ts` - API confirmation
- `src/app/api/admin/[hotel]/test-confirmation-email/route.ts` - API test
- `src/components/RoomManagement.tsx` - Fix du bug option chien

## 🎉 Bénéfices

1. **Templates plus clairs** : Moins de confusion avec les variables
2. **Emails personnalisés** : Ajout de logos, plans, QR codes
3. **Meilleure expérience** : Interface intuitive avec exemples
4. **Flexibilité HTML** : Support complet pour la mise en forme
5. **Bug fixé** : Option chien synchronisée correctement

---

_Ces améliorations rendent la gestion des emails de confirmation plus puissante et plus facile à utiliser !_
