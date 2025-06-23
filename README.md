# SelfKey - Plateforme de Réservation Hôtelière

## ✨ Vue d'ensemble

SelfKey est une plateforme moderne de réservation hôtelière construite avec Next.js 15, TypeScript, et Prisma. Le système a été conçu pour être **simple, robuste et entièrement basé sur la base de données**, éliminant toute logique complexe d'inventaire au profit d'un modèle simplifié.

## 🏗️ Architecture Simplifiée

### Concept de base

- **Une chambre = Une réservation par nuit maximum**
- **Pas de gestion d'inventaire complexe** (fini les compteurs +/-)
- **Système 100% base de données** (plus de fichiers de config)
- **Intégration Stripe Connect complète** pour les paiements
- **Interface admin épurée** avec statut simple (disponible/réservée)

### Stack technique

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Backend**: API Routes Next.js, Prisma ORM
- **Base de données**: PostgreSQL (compatible avec Prisma Postgres)
- **Paiements**: Stripe Connect (avec webhooks)
- **Email**: Service email intégré pour confirmations

## 📦 Installation

```bash
# Cloner le projet
git clone [url-du-repo]
cd selfkey

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos clés

# Configurer la base de données
npx prisma generate
npx prisma migrate dev

# Démarrer le serveur de développement
npm run dev
```

## 🌍 Variables d'environnement

```env
# Base de données
DATABASE_URL="postgresql://..."

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Email (optionnel, pour les confirmations)
EMAIL_HOST="smtp...."
EMAIL_PORT="587"
EMAIL_USER="..."
EMAIL_PASS="..."
EMAIL_FROM="..."
```

## 🚀 Fonctionnalités

### 🏨 Pour l'hôtelier (Admin)

- **Configuration Stripe Connect** : Onboarding simplifié avec vérification du statut
- **Gestion des chambres** : Création, modification, désactivation des types de chambres
- **Dashboard temps réel** : Vue d'ensemble des réservations et statuts
- **Pas de gestion d'inventaire** : Chaque chambre est soit disponible, soit réservée
- **Statistiques** : Revenus du jour, taux d'occupation

### 👥 Pour les clients

- **Réservation simple** : Sélection chambre + nombre de personnes
- **Paiement sécurisé** : Stripe Connect avec SCA compliance
- **Confirmation immédiate** : Email + page de succès
- **Expérience mobile** : Interface responsive

### 🔧 Technique

- **Protection double-réservation** : Impossible de réserver 2x la même chambre/nuit
- **Webhooks Stripe** : Gestion automatique des paiements
- **Types TypeScript stricts** : Code robuste et maintenable
- **Prisma ORM** : Requêtes typées et migrations automatiques

## 📊 Modèle de données

### Entités principales

```typescript
// Établissement hôtelier
Establishment {
  slug: string           // URL-friendly ID
  name: string          // Nom affiché
  stripeAccountId?: string
  stripeOnboarded: boolean
  commissionRate: number // % de commission
  fixedFee: number      // Frais fixes en CHF
}

// Type de chambre
Room {
  id: string
  name: string          // "Chambre Standard", "Suite..."
  price: number         // Prix par nuit en CHF
  hotelSlug: string     // Lien vers l'établissement
  isActive: boolean     // Chambre disponible à la réservation
}

// Réservation
Booking {
  id: string
  roomId: string        // Chambre réservée
  hotelSlug: string     // Établissement
  clientName: string
  clientEmail: string
  phone: string
  guests: number        // 🆕 Nombre de personnes
  amount: number        // Montant payé
  currency: string      // Toujours "CHF"
  bookingDate: DateTime // Date de la nuit
  stripePaymentIntentId?: string
}
```

## 🎯 Flux de réservation

1. **Client visite** `/[hotel]` (ex: `/hotel-paradise`)
2. **Sélection chambre** parmi les disponibles
3. **Saisie infos** : nom, email, téléphone, nombre de personnes
4. **Redirection paiement** : `/[hotel]/payment` avec Stripe
5. **Confirmation** : webhook Stripe → email → `/[hotel]/success`

## 👨‍💼 Interface admin

Accès via `/admin/[hotel]` :

- **Configuration Stripe** : Onboarding et vérification du statut
- **Gestion chambres** : CRUD des types de chambres
- **Dashboard** : Statut en temps réel (disponible 🟢 / réservée 🔴)
- **Réservations** : Liste des réservations du jour avec détails client
- **Statistiques** : Métriques de performance

## 🔒 Sécurité & Compliance

### Stripe Connect

- **SCA compliance** : Strong Customer Authentication
- **Webhook signature** : Vérification automatique des événements
- **Gestion d'erreurs** : Retry automatique et logging

### Protection données

- **Validation stricte** : Zod schemas sur toutes les entrées
- **Sanitisation** : Nettoyage automatique des données client
- **Logs sécurisés** : Pas de stockage de données sensibles

### Next.js 15

- **Server Components** : Performances optimisées
- **Type safety** : TypeScript strict sur toute la codebase
- **Dynamic imports** : Lazy loading des modules lourds

## 🏗️ Structure du projet

```
src/
├── app/                          # App Router Next.js 15
│   ├── [hotel]/                 # Pages client
│   │   ├── page.tsx            # Liste des chambres
│   │   ├── payment/page.tsx    # Formulaire de paiement
│   │   └── success/page.tsx    # Confirmation
│   ├── admin/[hotel]/          # Interface d'administration
│   └── api/                    # Routes API
│       ├── booking/            # Création réservations
│       ├── payment-intent/     # Stripe payments
│       ├── admin/              # Gestion admin
│       └── webhooks/           # Stripe webhooks
├── components/                  # Composants React
│   ├── AdminDashboard.tsx      # Dashboard admin épuré
│   ├── PaymentForm.tsx         # Formulaire Stripe
│   ├── CheckinForm.tsx         # Formulaire client
│   └── RoomManagement.tsx      # CRUD chambres
├── lib/                        # Logique métier
│   ├── prisma.ts              # Client DB
│   ├── stripe-connect.ts      # Intégration Stripe
│   ├── booking.ts             # Logique réservation
│   └── email.ts               # Service email
└── types/                      # Types TypeScript
    └── hotel.ts               # Interfaces métier
```

## 🚀 Déploiement

### Prérequis

1. **Base de données PostgreSQL** (recommandé: Prisma Postgres)
2. **Compte Stripe** avec Connect activé
3. **Service email** (optionnel)

### Étapes

```bash
# Build production
npm run build

# Migrations DB
npx prisma migrate deploy

# Démarrage
npm start
```

### Variables de production

- Utiliser des clés Stripe **live** (pas test)
- Configurer le webhook endpoint avec l'URL de production
- Activer SSL/TLS pour toutes les communications

## 🧪 Tests

```bash
# Tests unitaires
npm test

# Tests e2e
npm run test:e2e

# Linting
npm run lint

# Type checking
npm run type-check
```

## 📈 Monitoring

Le système inclut :

- **Logs structurés** pour debugging
- **Métriques Stripe** via le dashboard
- **Alertes webhook** en cas d'échec
- **Health checks** sur `/api/health`

## 🔄 Migrations récentes

### v2.0 - Simplification (Décembre 2024)

- ✅ **Suppression inventaire complexe** : Plus de DailyInventory
- ✅ **Ajout champ guests** : Nombre de personnes par réservation
- ✅ **Interface admin épurée** : Plus de compteurs +/-, juste statut
- ✅ **100% base de données** : Suppression config JSON
- ✅ **Next.js 15 compatible** : Async params/searchParams
- ✅ **Stripe Connect robuste** : Gestion erreurs améliorée

## 📞 Support

Pour toute question ou problème :

1. Vérifier les logs d'application
2. Consulter le dashboard Stripe
3. Valider la configuration des webhooks
4. Contrôler la structure de la base de données

---

**Made with ❤️ for simple hotel booking**
