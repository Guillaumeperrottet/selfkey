# 🌍 Système Multilangue - Selfkey

## ✅ Ce qui est fait

### 1. Architecture mise en place

**Fichiers créés :**

- ✅ `src/lib/booking-translations.ts` - Toutes les traductions (FR/EN/DE)
- ✅ `src/hooks/useBookingTranslation.ts` - Hook pour utiliser les traductions
- ✅ `src/components/LanguageSelector.tsx` - Sélecteur de langue
- ✅ `src/lib/email-translations.ts` - Helper pour les emails multilingues

### 2. Composants traduits

#### ✅ DateSelector (Première page du formulaire)

- Sélecteur de dates avec calendrier
- Messages d'erreur de validation
- Options de prix dynamiques
- Avertissements horaires (cutoff time)
- Option chien
- Interface complète en 3 langues

#### ✅ RoomSelector (Sélection de place)

- Titre et labels
- Messages d'état (chargement, aucune place disponible)
- Boutons d'action
- Durée du séjour
- Tous les textes d'interface

#### ✅ BookingFormDetails (Formulaire de détails client)

- Labels des champs (prénom, nom, email, etc.)
- Messages de validation
- Informations sur la taxe de séjour
- Tous les textes d'interface

### 3. Persistance de la langue

**Comment ça fonctionne :**

1. L'utilisateur sélectionne sa langue au début du formulaire
2. La langue est sauvegardée dans `localStorage`
3. La langue reste active pendant toute la session
4. Même si l'utilisateur rafraîchit la page, sa langue est conservée

**Clé de stockage :** `booking_locale` (valeurs: `fr`, `en`, `de`)

## 📋 Ce qu'il reste à faire

### Composants à traduire

#### 1. Page de résumé (summary)

- [ ] Récapitulatif de réservation
- [ ] Détails de paiement
- [ ] Boutons d'action

#### 2. Page de confirmation

- [ ] Message de succès
- [ ] Détails de la réservation
- [ ] Bouton de téléchargement de facture

#### 3. Emails de confirmation

- [ ] Intégrer les traductions dans `src/lib/email.ts`
- [ ] Gérer les templates personnalisables multilingues
- [ ] Ajouter le paramètre `locale` dans `sendBookingConfirmation()`

### Migration Base de Données (Optionnel)

Pour permettre des templates d'emails personnalisés par langue :

```prisma
model Establishment {
  // Français (existant)
  confirmationEmailTemplate           String?
  confirmationEmailTemplateWithDog    String?
  confirmationEmailTemplateWithoutDog String?

  // Anglais (nouveau)
  confirmationEmailTemplateEn           String?
  confirmationEmailTemplateWithDogEn    String?
  confirmationEmailTemplateWithoutDogEn String?

  // Allemand (nouveau)
  confirmationEmailTemplateDe           String?
  confirmationEmailTemplateWithDogDe    String?
  confirmationEmailTemplateWithoutDogDe String?
}

model Booking {
  // ...
  preferredLocale String? @default("fr") // Sauvegarder la langue du client
}
```

## 🎯 Usage

### Dans un composant

```typescript
import { useBookingTranslation } from '@/hooks/useBookingTranslation';

function MyComponent() {
  const { t, locale, setLocale } = useBookingTranslation();

  return (
    <div>
      <h1>{t.dates.checkIn}</h1>
      <p>{t.dates.nights(3)}</p> {/* "3 nuits" en FR */}
      <button onClick={() => setLocale('en')}>
        Switch to English
      </button>
    </div>
  );
}
```

### Ajouter une nouvelle traduction

1. **Ajouter la clé dans l'interface TypeScript :**

```typescript
// src/lib/booking-translations.ts
export interface BookingTranslations {
  dates: {
    // ...
    newKey: string; // ← Nouvelle clé
  };
}
```

2. **Ajouter les traductions pour chaque langue :**

```typescript
export const translations: Record<Locale, BookingTranslations> = {
  fr: {
    dates: {
      // ...
      newKey: "Texte en français",
    },
  },
  en: {
    dates: {
      // ...
      newKey: "Text in English",
    },
  },
  de: {
    dates: {
      // ...
      newKey: "Text auf Deutsch",
    },
  },
};
```

3. **Utiliser dans un composant :**

```typescript
<p>{t.dates.newKey}</p>
```

## 🔧 Prochaines étapes

1. ✅ **FAIT** - DateSelector traduit
2. ✅ **FAIT** - RoomSelector traduit
3. ✅ **FAIT** - BookingFormDetails traduit
4. **TODO** - Page de résumé
5. **TODO** - Page de confirmation
6. **TODO** - Emails multilingues

## 💡 Notes importantes

### Dates et nombres

Les dates sont formatées automatiquement selon la langue grâce à `date-fns` :

```typescript
import { fr, enUS, de } from "date-fns/locale";

const dateLocale = locale === "fr" ? fr : locale === "de" ? de : enUS;
format(date, "EEEE dd MMMM yyyy", { locale: dateLocale });
// FR: "Lundi 09 octobre 2025"
// EN: "Monday 09 October 2025"
// DE: "Montag 09 Oktober 2025"
```

### Emails

Pour les emails, utiliser `detectClientLocale()` pour détecter automatiquement la langue du client :

```typescript
import {
  detectClientLocale,
  getEmailTranslations,
} from "@/lib/email-translations";

const locale = detectClientLocale(
  savedLocale, // Langue sauvegardée
  clientEmail, // Détecter depuis @domain.de, .fr, etc.
  browserLocale // Langue du navigateur
);

const emailT = getEmailTranslations(locale);
```

## 🎨 Interface utilisateur

Le sélecteur de langue apparaît en haut à droite de la première page du formulaire avec des drapeaux :

- 🇫🇷 Français
- 🇬🇧 English
- 🇩🇪 Deutsch

---

**Dernière mise à jour :** 9 octobre 2025
**Status :** ✅ Système de base opérationnel, traduction du flux de réservation en cours

## 🎯 Langues supportées

- 🇫🇷 **Français** (défaut)
- 🇬🇧 **Anglais**
- 🇩🇪 **Allemand**

## 📁 Architecture

```
src/
├── lib/
│   ├── booking-translations.ts      # Toutes les traductions
│   └── email-translations.ts        # Helper pour emails multilingues
├── hooks/
│   └── useBookingTranslation.ts     # Hook pour utiliser les traductions
└── components/
    └── LanguageSelector.tsx         # Sélecteur de langue
```

## 🚀 Utilisation

### 1. Dans un composant

```typescript
import { useBookingTranslation } from '@/hooks/useBookingTranslation';

export function MyComponent() {
  const { t, locale, setLocale } = useBookingTranslation();

  return (
    <div>
      <h1>{t.form.firstName}</h1>
      <button>{t.navigation.continue}</button>

      {/* Avec fonction pour pluralisation */}
      <p>{t.dates.nights(3)}</p> {/* "3 nuits" / "3 nights" / "3 Nächte" */}
    </div>
  );
}
```

### 2. Ajouter le sélecteur de langue

```typescript
import { LanguageSelector } from '@/components/LanguageSelector';

<LanguageSelector /> {/* Version complète */}
<LanguageSelectorCompact /> {/* Version compacte */}
```

### 3. Pour les emails

```typescript
import {
  generateEmailBody,
  getEmailSubject,
  detectClientLocale,
} from "@/lib/email-translations";

// Détecter la langue du client
const locale = detectClientLocale(
  localStorage.getItem("booking_locale"),
  "client@example.de"
);

// Générer l'email traduit
const emailBody = generateEmailBody(locale, {
  clientName: "John Doe",
  bookingNumber: "12345",
  checkInDate: "01.10.2025",
  checkOutDate: "03.10.2025",
  roomName: "Emplacement Premium",
  totalAmount: "150.00",
  currency: "CHF",
  establishmentName: "SelfCamp Fribourg",
  // ...
});

const subject = getEmailSubject(locale, "SelfCamp Fribourg");
```

## 📝 Ajouter de nouvelles traductions

### Dans `booking-translations.ts` :

```typescript
export const translations: Record<Locale, BookingTranslations> = {
  fr: {
    // ...
    myNewKey: "Mon nouveau texte",
  },
  en: {
    // ...
    myNewKey: "My new text",
  },
  de: {
    // ...
    myNewKey: "Mein neuer Text",
  },
};
```

### Puis utiliser :

```typescript
const { t } = useBookingTranslation();
<p>{t.myNewKey}</p>
```

## 🎨 Fonctionnalités

### ✅ Ce qui est traduit

- ✅ Formulaire de sélection de dates
- ✅ Sélection de chambre
- ✅ Formulaire de détails client (tous les champs)
- ✅ Messages de validation
- ✅ Messages toast (erreurs, succès)
- ✅ Boutons de navigation
- ✅ Emails de confirmation

### 🔄 Persistance

La langue choisie est **automatiquement sauvegardée** dans le `localStorage` et restaurée à chaque visite.

### 🌐 Détection automatique

Pour les emails, le système détecte automatiquement la langue via :

1. La langue sauvegardée dans localStorage
2. Le domaine de l'email (.de, .fr, etc.)
3. La langue du navigateur
4. Français par défaut

## 🛠️ Maintenance

### Ajouter une nouvelle langue

1. Ajouter le code langue dans `Locale` :

```typescript
export type Locale = "fr" | "en" | "de" | "it"; // Ajouter 'it'
```

2. Ajouter les traductions dans `translations` :

```typescript
it: {
  language: {
    select: 'Scegli la tua lingua',
    // ...
  },
  // ...
}
```

3. Ajouter le drapeau dans `LanguageSelector.tsx` :

```typescript
{ code: 'it' as Locale, flag: '🇮🇹', label: 'Italiano' }
```

### Vérifier qu'une clé est traduite partout

```bash
# Chercher une clé dans toutes les langues
grep -n "firstName" src/lib/booking-translations.ts
```

## 📊 Performance

- **0 Ko de dépendances** externes
- **Chargement instantané** (pas de lazy-loading nécessaire)
- **TypeScript-safe** avec autocomplete
- **SSR-friendly** (fonctionne côté serveur sans config)

## 🔍 Debugging

### Voir la langue active

```typescript
const { locale } = useBookingTranslation();
console.log("Langue active:", locale); // 'fr', 'en', ou 'de'
```

### Forcer une langue

```typescript
const { setLocale } = useBookingTranslation();
setLocale("de"); // Force l'allemand
```

### Vider le localStorage

```typescript
localStorage.removeItem("booking_locale");
```

## 🎯 Exemples d'utilisation

### Pluralisation

```typescript
// Dans booking-translations.ts
nights: (n: number) => `${n} nuit${n > 1 ? 's' : ''}`,

// Utilisation
{t.dates.nights(1)} // "1 nuit"
{t.dates.nights(3)} // "3 nuits"
```

### Interpolation

```typescript
// Dans booking-translations.ts
touristTaxInfo: (amount: string) =>
  `ℹ️ Taxe de séjour: ${amount} CHF par adulte`,

// Utilisation
{t.form.touristTaxInfo('3.50')} // "ℹ️ Taxe de séjour: 3.50 CHF par adulte"
```

### Emails

```typescript
greeting: (name: string) => `Bonjour ${name},`,

// Utilisation
{t.email.greeting('Jean Dupont')} // "Bonjour Jean Dupont,"
```

## 🚨 Erreurs courantes

### "t is not defined"

➡️ Oublié d'importer `useBookingTranslation()`

### "Cannot read property of undefined"

➡️ Vérifier que la clé existe dans toutes les langues

### Hydration mismatch

➡️ Utiliser `mounted` du hook :

```typescript
const { t, mounted } = useBookingTranslation();
if (!mounted) return <Skeleton />;
```

## 🎓 Bonnes pratiques

1. ✅ **Toujours traduire les 3 langues** en même temps
2. ✅ **Utiliser des clés descriptives** (`form.firstName` au lieu de `fn`)
3. ✅ **Grouper par contexte** (form, dates, validation, etc.)
4. ✅ **Tester chaque langue** manuellement
5. ✅ **Documenter les fonctions** de traduction complexes

## 📞 Support

Pour toute question ou ajout de nouvelle langue, contactez l'équipe de développement.

---

## 📧 EMAILS MULTILINGUES

### Architecture des Templates

Le système d'emails est maintenant **complètement multilingue**. Chaque établissement peut avoir jusqu'à **18 templates d'emails différents** :

#### Structure des templates

```
3 langues × 3 variantes = 9 templates de contenu + 9 designs JSON

Langues : FR / EN / DE
Variantes : Normal / Avec chien / Sans chien
```

#### Champs en base de données (Establishment)

**Français :**

- `confirmationEmailTemplate` - Template général
- `confirmationEmailTemplateWithDog` - Avec chien
- `confirmationEmailTemplateWithoutDog` - Sans chien
- `confirmationEmailDesign`, `confirmationEmailDesignWithDog`, `confirmationEmailDesignWithoutDog`

**Anglais :**

- `confirmationEmailTemplateEn`
- `confirmationEmailTemplateWithDogEn`
- `confirmationEmailTemplateWithoutDogEn`
- `confirmationEmailDesignEn`, `confirmationEmailDesignWithDogEn`, `confirmationEmailDesignWithoutDogEn`

**Allemand :**

- `confirmationEmailTemplateDe`
- `confirmationEmailTemplateWithDogDe`
- `confirmationEmailTemplateWithoutDogDe`
- `confirmationEmailDesignDe`, `confirmationEmailDesignWithDogDe`, `confirmationEmailDesignWithoutDogDe`

### Sélection automatique du template

L'email envoyé est automatiquement choisi selon **2 critères** :

1. **Langue de réservation** (`bookingLocale`) - FR/EN/DE
2. **Option chien** (`hasDog`) - true/false

#### Ordre de priorité

```
1. Template spécifique (langue + chien)
   Ex: confirmationEmailTemplateWithDogEn

2. Template général (langue uniquement)
   Ex: confirmationEmailTemplateEn

3. Template par défaut généré
   Ex: getDefaultEmailTemplate("en")
```

### Variables disponibles

Tous les templates utilisent les mêmes variables :

```
{clientFirstName}         // Prénom du client
{clientLastName}          // Nom du client
{establishmentName}       // Nom de l'établissement
{roomName}                // Nom de la place/chambre
{checkInDate}             // Date d'arrivée (format: DD/MM/YYYY)
{checkOutDate}            // Date de départ (format: DD/MM/YYYY)
{accessCode}              // Code d'accès
{bookingNumber}           // Numéro de réservation
{totalAmount}             // Montant total payé
{baseAmount}              // Montant hors frais de plateforme
{roomPrice}               // Prix de la chambre seul
{pricingOptionsTotal}     // Total des options supplémentaires
{touristTaxTotal}         // Total de la taxe de séjour
{currency}                // Devise (CHF)
{invoiceDownloadUrl}      // Lien de téléchargement de facture PDF
{hotelContactEmail}       // Email de contact
{hotelContactPhone}       // Téléphone de contact
```

### Flow de données

```
1. Client sélectionne sa langue (LanguageSelector)
   └─> Stockée dans localStorage (booking_locale)

2. Client remplit le formulaire
   └─> Langue ajoutée à bookingData.bookingLocale

3. Paiement via Stripe
   └─> bookingLocale + hasDog dans metadata

4. Webhook crée la réservation
   └─> Sauvegarde bookingLocale et hasDog en DB

5. Email de confirmation
   └─> generateConfirmationContent() sélectionne le bon template
   └─> Email envoyé dans la bonne langue !
```

### Exemples de scénarios

**Scénario 1 : Client anglais avec chien**

```
bookingLocale: "en"
hasDog: true
→ Template utilisé: confirmationEmailTemplateWithDogEn
```

**Scénario 2 : Client allemand sans chien**

```
bookingLocale: "de"
hasDog: false
→ Template utilisé: confirmationEmailTemplateWithoutDogDe
```

**Scénario 3 : Pas de template spécifique**

```
bookingLocale: "en"
hasDog: false
Templates WithDog/WithoutDog non définis
→ Template utilisé: confirmationEmailTemplateEn (général)
```

**Scénario 4 : Aucun template personnalisé**

```
bookingLocale: "de"
Aucun template en base
→ Template utilisé: getDefaultEmailTemplate("de") (auto-généré)
```

### Fichiers modifiés pour les emails

**Base de données :**

- `prisma/schema.prisma` - Ajout des 18 champs de templates + bookingLocale

**Logique :**

- `src/lib/confirmation-template.ts` - Sélection intelligente du template
- `src/lib/booking.ts` - Sauvegarde de bookingLocale

**APIs :**

- `src/app/api/establishments/[hotel]/bookings/route.ts` - Metadata Stripe
- `src/app/api/webhooks/stripe/route.ts` - Création réservation
- `src/app/api/bookings/[bookingId]/send-confirmation/route.ts` - Select templates

**Composants :**

- `src/components/BookingFormDetails.tsx` - Enregistrement de locale
- `src/components/BookingSummary.tsx` - Transmission de bookingLocale

### Documentation complète

📄 Voir `EMAIL_MULTILANGUE.md` et `RECAPITULATIF_EMAILS_MULTILANGUES.md` pour tous les détails techniques.

---

**Version:** 2.0.0  
**Dernière mise à jour:** Octobre 2025  
**Nouvelles fonctionnalités:** Emails multilingues avec templates personnalisables
