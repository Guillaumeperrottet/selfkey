# 🔍 Analyse Complète : Migration de Neon vers Infomaniak

**Date d'analyse :** 31 octobre 2025  
**Objectif :** Évaluer la faisabilité d'héberger les données en Suisse avec Infomaniak

---

## 📊 Vue d'Ensemble de l'Application

### Architecture Actuelle

**Stack Technique :**

- **Framework :** Next.js 15.3.4 (React 19)
- **Base de données :** PostgreSQL (actuellement Neon)
- **ORM :** Prisma 6.10.1
- **Hébergement :** Vercel
- **Authentification :** Better Auth avec PostgreSQL adapter
- **Paiements :** Stripe Connect
- **Emails :** Resend
- **Stockage d'images :** Cloudinary
- **Analytics :** Google Analytics 4 + Vercel Analytics

### Type d'Application

SelfKey est une **plateforme SaaS multi-tenant** pour la gestion hôtelière :

- Check-in automatique 24h/24
- Gestion de réservations et paiements
- Parking jour/nuit
- Collecte de taxes de séjour
- Dashboard administratif
- Système de webhooks pour intégrations externes
- API publique documentée

---

## 🗄️ Analyse de la Base de Données PostgreSQL

### Schéma de Base de Données

**21 Tables principales** réparties en plusieurs domaines :

#### 1. **Authentification & Utilisateurs** (4 tables)

- `user` : Comptes utilisateurs
- `account` : Comptes OAuth/Email
- `session` : Sessions utilisateurs
- `verification` : Tokens de vérification email

#### 2. **Établissements** (3 tables)

- `establishments` : Établissements hôteliers (configuration très riche)
- `rooms` : Chambres/espaces
- `user_establishment` : Relations multi-tenant

#### 3. **Réservations** (2 tables)

- `bookings` : Réservations (nuitées + parking jour)
- `invoices` : Factures PDF

#### 4. **Options de Prix** (2 tables)

- `pricing_options` : Options configurables (petit-déjeuner, parking, etc.)
- `pricing_option_values` : Valeurs des options

#### 5. **Intégrations** (3 tables)

- `integrations` : Connexions externes (PMS, etc.)
- `integration_logs` : Logs d'intégration
- `webhooks` : Webhooks sortants
- `webhook_logs` : Historique des webhooks

#### 6. **API & Monitoring** (2 tables)

- `api_keys` : Clés API pour accès externe
- `api_logs` : Logs des appels API

#### 7. **Données & Exports** (3 tables)

- `excel_export_history` : Historique des exports Excel
- `email_images` : Images Cloudinary pour emails
- `establishment_transfers` : Historique des transferts de propriété

#### 8. **Préférences** (1 table)

- `dashboard_preferences` : Configuration des dashboards

### Fonctionnalités PostgreSQL Utilisées

#### ✅ **Fonctionnalités Standard PostgreSQL**

```sql
-- Types de données standard
TEXT, VARCHAR, BOOLEAN, INTEGER, FLOAT, TIMESTAMP, DATE

-- Contraintes
PRIMARY KEY, FOREIGN KEY, UNIQUE, DEFAULT, NOT NULL

-- Relations
ON DELETE CASCADE (utilisé massivement)

-- Index
@@index (sur api_logs, webhook_logs)

-- Auto-increment
@default(autoincrement()) pour bookingNumber
```

#### ✅ **Type JSON** (Utilisé intensivement)

```prisma
// 15+ colonnes JSON dans le schéma
formConfig              Json?
presentationAttributes  Json?
presentationDocuments   Json?
presentationNearbyBusinesses Json?
selectedPricingOptions  Json?  // Snapshot complet des options
permissions             Json   // Permissions granulaires API
visibleStats            Json   // Configuration dashboard
```

**Impact :** Utilisation intensive de JSON pour stocker :

- Configuration dynamique des formulaires
- Snapshots d'options de prix (historique immuable)
- Permissions granulaires
- Configurations de dashboard personnalisées

#### ✅ **Arrays PostgreSQL**

```prisma
presentationImages      String[]  // URLs d'images
events                  String[]  // Types d'événements webhook
emailCopyAddresses      String[]  // Emails en copie
```

#### ✅ **Transactions**

```typescript
// Utilisé dans plusieurs endroits critiques
await prisma.$transaction(async (tx) => {
  const establishment = await tx.establishment.create({...});
  await tx.userEstablishment.create({...});
});
```

#### ✅ **Raw Queries** (Limité)

```typescript
// Utilisé uniquement pour les statistiques avancées
const stats = await prisma.$queryRaw`
  SELECT DATE("createdAt") as creation_date, 
         COUNT(*) as count
  FROM "establishments" 
  WHERE "createdAt" >= NOW() - INTERVAL '30 days'
  GROUP BY DATE("createdAt")
`;
```

#### ❌ **Fonctionnalités PostgreSQL Avancées NON Utilisées**

- Pas de Full-Text Search (FTS)
- Pas de Triggers
- Pas de Stored Procedures
- Pas de Views
- Pas de Partitioning
- Pas de JSONB indexing spécifique
- Pas de PostGIS ou extensions exotiques

---

## 🔌 Configuration de Connexion Actuelle

### Prisma Client Configuration

```typescript
// src/lib/database/prisma.ts
export const prisma = new PrismaClient({
  log: ["query"], // Logging des requêtes en dev
});

// Singleton pattern pour éviter trop de connexions
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

### Connection Pooling

**Actuellement :** Aucune configuration spécifique de pooling détectée

- Utilise le pooling par défaut de Prisma
- Pas de PgBouncer configuré
- Pas de paramètres de connexion avancés

**Connexions :**

```bash
# Variable d'environnement utilisée
DATABASE_URL="postgresql://..."
```

---

## 🇨🇭 Migration vers Infomaniak : Analyse de Compatibilité

### ✅ **100% Compatible**

#### PostgreSQL Standard

Infomaniak propose **PostgreSQL 16** (version récente), qui supporte :

- ✅ Tous les types de données utilisés (TEXT, VARCHAR, BOOLEAN, INTEGER, FLOAT, TIMESTAMP, JSON)
- ✅ Type JSON et JSONB (utilisé massivement dans votre app)
- ✅ Arrays PostgreSQL (String[])
- ✅ Transactions
- ✅ Foreign Keys avec ON DELETE CASCADE
- ✅ Auto-increment sequences
- ✅ Index standards

#### Prisma ORM

- ✅ Prisma fonctionne parfaitement avec n'importe quel PostgreSQL
- ✅ Prisma Migrate fonctionne avec PostgreSQL standard
- ✅ Aucune dépendance spécifique à Neon

### 📋 Ce qui Change

#### 1. **URL de Connexion**

```bash
# Avant (Neon)
DATABASE_URL="postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/database?sslmode=require"

# Après (Infomaniak)
DATABASE_URL="postgresql://user:pass@pgsql.infomaniak.com:5432/database?sslmode=require"
```

#### 2. **Connection Pooling** (Recommandé pour Serverless)

**Problème Vercel/Serverless :**

- Vercel Functions créent de nouvelles connexions à chaque invocation
- Risque de dépasser la limite de connexions PostgreSQL (100-200 par défaut)

**Solutions possibles :**

##### Option A : Utiliser Prisma Accelerate (payant)

```typescript
DATABASE_URL = "prisma://accelerate.prisma-data.net/?api_key=xxx";
```

- Connection pooling automatique
- Cache intégré
- Coût : ~$29-299/mois

##### Option B : Utiliser Supabase Pooler (gratuit si on utilise Supabase)

```typescript
DATABASE_URL =
  "postgresql://user:pass@db.xxx.supabase.co:6543/postgres?pgbouncer=true";
```

##### Option C : PgBouncer hébergé (complexe)

- Nécessite un serveur dédié pour PgBouncer
- Non recommandé pour Vercel

##### Option D : Aucun pooling (acceptable pour petit trafic)

- Si vous avez < 50 requêtes simultanées
- Infomaniak limite à ~100 connexions par défaut

**Recommandation :**

- **Court terme :** Tester sans pooling, monitorer les erreurs de connexion
- **Long terme :** Si croissance forte, utiliser Prisma Accelerate

#### 3. **Localisation des Données**

| Aspect                    | Neon                 | Infomaniak             |
| ------------------------- | -------------------- | ---------------------- |
| **Région**                | US East (Virginie)   | Suisse (Genève)        |
| **Latence depuis Vercel** | ~80-120ms            | ~120-180ms             |
| **RGPD**                  | USA (Privacy Shield) | ✅ Suisse (idéal RGPD) |
| **Souveraineté données**  | USA                  | ✅ 100% Suisse         |

**Impact performance :** +40-60ms de latence depuis Vercel (acceptable)

---

## 📦 Dépendances Externes (Hors BDD)

Ces services restent inchangés :

| Service              | Utilisation         | Localisation | Alternative Suisse                             |
| -------------------- | ------------------- | ------------ | ---------------------------------------------- |
| **Vercel**           | Hébergement Next.js | Global CDN   | Infomaniak Hosting (mais moins adapté Next.js) |
| **Stripe**           | Paiements           | Irlande (EU) | ✅ OK                                          |
| **Resend**           | Envoi emails        | USA          | Infomaniak Mail (API limitée)                  |
| **Cloudinary**       | Images              | Global CDN   | Infomaniak kDrive API                          |
| **Google Analytics** | Analytics           | USA          | Matomo (self-hosted)                           |

**Note importante :** Même avec BDD en Suisse, les autres services restent hors Suisse (sauf si migration complète).

---

## 🚀 Plan de Migration

### Phase 1 : Préparation (1 jour)

1. **Créer compte Infomaniak**
   - Commander hébergement PostgreSQL
   - Obtenir les credentials

2. **Backup Neon**

   ```bash
   pg_dump $DATABASE_URL > backup_neon.sql
   ```

3. **Tester en local**

   ```bash
   # .env.local
   DATABASE_URL="postgresql://infomaniak_user:pass@localhost:5432/test"

   npx prisma migrate deploy
   npm run dev
   ```

### Phase 2 : Migration (2-4 heures)

1. **Créer la base sur Infomaniak**

   ```bash
   # Via interface Infomaniak ou CLI
   createdb selfkey_production
   ```

2. **Appliquer le schéma Prisma**

   ```bash
   DATABASE_URL="postgresql://..." npx prisma migrate deploy
   ```

3. **Importer les données**

   ```bash
   psql $DATABASE_URL < backup_neon.sql
   ```

4. **Vérifier l'intégrité**
   ```bash
   # Compter les lignes
   SELECT 'users' as table, COUNT(*) FROM "user"
   UNION ALL
   SELECT 'establishments', COUNT(*) FROM "establishments"
   UNION ALL
   SELECT 'bookings', COUNT(*) FROM "bookings";
   ```

### Phase 3 : Bascule (30 min)

1. **Mettre à jour Vercel**

   ```bash
   vercel env add DATABASE_URL production
   # Coller la nouvelle URL Infomaniak
   ```

2. **Redéployer**

   ```bash
   vercel --prod
   ```

3. **Tester en production**
   - Créer un test establishment
   - Faire une réservation test
   - Vérifier les emails
   - Tester le dashboard

### Phase 4 : Monitoring (1 semaine)

1. **Surveiller les erreurs**

   ```bash
   # Dans Vercel logs
   vercel logs --follow
   ```

2. **Métriques à surveiller**
   - ❌ Erreurs de connexion (`P1001`)
   - ⏱️ Temps de réponse API
   - 📊 Nombre de connexions actives

3. **Rollback si problème**
   ```bash
   # Remettre l'ancienne URL
   vercel env add DATABASE_URL production
   vercel --prod
   ```

---

## ⚠️ Risques & Mitigations

### 1. **Connexions Épuisées** (Risque Moyen)

**Symptôme :**

```
Error: P1001: Can't reach database server at `pgsql.infomaniak.com`
```

**Solutions :**

1. Augmenter la limite sur Infomaniak (100 → 200 connexions)
2. Implémenter Prisma Accelerate
3. Optimiser le code pour réutiliser `prisma` client

### 2. **Latence Accrue** (Risque Faible)

**Impact attendu :** +40-60ms par requête DB

**Solution :**

- Utiliser Vercel Edge Functions pour les pages critiques
- Implémenter du caching Redis (Upstash)

### 3. **Downtime lors Migration** (Risque Faible)

**Impact :** 5-15 minutes d'indisponibilité

**Mitigation :**

- Planifier migration hors heures de pointe
- Activer mode maintenance
- Backup automatique avant migration

### 4. **Incompatibilités** (Risque Très Faible)

**Probabilité :** < 1%

Votre app n'utilise **aucune fonctionnalité exotique** :

- Pas d'extensions PostgreSQL spéciales
- Pas de Triggers/Procedures
- Schema 100% standard Prisma

---

## 💰 Analyse Coûts

### Neon (Actuel)

| Plan  | Prix/mois | Inclus                  |
| ----- | --------- | ----------------------- |
| Free  | 0€        | 0.5 GB, 10 GB transfers |
| Pro   | ~$19      | 10 GB, auto-scaling     |
| Scale | ~$69+     | Plus de stockage        |

### Infomaniak (Cible)

| Service            | Prix/mois   | Inclus                    |
| ------------------ | ----------- | ------------------------- |
| PostgreSQL Managed | ~CHF 9-19   | 5-20 GB SSD, backups      |
| Hébergement Web    | CHF 5.75-25 | Si besoin d'hosting aussi |

**Économie potentielle :** -50% à 0% selon le plan actuel

---

## 📊 Avantages de la Migration

### ✅ **Conformité & Souveraineté**

1. **RGPD Renforcé**
   - Données hébergées en Suisse
   - Hors juridiction EU/USA
   - Idéal pour clients suisses sensibles (administrations publiques)

2. **Marketing**
   - Argument de vente : "Hébergement 100% Suisse"
   - Confiance accrue pour collectivités locales
   - Aligné avec la mission SelfKey

3. **Réglementation**
   - Conformité LPD (Loi suisse sur la Protection des Données)
   - Pas de Cloud Act américain

### ✅ **Stabilité**

- Infomaniak : 25 ans d'expérience en Suisse
- SLA élevé (99.9%)
- Support en français/allemand

### ⚠️ **Inconvénients**

1. **Performance**
   - +40-60ms latence depuis Vercel (US/EU)
   - Impact minimal pour UX (< 200ms acceptable)

2. **Écosystème**
   - Neon : intégration native Vercel
   - Infomaniak : configuration manuelle

3. **Scaling**
   - Neon : auto-scaling serverless
   - Infomaniak : plans fixes (nécessite upgrade manuel)

---

## 🎯 Recommandation Finale

### ✅ **OUI, la migration est TOTALEMENT FAISABLE**

**Pourquoi :**

1. ✅ Aucune incompatibilité technique
2. ✅ Prisma gère 100% de l'abstraction
3. ✅ Schéma PostgreSQL 100% standard
4. ✅ Migration testable en staging
5. ✅ Rollback possible en < 10 min

### 📋 Conditions de Succès

1. **Tester en environnement de staging d'abord**

   ```bash
   # Créer une preview deployment
   vercel --prod=false
   ```

2. **Planifier migration hors heures de pointe**
   - Dimanche 2h-4h du matin
   - Notifier les clients actifs

3. **Monitorer 7 jours après migration**
   - Erreurs de connexion
   - Performance
   - Feedback utilisateurs

### 🚦 Feu Vert Si

- ✅ Vous avez < 500 réservations/jour
- ✅ Vous acceptez +50ms de latence
- ✅ Conformité RGPD/Suisse est prioritaire
- ✅ Vous avez 1 jour pour tester/migrer

### ⚠️ Attendre Si

- ❌ Pic d'activité prévu (saison haute)
- ❌ Pas de temps pour tester (< 1 jour)
- ❌ Besoin d'auto-scaling immédiat

---

## 📞 Prochaines Étapes

### Immédiat (Cette Semaine)

1. ✅ **Lire cette analyse**
2. 📞 **Contacter Infomaniak** - Demander devis PostgreSQL 16
3. 🧪 **Tester en local** - Créer BDD locale Infomaniak

### Court Terme (2 Semaines)

1. 🔧 **Setup staging** - Environnement de test
2. 📊 **Benchmark performance** - Comparer Neon vs Infomaniak
3. 📋 **Checklist migration** - Préparer procédure détaillée

### Moyen Terme (1 Mois)

1. 🚀 **Migration production** - Dimanche matin
2. 📈 **Monitoring** - Surveiller 7 jours
3. 🎉 **Communication** - Annoncer hébergement Suisse

---

## 📚 Ressources

### Documentation

- [Infomaniak PostgreSQL](https://www.infomaniak.com/fr/hebergement/web-et-mail/hebergement-web)
- [Prisma with PostgreSQL](https://www.prisma.io/docs/concepts/database-connectors/postgresql)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

### Scripts Utiles

```bash
# Backup complet
pg_dump $DATABASE_URL --clean --if-exists > backup.sql

# Restaurer
psql $NEW_DATABASE_URL < backup.sql

# Comparer nombre de lignes
psql $DATABASE_URL -c "SELECT schemaname,tablename,n_live_tup FROM pg_stat_user_tables ORDER BY n_live_tup DESC;"
```

### Support

- **Infomaniak :** support@infomaniak.com (24/7)
- **Prisma :** https://github.com/prisma/prisma/issues
- **Communauté :** https://www.prisma.io/slack

---

## ✅ Conclusion

**La migration Neon → Infomaniak est NON SEULEMENT possible, mais RECOMMANDÉE** pour :

- 🇨🇭 Renforcer la crédibilité "Swiss Made Data"
- 🔒 Améliorer la conformité RGPD
- 💰 Potentiellement réduire les coûts

**Complexité technique :** ⭐⭐☆☆☆ (2/5)  
**Risque :** ⚠️⚠️☆☆☆ (2/5)  
**Impact positif :** 🚀🚀🚀🚀🚀 (5/5)

**Temps total estimé :** 2 jours (1j test + 1j migration)

---

_Document généré le 31 octobre 2025_  
_Base : Analyse du code source SelfKey_
