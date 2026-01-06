#!/usr/bin/env ts-node

/**
 * 🧪 Test du système d'email d'alerte webhook
 *
 * Usage: npx tsx scripts/test-webhook-email.ts
 */

// IMPORTANT : Charger dotenv AVANT tout import pour que les modules
// aient accès aux variables d'environnement dès leur initialisation
import { config } from "dotenv";
import { resolve } from "path";

// Charger .env en premier
config({ path: resolve(process.cwd(), ".env") });
// Puis .env.local qui override les valeurs
config({ path: resolve(process.cwd(), ".env.local") });

// Maintenant on peut importer les modules qui utilisent process.env
import { sendWebhookDisabledAlert } from "@/lib/email/alerts";

async function main() {
  console.log("\n📧 Test de l'email d'alerte webhook désactivé\n");

  if (!process.env.SUPER_ADMIN_EMAIL) {
    console.error("❌ SUPER_ADMIN_EMAIL n'est pas défini dans .env");
    console.log("\n💡 Ajoutez dans votre .env.local :");
    console.log("   SUPER_ADMIN_EMAIL=votre-email@example.com\n");
    process.exit(1);
  }

  if (!process.env.RESEND_API_KEY) {
    console.error("❌ RESEND_API_KEY n'est pas défini dans .env");
    console.log("\n💡 Obtenez une clé API sur https://resend.com/api-keys");
    console.log("   Ajoutez dans votre .env.local :");
    console.log("   RESEND_API_KEY=re_xxxxx\n");
    process.exit(1);
  }

  console.log(`📬 Destinataire : ${process.env.SUPER_ADMIN_EMAIL}`);
  console.log(
    `📤 Expéditeur    : ${process.env.RESEND_FROM_EMAIL || "alerts@selfkey.app"}`
  );
  console.log();

  try {
    console.log("🔄 Envoi de l'email de test...\n");

    await sendWebhookDisabledAlert(
      "test_webhook_123",
      "Webhook Test - API Police",
      "https://api.police.example.com/webhooks/selfkey",
      "hotel-example-paris",
      10
    );

    console.log("\n✅ Email envoyé avec succès !");
    console.log("📥 Vérifiez votre boîte de réception.\n");
  } catch (error) {
    console.error("\n❌ Erreur lors de l'envoi :", error);
    process.exit(1);
  }
}

main();
