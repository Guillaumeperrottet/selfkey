# Rapport de Paiements - Guide d'utilisation

## Vue d'ensemble

Le **Rapport de Paiements** est un outil conçu pour générer des justificatifs financiers à destination de votre banque et de votre comptabilité. Il permet de récupérer et d'exporter toutes les transactions effectuées via Stripe sur votre plateforme.

## Accès

Le rapport est accessible depuis le menu d'administration :

1. Connectez-vous à votre espace admin
2. Dans la barre latérale, cliquez sur **"Rapport de paiements"** (icône 🧾)
3. La page `/admin/payment-report` s'ouvre

## Fonctionnalités

### 1. Filtres disponibles

#### Période

- **Toute la période** : Affiche toutes les transactions depuis le début
- **Mois en cours** : Transactions du mois actuel
- **Mois dernier** : Transactions du mois précédent
- **Année en cours** : Transactions de l'année actuelle
- **Année dernière** : Transactions de l'année précédente

#### Établissement

- **Tous les établissements** : Vue globale de tous vos établissements
- **Par établissement** : Filtrage par établissement spécifique

### 2. Statistiques affichées

#### Résumé global

- **Total des paiements** : Montant total encaissé via Stripe
- **Commission plateforme** : Votre revenu total (commissions prélevées)
- **Reversé aux propriétaires** : Montants transférés aux comptes Stripe connectés
- **Nombre de réservations** : Total des transactions

#### Répartition par établissement

Pour chaque établissement :

- Nombre de réservations
- Montant total encaissé
- Commission prélevée
- Montant reversé au propriétaire

#### Répartition mensuelle

- Vue chronologique des revenus par mois
- Nombre de réservations par mois
- Commissions mensuelles

#### Détail des transactions

Liste complète de toutes les transactions avec :

- Numéro de réservation
- Date de la transaction
- Nom du client
- Établissement
- Montants (total, commission)
- Identifiant Stripe (PaymentIntent ID)

### 3. Export des données

#### Export Excel (.csv)

- Cliquez sur **"Export Excel"**
- Télécharge un fichier CSV avec toutes les transactions
- Format adapté pour l'import dans Excel, Google Sheets, etc.
- Colonnes incluses :
  - Numéro de réservation
  - Date de réservation
  - Check-in / Check-out
  - Client (nom, email)
  - Établissement
  - Chambre/Place
  - Montant total
  - Commission plateforme
  - Montant propriétaire
  - Taxe de séjour
  - Devise
  - Type de réservation
  - Stripe Payment ID
  - Statut

#### Export PDF

- Cliquez sur **"Export PDF"**
- Génère un document professionnel au format PDF
- Contient :
  - **Page 1** : Résumé global + Répartition par établissement
  - **Page 2** : Répartition mensuelle + Détail des transactions (50 premières)
  - Pied de page avec notes légales
  - Numérotation des pages
- Idéal pour présentation à votre banque ou comptable

## Cas d'usage

### Pour votre banque

1. Filtrez sur la période demandée (ex: année dernière)
2. Exportez en PDF
3. Le document contient toutes les preuves de paiement Stripe
4. Les PaymentIntent IDs permettent la vérification sur Stripe

### Pour votre comptabilité

1. Filtrez sur le mois ou trimestre concerné
2. Exportez en Excel
3. Importez dans votre logiciel de comptabilité
4. Toutes les données sont détaillées ligne par ligne

### Pour un contrôle fiscal

1. Filtrez sur l'année fiscale
2. Exportez en PDF et Excel
3. Les deux formats sont complémentaires :
   - PDF : vue synthétique et professionnelle
   - Excel : données brutes pour analyse détaillée

## Informations techniques

### Données incluses

- Uniquement les paiements **réussis** (statut "succeeded")
- Les montants sont en CHF (Francs suisses)
- Les commissions incluent :
  - Pourcentage de commission
  - Frais fixes éventuels
- Les taxes de séjour sont comptabilisées séparément

### Calculs

- **Montant total** = Prix réservation + Options + Taxe de séjour
- **Commission plateforme** = (Montant × Taux commission) + Frais fixes
- **Montant propriétaire** = Montant total - Commission plateforme

### Vérification

Tous les paiements sont vérifiables sur Stripe via leur PaymentIntent ID unique.

## Support

Pour toute question concernant le rapport de paiements :

- Vérifiez d'abord que votre compte Stripe est bien configuré
- Les données proviennent directement de votre base de données
- Si des transactions semblent manquantes, vérifiez le webhook Stripe

## Sécurité

- ✅ Accès réservé aux administrateurs
- ✅ Données sensibles (emails, noms) visibles uniquement par les admins
- ✅ Exports générés côté client (pas de stockage sur serveur)
- ✅ Conformité avec les PaymentIntent Stripe originaux
