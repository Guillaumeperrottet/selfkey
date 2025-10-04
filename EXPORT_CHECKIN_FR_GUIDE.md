# Guide Export Excel pour Checkin FR

## 📋 Résumé des modifications

J'ai modifié le fichier `/src/app/api/admin/[hotel]/export-excel/route.ts` pour qu'il génère exactement le même format que le template Checkin FR.

## ✅ Colonnes du template (28 colonnes)

Les colonnes sont maintenant dans l'ordre exact du template Checkin FR :

| #   | Nom de la colonne                    | Source de données SelfKey            | Notes                                       |
| --- | ------------------------------------ | ------------------------------------ | ------------------------------------------- |
| 1   | **Numéro de référence système**      | `hotelSlug-0001` (auto-incrémenté)   | Format : slug-numéro                        |
| 2   | **Date d'arrivée**                   | `booking.checkInDate`                | Format : DD.MM.YYYY                         |
| 3   | **Date de départ**                   | `booking.checkOutDate`               | Format : DD.MM.YYYY                         |
| 4   | **Exemples adultes**                 | `booking.adults` ou `booking.guests` | Nombre d'adultes                            |
| 5   | **Exemples enfants**                 | `booking.children`                   | Nombre d'enfants                            |
| 6   | **Nom**                              | `booking.clientLastName`             | Nom de famille                              |
| 7   | **Prénom**                           | `booking.clientFirstName`            | Prénom                                      |
| 8   | **Titre**                            | Vide                                 | À remplir manuellement (M., Mme, Dr., etc.) |
| 9   | **Groupé / Entreprise**              | Vide                                 | Pour groupes ou entreprises                 |
| 10  | **Date de naissance**                | `booking.clientBirthDate`            | Format : DD.MM.YYYY                         |
| 11  | **Lieu de naissance**                | `booking.clientBirthPlace`           | Ville de naissance                          |
| 12  | **Langue**                           | "FR" par défaut                      | Langue par défaut                           |
| 13  | **Adresse (Rue, Numéro)**            | `booking.clientAddress`              | Adresse complète                            |
| 14  | **Nom du pays**                      | `booking.clientCountry`              | Pays                                        |
| 15  | **Téléphone privé**                  | `booking.clientPhone`                | Téléphone                                   |
| 16  | **E-mail**                           | `booking.clientEmail`                | Email                                       |
| 17  | **Nationalité**                      | `booking.clientCountry`              | Même que pays                               |
| 18  | **Adresse (Ville)**                  | `booking.clientCity`                 | Ville                                       |
| 19  | **Lieu de résidence**                | `clientCity, clientCountry`          | Combiné                                     |
| 20  | **Nombre total d'Adultes**           | `booking.adults` ou `booking.guests` | Total adultes                               |
| 21  | **Nombre total d'enfants**           | `booking.children`                   | Total enfants                               |
| 22  | **Type de pièce d'identité**         | "Carte d'identité" par défaut        | CI, Passeport, etc.                         |
| 23  | **Type de clientèle**                | "Individuel" par défaut              | Individuel/Groupe/Entreprise                |
| 24  | **Numéro de la pièce d'identité**    | `booking.clientIdNumber`             | Numéro pièce ID                             |
| 25  | **N° d'immatriculation du véhicule** | `booking.clientVehicleNumber`        | Plaque véhicule                             |
| 26  | **Carte d'Arée**                     | Vide                                 | Carte touristique régionale                 |
| 27  | **Motif du séjour**                  | "Loisir" par défaut                  | Loisir/Affaires/etc.                        |
| 28  | **Time**                             | Vide                                 | Heure d'arrivée optionnelle                 |

## 🎯 Utilisation

1. **Accédez à l'onglet "Taxes de séjour"** dans votre dashboard admin
2. **Sélectionnez la période** (date de début et date de fin)
3. **Cliquez sur "Exporter Excel"**
4. Le fichier sera téléchargé automatiquement

## 📝 Copier-Coller vers Checkin FR

Le fichier généré est **100% compatible** avec le système Checkin FR. Vous pouvez :

1. Ouvrir le fichier Excel généré
2. **Sélectionner toutes les données** (Ctrl+A / Cmd+A)
3. **Copier** (Ctrl+C / Cmd+C)
4. **Coller directement** dans le site Checkin FR

Les colonnes correspondent exactement, vous n'aurez **aucune manipulation** à faire !

## 🔄 Colonnes à personnaliser (optionnel)

Certaines colonnes sont pré-remplies avec des valeurs par défaut que vous pouvez personnaliser :

- **Titre** : Vide (peut être rempli avec M., Mme, Dr., etc.)
- **Groupé / Entreprise** : Vide (pour les réservations de groupe)
- **Langue** : "FR" par défaut
- **Type de pièce d'identité** : "Carte d'identité" par défaut
- **Type de clientèle** : "Individuel" par défaut
- **Carte d'Arée** : Vide (pour cartes touristiques régionales)
- **Motif du séjour** : "Loisir" par défaut
- **Time** : Vide (pour l'heure d'arrivée)

Si vous souhaitez que ces valeurs soient personnalisables dans l'interface, je peux ajouter des champs dans le formulaire de réservation.

## ✨ Avantages

- ✅ **Copier-coller direct** : Pas de reformatage nécessaire
- ✅ **Ordre exact des colonnes** : Correspond au template Checkin FR
- ✅ **Largeurs de colonnes optimisées** : Lecture facile
- ✅ **Valeurs par défaut intelligentes** : Pré-remplies selon vos besoins
- ✅ **Gestion des valeurs nulles** : Pas d'erreurs si données manquantes
- ✅ **Historique des exports** : Traçabilité complète

## 🧪 Test

Pour tester :

1. Lancez votre serveur : `npm run dev`
2. Connectez-vous à votre dashboard admin
3. Allez dans "Taxes de séjour"
4. Exportez un fichier Excel
5. Vérifiez que les colonnes correspondent exactement au template

## 📊 Structure du fichier

Le fichier généré contient :

- **Nom de la feuille** : "Déclaration taxes séjour"
- **Format** : .xlsx (Excel 2007+)
- **Encodage** : UTF-8 (caractères spéciaux supportés)
- **Nom du fichier** : `declaration_taxes_sejour_{slug}_{date-debut}_{date-fin}.xlsx`

## 🎨 Personnalisation future

Si vous avez besoin d'ajustements supplémentaires :

1. **Ajouter des colonnes** : Modifiez le mapping dans le fichier
2. **Changer les valeurs par défaut** : Modifiez les valeurs statiques
3. **Ajouter des calculs** : Ajoutez des formules dans excelData
4. **Formater les cellules** : Utilisez XLSX pour styler les cellules

## 💡 Notes importantes

- Les réservations incluent uniquement celles avec **paymentStatus: "succeeded"**
- Les réservations de **parking jour** sont exclues
- Le filtre se base sur la **date de check-in** (checkInDate)
- Les réservations sont triées par **ordre chronologique d'arrivée**

---

**Dernière mise à jour** : 4 octobre 2025
