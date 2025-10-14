# 📧 Système d'Emails Multilingues

## 🎯 Vue d'ensemble

Le système d'emails de confirmation est désormais **complètement multilingue**. Il envoie automatiquement l'email dans la langue choisie par le client lors de sa réservation (FR/EN/DE), et selon s'il voyage avec un chien ou non.

## 🗂️ Structure des Templates

### Base de données (Prisma Schema)

Pour chaque établissement, il existe maintenant **18 champs de templates d'emails** :

#### Français (par défaut)

- `confirmationEmailTemplate` - Template général FR
- `confirmationEmailTemplateWithDog` - Template FR avec chien
- `confirmationEmailTemplateWithoutDog` - Template FR sans chien

#### Anglais

- `confirmationEmailTemplateEn` - Template général EN
- `confirmationEmailTemplateWithDogEn` - Template EN avec chien
- `confirmationEmailTemplateWithoutDogEn` - Template EN sans chien

#### Allemand

- `confirmationEmailTemplateDe` - Template général DE
- `confirmationEmailTemplateWithDogDe` - Template DE avec chien
- `confirmationEmailTemplateWithoutDogDe` - Template DE sans chien

### Designs JSON (pour Unlayer)

- `confirmationEmailDesign` + `confirmationEmailDesignEn` + `confirmationEmailDesignDe`
- `confirmationEmailDesignWithDog` + `confirmationEmailDesignWithDogEn` + `confirmationEmailDesignWithDogDe`
- `confirmationEmailDesignWithoutDog` + `confirmationEmailDesignWithoutDogEn` + `confirmationEmailDesignWithoutDogDe`

## 🔄 Logique de Sélection du Template

La fonction `generateConfirmationContent()` dans `/src/lib/confirmation-template.ts` sélectionne le bon template selon **2 critères** :

### 1. Langue de la réservation (`bookingLocale`)

- `"fr"` → Templates français
- `"en"` → Templates anglais
- `"de"` → Templates allemands
- Par défaut : `"fr"`

### 2. Option chien (`hasDog`)

- `true` → Template "avec chien" (WithDog)
- `false` → Template "sans chien" (WithoutDog)
- Si pas de template spécifique → Template général

### Ordre de priorité

```
1. Template spécifique langue + chien (ex: confirmationEmailTemplateWithDogEn)
2. Template général langue (ex: confirmationEmailTemplateEn)
3. Template par défaut généré (getDefaultEmailTemplate(locale))
```

## 📝 Variables disponibles dans les templates

Tous les templates (FR/EN/DE) utilisent les mêmes variables :

```
{clientFirstName}         // Prénom
{clientLastName}          // Nom
{establishmentName}       // Nom de l'établissement
{roomName}                // Nom de la place/chambre
{checkInDate}             // Date d'arrivée
{checkOutDate}            // Date de départ
{accessCode}              // Code d'accès
{bookingNumber}           // Numéro de réservation
{totalAmount}             // Montant total payé
{baseAmount}              // Montant hors frais
{roomPrice}               // Prix chambre seul
{pricingOptionsTotal}     // Total options
{touristTaxTotal}         // Taxe de séjour
{currency}                // Devise (CHF)
{invoiceDownloadUrl}      // Lien facture PDF
{hotelContactEmail}       // Email contact
{hotelContactPhone}       // Téléphone contact
```

## 🚀 Flow complet du système

### 1. Sélection de langue (Frontend)

```tsx
// Dans LanguageSelector.tsx
const locale = useBookingTranslation().locale; // "fr" | "en" | "de"
```

### 2. Sauvegarde lors de la réservation

```tsx
// Dans BookingFormDetails.tsx
const bookingData = {
  ...
  bookingLocale: locale, // Enregistré dans sessionStorage
  hasDog: true/false,
}
```

### 3. Transmission à l'API

```tsx
// Dans BookingSummary.tsx → POST /api/establishments/{hotel}/bookings
body: JSON.stringify({
  ...
  bookingLocale: booking.bookingLocale || "fr",
  hasDog: booking.hasDog || false,
})
```

### 4. Stockage dans Stripe metadata

```ts
// Dans /api/establishments/[hotel]/bookings/route.ts
const paymentIntent = await createPaymentIntentWithCommission(..., {
  ...
  booking_locale: bookingLocale || "fr",
  has_dog: hasDog ? "true" : "false",
})
```

### 5. Création de réservation (webhook)

```ts
// Dans /api/webhooks/stripe/route.ts → createClassicBookingFromMetadata
const booking = await prisma.booking.create({
  data: {
    ...
    bookingLocale: metadata.booking_locale || "fr",
    hasDog: metadata.has_dog === "true",
  }
})
```

### 6. Envoi email de confirmation

```ts
// Dans /api/bookings/[bookingId]/send-confirmation/route.ts
const booking = await prisma.booking.findUnique({
  select: {
    bookingLocale: true,
    hasDog: true,
    establishment: {
      select: {
        // Tous les templates FR/EN/DE + WithDog/WithoutDog
        confirmationEmailTemplate: true,
        confirmationEmailTemplateEn: true,
        confirmationEmailTemplateDe: true,
        // etc...
      },
    },
  },
});

// Génération du contenu avec le bon template
const content = await generateConfirmationContent(booking, templateData);
```

### 7. Sélection du template

```ts
// Dans /lib/confirmation-template.ts → generateConfirmationContent()
const locale = booking.bookingLocale || "fr";

if (booking.hasDog === true) {
  switch (locale) {
    case "en":
      template = establishment.confirmationEmailTemplateWithDogEn;
    case "de":
      template = establishment.confirmationEmailTemplateWithDogDe;
    case "fr":
      template = establishment.confirmationEmailTemplateWithDog;
  }
} else if (booking.hasDog === false) {
  switch (locale) {
    case "en":
      template = establishment.confirmationEmailTemplateWithoutDogEn;
    case "de":
      template = establishment.confirmationEmailTemplateWithoutDogDe;
    case "fr":
      template = establishment.confirmationEmailTemplateWithoutDog;
  }
}

// Fallback si pas de template spécifique
if (!template) {
  template = getDefaultEmailTemplate(locale); // Template par défaut dans la bonne langue
}
```

## 📊 Exemples de scénarios

### Scénario 1 : Client français avec chien

- Langue sélectionnée : `"fr"`
- Option chien : `true`
- Template envoyé : `confirmationEmailTemplateWithDog` (FR)

### Scénario 2 : Client anglais sans chien

- Langue sélectionnée : `"en"`
- Option chien : `false`
- Template envoyé : `confirmationEmailTemplateWithoutDogEn` (EN)

### Scénario 3 : Client allemand, pas d'option chien configurée

- Langue sélectionnée : `"de"`
- Option chien : `false`
- Templates spécifiques non définis
- Template envoyé : `confirmationEmailTemplateDe` (template général DE)

### Scénario 4 : Pas de template personnalisé du tout

- Template envoyé : `getDefaultEmailTemplate(locale)` - template par défaut dans la langue choisie

## 🛠️ Configuration Admin

Pour configurer les templates multilingues, l'admin doit :

1. Aller dans la section "Email Templates" de son établissement
2. Voir 3 onglets : **Français** | **English** | **Deutsch**
3. Pour chaque langue, configurer 3 templates :
   - 📧 **Normal** - Pour toutes les réservations
   - 🐕 **Avec chien** - Spécifique pour les clients avec chien
   - 🚫 **Sans chien** - Spécifique pour les clients sans chien

## ✅ Avantages

- ✅ **Expérience utilisateur** : Email dans la langue choisie
- ✅ **Personnalisation** : Messages différents avec/sans chien
- ✅ **Fallback intelligent** : Si pas de template spécifique, utilise le template général
- ✅ **Template par défaut** : Si aucun template personnalisé, génère un email correct dans la bonne langue
- ✅ **Persistance** : La langue est sauvegardée avec la réservation

## 🔍 Debugging

Pour vérifier quel template est utilisé :

```ts
console.log("Locale:", booking.bookingLocale);
console.log("Has dog:", booking.hasDog);
console.log("Template selected:", template ? "Custom" : "Default");
```

## 📄 Fichiers modifiés

### Base de données

- `prisma/schema.prisma` - Ajout des champs multilingues

### Types

- `src/types/hotel.ts` - Ajout de `bookingLocale` dans `BookingData`
- `src/lib/confirmation-template.ts` - Interface `BookingWithDetails` étendue

### Logique

- `src/lib/confirmation-template.ts` - `generateConfirmationContent()` avec sélection multilingue
- `src/lib/confirmation-template.ts` - `getDefaultEmailTemplate(locale)` avec support FR/EN/DE

### APIs

- `src/app/api/establishments/[hotel]/bookings/route.ts` - Ajout de `bookingLocale` dans metadata
- `src/app/api/webhooks/stripe/route.ts` - Sauvegarde de `bookingLocale` lors de création
- `src/app/api/bookings/[bookingId]/send-confirmation/route.ts` - Select des templates multilingues

### Composants

- `src/components/BookingFormDetails.tsx` - Enregistrement de `locale` dans bookingData
- `src/components/BookingSummary.tsx` - Transmission de `bookingLocale` à l'API

### Autres

- `src/lib/booking.ts` - Création booking avec `bookingLocale`

## 🚧 TODO (Admin interface)

Pour permettre aux admins de configurer facilement les templates multilingues, il faudra :

- [ ] Créer une interface avec onglets FR/EN/DE
- [ ] Pour chaque langue, 3 éditeurs : Normal / Avec chien / Sans chien
- [ ] Preview du template avec les variables remplacées
- [ ] Import/Export de templates
- [ ] Copie d'un template d'une langue à l'autre (pour traduction)

---

**Note** : Le système fonctionne dès maintenant ! Les admins peuvent déjà configurer les templates directement en base de données si besoin, en attendant l'interface admin complète.
