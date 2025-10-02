# 🧪 Guide des emails de test avec liens de facture

## 🎯 Ce qui a été ajouté

### **Variable `{invoiceDownloadUrl}` dans les tests**

- ✅ **Disponible maintenant** dans tous vos emails de test
- ✅ **URL d'exemple réaliste** : `https://selfkey.ch/invoice/test-demo-booking?token=demo-test-token`
- ✅ **Page de démo dédiée** pour expliquer le système

## 📧 Comment tester vos emails avec liens de facture

### **1. Dans l'interface admin :**

1. **Allez dans "Confirmations"**
2. **Créez votre template** avec `{invoiceDownloadUrl}`
3. **Cliquez sur "Tester"**
4. **Saisissez votre email de test**
5. **Envoyez l'email de test**

### **2. Dans l'email reçu :**

- ✅ **Variable remplacée** par un lien d'exemple
- ✅ **Lien cliquable** vers une page de démo
- ✅ **Rendu identique** aux vrais emails

### **3. En cliquant sur le lien :**

- ✅ **Page de démo** qui explique le système
- ✅ **Aperçu de l'interface** client
- ✅ **Informations sur les fonctionnalités**

## 🎨 Exemples de templates avec facture

### **Template simple :**

```
Bonjour {clientFirstName} {clientLastName},

Votre réservation #{bookingNumber} a été confirmée !

📄 Téléchargez votre facture : {invoiceDownloadUrl}

Cordialement,
{establishmentName}
```

### **Template détaillé :**

```
Bonjour {clientFirstName} {clientLastName},

Votre réservation à {establishmentName} a été confirmée avec succès !

DÉTAILS DE VOTRE RÉSERVATION :
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Numéro : {bookingNumber}
• Chambre : {roomName}
• Dates : {checkInDate} - {checkOutDate}
• Montant : {totalAmount} {currency}

📄 VOTRE FACTURE OFFICIELLE :
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Téléchargez votre facture en cliquant ici :
{invoiceDownloadUrl}

💡 Ce lien est sécurisé et vous pouvez l'utiliser à tout moment.

Pour toute question :
📧 {hotelContactEmail}
📞 {hotelContactPhone}

Excellent séjour !
L'équipe de {establishmentName}
```

### **Template HTML stylé :**

```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2>Confirmation de réservation</h2>

  <p>Bonjour {clientFirstName} {clientLastName},</p>

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

  <p>Cordialement,<br />{establishmentName}</p>
</div>
```

## 🔍 Test et validation

### **Checklist de test :**

- [ ] Variable `{invoiceDownloadUrl}` visible dans l'interface
- [ ] Template sauvegardé avec la variable
- [ ] Email de test envoyé et reçu
- [ ] Lien cliquable dans l'email
- [ ] Page de démo accessible
- [ ] Rendu satisfaisant du template

### **Points à vérifier :**

1. **Position du lien** : Placé logiquement dans le template
2. **Texte d'accompagnement** : Clair et informatif
3. **Design cohérent** : S'intègre bien avec votre branding
4. **Responsive** : Fonctionne sur mobile et desktop

## 🚀 Différences test vs production

| Aspect               | Email de test         | Email réel                    |
| -------------------- | --------------------- | ----------------------------- |
| **Lien facture**     | URL de démo fixe      | URL unique et sécurisée       |
| **Page destination** | Page de démonstration | Vraie page de téléchargement  |
| **Téléchargement**   | Simulation seulement  | PDF réel généré               |
| **Sécurité**         | Aucune (démo)         | Token crypté unique           |
| **Données**          | Exemples statiques    | Vraies données de réservation |

## 💡 Conseils pour optimiser vos tests

### **1. Testez différents clients email :**

- Gmail, Outlook, Apple Mail, etc.
- Version mobile et desktop

### **2. Variez les templates :**

- Avec et sans HTML
- Différentes positions du lien
- Textes d'accompagnement variés

### **3. Validez le rendu :**

- Liens cliquables
- Couleurs correctes
- Responsive design

### **4. Testez les types de templates :**

- Template général
- Template avec chien (si applicable)
- Templates personnalisés par établissement

---

## 📞 Support

Si vous rencontrez des problèmes avec les emails de test :

1. **Vérifiez** que la variable `{invoiceDownloadUrl}` est bien dans votre template
2. **Rafraîchissez** l'interface admin si la variable n'apparaît pas
3. **Testez** avec différentes adresses email
4. **Vérifiez** les logs de votre service email (Resend)

**Vos emails de test incluront maintenant le lien de facture avec un aperçu réaliste !** 🎉
