# 🎨 Personnalisations avancées - Export Checkin FR

## 📝 Valeurs par défaut modifiables

### Option 1 : Modifier les valeurs statiques dans le code

Vous pouvez personnaliser les valeurs par défaut directement dans le fichier :
`/src/app/api/admin/[hotel]/export-excel/route.ts`

#### Exemples de modifications courantes :

```typescript
// Ligne ~71 : Changer la langue par défaut
Langue: "FR", // Changez en "DE", "IT", "EN" selon votre besoin

// Ligne ~85 : Changer le type de pièce d'identité par défaut
"Type de pièce d'identité": "Carte d'identité", // Ou "Passeport", "Permis de séjour"

// Ligne ~86 : Changer le type de clientèle
"Type de clientèle": "Individuel", // Ou "Groupe", "Entreprise", "Famille"

// Ligne ~89 : Changer le motif du séjour
"Motif du séjour": "Loisir", // Ou "Affaires", "Visite familiale", "Santé"
```

### Option 2 : Ajouter des champs dans le formulaire de réservation

Si vous souhaitez que ces valeurs soient personnalisables lors de la réservation :

#### 1. Ajouter les champs au schéma Prisma

```prisma
// Dans prisma/schema.prisma, ajouter au modèle Booking :
model Booking {
  // ... champs existants ...

  clientTitle            String?        // M., Mme, Dr., etc.
  clientGroupCompany     String?        // Nom du groupe ou entreprise
  clientLanguage         String?        // FR, DE, IT, EN
  clientIdType           String?        // Type de pièce d'identité
  clientType             String?        // Type de clientèle
  clientTravelReason     String?        // Motif du séjour
  clientArrivalTime      String?        // Heure d'arrivée
  clientAreaCard         String?        // Numéro carte d'Arée
}
```

#### 2. Migrer la base de données

```bash
npx prisma migrate dev --name add_client_details_fields
```

#### 3. Mettre à jour le formulaire de réservation

Dans le composant de réservation, ajoutez les champs :

```tsx
// Exemple pour BookingFormDetails.tsx
<div className="space-y-2">
  <Label htmlFor="clientTitle">Titre</Label>
  <Select
    value={formData.clientTitle}
    onValueChange={(value) => setFormData({ ...formData, clientTitle: value })}
  >
    <SelectTrigger>
      <SelectValue placeholder="Sélectionnez un titre" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="M.">M.</SelectItem>
      <SelectItem value="Mme">Mme</SelectItem>
      <SelectItem value="Dr.">Dr.</SelectItem>
      <SelectItem value="Prof.">Prof.</SelectItem>
    </SelectContent>
  </Select>
</div>

<div className="space-y-2">
  <Label htmlFor="clientLanguage">Langue</Label>
  <Select
    value={formData.clientLanguage}
    onValueChange={(value) => setFormData({ ...formData, clientLanguage: value })}
  >
    <SelectTrigger>
      <SelectValue placeholder="Langue" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="FR">Français</SelectItem>
      <SelectItem value="DE">Allemand</SelectItem>
      <SelectItem value="IT">Italien</SelectItem>
      <SelectItem value="EN">Anglais</SelectItem>
    </SelectContent>
  </Select>
</div>

<div className="space-y-2">
  <Label htmlFor="clientIdType">Type de pièce d'identité</Label>
  <Select
    value={formData.clientIdType}
    onValueChange={(value) => setFormData({ ...formData, clientIdType: value })}
  >
    <SelectTrigger>
      <SelectValue placeholder="Type de pièce" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="Carte d'identité">Carte d'identité</SelectItem>
      <SelectItem value="Passeport">Passeport</SelectItem>
      <SelectItem value="Permis de séjour">Permis de séjour</SelectItem>
    </SelectContent>
  </Select>
</div>

<div className="space-y-2">
  <Label htmlFor="clientType">Type de clientèle</Label>
  <Select
    value={formData.clientType}
    onValueChange={(value) => setFormData({ ...formData, clientType: value })}
  >
    <SelectTrigger>
      <SelectValue placeholder="Type" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="Individuel">Individuel</SelectItem>
      <SelectItem value="Groupe">Groupe</SelectItem>
      <SelectItem value="Entreprise">Entreprise</SelectItem>
      <SelectItem value="Famille">Famille</SelectItem>
    </SelectContent>
  </Select>
</div>

<div className="space-y-2">
  <Label htmlFor="clientTravelReason">Motif du séjour</Label>
  <Select
    value={formData.clientTravelReason}
    onValueChange={(value) => setFormData({ ...formData, clientTravelReason: value })}
  >
    <SelectTrigger>
      <SelectValue placeholder="Motif" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="Loisir">Loisir</SelectItem>
      <SelectItem value="Affaires">Affaires</SelectItem>
      <SelectItem value="Visite familiale">Visite familiale</SelectItem>
      <SelectItem value="Santé">Santé</SelectItem>
      <SelectItem value="Transit">Transit</SelectItem>
    </SelectContent>
  </Select>
</div>
```

#### 4. Mettre à jour l'export Excel

```typescript
// Dans /src/app/api/admin/[hotel]/export-excel/route.ts
const excelData = bookings.map((booking, index) => ({
  // ... autres champs ...
  Titre: booking.clientTitle || "",
  "Groupé / Entreprise": booking.clientGroupCompany || "",
  Langue: booking.clientLanguage || "FR",
  "Type de pièce d'identité": booking.clientIdType || "Carte d'identité",
  "Type de clientèle": booking.clientType || "Individuel",
  "Motif du séjour": booking.clientTravelReason || "Loisir",
  "Carte d'Arée": booking.clientAreaCard || "",
  Time: booking.clientArrivalTime || "",
}));
```

## 🎨 Personnalisation du style Excel

### Ajouter des couleurs et formatage

```typescript
import * as XLSX from "xlsx";

// Après avoir créé le worksheet
const worksheet = XLSX.utils.json_to_sheet(excelData);

// Styliser l'en-tête (ligne 1)
const headerRange = XLSX.utils.decode_range(worksheet["!ref"] || "A1");
for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
  const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
  const cell = worksheet[cellAddress];

  if (cell) {
    cell.s = {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "4F46E5" } },
      alignment: { horizontal: "center", vertical: "center" },
    };
  }
}

// Ajouter des bordures
// Note: XLSX.js a un support limité pour le styling.
// Pour un styling avancé, utilisez ExcelJS au lieu de XLSX
```

### Utiliser ExcelJS pour un meilleur contrôle

```typescript
import ExcelJS from "exceljs";

// Créer le workbook
const workbook = new ExcelJS.Workbook();
const worksheet = workbook.addWorksheet("Déclaration taxes séjour");

// Définir les colonnes avec style
worksheet.columns = [
  {
    header: "Numéro de référence système",
    key: "refNum",
    width: 25,
    style: { font: { bold: true } },
  },
  // ... autres colonnes
];

// Styliser l'en-tête
worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
worksheet.getRow(1).fill = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FF4F46E5" },
};
worksheet.getRow(1).alignment = { vertical: "middle", horizontal: "center" };

// Ajouter les données
excelData.forEach((data) => {
  worksheet.addRow(data);
});

// Ajouter des bordures
worksheet.eachRow((row, rowNumber) => {
  row.eachCell((cell) => {
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  });
});

// Générer le buffer
const buffer = await workbook.xlsx.writeBuffer();
```

## 📊 Ajouter des statistiques au fichier

### Créer une deuxième feuille avec les totaux

```typescript
// Après la création de la première feuille
const statsSheet = workbook.addWorksheet("Statistiques");

// Calculer les totaux
const totalAdults = bookings.reduce((sum, b) => sum + (b.adults || 0), 0);
const totalChildren = bookings.reduce((sum, b) => sum + (b.children || 0), 0);
const totalBookings = bookings.length;

// Ajouter les statistiques
statsSheet.columns = [
  { header: "Statistique", key: "label", width: 30 },
  { header: "Valeur", key: "value", width: 20 },
];

statsSheet.addRow({
  label: "Nombre total de réservations",
  value: totalBookings,
});
statsSheet.addRow({ label: "Nombre total d'adultes", value: totalAdults });
statsSheet.addRow({ label: "Nombre total d'enfants", value: totalChildren });
statsSheet.addRow({
  label: "Moyenne adultes/réservation",
  value: (totalAdults / totalBookings).toFixed(2),
});

// Styliser la feuille statistiques
statsSheet.getRow(1).font = { bold: true };
```

## 🔍 Filtres et tri avancés

### Exporter seulement certains types de réservations

```typescript
// Modifier la requête Prisma
const bookings = await prisma.booking.findMany({
  where: {
    hotelSlug,
    checkInDate: { gte: new Date(startDate), lte: new Date(endDate) },
    paymentStatus: "succeeded",
    // Ajouter des filtres supplémentaires
    clientCountry: "CH", // Seulement les Suisses
    // OU
    adults: { gte: 2 }, // Au moins 2 adultes
    // OU
    amount: { gte: 100 }, // Montant minimum
  },
  // ... reste de la requête
});
```

## 🌍 Support multilingue

### Adapter l'export selon la langue de l'établissement

```typescript
// Définir les traductions
const translations = {
  FR: {
    sheetName: "Déclaration taxes séjour",
    refNum: "Numéro de référence système",
    arrival: "Date d'arrivée",
    departure: "Date de départ",
    // ... autres traductions
  },
  DE: {
    sheetName: "Kurtaxenerklärung",
    refNum: "Systemreferenznummer",
    arrival: "Ankunftsdatum",
    departure: "Abreisedatum",
    // ... autres traductions
  },
  EN: {
    sheetName: "Tourist Tax Declaration",
    refNum: "System Reference Number",
    arrival: "Arrival Date",
    departure: "Departure Date",
    // ... autres traductions
  },
};

// Utiliser la langue de l'établissement
const lang = establishment.language || "FR";
const t = translations[lang];

// Créer le worksheet avec les traductions
XLSX.utils.book_append_sheet(workbook, worksheet, t.sheetName);
```

## 📅 Formatage avancé des dates

### Ajouter différents formats de date

```typescript
// Format suisse (actuel)
function formatDateCH(date: Date): string {
  return new Intl.DateTimeFormat("fr-CH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

// Format ISO (pour import automatique)
function formatDateISO(date: Date): string {
  return date.toISOString().split("T")[0];
}

// Format avec jour de la semaine
function formatDateFull(date: Date): string {
  return new Intl.DateTimeFormat("fr-CH", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}
```

## 🔐 Sécurité et validation

### Valider les données avant l'export

```typescript
// Fonction de validation
function validateBookingData(booking: any): boolean {
  const required = [
    "clientEmail",
    "clientFirstName",
    "clientLastName",
    "clientAddress",
    "clientCity",
    "clientCountry",
  ];

  return required.every(
    (field) => booking[field] && booking[field].trim() !== ""
  );
}

// Filtrer les réservations valides
const validBookings = bookings.filter(validateBookingData);

// Ajouter un log pour les réservations invalides
const invalidBookings = bookings.filter((b) => !validateBookingData(b));
if (invalidBookings.length > 0) {
  console.warn(
    `${invalidBookings.length} réservations avec données incomplètes exclues`
  );
}
```

## 💡 Conseils de performance

### Pour de gros volumes de données

```typescript
// Utiliser la pagination
const BATCH_SIZE = 1000;
let skip = 0;
let allBookings = [];

while (true) {
  const batch = await prisma.booking.findMany({
    where: {
      /* ... */
    },
    skip,
    take: BATCH_SIZE,
  });

  if (batch.length === 0) break;

  allBookings = [...allBookings, ...batch];
  skip += BATCH_SIZE;
}

// Ou utiliser un stream pour les très gros exports
```

---

**Ces personnalisations sont optionnelles !**
Votre export actuel fonctionne déjà parfaitement pour Checkin FR.
Ces exemples sont là si vous voulez aller plus loin dans la personnalisation. 🚀
