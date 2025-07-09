# Configuration de l'envoi d'emails avec Resend

## Vue d'ensemble

SelfKey utilise [Resend](https://resend.com) pour envoyer des emails de confirmation de réservation. Ce guide explique comment configurer le service d'email.

## Configuration

### 1. Créer un compte Resend

1. Allez sur [resend.com](https://resend.com)
2. Créez un compte gratuit
3. Vérifiez votre domaine ou utilisez l'adresse de test fournie

### 2. Obtenir la clé API

1. Dans votre dashboard Resend, allez dans **API Keys**
2. Créez une nouvelle clé API avec les permissions d'envoi
3. Copiez la clé (format : `re_xxxxxxxxxxxx`)

### 3. Configurer les variables d'environnement

Ajoutez à votre fichier `.env.local` :

```bash
RESEND_API_KEY="re_xxxxxxxxxxxx"
```

### 4. Configuration du domaine (optionnel)

Pour un environnement de production :

1. Dans Resend, ajoutez votre domaine
2. Configurez les enregistrements DNS requis
3. Attendez la vérification du domaine

## Utilisation

### Test d'envoi

Dans l'interface d'administration de SelfKey :

1. Allez dans **Paramètres** > **Confirmations**
2. Configurez votre template d'email
3. Utilisez le bouton **"Tester l'envoi"** avec votre email
4. Vérifiez la réception dans votre boîte mail

### Template d'email

Les variables disponibles dans le template :

- `{clientFirstName}` - Prénom du client
- `{clientLastName}` - Nom de famille du client
- `{establishmentName}` - Nom de l'établissement
- `{roomName}` - Nom de la chambre
- `{checkInDate}` - Date d'arrivée
- `{checkOutDate}` - Date de départ
- `{accessCode}` - Code d'accès
- `{accessInstructions}` - Instructions d'accès
- `{hotelContactEmail}` - Email de contact de l'hôtel
- `{hotelContactPhone}` - Téléphone de contact de l'hôtel

## Limites et tarification

### Plan gratuit Resend

- 100 emails/jour
- 3,000 emails/mois
- Support basic

### Plans payants

- À partir de $20/mois pour 50,000 emails
- Support prioritaire
- Analyse avancée

## Dépannage

### Erreur "RESEND_API_KEY not configured"

- Vérifiez que la variable d'environnement est bien définie
- Redémarrez votre serveur après ajout de la variable

### Erreur "Domain not verified"

- Vérifiez la configuration DNS de votre domaine
- Utilisez l'adresse de test en développement

### Email non reçu

- Vérifiez les spams/indésirables
- Vérifiez les logs dans le dashboard Resend
- Testez avec une autre adresse email

## Support

- [Documentation Resend](https://resend.com/docs)
- [Status Resend](https://status.resend.com)
- [Support SelfKey](mailto:support@selfkey.com)
