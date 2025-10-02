# 📧 Guide d'intégration des liens de facture dans vos templates personnalisés

## 🎯 Variable disponible pour les factures

Dans vos templates de confirmation de réservation personnalisés, vous pouvez maintenant utiliser la variable :

```
{invoiceDownloadUrl}
```

Cette variable sera automatiquement remplacée par un lien sécurisé vers la facture du client.

## 📝 Variables disponibles dans les templates de confirmation

Voici toutes les variables que vous pouvez utiliser dans vos templates :

### **Informations client**

- `{clientFirstName}` → Prénom du client
- `{clientLastName}` → Nom de famille du client
- `{clientName}` → Nom complet du client

### **Informations réservation**

- `{bookingNumber}` → Numéro de réservation
- `{bookingDate}` → Date de la réservation (format français)
- `{roomName}` → Nom de la chambre/service
- `{roomId}` → Numéro de chambre
- `{amount}` → Montant payé
- `{currency}` → Devise (CHF)

### **Informations établissement**

- `{establishmentName}` → Nom de votre établissement
- `{hotelContactEmail}` → Email de contact
- `{hotelContactPhone}` → Téléphone de contact

### **🆕 Lien facture**

- `{invoiceDownloadUrl}` → **Lien sécurisé vers la facture PDF**

## 💡 Exemples d'intégration

### **1. Lien simple**

```
Vous pouvez télécharger votre facture ici : {invoiceDownloadUrl}
```

### **2. Section dédiée**

```
📄 VOTRE FACTURE
Téléchargez votre facture officielle pour cette réservation :
{invoiceDownloadUrl}

Ce lien est sécurisé et personnel à votre réservation.
```

### **3. Template complet avec facture**

```
Bonjour {clientFirstName} {clientLastName},

Votre réservation #{bookingNumber} à {establishmentName} a été confirmée avec succès !

DÉTAILS DE VOTRE RÉSERVATION :
- Chambre : {roomName}
- Montant payé : {amount} {currency}
- Date de réservation : {bookingDate}

📄 VOTRE FACTURE
Téléchargez votre facture officielle :
{invoiceDownloadUrl}

Pour toute question, contactez-nous :
📧 {hotelContactEmail}
📞 {hotelContactPhone}

Excellent séjour !
L'équipe de {establishmentName}
```

### **4. Format HTML dans le template**

Si votre template supporte le HTML, vous pouvez faire :

```html
<div
  style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;"
>
  <h3>📄 Votre facture</h3>
  <p>Téléchargez votre facture officielle :</p>
  <a
    href="{invoiceDownloadUrl}"
    style="background-color: #1976d2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;"
  >
    Télécharger la facture PDF
  </a>
</div>
```

## ⚙️ Configuration dans l'admin

### **Où configurer vos templates :**

1. **Base de données** → Table `establishment`
2. **Champs disponibles** :
   - `confirmationEmailTemplate` → Template principal
   - `confirmationEmailTemplateWithDog` → Template avec animaux (si applicable)
   - `confirmationEmailTemplateWithoutDog` → Template sans animaux (si applicable)

### **Comment le système fonctionne :**

1. ✅ **Template personnalisé existe** → Utilise votre template avec remplacement des variables
2. ❌ **Pas de template** → Utilise le template par défaut avec section facture intégrée

## 🔒 Sécurité des liens

### **Caractéristiques du lien généré :**

- ✅ **Unique par réservation** et par client
- ✅ **Crypté avec HMAC-SHA256**
- ✅ **Non-devinable** et sécurisé
- ✅ **Réutilisable** par le client
- ✅ **Vérifie l'identité** via email

### **Format du lien :**

```
https://votre-domaine.com/invoice/[ID_RESERVATION]?token=[TOKEN_SECURISE]
```

## 🎨 Conseils de design

### **Pour les emails texte :**

- Utilisez des emojis pour attirer l'attention : 📄 💼 📥
- Séparez la section facture du reste
- Mentionnez que le lien est sécurisé

### **Pour les emails HTML :**

- Créez une section visuelle distincte
- Utilisez un bouton coloré pour le lien
- Ajoutez des icônes et du styling

### **Messages recommandés :**

- "Ce lien est sécurisé et personnel"
- "Vous pouvez télécharger votre facture à tout moment"
- "Facture officielle de votre réservation"

## 🚀 Migration de vos templates existants

### **Si vous avez déjà des templates :**

1. **Ajoutez simplement** la variable `{invoiceDownloadUrl}` où vous voulez
2. **Pas besoin** de modifier autre chose
3. **Le système s'adapte** automatiquement

### **Test recommandé :**

1. Créez une réservation de test
2. Vérifiez que l'email contient le lien
3. Testez le téléchargement de la facture
4. Ajustez votre template si nécessaire

---

## 📞 Support

Si vous avez des questions sur l'intégration des liens de facture dans vos templates :

- Consultez le template par défaut comme référence
- Testez avec des réservations de test
- Les variables sont remplacées automatiquement au moment de l'envoi

**Le système est rétrocompatible** : vos templates existants continueront à fonctionner, vous ajoutez juste `{invoiceDownloadUrl}` où vous voulez que le lien apparaisse ! 🎉
