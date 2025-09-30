# Variables disponibles dans les templates d'email

Voici toutes les variables que vous pouvez utiliser dans vos templates d'email de confirmation :

## Variables client

- `{clientFirstName}` - Prénom du client
- `{clientLastName}` - Nom de famille du client

## Variables réservation

- `{bookingNumber}` - Numéro de réservation
- `{roomName}` - Nom de la chambre/place
- `{checkInDate}` - Date d'arrivée
- `{checkOutDate}` - Date de départ

## Variables financières

- `{totalAmount}` - **Montant total payé par le client** (avec tous les frais)
- `{baseAmount}` - Montant de base (chambre + options + taxe, sans frais de plateforme)
- `{roomPrice}` - Prix de la chambre uniquement (chambre × nombre de nuits)
- `{pricingOptionsTotal}` - Total des options supplémentaires
- `{touristTaxTotal}` - Total de la taxe de séjour
- `{currency}` - Devise (CHF)

## Variables établissement

- `{establishmentName}` - Nom de l'établissement
- `{hotelContactEmail}` - Email de contact de l'hôtel
- `{hotelContactPhone}` - Téléphone de contact de l'hôtel

## Variables d'accès

- `{accessCode}` - Code d'accès (selon la configuration de l'établissement)

## Exemple d'utilisation

```
Bonjour {clientFirstName} {clientLastName},

Votre réservation à {establishmentName} est confirmée !

📋 Numéro : {bookingNumber}
💰 Montant total payé : {totalAmount} {currency}

Détail :
- Hébergement : {roomPrice} {currency}
- Options : {pricingOptionsTotal} {currency}
- Taxe de séjour : {touristTaxTotal} {currency}

🏠 Chambre : {roomName}
📅 Du {checkInDate} au {checkOutDate}
🔑 Code : {accessCode}

Contact : {hotelContactEmail} | {hotelContactPhone}
```

## Nouvelle fonctionnalité

✅ **Variable `{totalAmount}` ajoutée** - Affiche le montant total réellement payé par le client, incluant tous les frais (chambre, options, taxe de séjour, frais de plateforme).

Cette variable est parfaite pour l'email de confirmation car elle correspond exactement au montant que le client a payé avec sa carte bancaire.
