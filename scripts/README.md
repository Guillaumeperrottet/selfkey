# 🔧 Scripts SelfKey

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
