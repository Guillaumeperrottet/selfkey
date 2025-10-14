const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration de la migration
const libPath = path.join(__dirname, 'src', 'lib');

const fileMapping = {
  // Auth
  'auth.ts': 'auth/server.ts',
  'auth-client.ts': 'auth/client.ts',
  'auth-utils.ts': 'auth/utils.ts',
  'auth-check.ts': 'auth/check.ts',
  
  // Payment
  'stripe.ts': 'payment/stripe.ts',
  'stripe-config.ts': 'payment/config.ts',
  'stripe-connect.ts': 'payment/connect.ts',
  
  // Booking
  'booking.ts': 'booking/booking.ts',
  'availability.ts': 'booking/availability.ts',
  'availability_new.ts': 'booking/availability-new.ts',
  'booking-translations.ts': 'booking/translations.ts',
  
  // Email
  'email.ts': 'email/sender.ts',
  'resend.ts': 'email/client.ts',
  'email-translations.ts': 'email/translations.ts',
  'confirmation-template.ts': 'email/templates/confirmation.ts',
  'email-template-fields.ts': 'email/templates/fields.ts',
  'unlayer-templates.ts': 'email/templates/unlayer.ts',
  
  // Pricing
  'fee-calculator.ts': 'pricing/fees.ts',
  'pricing-options-calculator.ts': 'pricing/options.ts',
  'money-utils.ts': 'pricing/money.ts',
  
  // Security
  'access-codes.ts': 'security/access-codes.ts',
  'extension-token.ts': 'security/extension-token.ts',
  'invoice-security.ts': 'security/invoice-security.ts',
  'rate-limiter.ts': 'security/rate-limiter.ts',
  'risk-management.ts': 'security/risk-management.ts',
  
  // Database
  'prisma.ts': 'database/prisma.ts',
  
  // Config
  'domains.ts': 'config/domains.ts',
  'hotel-config.ts': 'config/hotel.ts',
  
  // Management
  'room-management.ts': 'management/rooms.ts',
  'establishment-transfer.ts': 'management/establishment-transfer.ts',
  
  // Utils
  'utils.ts': 'utils/general.ts',
  'time-utils.ts': 'utils/time.ts',
  'image-utils.ts': 'utils/images.ts',
  'slug-utils.ts': 'utils/slug.ts',
  'animations.ts': 'utils/animations.ts',
  'toast-utils.ts': 'utils/toast.ts',
  'qrcode-with-logo.ts': 'utils/qrcode.ts',
};

// Garder les fichiers API tels quels
const excludeFiles = ['api'];

console.log('🚀 Migration de la structure /lib\n');
console.log('═'.repeat(80));

// Étape 1 : Créer la structure de dossiers
console.log('\n📁 ÉTAPE 1 : Création de la structure de dossiers...\n');

const folders = [
  'auth',
  'payment',
  'booking',
  'email',
  'email/templates',
  'pricing',
  'security',
  'database',
  'config',
  'management',
  'utils',
];

folders.forEach(folder => {
  const folderPath = path.join(libPath, folder);
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
    console.log(`   ✅ Créé: src/lib/${folder}/`);
  } else {
    console.log(`   ⏭️  Existe déjà: src/lib/${folder}/`);
  }
});

// Étape 2 : Copier les fichiers avec git mv
console.log('\n📦 ÉTAPE 2 : Copie des fichiers dans la nouvelle structure...\n');

let copiedCount = 0;
let skippedCount = 0;

Object.entries(fileMapping).forEach(([oldFile, newFile]) => {
  const oldPath = path.join(libPath, oldFile);
  const newPath = path.join(libPath, newFile);
  
  if (fs.existsSync(oldPath)) {
    try {
      // Utiliser git mv pour préserver l'historique
      const relativeOld = `src/lib/${oldFile}`;
      const relativeNew = `src/lib/${newFile}`;
      
      // Créer le dossier de destination si nécessaire
      const newDir = path.dirname(newPath);
      if (!fs.existsSync(newDir)) {
        fs.mkdirSync(newDir, { recursive: true });
      }
      
      // Copier le fichier (on ne peut pas faire git cp, donc on copie puis on ajoute)
      fs.copyFileSync(oldPath, newPath);
      execSync(`git add "${relativeNew}"`, { cwd: __dirname, stdio: 'pipe' });
      
      console.log(`   ✅ Copié: ${oldFile} → ${newFile}`);
      copiedCount++;
    } catch (error) {
      console.log(`   ⚠️  Erreur pour ${oldFile}: ${error.message}`);
      skippedCount++;
    }
  } else {
    console.log(`   ⏭️  Fichier non trouvé: ${oldFile}`);
    skippedCount++;
  }
});

console.log(`\n   📊 Résumé: ${copiedCount} fichiers copiés, ${skippedCount} ignorés`);

// Étape 3 : Créer les barrel exports (index.ts)
console.log('\n📤 ÉTAPE 3 : Création des barrel exports (index.ts)...\n');

const barrelExports = {
  'auth/index.ts': `// Barrel export for auth module
export * from './server';
export * from './client';
export * from './utils';
export * from './check';
`,
  
  'payment/index.ts': `// Barrel export for payment module
export * from './stripe';
export * from './config';
export * from './connect';
`,
  
  'booking/index.ts': `// Barrel export for booking module
export * from './booking';
export * from './availability';
export * from './availability-new';
export * from './translations';
`,
  
  'email/index.ts': `// Barrel export for email module
export * from './sender';
export * from './client';
export * from './translations';
export * from './templates/confirmation';
export * from './templates/fields';
export * from './templates/unlayer';
`,
  
  'pricing/index.ts': `// Barrel export for pricing module
export * from './fees';
export * from './options';
export * from './money';
`,
  
  'security/index.ts': `// Barrel export for security module
export * from './access-codes';
export * from './extension-token';
export * from './invoice-security';
export * from './rate-limiter';
export * from './risk-management';
`,
  
  'database/index.ts': `// Barrel export for database module
export * from './prisma';
`,
  
  'config/index.ts': `// Barrel export for config module
export * from './domains';
export * from './hotel';
`,
  
  'management/index.ts': `// Barrel export for management module
export * from './rooms';
export * from './establishment-transfer';
`,
  
  'utils/index.ts': `// Barrel export for utils module
export * from './general';
export * from './time';
export * from './images';
export * from './slug';
export * from './animations';
export * from './toast';
export * from './qrcode';
`,
};

Object.entries(barrelExports).forEach(([file, content]) => {
  const filePath = path.join(libPath, file);
  fs.writeFileSync(filePath, content);
  execSync(`git add "${path.join('src/lib', file)}"`, { cwd: __dirname, stdio: 'pipe' });
  console.log(`   ✅ Créé: src/lib/${file}`);
});

// Étape 4 : Créer les fichiers de rétrocompatibilité
console.log('\n🔄 ÉTAPE 4 : Création des fichiers de rétrocompatibilité...\n');

const compatibilityFiles = {
  'auth.ts': `// Rétrocompatibilité - À supprimer après migration complète
// Nouveau code devrait utiliser: @/lib/auth/server
export * from './auth/server';
`,
  
  'auth-client.ts': `// Rétrocompatibilité - À supprimer après migration complète
// Nouveau code devrait utiliser: @/lib/auth/client ou @/lib/auth
export * from './auth/client';
`,
  
  'auth-utils.ts': `// Rétrocompatibilité - À supprimer après migration complète
// Nouveau code devrait utiliser: @/lib/auth/utils ou @/lib/auth
export * from './auth/utils';
`,
  
  'auth-check.ts': `// Rétrocompatibilité - À supprimer après migration complète
// Nouveau code devrait utiliser: @/lib/auth/check ou @/lib/auth
export * from './auth/check';
`,
  
  'stripe.ts': `// Rétrocompatibilité - À supprimer après migration complète
// Nouveau code devrait utiliser: @/lib/payment/stripe ou @/lib/payment
export * from './payment/stripe';
`,
  
  'stripe-config.ts': `// Rétrocompatibilité - À supprimer après migration complète
// Nouveau code devrait utiliser: @/lib/payment/config ou @/lib/payment
export * from './payment/config';
`,
  
  'stripe-connect.ts': `// Rétrocompatibilité - À supprimer après migration complète
// Nouveau code devrait utiliser: @/lib/payment/connect ou @/lib/payment
export * from './payment/connect';
`,
  
  'booking.ts': `// Rétrocompatibilité - À supprimer après migration complète
// Nouveau code devrait utiliser: @/lib/booking/booking ou @/lib/booking
export * from './booking/booking';
`,
  
  'availability.ts': `// Rétrocompatibilité - À supprimer après migration complète
// Nouveau code devrait utiliser: @/lib/booking/availability ou @/lib/booking
export * from './booking/availability';
`,
  
  'availability_new.ts': `// Rétrocompatibilité - À supprimer après migration complète
// Nouveau code devrait utiliser: @/lib/booking/availability-new ou @/lib/booking
export * from './booking/availability-new';
`,
  
  'booking-translations.ts': `// Rétrocompatibilité - À supprimer après migration complète
// Nouveau code devrait utiliser: @/lib/booking/translations ou @/lib/booking
export * from './booking/translations';
`,
  
  'email.ts': `// Rétrocompatibilité - À supprimer après migration complète
// Nouveau code devrait utiliser: @/lib/email/sender ou @/lib/email
export * from './email/sender';
`,
  
  'resend.ts': `// Rétrocompatibilité - À supprimer après migration complète
// Nouveau code devrait utiliser: @/lib/email/client ou @/lib/email
export * from './email/client';
`,
  
  'email-translations.ts': `// Rétrocompatibilité - À supprimer après migration complète
// Nouveau code devrait utiliser: @/lib/email/translations ou @/lib/email
export * from './email/translations';
`,
  
  'confirmation-template.ts': `// Rétrocompatibilité - À supprimer après migration complète
// Nouveau code devrait utiliser: @/lib/email/templates/confirmation ou @/lib/email
export * from './email/templates/confirmation';
`,
  
  'email-template-fields.ts': `// Rétrocompatibilité - À supprimer après migration complète
// Nouveau code devrait utiliser: @/lib/email/templates/fields ou @/lib/email
export * from './email/templates/fields';
`,
  
  'unlayer-templates.ts': `// Rétrocompatibilité - À supprimer après migration complète
// Nouveau code devrait utiliser: @/lib/email/templates/unlayer ou @/lib/email
export * from './email/templates/unlayer';
`,
  
  'fee-calculator.ts': `// Rétrocompatibilité - À supprimer après migration complète
// Nouveau code devrait utiliser: @/lib/pricing/fees ou @/lib/pricing
export * from './pricing/fees';
`,
  
  'pricing-options-calculator.ts': `// Rétrocompatibilité - À supprimer après migration complète
// Nouveau code devrait utiliser: @/lib/pricing/options ou @/lib/pricing
export * from './pricing/options';
`,
  
  'money-utils.ts': `// Rétrocompatibilité - À supprimer après migration complète
// Nouveau code devrait utiliser: @/lib/pricing/money ou @/lib/pricing
export * from './pricing/money';
`,
  
  'access-codes.ts': `// Rétrocompatibilité - À supprimer après migration complète
// Nouveau code devrait utiliser: @/lib/security/access-codes ou @/lib/security
export * from './security/access-codes';
`,
  
  'extension-token.ts': `// Rétrocompatibilité - À supprimer après migration complète
// Nouveau code devrait utiliser: @/lib/security/extension-token ou @/lib/security
export * from './security/extension-token';
`,
  
  'invoice-security.ts': `// Rétrocompatibilité - À supprimer après migration complète
// Nouveau code devrait utiliser: @/lib/security/invoice-security ou @/lib/security
export * from './security/invoice-security';
`,
  
  'rate-limiter.ts': `// Rétrocompatibilité - À supprimer après migration complète
// Nouveau code devrait utiliser: @/lib/security/rate-limiter ou @/lib/security
export * from './security/rate-limiter';
`,
  
  'risk-management.ts': `// Rétrocompatibilité - À supprimer après migration complète
// Nouveau code devrait utiliser: @/lib/security/risk-management ou @/lib/security
export * from './security/risk-management';
`,
  
  'prisma.ts': `// Rétrocompatibilité - À supprimer après migration complète
// Nouveau code devrait utiliser: @/lib/database/prisma ou @/lib/database
export * from './database/prisma';
`,
  
  'domains.ts': `// Rétrocompatibilité - À supprimer après migration complète
// Nouveau code devrait utiliser: @/lib/config/domains ou @/lib/config
export * from './config/domains';
`,
  
  'hotel-config.ts': `// Rétrocompatibilité - À supprimer après migration complète
// Nouveau code devrait utiliser: @/lib/config/hotel ou @/lib/config
export * from './config/hotel';
`,
  
  'room-management.ts': `// Rétrocompatibilité - À supprimer après migration complète
// Nouveau code devrait utiliser: @/lib/management/rooms ou @/lib/management
export * from './management/rooms';
`,
  
  'establishment-transfer.ts': `// Rétrocompatibilité - À supprimer après migration complète
// Nouveau code devrait utiliser: @/lib/management/establishment-transfer ou @/lib/management
export * from './management/establishment-transfer';
`,
  
  'utils.ts': `// Rétrocompatibilité - À supprimer après migration complète
// Nouveau code devrait utiliser: @/lib/utils/general ou @/lib/utils
export * from './utils/general';
`,
  
  'time-utils.ts': `// Rétrocompatibilité - À supprimer après migration complète
// Nouveau code devrait utiliser: @/lib/utils/time ou @/lib/utils
export * from './utils/time';
`,
  
  'image-utils.ts': `// Rétrocompatibilité - À supprimer après migration complète
// Nouveau code devrait utiliser: @/lib/utils/images ou @/lib/utils
export * from './utils/images';
`,
  
  'slug-utils.ts': `// Rétrocompatibilité - À supprimer après migration complète
// Nouveau code devrait utiliser: @/lib/utils/slug ou @/lib/utils
export * from './utils/slug';
`,
  
  'animations.ts': `// Rétrocompatibilité - À supprimer après migration complète
// Nouveau code devrait utiliser: @/lib/utils/animations ou @/lib/utils
export * from './utils/animations';
`,
  
  'toast-utils.ts': `// Rétrocompatibilité - À supprimer après migration complète
// Nouveau code devrait utiliser: @/lib/utils/toast ou @/lib/utils
export * from './utils/toast';
`,
  
  'qrcode-with-logo.ts': `// Rétrocompatibilité - À supprimer après migration complète
// Nouveau code devrait utiliser: @/lib/utils/qrcode ou @/lib/utils
export * from './utils/qrcode';
`,
};

let compatCount = 0;
Object.entries(compatibilityFiles).forEach(([file, content]) => {
  const filePath = path.join(libPath, file);
  // Sauvegarder l'ancien contenu en .backup
  if (fs.existsSync(filePath)) {
    const backupPath = filePath + '.backup';
    fs.copyFileSync(filePath, backupPath);
    console.log(`   💾 Backup: ${file}.backup`);
  }
  
  fs.writeFileSync(filePath, content);
  compatCount++;
  console.log(`   ✅ Rétrocompat: ${file}`);
});

console.log(`\n   📊 ${compatCount} fichiers de rétrocompatibilité créés`);

// Créer un README pour la nouvelle structure
console.log('\n📖 ÉTAPE 5 : Création du README de la structure...\n');

const readmeContent = `# Structure du dossier /lib

Cette structure organise les utilitaires et services par domaine fonctionnel.

## 📁 Organisation

- **auth/** - Authentification (Better Auth, sessions, vérifications)
- **payment/** - Paiements (Stripe, configuration, Connect)
- **booking/** - Réservations (disponibilité, traductions)
- **email/** - Emails (envoi, templates, traductions)
- **pricing/** - Tarification (calculs de frais, options de prix)
- **security/** - Sécurité (codes d'accès, tokens, rate limiting)
- **database/** - Base de données (Prisma client)
- **config/** - Configuration (domaines, hôtels)
- **management/** - Gestion (chambres, transferts d'établissements)
- **utils/** - Utilitaires généraux (temps, images, slugs, etc.)
- **api/** - Clients API externes

## 🔄 Migration Progressive

Les anciens fichiers à la racine de \`/lib\` ont été conservés pour la rétrocompatibilité.
Ils ré-exportent simplement les nouveaux modules.

### Ancien code (fonctionne toujours) :
\`\`\`typescript
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
\`\`\`

### Nouveau code (recommandé) :
\`\`\`typescript
import { prisma } from "@/lib/database/prisma"
import { auth } from "@/lib/auth/server"
\`\`\`

### Avec barrel exports :
\`\`\`typescript
import { prisma } from "@/lib/database"
import { auth, authClient, checkAuth } from "@/lib/auth"
\`\`\`

## 📋 TODO

- [ ] Migrer progressivement les imports vers la nouvelle structure
- [ ] Supprimer les fichiers .backup une fois validé
- [ ] Supprimer les fichiers de rétrocompatibilité une fois la migration terminée
`;

const readmePath = path.join(libPath, 'README.md');
fs.writeFileSync(readmePath, readmeContent);
execSync(`git add "${path.join('src/lib', 'README.md')}"`, { cwd: __dirname, stdio: 'pipe' });
console.log('   ✅ Créé: src/lib/README.md');

console.log('\n═'.repeat(80));
console.log('\n✨ MIGRATION TERMINÉE AVEC SUCCÈS!\n');
console.log('📊 Résumé:');
console.log(`   - ${copiedCount} fichiers copiés dans la nouvelle structure`);
console.log(`   - ${Object.keys(barrelExports).length} barrel exports créés`);
console.log(`   - ${compatCount} fichiers de rétrocompatibilité créés`);
console.log(`   - Tous les fichiers .backup sauvegardés`);

console.log('\n🎯 Prochaines étapes:');
console.log('   1. Vérifier: npm run build');
console.log('   2. Tester l\'application: npm run dev');
console.log('   3. Si tout fonctionne:');
console.log('      git add .');
console.log('      git commit -m "refactor: reorganize /lib with feature-based structure"');
console.log('      git push origin main');
console.log('\n   4. En cas de problème, les fichiers .backup contiennent le code original');
console.log('\n💡 Les anciens imports continuent de fonctionner grâce à la rétrocompatibilité!');
