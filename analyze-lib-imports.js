const fs = require("fs");
const path = require("path");

// Mapping de la migration proposée
const migrationMap = {
  "@/lib/auth": "@/lib/auth/server",
  "@/lib/auth-client": "@/lib/auth/client",
  "@/lib/auth-utils": "@/lib/auth/utils",
  "@/lib/auth-check": "@/lib/auth/check",

  "@/lib/stripe": "@/lib/payment/stripe",
  "@/lib/stripe-config": "@/lib/payment/config",
  "@/lib/stripe-connect": "@/lib/payment/connect",

  "@/lib/booking": "@/lib/booking/booking",
  "@/lib/availability": "@/lib/booking/availability",
  "@/lib/availability_new": "@/lib/booking/availability-new",
  "@/lib/booking-translations": "@/lib/booking/translations",

  "@/lib/email": "@/lib/email/sender",
  "@/lib/resend": "@/lib/email/client",
  "@/lib/email-translations": "@/lib/email/translations",
  "@/lib/confirmation-template": "@/lib/email/templates/confirmation",
  "@/lib/email-template-fields": "@/lib/email/templates/fields",
  "@/lib/unlayer-templates": "@/lib/email/templates/unlayer",

  "@/lib/fee-calculator": "@/lib/pricing/fees",
  "@/lib/pricing-options-calculator": "@/lib/pricing/options",
  "@/lib/money-utils": "@/lib/pricing/money",

  "@/lib/access-codes": "@/lib/security/access-codes",
  "@/lib/extension-token": "@/lib/security/extension-token",
  "@/lib/invoice-security": "@/lib/security/invoice-security",
  "@/lib/rate-limiter": "@/lib/security/rate-limiter",
  "@/lib/risk-management": "@/lib/security/risk-management",

  "@/lib/prisma": "@/lib/database/prisma",

  "@/lib/domains": "@/lib/config/domains",
  "@/lib/hotel-config": "@/lib/config/hotel",

  "@/lib/room-management": "@/lib/management/rooms",
  "@/lib/establishment-transfer": "@/lib/management/establishment-transfer",

  "@/lib/utils": "@/lib/utils/general",
  "@/lib/time-utils": "@/lib/utils/time",
  "@/lib/image-utils": "@/lib/utils/images",
  "@/lib/slug-utils": "@/lib/utils/slug",
  "@/lib/animations": "@/lib/utils/animations",
  "@/lib/toast-utils": "@/lib/utils/toast",
  "@/lib/qrcode-with-logo": "@/lib/utils/qrcode",
};

const stats = {
  totalFiles: 0,
  filesWithLibImports: 0,
  totalLibImports: 0,
  importsByFile: {},
  importsByModule: {},
  filesAffected: new Set(),
};

function analyzeFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    const relativePath = filePath.replace(process.cwd(), "");

    // Regex pour trouver les imports de @/lib
    const importRegex = /from\s+["'](@\/lib\/[^"']+)["']/g;
    const requireRegex = /require\(["'](@\/lib\/[^"']+)["']\)/g;

    let matches = [];
    let match;

    // Trouver tous les imports
    while ((match = importRegex.exec(content)) !== null) {
      matches.push(match[1]);
    }

    while ((match = requireRegex.exec(content)) !== null) {
      matches.push(match[1]);
    }

    if (matches.length > 0) {
      stats.filesWithLibImports++;
      stats.filesAffected.add(relativePath);
      stats.importsByFile[relativePath] = matches;
      stats.totalLibImports += matches.length;

      matches.forEach((imp) => {
        if (!stats.importsByModule[imp]) {
          stats.importsByModule[imp] = [];
        }
        stats.importsByModule[imp].push(relativePath);
      });
    }
  } catch (error) {
    // Ignorer les erreurs de lecture
  }
}

function walkDirectory(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (!["node_modules", ".next", ".git", "dist", "build"].includes(file)) {
        walkDirectory(filePath, fileList);
      }
    } else if (file.match(/\.(tsx?|jsx?)$/)) {
      stats.totalFiles++;
      fileList.push(filePath);
    }
  });

  return fileList;
}

console.log("🔍 Analyse des imports de /lib dans le projet...\n");

const srcDir = path.join(__dirname, "src");
const files = walkDirectory(srcDir);

files.forEach((file) => analyzeFile(file));

console.log("📊 RÉSULTATS DE L'ANALYSE\n");
console.log("═".repeat(80));
console.log(`📁 Fichiers TypeScript/JavaScript scannés : ${stats.totalFiles}`);
console.log(
  `📦 Fichiers utilisant des imports de /lib : ${stats.filesWithLibImports}`
);
console.log(`🔗 Total d'imports de /lib trouvés : ${stats.totalLibImports}`);
console.log("═".repeat(80));

console.log("\n📈 TOP 10 des modules /lib les plus importés :\n");
const sortedModules = Object.entries(stats.importsByModule)
  .sort((a, b) => b[1].length - a[1].length)
  .slice(0, 10);

sortedModules.forEach(([module, files], index) => {
  const newPath = migrationMap[module] || "⚠️ MAPPING MANQUANT";
  console.log(`${index + 1}. ${module}`);
  console.log(`   └─ Utilisé dans ${files.length} fichiers`);
  console.log(`   └─ Nouveau chemin : ${newPath}`);
  console.log("");
});

console.log("\n🗂️  Répartition des imports par catégorie :\n");

const categories = {
  Auth: Object.keys(migrationMap).filter((k) => k.includes("auth")),
  Payment: Object.keys(migrationMap).filter((k) => k.includes("stripe")),
  Booking: Object.keys(migrationMap).filter(
    (k) => k.includes("booking") || k.includes("availability")
  ),
  Email: Object.keys(migrationMap).filter(
    (k) =>
      k.includes("email") ||
      k.includes("resend") ||
      k.includes("unlayer") ||
      k.includes("confirmation-template")
  ),
  Pricing: Object.keys(migrationMap).filter(
    (k) => k.includes("fee") || k.includes("pricing") || k.includes("money")
  ),
  Security: Object.keys(migrationMap).filter(
    (k) =>
      k.includes("access-code") ||
      k.includes("token") ||
      k.includes("security") ||
      k.includes("rate") ||
      k.includes("risk")
  ),
  Database: Object.keys(migrationMap).filter((k) => k.includes("prisma")),
  Config: Object.keys(migrationMap).filter(
    (k) => k.includes("domain") || k.includes("hotel-config")
  ),
  Management: Object.keys(migrationMap).filter(
    (k) => k.includes("room") || k.includes("establishment")
  ),
  Utils: Object.keys(migrationMap).filter(
    (k) =>
      k.includes("utils") ||
      k.includes("slug") ||
      k.includes("image") ||
      k.includes("time") ||
      k.includes("animation") ||
      k.includes("toast") ||
      k.includes("qrcode")
  ),
};

Object.entries(categories).forEach(([category, modules]) => {
  const totalImports = modules.reduce((sum, mod) => {
    return sum + (stats.importsByModule[mod]?.length || 0);
  }, 0);

  if (totalImports > 0) {
    console.log(
      `${category.padEnd(20)} : ${totalImports.toString().padStart(3)} imports`
    );
  }
});

console.log("\n⚠️  POINTS D'ATTENTION :\n");

// Vérifier les imports non mappés
const unmappedImports = Object.keys(stats.importsByModule).filter(
  (imp) => !migrationMap[imp]
);

if (unmappedImports.length > 0) {
  console.log("❌ Imports non mappés (à ajouter au mapping) :");
  unmappedImports.forEach((imp) => {
    console.log(
      `   - ${imp} (utilisé dans ${stats.importsByModule[imp].length} fichiers)`
    );
  });
} else {
  console.log("✅ Tous les imports ont un mapping défini");
}

console.log("\n💡 ESTIMATION DE L'IMPACT :\n");
console.log(`📝 Fichiers à modifier : ${stats.filesWithLibImports}`);
console.log(`🔄 Imports à mettre à jour : ${stats.totalLibImports}`);
console.log(`⏱️  Temps estimé pour le script : ~30 secondes`);
console.log(`🧪 Temps de test recommandé : ~10 minutes`);

console.log("\n✨ RECOMMANDATION :\n");

if (stats.filesWithLibImports < 50) {
  console.log("🟢 Impact FAIBLE - Migration sûre et rapide");
  console.log("   → Procédez avec la migration automatique");
} else if (stats.filesWithLibImports < 150) {
  console.log("🟡 Impact MOYEN - Migration nécessite de la prudence");
  console.log("   → Faites un commit avant de commencer");
  console.log("   → Testez bien après la migration");
} else {
  console.log("🔴 Impact ÉLEVÉ - Migration complexe");
  console.log("   → Considérez une approche progressive");
  console.log(
    "   → Ou utilisez des barrel exports pour garder la compatibilité"
  );
}

console.log("\n📋 PROCHAINES ÉTAPES :\n");
console.log("1. Faire un commit de l'état actuel");
console.log("2. Créer la nouvelle structure de dossiers");
console.log("3. Déplacer les fichiers avec git mv");
console.log("4. Exécuter le script de mise à jour des imports");
console.log("5. Créer les fichiers index.ts (barrel exports)");
console.log("6. Compiler et tester");
console.log("7. Si tout fonctionne : commit et push");
console.log("8. Si problème : git reset --hard pour revenir en arrière");

console.log("\n💾 Voulez-vous sauvegarder ce rapport dans un fichier ?");
console.log(
  "   → Exécutez : node analyze-lib-imports.js > lib-migration-report.txt"
);
