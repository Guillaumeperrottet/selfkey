# Scripts de Gestion des Commissions - Référence

## 📋 Scripts principaux (à conserver)

### 🔄 Gestion de la base de données

- **`fresh-start.js`** : Réinitialisation complète (nettoyage + données de test)
- **`reset-database.js`** : Nettoyage uniquement (préserve le super-admin)

### 📊 Monitoring et tests

- **`stripe-health-check.js`** : Monitoring complet Stripe Connect
- **`test-stripe-monitoring.js`** : Test de l'API de monitoring
- **`simulate-bookings.js`** : Simulation de réservations pour les tests
- **`performance-test.js`** : Tests de performance et charge

## 🗑️ Scripts supprimés (redondants)

### Nettoyage effectué le 7 juillet 2025 :

- ❌ `setup-test-data.js` → Remplacé par `fresh-start.js`
- ❌ `create-test-data.js` → Remplacé par `fresh-start.js`
- ❌ `fix-commissions.js` → Script ponctuel terminé
- ❌ `watch-commissions.js` → Fonctionnalité dans `stripe-health-check.js`
- ❌ `test-commission.js` → Tests basiques obsolètes
- ❌ `test-multilingual.js` → Non lié aux commissions
- ❌ `RESOLUTION_BUG_MONITORING.md` → Résolution terminée
- ❌ `GUIDE_TWINT_INTEGRATION.md` → Non lié aux commissions
- ❌ `TWINT_TEST_GUIDE.md` → Non lié aux commissions

## 📚 Documentation (à conserver)

### Guides principaux :

- **`GUIDE_ADMINISTRATION_COMMISSIONS.md`** : Guide complet d'administration
- **`GUIDE_NETTOYAGE_BDD.md`** : Guide d'utilisation des scripts de nettoyage
- **`GUIDE_INTEGRATIONS.md`** : Guide des intégrations
- **`GUIDE_QR_CODE.md`** : Guide des codes QR
- **`EXEMPLE_INTEGRATIONS.md`** : Exemples d'intégrations

## 🚀 Utilisation recommandée

### Workflow de développement :

1. **Environnement propre** : `node fresh-start.js --force`
2. **Tests de réservations** : `node simulate-bookings.js`
3. **Monitoring** : `node stripe-health-check.js check`
4. **Test API** : `node test-stripe-monitoring.js`

### Maintenance :

- **Nettoyage rapide** : `node reset-database.js --force`
- **Monitoring continu** : `node stripe-health-check.js watch`
- **Tests de charge** : `node performance-test.js`

## 📁 Structure finale

```
📂 Scripts de gestion des commissions
├── 🔄 fresh-start.js          # Réinitialisation complète
├── 🧹 reset-database.js       # Nettoyage seul
├── 📊 stripe-health-check.js  # Monitoring Stripe
├── 🧪 test-stripe-monitoring.js # Test API
├── 🎭 simulate-bookings.js    # Simulation réservations
├── ⚡ performance-test.js     # Tests performance
└── 📚 GUIDE_NETTOYAGE_BDD.md  # Documentation
```

> **Note** : Tous les scripts ont été optimisés et testés. La duplication a été éliminée pour maintenir un environnement propre et efficace.
