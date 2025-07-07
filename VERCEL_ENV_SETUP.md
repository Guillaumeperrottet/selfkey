# Variables d'environnement pour Vercel

## 🚀 Configuration des variables d'environnement pour le déploiement

Configurez ces variables dans votre dashboard Vercel (Settings > Environment Variables) :

### 🗄️ Base de données

- `DATABASE_URL` - URL de connexion PostgreSQL (Neon, Supabase, etc.)

### 🔐 Authentification

- `BETTER_AUTH_SECRET` - Clé secrète pour Better Auth (générez avec `openssl rand -base64 32`)
- `BETTER_AUTH_URL` - `https://www.selfkey.ch`
- `NEXT_PUBLIC_APP_URL` - `https://www.selfkey.ch`
- `NEXT_PUBLIC_BASE_URL` - `https://www.selfkey.ch`

### 🌐 Google OAuth

- `GOOGLE_CLIENT_ID` - ID client depuis Google Cloud Console
- `GOOGLE_CLIENT_SECRET` - Secret client depuis Google Cloud Console

### 💳 Stripe

- `STRIPE_SECRET_KEY` - Clé secrète Stripe (sk*live*... ou sk*test*...)
- `NEXT_PUBLIC_STRIPE_PUBLIC_KEY` - Clé publique Stripe (pk*live*... ou pk*test*...)

### 💰 Configuration commission

- `PLATFORM_COMMISSION_RATE` - `1` (1% de commission)
- `PLATFORM_FIXED_FEE` - `0.10` (0.10 CHF par transaction)

### 📧 Email

- `RESEND_API_KEY` - Clé API Resend pour l'envoi d'emails

### 📊 Monitoring

- `MONITORING_API_KEY` - Clé pour le monitoring (générez une valeur aléatoire)

## ⚠️ Notes importantes

1. **Ne jamais commit les vraies valeurs** dans le repository
2. **URLs de production** : Utilisez `https://www.selfkey.ch` pour toutes les URLs
3. **Clés Stripe** : Utilisez les clés de production pour le déploiement final
4. **Base de données** : Assurez-vous que la base de données accepte les connexions externes
5. **Google OAuth** : Ajoutez `https://www.selfkey.ch` aux domaines autorisés dans la console Google

## 🔄 Après avoir configuré les variables

1. Redéployez l'application depuis Vercel
2. Vérifiez que toutes les fonctionnalités marchent
3. Testez l'authentification Google
4. Testez les paiements Stripe

## 🔧 Génération des secrets

```bash
# Better Auth Secret
openssl rand -base64 32

# Monitoring API Key (exemple)
openssl rand -hex 16
```
