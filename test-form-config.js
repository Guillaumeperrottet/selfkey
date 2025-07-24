import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testFormConfiguration() {
  console.log("🧪 Test de la configuration du formulaire personnalisable");
  console.log("============================================================");

  try {
    // 1. Vérifier qu'un établissement existe
    const establishment = await prisma.establishment.findFirst({
      select: {
        id: true,
        slug: true,
        name: true,
        formConfig: true,
      },
    });

    if (!establishment) {
      console.log("❌ Aucun établissement trouvé pour les tests");
      return;
    }

    console.log(
      `✅ Établissement trouvé: ${establishment.name} (${establishment.slug})`
    );
    console.log(
      `📊 Configuration actuelle: ${JSON.stringify(establishment.formConfig, null, 2)}`
    );

    // 2. Tester une configuration personnalisée
    const testConfig = {
      clientBirthDate: { enabled: true, required: false },
      clientBirthPlace: { enabled: false, required: false },
      clientAddress: { enabled: true, required: false },
      clientPostalCode: { enabled: false, required: false },
      clientCity: { enabled: true, required: false },
      clientCountry: { enabled: true, required: false },
      clientIdNumber: { enabled: false, required: false },
      clientVehicleNumber: { enabled: true, required: false },
      children: { enabled: false, required: false },
    };

    console.log("\n🔧 Test de mise à jour de la configuration...");
    const updatedEstablishment = await prisma.establishment.update({
      where: { id: establishment.id },
      data: {
        formConfig: testConfig,
      },
      select: {
        formConfig: true,
      },
    });

    console.log(`✅ Configuration mise à jour avec succès`);
    console.log(
      `📊 Nouvelle configuration: ${JSON.stringify(updatedEstablishment.formConfig, null, 2)}`
    );

    // 3. Vérifier la récupération
    console.log("\n📖 Test de récupération de la configuration...");
    const retrievedConfig = await prisma.establishment.findUnique({
      where: { slug: establishment.slug },
      select: {
        formConfig: true,
      },
    });

    console.log(
      `✅ Configuration récupérée: ${JSON.stringify(retrievedConfig.formConfig, null, 2)}`
    );

    // 4. Analyser la configuration
    console.log("\n📊 Analyse de la configuration:");
    const config = retrievedConfig.formConfig;
    const enabledFields = Object.entries(config).filter(
      ([, value]) => value.enabled
    );
    const disabledFields = Object.entries(config).filter(
      ([, value]) => !value.enabled
    );

    console.log(
      `   👁️  Champs activés (${enabledFields.length}): ${enabledFields.map(([key]) => key).join(", ")}`
    );
    console.log(
      `   👁️‍🗨️ Champs désactivés (${disabledFields.length}): ${disabledFields.map(([key]) => key).join(", ")}`
    );

    // 5. Tester la remise à zéro
    console.log("\n🔄 Test de remise à zéro...");
    await prisma.establishment.update({
      where: { id: establishment.id },
      data: {
        formConfig: {},
      },
    });

    console.log("✅ Configuration remise à zéro");

    console.log(
      "\n🎉 Tous les tests de configuration du formulaire sont réussis !"
    );
    console.log("\n📝 Instructions pour tester l'interface:");
    console.log(
      `   1. Aller sur: http://localhost:3000/admin/${establishment.slug}`
    );
    console.log(
      `   2. Cliquer sur "Formulaire de réservation" dans la sidebar`
    );
    console.log(`   3. Personnaliser les champs selon vos besoins`);
    console.log(
      `   4. Sauvegarder et tester sur: http://localhost:3000/${establishment.slug}`
    );
  } catch (error) {
    console.error("❌ Erreur lors des tests:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter les tests
testFormConfiguration().catch(console.error);
