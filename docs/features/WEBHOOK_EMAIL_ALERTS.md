# 📧 Système d'alertes email pour webhooks

## Vue d'ensemble

Le système envoie automatiquement des emails d'alerte au super-admin lorsqu'un webhook est désactivé après 10 échecs consécutifs.

## Configuration requise

### Variables d'environnement

Ajoutez dans votre `.env.local` :

```bash
# Email du super-admin (OBLIGATOIRE)
SUPER_ADMIN_EMAIL=votre-email@example.com

# Clé API Resend (OBLIGATOIRE)
RESEND_API_KEY=re_xxxxxxxxxxxxx

# Email expéditeur vérifié sur Resend (OPTIONNEL)
# Par défaut : alerts@selfkey.app
RESEND_FROM_EMAIL=alerts@votredomaine.com
```

### Configuration Resend

1. **Créer un compte** : https://resend.com/signup
2. **Obtenir une clé API** : https://resend.com/api-keys
3. **Vérifier un domaine** (production) : https://resend.com/domains
4. **Mode test** : Utilisez `onboarding@resend.dev` comme expéditeur

## Fonctionnement

### Déclenchement automatique

Le système vérifie automatiquement les webhooks après chaque tentative d'envoi :

```typescript
// Dans /src/lib/api/webhook.ts
export async function checkAndDisableWebhook(webhookId: string) {
  // 1. Récupère les 10 derniers logs
  // 2. Si tous sont des échecs → désactive le webhook
  // 3. Envoie un email d'alerte au super-admin
}
```

### Contenu de l'email

L'email contient :

- ⚠️ Titre d'alerte visuel
- 📋 Détails du webhook (nom, URL, établissement)
- 📊 Nombre d'échecs consécutifs
- 🔧 Actions recommandées
- 🔗 Lien direct vers l'interface super-admin

### Exemple d'email

```
🚨 Alerte : Webhook désactivé automatiquement - API Police

Un webhook a été désactivé automatiquement suite à 10 échecs consécutifs.

Détails :
- Nom du webhook : API Police
- URL : https://api.police.example.com/webhooks/selfkey
- Établissement : hotel-paris-center
- Échecs consécutifs : 10

Actions recommandées :
✓ Vérifiez que l'URL du webhook est accessible
✓ Consultez les logs pour identifier la cause des échecs
✓ Corrigez le problème côté partenaire
✓ Réactivez le webhook une fois le problème résolu

[Voir les détails du webhook] (bouton)
```

## Test du système

### Test manuel

```bash
# Tester l'envoi d'email
npx tsx scripts/test-webhook-email.ts
```

Le script vérifie :

- ✅ Variables d'environnement configurées
- ✅ Connexion à Resend
- ✅ Envoi de l'email
- ✅ Format HTML correct

### Test d'intégration

Le test complet est inclus dans la suite de tests :

```bash
npx tsx scripts/test-improvements.ts
```

Le test 5 simule 10 échecs consécutifs et vérifie que le webhook est désactivé (l'email est envoyé en arrière-plan).

## Gestion des erreurs

### Email non envoyé

Si l'email ne peut pas être envoyé :

- ⚠️ Un warning est logué dans les logs système
- ✅ Le webhook est quand même désactivé
- 📝 L'erreur est tracée pour analyse

```typescript
if (!adminEmail) {
  console.warn("⚠️ Impossible d'envoyer l'email : aucun super-admin");
  return; // Continue sans bloquer
}
```

### Resend non configuré

En développement sans Resend configuré :

```
⚠️ RESEND_API_KEY not configured
✉️ Email would be sent to: admin@example.com
```

## API complète

### `sendWebhookDisabledAlert()`

Envoie un email d'alerte pour webhook désactivé :

```typescript
await sendWebhookDisabledAlert(
  webhookId: string,        // ID unique du webhook
  webhookName: string,      // Nom affiché
  webhookUrl: string,       // URL de destination
  establishmentSlug: string, // Établissement concerné
  failureCount: number      // Nombre d'échecs (10)
);
```

### `sendAdminAlert()`

Envoie un email d'alerte générique :

```typescript
await sendAdminAlert(
  "Titre de l'alerte",
  "Message descriptif",
  { detail1: "valeur", detail2: 123 } // Optionnel
);
```

## Production

### Checklist de déploiement

- [ ] Variable `SUPER_ADMIN_EMAIL` configurée
- [ ] Clé API Resend valide
- [ ] Domaine expéditeur vérifié sur Resend
- [ ] Test d'envoi réussi
- [ ] Surveillance des logs d'email

### Monitoring

Vérifiez les logs Resend :

```bash
# Logs système
pm2 logs selfkey --lines 100 | grep "Email"

# Dashboard Resend
# https://resend.com/emails
```

### Limites Resend

- **Plan gratuit** : 100 emails/jour
- **Plan Pro** : 50,000 emails/mois à partir de $20/mois
- **Rate limit** : 10 emails/seconde

## Personnalisation

### Template HTML

Le template est dans `/src/lib/email/alerts.ts` :

```typescript
const html = `
<!DOCTYPE html>
<html>
  <!-- Template personnalisable -->
</html>
`;
```

### Expéditeur

Modifiez `RESEND_FROM_EMAIL` ou le code :

```typescript
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "alerts@selfkey.app";
```

### Destinataires multiples

Pour envoyer à plusieurs admins :

```typescript
const result = await sendEmail({
  to: [adminEmail1, adminEmail2], // Array d'emails
  from: FROM_EMAIL,
  subject,
  html,
});
```

## Troubleshooting

### Email non reçu

1. **Vérifiez les spams** : Cherchez "selfkey" ou "webhook"
2. **Logs Resend** : https://resend.com/emails
3. **Email vérifié** : Le domaine doit être vérifié en production

### Erreur "RESEND_API_KEY not configured"

```bash
# Vérifiez que la variable existe
echo $RESEND_API_KEY

# Ou dans .env.local
cat .env.local | grep RESEND_API_KEY
```

### Erreur "Unauthorized"

La clé API est invalide ou expirée :

1. Générez une nouvelle clé sur https://resend.com/api-keys
2. Remplacez dans `.env.local`
3. Redémarrez le serveur

## Sécurité

- ✅ Clé API stockée en variable d'environnement (jamais en code)
- ✅ Email super-admin configurable
- ✅ Logs des erreurs d'envoi
- ✅ Pas de données sensibles dans les emails (pas de secrets HMAC)

## Ressources

- **Documentation Resend** : https://resend.com/docs
- **API Reference** : https://resend.com/docs/api-reference/emails/send-email
- **Support** : https://resend.com/support
