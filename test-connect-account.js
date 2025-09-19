// Script pour créer un compte Connect de test avec TWINT
// À exécuter dans votre console browser sur http://localhost:3000

async function createTestConnectAccount() {
  try {
    console.log("🔧 Création compte Connect de test...");

    const response = await fetch("/api/stripe/create-test-account", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "test-twint@example.com",
        country: "CH",
        businessType: "individual",
        hotelName: "Test TWINT Hotel",
        capabilities: ["card_payments", "transfers", "twint_payments"],
      }),
    });

    const result = await response.json();
    console.log("✅ Compte créé:", result);

    if (result.onboardingUrl) {
      console.log("🔗 URL d'onboarding:", result.onboardingUrl);
      window.open(result.onboardingUrl, "_blank");
    }
  } catch (error) {
    console.error("❌ Erreur:", error);
  }
}

// Exécuter la fonction
createTestConnectAccount();
