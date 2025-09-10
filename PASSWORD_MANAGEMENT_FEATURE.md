# 🔐 Fonctionnalité de Gestion des Mots de Passe - SelfKey

Cette implémentation ajoute une gestion complète des mots de passe en suivant les bonnes pratiques de Better Auth.

## ✨ Fonctionnalités Implémentées

### 🔑 Changement de Mot de Passe

- **Page de profil utilisateur** (`/profile`)
- **Validation sécurisée** du mot de passe actuel
- **Révocation automatique** des autres sessions lors du changement
- **Validation côté client** avec critères de sécurité

### 📧 Réinitialisation par Email

- **Page "Mot de passe oublié"** (`/forgot-password`)
- **Emails HTML personnalisés** avec design SelfKey
- **Liens sécurisés** avec expiration (1 heure)
- **Page de réinitialisation** (`/reset-password`)

### ✉️ Vérification d'Email

- **Emails de vérification** pour nouveaux comptes
- **Gestion manuelle** depuis le profil utilisateur
- **Templates HTML** cohérents avec la charte graphique

### 🎨 Interface Utilisateur

- **Design cohérent** avec ShadCN/UI
- **Navigation intuitive** avec liens dans la sidebar
- **Messages de feedback** clairs et informatifs
- **Responsive** sur tous les appareils

## 🛠️ Structure Technique

### Configuration Better Auth (`src/lib/auth.ts`)

```typescript
emailAndPassword: {
  enabled: true,
  requireEmailVerification: false, // Configurable dans le profil
  sendResetPassword: async ({ user, url }) => {
    // Email HTML personnalisé
  },
  onPasswordReset: async ({ user }) => {
    // Logging sécurisé
  },
},
emailVerification: {
  sendVerificationEmail: async ({ user, url }) => {
    // Email de vérification
  },
}
```

### Client Auth (`src/lib/auth-client.ts`)

```typescript
export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
  changePassword, // ← Nouveau
  requestPasswordReset, // ← Nouveau
  resetPassword, // ← Nouveau
  sendVerificationEmail, // ← Nouveau
} = authClient;
```

### Module Email (`src/lib/email.ts`)

- **Fonction générique** `sendEmail()` pour Better Auth
- **Templates HTML** avec design SelfKey
- **Gestion des erreurs** et fallback en mode dev

## 📄 Pages Créées

### 1. Profil Utilisateur (`/profile`)

- Informations du compte
- Changement de mot de passe sécurisé
- Vérification d'email
- Historique du compte

### 2. Mot de Passe Oublié (`/forgot-password`)

- Demande de réinitialisation par email
- Validation côté client
- Messages de sécurité appropriés

### 3. Réinitialisation (`/reset-password`)

- Interface sécurisée avec token
- Validation des mots de passe
- Redirection automatique après succès

## 🔗 Navigation

### Ajouts dans la Sidebar Admin

- **Lien "Mon Profil"** dans AdminSidebar
- **Icône User** avec navigation directe

### Ajouts dans la Page Établissements

- **Bouton "Mon Profil"** dans le header
- **Navigation cohérente** avec le reste de l'app

### Ajouts dans la Page de Connexion

- **Lien "Mot de passe oublié ?"** en mode connexion
- **Messages de succès** après réinitialisation

## 📧 Templates Email

### Email de Réinitialisation

```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #333;">Réinitialisation de votre mot de passe</h2>
  <p>Bonjour {user.name},</p>
  <p>
    Vous avez demandé la réinitialisation de votre mot de passe sur SelfKey.
  </p>
  <a
    href="{url}"
    style="background-color: #007bff; color: white; padding: 12px 24px;"
  >
    Réinitialiser mon mot de passe
  </a>
  <p>Ce lien expirera dans 1 heure.</p>
</div>
```

### Email de Vérification

```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #333;">Vérification de votre adresse email</h2>
  <p>Bonjour {user.name},</p>
  <p>Merci de vous être inscrit sur SelfKey !</p>
  <a
    href="{url}"
    style="background-color: #28a745; color: white; padding: 12px 24px;"
  >
    Vérifier mon email
  </a>
</div>
```

## 🔒 Sécurité

### Bonnes Pratiques Implémentées

- **Validation des mots de passe actuels** avant changement
- **Révocation des sessions** lors du changement de mot de passe
- **Tokens sécurisés** avec expiration pour la réinitialisation
- **Messages génériques** pour éviter l'énumération d'emails
- **Validation côté client et serveur**

### Critères de Mot de Passe

- Minimum 8 caractères
- Différent du mot de passe actuel
- Confirmation obligatoire

## 🚀 Utilisation

### Pour l'Utilisateur Final

1. **Accéder au profil** via la sidebar ou le header
2. **Changer le mot de passe** dans la section Sécurité
3. **Vérifier l'email** si nécessaire
4. **Utiliser "Mot de passe oublié"** depuis la page de connexion

### Pour le Développeur

1. **Configuration Resend** dans `.env.local` :

   ```
   RESEND_API_KEY=your_api_key
   RESEND_FROM_EMAIL="SelfKey <noreply@selfkey.ch>"
   ```

2. **URLs de base** configurées automatiquement :
   ```
   BETTER_AUTH_URL=http://localhost:3000
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

## 🎯 Prochaines Améliorations Possibles

- **2FA (Two-Factor Authentication)** avec Better Auth
- **Historique des connexions** et sessions actives
- **Politique de mots de passe** plus stricte
- **Notifications par email** des changements de sécurité
- **Export des données utilisateur** (RGPD)

## 📝 Tests Recommandés

1. **Changement de mot de passe** normal
2. **Changement avec mauvais mot de passe actuel**
3. **Réinitialisation par email** (avec et sans compte existant)
4. **Vérification d'email** manuelle
5. **Navigation** entre toutes les pages
6. **Responsive design** sur mobile/tablette

---

**🎉 Implémentation complète selon les standards Better Auth !**

Toutes les fonctionnalités sont maintenant disponibles avec une interface utilisateur intuitive et sécurisée.
