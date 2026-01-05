# 📘 Workflow : Ajout de champs dans la base de données

## 🎯 Contexte

- **Base de développement** : Neon (DATABASE_URL dans `.env`)
- **Base de production** : Exoscale (accès via pgAdmin)
- **Contrainte** : Pas de `prisma migrate dev` direct sur Exoscale

---

## 🔌 Connexion à la base de données Exoscale

### Option 1 : Via pgAdmin (Interface graphique)

#### 1. Télécharger pgAdmin

Si pas encore installé : [https://www.pgadmin.org/download/](https://www.pgadmin.org/download/)

#### 2. Informations de connexion Exoscale

Depuis votre `.env.exoscale` ou `scripts/.env.sync` :

```
Host: votre-host.aivencloud.com
Port: 21699 (ou 21700 pour le pool)
Database: defaultdb (ou selfkey-pool)
Username: avnadmin
Password: VOTRE_MOT_DE_PASSE
SSL Mode: Require
```

💡 **Trouvez vos credentials dans** : `.env.exoscale` ou `scripts/.env.sync`

#### 3. Créer la connexion dans pgAdmin

1. **Clic droit** sur "Servers" → "Register" → "Server"
2. **Onglet "General"** :
   - Name : `Selfkey Exoscale Production`
3. **Onglet "Connection"** :
   - Host name/address : `votre-host.aivencloud.com` (voir `.env.exoscale`)
   - Port : `21699`
   - Maintenance database : `defaultdb`
   - Username : `avnadmin`
   - Password : `VOTRE_MOT_DE_PASSE` (voir `.env.exoscale`)
   - ✅ Cochez "Save password"
4. **Onglet "SSL"** :
   - SSL mode : `Require`
5. **Cliquez** sur "Save"

#### 4. Exécuter une requête SQL

1. **Développez** le serveur → Databases → defaultdb
2. **Clic droit** sur defaultdb → "Query Tool"
3. **Collez** votre SQL
4. **Cliquez** sur ▶️ ou `F5` pour exécuter

### Option 2 : Via psql (Ligne de commande)

```bash
# Connexion directe (utilisez l'URL complète depuis .env.exoscale)
psql "postgres://avnadmin:VOTRE_MOT_DE_PASSE@votre-host.aivencloud.com:21699/defaultdb?sslmode=require"

# Ou en utilisant la variable d'environnement
export DATABASE_URL="postgres://avnadmin:VOTRE_MOT_DE_PASSE@votre-host.aivencloud.com:21699/defaultdb?sslmode=require"
psql $DATABASE_URL

# Ou directement depuis le fichier
psql $(cat .env.exoscale | grep DATABASE_URL | cut -d '=' -f2 | tr -d '"')
```

### Option 3 : Via Prisma Studio (avec Exoscale)

```bash
# Ouvrir Prisma Studio sur Exoscale
DATABASE_URL="postgres://avnadmin:VOTRE_MOT_DE_PASSE@votre-host.aivencloud.com:21699/defaultdb?sslmode=require" npx prisma studio

# Ou en utilisant directement le fichier .env.exoscale
DATABASE_URL=$(cat .env.exoscale | grep DATABASE_URL | cut -d '=' -f2 | tr -d '"') npx prisma studio
```

⚠️ **Attention** : Prisma Studio sur la production, à utiliser avec précaution !

### 🔍 Commandes utiles pour inspecter la base

#### Lister toutes les tables

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

#### Voir tous les champs d'une table (ex: bookings)

```sql
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'bookings'
ORDER BY ordinal_position;
```

#### Voir la structure complète avec détails

```sql
\d bookings
```

☝️ Cette commande fonctionne dans **psql** uniquement (pas dans pgAdmin Query Tool)

#### Compter les enregistrements

```sql
SELECT COUNT(*) FROM bookings;
```

#### Vérifier si un champ existe

```sql
SELECT EXISTS (
  SELECT 1
  FROM information_schema.columns
  WHERE table_name = 'bookings'
  AND column_name = 'internalNote'
);
```

Retourne `true` si le champ existe, `false` sinon.

---

## ✅ Processus recommandé

### **Étape 1 : Modifier le schema Prisma**

Éditez `prisma/schema.prisma` et ajoutez votre nouveau champ au modèle concerné.

Exemple :

```prisma
model Booking {
  // ... champs existants
  internalNote String? // Nouveau champ optionnel
  // ... relations
}
```

### **Étape 2 : Appliquer sur Neon (dev)**

```bash
# Pousse les changements sur la base de développement
npx prisma db push

# Régénère le client Prisma
npx prisma generate
```

### **Étape 3 : Générer le SQL de migration**

```bash
# Crée une migration sans l'appliquer
npx prisma migrate dev --create-only --name nom_descriptif_de_la_migration

# Exemple :
npx prisma migrate dev --create-only --name add_internal_note_to_booking
```

Le fichier SQL est créé dans : `prisma/migrations/XXXXXX_nom_migration/migration.sql`

### **Étape 4 : Appliquer sur Exoscale (production)**

1. **Ouvrez pgAdmin** et connectez-vous à Exoscale
2. **Ouvrez le fichier SQL** généré à l'étape 3
3. **Vérifiez le SQL** (important !)
4. **Copiez-collez** dans pgAdmin Query Tool
5. **Exécutez** la requête

### **Étape 5 : Marquer la migration comme appliquée**

```bash
# Connectez-vous avec l'URL Exoscale et marquez la migration
DATABASE_URL="postgresql://user:password@exoscale-url/db" npx prisma migrate resolve --applied XXXXXX_nom_migration
```

Ou si vous ne voulez pas tracker les migrations sur Exoscale, ignorez cette étape.

---

## 🔍 Exemple complet : Ajout du champ `internalNote`

### 1. Schema modifié ✅ (déjà fait)

```prisma
model Booking {
  // ... autres champs
  internalNote String? // Note interne admin
  // ...
}
```

### 2. Commandes à exécuter

```bash
# Appliquer sur Neon
npx prisma db push

# Générer la migration
npx prisma migrate dev --create-only --name add_internal_note_to_booking

# Le SQL sera quelque chose comme :
# ALTER TABLE "bookings" ADD COLUMN "internalNote" TEXT;
```

### 3. SQL à exécuter dans pgAdmin (Exoscale)

```sql
-- Migration: add_internal_note_to_booking
ALTER TABLE "bookings" ADD COLUMN "internalNote" TEXT;
```

---

## ⚠️ Points de vigilance

### Champs NOT NULL

Si vous ajoutez un champ `NOT NULL` sans valeur par défaut :

```prisma
newField String // ⚠️ Problème si la table contient déjà des données
```

**Solutions** :

1. Rendre le champ optionnel : `newField String?`
2. Ajouter une valeur par défaut : `newField String @default("")`
3. Migration en 2 temps :
   - Ajouter en optionnel
   - Remplir les valeurs existantes
   - Rendre obligatoire

### Modifications de colonnes existantes

```sql
-- Renommer une colonne
ALTER TABLE "bookings" RENAME COLUMN "oldName" TO "newName";

-- Changer le type
ALTER TABLE "bookings" ALTER COLUMN "amount" TYPE DECIMAL(10,2);

-- Ajouter une contrainte
ALTER TABLE "bookings" ALTER COLUMN "clientEmail" SET NOT NULL;
```

### Suppressions de colonnes

```sql
-- ⚠️ Backup avant de supprimer !
ALTER TABLE "bookings" DROP COLUMN "obsoleteField";
```

---

## 🚀 Résumé rapide (TL;DR)

```bash
# 1. Modifier schema.prisma
# 2. Appliquer dev
npx prisma db push

# 3. Générer SQL
npx prisma migrate dev --create-only --name ma_migration

# 4. Copier le SQL de prisma/migrations/XXXXX/migration.sql
# 5. Exécuter dans pgAdmin sur Exoscale
```

---

## 📚 Ressources

- [Prisma DB Push](https://www.prisma.io/docs/concepts/components/prisma-migrate/db-push)
- [Prisma Migrate](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Migration manuelle](https://www.prisma.io/docs/guides/migrate/production-troubleshooting)

---

**Dernière mise à jour** : 5 janvier 2026
