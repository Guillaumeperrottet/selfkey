# Guide d'utilisation des scripts de gestion de base de données

## 🧹 Scripts de nettoyage et réinitialisation

### 1. Nettoyage complet de la base de données

```bash
# Nettoyage avec confirmation
node reset-database.js

# Nettoyage sans confirmation (mode force)
node reset-database.js --force

# Afficher l'aide
node reset-database.js --help
```

**Fonction** : Supprime toutes les données sauf le compte super-admin
**Préserve** : `perrottet.guillaume.97@gmail.com`
**Supprime** : Tous les établissements, chambres, réservations, codes d'accès, intégrations

### 2. Création de données de test

```bash
# Créer des données de test basiques
node setup-test-data.js
```

**Crée** :

- 1 établissement : Alpha-hôtel
- 3 chambres : Standard, Deluxe, Économique
- 2 codes d'accès : TEST2025, DEMO123

### 3. Réinitialisation complète (recommandé)

```bash
# Nettoyage + création de données (avec confirmation)
node fresh-start.js

# Mode force (sans confirmation)
node fresh-start.js --force
```

**Fonction** : Combine le nettoyage et la création de données de test

## 📋 Ordre d'utilisation recommandé

### Pour un environnement de test propre :

1. **Nettoyer** : `node fresh-start.js`
2. **Tester** : Accéder à l'interface
3. **Simuler** : `node simulate-bookings.js` (optionnel)
4. **Monitorer** : `node stripe-health-check.js check` (optionnel)

### Pour un nettoyage rapide :

```bash
node reset-database.js --force
```

## 🔐 Sécurité

⚠️ **ATTENTION** : Ces scripts sont destructeurs !

- Utilisez uniquement en développement
- Vérifiez que vous êtes sur la bonne base de données
- Le super-admin est préservé mais ses données liées peuvent être supprimées

## 🎯 Données créées par défaut

### Établissement

- **Nom** : Alpha-hôtel
- **Slug** : alpha-hotel
- **URL** : http://localhost:3000/alpha-hotel
- **Commission** : 10%
- **Frais fixes** : 5.00 CHF

### Chambres

- **Standard** : 120 CHF (2 personnes)
- **Deluxe** : 250 CHF (4 personnes)
- **Économique** : 80 CHF (1 personne)

### Codes d'accès

- **TEST2025** : Valide 1 an
- **DEMO123** : Valide 30 jours

## 📊 Vérification post-nettoyage

Après nettoyage, vérifiez :

```bash
# Statistiques de la base
node stripe-health-check.js check

# Test de l'interface admin
curl -H "Cookie: super-admin-session=authenticated" http://localhost:3000/api/admin/commissions

# Test de l'interface publique
curl http://localhost:3000/alpha-hotel
```

## 🔄 Workflow de développement

1. **Développement** : Utilisez les données de test
2. **Test feature** : Simulez des réservations
3. **Bug fix** : Nettoyez et recommencez
4. **Validation** : Testez avec des données réelles

```bash
# Workflow complet
node fresh-start.js --force
node simulate-bookings.js
node stripe-health-check.js check
```
