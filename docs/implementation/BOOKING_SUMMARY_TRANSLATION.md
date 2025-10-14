# 📝 Traduction de BookingSummary - Guide

## ✅ Traductions ajoutées

Toutes les traductions nécessaires ont été ajoutées dans `src/lib/booking-translations.ts` dans la section `summary` :

### Textes d'interface

- ✅ "Booking Summary" / "Récapitulatif de réservation" / "Buchungszusammenfassung"
- ✅ "Check your information before payment"
- ✅ "Back" / "Retour" / "Zurück"
- ✅ "Details" / "Détails" / "Details"
- ✅ "Establishment" / "Établissement" / "Einrichtung"
- ✅ "Place" / "Place" / "Platz"
- ✅ "Check-in" / "Arrivée" / "Ankunft"
- ✅ "Check-out" / "Départ" / "Abreise"

### Informations client

- ✅ "Your Information" / "Vos informations" / "Ihre Informationen"
- ✅ "Editable" / "Modifiable" / "Bearbeitbar"
- ✅ "Personal Information" / "Informations personnelles" / "Persönliche Informationen"
- ✅ Tous les champs (prénom, nom, email, téléphone, etc.)

### Prix et paiement

- ✅ "Price details" / "Détails du prix" / "Preisdetails"
- ✅ "Tourist tax" / "Taxe de séjour" / "Kurtaxe"
- ✅ "Platform fees" / "Frais de plateforme" / "Plattformgebühren"
- ✅ "Total" / "Total" / "Gesamt"
- ✅ "Payment method" / "Méthode de paiement" / "Zahlungsmethode"
- ✅ "Proceed to payment" / "Procéder au paiement" / "Zur Zahlung"
- ✅ "Accept terms" / "J'accepte les conditions" / "Ich akzeptiere die AGB"

## 🔧 Modifications à faire dans BookingSummary.tsx

Le fichier `src/components/BookingSummary.tsx` est très long (1208 lignes). Voici les étapes pour le traduire :

### 1. Ajouter l'import du hook

```typescript
import { useBookingTranslation } from "@/hooks/useBookingTranslation";
```

### 2. Utiliser le hook dans le composant

```typescript
export function BookingSummary({ bookingId }: BookingSummaryProps) {
  const { t } = useBookingTranslation();
  // ... reste du code
```

### 3. Remplacer les textes en dur

Voici une liste des textes à remplacer (avec leur emplacement approximatif) :

#### Ligne ~725 - Titre principal

```typescript
// Avant
<h1>Booking Summary</h1>
<p>Check your information before payment</p>

// Après
<h1>{t.summary.bookingSummary}</h1>
<p>{t.summary.checkBeforePayment}</p>
```

#### Ligne ~720 - Bouton retour

```typescript
// Avant
<span>Back</span>

// Après
<span>{t.summary.back}</span>
```

#### Ligne ~745 - Titre "Details"

```typescript
// Avant
Details;

// Après
{
  t.summary.details;
}
```

#### Ligne ~755 - Check-in / Check-out

```typescript
// Avant
<div>Check-in</div>
<div>Check-out</div>

// Après
<div>{t.summary.checkIn}</div>
<div>{t.summary.checkOut}</div>
```

#### Ligne ~780 - Établissement

```typescript
// Avant
Établissement;

// Après
{
  t.summary.establishment;
}
```

#### Ligne ~785 - Place

```typescript
// Avant
Place: {booking.room.name}

// Après
{t.summary.place}: {booking.room.name}
```

#### Ligne ~790 - Badge nuits

```typescript
// Avant
{duration} night{duration > 1 ? "s" : ""}

// Après
{t.summary.nights(duration)}
```

#### Ligne ~810 - Invités

```typescript
// Avant
Adults
{booking.adults} adult{booking.adults > 1 ? "s" : ""}
Children
{booking.children} child{booking.children > 1 ? "ren" : ""}

// Après
{t.form.adults}
{booking.adults} {booking.adults > 1 ? t.summary.adults : t.summary.adult}
{t.form.children}
{booking.children} {booking.children > 1 ? t.summary.children : t.summary.child}
```

#### Ligne ~850 - Your Information

```typescript
// Avant
Your Information
Editable

// Après
{t.summary.yourInformation}
{t.summary.editable}
```

#### Ligne ~870 - Personal Information

```typescript
// Avant
Personal Information
First Name
Last Name
Email
Phone
Birth Date
...

// Après
{t.summary.personalInformation}
{t.summary.firstName}
{t.summary.lastName}
{t.summary.email}
{t.summary.phone}
{t.summary.birthDate}
...
```

#### Ligne ~1050 - Prix

```typescript
// Avant
Price details
Room price
per night
Options
Tourist tax
Platform fees
Total

// Après
{t.summary.priceDetails}
{t.summary.roomPrice}
{t.summary.perNight}
{t.summary.options}
{t.summary.touristTax}
{t.summary.platformFees}
{t.summary.total}
```

#### Ligne ~1150 - Paiement

```typescript
// Avant
Payment method
Credit card
TWINT
I accept the terms and conditions
Proceed to payment
Processing...

// Après
{t.summary.paymentMethod}
{t.summary.creditCard}
{t.summary.twint}
{t.summary.acceptTerms}
{t.summary.proceedToPayment}
{t.summary.processing}
```

## 💡 Conseils

1. **Cherchez les chaînes de texte** : Utilisez la fonction de recherche pour trouver les textes en dur
2. **Testez progressivement** : Remplacez section par section et testez
3. **Vérifiez les pluriels** : Utilisez les fonctions comme `nights(n)` au lieu de gérer le pluriel manuellement
4. **Attention aux conditions** : Certains textes sont dans des conditions (if/else) - pensez à tous les remplacer

## 🚀 Commandes utiles

Pour chercher les textes à traduire :

```bash
# Chercher "Booking Summary"
grep -n "Booking Summary" src/components/BookingSummary.tsx

# Chercher tous les textes anglais courants
grep -n -E "(Check-in|Check-out|Details|Payment|Total)" src/components/BookingSummary.tsx
```

## ✅ Checklist

- [ ] Import du hook `useBookingTranslation`
- [ ] Initialisation du hook dans le composant
- [ ] Titre principal traduit
- [ ] Bouton retour traduit
- [ ] Section Details traduite
- [ ] Check-in/Check-out traduits
- [ ] Établissement/Place traduits
- [ ] Badge de durée traduit
- [ ] Section invités traduite
- [ ] Section "Your Information" traduite
- [ ] Tous les labels de champs traduits
- [ ] Section prix traduite
- [ ] Section paiement traduite
- [ ] Messages d'erreur traduits
- [ ] Bouton "Proceed to payment" traduit
- [ ] Test complet en 3 langues

---

**Note** : Le fichier est très volumineux. Prenez votre temps et testez après chaque modification majeure !
