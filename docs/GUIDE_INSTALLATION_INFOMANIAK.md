# 🚀 Guide Pas-à-Pas : Installation PostgreSQL sur Infomaniak

**Date :** 31 octobre 2025  
**Objectif :** Configurer votre Serveur Cloud Managé Infomaniak pour SelfKey

---

## 📋 Prérequis

✅ Vous avez commandé le **Serveur Cloud Managé** (Cloud M)  
✅ Vous avez reçu l'email de confirmation d'Infomaniak  
⏳ Attendre 1-2 heures que le serveur soit provisionné

---

## 🎯 Étape 1 : Accéder au Manager Infomaniak (5 min)

### 1.1 Se connecter au Manager

1. Aller sur : **https://manager.infomaniak.com**
2. Se connecter avec vos identifiants Infomaniak
3. Dans le menu latéral gauche, cliquer sur **"Cloud Serveur"** ou **"VPS/Serveur Cloud"**

### 1.2 Vérifier que votre serveur est actif

Vous devriez voir votre nouveau serveur avec :

- ✅ Statut : **"Actif"** ou **"Running"**
- 📍 IP publique : `XXX.XXX.XXX.XXX`
- 💾 Système : Ubuntu 22.04 ou 24.04

**Si le serveur est en cours de provisionnement :**

- État : "En cours de création"
- ⏳ Attendre 30-60 minutes
- 📧 Vous recevrez un email quand c'est prêt

---

## 🔑 Étape 2 : Obtenir les Accès SSH (5 min)

### 2.1 Trouver vos identifiants SSH

Dans le Manager Infomaniak, cliquer sur votre serveur, puis :

1. Onglet **"Accès SSH"** ou **"Connexion"**
2. Vous devriez voir :
   ```
   Hôte : XXX.XXX.XXX.XXX (votre IP)
   Utilisateur : root
   Mot de passe : [Cliquer pour révéler]
   ```

**Option A : Mot de passe**

- Cliquer sur **"Afficher le mot de passe"**
- Le copier dans un endroit sûr (ex: 1Password, Bitwarden)

**Option B : Clé SSH** (plus sécurisé)

- Si vous avez une clé SSH configurée, l'utiliser
- Sinon, utiliser le mot de passe pour l'instant

### 2.2 Tester la connexion SSH

**Sur macOS (Terminal) :**

```bash
# Ouvrir le Terminal (Cmd + Espace, taper "Terminal")
ssh root@XXX.XXX.XXX.XXX

# Remplacer XXX.XXX.XXX.XXX par votre vraie IP
# Exemple : ssh root@185.123.45.67
```

Quand on vous demande :

```
Are you sure you want to continue connecting (yes/no/[fingerprint])?
```

Taper : **`yes`** puis **Entrée**

Puis entrer le **mot de passe** quand demandé.

**✅ Si vous voyez ceci, c'est bon :**

```
Welcome to Ubuntu 22.04 LTS
root@cloud-server:~#
```

---

## 📦 Étape 3 : Mettre à Jour le Système (5 min)

Une fois connecté en SSH, exécuter ces commandes une par une :

```bash
# Mettre à jour la liste des paquets
apt update

# Mettre à jour tous les paquets installés
apt upgrade -y

# Installer les outils de base
apt install -y curl wget gnupg2 software-properties-common apt-transport-https ca-certificates
```

**Attendre que ça se termine** (2-5 minutes selon la connexion).

---

## 🐘 Étape 4 : Installer PostgreSQL 16 (10 min)

### 4.1 Ajouter le dépôt officiel PostgreSQL

```bash
# Importer la clé GPG du dépôt PostgreSQL
curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc | gpg --dearmor -o /usr/share/keyrings/postgresql-keyring.gpg

# Ajouter le dépôt PostgreSQL
echo "deb [signed-by=/usr/share/keyrings/postgresql-keyring.gpg] http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" | tee /etc/apt/sources.list.d/pgdg.list

# Mettre à jour la liste des paquets
apt update
```

### 4.2 Installer PostgreSQL 16

```bash
# Installer PostgreSQL 16 et ses outils
apt install -y postgresql-16 postgresql-contrib-16

# Vérifier que PostgreSQL est bien installé
psql --version
# Devrait afficher : psql (PostgreSQL) 16.x
```

### 4.3 Vérifier que PostgreSQL fonctionne

```bash
# Vérifier le statut
systemctl status postgresql

# Devrait afficher : Active: active (running)
# Presser "q" pour quitter
```

**✅ Si vous voyez "active (running)", PostgreSQL est installé avec succès !**

---

## 🔧 Étape 5 : Configurer PostgreSQL pour l'Accès Externe (10 min)

Par défaut, PostgreSQL n'accepte que les connexions locales. On va permettre les connexions depuis Vercel.

### 5.1 Configurer l'écoute sur toutes les interfaces

```bash
# Éditer le fichier de configuration
nano /etc/postgresql/16/main/postgresql.conf
```

**Dans l'éditeur nano :**

1. Presser **`Ctrl + W`** (rechercher)
2. Taper : **`listen_addresses`**
3. Presser **Entrée**

Vous devriez voir une ligne comme :

```
#listen_addresses = 'localhost'
```

**Modifier cette ligne pour :**

```
listen_addresses = '*'
```

**Important :**

- Enlever le **`#`** au début (décommenter)
- Remplacer **`'localhost'`** par **`'*'`**

**Sauvegarder :**

- Presser **`Ctrl + X`**
- Taper **`Y`** (pour Yes)
- Presser **Entrée**

### 5.2 Autoriser les connexions externes

```bash
# Éditer le fichier d'authentification
nano /etc/postgresql/16/main/pg_hba.conf
```

**Aller à la fin du fichier :**

- Presser **`Ctrl + End`** (ou faire défiler avec les flèches)

**Ajouter cette ligne à la fin :**

```
host    all             all             0.0.0.0/0               scram-sha-256
```

**Explication :**

- `host` = connexion TCP/IP
- `all` = toutes les bases de données
- `all` = tous les utilisateurs
- `0.0.0.0/0` = depuis n'importe quelle IP
- `scram-sha-256` = méthode d'authentification sécurisée

**Sauvegarder :**

- Presser **`Ctrl + X`**
- Taper **`Y`**
- Presser **Entrée**

### 5.3 Redémarrer PostgreSQL

```bash
# Redémarrer pour appliquer les changements
systemctl restart postgresql

# Vérifier que ça a bien redémarré
systemctl status postgresql
# Devrait afficher : Active: active (running)
```

---

## 👤 Étape 6 : Créer l'Utilisateur et la Base de Données (5 min)

### 6.1 Se connecter à PostgreSQL

```bash
# Se connecter en tant que superuser postgres
sudo -u postgres psql
```

Vous devriez voir :

```
postgres=#
```

### 6.2 Créer l'utilisateur pour SelfKey

**Dans le terminal PostgreSQL, taper :**

```sql
-- Créer un utilisateur avec un mot de passe sécurisé
CREATE USER selfkey_user WITH PASSWORD 'VotreMotDePasseSecurise123!';

-- Donner les privilèges de création de base de données
ALTER USER selfkey_user CREATEDB;
```

**⚠️ IMPORTANT : Choisir un mot de passe fort !**

- Minimum 20 caractères
- Mélange de majuscules, minuscules, chiffres, symboles
- Exemple : `Sk2025!PostgreSQL@Infomaniak#Secure`

**📝 NOTER LE MOT DE PASSE :** Vous en aurez besoin pour l'URL de connexion !

### 6.3 Créer la base de données

```sql
-- Créer la base de données SelfKey
CREATE DATABASE selfkey_production OWNER selfkey_user;

-- Donner tous les privilèges
GRANT ALL PRIVILEGES ON DATABASE selfkey_production TO selfkey_user;

-- Afficher les bases de données pour vérifier
\l
```

Vous devriez voir `selfkey_production` dans la liste.

### 6.4 Quitter PostgreSQL

```sql
-- Quitter
\q
```

---

## 🔥 Étape 7 : Configurer le Firewall (5 min)

### 7.1 Installer UFW (firewall simple)

```bash
# Installer UFW
apt install -y ufw
```

### 7.2 Configurer les règles

```bash
# Autoriser SSH (IMPORTANT : avant d'activer le firewall !)
ufw allow 22/tcp

# Autoriser PostgreSQL
ufw allow 5432/tcp

# Activer le firewall
ufw enable

# Confirmer avec 'y' quand demandé
```

### 7.3 Vérifier les règles

```bash
# Afficher les règles actives
ufw status

# Devrait afficher :
# Status: active
# 22/tcp                     ALLOW       Anywhere
# 5432/tcp                   ALLOW       Anywhere
```

---

## 🧪 Étape 8 : Tester la Connexion (5 min)

### 8.1 Construire l'URL de connexion

**Format de l'URL :**

```
postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE?sslmode=require
```

**Remplacer par vos vraies valeurs :**

```bash
# Exemple avec vos informations :
postgresql://selfkey_user:Sk2025!PostgreSQL@Infomaniak#Secure@185.123.45.67:5432/selfkey_production?sslmode=require
```

**Composants :**

- `selfkey_user` = Nom d'utilisateur créé à l'étape 6
- `Sk2025!PostgreSQL@Infomaniak#Secure` = Mot de passe choisi (bien encoder les caractères spéciaux !)
- `185.123.45.67` = IP de votre serveur Infomaniak
- `5432` = Port PostgreSQL
- `selfkey_production` = Nom de la base de données
- `?sslmode=require` = Force SSL (sécurité)

**⚠️ Encoder les caractères spéciaux dans le mot de passe :**

- `@` → `%40`
- `#` → `%23`
- `!` → `%21`
- `$` → `%24`

**Exemple encodé :**

```
postgresql://selfkey_user:Sk2025%21PostgreSQL%40Infomaniak%23Secure@185.123.45.67:5432/selfkey_production?sslmode=require
```

### 8.2 Tester depuis votre Mac (localement)

**Installer psql sur votre Mac (si pas déjà fait) :**

```bash
# Avec Homebrew
brew install postgresql@16
```

**Tester la connexion :**

```bash
# Remplacer par votre vraie URL
psql "postgresql://selfkey_user:MOT_DE_PASSE@185.123.45.67:5432/selfkey_production?sslmode=require"
```

**✅ Si ça fonctionne, vous verrez :**

```
selfkey_production=>
```

**Tester une requête :**

```sql
SELECT version();
-- Devrait afficher PostgreSQL 16.x

\q
-- Pour quitter
```

---

## 🔐 Étape 9 : Sécuriser PostgreSQL (10 min)

### 9.1 Créer un certificat SSL auto-signé

```bash
# Se connecter au serveur SSH
ssh root@XXX.XXX.XXX.XXX

# Générer le certificat SSL
cd /var/lib/postgresql/16/main/

# Créer le certificat (valide 10 ans)
openssl req -new -x509 -days 3650 -nodes -text \
  -out server.crt \
  -keyout server.key \
  -subj "/CN=selfkey-db.infomaniak"

# Définir les permissions
chmod 600 server.key
chown postgres:postgres server.key server.crt
```

### 9.2 Activer SSL dans PostgreSQL

```bash
# Éditer la configuration
nano /etc/postgresql/16/main/postgresql.conf
```

**Rechercher et modifier :**

```
ssl = on
ssl_cert_file = '/var/lib/postgresql/16/main/server.crt'
ssl_key_file = '/var/lib/postgresql/16/main/server.key'
```

**Sauvegarder et redémarrer :**

```bash
systemctl restart postgresql
```

### 9.3 Limiter les connexions aux IPs Vercel (optionnel mais recommandé)

**Obtenir les IPs de Vercel :**

```bash
curl https://api.vercel.com/v1/integrations/deployment-ips
```

**Éditer pg_hba.conf pour restreindre :**

```bash
nano /etc/postgresql/16/main/pg_hba.conf
```

**Remplacer la ligne `0.0.0.0/0` par les IPs Vercel spécifiques.**

---

## 📝 Étape 10 : Appliquer les Migrations Prisma (15 min)

### 10.1 Tester en local d'abord

**Sur votre Mac, dans le projet SelfKey :**

```bash
# Créer un fichier .env.infomaniak (ne pas commit !)
echo 'DATABASE_URL="postgresql://selfkey_user:MOT_DE_PASSE@185.123.45.67:5432/selfkey_production?sslmode=require"' > .env.infomaniak

# Tester la connexion Prisma
npx prisma db pull --schema=./prisma/schema.prisma

# Appliquer les migrations
npx prisma migrate deploy
```

**✅ Si tout fonctionne :**

```
✔ Migrations applied:
  20250623132642_add_room_model_and_update_relations
  20250623145703_add_guests_to_booking
  ...
  (toutes vos migrations)
```

### 10.2 Vérifier que les tables sont créées

```bash
# Se reconnecter à la base
psql "postgresql://selfkey_user:MOT_DE_PASSE@185.123.45.67:5432/selfkey_production?sslmode=require"

# Lister les tables
\dt

# Devrait afficher toutes vos tables :
# user, account, session, establishments, bookings, rooms, etc.

# Quitter
\q
```

---

## 🚀 Étape 11 : Migrer les Données de Neon (30 min)

### 11.1 Backup de la base Neon actuelle

```bash
# Sur votre Mac
# Exporter toutes les données de Neon
pg_dump $DATABASE_URL > backup_neon_$(date +%Y%m%d).sql

# Vérifier la taille du fichier
ls -lh backup_neon_*.sql
```

### 11.2 Importer dans Infomaniak

**Option A : Import direct (si petit fichier < 100 MB)**

```bash
psql "postgresql://selfkey_user:MOT_DE_PASSE@185.123.45.67:5432/selfkey_production?sslmode=require" < backup_neon_20251031.sql
```

**Option B : Via SCP (si gros fichier)**

```bash
# Copier le fichier sur le serveur
scp backup_neon_20251031.sql root@185.123.45.67:/tmp/

# Se connecter au serveur
ssh root@185.123.45.67

# Importer
sudo -u postgres psql selfkey_production < /tmp/backup_neon_20251031.sql

# Nettoyer
rm /tmp/backup_neon_20251031.sql
```

### 11.3 Vérifier l'intégrité des données

```bash
# Se connecter à la base
psql "postgresql://selfkey_user:MOT_DE_PASSE@185.123.45.67:5432/selfkey_production?sslmode=require"

# Compter les lignes
SELECT 'users' as table_name, COUNT(*) as count FROM "user"
UNION ALL
SELECT 'establishments', COUNT(*) FROM "establishments"
UNION ALL
SELECT 'bookings', COUNT(*) FROM "bookings"
UNION ALL
SELECT 'rooms', COUNT(*) FROM "rooms";

-- Comparer avec les chiffres de Neon !
```

---

## 🔄 Étape 12 : Mettre à Jour Vercel (10 min)

### 12.1 Ajouter la variable d'environnement

**Option A : Via l'interface web Vercel**

1. Aller sur : https://vercel.com/[votre-compte]/selfkey/settings/environment-variables
2. Cliquer sur **"Add New"**
3. **Key :** `DATABASE_URL`
4. **Value :** Coller votre URL complète Infomaniak
5. **Environments :** Cocher **"Production"** uniquement (pour l'instant)
6. Cliquer **"Save"**

**Option B : Via CLI Vercel**

```bash
# Se connecter à Vercel
npx vercel login

# Ajouter la variable (en mode interactif)
npx vercel env add DATABASE_URL production

# Coller l'URL quand demandé
```

### 12.2 Redéployer en production

```bash
# Forcer un nouveau déploiement
npx vercel --prod

# Ou via Git
git commit --allow-empty -m "Migrate to Infomaniak PostgreSQL"
git push origin main
```

### 12.3 Vérifier le déploiement

1. Attendre la fin du déploiement (~2-3 minutes)
2. Aller sur votre site : https://www.selfkey.ch
3. Tester :
   - ✅ Connexion (login)
   - ✅ Dashboard admin
   - ✅ Créer un test establishment
   - ✅ Voir les réservations existantes

**Si tout fonctionne → Migration réussie ! 🎉**

---

## 📊 Étape 13 : Monitoring Post-Migration (7 jours)

### 13.1 Surveiller les logs Vercel

```bash
# Suivre les logs en temps réel
npx vercel logs --follow

# Filtrer les erreurs PostgreSQL
npx vercel logs --follow | grep -i "P1001\|prisma\|database"
```

### 13.2 Métriques à surveiller

**Via Manager Infomaniak :**

1. Aller dans **Cloud Serveur** > Votre serveur
2. Onglet **"Monitoring"**
3. Surveiller :
   - 📊 CPU Usage (< 50% en moyenne)
   - 💾 RAM Usage (< 3 GB sur 4 GB)
   - 💿 Disk Usage (< 20 GB sur 40 GB)

**Via PostgreSQL :**

```bash
# Se connecter au serveur
ssh root@185.123.45.67

# Surveiller les connexions actives
sudo -u postgres psql -c "SELECT count(*) FROM pg_stat_activity WHERE state = 'active';"

# Voir les requêtes lentes
sudo -u postgres psql -c "SELECT query, calls, mean_exec_time FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;"
```

### 13.3 Alertes à configurer

**Email d'alerte si problème :**

```bash
# Installer mail utils
apt install -y mailutils

# Script d'alerte (à créer)
nano /root/check_db.sh
```

Contenu du script :

```bash
#!/bin/bash
CONNECTIONS=$(sudo -u postgres psql -t -c "SELECT count(*) FROM pg_stat_activity;")
if [ "$CONNECTIONS" -gt 80 ]; then
  echo "ALERTE: $CONNECTIONS connexions actives sur PostgreSQL" | mail -s "SelfKey DB Alert" votre-email@example.com
fi
```

Rendre exécutable et ajouter au cron :

```bash
chmod +x /root/check_db.sh
crontab -e
# Ajouter : */5 * * * * /root/check_db.sh
```

---

## 🎯 Checklist Finale

### Avant de considérer la migration terminée :

- [ ] ✅ PostgreSQL 16 installé et actif
- [ ] ✅ Utilisateur `selfkey_user` créé
- [ ] ✅ Base `selfkey_production` créée
- [ ] ✅ Migrations Prisma appliquées
- [ ] ✅ Données migrées de Neon
- [ ] ✅ Nombre de lignes identique (users, bookings, etc.)
- [ ] ✅ Firewall UFW configuré
- [ ] ✅ SSL activé sur PostgreSQL
- [ ] ✅ Variable `DATABASE_URL` mise à jour sur Vercel
- [ ] ✅ Site en production fonctionne
- [ ] ✅ Test de connexion réussi
- [ ] ✅ Test de création d'établissement réussi
- [ ] ✅ Test de réservation réussi
- [ ] ✅ Emails de confirmation envoyés
- [ ] ✅ Monitoring actif (7 jours)

---

## 🆘 Dépannage

### Erreur : "Connection refused"

**Solution :**

```bash
# Vérifier que PostgreSQL écoute bien
ss -tlnp | grep 5432
# Devrait afficher : LISTEN 0.0.0.0:5432

# Vérifier le firewall
ufw status | grep 5432
```

### Erreur : "Authentication failed"

**Solution :**

```bash
# Vérifier le mot de passe
sudo -u postgres psql
ALTER USER selfkey_user WITH PASSWORD 'NouveauMotDePasse';
\q
```

### Erreur : "Too many connections"

**Solution :**

```bash
# Augmenter la limite
nano /etc/postgresql/16/main/postgresql.conf
# Modifier : max_connections = 200
systemctl restart postgresql
```

### Site lent après migration

**Solutions :**

1. Vérifier la latence : `ping 185.123.45.67`
2. Activer les index manquants
3. Considérer Prisma Accelerate (pooling)

---

## 📞 Support

### Infomaniak

- **Téléphone :** +41 22 820 35 44 (7/7)
- **Email :** support@infomaniak.com
- **Chat :** https://www.infomaniak.com/fr/support

### Prisma

- **Documentation :** https://www.prisma.io/docs
- **Discord :** https://pris.ly/discord
- **GitHub Issues :** https://github.com/prisma/prisma/issues

### PostgreSQL

- **Documentation :** https://www.postgresql.org/docs/16/
- **Mailing list :** https://www.postgresql.org/list/

---

## 🎉 Félicitations !

Si vous êtes arrivé jusqu'ici et que tous les tests passent :

**✅ Votre base de données SelfKey est maintenant hébergée 100% en Suisse !**

Avantages obtenus :

- 🇨🇭 Souveraineté des données garantie
- 🔒 Conformité LPD/RGPD renforcée
- 📞 Support de qualité en français
- 🚀 Infrastructure stable et performante
- 💪 Contrôle total sur votre base de données

**Prochaine étape :** Communiquer cet avantage à vos clients ! 📢

---

_Guide créé le 31 octobre 2025_  
_Pour SelfKey - Hébergement 100% Suisse_
