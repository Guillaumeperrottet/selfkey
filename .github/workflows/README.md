# CI/CD Pipeline - GitHub Actions

## 🚀 Vue d'ensemble

Ce workflow GitHub Actions exécute automatiquement les tests, le build et le linting sur chaque push et pull request vers les branches `main` et `develop`.

## 📋 Jobs

### 1. **Test** ✅

Exécute tous les tests Vitest et génère un rapport de couverture.

**Étapes :**

- Installation des dépendances avec pnpm
- Génération du Prisma Client (`npx prisma generate`)
- Exécution des tests (`pnpm test:run`)
- Génération du rapport de couverture (`pnpm test:coverage`)
- Upload du rapport de couverture (disponible 30 jours)

**Variables d'environnement :**

- DATABASE_URL (dummy PostgreSQL)
- BETTER_AUTH_SECRET (32+ caractères - **IMPORTANT**)
- STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET
- CLOUDINARY, RESEND, SENTRY (tous dummy)

### 2. **Build** 🏗️

Vérifie que l'application peut être buildée pour la production.

**Étapes :**

- Installation des dépendances avec pnpm
- Génération du Prisma Client
- Type checking TypeScript (`npx tsc --noEmit`)
- Build Next.js (`pnpm build`)
- Upload des artifacts de build (disponible 7 jours)

**Variables d'environnement :**

- Identiques au job Test
- `NEXT_TELEMETRY_DISABLED=1` pour désactiver la télémétrie Next.js

### 3. **Lint** 🔍

Vérifie la qualité du code avec ESLint.

**Étapes :**

- Installation des dépendances avec pnpm
- Exécution d'ESLint (`pnpm lint`)

### 4. **Summary** 📊

Job final qui résume les résultats de tous les jobs précédents.

**Fonctionnalités :**

- Affiche un résumé visuel (✅/❌) dans GitHub Actions
- Échoue si l'un des jobs précédents a échoué
- Toujours exécuté (`if: always()`)

## 🔧 Configuration requise

### Secrets GitHub (optionnel pour tests réels)

Si vous voulez exécuter des tests avec de vraies clés API (non recommandé pour CI), ajoutez ces secrets dans **Settings → Secrets and variables → Actions** :

- `DATABASE_URL` : URL PostgreSQL de test
- `BETTER_AUTH_SECRET` : Secret d'au moins 32 caractères
- `STRIPE_SECRET_KEY` : Clé de test Stripe
- `RESEND_API_KEY` : Clé API Resend pour les emails
- (etc.)

**Note :** Le workflow actuel utilise des valeurs dummy, ce qui est **suffisant** pour tester la logique métier sans dépendances externes.

## 📈 Rapports

### Coverage Report

Le rapport de couverture est automatiquement généré et uploadé comme artifact après chaque run.

**Accès :**

1. Allez dans **Actions** → Sélectionnez un run
2. Scrollez jusqu'à **Artifacts**
3. Téléchargez `coverage-report`
4. Ouvrez `index.html` dans un navigateur

### Build Artifacts

Les fichiers de build Next.js sont disponibles pendant 7 jours après chaque run.

## 🛠️ Problèmes résolus

### ✅ Prisma Client manquant

**Solution :** Ajout de `npx prisma generate` avant chaque job qui en a besoin

### ✅ BETTER_AUTH_SECRET trop court

**Solution :** Secret de 32+ caractères : `test-secret-key-at-least-32-characters-long-for-github-actions`

### ✅ Variables d'environnement manquantes

**Solution :** Toutes les variables requises sont définies avec des valeurs dummy valides

### ✅ Type checking échoue

**Solution :** Variables d'environnement également définies pour `tsc --noEmit`

## 🚦 Status Badges

Ajoutez ces badges à votre README.md :

```markdown
![Tests](https://github.com/Guillaumeperrottet/selfkey/actions/workflows/ci.yml/badge.svg)
```

## 📝 Commandes locales

Pour reproduire le CI en local :

```bash
# Tests
pnpm test:run

# Coverage
pnpm test:coverage

# Type checking
npx tsc --noEmit

# Build
pnpm build

# Lint
pnpm lint
```

## 🔍 Débogage

### Les tests échouent en CI mais passent en local

1. **Vérifiez les variables d'environnement** : Le CI utilise des valeurs dummy
2. **Vérifiez Prisma** : `npx prisma generate` doit être exécuté
3. **Vérifiez les timezones** : Le CI utilise UTC

### Le build échoue

1. **Type errors** : Exécutez `npx tsc --noEmit` en local
2. **Variables manquantes** : Vérifiez que toutes les env vars sont définies
3. **Dépendances** : Essayez `pnpm install --frozen-lockfile`

### Le lint échoue

1. **Exécutez en local** : `pnpm lint`
2. **Auto-fix** : `pnpm lint --fix`
3. **Committez les corrections**

## 🎯 Prochaines étapes

- [ ] Ajouter des tests E2E avec Playwright
- [ ] Déploiement automatique vers staging/production
- [ ] Intégration avec Codecov pour la couverture
- [ ] Notifications Slack/Discord sur échec

## 📚 Ressources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vitest CI Guide](https://vitest.dev/guide/ci.html)
- [Next.js CI/CD Best Practices](https://nextjs.org/docs/deployment)
