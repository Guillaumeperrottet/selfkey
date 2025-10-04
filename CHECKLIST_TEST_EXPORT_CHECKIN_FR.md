# ✅ Checklist de test - Export Checkin FR

## 🎯 Objectif

Vérifier que l'export Excel généré par SelfKey correspond exactement au template Checkin FR et peut être copié-collé directement.

## 📋 Étapes de test

### 1. Préparation

- [ ] Le serveur de développement est lancé (`npm run dev`)
- [ ] Vous êtes connecté en tant qu'administrateur
- [ ] Vous avez au moins une réservation confirmée dans la base de données

### 2. Navigation

- [ ] Accédez au dashboard admin
- [ ] Cliquez sur l'onglet "Taxes de séjour" ou "Export Excel"

### 3. Configuration de l'export

- [ ] Sélectionnez une date de début (par exemple : 01.01.2025)
- [ ] Sélectionnez une date de fin (par exemple : 31.12.2025)
- [ ] Cliquez sur le bouton "Exporter Excel"

### 4. Téléchargement

- [ ] Le fichier se télécharge automatiquement
- [ ] Le nom du fichier suit le format : `declaration_taxes_sejour_{slug}_{date-debut}_{date-fin}.xlsx`

### 5. Vérification du fichier Excel

#### Ouverture

- [ ] Ouvrez le fichier Excel téléchargé
- [ ] Le fichier s'ouvre sans erreur
- [ ] Il y a une feuille nommée "Déclaration taxes séjour"

#### Colonnes (vérifiez l'ordre exact)

- [ ] Colonne A : "Numéro de référence système"
- [ ] Colonne B : "Date d'arrivée"
- [ ] Colonne C : "Date de départ"
- [ ] Colonne D : "Exemples adultes"
- [ ] Colonne E : "Exemples enfants"
- [ ] Colonne F : "Nom"
- [ ] Colonne G : "Prénom"
- [ ] Colonne H : "Titre"
- [ ] Colonne I : "Groupé / Entreprise"
- [ ] Colonne J : "Date de naissance"
- [ ] Colonne K : "Lieu de naissance"
- [ ] Colonne L : "Langue"
- [ ] Colonne M : "Adresse (Rue, Numéro)"
- [ ] Colonne N : "Nom du pays"
- [ ] Colonne O : "Téléphone privé"
- [ ] Colonne P : "E-mail"
- [ ] Colonne Q : "Nationalité"
- [ ] Colonne R : "Adresse (Ville)"
- [ ] Colonne S : "Lieu de résidence"
- [ ] Colonne T : "Nombre total d'Adultes"
- [ ] Colonne U : "Nombre total d'enfants"
- [ ] Colonne V : "Type de pièce d'identité"
- [ ] Colonne W : "Type de clientèle"
- [ ] Colonne X : "Numéro de la pièce d'identité"
- [ ] Colonne Y : "N° d'immatriculation du véhicule"
- [ ] Colonne Z : "Carte d'Arée"
- [ ] Colonne AA : "Motif du séjour"
- [ ] Colonne AB : "Time"

#### Données (vérifiez au moins une ligne)

- [ ] Numéro de référence est généré (format : slug-0001)
- [ ] Les dates sont au format DD.MM.YYYY (ex: 02.07.2025)
- [ ] Le nombre d'adultes est correct
- [ ] Le nombre d'enfants est correct
- [ ] Le nom du client est présent
- [ ] Le prénom du client est présent
- [ ] La date de naissance est formatée correctement
- [ ] L'adresse est complète
- [ ] Le pays est indiqué
- [ ] Le téléphone est présent
- [ ] L'email est présent
- [ ] La langue est "FR"
- [ ] Le type de pièce est "Carte d'identité"
- [ ] Le type de clientèle est "Individuel"
- [ ] Le motif du séjour est "Loisir"

#### Format et présentation

- [ ] Les colonnes ont une largeur appropriée
- [ ] Toutes les données sont lisibles sans ajustement
- [ ] Pas de caractères bizarres (encodage UTF-8 OK)
- [ ] Les accents sont correctement affichés

### 6. Test de copier-coller

#### Préparation

- [ ] Ouvrez le fichier Excel exporté
- [ ] Ouvrez le template Checkin FR (ou un fichier vierge avec les mêmes colonnes)

#### Test

- [ ] Sélectionnez toutes les données dans le fichier SelfKey (Ctrl+A / Cmd+A)
- [ ] Copiez (Ctrl+C / Cmd+C)
- [ ] Collez dans le template Checkin FR (Ctrl+V / Cmd+V)
- [ ] Les données se collent exactement dans les bonnes colonnes
- [ ] Aucun décalage de colonnes
- [ ] Aucune donnée manquante

### 7. Vérifications supplémentaires

#### Filtres appliqués

- [ ] Seules les réservations confirmées (paymentStatus: "succeeded") sont exportées
- [ ] Les réservations de parking jour sont exclues
- [ ] Les réservations sont triées par date d'arrivée

#### Historique

- [ ] L'export est enregistré dans l'historique (si applicable)
- [ ] Le nombre de lignes exportées est correct

## ✅ Résultat du test

### Test réussi si :

- ✅ Toutes les colonnes sont dans le bon ordre
- ✅ Les données sont correctement remplies
- ✅ Le copier-coller vers Checkin FR fonctionne sans ajustement
- ✅ Aucune erreur d'encodage ou de format

### Test échoué si :

- ❌ Les colonnes ne correspondent pas
- ❌ Des données sont manquantes ou incorrectes
- ❌ Le copier-coller nécessite des ajustements
- ❌ Des erreurs d'encodage apparaissent

## 🐛 En cas de problème

### Problème : Les colonnes ne correspondent pas

**Solution** : Vérifiez que vous avez bien la dernière version du code

### Problème : Données manquantes

**Solution** : Vérifiez que les champs sont remplis dans le formulaire de réservation

### Problème : Format de date incorrect

**Solution** : Vérifiez que la fonction `formatDate` utilise le format suisse (DD.MM.YYYY)

### Problème : Encodage (accents bizarres)

**Solution** : Le fichier utilise UTF-8, assurez-vous qu'Excel l'ouvre correctement

### Problème : Le fichier ne se télécharge pas

**Solution** : Vérifiez la console navigateur pour les erreurs, et les logs du serveur

## 📊 Exemple de résultat attendu

```
A: selfcamp-0001 | B: 02.07.2025 | C: 05.07.2025 | D: 2 | E: 1 | F: Dupont | G: Jean | ...
```

## 🎉 Félicitations !

Si tous les tests sont ✅, votre export est **100% compatible Checkin FR** !

Vous pouvez maintenant l'utiliser en production pour vos déclarations de taxes de séjour. 🚀

---

**Date du test** : ********\_\_********
**Testé par** : ********\_\_********
**Résultat** : ✅ Réussi / ❌ Échoué
**Notes** :

---

---

---
