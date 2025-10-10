/**
 * Traductions pour le système de réservation
 * Support: Français, Anglais, Allemand
 */

export type Locale = "fr" | "en" | "de";

export interface BookingTranslations {
  // Sélecteur de langue
  language: {
    select: string;
    fr: string;
    en: string;
    de: string;
  };

  // Navigation
  navigation: {
    back: string;
    backToDates: string;
    backToRooms: string;
    continue: string;
    confirm: string;
    bookNow: string;
  };

  // Sélection des dates
  dates: {
    title: string;
    selectDates: string;
    checkIn: string;
    checkOut: string;
    nights: (n: number) => string;
    night: string;
    selectCheckIn: string;
    selectCheckOut: string;
    maxStay: (n: number) => string;
    hasDog: string;
    dogOption: string;
    dogFee: string;

    // Nouvelles traductions
    stayDates: string;
    bookingsClosed: string;
    nextOpening: string;
    bookingsOpenUntil: (time: string) => string;
    loadingOptions: string;
    selectOption: string;
    optionRequired: (name: string) => string;
    pleaseSelectCheckout: string;
    checkoutAfterCheckin: string;
    checkinNotPast: string;
    checkinMustBeToday: string;
    invalidDates: string;
    dateValidationError: string;
    search: string;
    validating: string;
  };

  // Sélection de chambre
  rooms: {
    title: string;
    selectRoom: string;
    available: string;
    notAvailable: string;
    perNight: string;
    person: string;
    persons: string;
    details: string;
    reserve: string;

    // Nouvelles traductions
    availablePlaces: string;
    changeDates: string;
    noPlacesAvailable: string;
    chooseDifferentDates: string;
    continueWith: (placeName: string) => string;
    searchingPlaces: string;
    errorSearching: string;
  };

  // Formulaire de détails
  form: {
    title: string;
    contactDetails: string;
    personalInfo: string;
    personalInfoDescription: string;
    guestInfo: string;
    guestInfoDescription: string;
    requiredField: string;

    // Champs invités
    adults: string;
    adult: string;
    children: string;
    child: string;
    touristTax: string;
    touristTaxInfo: (amount: string) => string;

    // Champs personnels
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    birthDate: string;
    birthPlace: string;
    address: string;
    postalCode: string;
    city: string;
    country: string;
    idNumber: string;
    idType: string;
    vehicleNumber: string;

    // Types de document
    idCard: string;
    passport: string;
    drivingLicense: string;

    // Pays
    switzerland: string;
    france: string;
    germany: string;
    italy: string;
    other: string;
  };

  // Validation
  validation: {
    requiredFields: string;
    invalidEmail: string;
    invalidPhone: string;
    minAdults: string;
    maxDuration: (n: number) => string;
    selectDates: string;
    selectRoom: string;
  };

  // Messages
  messages: {
    loading: string;
    creatingBooking: string;
    processingPayment: string;
    success: string;
    error: string;
    bookingCreated: string;
    paymentSuccess: string;
    paymentFailed: string;
    sessionExpired: string;
  };

  // Récapitulatif
  summary: {
    title: string;
    bookingSummary: string;
    checkBeforePayment: string;
    back: string;
    details: string;
    establishment: string;
    place: string;
    room: string;
    dates: string;
    checkIn: string;
    checkOut: string;
    duration: string;
    guests: string;
    adult: string;
    adults: string;
    child: string;
    children: string;
    yourInformation: string;
    editable: string;
    personalInformation: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    birthDate: string;
    birthPlace: string;
    address: string;
    postalCode: string;
    city: string;
    country: string;
    idNumber: string;
    vehicleNumber: string;

    // Prix
    priceDetails: string;
    roomPrice: string;
    nightlyRate: string;
    nights: (n: number) => string;
    night: string;
    options: string;
    touristTax: string;
    touristTaxPerNight: (amount: string) => string;
    platformFees: string;
    subtotal: string;
    total: string;

    // Paiement
    paymentMethod: string;
    creditCard: string;
    twint: string;
    acceptTerms: string;
    termsText: string;
    proceedToPayment: string;
    processing: string;

    // Messages
    bookingNotFound: string;
    loadingBooking: string;
    errorLoading: string;
  };

  // Email de confirmation
  email: {
    subject: string;
    greeting: (name: string) => string;
    confirmed: string;
    bookingNumber: string;
    bookingDetails: string;
    arrivalDate: string;
    departureDate: string;
    roomType: string;
    totalAmount: string;
    accessInstructions: string;
    downloadInvoice: string;
    needHelp: string;
    contactUs: string;
    thanks: string;
    team: string;
  };

  // Page de confirmation
  confirmation: {
    title: string;
    subtitle: string;
    bookingConfirmed: string;
    bookingNumber: string;
    emailSent: string;
    emailSentDescription: string;
    checkInInfo: string;
    accessCode: string;
    downloadInvoice: string;
    printInvoice: string;
    returnHome: string;
    resendEmail: string;
    emailResent: string;
  };
}

export const translations: Record<Locale, BookingTranslations> = {
  fr: {
    language: {
      select: "Choisissez votre langue",
      fr: "Français",
      en: "English",
      de: "Deutsch",
    },

    navigation: {
      back: "← Retour",
      backToDates: "← Dates",
      backToRooms: "← Chambres",
      continue: "Continuer",
      confirm: "Confirmer",
      bookNow: "Réserver maintenant",
    },

    dates: {
      title: "Sélectionnez vos dates",
      selectDates: "Choisissez vos dates de séjour",
      checkIn: "Arrivée",
      checkOut: "Départ",
      nights: (n: number) => `${n} nuit${n > 1 ? "s" : ""}`,
      night: "nuit",
      selectCheckIn: "Date d'arrivée",
      selectCheckOut: "Date de départ",
      maxStay: (n: number) => `Séjour maximum: ${n} nuits`,
      hasDog: "Voyagez-vous avec un chien ?",
      dogOption: "Avec chien",
      dogFee: "Supplément chien",

      // Nouvelles traductions
      stayDates: "Dates de séjour",
      bookingsClosed: "Réservations fermées",
      nextOpening: "Prochaine ouverture:",
      bookingsOpenUntil: (time: string) =>
        `Réservations ouvertes jusqu'à ${time}`,
      loadingOptions: "Chargement des options...",
      selectOption: "Sélectionnez une option",
      optionRequired: (name: string) => `L'option "${name}" est obligatoire`,
      pleaseSelectCheckout: "Veuillez sélectionner la date de départ",
      checkoutAfterCheckin:
        "La date de départ doit être après la date d'arrivée",
      checkinNotPast: "La date d'arrivée ne peut pas être dans le passé",
      checkinMustBeToday:
        "La date d'arrivée doit être aujourd'hui pour cet établissement",
      invalidDates: "Dates invalides",
      dateValidationError: "Erreur lors de la validation des dates",
      search: "Rechercher",
      validating: "Validation en cours...",
    },

    rooms: {
      title: "Choisissez votre emplacement",
      selectRoom: "Sélectionnez un emplacement",
      available: "Disponible",
      notAvailable: "Non disponible",
      perNight: "par nuit",
      person: "personne",
      persons: "personnes",
      details: "Détails",
      reserve: "Réserver",

      // Nouvelles traductions
      availablePlaces: "Places disponibles",
      changeDates: "Modifier les dates",
      noPlacesAvailable: "Aucune place disponible pour ces dates",
      chooseDifferentDates: "Choisir d'autres dates",
      continueWith: (placeName: string) => `Continuer avec ${placeName}`,
      searchingPlaces: "Recherche des places disponibles...",
      errorSearching: "Erreur lors de la recherche des chambres",
    },

    form: {
      title: "Vos informations",
      contactDetails: "Coordonnées",
      personalInfo: "Informations personnelles",
      personalInfoDescription: "Requis pour votre confirmation de réservation",
      guestInfo: "Informations sur les invités",
      guestInfoDescription: "Adultes (16+) et enfants (15-)",
      requiredField: "Champ obligatoire",

      adults: "Adultes",
      adult: "adulte",
      children: "Enfants",
      child: "enfant",
      touristTax: "Taxe de séjour",
      touristTaxInfo: (amount: string) =>
        `ℹ️ Taxe de séjour: ${amount} CHF par adulte et par nuit (appliquée au paiement)`,

      firstName: "Prénom",
      lastName: "Nom",
      email: "Email",
      phone: "Téléphone",
      birthDate: "Date de naissance",
      birthPlace: "Lieu de naissance",
      address: "Adresse",
      postalCode: "Code postal",
      city: "Ville",
      country: "Pays",
      idNumber: "Numéro de pièce d'identité",
      idType: "Type de pièce d'identité",
      vehicleNumber: "Plaque d'immatriculation",

      idCard: "Carte d'identité",
      passport: "Passeport",
      drivingLicense: "Permis de conduire",

      switzerland: "Suisse",
      france: "France",
      germany: "Allemagne",
      italy: "Italie",
      other: "Autre",
    },

    validation: {
      requiredFields: "Veuillez remplir tous les champs obligatoires",
      invalidEmail: "Veuillez entrer une adresse email valide",
      invalidPhone: "Veuillez entrer un numéro de téléphone valide",
      minAdults: "Au moins un adulte est requis",
      maxDuration: (n: number) =>
        `La durée maximale du séjour est de ${n} nuits`,
      selectDates: "Veuillez sélectionner vos dates",
      selectRoom: "Veuillez sélectionner un emplacement",
    },

    messages: {
      loading: "Chargement...",
      creatingBooking: "Création de votre réservation...",
      processingPayment: "Traitement du paiement...",
      success: "Succès",
      error: "Erreur",
      bookingCreated: "Réservation créée avec succès",
      paymentSuccess: "Paiement effectué avec succès",
      paymentFailed: "Le paiement a échoué",
      sessionExpired: "La session a expiré",
    },

    summary: {
      title: "Récapitulatif",
      bookingSummary: "Récapitulatif de réservation",
      checkBeforePayment: "Vérifiez vos informations avant le paiement",
      back: "Retour",
      details: "Détails",
      establishment: "Établissement",
      place: "Place",
      room: "Emplacement",
      dates: "Dates",
      checkIn: "Arrivée",
      checkOut: "Départ",
      duration: "Durée",
      guests: "Invités",
      adult: "adulte",
      adults: "adultes",
      child: "enfant",
      children: "enfants",
      yourInformation: "Vos informations",
      editable: "Modifiable",
      personalInformation: "Informations personnelles",
      firstName: "Prénom",
      lastName: "Nom",
      email: "Email",
      phone: "Téléphone",
      birthDate: "Date de naissance",
      birthPlace: "Lieu de naissance",
      address: "Adresse",
      postalCode: "Code postal",
      city: "Ville",
      country: "Pays",
      idNumber: "Numéro d'identité",
      vehicleNumber: "Numéro de plaque",

      priceDetails: "Détails du prix",
      roomPrice: "Prix de l'emplacement",
      nightlyRate: "Tarif par nuit",
      nights: (n: number) => `${n} nuit${n > 1 ? "s" : ""}`,
      night: "nuit",
      options: "Options",
      touristTax: "Taxe de séjour",
      touristTaxPerNight: (amount: string) =>
        `${amount} CHF par adulte et par nuit`,
      platformFees: "Frais de plateforme",
      subtotal: "Sous-total",
      total: "Total",

      paymentMethod: "Méthode de paiement",
      creditCard: "Carte de crédit",
      twint: "TWINT",
      acceptTerms: "J'accepte les conditions générales",
      termsText:
        "En procédant au paiement, vous acceptez nos conditions générales de vente et notre politique de confidentialité.",
      proceedToPayment: "Procéder au paiement",
      processing: "Traitement en cours...",

      bookingNotFound: "Réservation non trouvée",
      loadingBooking: "Chargement de votre réservation...",
      errorLoading: "Erreur lors du chargement",
    },

    email: {
      subject: "Confirmation de réservation",
      greeting: (name: string) => `Bonjour ${name},`,
      confirmed: "Votre réservation est confirmée !",
      bookingNumber: "Numéro de réservation",
      bookingDetails: "Détails de votre réservation",
      arrivalDate: "Date d'arrivée",
      departureDate: "Date de départ",
      roomType: "Type d'emplacement",
      totalAmount: "Montant total",
      accessInstructions: "Instructions d'accès",
      downloadInvoice: "Télécharger la facture",
      needHelp: "Besoin d'aide ?",
      contactUs: "Contactez-nous",
      thanks: "Merci pour votre réservation !",
      team: "L'équipe",
    },

    confirmation: {
      title: "Réservation confirmée",
      subtitle: "Merci pour votre réservation",
      bookingConfirmed: "Votre réservation a été confirmée avec succès",
      bookingNumber: "Numéro de réservation",
      emailSent: "Email de confirmation envoyé",
      emailSentDescription:
        "Un email de confirmation a été envoyé à votre adresse",
      checkInInfo: "Informations d'arrivée",
      accessCode: "Code d'accès",
      downloadInvoice: "Télécharger la facture",
      printInvoice: "Imprimer la facture",
      returnHome: "Retour à l'accueil",
      resendEmail: "Renvoyer l'email",
      emailResent: "Email renvoyé avec succès",
    },
  },

  en: {
    language: {
      select: "Choose your language",
      fr: "Français",
      en: "English",
      de: "Deutsch",
    },

    navigation: {
      back: "← Back",
      backToDates: "← Dates",
      backToRooms: "← Rooms",
      continue: "Continue",
      confirm: "Confirm",
      bookNow: "Book now",
    },

    dates: {
      title: "Select your dates",
      selectDates: "Choose your stay dates",
      checkIn: "Check-in",
      checkOut: "Check-out",
      nights: (n: number) => `${n} night${n > 1 ? "s" : ""}`,
      night: "night",
      selectCheckIn: "Check-in date",
      selectCheckOut: "Check-out date",
      maxStay: (n: number) => `Maximum stay: ${n} nights`,
      hasDog: "Are you traveling with a dog?",
      dogOption: "With dog",
      dogFee: "Dog supplement",

      // Nouvelles traductions
      stayDates: "Stay Dates",
      bookingsClosed: "Bookings Closed",
      nextOpening: "Next opening:",
      bookingsOpenUntil: (time: string) => `Bookings open until ${time}`,
      loadingOptions: "Loading options...",
      selectOption: "Select an option",
      optionRequired: (name: string) => `The option "${name}" is required`,
      pleaseSelectCheckout: "Please select the check-out date",
      checkoutAfterCheckin: "Check-out date must be after check-in date",
      checkinNotPast: "Check-in date cannot be in the past",
      checkinMustBeToday: "Check-in date must be today for this establishment",
      invalidDates: "Invalid dates",
      dateValidationError: "Error validating dates",
      search: "Search",
      validating: "Validating...",
    },

    rooms: {
      title: "Choose your spot",
      selectRoom: "Select a spot",
      available: "Available",
      notAvailable: "Not available",
      perNight: "per night",
      person: "person",
      persons: "persons",
      details: "Details",
      reserve: "Reserve",

      // Nouvelles traductions
      availablePlaces: "Available Places",
      changeDates: "Change dates",
      noPlacesAvailable: "No place available for these dates",
      chooseDifferentDates: "Choose different dates",
      continueWith: (placeName: string) => `Continue with ${placeName}`,
      searchingPlaces: "Searching for available places...",
      errorSearching: "Error searching for rooms",
    },

    form: {
      title: "Your information",
      contactDetails: "Contact details",
      personalInfo: "Personal information",
      personalInfoDescription: "Required for your booking confirmation",
      guestInfo: "Guest information",
      guestInfoDescription: "Adults (16+) and children (15-)",
      requiredField: "Required field",

      adults: "Adults",
      adult: "adult",
      children: "Children",
      child: "child",
      touristTax: "Tourist tax",
      touristTaxInfo: (amount: string) =>
        `ℹ️ Tourist tax: ${amount} CHF per adult per night (applied at checkout)`,

      firstName: "First name",
      lastName: "Last name",
      email: "Email",
      phone: "Phone",
      birthDate: "Date of birth",
      birthPlace: "Place of birth",
      address: "Address",
      postalCode: "Postal code",
      city: "City",
      country: "Country",
      idNumber: "ID number",
      idType: "ID type",
      vehicleNumber: "License plate",

      idCard: "ID card",
      passport: "Passport",
      drivingLicense: "Driving license",

      switzerland: "Switzerland",
      france: "France",
      germany: "Germany",
      italy: "Italy",
      other: "Other",
    },

    validation: {
      requiredFields: "Please fill in all required fields",
      invalidEmail: "Please enter a valid email address",
      invalidPhone: "Please enter a valid phone number",
      minAdults: "At least one adult is required",
      maxDuration: (n: number) => `Maximum stay duration is ${n} nights`,
      selectDates: "Please select your dates",
      selectRoom: "Please select a spot",
    },

    messages: {
      loading: "Loading...",
      creatingBooking: "Creating your booking...",
      processingPayment: "Processing payment...",
      success: "Success",
      error: "Error",
      bookingCreated: "Booking created successfully",
      paymentSuccess: "Payment successful",
      paymentFailed: "Payment failed",
      sessionExpired: "Session expired",
    },

    summary: {
      title: "Summary",
      bookingSummary: "Booking Summary",
      checkBeforePayment: "Check your information before payment",
      back: "Back",
      details: "Details",
      establishment: "Establishment",
      place: "Place",
      room: "Spot",
      dates: "Dates",
      checkIn: "Check-in",
      checkOut: "Check-out",
      duration: "Duration",
      guests: "Guests",
      adult: "adult",
      adults: "adults",
      child: "child",
      children: "children",
      yourInformation: "Your Information",
      editable: "Editable",
      personalInformation: "Personal Information",
      firstName: "First Name",
      lastName: "Last Name",
      email: "Email",
      phone: "Phone",
      birthDate: "Birth Date",
      birthPlace: "Birth Place",
      address: "Address",
      postalCode: "Postal Code",
      city: "City",
      country: "Country",
      idNumber: "ID Number",
      vehicleNumber: "License Plate",

      priceDetails: "Price details",
      roomPrice: "Spot price",
      nightlyRate: "Nightly rate",
      nights: (n: number) => `${n} night${n > 1 ? "s" : ""}`,
      night: "night",
      options: "Options",
      touristTax: "Tourist tax",
      touristTaxPerNight: (amount: string) =>
        `${amount} CHF per adult per night`,
      platformFees: "Platform fees",
      subtotal: "Subtotal",
      total: "Total",

      paymentMethod: "Payment method",
      creditCard: "Credit card",
      twint: "TWINT",
      acceptTerms: "I accept the terms and conditions",
      termsText:
        "By proceeding to payment, you accept our terms of service and privacy policy.",
      proceedToPayment: "Proceed to payment",
      processing: "Processing...",

      bookingNotFound: "Booking not found",
      loadingBooking: "Loading your booking...",
      errorLoading: "Error loading",
    },

    email: {
      subject: "Booking confirmation",
      greeting: (name: string) => `Hello ${name},`,
      confirmed: "Your booking is confirmed!",
      bookingNumber: "Booking number",
      bookingDetails: "Your booking details",
      arrivalDate: "Arrival date",
      departureDate: "Departure date",
      roomType: "Spot type",
      totalAmount: "Total amount",
      accessInstructions: "Access instructions",
      downloadInvoice: "Download invoice",
      needHelp: "Need help?",
      contactUs: "Contact us",
      thanks: "Thank you for your booking!",
      team: "The team",
    },

    confirmation: {
      title: "Booking confirmed",
      subtitle: "Thank you for your booking",
      bookingConfirmed: "Your booking has been successfully confirmed",
      bookingNumber: "Booking number",
      emailSent: "Confirmation email sent",
      emailSentDescription:
        "A confirmation email has been sent to your address",
      checkInInfo: "Check-in information",
      accessCode: "Access code",
      downloadInvoice: "Download invoice",
      printInvoice: "Print invoice",
      returnHome: "Return home",
      resendEmail: "Resend email",
      emailResent: "Email resent successfully",
    },
  },

  de: {
    language: {
      select: "Wählen Sie Ihre Sprache",
      fr: "Français",
      en: "English",
      de: "Deutsch",
    },

    navigation: {
      back: "← Zurück",
      backToDates: "← Daten",
      backToRooms: "← Zimmer",
      continue: "Weiter",
      confirm: "Bestätigen",
      bookNow: "Jetzt buchen",
    },

    dates: {
      title: "Wählen Sie Ihre Daten",
      selectDates: "Wählen Sie Ihre Aufenthaltsdaten",
      checkIn: "Ankunft",
      checkOut: "Abreise",
      nights: (n: number) => `${n} Nacht${n > 1 ? "en" : ""}`,
      night: "Nacht",
      selectCheckIn: "Ankunftsdatum",
      selectCheckOut: "Abreisedatum",
      maxStay: (n: number) => `Maximaler Aufenthalt: ${n} Nächte`,
      hasDog: "Reisen Sie mit einem Hund?",
      dogOption: "Mit Hund",
      dogFee: "Hundezuschlag",

      // Nouvelles traductions
      stayDates: "Aufenthaltsdaten",
      bookingsClosed: "Buchungen geschlossen",
      nextOpening: "Nächste Öffnung:",
      bookingsOpenUntil: (time: string) => `Buchungen geöffnet bis ${time}`,
      loadingOptions: "Optionen werden geladen...",
      selectOption: "Wählen Sie eine Option",
      optionRequired: (name: string) => `Die Option "${name}" ist erforderlich`,
      pleaseSelectCheckout: "Bitte wählen Sie das Abreisedatum",
      checkoutAfterCheckin:
        "Das Abreisedatum muss nach dem Ankunftsdatum liegen",
      checkinNotPast:
        "Das Ankunftsdatum darf nicht in der Vergangenheit liegen",
      checkinMustBeToday:
        "Das Ankunftsdatum muss heute sein für diese Unterkunft",
      invalidDates: "Ungültige Daten",
      dateValidationError: "Fehler bei der Datumsvalidierung",
      search: "Suchen",
      validating: "Wird validiert...",
    },

    rooms: {
      title: "Wählen Sie Ihren Platz",
      selectRoom: "Wählen Sie einen Platz",
      available: "Verfügbar",
      notAvailable: "Nicht verfügbar",
      perNight: "pro Nacht",
      person: "Person",
      persons: "Personen",
      details: "Details",
      reserve: "Reservieren",

      // Nouvelles traductions
      availablePlaces: "Verfügbare Plätze",
      changeDates: "Daten ändern",
      noPlacesAvailable: "Keine Plätze für diese Daten verfügbar",
      chooseDifferentDates: "Andere Daten wählen",
      continueWith: (placeName: string) => `Weiter mit ${placeName}`,
      searchingPlaces: "Suche nach verfügbaren Plätzen...",
      errorSearching: "Fehler bei der Zimmersuche",
    },

    form: {
      title: "Ihre Informationen",
      contactDetails: "Kontaktdaten",
      personalInfo: "Persönliche Informationen",
      personalInfoDescription: "Erforderlich für Ihre Buchungsbestätigung",
      guestInfo: "Gästeinformationen",
      guestInfoDescription: "Erwachsene (16+) und Kinder (15-)",
      requiredField: "Pflichtfeld",

      adults: "Erwachsene",
      adult: "Erwachsener",
      children: "Kinder",
      child: "Kind",
      touristTax: "Kurtaxe",
      touristTaxInfo: (amount: string) =>
        `ℹ️ Kurtaxe: ${amount} CHF pro Erwachsener pro Nacht (wird beim Checkout berechnet)`,

      firstName: "Vorname",
      lastName: "Nachname",
      email: "E-Mail",
      phone: "Telefon",
      birthDate: "Geburtsdatum",
      birthPlace: "Geburtsort",
      address: "Adresse",
      postalCode: "Postleitzahl",
      city: "Stadt",
      country: "Land",
      idNumber: "Ausweisnummer",
      idType: "Ausweistyp",
      vehicleNumber: "Kennzeichen",

      idCard: "Personalausweis",
      passport: "Reisepass",
      drivingLicense: "Führerschein",

      switzerland: "Schweiz",
      france: "Frankreich",
      germany: "Deutschland",
      italy: "Italien",
      other: "Andere",
    },

    validation: {
      requiredFields: "Bitte füllen Sie alle Pflichtfelder aus",
      invalidEmail: "Bitte geben Sie eine gültige E-Mail-Adresse ein",
      invalidPhone: "Bitte geben Sie eine gültige Telefonnummer ein",
      minAdults: "Mindestens ein Erwachsener erforderlich",
      maxDuration: (n: number) =>
        `Maximale Aufenthaltsdauer beträgt ${n} Nächte`,
      selectDates: "Bitte wählen Sie Ihre Daten",
      selectRoom: "Bitte wählen Sie einen Platz",
    },

    messages: {
      loading: "Laden...",
      creatingBooking: "Buchung wird erstellt...",
      processingPayment: "Zahlung wird verarbeitet...",
      success: "Erfolg",
      error: "Fehler",
      bookingCreated: "Buchung erfolgreich erstellt",
      paymentSuccess: "Zahlung erfolgreich",
      paymentFailed: "Zahlung fehlgeschlagen",
      sessionExpired: "Sitzung abgelaufen",
    },

    summary: {
      title: "Zusammenfassung",
      bookingSummary: "Buchungszusammenfassung",
      checkBeforePayment: "Überprüfen Sie Ihre Informationen vor der Zahlung",
      back: "Zurück",
      details: "Details",
      establishment: "Einrichtung",
      place: "Platz",
      room: "Platz",
      dates: "Daten",
      checkIn: "Ankunft",
      checkOut: "Abreise",
      duration: "Dauer",
      guests: "Gäste",
      adult: "Erwachsener",
      adults: "Erwachsene",
      child: "Kind",
      children: "Kinder",
      yourInformation: "Ihre Informationen",
      editable: "Bearbeitbar",
      personalInformation: "Persönliche Informationen",
      firstName: "Vorname",
      lastName: "Nachname",
      email: "E-Mail",
      phone: "Telefon",
      birthDate: "Geburtsdatum",
      birthPlace: "Geburtsort",
      address: "Adresse",
      postalCode: "Postleitzahl",
      city: "Stadt",
      country: "Land",
      idNumber: "Ausweisnummer",
      vehicleNumber: "Kennzeichen",

      priceDetails: "Preisdetails",
      roomPrice: "Platzpreis",
      nightlyRate: "Preis pro Nacht",
      nights: (n: number) => `${n} Nacht${n > 1 ? "en" : ""}`,
      night: "Nacht",
      options: "Optionen",
      touristTax: "Kurtaxe",
      touristTaxPerNight: (amount: string) =>
        `${amount} CHF pro Erwachsener pro Nacht`,
      platformFees: "Plattformgebühren",
      subtotal: "Zwischensumme",
      total: "Gesamt",

      paymentMethod: "Zahlungsmethode",
      creditCard: "Kreditkarte",
      twint: "TWINT",
      acceptTerms: "Ich akzeptiere die Allgemeinen Geschäftsbedingungen",
      termsText:
        "Mit der Zahlung akzeptieren Sie unsere Allgemeinen Geschäftsbedingungen und Datenschutzrichtlinie.",
      proceedToPayment: "Zur Zahlung",
      processing: "Wird verarbeitet...",

      bookingNotFound: "Buchung nicht gefunden",
      loadingBooking: "Ihre Buchung wird geladen...",
      errorLoading: "Fehler beim Laden",
    },

    email: {
      subject: "Buchungsbestätigung",
      greeting: (name: string) => `Hallo ${name},`,
      confirmed: "Ihre Buchung ist bestätigt!",
      bookingNumber: "Buchungsnummer",
      bookingDetails: "Ihre Buchungsdetails",
      arrivalDate: "Ankunftsdatum",
      departureDate: "Abreisedatum",
      roomType: "Platztyp",
      totalAmount: "Gesamtbetrag",
      accessInstructions: "Zugangsanweisungen",
      downloadInvoice: "Rechnung herunterladen",
      needHelp: "Brauchen Sie Hilfe?",
      contactUs: "Kontaktieren Sie uns",
      thanks: "Vielen Dank für Ihre Buchung!",
      team: "Das Team",
    },

    confirmation: {
      title: "Buchung bestätigt",
      subtitle: "Vielen Dank für Ihre Buchung",
      bookingConfirmed: "Ihre Buchung wurde erfolgreich bestätigt",
      bookingNumber: "Buchungsnummer",
      emailSent: "Bestätigungs-E-Mail gesendet",
      emailSentDescription:
        "Eine Bestätigungs-E-Mail wurde an Ihre Adresse gesendet",
      checkInInfo: "Check-in-Informationen",
      accessCode: "Zugangscode",
      downloadInvoice: "Rechnung herunterladen",
      printInvoice: "Rechnung drucken",
      returnHome: "Zurück zur Startseite",
      resendEmail: "E-Mail erneut senden",
      emailResent: "E-Mail erfolgreich erneut gesendet",
    },
  },
};
