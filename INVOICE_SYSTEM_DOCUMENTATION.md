# Documentation : Système de Facturation PDF

## 🎯 Vue d'ensemble

Le système de facturation PDF de SelfKey permet de :

- **Générer automatiquement** des factures professionnelles en PDF
- **Envoyer des liens sécurisés** dans les emails de confirmation
- **Permettre aux clients** de télécharger leurs factures à tout moment
- **Donner aux admins** la possibilité d'envoyer des liens de facture

## 📋 Fonctionnalités disponibles

### 1. **Génération automatique dans les emails**

✅ **Quand ?** Après chaque réservation confirmée  
✅ **Quoi ?** Lien de téléchargement sécurisé dans l'email de confirmation  
✅ **Sécurité ?** Token cryptographique unique par client et réservation

### 2. **Téléchargement direct depuis l'admin**

✅ **Où ?** Modal de détails de réservation → Bouton "Télécharger facture"  
✅ **Format ?** PDF professionnel avec logo de l'établissement  
✅ **Contenu ?** Détails complets : client, séjour, coûts, taxes, frais plateforme

### 3. **Envoi de lien par email**

✅ **Où ?** Modal de détails de réservation → Bouton "Envoyer facture"  
✅ **Utilité ?** Si le client a perdu son email de confirmation  
✅ **Sécurité ?** Même niveau de sécurisation que les liens automatiques

### 4. **Page de téléchargement dédiée**

✅ **URL ?** `/invoice/[bookingId]?token=xxx`  
✅ **Contenu ?** Page sécurisée avec détails de réservation et bouton téléchargement  
✅ **UX ?** Interface claire avec informations de contact de l'établissement

## 🛠️ Architecture technique

### **Composants principaux**

- `InvoicePDF.tsx` → Génération du document PDF
- `InvoiceDownload.tsx` → Bouton de téléchargement côté client
- `SendInvoiceLink.tsx` → Envoi de liens par email depuis l'admin
- `/invoice/[bookingId]/page.tsx` → Page de téléchargement sécurisée

### **APIs créées**

- `GET /api/invoice/[bookingId]` → Récupération des données de facture
- `POST /api/send-invoice-link` → Envoi de lien par email

### **Sécurité**

- **Tokens HMAC-SHA256** avec secret d'application
- **Vérification d'email** pour accès aux factures
- **Protection temporelle** contre les attaques par force brute
- **Liens uniques** par réservation et client

## 📧 Intégration emails

### **Email de confirmation automatique**

```html
<!-- Section facture ajoutée automatiquement -->
<div class="invoice-section">
  <h3>📄 Votre facture</h3>
  <p>Téléchargez votre facture officielle :</p>
  <a href="[LIEN_SECURISE]" class="invoice-button">
    📥 Télécharger ma facture
  </a>
</div>
```

### **Email de renvoi de lien**

- Envoyé manuellement par les admins
- Design professionnel avec branding de l'établissement
- Informations de réservation incluses
- Lien sécurisé identique au premier envoi

## 🎨 Personnalisation

### **Style des factures**

- Logo automatique de l'établissement
- Couleurs et branding configurables
- Format A4 professionnel
- Multilingue (FR par défaut)

### **Contenu des factures**

- Informations établissement complètes
- Détails client et séjour
- Ventilation détaillée des coûts :
  - Prix chambre × nombre de nuits
  - Options sélectionnées
  - Taxe de séjour
  - Frais de plateforme (commission + frais fixes)
  - Montant total

## 🔧 Configuration requise

### **Variables d'environnement**

```env
NEXTAUTH_SECRET=your-secret-key    # Pour la génération de tokens
NEXTAUTH_URL=https://your-domain   # Pour les liens absolus
RESEND_API_KEY=your-resend-key    # Pour l'envoi d'emails
```

### **Dépendances installées**

- `@react-pdf/renderer` → Génération PDF côté client
- `crypto` (Node.js) → Sécurisation des tokens
- `resend` → Service d'envoi d'emails

## 📱 Utilisation par les clients

### **1. Via email de confirmation**

1. Client reçoit email après réservation
2. Clique sur "Télécharger ma facture"
3. Redirigé vers page sécurisée
4. Télécharge le PDF

### **2. Via lien de renvoi**

1. Admin clique "Envoyer facture" dans l'interface
2. Client reçoit email dédié
3. Même processus de téléchargement

### **3. Sécurité client**

- Liens personnels et non-devinables
- Expiration automatique des sessions
- Aucune donnée sensible dans les URLs

## 🛡️ Sécurité et conformité

### **Protection des données**

- ✅ Pas de stockage PDF sur serveur (génération à la demande)
- ✅ Tokens chiffrés avec clé secrète d'application
- ✅ Vérification d'identité par email
- ✅ Logs de sécurité pour audit

### **Conformité RGPD**

- ✅ Accès aux données restreint au propriétaire
- ✅ Pas de conservation de données non nécessaires
- ✅ Droit à l'information (factures accessibles)

## 🚀 Évolutions futures possibles

### **Améliorations UX**

- [ ] Aperçu facture avant téléchargement
- [ ] Historique des factures dans espace client
- [ ] Notification push de nouvelle facture

### **Fonctionnalités business**

- [ ] Factures de relance automatiques
- [ ] Export comptable global (Excel/CSV)
- [ ] Intégration systèmes comptables tiers

### **Personnalisation avancée**

- [ ] Templates de facture personnalisables
- [ ] Logos différents par établissement
- [ ] Langues multiples selon profil client

---

## 📞 Support

Pour toute question sur l'implémentation ou l'utilisation du système de facturation, l'équipe technique peut consulter :

- **Code source** : `/src/components/Invoice*`
- **APIs** : `/src/app/api/invoice/` et `/src/app/api/send-invoice-link/`
- **Utilitaires** : `/src/lib/invoice-security.ts`
- **Tests** : Utiliser l'interface admin avec des réservations de test

Le système est conçu pour être robuste, sécurisé et extensible selon les besoins futurs de la plateforme SelfKey.
