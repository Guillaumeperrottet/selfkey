# Module d'Intégrations SelfKey

## Vue d'ensemble

Le module d'intégrations de SelfKey permet aux administrateurs d'établissements hôteliers de connecter leur système à diverses plateformes de réservation et systèmes de gestion existants. Cette solution modulaire et extensible offre une synchronisation bidirectionnelle des données de réservation.

## Types d'intégrations supportées

### 🌐 Booking.com

- **Description** : Synchronisation avec la plateforme Booking.com
- **Configuration requise** :
  - Clé API Booking.com
  - ID de l'hôtel sur Booking.com
  - Fréquence de synchronisation
- **Fonctionnalités** :
  - Import automatique des réservations
  - Mise à jour des disponibilités
  - Synchronisation des tarifs

### 🏠 Airbnb

- **Description** : Intégration avec Airbnb (API limitée)
- **Configuration requise** :
  - Client ID Airbnb
  - Client Secret Airbnb
- **Fonctionnalités** :
  - Import des réservations Airbnb
  - Gestion des calendriers

### 🗄️ PMS (Property Management System)

- **Description** : Connecteur vers PMS existants
- **Configuration requise** :
  - URL de base du PMS
  - Nom d'utilisateur / Mot de passe
  - Endpoints API spécifiques
- **Fonctionnalités** :
  - Synchronisation bidirectionnelle
  - Import des données clients
  - Gestion centralisée

### 🔗 Webhook personnalisé

- **Description** : Réception de données via webhook
- **Configuration requise** :
  - URL webhook générée automatiquement
  - Clé secrète (optionnel)
- **Fonctionnalités** :
  - Réception passive de données
  - Authentification sécurisée
  - Logs détaillés

### 🔧 API REST personnalisée

- **Description** : Connecteur vers API REST sur mesure
- **Configuration requise** :
  - URL de base de l'API
  - Clé API ou authentification
  - Endpoint de test
- **Fonctionnalités** :
  - Appels API personnalisés
  - Test de connectivité
  - Mapping de données flexible

### 📊 Import/Export CSV

- **Description** : Synchronisation par fichiers CSV
- **Configuration requise** :
  - Chemin d'import des fichiers
  - Format de délimiteur
  - Mapping des colonnes
- **Fonctionnalités** :
  - Import batch de réservations
  - Export de données
  - Traitement automatisé

## Architecture technique

### Base de données

```sql
-- Table principale des intégrations
CREATE TABLE integrations (
  id VARCHAR PRIMARY KEY,
  establishment_slug VARCHAR NOT NULL,
  type VARCHAR NOT NULL,
  name VARCHAR NOT NULL,
  status VARCHAR DEFAULT 'disconnected',
  configuration JSON,
  last_sync TIMESTAMP,
  last_error TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Table des logs d'activité
CREATE TABLE integration_logs (
  id VARCHAR PRIMARY KEY,
  integration_id VARCHAR REFERENCES integrations(id),
  action VARCHAR NOT NULL,
  status VARCHAR NOT NULL,
  message TEXT NOT NULL,
  data JSON,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### API Endpoints

#### Gestion des intégrations

- `GET /api/admin/[hotel]/integrations` - Lister les intégrations
- `POST /api/admin/[hotel]/integrations` - Créer une intégration
- `GET /api/admin/[hotel]/integrations/[id]` - Détails d'une intégration
- `PUT /api/admin/[hotel]/integrations/[id]` - Modifier une intégration
- `DELETE /api/admin/[hotel]/integrations/[id]` - Supprimer une intégration

#### Actions d'intégration

- `POST /api/admin/[hotel]/integrations/[id]/test` - Tester la connexion
- `POST /api/admin/[hotel]/integrations/[id]/sync` - Synchroniser les données

#### Webhooks

- `POST /api/webhooks/integrations/[hotel]/[id]` - Recevoir des données webhook

## Guide d'implémentation

### 1. Ajout d'un nouveau type d'intégration

```typescript
// 1. Ajouter le type dans IntegrationManager.tsx
const integrationTypes = [
  // ...existing types
  {
    id: "nouveau-type",
    name: "Nouveau Système",
    description: "Description du nouveau système",
    icon: IconComponent,
    color: "bg-color-500",
  },
];

// 2. Implémenter les fonctions de test et sync
async function testNouveauTypeConnection(config: any) {
  // Logique de test de connexion
  return { success: true, data: {} };
}

async function syncNouveauTypeData(hotelSlug: string, config: any) {
  // Logique de synchronisation
  return { success: true, data: {} };
}
```

### 2. Configuration d'une intégration

```typescript
// Exemple de configuration Booking.com
const config = {
  apiKey: "votre_cle_api",
  hotelId: "123456",
  syncFrequency: 15, // minutes
  enabled: true,
};
```

### 3. Réception de données webhook

```typescript
// Webhook handler personnalisé
export async function POST(request: Request) {
  const payload = await request.json();

  // Vérifier la signature si clé secrète configurée
  // Traiter les données reçues
  // Créer/mettre à jour les réservations

  return NextResponse.json({ received: true });
}
```

## Sécurité

### Authentification

- Toutes les API nécessitent une authentification utilisateur
- Vérification des permissions d'accès à l'établissement
- Clés API stockées de manière sécurisée

### Chiffrement

- Configuration stockée en JSON chiffré
- Clés secrètes masquées dans l'interface
- Communication HTTPS obligatoire

### Logs et audit

- Toutes les actions sont loggées
- Traçabilité complète des synchronisations
- Alertes en cas d'erreur

## Monitoring et maintenance

### Logs d'activité

Chaque intégration maintient un historique détaillé :

- Tests de connexion
- Synchronisations réussies/échouées
- Modifications de configuration
- Erreurs et alertes

### Métriques

- Taux de réussite des synchronisations
- Temps de réponse des API externes
- Volume de données synchronisées
- Alertes automatiques

### Maintenance

- Nettoyage automatique des anciens logs
- Rotation des clés API
- Mise à jour des connecteurs
- Tests de régression

## Roadmap

### Version 1.0 (Actuelle)

- ✅ Interface de gestion des intégrations
- ✅ Types d'intégrations de base
- ✅ Test et synchronisation manuelle
- ✅ Logs et monitoring

### Version 1.1 (Prochaine)

- 🔄 Synchronisation automatique programmée
- 🔄 Notifications en temps réel
- 🔄 Dashboard d'analyse des intégrations
- 🔄 API publique pour développeurs tiers

### Version 1.2 (Future)

- 📋 Connecteurs pré-configurés
- 📋 Marketplace d'intégrations
- 📋 Intelligence artificielle pour mapping automatique
- 📋 Intégrations avec services de paiement

## Support et documentation

Pour toute question ou problème :

1. Consulter les logs d'intégration
2. Vérifier la configuration
3. Tester la connectivité
4. Contacter le support technique

---

**Made with ❤️ for seamless hotel integrations**
