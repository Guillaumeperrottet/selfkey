# 🔽 Migration Business-4 → Hobbyist-2 (Exoscale)

**Économie mensuelle : 375 CHF (-94%)**

---

## 📊 Comparaison des Plans

| Caractéristique      | Business-4 | Hobbyist-2 |
| -------------------- | ---------- | ---------- |
| **Prix mensuel**     | 398.35 CHF | 22.56 CHF  |
| **vCPU**             | 4 cores    | 2 cores    |
| **RAM**              | 16 GB      | 8 GB       |
| **Stockage**         | 175 GB     | 80 GB      |
| **Backup**           | ✅         | ✅         |
| **HA (Haute dispo)** | ✅ Oui     | ⚠️ Non     |

## ✅ Prérequis pour la Migration

### 1. Vérifier l'espace utilisé

```bash
# Se connecter à votre BDD actuelle
psql "votre_database_url_exoscale"
```

```sql
-- Vérifier la taille totale de la base
SELECT pg_size_pretty(pg_database_size('defaultdb')) AS total_size;

-- Détail par table (noms réels de votre schema Prisma)
SELECT
  tablename,
  pg_size_pretty(pg_total_relation_size(tablename::text)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(tablename::text) DESC
LIMIT 20;

-- Compter vos données principales
SELECT 'Bookings' AS table_name, COUNT(*) AS rows FROM bookings
UNION ALL
SELECT 'Establishments', COUNT(*) FROM establishments
UNION ALL
SELECT 'Users', COUNT(*) FROM "user"
UNION ALL
SELECT 'Rooms', COUNT(*) FROM rooms;
```

**Résultat attendu :**

```
 total_size
------------
 11 MB      ← Votre résultat actuel ! 🎉
```

**Analyse de votre situation :**

- ✅ **11 MB** utilisés sur Business-4 (175 GB) = **0.006%** d'utilisation
- ✅ Hobbyist-2 (80 GB) sera utilisé à **0.01%**
- ✅ **Vous payez 398 CHF/mois pour 11 MB de données** 😱

**Limite Hobbyist-2 : 80 GB de stockage**

Vous êtes **LARGEMENT en dessous** ! Migration 100% safe ✅

**Même avec une croissance de 1000%, vous seriez à 110 MB (0.1% de Hobbyist-2)**

---

## 🚀 Processus de Migration (Méthode Sécurisée)

### Étape 1 : Backup Complet

```bash
# 1. Créer un backup manuel (via Exoscale console)
# Aller sur : https://portal.exoscale.com/dbaas
# Sélectionner votre service PostgreSQL Business-4
# Backups → Create backup now

# 2. Télécharger un backup local (sécurité)
EXOSCALE_DB_URL="postgresql://avnadmin:PASS@HOST:PORT/defaultdb?sslmode=require"

pg_dump "$EXOSCALE_DB_URL" \
  --format=custom \
  --file="backup_business4_$(date +%Y%m%d_%H%M%S).dump" \
  --verbose

# 3. Vérifier le backup
ls -lh backup_business4_*.dump
```

### Étape 2 : Créer la Nouvelle DB Hobbyist-2

**Via Exoscale Portal :**

1. Aller sur https://portal.exoscale.com/dbaas
2. Cliquer sur **"Create Database Service"**
3. Choisir **PostgreSQL**
4. Sélectionner le plan : **Hobbyist-2**
5. Zone : **ch-gva-2** (Genève - Suisse)
6. Nom : `selfkey-hobbyist2` (ou autre nom)
7. Créer le service

**⏱️ Temps de création : 5-10 minutes**

### Étape 3 : Obtenir les Credentials Hobbyist-2

```bash
# Via Exoscale CLI (si installé)
exo dbaas show selfkey-hobbyist2 -z ch-gva-2

# Ou récupérer via le dashboard Exoscale
# Connection Information → Copy URI
```

Sauvegarder dans un fichier temporaire :

```bash
# .env.hobbyist2 (NE PAS COMMIT)
DATABASE_URL_HOBBYIST2="postgresql://avnadmin:NEW_PASSWORD@NEW_HOST:PORT/defaultdb?sslmode=require"
```

### Étape 4 : Restaurer les Données

```bash
# Charger les variables
source .env.hobbyist2

# Restaurer le backup
pg_restore \
  --dbname="$DATABASE_URL_HOBBYIST2" \
  --verbose \
  --clean \
  --if-exists \
  --no-owner \
  --no-acl \
  backup_business4_YYYYMMDD_HHMMSS.dump

# Vérifier les données (noms de tables Prisma)
psql "$DATABASE_URL_HOBBYIST2" -c "SELECT COUNT(*) FROM bookings;"
psql "$DATABASE_URL_HOBBYIST2" -c "SELECT COUNT(*) FROM establishments;"
psql "$DATABASE_URL_HOBBYIST2" -c "SELECT COUNT(*) FROM \"user\";"
psql "$DATABASE_URL_HOBBYIST2" -c "SELECT COUNT(*) FROM rooms;"
```

### Étape 5 : Tester en Local

```bash
# Modifier temporairement .env.local
DATABASE_URL="postgresql://avnadmin:NEW_PASSWORD@NEW_HOST:PORT/defaultdb?sslmode=require"

# Générer le client Prisma
npx prisma generate

# Lancer l'app en local
npm run dev

# Tester les fonctionnalités critiques :
# ✅ Connexion admin
# ✅ Voir les réservations
# ✅ Créer une réservation test
# ✅ Paiements (mode dev)
# ✅ Emails de confirmation
```

### Étape 6 : Mise en Production (Vercel)

```bash
# 1. Mettre à jour la variable d'environnement sur Vercel
vercel env rm DATABASE_URL production
vercel env add DATABASE_URL production

# Coller la nouvelle URL Hobbyist-2 quand demandé

# 2. Redéployer
vercel --prod

# 3. Tester immédiatement
# ✅ Ouvrir https://www.selfkey.ch
# ✅ Connexion admin
# ✅ Vérifier les données
# ✅ Tester une réservation
```

### Étape 7 : Surveillance Post-Migration

```bash
# Monitorer les performances pendant 24-48h
# Via Vercel Dashboard → Logs
# Via Exoscale Dashboard → Metrics

# Vérifier :
# - Temps de réponse API < 500ms
# - Aucune erreur database connection
# - Réservations fonctionnent
# - Paiements Stripe OK
```

### Étape 8 : Supprimer Business-4 (Après 1 semaine)

**⚠️ Attendez au moins 7 jours pour être sûr !**

```bash
# 1. Créer un dernier backup Business-4 (sécurité)
pg_dump "$DATABASE_URL_BUSINESS4" > final_backup_business4.sql

# 2. Via Exoscale Portal
# Sélectionner le service Business-4
# Settings → Delete Service

# 3. Confirmation suppression
# ❌ La suppression est DÉFINITIVE
```

---

## 🔄 Méthode Alternative : Scaling Direct (Plus Rapide)

**⚠️ Moins sûr mais plus rapide (5 minutes de downtime)**

```bash
# Via Exoscale CLI
exo dbaas update selfkey-business4 \
  --plan hobbyist-2 \
  -z ch-gva-2

# Ou via l'interface web :
# 1. Dashboard Exoscale → DBaaS
# 2. Sélectionner votre service
# 3. Cliquer "Update"
# 4. Choisir plan "Hobbyist-2"
# 5. Confirmer

# ⏱️ Temps de migration : 5-10 minutes
# ⚠️ Service indisponible pendant la migration
```

**Avantages :**

- ✅ Pas besoin de changer DATABASE_URL
- ✅ Conserve les backups automatiques
- ✅ Pas de restauration manuelle

**Inconvénients :**

- ⚠️ Downtime de 5-10 minutes
- ⚠️ Pas de rollback facile si problème

---

## 🎯 Recommandation

### Pour SelfKey, je recommande : **Méthode Sécurisée (Étapes 1-8)**

**Pourquoi ?**

- ✅ Zéro downtime
- ✅ Possibilité de rollback immédiat
- ✅ Tester avant de switcher production
- ✅ Garder Business-4 en backup pendant 1 semaine

**Timing estimé :**

- ⏱️ Backup : 10 minutes
- ⏱️ Création Hobbyist-2 : 10 minutes
- ⏱️ Restauration : 15 minutes
- ⏱️ Tests : 30 minutes
- ⏱️ Déploiement prod : 5 minutes

**Total : ~1h30** (mais zéro impact utilisateurs)

---

## 📈 Monitoring Post-Migration

### Métriques à surveiller

```sql
-- Vérifier les connexions actives
SELECT count(*) FROM pg_stat_activity WHERE state = 'active';

-- Vérifier la taille DB
SELECT pg_size_pretty(pg_database_size('defaultdb'));

-- Temps des requêtes lentes
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

### Alerts à configurer

- ⚠️ CPU > 80% pendant 5min
- ⚠️ RAM > 90%
- ⚠️ Connexions > 50
- ⚠️ Stockage > 70 GB

---

## 🆘 Rollback d'Urgence

Si problème critique après migration :

```bash
# 1. Changer DATABASE_URL sur Vercel
vercel env rm DATABASE_URL production
vercel env add DATABASE_URL production
# Remettre l'ancienne URL Business-4

# 2. Redéployer
vercel --prod

# 3. Temps de rollback : 5 minutes
```

**La Business-4 reste active jusqu'à ce que vous la supprimiez !**

---

## 💰 Économies Réelles

### Année 1

```
Business-4 :  398 CHF × 12 = 4,776 CHF
Hobbyist-2 :   23 CHF × 12 =   276 CHF
-------------------------------------------
Économie     :             4,500 CHF/an 💰
```

### Comparaison avec Neon (Alternative)

| Provider | Plan       | Prix/mois        | Hébergement |
| -------- | ---------- | ---------------- | ----------- |
| Exoscale | Hobbyist-2 | 23 CHF           | 🇨🇭 Suisse   |
| Neon     | Scale      | 69 USD (~65 CHF) | 🇺🇸 USA      |
| Neon     | Free       | 0 CHF            | 🇺🇸 USA      |

**Neon Free Tier suffit pour votre usage actuel !**

---

## ✅ Checklist de Migration

### Avant Migration

- [ ] Backup manuel créé et téléchargé
- [ ] Vérification taille DB < 70 GB
- [ ] Plan de rollback préparé
- [ ] Fenêtre de maintenance planifiée (optionnel)

### Pendant Migration

- [ ] Hobbyist-2 créée sur Exoscale
- [ ] Données restaurées et vérifiées
- [ ] Tests locaux OK
- [ ] DATABASE_URL mise à jour sur Vercel
- [ ] Déploiement production effectué
- [ ] Tests post-déploiement OK

### Après Migration

- [ ] Monitoring 24h OK
- [ ] Aucune erreur détectée
- [ ] Performances stables
- [ ] Utilisateurs satisfaits
- [ ] Business-4 supprimée (après 7 jours)

---

## 📞 Support

### Exoscale Support

- **Email** : support@exoscale.com
- **Portal** : https://portal.exoscale.com/support
- **Doc** : https://community.exoscale.com/product/dbaas/

### En cas de problème

1. Vérifier les logs Vercel
2. Vérifier les metrics Exoscale
3. Contacter le support si nécessaire

---

## 🎉 Conclusion

Passer de Business-4 à Hobbyist-2 est **sans risque** et vous fera économiser **375 CHF/mois**.

Votre application n'utilise pas les capacités de Business-4, et Hobbyist-2 est largement suffisant pour :

- ✅ Plusieurs centaines de réservations/mois
- ✅ 10+ établissements
- ✅ Traffic web modéré
- ✅ Croissance sur les 6-12 prochains mois

**Quand upgrade vers Business-4 ?**

- Quand Hobbyist-2 atteint 80% CPU en continu
- Quand vous avez 50+ établissements actifs
- Quand vous avez 1000+ réservations/jour

**Vous n'y êtes pas encore ! 😉**

---

**Prêt à migrer ? Suivez les étapes ci-dessus et économisez 4,500 CHF/an !** 🚀
