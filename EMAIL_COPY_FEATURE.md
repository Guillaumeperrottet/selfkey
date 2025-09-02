# Fonctionnalité de Copie des Emails de Confirmation

## 📧 Description

Cette fonctionnalité permet aux établissements hôteliers de recevoir automatiquement une copie de tous les emails de confirmation envoyés aux clients lors des réservations de nuits.

## ✨ Fonctionnalités

- **Activation/désactivation** : Toggle simple pour activer ou désactiver la fonctionnalité
- **Adresses multiples** : Possibilité d'ajouter plusieurs adresses email en copie
- **Validation** : Vérification de la validité des adresses email
- **Interface intuitive** : Gestion facile via l'interface d'administration
- **Sécurité** : Les adresses sont envoyées en BCC (copie cachée) pour protéger la confidentialité

## 🎯 Cas d'usage

- **Administration** : L'équipe administrative peut suivre toutes les confirmations
- **Service client** : Le support peut avoir accès aux confirmations pour aider les clients
- **Comptabilité** : Suivi des réservations confirmées pour la facturation
- **Direction** : Monitoring des réservations en temps réel

## 🔧 Configuration

### 1. Accès aux paramètres

1. Connectez-vous à votre interface d'administration
2. Allez dans **"Confirmations de réservation"**
3. Cliquez sur l'onglet **"Copie"**

### 2. Activation

1. Activez le toggle **"Copie des confirmations"**
2. Entrez les adresses email (une par ligne) dans le champ de texte
3. Cliquez sur **"Sauvegarder"**

### 3. Exemple de configuration

```
admin@hotel.com
reception@hotel.com
manager@hotel.com
```

## ⚙️ Fonctionnement technique

### Envoi des copies

- Les copies sont envoyées en **BCC** (copie cachée)
- Le client ne voit pas les adresses en copie
- Seules les confirmations de **réservations de nuit** sont copiées
- Les copies contiennent exactement le même contenu que l'email client

### Validation

- Les adresses email sont validées avant sauvegarde
- Les adresses invalides sont rejetées avec un message d'erreur
- Les adresses vides sont automatiquement filtrées

### Sécurité

- Seuls les utilisateurs autorisés peuvent configurer cette fonctionnalité
- Les adresses sont stockées de manière sécurisée en base de données
- Protection contre l'injection d'adresses malveillantes

## 🛡️ Sécurité et Confidentialité

### Données sensibles

- **⚠️ Important** : Les emails de copie contiennent toutes les informations clients
- Assurez-vous que seules les personnes autorisées ont accès aux adresses configurées
- Respectez les réglementations RGPD en vigueur

### Bonnes pratiques

1. **Limitez les adresses** : N'ajoutez que les adresses nécessaires
2. **Utilisez des adresses professionnelles** : Évitez les adresses personnelles
3. **Vérifiez régulièrement** : Supprimez les adresses d'anciens employés
4. **Sécurisez les boîtes email** : Utilisez l'authentification à deux facteurs

## 🔍 Vérification

### Comment vérifier que ça fonctionne

1. Configurez au moins une adresse email en copie
2. Effectuez une réservation test
3. Vérifiez que la confirmation arrive bien dans la boîte du client
4. Vérifiez que la copie arrive dans les boîtes configurées

### Logs et debugging

- Les envois de copies sont loggés dans les logs serveur
- En cas de problème, vérifiez les logs pour identifier les erreurs
- Les adresses invalides sont signalées dans les logs

## 🆘 Dépannage

### Les copies ne sont pas envoyées

1. **Vérifiez l'activation** : Le toggle doit être activé
2. **Vérifiez les adresses** : Elles doivent être valides
3. **Vérifiez la configuration email** : Resend doit être configuré
4. **Consultez les logs** : Recherchez les erreurs d'envoi

### Erreurs courantes

- **"Adresses email invalides"** : Corrigez le format des adresses
- **"RESEND_API_KEY not configured"** : Configuration serveur manquante
- **"Accès refusé"** : Vérifiez vos permissions d'administration

## 📋 Limitations

- Fonctionnalité disponible uniquement pour les **réservations de nuit**
- Maximum recommandé : **10 adresses** en copie (pour éviter les limites de l'API)
- Les adresses doivent être au format email valide
- Nécessite une configuration Resend fonctionnelle

## 🔄 Évolutions futures

- Support pour les réservations de parking jour
- Personnalisation du contenu des copies
- Statistiques d'envoi des copies
- Intégration avec d'autres services de notification

---

_Cette fonctionnalité a été développée pour améliorer la communication et le suivi des réservations au sein des établissements hôteliers._
