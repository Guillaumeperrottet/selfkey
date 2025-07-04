// Test rapide pour vérifier les templates multilingues
const mockTemplateData = {
  clientFirstName: "Jean",
  clientLastName: "Dupont",
  establishmentName: "Hôtel Paradise",
  roomName: "Chambre Standard",
  checkInDate: "15/01/2025",
  checkOutDate: "17/01/2025",
  accessCode: "1234",
  accessInstructions:
    "Accès par l'entrée principale, ascenseur jusqu'au 2ème étage.",
};

// Template email par défaut (français + allemand)
const defaultEmailTemplate = `Bonjour {clientFirstName} {clientLastName},

Votre réservation à {establishmentName} a été confirmée avec succès !

Détails de votre réservation :
- Chambre : {roomName}
- Arrivée : {checkInDate}
- Départ : {checkOutDate}
- Code d'accès : {accessCode}

{accessInstructions}

Nous vous souhaitons un excellent séjour !

Cordialement,
L'équipe de {establishmentName}

---

Guten Tag {clientFirstName} {clientLastName},

Ihre Buchung im {establishmentName} wurde erfolgreich bestätigt!

Details Ihrer Buchung:
- Zimmer: {roomName}
- Anreise: {checkInDate}
- Abreise: {checkOutDate}
- Zugangscode: {accessCode}

{accessInstructions}

Wir wünschen Ihnen einen ausgezeichneten Aufenthalt!

Mit freundlichen Grüßen,
Das Team von {establishmentName}`;

// Template WhatsApp par défaut (français + allemand)
const defaultWhatsAppTemplate = `🏨 Réservation confirmée !

Bonjour {clientFirstName},

Votre réservation à {establishmentName} est confirmée ✅

📅 Arrivée : {checkInDate}
📅 Départ : {checkOutDate}
🏠 Chambre : {roomName}
🔑 Code d'accès : {accessCode}

{accessInstructions}

Bon séjour ! 😊

---

🏨 Buchung bestätigt!

Guten Tag {clientFirstName},

Ihre Buchung im {establishmentName} ist bestätigt ✅

📅 Anreise: {checkInDate}
📅 Abreise: {checkOutDate}
🏠 Zimmer: {roomName}
🔑 Zugangscode: {accessCode}

{accessInstructions}

Schönen Aufenthalt! 😊`;

// Fonction pour remplacer les variables dans le template
function replaceTemplateVariables(template, data) {
  let result = template;
  Object.keys(data).forEach((key) => {
    const placeholder = `{${key}}`;
    result = result.replace(new RegExp(placeholder, "g"), data[key]);
  });
  return result;
}

console.log("🇫🇷🇩🇪 TEST TEMPLATES MULTILINGUES");
console.log("==================================");

console.log("\n📧 EMAIL TEMPLATE:");
console.log("------------------");
console.log(replaceTemplateVariables(defaultEmailTemplate, mockTemplateData));

console.log("\n📱 WHATSAPP TEMPLATE:");
console.log("---------------------");
console.log(
  replaceTemplateVariables(defaultWhatsAppTemplate, mockTemplateData)
);

console.log("\n✅ Templates générés avec succès !");
