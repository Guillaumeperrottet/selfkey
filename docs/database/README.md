# 🗄️ Base de Données

Documentation complète sur la gestion de la base de données PostgreSQL.

## 📚 Documentation Disponible

### [Workflow Ajout Champs BDD](./WORKFLOW_AJOUT_CHAMPS_BDD.md)

Guide complet pour ajouter des champs dans la base de données.

**Ce que vous y trouverez :**

- ✅ Connexion à Exoscale (production) via pgAdmin
- ✅ Commandes SQL utiles pour inspecter la base
- ✅ Processus complet : Modifier schema → Dev (Neon) → Prod (Exoscale)
- ✅ Exemples concrets
- ✅ Points de vigilance (NOT NULL, modifications, suppressions)

## 🔄 Synchronisation Production → Dev

Pour copier les données d'Exoscale vers Neon, voir :

- **Script** : [../scripts/sync-prod-to-dev.sh](../../scripts/sync-prod-to-dev.sh)
- **Documentation** : [../scripts/README.md](../../scripts/README.md)

**Commandes rapides :**

```bash
# 1. Charger les variables d'environnement
source scripts/.env.sync

# 2. Lancer la synchronisation
./scripts/sync-prod-to-dev.sh
```

## 🔑 Environnements de Base de Données

### Production (Exoscale)

- **Provider** : Aiven Cloud (Suisse)
- **Accès** : Via pgAdmin ou psql
- **Credentials** : `.env.exoscale`
- **Migrations** : Manuelles via SQL

### Développement (Neon)

- **Provider** : Neon (USA)
- **Accès** : Via Prisma ou psql
- **Credentials** : `.env` (DATABASE_URL)
- **Migrations** : `npx prisma db push`

## 🛠️ Outils Utiles

### pgAdmin (Interface graphique)

- Téléchargement : [https://www.pgadmin.org/download/](https://www.pgadmin.org/download/)
- Utilisé pour Exoscale (production)

### Prisma Studio (Interface web)

```bash
# Sur Neon (dev)
npx prisma studio

# Sur Exoscale (prod - ATTENTION !)
DATABASE_URL=$(cat .env.exoscale | grep DATABASE_URL | cut -d '=' -f2 | tr -d '"') npx prisma studio
```

### psql (Ligne de commande)

```bash
# Connexion Neon
psql $DATABASE_URL

# Connexion Exoscale
psql $(cat .env.exoscale | grep DATABASE_URL | cut -d '=' -f2 | tr -d '"')
```

## 📊 Schema Prisma

Le schema de base de données est défini dans :

- **Fichier** : [../../prisma/schema.prisma](../../prisma/schema.prisma)
- **Migrations** : [../../prisma/migrations/](../../prisma/migrations/)

## 🔗 Retour

- [Documentation principale](../README.md)
- [Scripts](../../scripts/)

## 📋 sync-prod-to-dev.sh

Synchronise les données de la production (Exoscale) vers le développement (Neon).

### ⚙️ Configuration

**Créez un fichier `.env.sync` (NE PAS COMMIT !) :**

```bash
# .env.sync
export EXOSCALE_DATABASE_URL="postgres://avnadmin:VOTRE_PASSWORD@selfkey-exoscale-1eb6c5cb-b706-4c52-9af5-dfb2d402933b.i.aivencloud.com:21700/selfkey-pool?sslmode=require"

export NEON_DATABASE_URL="postgresql://selfkey_owner:VOTRE_PASSWORD@ep-square-sunset-a9soyvqj-pooler.gwc.azure.neon.tech/selfkey?sslmode=require"
```

### 🚀 Utilisation

```bash
# 1. Charger les variables
source scripts/.env.sync

# 2. Lancer la synchronisation
./scripts/sync-prod-to-dev.sh
```

### 📁 Backups

Les backups sont créés dans `backups/` et **ne sont PAS commitées** (voir `.gitignore`).

### ⚠️ Sécurité

- ❌ **NE JAMAIS commit `.env.sync`**
- ❌ **NE JAMAIS commit les backups/**
- ✅ Les mots de passe sont dans les variables d'environnement uniquement
