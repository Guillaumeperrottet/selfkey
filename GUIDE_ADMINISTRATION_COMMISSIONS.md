# Administration des Commissions - Guide d'utilisation

## Accès à l'interface d'administration

### Connexion

- **URL** : `http://localhost:3000/admin/login`
- **Email** : `perrottet.guillaume.97@gmail.com`
- **Mot de passe** : `admin123`

> ⚠️ **Sécurité** : Changez le mot de passe dans le fichier `/src/app/api/admin/check-super-admin/route.ts` avant la mise en production !

### Fonctionnalités disponibles

#### 1. Dashboard des Commissions

- **Commissions Totales** : Montant total des commissions perçues
- **Nombre d'Établissements** : Total des hôtels sur la plateforme
- **Commissions du Mois** : Revenus du mois en cours
- **Croissance** : Évolution par rapport au mois précédent

#### 2. Tableau Détaillé

- **Filtrage** : Recherche par nom d'établissement
- **Tri** : Classement par commissions, réservations, taux, etc.
- **Export CSV** : Téléchargement des données
- **Visualisation** : Détails par établissement

#### 3. Informations par Établissement

- Nom et slug de l'établissement
- Taux de commission actuel
- Frais fixes (le cas échéant)
- Total des commissions perçues
- Commissions du mois en cours
- Nombre total de réservations
- Valeur moyenne des réservations
- Statut Stripe (configuré ou non)
- Date de la dernière réservation

## Structure des Commissions

### Configuration actuelle

Les commissions sont définies dans le modèle `Establishment` :

- `commissionRate` : Taux de commission en pourcentage (0-100)
- `fixedFee` : Frais fixes en CHF

### Calcul des commissions

Pour chaque réservation, la commission est calculée selon :

```
Commission = (Montant × commissionRate / 100) + fixedFee
```

## Évolutions futures possibles

### 1. Modification des taux

- Interface pour éditer les taux de commission
- Historique des modifications
- Application aux nouvelles réservations

### 2. Rapports avancés

- Graphiques d'évolution
- Comparaisons mensuelles/annuelles
- Analyses par établissement

### 3. Notifications

- Alertes sur les commissions importantes
- Rapports automatiques par email
- Seuils de notification personnalisables

## Sécurité

### Authentification

- Session cookie HttpOnly sécurisé
- Expiration automatique après 24h
- Déconnexion sécurisée

### Accès restreint

- Seul le super admin peut accéder à ces données
- Pas d'accès depuis les interfaces hôtelières classiques
- Logs d'accès (à implémenter si nécessaire)

## APIs disponibles

### Authentification

- `POST /api/admin/check-super-admin` : Connexion
- `GET /api/admin/check-super-admin` : Vérification de session
- `POST /api/admin/logout` : Déconnexion

### Données

- `GET /api/admin/commissions` : Récupération des données de commission
- `PATCH /api/admin/update-commission` : Modification des taux (préparé pour futur usage)

## Maintenance

### Mise à jour des accès

Pour changer l'email ou le mot de passe du super admin :

1. Modifier le fichier `/src/app/api/admin/check-super-admin/route.ts`
2. Redémarrer l'application

### Monitoring

- Surveillez les logs pour détecter des tentatives d'accès non autorisées
- Vérifiez régulièrement l'exactitude des calculs de commission
- Sauvegardez les données importantes

## Support

Pour toute question ou problème :

1. Vérifiez les logs serveur
2. Consultez cette documentation
3. Contactez le développeur si nécessaire

---

_Dernière mise à jour : 7 juillet 2025_
